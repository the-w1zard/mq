export type Pid = number;
export declare const OP: {
    readonly NONE: 0;
    readonly PUT: 1;
    readonly EDIT: 2;
    readonly DELETE: 3;
    readonly TRANSFORM: 4;
};
/** The tracer's payload slot: its own channel inside the particle. */
export declare const TRACER_PID = 0;
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
    seq: number;
    cycle: number;
    dirty: boolean;
}
export interface ColliderOptions {
    maxParticles?: number;
    windowSize?: number;
    tiers?: TransformTier[];
}
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
export declare class HC4 {
    private payloads;
    private ops;
    private dirty;
    private slotIndex;
    private clock;
    private cycleCount;
    private lane;
    private laneLen;
    private laneCursor;
    private intakeBuf;
    private intakeHead;
    private intakeTail;
    private readonly pendingEdits;
    private readonly pendingTiers;
    private transformQueue;
    private tierWork;
    private postOffice;
    private maxParticles;
    private nextPid;
    constructor(opts?: ColliderOptions);
    private allocateSlot;
    admit(payload: unknown): Pid;
    queueEdit(pid: Pid, edit: (payload: any) => any): void;
    queueDelete(pid: Pid): void;
    queueTransform(pid: Pid, tierName?: string): void;
    markTierWork(pid: Pid, tier: string, work: (p: Particle) => unknown): void;
    clearTierWork(pid: Pid): void;
    particleAt(pid: Pid): Particle | undefined;
    subscribe<T = any>(pid: Pid, initial?: T): CallSite<T>;
    private dispatch;
    pass(): void;
    private drop;
    private consumeDirty;
    private transformAndReAdmit;
    get cycles(): number;
    get tick(): number;
    get particleCount(): number;
}
export declare function createCollider(opts?: ColliderOptions): HC4;
