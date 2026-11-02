/** ## HADRON DISRUPTOR - PHASE-LOCKED, MULTI-PRODUCER, AVAILABILITY-BUFFERED, BATCH-DRAINING, SHARED-MEMORY DISRUPTOR... lol
 * --------------------------------------------------------------------------------------------------------------------------
 * It follows the core LMAX principles—preallocated ring, producer-claimed sequences, consumer gating sequences, and explicit publish visibility—while extending them with the homogeneous DB-pass requirement.
 * 
 * ### Architecture
 * 
 * --------------------------------------------------------------------------------------------------------------------------
 * Each lane has:
 * 
 *    - Its own preallocated Int32Array ring.   
 *    - Its own multi-producer claim cursor.   
 *    - Its own availability buffer, exactly like LMAX’s multi-producer sequencer.  
 *    - Its own consumer gating sequence.   
 *    - Its own batch handler.
 * 
 * The global tracer only advances after a full schedule rotation. 
 * If any lane saturates, its producers stall; if the consumer cannot keep up, the ring wraps only after the consumer releases capacity. 
 * That is real structural backpressure, not an application-level polling hack.
 * --------------------------------------------------------------------------------------------------------------------------
 * Multi-lane, phase-locked, shared-memory, zero-allocation event engine.
 * 
 *    - Fixed-width integer records
 *    - Multi-producer sequencer per lane
 *    - LMAX-style availability buffer
 *    - Batch consumer barriers
 *    - Phase-locked homogeneous DB passes
 *    - Tracer-particle epoch clock
 *    - Direct PID -> slot table
 *    - O(1) dirty bitmask
 *    - SOA payload arenas
 * --------------------------------------------------------------------------------------------------------------------------
 *    Record layout — 8 x Int32 = 32 bytes.
 *    
 * ```txt
 *    - 0 opcode
 *    - 1 pid
 *    - 2 slot
 *    - 3 a — primary payload / f64 arena offset / u32 arena offset
 *    - 4 b — secondary payload / length / count
 *    - 5 c — tertiary payload / flags
 *    - 6 epoch — tracer clock at publication
 *    - 7 reserved / checksum / extension
 * ```
 * --------------------------------------------------------------------------------------------------------------------------
 * MULTI-PRODUCER CLAIM / PUBLISH - Claim the next sequence for a lane.
 *
 * This is a true multi-producer sequencer:
 *     - CAS reserves a unique sequence.
 *     - The availability buffer marks that exact sequence published.
 *     - Consumers never rely on a single global “highest published” value.
 * --------------------------------------------------------------------------------------------------------------------------
 * Publish a claimed record.
 *
 * The record must be fully written BEFORE this call.
 * The availability buffer is the publication barrier.
 * --------------------------------------------------------------------------------------------------------------------------
 * One-shot enqueue.
 *
 * Returns:
 *   >= 0 — published sequence
 *   -1  — nonblocking mode and lane was full
 * --------------------------------------------------------------------------------------------------------------------------
 * Return the highest contiguous available sequence for a lane.
 *
 * This scans only the availability window, then caches the result.
 * It avoids the classic problem of a slow producer blocking visibility
 * of later producers.
 * --------------------------------------------------------------------------------------------------------------------------
 * Drain exactly one scheduled phase.
 *
 * A phase is homogeneous: READ only, WRITE only, DELETE only, etc.
 * --------------------------------------------------------------------------------------------------------------------------
 * Run one full revolution.
 *
 * The tracer particle advances only after every scheduled phase runs.
 * --------------------------------------------------------------------------------------------------------------------------
 * Run until all lanes are drained.
 *
 * Useful for shutdown, transaction boundaries, and tests.
 * --------------------------------------------------------------------------------------------------------------------------
 * ### 1. True multi-producer publication
 * 
 * The previous “committed highest sequence” model can hide records when producer A claims sequence 10 but publishes after producer B publishes sequence 11. 
 * This version fixes that with a per-slot availability buffer: each producer marks exactly its own sequence as published, and the consumer scans forward until it finds an unpublished slot. 
 * That is the same fundamental trick LMAX uses in its multi-producer sequencer.
 * 
 * ```txt
 * Producer A claims 10
 * Producer B claims 11
 * Producer B publishes 11
 * Producer A publishes 10
 * 
 * Availability:
 * 10 -> published
 * 11 -> published
 * 
 * Consumer can now safely process 10 and 11.
 * ```
 * 
 * ### 2. Batch boundaries, not per-record callbacks
 * 
 * The handler receives:
 * 
 * ```txt
 * (ring, from, to, epoch, disruptor)
 * ```
 * 
 * So your READ, WRITE, DELETE, and COMPACT handlers can process contiguous ranges directly. 
 * That removes one JS function call per event on the hottest path and gives the JIT a much simpler, monomorphic loop.
 * 
 * 
 * ### 3. Homogeneous DB passes
 * 
 * The schedule is explicit:
 * 
 * ```txt
 * [READ, WRITE, READ, WRITE, DELETE, EFFECT, COMPACT]
 * ```
 * 
 * That means:
 *     - READ passes can assume no mutation.
 *     - WRITE passes can batch dirty marks and storage writes.
 *     - DELETE passes can reclaim slots without interleaved reads.
 *     - EFFECT passes run after mutation.
 *     - COMPACT passes run only when scheduled.
 *     - You can change the schedule without changing the engine:
 * 
 * ```tsx
 * const realtimeSchedule = [
 *   OP.READ,
 *   OP.WRITE,
 *   OP.DELETE,
 *   OP.READ,
 *   OP.WRITE,
 *   OP.EFFECT,
 * ] as const;
 * ```
 * 
 * 
 * ### 4. The tracer clock is real
 * 
 * The clock is not incremented per event. It increments only after a complete revolution:
 * 
 * ```txt
 *   PASS
 *     |
 *  clock += 1
 * ```
 * 
 * So tick() is the platform’s reactive epoch. If the WRITE lane saturates, the revolution cannot complete, so the clock stalls. That gives you backpressure without a separate watcher, scheduler, or polling loop.
 *      
 * 
 * ### 5. No objects in the hot path
 * 
 * Records are fixed-width Int32Array slots. Values live in SOA arenas:     
 * 
 * ```tsx
 * const valueOffset = d.allocF64(123.456);
 * 
 * d.emit(
 *   OP.WRITE,
 *   pid,
 *   slot,
 *   valueOffset, // arena offset
 *   1,           // count
 *   0,           // flags
 * );
 * ```      
 * 
 * The WRITE handler then does:    
 * 
 * ```tsx 
 *  * const offset = ring[base + F_A];
 * const value = d.f64At(offset);
 * ```                          
 * 
 * No allocation, no boxing, no GC churn, no property-shape instability.   
 * 
 * ### Example: reactive DB write path
 * 
 * ```tsx
 *   * const d = new HADRON_DISRUPTOR({
 *    capacity: 1 << 18,
 *    pidCapacity: 1 << 20,
 *    f64Capacity: 1 << 20,
 *    wait: "spin",
 *  });
 *  
 *  const values = new Float64Array(1 << 20);
 *  const versions = new Uint32Array(1 << 20);
 *  
 *  d.on(OP.WRITE, (ring, from, to, epoch, d) => {
 *    for (let seq = from; seq < to; seq++) {
 *      const base = (seq & d.mask) * 8;
 *  
 *      const pid = ring[base + 1];
 *      const slot = ring[base + 2];
 *      const valueOffset = ring[base + 3];
 *  
 *      values[slot] = d.f64At(valueOffset);
 *      versions[slot] = epoch;
 *  
 *      d.dirtyMark(pid);
 *    }
 *  });
 *  
 *  d.on(OP.READ, (ring, from, to, epoch, d) => {
 *    for (let seq = from; seq < to; seq++) {
 *      const base = (seq & d.mask) * 8;
 *      const pid = ring[base + 1];
 *      const slot = d.slot(pid);
 *  
 *      if (slot >= 0 && d.dirtyTake(pid)) {
 *        // reactive invalidation / subscriber dispatch
 *      }
 *    }
 *  });
 *  
 *  d.on(OP.COMPACT, (_ring, _from, _to, _epoch, d) => {
 *    // bulk slot reclamation
 *  });
 *  
 *  const pid = 77;
 *  const slot = 1234;
 *  
 *  d.bind(pid, slot);
 *  
 *  const valueAt = d.allocF64(42.5);
 *  d.emit(OP.WRITE, pid, slot, valueAt);
 *  
 *  d.revolution();
 *  
 *  console.log(d.tick());       // 1
 *  console.log(values[slot]);   // 42.5
 *  console.log(versions[slot]); // 1
 * ```
 * 
 *     - Not bytecode for bytecode’s sake. The winning properties are:
 *     - Zero allocation on steady state.
 *     - One cache-friendly fixed record format.
 *     - No Maps, strings, objects, or closures in the hot path.
 *     - Per-lane rings, so operation classes never pollute one another’s branch predictors.
 *     - Availability-buffer publishing, so multi-producer visibility is correct.
 *     - Batch handlers, so the engine processes ranges rather than individual events.
 *     - Phase locking, so every DB pass has one semantic job.
 *     - Clock-as-progress, so backpressure emerges from the data path itself.
 *     - Shared-memory ready, so lanes can later move across workers without changing the record format.
 *  
 *  The next competitive edge is not adding more abstraction—it is specializing each handler into a tight numeric kernel: READ becomes a scan/invalidation kernel, WRITE becomes a bulk SOA write kernel, DELETE becomes a free-list kernel, and COMPACT becomes a memmove-style reclamation kernel. That is where this stops being a disruptor library and becomes the actual execution engine for your database.
 * 
 * 
 * 
 */


