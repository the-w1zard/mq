// ============================================================================
// HADRON COLLIDER — single-lane storage medium + post office + transformer
// ============================================================================
// Design (from the spec):
//  - The collider is a SINGLE LANE. Particles (payloads) enter via the intake
//    queue and are continuously sent around the lane. They never leave except
//    to be dropped (delete) or diverted to the transformer.
//  - Nothing is stored outside of the collider. Each particle carries its own
//    payload. No indexers, no value maps.
//  - THE TRACER PARTICLE: a particle whose payload is a monotonically ticking
//    number (its own 4th channel/lane in the message frame). Its traversal of
//    the send pass IS the clock. No epoch, no timers, no vector clocks.
//  - The main send mechanism READS every particle as it passes (the bus):
//      * tracer  -> ++1 its payload
//      * DELETE  -> drop it (never sent back out)
//      * TRANSFORM -> divert to the transformer (which batches, executes
//        tiered-concurrently, then hands a copy to each call site and puts
//        the original back into the intake queue for re-admission)
//      * UPDATE  -> apply the edit in the send pass, continue around
//  - THE POST OFFICE: the middle man. The collider never touches call sites.
//    The transformer routes messages outward through the post office, which
//    fans out to every subscribed call site. Call sites are duplex: they
//    receive streamed updates AND submit edits (which go into the queue).
//  - QUEUES ONLY: reads, edits, deletes, transforms are all queued and
//    executed on the tracer's next pass. Queued tiered concurrently-executed
//    batches replace continuous micro-task iteration.
//  - Perf
//      1. Uint32Array dirty bitmask + compaction pass  (sparse update O(1))
//      2. 4-byte bytecode sequence register as the clock store
//      3. Int32Array direct pid->slot index (no Map)
// ============================================================================

// #region █████ TYPES ████████████████████████████████████████████████████████

export type Pid = number;

export const OP = {
    NONE: 0,
    PUT: 1,      // set / replace payload
    EDIT: 2,     // queued transform-on-write (edit fn carried in the frame)
    DELETE: 3,   // drop when it passes through the send pass
    TRANSFORM: 4 // divert to transformer, deliver to call sites, re-admit
} as const;

/** The tracer's payload slot: its own channel inside the particle. */
export const TRACER_PID = 0;

export interface Particle {
    pid: Pid;
    /** The value. Nothing outside of the collider holds this. */
    payload: unknown;
    /** Queued op to be executed when this particle passes the send pass. */
    op: number;
    /** Edit fn carried with the particle (OP.EDIT), executed in the pass. */
    edit?: (payload: any) => any;
}

export interface CallSite<T = any> {
    (value: T, meta: CallSiteMeta): void;
    /** duplex: submit a change straight into the collider's queue */
    set(next: T | ((current: T) => T)): void;
    /** duplex: request this value's removal */
    del(): void;
    /** duplex: ask for a fresh read on the next pass */
    refresh(): void;
    unsub(): void;
    readonly pid: Pid;
}

export interface CallSiteMeta {
    seq: number;        // tracer tick at delivery time
    cycle: number;      // completed cycles seen
    dirty: boolean;     // did this particle change since last delivery?
}

export interface ColliderOptions {
    maxParticles?: number;      // hard cap; Int32Array sizing
    windowSize?: number;        // send-pass batch window
    tiers?: TransformTier[];    // queued tiered concurrent batches
}

// ============================================================================
// TRANSFORMER FACTORY — nothing is done without first being placed into a
// queue. Queued tiered concurrently executing batches replace the feeding
// continuous micro-task iteration.
// ============================================================================
export interface TransformTier {
    /** name of the tier, e.g. 'light' | 'heavy' | 'io' */
    name: string;
    /** how many transforms in this tier run concurrently per batch */
    concurrency: number;
    /** max transforms drained into a single batch flush for this tier */
    batch: number;
    /** the work */
    run: (particle: Particle) => Promise<unknown> | unknown;
}

export interface TransformerQueue {
    /** enqueue a particle for the matching tier; returns a drain promise */
    submit(pid: Pid, tierName: string, work?: (p: Particle) => unknown): Promise<unknown>;
    /** drain pass: run all queued work in tiered concurrent batches */
    drain(): Promise<void>;
    readonly pending: number;
}
// #endregion

// #region █████ PERF FIXES: bitmask compactor / bytecode clock / slot index ██

