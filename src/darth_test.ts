// bench.ts - ONE file, no imports. Run:  bun bench.ts   (or: npx tsx bench.ts)
// POWER_OF_TWO below is copied verbatim from your upload.
export class POWER_OF_TWO {
	/*  =============================================================================
	------------- POWER_OF_TWO.publish ------------
	Peak                           923.36 M ops/sec
	Average:                       786.40 M ops/sec
	-----------------------------------------------
    =============================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [POWER_OF_TWO] */
	public readonly capacity: number;
	public readonly mask: number;
	// ── Structure of Arrays (SoA) Event Lanes ──────────────────────────────
	public readonly pids: Int32Array;
	public readonly values: Float64Array;
	public readonly flags: Uint8Array;
	// ── Cursors ────────────────────────────────────────────────────────────
	public writeCursor = 0;
	public readCursor = 0;

	constructor(capacity = 65536) {
		// Enforce power-of-two for bitwise masking
		if ((capacity & (capacity - 1)) !== 0) {
			throw new Error("Disruptor capacity must be a power of two.");
		}
		this.capacity = capacity;
		this.mask = capacity - 1;
		this.pids = new Int32Array(capacity); // Pre-allocate contiguous typed memory blocks (Zero GC churn)
		this.values = new Float64Array(capacity);
		this.flags = new Uint8Array(capacity);
	} // Publishes an event directly into the next ring slot. O(1) time complexity, zero heap allocation, single CPU instruction cycle.
	public publish(pid: number, value: number, flag = 0): boolean {
		// Optional backpressure check: Prevent writer from overlapping reader
		if (this.writeCursor - this.readCursor >= this.capacity) {
			return false;
		} // Ring buffer full
		const index = this.writeCursor & this.mask;
		this.pids[index] = pid; // Write directly to parallel SoA typed array lanes
		this.values[index] = value;
		this.flags[index] = flag;
		this.writeCursor++;
		return true;
	} // Drains and processes the ring buffer in batches using a zero-allocation loop.
	public consume(handler: (pid: number, value: number, flag: number) => void): number {
		const targetWrite = this.writeCursor;
		let currentRead = this.readCursor;
		if (currentRead === targetWrite) {
			return 0;
		} // Nothing to consume
		let processed = 0;
		while (currentRead < targetWrite) {
			const index = currentRead & this.mask; // Execute handler on raw lane data
			handler(this.pids[index], this.values[index], this.flags[index]);
			currentRead++;
			processed++;
		}
		this.readCursor = currentRead;
		return processed;
	} // Resets cursors and ring lanes instantly without reallocating memory.
	public reset(): void {
		this.writeCursor = 0;
		this.readCursor = 0;
		this.pids.fill(0);
		this.values.fill(0);
		this.flags.fill(0);
	}
}

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

const CAP = 65536, N = 8388608, BATCHES = 15;
let sink = 0;
function benchA(mode: string): number {
	const r = new POWER_OF_TWO(CAP);
	let best = 0;
	for (let b = 0; b < BATCHES; b++) {
		const t0 = performance.now();
		if (mode === "full") {
			for (let i = 0; i < N; i++) r.publish(i & 1023, i, 1);
		} else {
			for (let k = 0; k < N / CAP; k++) {
				for (let i = 0; i < CAP; i++) r.publish(i & 1023, i, 1);
				if (mode === "drain") r.consume((p: number) => { sink += p; });
				else r.reset();
			}
		}
		const mops = N / (performance.now() - t0) / 1000;
		if (b >= 3 && mops > best) best = mops; // first 3 batches = JIT warmup, ignored
	}
	return best;
}
function benchB(mode: string): number {
	const r = new DARTH_VADER(CAP);
	let best = 0;
	for (let b = 0; b < BATCHES; b++) {
		const t0 = performance.now();
		if (mode === "full") {
			for (let i = 0; i < N; i++) r.publish(i & 1023, i, 1);
		} else {
			for (let k = 0; k < N / CAP; k++) {
				for (let i = 0; i < CAP; i++) r.publish(i & 1023, i, 1);
				if (mode === "drain") r.consume((p: number) => { sink += p; });
				else r.reset();
			}
		}
		const mops = N / (performance.now() - t0) / 1000;
		if (b >= 3 && mops > best) best = mops; // first 3 batches = JIT warmup, ignored
	}
	return best;
}
console.log("M ops/sec (peak of 12 timed batches; each mode: your POWER_OF_TWO vs DARTH_VADER v2)");
for (const mode of ["full", "reset", "drain"]) {
	const a = benchA(mode);
	const b = benchB(mode);
	console.log(`${mode.padEnd(6)} POWER_OF_TWO ${a.toFixed(1).padStart(8)}   DARTH_VADER ${b.toFixed(1).padStart(8)}   x${(b / a).toFixed(2)}`);
}
if (sink < 0) console.log(sink);