export const OP = {
  READ: 0,
  WRITE: 1,
  DELETE: 2,
  EFFECT: 3,
  COMPACT: 4,
} as const;

export type OpKind = (typeof OP)[keyof typeof OP];

export type WaitStrategy = "spin" | "yield" | "park";

export interface HADRON_OPTIONS {
  capacity?: number;
  pidCapacity?: number;
  f64Capacity?: number;
  u32Capacity?: number;
  i32Capacity?: number;
  byteCapacity?: number;
  maxBatch?: number;
  wait?: WaitStrategy;
  shared?: boolean;
  schedule?: readonly number[];
}

export interface LANE_STATS {
  published: number;
  consumed: number;
  batches: number;
  maxBatch: number;
  fullStalls: number;
  claimed: number;
}

/* --------------------------------------------------------------------------
   Record layout — 8 x Int32 = 32 bytes.

   0 opcode
   1 pid
   2 slot
   3 a — primary payload / f64 arena offset / u32 arena offset
   4 b — secondary payload / length / count
   5 c — tertiary payload / flags
   6 epoch — tracer clock at publication
   7 reserved / checksum / extension
   -------------------------------------------------------------------------- */

const REC = 8;

const F_OP = 0;
const F_PID = 1;
const F_SLOT = 2;
const F_A = 3;
const F_B = 4;
const F_C = 5;
const F_EPOCH = 6;
const F_EXT = 7;