/** Fix #1 — sparse update: 1-bit-per-particle dirty bitmask + compaction. */
class DenseRingCompactor {
    readonly dirtyBitmask: Uint32Array;
    readonly activeIndices: Uint32Array;
    activeCount = 0;
    constructor(readonly maxParticles: number) {
        this.dirtyBitmask = new Uint32Array(Math.ceil(maxParticles / 32));
        this.activeIndices = new Uint32Array(maxParticles);
    }
    markDirty(pid: number): void {
        this.dirtyBitmask[pid >> 5] |= (1 << (pid & 31)) >>> 0;
    }
    compact(): number {
        this.activeCount = 0;
        const len = this.dirtyBitmask.length;
        for (let i = 0; i < len; i++) {
            let mask = this.dirtyBitmask[i];
            if (mask === 0) continue; // 32 cold particles skipped in 1 check
            const basePid = i << 5;
            while (mask !== 0) {
                const bitIdx = 31 - Math.clz32(mask & -mask);
                this.activeIndices[this.activeCount++] = basePid + bitIdx;
                mask &= mask - 1;
            }
            this.dirtyBitmask[i] = 0;
        }
        return this.activeCount;
    }
}

/** Fix #2 — clock: 4-byte bytecode sequence register [OP, EPOCH, STATE, SEQ]. */
class BytecodeClock {
    readonly register = new Uint8Array(4);
    tick(): void {
        const seq = (this.register[3] + 1) & 0xff;
        this.register[3] = seq;
        if (seq === 0) this.register[1] = (this.register[1] + 1) & 0xff;
    }
    hasCompletedCycle(startSeq: number, currentSeq: number): boolean {
        return ((currentSeq - startSeq) << 24 >> 24) > 0;
    }
    get seq(): number { return this.register[3]; }
    get epoch(): number { return this.register[1]; }
}

/** Fix #3 — pid -> slot: flat Int32Array direct-lookup (no Map, no GC). */
class DirectSlotIndex {
    readonly pidToSlot: Int32Array;
    constructor(maxParticles: number) {
        this.pidToSlot = new Int32Array(maxParticles).fill(-1);
    }
    set(pid: number, slot: number): void { this.pidToSlot[pid] = slot; }
    get(pid: number): number { return this.pidToSlot[pid]; }
    delete(pid: number): void { this.pidToSlot[pid] = -1; }
}
// #endregion

// #region █████ TRANSFORMER FACTORY — queued tiered concurrent batches ██████

class TieredTransformer implements TransformerQueue {
    private queues = new Map<string, { pids: Pid[]; resolvers: Array<(v: unknown) => void> }>();
    constructor(private tiers: TransformTier[], private collider: HC4) {
        for (const t of tiers) this.queues.set(t.name, { pids: [], resolvers: [] });
    }
    tier(name: string): TransformTier | undefined {
        return this.tiers.find(t => t.name === name);
    }
    submit(pid: Pid, tierName: string, work?: (p: Particle) => unknown): Promise<unknown> {
        let q = this.queues.get(tierName);
        if (!q) {
            // implicit tier: any tier name referenced before registration gets
            // created on demand with sensible defaults (concurrency 4, batch 8)
            const tier: TransformTier = { name: tierName, concurrency: 4, batch: 8, run: (p) => p.payload };
            this.tiers.push(tier);
            q = { pids: [], resolvers: [] };
            this.queues.set(tierName, q);
        }
        return new Promise(resolve => {
            q.pids.push(pid);
            q.resolvers.push(resolve);
            if (work) this.collider.markTierWork(pid, tierName, work);
        });
    }
    async drain(): Promise<void> {
        // tiers run concurrently; within a tier, batches run concurrently
        await Promise.all(this.tiers.map(async tier => {
            const q = this.queues.get(tier.name)!;
            while (q.pids.length > 0) {
                const batch = q.pids.splice(0, Math.min(tier.batch, q.pids.length));
                const resolvers = q.resolvers.splice(0, batch.length);
                await Promise.all(batch.map(async (pid, i) => {
                    const particle = this.collider.particleAt(pid);
                    if (particle) await tier.run(particle);
                    resolvers[i]?.(particle?.payload);
                    this.collider.clearTierWork(pid);
                }));
                if (tier.concurrency === 1) continue; // preserve order for serial tiers
            }
        }));
    }
    get pending(): number {
        let n = 0;
        for (const q of this.queues.values()) n += q.pids.length;
        return n;
    }
}
// #endregion

// ============================================================================
// HADRON COLLIDER — the single lane
// ============================================================================
//DONE
export class HC4 {
    // -- storage: SoA flat typed arrays, nothing lives anywhere else ----------
    private payloads: Array<unknown>;          // payloads by slot
    private ops: Uint8Array;                 // queued op per slot
    private dirty: DenseRingCompactor;       
    private slotIndex: DirectSlotIndex;      
    private clock = new BytecodeClock();    
    private cycleCount = 0;

