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
import { scheduler } from "timers/promises";
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
// Zero-allocation, multi-lane, phase-locked LMAX-style disruptor.
// Designed for browser + Node; uses SharedArrayBuffer when available.
export const OP = {
    READ: 0,
    WRITE: 1,
    DELETE: 2,
    EFFECT: 3,
    COMPACT: 4,
};
export const LANE_FOR_OP = [
    0, // READ
    1, // WRITE
    2, // DELETE
    3, // EFFECT
    4, // COMPACT
];
const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;
export class HADRON_DISRUPTOR {
    capacity;
    mask;
    laneCount;
    // Ring record layout:
    // [0] opcode
    // [1] pid
    // [2] slot
    // [3] payloadA
    // [4] payloadB
    // [5] flags
    static RECORD_WORDS = 6;
    rings = [];
    heads; // consumer cursor per lane
    tails; // next claim slot per lane
    committed; // highest committed sequence per lane
    clock; // tracer particle / epoch clock
    phase; // current lane being drained
    pidToSlot;
    dirty;
    wait;
    maxBatch;
    shared;
    stats;
    handlers = [];
    constructor(options = {}) {
        const capacity = options.capacity ?? 1024 * 1024;
        const lanes = options.lanes ?? 5;
        if (!isPow2(capacity))
            throw new Error("capacity must be a power of two");
        if (!isPow2(lanes))
            throw new Error("lanes must be a power of two");
        this.capacity = capacity;
        this.mask = capacity - 1;
        this.laneCount = lanes;
        this.shared = options.shared ?? typeof SharedArrayBuffer !== "undefined";
        const AB = this.shared ? SharedArrayBuffer : ArrayBuffer;
        this.wait = options.wait ?? "yield";
        this.maxBatch = options.maxBatch ?? 4096;
        const recordBytes = HADRON_DISRUPTOR.RECORD_WORDS * 4;
        for (let lane = 0; lane < lanes; lane++) {
            this.rings.push(new Int32Array(new AB(capacity * recordBytes)));
        }
        this.heads = new Int32Array(new AB(lanes * 4));
        this.tails = new Int32Array(new AB(lanes * 4));
        this.committed = new Int32Array(new AB(lanes * 4));
        this.clock = new Int32Array(new AB(4));
        this.phase = new Int32Array(new AB(4));
        this.pidToSlot = new Int32Array(new AB(1 << 20).slice(0)); // 1M direct PID slots
        this.pidToSlot.fill(-1);
        // 1M PIDs => 32K Uint32 words.
        this.dirty = new Uint32Array(new AB(32 * 1024));
        this.stats = {
            published: new Uint32Array(lanes),
            consumed: new Uint32Array(lanes),
            dropped: new Uint32Array(lanes),
            batches: new Uint32Array(lanes),
            maxBatch: new Uint32Array(lanes),
        };
    }
    /** Register the handler for one operation lane. */
    onLane(lane, handler) {
        this.handlers[lane] = handler;
        return this;
    }
    /**
     * Claim a record slot.
     *
     * Multi-producer safe: each producer receives a unique sequence.
     * The producer must call commit() after filling the record.
     */
    claim(lane) {
        const tailIndex = lane;
        let seq = Atomics.load(this.tails, tailIndex);
        for (;;) {
            const wrapped = seq & this.mask;
            const fence = seq - this.capacity;
            // Wait until the consumer has released this ring cell.
            const head = Atomics.load(this.heads, tailIndex);
            if (head > fence) {
                if (Atomics.compareExchange(this.tails, tailIndex, seq, seq + 1) === seq) {
                    return seq;
                }
            }
            this.backoff();
            seq = Atomics.load(this.tails, tailIndex);
        }
    }
    /** Publish a claimed record. */
    commit(lane, sequence) {
        Atomics.store(this.committed, lane, sequence + 1);
        this.stats.published[lane]++;
    }
    /**
     * Enqueue an operation in one call.
     * Returns false if the lane is temporarily full and `block` is false.
     */
    emit(op, pid, slot, payloadA = 0, payloadB = 0, flags = 0, block = true) {
        const lane = LANE_FOR_OP[op];
        const ring = this.rings[lane];
        let seq;
        try {
            seq = this.claim(lane);
        }
        catch {
            return false;
        }
        const base = (seq & this.mask) * HADRON_DISRUPTOR.RECORD_WORDS;
        ring[base + 0] = op;
        ring[base + 1] = pid;
        ring[base + 2] = slot;
        ring[base + 3] = payloadA;
        ring[base + 4] = payloadB;
        ring[base + 5] = flags;
        this.commit(lane, seq);
        return true;
    }
    /**
     * Drain the current phase lane.
     *
     * One call processes only one operation class. The tracer clock advances
     * once per completed revolution across all lanes.
     */
    drainPass(limit = this.maxBatch) {
        const lane = Atomics.load(this.phase, 0);
        const handler = this.handlers[lane];
        const ring = this.rings[lane];
        if (!handler) {
            this.advancePhase();
            return 0;
        }
        const headIndex = lane;
        const committedIndex = lane;
        let processed = 0;
        let head = Atomics.load(this.heads, headIndex);
        const available = Atomics.load(this.committed, committedIndex);
        const batchEnd = Math.min(available, head + limit);
        while (head < batchEnd) {
            const base = (head & this.mask) * HADRON_DISRUPTOR.RECORD_WORDS;
            handler(ring, base, Atomics.load(this.clock, 0));
            head++;
            processed++;
        }
        if (processed > 0) {
            Atomics.store(this.heads, headIndex, head);
            this.stats.consumed[lane] += processed;
            this.stats.batches[lane]++;
            if (processed > this.stats.maxBatch[lane])
                this.stats.maxBatch[lane] = processed;
        }
        this.advancePhase();
        return processed;
    }
    /** Run a full revolution: one pass per lane, then advance the tracer clock. */
    runRevolution(maxPerPass = this.maxBatch) {
        let total = 0;
        for (let lane = 0; lane < this.laneCount; lane++) {
            total += this.drainPass(maxPerPass);
        }
        // Tracer particle completes one revolution.
        Atomics.add(this.clock, 0, 1);
        return total;
    }
    /** Direct clock read: this is the platform reactive epoch. */
    tick() {
        return Atomics.load(this.clock, 0);
    }
    /** O(1) dirty-bit set. */
    markDirty(pid) {
        const word = pid >>> 5;
        const bit = 1 << (pid & 31);
        this.dirty[word] |= bit;
    }
    /** O(1) dirty-bit test-and-clear. */
    takeDirty(pid) {
        const word = pid >>> 5;
        const bit = 1 << (pid & 31);
        if ((this.dirty[word] & bit) === 0)
            return false;
        this.dirty[word] &= ~bit;
        return true;
    }
    /** Direct PID -> storage slot binding. No Map lookup. */
    bindPid(pid, slot) {
        this.pidToSlot[pid] = slot;
    }
    unbindPid(pid) {
        this.pidToSlot[pid] = -1;
    }
    slotFor(pid) {
        return this.pidToSlot[pid];
    }
    advancePhase() {
        const next = (Atomics.load(this.phase, 0) + 1) % this.laneCount;
        Atomics.store(this.phase, 0, next);
    }
    backoff() {
        if (this.wait === "spin")
            return;
        if (this.wait === "yield") {
            // Browser/Node-friendly cooperative yield.
            if (typeof scheduler !== "undefined" && "yield" in scheduler) {
                scheduler.yield();
            }
            else if (typeof setImmediate === "function") {
                setImmediate(() => { });
            }
            else {
                setTimeout(() => { }, 0);
            }
            return;
        }
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1);
    }
}