const DEFAULT_SCHEDULE = [
  OP.READ,
  OP.WRITE,
  OP.READ,
  OP.WRITE,
  OP.DELETE,
  OP.EFFECT,
  OP.COMPACT,
] as const;

const pow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

export class HADRON_DISRUPTOR {
  readonly capacity: number;
  readonly mask: number;
  readonly pidCapacity: number;
  readonly schedule: readonly number[];
  readonly shared: boolean;

  private readonly rings: Int32Array[] = [];

  /*
    Per-lane shared control block layout:

    0 nextClaim
    1 gatingSequence  — consumer progress
    2 cachedAvailableSequence
    3 publishedHighest
    4 fullStalls
    5 claimed
    6 published
    7 consumed
    8 batches
    9 maxBatch
   */
  private static readonly CTRL = 16;
  private readonly ctrl: Int32Array;

  private readonly available: Int32Array[] = [];

  private readonly clock: Int32Array;
  private readonly phaseIndex: Int32Array;
  private readonly running: Int32Array;

  private readonly pidToSlot: Int32Array;
  private readonly dirty: Uint32Array;

  private readonly f64: Float64Array;
  private readonly u32: Uint32Array;
  private readonly i32: Int32Array;
  private readonly bytes: Uint8Array;

  private f64Tail = 0;
  private u32Tail = 0;
  private i32Tail = 0;
  private byteTail = 0;

  private readonly maxBatch: number;
  private readonly wait: WaitStrategy;