    // -- the lane: ordered particle slots currently in the collider ----------
    private lane: Int32Array;                  // slot ids in traversal order
    private laneLen = 0;
    private laneCursor = 0;

    // -- intake queue: pre-allocated ring buffer (replaces array shift) -------
    private intakeBuf: Int32Array;
    private intakeHead = 0;
    private intakeTail = 0;

    // -- pre-allocated operational storage (replaces lazy Maps) --------------
    private readonly pendingEdits: Array<((p: any) => any) | undefined>;
    private readonly pendingTiers: Array<string | undefined>;

    // -- queues --------------------------------------------------------------
    private transformQueue: TieredTransformer;
    private tierWork = new Map<Pid, Map<string, (p: Particle) => unknown>>();

    // -- post office: collider -> call sites ---------------------------------
    private postOffice = new Map<Pid, Set<CallSite>>();

    private maxParticles: number;
    private nextPid = 1; // pid 0 is the tracer

    constructor(opts: ColliderOptions = {}) {
        this.maxParticles = opts.maxParticles ?? 1 << 20;
        this.payloads = new Array<unknown>(this.maxParticles);
        this.ops = new Uint8Array(this.maxParticles);
        this.dirty = new DenseRingCompactor(this.maxParticles);
        this.slotIndex = new DirectSlotIndex(this.maxParticles);
        this.lane = new Int32Array(this.maxParticles).fill(-1);
        
        this.intakeBuf = new Int32Array(this.maxParticles);
        this.pendingEdits = new Array<((p: any) => any) | undefined>(this.maxParticles);
        this.pendingTiers = new Array<string | undefined>(this.maxParticles);

        this.transformQueue = new TieredTransformer(opts.tiers ?? [], this);

        // --- the tracer particle: the clock lives in its payload -------------
        this.payloads[TRACER_PID] = 0; 
        this.slotIndex.set(TRACER_PID, TRACER_PID);
        this.lane[0] = TRACER_PID;
        this.laneLen = 1;
    }

    // #region particle admission ---------------------------------------------

    private allocateSlot(pid: Pid): number {
        for (let s = 0; s < this.maxParticles; s++) {
            const cand = (this.laneCursor + s) % this.maxParticles;
            if (this.lane[cand] === -1) return cand;
        }
        throw new Error('collider full');
    }

    admit(payload: unknown): Pid {
        const pid = this.nextPid++;
        this.payloads[pid] = payload;
        this.ops[pid] = OP.PUT;
        this.slotIndex.set(pid, pid);
        
        // Push to intake ring buffer
        this.intakeBuf[this.intakeTail] = pid;
        this.intakeTail = (this.intakeTail + 1) % this.maxParticles;

        this.dirty.markDirty(pid);
        return pid;
    }

    queueEdit(pid: Pid, edit: (payload: any) => any): void {
        const slot = this.slotIndex.get(pid);
        if (slot === -1) return;
        this.ops[pid] = OP.EDIT;
        this.dirty.markDirty(pid);
        this.pendingEdits[pid] = edit;
    }

    queueDelete(pid: Pid): void {
        const slot = this.slotIndex.get(pid);
        if (slot === -1) return; 
        this.ops[pid] = OP.DELETE;
    }

    queueTransform(pid: Pid, tierName = 'light'): void {
        const slot = this.slotIndex.get(pid);
        if (slot === -1) return; 
        this.ops[pid] = OP.TRANSFORM;
        this.pendingTiers[pid] = tierName;
    }

    markTierWork(pid: Pid, tier: string, work: (p: Particle) => unknown): void {
        let m = this.tierWork.get(pid);
        if (!m) this.tierWork.set(pid, (m = new Map()));
        m.set(tier, work);
    }
    clearTierWork(pid: Pid): void { this.tierWork.delete(pid); }
    particleAt(pid: Pid): Particle | undefined {
        if (this.slotIndex.get(pid) === -1) return undefined;
        return { pid, payload: this.payloads[pid], op: this.ops[pid] };
    }
    // #endregion

    // #region post office -----------------------------------------------------

