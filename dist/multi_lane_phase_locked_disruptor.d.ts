/** MULTI-LANE, PHASE-LOCKED DISRUPTOR
 *
 * The tracer becomes the global sequence/clock, each operation class gets its own power-of-two ring, and each revolution drains exactly one lane.
 * That gives us the “one function type per DB pass” semantics without wasting cache lines scanning mixed operations.
 * The existing registry/address model maps cleanly onto this: rt -> ms -> sl -> root key -> shard stays above the disruptor;
 *
 * | Component       | Implementation                                     | Why                                              |
 * | --------------- | -------------------------------------------------- | ------------------------------------------------ |
 * | Ring storage    | SharedArrayBuffer + Int32Array / Uint32Array views | Near-metal, transferable, worker-safe            |
 * | Sequencer       | Per-lane Uint32Array cursor + Atomics              | Correct multi-producer claiming                  |
 * | Clock           | Uint32Array(1) tracer counter                      | The tracer value is the app/reactive epoch       |
 * | PID lookup      | Int32Array direct slot table                       | No Map on the hot path                           |
 * | Dirty tracking  | Uint32Array bitmask                                | O(1) mark/test, cheap compaction                 |
 * | Pass scheduling | One lane drained per tracer revolution             | Reads, writes, deletes, effects never interleave |
 * | Backpressure    | Bounded lane capacity + spin/yield/park            | Slow consumers naturally slow producers          |
 *
 * The important distinction: do not put objects in the ring. The ring carries fixed-width records;
 * payloads live in side stores (Float64Array, Uint32Array, object arena, etc.), addressed by slot.
 * That is what keeps the hot path allocation-free.
 *
 */
/**
 * const d = new HADRON_DISRUPTOR({
  capacity: 1 << 16,
  lanes: 5,
  wait: "yield",
  shared: true,
});

d.onLane(OP.READ, (r, b, clock) => {
  const pid = r[b + 1];
  const slot = d.slotFor(pid);
  // read from SOA storage using slot
});

d.onLane(OP.WRITE, (r, b, clock) => {
  const pid = r[b + 1];
  const slot = r[b + 2];
  const valueBits = r[b + 3];
  d.markDirty(pid);
  // write into SOA storage
});

d.onLane(OP.DELETE, (r, b, clock) => {
  const pid = r[b + 1];
  d.unbindPid(pid);
});

d.onLane(OP.COMPACT, (r, b, clock) => {
  // bulk reclaim / compaction
});

d.bindPid(77, 1234);

d.emit(OP.WRITE, 77, 1234, 42);
d.emit(OP.READ, 77, 1234);

d.runRevolution();

console.log("clock:", d.tick());
 */
export declare const OP: {
    readonly READ: 0;
    readonly WRITE: 1;
    readonly DELETE: 2;
    readonly EFFECT: 3;
    readonly COMPACT: 4;
};
export type OpKind = (typeof OP)[keyof typeof OP];
export declare const LANE_FOR_OP: readonly number[];
export type WaitStrategy = "spin" | "yield" | "sleep";
export interface DisruptorOptions {
    /** Must be power of two. */
    capacity?: number;
    /** Number of operation lanes. */
    lanes?: number;
    wait?: WaitStrategy;
    /** Maximum records handled in one consumer batch. */
    maxBatch?: number;
    /** Use SharedArrayBuffer + Atomics. */
    shared?: boolean;
}
export interface RingStats {
    published: Uint32Array;
    consumed: Uint32Array;
    dropped: Uint32Array;
    batches: Uint32Array;
    maxBatch: Uint32Array;
}
export declare class HADRON_DISRUPTOR {
    readonly capacity: number;
    readonly mask: number;
    readonly laneCount: number;
    static readonly RECORD_WORDS = 6;
    private readonly rings;
    private readonly heads;
    private readonly tails;
    private readonly committed;
    private readonly clock;
    private readonly phase;
    private readonly pidToSlot;
    private readonly dirty;
    private readonly wait;
    private readonly maxBatch;
    private readonly shared;
    readonly stats: RingStats;
    private handlers;
    constructor(options?: DisruptorOptions);
    /** Register the handler for one operation lane. */
    onLane(lane: number, handler: (record: Int32Array, base: number, clock: number) => void): this;
    /**
     * Claim a record slot.
     *
     * Multi-producer safe: each producer receives a unique sequence.
     * The producer must call commit() after filling the record.
     */
    claim(lane: number): number;
    /** Publish a claimed record. */
    commit(lane: number, sequence: number): void;
    /**
     * Enqueue an operation in one call.
     * Returns false if the lane is temporarily full and `block` is false.
     */
    emit(op: OpKind, pid: number, slot: number, payloadA?: number, payloadB?: number, flags?: number, block?: boolean): boolean;
    /**
     * Drain the current phase lane.
     *
     * One call processes only one operation class. The tracer clock advances
     * once per completed revolution across all lanes.
     */
    drainPass(limit?: number): number;
    /** Run a full revolution: one pass per lane, then advance the tracer clock. */
    runRevolution(maxPerPass?: number): number;
    /** Direct clock read: this is the platform reactive epoch. */
    tick(): number;
    /** O(1) dirty-bit set. */
    markDirty(pid: number): void;
    /** O(1) dirty-bit test-and-clear. */
    takeDirty(pid: number): boolean;
    /** Direct PID -> storage slot binding. No Map lookup. */
    bindPid(pid: number, slot: number): void;
    unbindPid(pid: number): void;
    slotFor(pid: number): number;
    private advancePhase;
    private backoff;
}