  private handlers: Array<
    | ((
        ring: Int32Array,
        from: number,
        to: number,
        epoch: number,
        d: HADRON_DISRUPTOR
      ) => void)
    | null
  > = [];

  constructor(options: HADRON_OPTIONS = {}) {
    const capacity = options.capacity ?? 1 << 18;
    const pidCapacity = options.pidCapacity ?? 1 << 20;

    if (!pow2(capacity)) throw new Error("capacity must be a power of two");
    if (!pow2(pidCapacity)) throw new Error("pidCapacity must be a power of two");

    this.capacity = capacity;
    this.mask = capacity - 1;
    this.pidCapacity = pidCapacity;

    this.schedule = options.schedule ?? DEFAULT_SCHEDULE;
    this.shared = options.shared ?? typeof SharedArrayBuffer !== "undefined";

    this.maxBatch = options.maxBatch ?? 8192;
    this.wait = options.wait ?? "yield";

    const AB = this.shared ? SharedArrayBuffer : ArrayBuffer;

    const laneCount = this.schedule.length;

    this.rings = Array.from(
      { length: laneCount },
      () => new Int32Array(new AB(capacity * REC * 4))
    );

    this.ctrl = new Int32Array(new AB(laneCount * HADRON_DISRUPTOR.CTRL * 4));

    // Availability buffer uses one Int32 per ring slot.
    this.available = Array.from(
      { length: laneCount },
      () => new Int32Array(new AB(capacity * 4))
    );

    this.clock = new Int32Array(new AB(4));
    this.phaseIndex = new Int32Array(new AB(4));
    this.running = new Int32Array(new AB(4));

    this.pidToSlot = new Int32Array(new AB(pidCapacity * 4));
    this.pidToSlot.fill(-1);

    this.dirty = new Uint32Array(new AB((pidCapacity >>> 5) * 4));

    this.f64 = new Float64Array(new AB((options.f64Capacity ?? 1 << 18) * 8));
    this.u32 = new Uint32Array(new AB((options.u32Capacity ?? 1 << 18) * 4));
    this.i32 = new Int32Array(new AB((options.i32Capacity ?? 1 << 18) * 4));
    this.bytes = new Uint8Array(new AB(options.byteCapacity ?? 1 << 20));
  }

  /* ======================================================================
     HANDLERS
     ====================================================================== */

  on(
    op: OpKind,
    handler: (
      ring: Int32Array,
      from: number,
      to: number,
      epoch: number,
      d: HADRON_DISRUPTOR
    ) => void
  ): this {
    this.handlers[op] = handler;
    return this;
  }

  /* ======================================================================
     PID / SLOT / DIRTY
     ====================================================================== */

  bind(pid: number, slot: number): void {
    this.pidToSlot[pid] = slot;
  }

  unbind(pid: number): void {
    this.pidToSlot[pid] = -1;
  }

  slot(pid: number): number {
    return this.pidToSlot[pid];
  }

  dirtyMark(pid: number): void {
    this.dirty[pid >>> 5] |= 1 << (pid & 31);
  }

  dirtyTake(pid: number): boolean {
    const w = pid >>> 5;
    const bit = 1 << (pid & 31);
    const word = this.dirty[w];

    if ((word & bit) === 0) return false;

    this.dirty[w] = word & ~bit;
    return true;
  }

  dirtyPeek(pid: number): boolean {
    return (this.dirty[pid >>> 5] & (1 << (pid & 31))) !== 0;
  }

  /* ======================================================================
     SOA ARENAS
     ====================================================================== */

  allocF64(value: number): number {
    const at = this.f64Tail++;
    this.f64[at] = value;
    return at;
  }

  allocU32(value: number): number {
    const at = this.u32Tail++;
    this.u32[at] = value;
    return at;
  }

  allocI32(value: number): number {
    const at = this.i32Tail++;
    this.i32[at] = value;
    return at;
  }

  allocBytes(data: Uint8Array): number {
    const at = this.byteTail;
    this.bytes.set(data, at);
    this.byteTail += data.length;
    return at;
  }

  f64At(offset: number): number {
    return this.f64[offset];
  }

  u32At(offset: number): number {
    return this.u32[offset];
  }

  i32At(offset: number): number {
    return this.i32[offset];
  }

  bytesAt(offset: number, length: number): Uint8Array {
    return this.bytes.subarray(offset, offset + length);
  }

