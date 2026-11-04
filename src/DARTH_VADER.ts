// DARTH_VADER - packed-lane SPSC ring (single producer, single consumer, single thread safe)
//
// Design:
//   1. Free-slot counter instead of two free-running cursors. The "ring is full" check is
//      ONE field load + compare (`free === 0`), so rejected publishes are as cheap as possible,
//      and accepted publishes need no subtraction or wrap handling.
//   2. `head` is always kept masked (0..capacity-1) and `free` is always 0..capacity, so every
//      piece of state is a small int. Nothing is free-running: no int32 wraparound, no precision
//      loss, safe for processes that run for months.
//   3. pid (24 bit) and flag (8 bit) are packed into one Int32 lane: two lane stores per publish
//      instead of three.
//   4. consume() hoists lanes/mask into locals and walks a masked index.
//
// Limits (enforced in the constructor / documented, not checked in the hot path):
//   - pid must be an integer in [0, 0xFFFFFF]; flag is truncated to 8 bits (0..255).
//   - capacity must be a power of two, 2 .. 2^30.
//   - Single producer + single consumer on one thread (or externally serialized).

export type DisruptorHandler = (pid: number, value: number, flag: number) => void;

export const MAX_PID = 0xffffff;

export class DARTH_VADER {
	public readonly capacity: number;
	public readonly mask: number;

	// Structure-of-arrays lanes. meta = (pid << 8) | flag
	public readonly meta: Int32Array;
	public readonly values: Float64Array;

	// Next slot to write (always masked) and number of free slots (0..capacity).
	private head = 0;
	private free: number;

	constructor(capacity = 65536) {
		if (!Number.isInteger(capacity) || capacity < 2 || capacity > 1 << 30 || (capacity & (capacity - 1)) !== 0) {
			throw new Error("Disruptor capacity must be a power of two between 2 and 2^30.");
		}
		this.capacity = capacity;
		this.mask = capacity - 1;
		this.free = capacity;
		this.meta = new Int32Array(capacity);
		this.values = new Float64Array(capacity);
	}

	/** Publish one event. Returns false (and writes nothing) if the ring is full. */
	public publish(pid: number, value: number, flag = 0): boolean {
		const f = this.free;
		if (f === 0) {
			return false;
		}
		const h = this.head;
		this.meta[h] = (pid << 8) | (flag & 255);
		this.values[h] = value;
		this.head = (h + 1) & this.mask;
		this.free = f - 1;
		return true;
	}

	/** Drain everything currently published, calling handler per event. Returns the count. */
	public consume(handler: DisruptorHandler): number {
		const n = this.capacity - this.free;
		if (n === 0) {
			return 0;
		}
		const meta = this.meta;
		const values = this.values;
		const mask = this.mask;
		let r = (this.head - n) & mask;
		for (let k = 0; k < n; k++) {
			const m = meta[r];
			handler(m >>> 8, values[r], m & 255);
			r = (r + 1) & mask;
		}
		this.free = this.capacity;
		return n;
	}

	// ── Zero-callback batch path ──────────────────────────────────────────
	//   const n = ring.readable();
	//   for (let k = 0, i = ring.tail(); k < n; k++, i = (i + 1) & ring.mask) {
	//     const m = ring.meta[i]; use(m >>> 8, ring.values[i], m & 255);
	//   }
	//   ring.advance(n);

	/** Number of events published and not yet consumed. */
	public readable(): number {
		return this.capacity - this.free;
	}

	/** Lane index of the oldest unconsumed event (only meaningful when readable() > 0). */
	public tail(): number {
		return (this.head - (this.capacity - this.free)) & this.mask;
	}

	/** Mark `n` events (n <= readable()) as consumed after reading them straight from the lanes. */
	public advance(n: number): void {
		this.free += n;
	}

	/** Free slots remaining. */
	public remaining(): number {
		return this.free;
	}

	/** Empties the ring. Lanes are not zeroed: stale slots are never readable. */
	public reset(): void {
		this.head = 0;
		this.free = this.capacity;
	}
}