    subscribe<T = any>(pid: Pid, initial?: T): CallSite<T> {
        const site = ((value: T, _meta: CallSiteMeta) => {}) as CallSite<T>;
        const handlers = new Set<(v: T, meta: CallSiteMeta) => void>();
        let current: T | undefined = initial;
        let lastSeq = -1;

        const deliver = (value: T, dirty: boolean) => {
            const meta: CallSiteMeta = { seq: this.clock.seq, cycle: this.cycleCount, dirty };
            current = value;
            lastSeq = this.clock.seq;
            handlers.forEach(h => h(value, meta));
        };
        (site as any)._deliver = deliver;

        site.set = (next) => {
            const edit = typeof next === 'function' ? (next as (c: T) => T) : () => next;
            this.queueEdit(pid, edit as (p: any) => any);
        };
        site.del = () => this.queueDelete(pid);
        site.refresh = () => this.queueTransform(pid, 'post-office-refresh');
        site.unsub = () => { this.postOffice.get(pid)?.delete(site); };
        (site as any).on = (h: (v: T, meta: CallSiteMeta) => void) => {
            handlers.add(h);
            return () => handlers.delete(h);
        };
        let set = this.postOffice.get(pid);
        if (!set) this.postOffice.set(pid, (set = new Set()));
        set.add(site);
        return site;
    }

    private dispatch(pid: Pid, dirty: boolean): void {
        const sites = this.postOffice.get(pid);
        if (!sites) return;
        for (const site of sites) (site as any)._deliver(this.payloads[pid], dirty);
    }
    // #endregion

    // #region THE SEND PASS ---------------------------------------------------

    pass(): void {
        const startSeq = this.clock.seq;
        let i = 0;
        while (i < this.laneLen) {
            const pid = this.lane[i];
            const op = this.ops[pid];

            if (pid === TRACER_PID) {
                this.payloads[pid] = (this.payloads[pid] as number) + 1;
                this.clock.tick();
            } else if (op === OP.DELETE) {
                this.drop(i);
                continue; 
            } else if (op === OP.EDIT) {
                const edit = this.pendingEdits[pid];
                if (edit) {
                    this.payloads[pid] = edit(this.payloads[pid]);
                    this.pendingEdits[pid] = undefined;
                }
                this.ops[pid] = OP.NONE;
                this.dirty.markDirty(pid);
                this.dispatch(pid, true);
            } else if (op === OP.TRANSFORM) {
                const tierName = this.pendingTiers[pid] ?? 'light';
                this.pendingTiers[pid] = undefined;
                this.ops[pid] = OP.NONE;
                void this.transformAndReAdmit(pid, tierName);
            } else {
                const isDirty = this.consumeDirty(pid);
                if (isDirty) this.dispatch(pid, true);
            }
            i++;
        }

        // --- intake ring-buffer drain (zero shift overhead) --------------------
        while (this.intakeHead !== this.intakeTail) {
            const pid = this.intakeBuf[this.intakeHead];
            this.intakeHead = (this.intakeHead + 1) % this.maxParticles;
            
            const slot = this.allocateSlot(pid);
            this.lane[slot] = pid;
            if (slot >= this.laneLen) this.laneLen = slot + 1;
        }

        // --- post-office transformer tier sweep --------------------------------
        {
            this.dirty.compact();
            const n = this.dirty.activeCount;
            for (let k = 0; k < n; k++) {
                const pid = this.dirty.activeIndices[k];
                this.dispatch(pid, true); 
            }
        }

        void this.transformQueue.drain();
        this.cycleCount++;
    }

    private drop(laneIdx: number): void {
        const pid = this.lane[laneIdx];
        this.lane[laneIdx] = this.lane[this.laneLen - 1]; // swap-remove
        this.lane[this.laneLen - 1] = -1;
        this.laneLen--;
        this.slotIndex.delete(pid);
        this.payloads[pid] = undefined;
        this.ops[pid] = OP.NONE;
        this.pendingEdits[pid] = undefined;
        this.pendingTiers[pid] = undefined;
    }

    private consumeDirty(pid: Pid): boolean {
        const w = pid >> 5, b = pid & 31;
        const mask = this.dirty.dirtyBitmask[w];
        if (mask & ((1 << b) >>> 0)) {
            this.dirty.dirtyBitmask[w] = mask & ~((1 << b) >>> 0);
            return true;
        }
        return false;
    }

    private async transformAndReAdmit(pid: Pid, tierName: string): Promise<void> {
        await this.transformQueue.submit(pid, tierName);
        this.dispatch(pid, true);
        
        this.intakeBuf[this.intakeTail] = pid;
        this.intakeTail = (this.intakeTail + 1) % this.maxParticles;
    }
    // #endregion

    // #region introspection ---------------------------------------------------
    get cycles(): number { return this.cycleCount; }
    get tick(): number { return this.payloads[TRACER_PID] as number; }
    get particleCount(): number { return this.laneLen; }
    // #endregion
}
// ============================================================================
// WIRING: one collider + one post office + one transformer factory. The main
// duplex gets the particles from the sub/handler and simply sends them right
// back out. Every call site is a duplex streamed value.
// ============================================================================
export function createCollider(opts: ColliderOptions = {}): HC4 {
    const collider = new HC4(opts);
    return collider;
}