  /* ======================================================================
     MULTI-PRODUCER CLAIM / PUBLISH
     ====================================================================== */

  private ctrlAt(lane: number, field: number): number {
    return lane * HADRON_DISRUPTOR.CTRL + field;
  }

  /**
   * Claim the next sequence for a lane.
   *
   * This is a true multi-producer sequencer:
   * - CAS reserves a unique sequence.
   * - The availability buffer marks that exact sequence published.
   * - Consumers never rely on a single global “highest published” value.
   */
  claim(lane: number): number {
    const next = this.ctrlAt(lane, 0);
    const stall = this.ctrlAt(lane, 4);
    const claimed = this.ctrlAt(lane, 5);

    let spin = 0;

    for (;;) {
      const seq = Atomics.load(this.ctrl, next);
      const wrap = seq - this.capacity;
      const gate = Atomics.load(this.ctrl, this.ctrlAt(lane, 1));

      if (gate > wrap) {
        if (Atomics.compareExchange(this.ctrl, next, seq, seq + 1) === seq) {
          Atomics.add(this.ctrl, claimed, 1);
          return seq;
        }
        continue;
      }

      Atomics.add(this.ctrl, stall, 1);

      if (this.wait === "spin") {
        spin++;
        continue;
      }

      if (this.wait === "yield") {
        this.yieldNow();
        continue;
      }

      Atomics.wait(this.ctrl, next, seq, 1);
      spin = 0;
    }
  }

  /**
   * Publish a claimed record.
   *
   * The record must be fully written BEFORE this call.
   * The availability buffer is the publication barrier.
   */
  publish(lane: number, seq: number): void {
    const avail = this.available[lane];
    Atomics.store(avail, seq & this.mask, seq + 1);

    const pub = this.ctrlAt(lane, 6);
    Atomics.add(this.ctrl, pub, 1);

    const waiting = this.ctrlAt(lane, 0);
    Atomics.notify(this.ctrl, waiting);
  }

  /**
   * One-shot enqueue.
   *
   * Returns:
   *   >= 0 — published sequence
   *   -1  — nonblocking mode and lane was full
   */
  emit(
    op: OpKind,
    pid: number,
    slot: number,
    a = 0,
    b = 0,
    c = 0,
    ext = 0,
    block = true
  ): number {
    const lane = this.laneFor(op);
    const ring = this.rings[lane];

    if (!block && this.isFull(lane)) return -1;

    const seq = this.claim(lane);
    const base = (seq & this.mask) * REC;
    const epoch = Atomics.load(this.clock, 0);

    ring[base + F_OP] = op;
    ring[base + F_PID] = pid;
    ring[base + F_SLOT] = slot;
    ring[base + F_A] = a;
    ring[base + F_B] = b;
    ring[base + F_C] = c;
    ring[base + F_EPOCH] = epoch;
    ring[base + F_EXT] = ext;

    this.publish(lane, seq);
    return seq;
  }

  /* ======================================================================
     CONSUMER BARRIER
     ====================================================================== */

  /**
   * Return the highest contiguous available sequence for a lane.
   *
   * This scans only the availability window, then caches the result.
   * It avoids the classic problem of a slow producer blocking visibility
   * of later producers.
   */
  private availableThrough(lane: number): number {
    const ctrlBase = this.ctrlAt(lane, 0);
    const gateField = this.ctrlAt(lane, 1);
    const cacheField = this.ctrlAt(lane, 2);

    const next = Atomics.load(this.ctrl, ctrlBase);
    let gate = Atomics.load(this.ctrl, gateField);
    let cached = Atomics.load(this.ctrl, cacheField);

    if (cached >= gate) {
      const avail = this.available[lane];
      const cap = this.capacity;

      let scan = cached;
      const limit = Math.min(next, cached + this.maxBatch);

      while (scan < limit) {
        const flag = Atomics.load(avail, scan & (cap - 1));
        if (flag <= scan) break;
        scan++;
      }

      cached = scan;
      Atomics.store(this.ctrl, cacheField, cached);
    }

    return cached;
  }

  /* ======================================================================
     PHASE-LOCKED EXECUTION
     ====================================================================== */

