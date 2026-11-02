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
export declare const OP: {
    readonly READ: 0;
    readonly WRITE: 1;
    readonly DELETE: 2;
    readonly EFFECT: 3;
    readonly COMPACT: 4;
};
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
export declare class HADRON_DISRUPTOR {
    readonly capacity: number;
    readonly mask: number;
    readonly pidCapacity: number;
    readonly schedule: readonly number[];
    readonly shared: boolean;
    private readonly rings;
    private static readonly CTRL;
    private readonly ctrl;
    private readonly available;
    private readonly clock;
    private readonly phaseIndex;
    private readonly running;
    private readonly pidToSlot;
    private readonly dirty;
    private readonly f64;
    private readonly u32;
    private readonly i32;
    private readonly bytes;
    private f64Tail;
    private u32Tail;
    private i32Tail;
    private byteTail;
    private readonly maxBatch;
    private readonly wait;
    private handlers;
    constructor(options?: HADRON_OPTIONS);
    on(op: OpKind, handler: (ring: Int32Array, from: number, to: number, epoch: number, d: HADRON_DISRUPTOR) => void): this;
    bind(pid: number, slot: number): void;
    unbind(pid: number): void;
    slot(pid: number): number;
    dirtyMark(pid: number): void;
    dirtyTake(pid: number): boolean;
    dirtyPeek(pid: number): boolean;
    allocF64(value: number): number;
    allocU32(value: number): number;
    allocI32(value: number): number;
    allocBytes(data: Uint8Array): number;
    f64At(offset: number): number;
    u32At(offset: number): number;
    i32At(offset: number): number;
    bytesAt(offset: number, length: number): Uint8Array;
    private ctrlAt;
    /**
     * Claim the next sequence for a lane.
     *
     * This is a true multi-producer sequencer:
     * - CAS reserves a unique sequence.
     * - The availability buffer marks that exact sequence published.
     * - Consumers never rely on a single global “highest published” value.
     */
    claim(lane: number): number;
    /**
     * Publish a claimed record.
     *
     * The record must be fully written BEFORE this call.
     * The availability buffer is the publication barrier.
     */
    publish(lane: number, seq: number): void;
    /**
     * One-shot enqueue.
     *
     * Returns:
     *   >= 0 — published sequence
     *   -1  — nonblocking mode and lane was full
     */
    emit(op: OpKind, pid: number, slot: number, a?: number, b?: number, c?: number, ext?: number, block?: boolean): number;
    /**
     * Return the highest contiguous available sequence for a lane.
     *
     * This scans only the availability window, then caches the result.
     * It avoids the classic problem of a slow producer blocking visibility
     * of later producers.
     */
    private availableThrough;
    /**
     * Drain exactly one scheduled phase.
     *
     * A phase is homogeneous: READ only, WRITE only, DELETE only, etc.
     */
    drainPhase(limit?: number): number;
    /**
     * Run one full revolution.
     *
     * The tracer particle advances only after every scheduled phase runs.
     */
    revolution(limit?: number): number;
    /**
     * Run until all lanes are drained.
     *
     * Useful for shutdown, transaction boundaries, and tests.
     */
    drainAll(limit?: number): number;
    tick(): number;
    currentPhase(): OpKind;
    start(): void;
    stop(): void;
    isRunning(): boolean;
    stats(lane: number): LANE_STATS;
    pending(lane: number): number;
    private laneFor;
    private isFull;
    private nextPhase;
    private yieldNow;
}
