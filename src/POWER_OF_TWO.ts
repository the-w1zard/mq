class THE_POWER_OF_TWO {
	/*  =============================================================================
     power_of_two_disruptor.ts:
 
     --- DisruptorSoA.editDirect ---
     Peak (Best Batch): 848.46 M ops/sec
     Average:           725.71 M ops/sec
 
     0 pass
     0 fail
     Ran 0 tests across 1 file. [641.00ms]
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
	public handler(handler: (pid: number, value: number, flag: number) => void): number {
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

export class IS_BETTER_THAN_ONE {
	public two: THE_POWER_OF_TWO;
	constructor() {
		this.two = new THE_POWER_OF_TWO();
	}
	public send = () => () => this.two.publish;
	public sub = () => () => this.two.handler;
}








