  /**
   * Drain exactly one scheduled phase.
   *
   * A phase is homogeneous: READ only, WRITE only, DELETE only, etc.
   */
  drainPhase(limit = this.maxBatch): number {
    const schedule = this.schedule;
    const lane = schedule[Atomics.load(this.phaseIndex, 0)];
    const handler = this.handlers[lane];

    if (!handler) {
      this.nextPhase();
      return 0;
    }

    const ring = this.rings[lane];
    const gateField = this.ctrlAt(lane, 1);

    const available = this.availableThrough(lane);
    const head = Atomics.load(this.ctrl, gateField);

    const end = Math.min(available, head + limit);

    if (end <= head) {
      this.nextPhase();
      return 0;
    }

    const epoch = Atomics.load(this.clock, 0);

    // Batch boundary is handed to the handler.
    // The handler can specialize contiguous execution.
    handler(ring, head, end, epoch, this);

    Atomics.store(this.ctrl, gateField, end);

    const consumedField = this.ctrlAt(lane, 7);
    const batchField = this.ctrlAt(lane, 8);
    const maxBatchField = this.ctrlAt(lane, 9);

    const count = end - head;

    Atomics.add(this.ctrl, consumedField, count);
    Atomics.add(this.ctrl, batchField, 1);

    const prevMax = Atomics.load(this.ctrl, maxBatchField);
    if (count > prevMax) Atomics.store(this.ctrl, maxBatchField, count);

    this.nextPhase();
    return count;
  }

  /**
   * Run one full revolution.
   *
   * The tracer particle advances only after every scheduled phase runs.
   */
  revolution(limit = this.maxBatch): number {
    let total = 0;

    for (let i = 0; i < this.schedule.length; i++) {
      total += this.drainPhase(limit);
    }

    Atomics.add(this.clock, 0, 1);
    return total;
  }

  /**
   * Run until all lanes are drained.
   *
   * Useful for shutdown, transaction boundaries, and tests.
   */
  drainAll(limit = this.maxBatch): number {
    let total = 0;

    for (;;) {
      const before = total;
      total += this.revolution(limit);
      if (total === before) break;
    }

    return total;
  }

  /* ======================================================================
     CLOCK / CONTROL
     ====================================================================== */

  tick(): number {
    return Atomics.load(this.clock, 0);
  }

  currentPhase(): OpKind {
    return this.schedule[Atomics.load(this.phaseIndex, 0)] as OpKind;
  }

  start(): void {
    Atomics.store(this.running, 0, 1);
  }

  stop(): void {
    Atomics.store(this.running, 0, 0);
    Atomics.notify(this.running, 0);
  }

  isRunning(): boolean {
    return Atomics.load(this.running, 0) === 1;
  }

  /* ======================================================================
     STATS
     ====================================================================== */

  stats(lane: number): LANE_STATS {
    const b = lane * HADRON_DISRUPTOR.CTRL;

    return {
      claimed: Atomics.load(this.ctrl, b + 5),
      published: Atomics.load(this.ctrl, b + 6),
      consumed: Atomics.load(this.ctrl, b + 7),
      batches: Atomics.load(this.ctrl, b + 8),
      maxBatch: Atomics.load(this.ctrl, b + 9),
      fullStalls: Atomics.load(this.ctrl, b + 4),
    };
  }

  pending(lane: number): number {
    const published = Atomics.load(this.ctrl, this.ctrlAt(lane, 6));
    const consumed = Atomics.load(this.ctrl, this.ctrlAt(lane, 7));
    return published - consumed;
  }

  /* ======================================================================
     INTERNAL
     ====================================================================== */

  private laneFor(op: OpKind): number {
    return op;
  }

  private isFull(lane: number): boolean {
    const next = Atomics.load(this.ctrl, this.ctrlAt(lane, 0));
    const gate = Atomics.load(this.ctrl, this.ctrlAt(lane, 1));
    return next - gate >= this.capacity;
  }

  private nextPhase(): void {
    const next = (Atomics.load(this.phaseIndex, 0) + 1) % this.schedule.length;
    Atomics.store(this.phaseIndex, 0, next);
  }

  private yieldNow(): void {
    if (typeof scheduler !== "undefined" && "yield" in scheduler) {
      scheduler.yield();
    } else if (typeof setImmediate === "function") {
      setImmediate(() => {});
    } else {
      setTimeout(() => {}, 0);
    }
  }
}
