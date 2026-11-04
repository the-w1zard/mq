
//                                                                                               IMPORTS
// #region ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// #endregion
//                                                                                   TEST/BENCH OVERVIEW
// #region ═══════════════════════════════════════════════════════════════════════════════════════════════════════
/*  ======================================================================================================
     I did say I only had a couple of them laying around...
     But here are the ones that I said I had missed the first time around in including them, and
     obviously several more.

     Each one is still completely wired up to the bench, so that if you curious and want to play with 
     all you do is literally run:

     bun ./its_on.ts

     There are two tests. The non-bare metal is a standard bench that runs for the defined amount of time
     that you can set within the settings section. This test outputs figures every second right now
     I beleive, showing how many millions of ops/sec, best m/s, avg m/s and cpu &. 
     This is the test you will more than likely be running.

     The second test is a lot more optimzed for achieving a higher score, by removing the in real time
     data output of what the disruptor is doing. Run both tests, and you will be shocked to see just 
     how much it means when your playing with this high of numbers as every op wasted outputting 
     data, could have been used in securing more ops.

     15 disruptors 100% wired up and ready to go, I'll leave the numbers I get here.
     I don't have the most recent of computers, but it was still hand built. If you have a more recent 
     build you should be able to get a higher figure.

     Again all disruptors here are single core, running entirely on the javascript v8 engine.

     If you don't know, I would suggest actually using bun even if you don't have it as it is faster
     than using node or similar runtime.

     There are a couple of recent builds in here that... I actually don't know how they will go...
     Hopefully better... but who the fuck knows.

	 SIDE NOTE: Not ALL of them are working... I must have copied them over wrong or something but
	 I'll come back to this eventually and fix them, but at the very least I provided what I previously
	 promised... and more actually. 

	 Have fun, cheers!
    ============================================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [NEED A DISRUPTOR BRUH?] */

/**          NON-BARE METAL TEST
 POWER_OF_TWO.publish
 sec | M writes/s | best M/s | avg M/s | CPU %
   1 |     620.88 |   620.88 |  620.88 | 104.7
   2 |     723.40 |   723.40 |  672.14 | 100.0
   3 |     740.46 |   740.46 |  694.91 |  98.4
   4 |     727.96 |   740.46 |  703.18 | 103.1
   5 |     739.51 |   740.46 |  710.44 | 100.0
   6 |     725.87 |   740.46 |  713.02 | 100.1
   7 |     732.80 |   740.46 |  715.84 | 100.0
   8 |     743.42 |   743.42 |  719.29 | 100.0
   9 |     736.43 |   743.42 |  721.19 |  96.8
  10 |     743.60 |   743.60 |  723.44 | 100.0
  11 |     740.10 |   743.60 |  724.95 | 100.0
  ---------------------------------------------
  DARTH_REVAN.admitDirect
  sec | M writes/s | best M/s | avg M/s | CPU %
    1 |     789.13 |   789.13 |  789.13 | 101.6
    2 |     568.08 |   789.13 |  678.61 | 103.1
    3 |     595.23 |   789.13 |  650.81 | 100.0
    4 |     605.16 |   789.13 |  639.40 | 100.0
    5 |     612.07 |   789.13 |  633.93 |  95.3
    6 |     587.58 |   789.13 |  626.21 |  96.9
    7 |     635.03 |   789.13 |  627.47 | 100.0
    8 |     634.54 |   789.13 |  628.35 | 100.0
    9 |     617.74 |   789.13 |  627.17 |  98.5
   10 |     629.64 |   789.13 |  627.42 |  98.4
   11 |     628.11 |   789.13 |  627.48 | 100.0
  ---------------------------------------------
  DARTH_MAUL.publish
  sec | M writes/s | best M/s | avg M/s | CPU %
    1 |     613.75 |   613.75 |  613.75 | 103.1
    2 |     542.69 |   613.75 |  578.22 | 100.0
    3 |     554.78 |   613.75 |  570.41 | 100.0
    4 |     542.35 |   613.75 |  563.39 | 101.6
    5 |     549.54 |   613.75 |  560.62 | 100.0
    6 |     513.68 |   613.75 |  552.80 |  98.4
    7 |     539.52 |   613.75 |  550.90 | 100.0
    8 |     549.39 |   613.75 |  550.71 | 100.0
    9 |     551.67 |   613.75 |  550.82 |  98.4
   10 |     544.85 |   613.75 |  550.22 |  98.5
   11 |     549.64 |   613.75 |  550.17 | 100.0
  ---------------------------------------------
   GOL_THE_WITHER_KING.publish
   sec | M writes/s | best M/s | avg M/s | CPU %
     1 |     628.16 |   628.16 |  628.16 | 100.0
     2 |     545.46 |   628.16 |  586.81 | 101.6
     3 |     556.58 |   628.16 |  576.74 | 100.0
     4 |     544.79 |   628.16 |  568.75 | 101.5
     5 |     553.58 |   628.16 |  565.72 | 100.0
     6 |     554.11 |   628.16 |  563.78 | 100.0
     7 |     553.52 |   628.16 |  562.31 | 100.0
     8 |     553.38 |   628.16 |  561.20 | 100.0
     9 |     512.82 |   628.16 |  555.82 |  98.5
    10 |     548.65 |   628.16 |  555.10 | 100.0
    11 |     542.73 |   628.16 |  553.98 | 100.0
  ---------------------------------------------
  DARTH_CALDOTH.admit
  sec | M writes/s | best M/s | avg M/s | CPU %
    1 |      39.01 |    39.01 |   39.01 | 105.6
    2 |      37.87 |    39.01 |   38.37 | 101.2
    3 |      37.60 |    39.01 |   38.11 | 100.9
    5 |      38.62 |    39.01 |   38.28 |  99.3
    7 |      34.70 |    39.01 |   37.35 | 101.0
    8 |       2.64 |    39.01 |   33.03 | 117.7
    9 |       3.26 |    39.01 |   29.76 |  98.7
   10 |       2.18 |    39.01 |   26.82 |  99.4
   11 |       3.92 |    39.01 |   24.76 | 102.8
   ---------------------------------------------
  DARTH_PLAGUEIS.publish
  sec | M writes/s | best M/s | avg M/s | CPU %
    1 |       0.36 |     0.36 |    0.36 | 103.8
    2 |       0.39 |     0.39 |    0.38 | 104.7
    3 |       0.39 |     0.39 |    0.38 | 105.6
    4 |       0.39 |     0.39 |    0.38 | 104.2
    5 |       0.39 |     0.39 |    0.38 |  98.9
    6 |       0.39 |     0.39 |    0.38 | 105.8
    7 |       0.39 |     0.39 |    0.38 |  98.5
    8 |       0.39 |     0.39 |    0.38 | 101.6
    9 |       0.38 |     0.39 |    0.38 | 100.7
   10 |       0.39 |     0.39 |    0.38 |  99.8
   11 |       0.38 |     0.39 |    0.38 | 109.2
   ---------------------------------------------
   DARTH_NIHILIS.emit
	sec | M writes/s | best M/s | avg M/s | CPU %
	1 |     680.68 |   680.68 |  680.68 | 106.3
	2 |     725.06 |   725.06 |  702.87 | 101.5
	3 |     741.71 |   741.71 |  715.83 |  98.3
	4 |     710.49 |   741.71 |  714.49 | 104.7
	5 |     726.33 |   741.71 |  716.86 |  98.5
	6 |     706.70 |   741.71 |  715.16 |  98.4
	7 |     718.04 |   741.71 |  715.57 | 100.0
	8 |     746.12 |   746.12 |  719.39 | 100.0
	9 |     759.92 |   759.92 |  723.90 |  98.4
	10 |     742.43 |   759.92 |  725.75 |  98.5
	11 |     734.42 |   759.92 |  726.54 | 107.8
	---------------------------------------------
	*/

const BATCH_SIZE = 500_000;
const TOTAL_BATCHES = 500; 
const CAPACITY = 65_536 * 4;
// 1024;
// 65_536
// 131_072
/**             BARE METAL TEST
 First figure is what its highest peak amounted up to.

 This is a 'see who crosses the line faster' type of bench. If your testing a slower system, I 
 would suggest turning these numbers down. If you are running a disruptor doing 350-450 and
 above, I would leave the numbers at 500_000 for batch size and 500 for total batches.

 I honestly, do not know why... but for disruptors it would seem that this is a number that
 they really like. Weirdly, it is also one of the more consistant number pairs I came across
 as well, and I played with these numbers... for a long time since I couldn't find any ryme
 or reason as to why they would hit the numbers that they did.
 --------------------------------------- POWER_OF_TWO.publish --------------------------------------
 Peak                                     923.36 M ops/sec (2.032 billion ops/sec different machine)
 Average:                                                                           786.40 M ops/sec
 ---------------------------------------------------------------------------------------------------
 ------------------------------------- DARTH_REVAN.admitDirect -------------------------------------
 Peak                                                                               923.19 M ops/sec
 Average:                                                                           787.83 M ops/sec
 ---------------------------------------------------------------------------------------------------
 --------------------------------------- DARTH_VADER.publish ---------------------------------------
 Peak                                    1230.92 M ops/sec (2.016 billion ops/sec different machine)
 Average:                                                                           967.84 M ops/sec
 ---------------------------------------------------------------------------------------------------
 --------------------------------------- VIOLET_HOOD.publish ---------------------------------------
 Peak                                                                               875.04 M ops/sec
 Average:                                                                           749.78 M ops/sec
 ---------------------------------------------------------------------------------------------------
 --------------------------------------- DARTH_MAUL.publish ----------------------------------------
 Peak                                                                               738.66 M ops/sec
 Average:                                                                           635.41 M ops/sec
 ---------------------------------------------------------------------------------------------------
 ---------------------------------------- HADRON_APEX.write ----------------------------------------
 Peak                                                                               678.70 M ops/sec
 Average:                                                                           569.71 M ops/sec
 ---------------------------------------------------------------------------------------------------
 ----------------------------------- GOL_THE_WITHER_KING.publish -----------------------------------
 Peak                                                                               738.55 M ops/sec
 Average:                                                                           639.58 M ops/sec
 ---------------------------------------------------------------------------------------------------
 --------------------------------------- DARTH_CALDOTH.admit ---------------------------------------
 Peak                                                                               103.93 M ops/sec
 Average:                                                                             6.86 M ops/sec
 ---------------------------------------------------------------------------------------------------
 ------------------------------------- DARTH_PLAGUEIS.publish --------------------------------------
 Peak                                                                                 0.00 M ops/sec
 Average:                                                                             0.00 M ops/sec
 ** Did not run this test as you can see from the times post in the other test, it just 
 isnt fast enough for as this is a race to the finish line rather than a timed trial.
 ---------------------------------------------------------------------------------------------------
 -------------------------------------- DARTH_SIDIOUS.publish --------------------------------------
 Peak                                                                                71.27 M ops/sec
 Average:                                                                            62.63 M ops/sec
 ---------------------------------------------------------------------------------------------------
*/

const RUN_BARE_METAL_CPU_TEST = true;
const FIGHT: fighter = "DARTH_VADER";


type fighter = 
| "POWER_OF_TWO" 
| "DARTH_RAVEN" 
| "GOL_THE_WITHER_KING"
| "DARTH_MAUL" 
| "DARTH_BANE" 
| "DARTH_ANDEDDU" // x
| "FELKOR" 
| "DARTH_NIHILIS" 
| "DARTH_ATRIUS" // X
| "DARTH_CALDOTH"
| "DARTH_DESOLOUS" // X
| "DARTH_PLAGUEIS"
| "DARTH_REVAN" 
| "DARTH_SIDIOUS"
| "DARTH_TALON"
| "DARTH_VADER"
| "VIOLET_HOOD"
| "HADRON_APEX"
| "EXAR_KUN" // X

/*  ======================================================================================================
	 Didn't think my pc was that old... 
	 Same bench ran on another machine...
	 POWER OF TWO: 2.032 billion
	 DARTH VADER: 2.016 billion
	 Apparently I need to upgrade my computer...
	 The highest I had gotten vader to on my node was... 
	 --- DARTH_VADER.publish ---
	 Peak                  1230.92 M ops/sec
	 Average:               967.84 M ops/sec
	 At a capacity of 131_072, power of two actually did worse at that capacity.

	 The jump is probably due to a combination of l1, memory, and the cpu, all of which were newer and 
	 clocking higher. If your rocking a turn of the year custom built, water cooled pc... your numbers 
	 will be higher, I am curious to how much higher because personally... 
	 I could never justify buying something like that... Buying higher tier, last gen parts... have 
	 always been the path I go. It lasts... 8 yrs+ at a fraction of the cost while running everything 
	 at max... but then when it comes to tests like these... obviously it shows.

	 One last thing... FOR MY MACHINE anyways, it seems 1230.92 is its ceiling. Vader got that 6 times 
	 and I've never seen a disruptor do that over that many tests. Either thats the ceiling for my node
	 OR... vader is fucking extremely consistent.
    =============================================================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [NOTES] */

// #endregion
//                                                                                THE POWER OF TWO - SOA
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const TRACER_PID = 0;
const OP = {
	READ: 0,
	WRITE: 1,
	DELETE: 2,
	EFFECT: 3,
	COMPACT: 4,
	NONE: 5,
	EDIT: 6,
	PUT: 7,
	SEND: 11,
	SUB: 12,
	DUPLEX: 13,
	STREAM: 14,
	DRC: 15,
	TRANSFORM: 16,
} as const;
class POWER_OF_TWO {
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
// #endregion
//                                                                                           DARTH_RAVEN
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
class DARTH_RAVEN {
	/*  =============================================================================
	----------- DARTH_REVAN.admitDirect -----------
	Peak                           923.19 M ops/sec
	Average:                       787.83 M ops/sec
	-----------------------------------------------
    =============================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [POWER_OF_TWO] */
	private readonly capacity: number;
	private readonly lane: Int32Array;
	private readonly ops: Uint8Array;
	public readonly posX: Float32Array;
	public readonly posY: Float32Array;
	public readonly val: Int32Array;
	private readonly freePids: Int32Array;
	private freeTail = 0;
	private laneLen = 0;

	constructor(capacity = 65536) {
		this.capacity = capacity;
		this.lane = new Int32Array(capacity).fill(-1);
		this.ops = new Uint8Array(capacity);
		this.posX = new Float32Array(capacity);
		this.posY = new Float32Array(capacity);
		this.val = new Int32Array(capacity);
		this.freePids = new Int32Array(capacity);

		for (let i = 1; i < capacity; i++) {
			this.freePids[this.freeTail++] = i;
		}

		this.lane[0] = TRACER_PID;
		this.val[TRACER_PID] = 0;
		this.ops[TRACER_PID] = OP.NONE;
		this.laneLen = 1;
	}

	public admitDirect(x: number, y: number, value: number, pid: number): void {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.PUT;
		this.lane[this.laneLen++] = pid;
	}

	private reclaimPid(pid: number): void {
		this.posX[pid] = 0;
		this.posY[pid] = 0;
		this.val[pid] = 0;
		this.ops[pid] = OP.NONE;
		this.freePids[this.freeTail] = pid;
		this.freeTail = (this.freeTail + 1) % this.capacity;
	}

	public pass(): void {
		const len = this.laneLen;
		let writeIdx = 0;
		let i = 0;
		const unrolledLimit = len - (len % 4);

		for (; i < unrolledLimit; i += 4) {
			let pid = this.lane[i];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}

			pid = this.lane[i + 1];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}

			pid = this.lane[i + 2];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}

			pid = this.lane[i + 3];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}
		}

		for (; i < len; i++) {
			const pid = this.lane[i];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}
		}

		this.laneLen = writeIdx;
	}

	get length(): number {
		return this.laneLen;
	}
}
// #endregion
//                                                                                            DARTH_MAUL 
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
class DARTH_MAUL {
	/*  =============================================================================
	----------- DARTH_REVAN.admitDirect -----------
	Peak                           923.19 M ops/sec
	Average:                       787.83 M ops/sec
	-----------------------------------------------
    =============================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [POWER_OF_TWO] */
// Peak / Bare-Metal Hardware Layout Optimization
	public readonly capacity: N;
	public readonly memory: ArrayBuffer;

	// Contiguous SoA Lanes backed by a single unified memory slab
	public readonly posX: Float32Array;
	public readonly posY: Float32Array;
	public readonly val: Int32Array;
	public readonly ops: Uint8Array;

	// Active Index Tracking
	public readonly lane: Int32Array;
	private laneLen = 0;

	constructor(capacity = 65536) {
		this.capacity = capacity;

		// 16 bytes per entry: Float32(4) + Float32(4) + Int32(4) + Uint8(1) + 3 bytes padding for 16-byte alignment
		const BYTES_PER_RECORD = 16;
		this.memory = new ArrayBuffer(capacity * BYTES_PER_RECORD);

		// Slice parallel columns from the exact same contiguous memory arena
		this.posX = new Float32Array(this.memory, 0, capacity);
		this.posY = new Float32Array(this.memory, capacity * 4, capacity); // offset 4 bytes * capacity
		this.val = new Int32Array(this.memory, capacity * 8, capacity); // offset 8 bytes * capacity
		this.ops = new Uint8Array(this.memory, capacity * 12, capacity); // offset 12 bytes * capacity

		this.lane = new Int32Array(capacity).fill(-1);

		// Initialize Tracer PID
		this.lane[0] = TRACER_PID;
		this.val[TRACER_PID] = 0;
		this.ops[TRACER_PID] = OP.NONE;
		this.laneLen = 1;
	}

	// Inlined direct mutation without method call overhead penalties in hot paths
	// @__INLINE__ // Conceptual directive for custom compiler/bundler passes
	public write(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.WRITE;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public edit(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.EDIT;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	// Ultra-optimized pass loop with zero branch prediction degradation on hot paths
	public pass(): V {
		const len = this.laneLen;
		const lane = this.lane;
		const ops = this.ops;
		const vals = this.val;

		let writeIdx = 0;
		let i = 0;
		const unrolledLimit = len - (len % 4);

		// 4-Way Unrolled Execution Pipeline
		for (; i < unrolledLimit; i += 4) {
			let p0 = lane[i];
			let p1 = lane[i + 1];
			let p2 = lane[i + 2];
			let p3 = lane[i + 3];

			// Item 0
			if (p0 === TRACER_PID) {
				vals[TRACER_PID]++;
				lane[writeIdx++] = p0;
			} else if (ops[p0] !== OP.DELETE) {
				ops[p0] = OP.NONE;
				lane[writeIdx++] = p0;
			}

			// Item 1
			if (p1 === TRACER_PID) {
				vals[TRACER_PID]++;
				lane[writeIdx++] = p1;
			} else if (ops[p1] !== OP.DELETE) {
				ops[p1] = OP.NONE;
				lane[writeIdx++] = p1;
			}

			// Item 2
			if (p2 === TRACER_PID) {
				vals[TRACER_PID]++;
				lane[writeIdx++] = p2;
			} else if (ops[p2] !== OP.DELETE) {
				ops[p2] = OP.NONE;
				lane[writeIdx++] = p2;
			}

			// Item 3
			if (p3 === TRACER_PID) {
				vals[TRACER_PID]++;
				lane[writeIdx++] = p3;
			} else if (ops[p3] !== OP.DELETE) {
				ops[p3] = OP.NONE;
				lane[writeIdx++] = p3;
			}
		}

		// Tail cleanup loop
		for (; i < len; i++) {
			const pid = lane[i];
			if (pid === TRACER_PID) {
				vals[TRACER_PID]++;
				lane[writeIdx++] = pid;
			} else if (ops[pid] !== OP.DELETE) {
				ops[pid] = OP.NONE;
				lane[writeIdx++] = pid;
			}
		}

		this.laneLen = writeIdx;
	}

	public get tick(): N {
		return this.val[TRACER_PID];
	}
}
// #endregion
//                                                                                   GOL THE WITHER KING 
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
class GOL_THE_WITHER_KING {
	/*  =============================================================================
	--------- GOL_THE_WITHER_KING.publish ---------
	Peak                           738.55 M ops/sec
	Average:                       639.58 M ops/sec
	-----------------------------------------------
    =============================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [POWER_OF_TWO] */
	private readonly capacity: N;
	private readonly lane: I32;
	private readonly ops: U8;
	public readonly posX: F32;
	public readonly posY: F32;
	public readonly val: I32;
	private readonly freePids: I32;
	private freeHead = 0;
	private freeTail = 0;
	private laneLen = 0;
	constructor(capacity?: number) {
		this.capacity = capacity !== undefined ? capacity : 1024;

		this.lane = new Int32Array(this.capacity).fill(-1);
		this.ops = new Uint8Array(this.capacity);
		this.posX = new Float32Array(this.capacity);
		this.posY = new Float32Array(this.capacity);
		this.val = new Int32Array(this.capacity);
		this.freePids = new Int32Array(this.capacity);

		for (let i = 1; i < this.capacity; i++) {
			this.freePids[this.freeTail++] = i;
		}

		this.lane[0] = TRACER_PID;
		this.val[TRACER_PID] = 0;
		this.ops[TRACER_PID] = OP.NONE;
		this.laneLen = 1;
	}

	public check_size_and_edit(x: N, y: N, pid: Pid, value: N) {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.EDIT;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public getX(pid: N): number {
		return this.posX[pid];
	}
	public getY(pid: N): number {
		return this.posY[pid];
	}
	public getPosition(pid: N): { x: number; y: number } {
		return { x: this.posX[pid], y: this.posY[pid] };
	}

	// --- Wired Operations (Minimum Required Set) ---

	public write(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.WRITE;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public create(x: N, y: N, value: N, pid: Pid): V {
		this.write(x, y, value, pid);
	}

	public edit(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.EDIT;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public read(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.READ;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public delete(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.DELETE;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public effect(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.EFFECT;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public compact(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.COMPACT;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public none(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.NONE;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public send(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.SEND;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public sub(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.SUB;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public duplex(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.DUPLEX;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public stream(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.STREAM;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	public drc(x: N, y: N, value: N, pid: Pid): V {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = OP.DRC;
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}

	// --- Pass Loop ---

	public pass(): V {
		const len = this.laneLen;
		let writeIdx = 0;
		let i = 0;
		const unrolledLimit = len - (len % 4);

		for (; i < unrolledLimit; i += 4) {
			let pid = this.lane[i];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}

			pid = this.lane[i + 1];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}

			pid = this.lane[i + 2];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}

			pid = this.lane[i + 3];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}
		}

		for (; i < len; i++) {
			const pid = this.lane[i];
			if (pid === TRACER_PID) {
				this.val[TRACER_PID]++;
				this.lane[writeIdx++] = pid;
			} else if (this.ops[pid] === OP.DELETE) {
				this.reclaimPid(pid);
			} else {
				this.ops[pid] = OP.NONE;
				this.lane[writeIdx++] = pid;
			}
		}

		this.laneLen = writeIdx;
	}

	public get tick(): N {
		return this.val[TRACER_PID];
	}
	public get length(): N {
		return this.laneLen;
	}

	public getLoadFactor(): N {
		const activeCount = Math.max(0, this.laneLen - 1);
		return activeCount / (this.capacity - 1);
	}

	public waitFor() {}
	public sweep_expired() {}
	public on_change() {}
	private reclaimPid(pid: N) {}
}
// #endregion
//                                                                                           DARTH_VADER 
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
// #endregion
//                                                                                           VIOLET_HOOD  
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════

const TRACER_PIDDD = 0;

class VIOLET_HOOD {
  public readonly capacity: number;
  public readonly mask: number;
  public readonly memory: ArrayBuffer;

  // SoA lanes backed by one slab, 16 bytes per record
  public readonly posX: Float32Array;
  public readonly posY: Float32Array;
  public readonly val: Int32Array;
  public readonly ops: Uint8Array;

  // Ring cursors (for publish/consume path)
  public writeCursor = 0;
  public readCursor = 0;

  // Active lane (for pass path)
  public readonly lane: Int32Array;
  private laneLen = 0;
  private dirty = false;   // set on any DELETE; controls compaction-skip

  constructor(capacity = 65536) {
    if ((capacity & (capacity - 1)) !== 0) {
      throw new Error("Disruptor capacity must be a power of two.");
    }
    this.capacity = capacity;
    this.mask = capacity - 1;

    const BYTES_PER_RECORD = 16;
    this.memory = new ArrayBuffer(capacity * BYTES_PER_RECORD);

    // 16-byte record layout:
    //   [0..4)   posX  float32
    //   [4..8)   posY  float32
    //   [8..12)  val   int32
    //   [12]     ops   uint8
    //   [13..16) pad
    // BUT: typed array views need aligned offsets, so we can't interleave
    // per-record fields into one view. Instead we lay out by column, but
    // keep the columns contiguous in one slab so the allocator can place
    // them in the same regions.
    this.posX = new Float32Array(this.memory, 0, capacity);
    this.posY = new Float32Array(this.memory, capacity * 4, capacity);
    this.val  = new Int32Array  (this.memory, capacity * 8, capacity);
    this.ops  = new Uint8Array  (this.memory, capacity * 12, capacity);

    // Active lane: pids of live atoms. Tracer is lane[0].
    this.lane = new Int32Array(capacity);
    this.lane[0] = TRACER_PIDDD;
    this.val[TRACER_PIDDD] = 0;
    this.ops[TRACER_PIDDD] = OP.NONE;
    this.laneLen = 1;
  }

  // ── Ring path (publish / consume) ───────────────────────────────────────

  public publish(pid: number, value: number, flag = 0): boolean {
    if (this.writeCursor - this.readCursor >= this.capacity) return false;
    const index = this.writeCursor & this.mask;
    this.posX[index] = pid;    // reuse posX as the ring's pid lane
    this.val[index]  = value;
    this.ops[index]  = flag;
    this.writeCursor++;
    return true;
  }

  // ── Lane path (write / pass) ────────────────────────────────────────────

  // write: 4 stores, 1 append. No branches in the hot path.
  public write(x: number, y: number, value: number, pid: number): void {
    this.posX[pid] = x;
    this.posY[pid] = y;
    this.val[pid]  = value;
    this.ops[pid]  = OP.WRITE;
    if (this.laneLen < this.capacity) {
      this.lane[this.laneLen++] = pid;
    }
  }

  public edit(x: number, y: number, value: number, pid: number): void {
    this.posX[pid] = x;
    this.posY[pid] = y;
    this.val[pid]  = value;
    this.ops[pid]  = OP.EDIT;
    if (this.laneLen < this.capacity) {
      this.lane[this.laneLen++] = pid;
    }
  }

  public delete(pid: number): void {
    this.ops[pid] = OP.DELETE;
    this.dirty = true;
    // Append the pid so pass() sees the delete on the next walk.
    if (this.laneLen < this.capacity) {
      this.lane[this.laneLen++] = pid;
    }
  }

  // ── The pass ────────────────────────────────────────────────────────────

  public pass(): void {
    const lane = this.lane;
    const ops  = this.ops;
    const vals = this.val;
    const len  = this.laneLen;

    // Tracer is always lane[0], always survives, always bumps. Hoist it.
    vals[TRACER_PIDDD]++;

    // If nothing was deleted since last pass, the lane is already compact.
    // We still need to walk it to clear `ops[pid] = NONE`, but we don't
    // need to write back to the lane.
    if (!this.dirty) {
      let i = 1; // skip tracer
      const unrolledLimit = len - ((len - 1) % 8);
      for (; i < unrolledLimit; i += 8) {
        // Load all 8 pids first — independent loads issue in parallel.
        const p0 = lane[i],     p1 = lane[i + 1], p2 = lane[i + 2], p3 = lane[i + 3];
        const p4 = lane[i + 4], p5 = lane[i + 5], p6 = lane[i + 6], p7 = lane[i + 7];
        // Now issue the ops loads — also independent.
        ops[p0] = OP.NONE; ops[p1] = OP.NONE; ops[p2] = OP.NONE; ops[p3] = OP.NONE;
        ops[p4] = OP.NONE; ops[p5] = OP.NONE; ops[p6] = OP.NONE; ops[p7] = OP.NONE;
      }
      for (; i < len; i++) ops[lane[i]] = OP.NONE;
      // laneLen unchanged (no deletions, no compaction needed)
      return;
    }

    // Dirty path: walk and compact.
    let writeIdx = 1; // tracer stays at [0]
    let i = 1;
    const unrolledLimit = len - ((len - 1) % 8);

    for (; i < unrolledLimit; i += 8) {
      const p0 = lane[i],     p1 = lane[i + 1], p2 = lane[i + 2], p3 = lane[i + 3];
      const p4 = lane[i + 4], p5 = lane[i + 5], p6 = lane[i + 6], p7 = lane[i + 7];

      // p0
      if (ops[p0] !== OP.DELETE) { ops[p0] = OP.NONE; lane[writeIdx++] = p0; }
      // p1
      if (ops[p1] !== OP.DELETE) { ops[p1] = OP.NONE; lane[writeIdx++] = p1; }
      // p2
      if (ops[p2] !== OP.DELETE) { ops[p2] = OP.NONE; lane[writeIdx++] = p2; }
      // p3
      if (ops[p3] !== OP.DELETE) { ops[p3] = OP.NONE; lane[writeIdx++] = p3; }
      // p4
      if (ops[p4] !== OP.DELETE) { ops[p4] = OP.NONE; lane[writeIdx++] = p4; }
      // p5
      if (ops[p5] !== OP.DELETE) { ops[p5] = OP.NONE; lane[writeIdx++] = p5; }
      // p6
      if (ops[p6] !== OP.DELETE) { ops[p6] = OP.NONE; lane[writeIdx++] = p6; }
      // p7
      if (ops[p7] !== OP.DELETE) { ops[p7] = OP.NONE; lane[writeIdx++] = p7; }
    }

    for (; i < len; i++) {
      const pid = lane[i];
      if (ops[pid] !== OP.DELETE) { ops[pid] = OP.NONE; lane[writeIdx++] = pid; }
    }

    this.laneLen = writeIdx;
    this.dirty = false;
  }

  public get tick(): number { return this.val[TRACER_PIDDD]; }
  public get length(): number { return this.laneLen; }
}
// #endregion
//                                                                                           HADRON_APEX
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export class HADRON_APEX {
    public readonly capacity: number;
    public readonly memory: ArrayBuffer;
    
    // Contiguous SoA Lanes backed by a single unified 16-byte aligned memory slab
    public readonly posX: Float32Array;
    public readonly posY: Float32Array;
    public readonly val: Int32Array;
    public readonly ops: Uint8Array;

    // Active Index Tracking Lane
    public readonly lane: Int32Array;
    private laneLen = 0;

    constructor(capacity = 65536) {
        this.capacity = capacity;
        
        // 16 bytes per record: Float32(4) + Float32(4) + Int32(4) + Uint8(1) + 3 bytes padding
        const BYTES_PER_RECORD = 16;
        this.memory = new ArrayBuffer(capacity * BYTES_PER_RECORD);

        this.posX = new Float32Array(this.memory, 0, capacity);
        this.posY = new Float32Array(this.memory, capacity * 4, capacity);
        this.val = new Int32Array(this.memory, capacity * 8, capacity);
        this.ops = new Uint8Array(this.memory, capacity * 12, capacity);

        this.lane = new Int32Array(capacity).fill(-1);

        // Initialize Tracer PID at index 0
        this.lane[0] = TRACER_PID;
        this.val[TRACER_PID] = 0;
        this.ops[TRACER_PID] = OP.NONE;
        this.laneLen = 1;
    }

    // Branchless direct write/edit injection
    public write(x: number, y: number, value: number, pid: number): void {
        this.posX[pid] = x;
        this.posY[pid] = y;
        this.val[pid] = value;
        this.ops[pid] = OP.WRITE;
        const len = this.laneLen;
        if (len < this.capacity) {
            this.lane[len] = pid;
            this.laneLen = len + 1;
        }
    }

    public edit(x: number, y: number, value: number, pid: number): void {
        this.write(x, y, value, pid);
    }

    // Fully unrolled, 100% branchless pass loop utilizing arithmetic masks
    public pass(): void {
        const len = this.laneLen;
        const lane = this.lane;
        const ops = this.ops;
        const vals = this.val;

        let writeIdx = 0;
        let i = 0;
        const unrolledLimit = len - (len % 4);

        for (; i < unrolledLimit; i += 4) {
            const p0 = lane[i];
            const p1 = lane[i + 1];
            const p2 = lane[i + 2];
            const p3 = lane[i + 3];

            // --- Item 0 ---
            const isTracer0 = ((p0 | 0) === TRACER_PID) as unknown as number;
            vals[TRACER_PID] += isTracer0;
            const op0 = ops[p0];
            const keep0 = (isTracer0 | (op0 ^ OP.DELETE ? 1 : 0)) & (p0 >> 31 ^ 1);
            ops[p0] = (op0 * (1 - isTracer0)) + (OP.NONE * isTracer0); // branchless op reset for non-tracers
            lane[writeIdx] = p0;
            writeIdx += keep0;

            // --- Item 1 ---
            const isTracer1 = ((p1 | 0) === TRACER_PID) as unknown as number;
            vals[TRACER_PID] += isTracer1;
            const op1 = ops[p1];
            const keep1 = (isTracer1 | (op1 ^ OP.DELETE ? 1 : 0)) & (p1 >> 31 ^ 1);
            ops[p1] = (op1 * (1 - isTracer1)) + (OP.NONE * isTracer1);
            lane[writeIdx] = p1;
            writeIdx += keep1;

            // --- Item 2 ---
            const isTracer2 = ((p2 | 0) === TRACER_PID) as unknown as number;
            vals[TRACER_PID] += isTracer2;
            const op2 = ops[p2];
            const keep2 = (isTracer2 | (op2 ^ OP.DELETE ? 1 : 0)) & (p2 >> 31 ^ 1);
            ops[p2] = (op2 * (1 - isTracer2)) + (OP.NONE * isTracer2);
            lane[writeIdx] = p2;
            writeIdx += keep2;

            // --- Item 3 ---
            const isTracer3 = ((p3 | 0) === TRACER_PID) as unknown as number;
            vals[TRACER_PID] += isTracer3;
            const op3 = ops[p3];
            const keep3 = (isTracer3 | (op3 ^ OP.DELETE ? 1 : 0)) & (p3 >> 31 ^ 1);
            ops[p3] = (op3 * (1 - isTracer3)) + (OP.NONE * isTracer3);
            lane[writeIdx] = p3;
            writeIdx += keep3;
        }

        // Tail cleanup loop
        for (; i < len; i++) {
            const pid = lane[i];
            const isTracer = ((pid | 0) === TRACER_PID) as unknown as number;
            vals[TRACER_PID] += isTracer;
            const op = ops[pid];
            const keep = (isTracer | (op ^ OP.DELETE ? 1 : 0)) & (pid >> 31 ^ 1);
            ops[pid] = (op * (1 - isTracer)) + (OP.NONE * isTracer);
            lane[writeIdx] = pid;
            writeIdx += keep;
        }

        this.laneLen = writeIdx;
    }

    public get tick(): number {
        return this.val[TRACER_PID];
    }

    public get length(): number {
        return this.laneLen;
    }
}
// #endregion
//                                                                                         DARTH ANDEDDU
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
class DARTH_ANDEDDU {
    public memory!: WebAssembly.Memory;
    private passLoop!: (len: number, tracerPid: number) => void;
    public lane!: Int32Array;
    public posX!: Float32Array;
    public laneLen = 0;

    constructor(public readonly capacity = 65536) {}

    public async init() {
        // Pre-compiled binary representation of your WAT passLoop module
		const wasmBytes = new Uint8Array([
			0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
		
			0x01, 0x06, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x00,
		
			0x03, 0x02, 0x01, 0x00,
		
			0x05, 0x03, 0x01, 0x00, 0x01,
		
			0x07, 0x15, 0x02,
			0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x02, 0x00,
			0x08, 0x70, 0x61, 0x73, 0x73, 0x4c, 0x6f, 0x6f, 0x70, 0x00, 0x00,
		
			0x0a, 0x31, 0x01, 0x2f,
			0x02, 0x7f, 0x7f,
		
			0x41, 0x00, 0x21, 0x02,
			0x02, 0x40,
			0x03, 0x40,
			0x20, 0x02, 0x20, 0x00, 0x4a, 0x0d, 0x01,
			0x20, 0x02, 0x41, 0x02, 0x7c, 0x28, 0x02, 0x00, 0x21, 0x03,
			0x20, 0x03, 0x20, 0x01, 0x46, 0x04, 0x40, 0x0b,
			0x20, 0x02, 0x41, 0x01, 0x6a, 0x21, 0x02,
			0x0c, 0x00,
			0x0b,
			0x0b,
			0x0b
		]);

        const module = await WebAssembly.compile(wasmBytes);
        const instance = await WebAssembly.instantiate(module, {});

        this.memory = instance.exports.memory as WebAssembly.Memory;
        this.passLoop = instance.exports.passLoop as (len: number, tracerPid: number) => void;

        const buffer = this.memory.buffer;
        this.lane = new Int32Array(buffer, 0, this.capacity);
        this.posX = new Float32Array(buffer, this.capacity * 4, this.capacity);
    }

    public tick(tracerPid: number) {
        this.passLoop(this.laneLen, tracerPid);
    }
}
// #endregion
//                                                                                     DARTH_BANE - WASM
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
class DARTH_BANE {
	public readonly capacity: number;
	public memory!: WebAssembly.Memory;
	private instance!: WebAssembly.Instance;
	private passLoop!: (len: number, tracerPid: number) => void;

	// Direct TypedArray views pointing straight into Wasm linear memory
	public posX!: Float32Array;
	public posY!: Float32Array;
	public val!: Int32Array;
	public ops!: Uint8Array;
	public lane!: Int32Array;
	public laneLen = 0;
	constructor(capacity = 65536) {
		if ((capacity & (capacity - 1)) !== 0) {
			throw new Error("Capacity must be a power of two.");
		}
		this.capacity = capacity;
	}
	public async init1() {
		// Minimal valid Wasm binary:
		// - Defines 1 memory page (64KB, expandable) and exports it as "memory"
		// - Exports a function "passLoop(len, tracerPid)"
		// Bytecode breakdown for a minimal valid module with memory + empty export function:
		const wasmBytes = new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, // Magic: \0asm
            0x01, 0x00, 0x00, 0x00, // Version: 1
            
            // Type section (ID: 1)
            0x01,                   // Section ID 1
            0x06,                   // Payload length: 6 bytes
            0x01,                   // 1 type entry
            0x60,                   // Func type form
            0x02,                   // 2 parameters
            0x7f, 0x7f,             // i32, i32
            0x00,                   // 0 return values
            
            // Function section (ID: 3)
            0x03,                   // Section ID 3
            0x02,                   // Payload length: 2 bytes
            0x01,                   // 1 function declaration
            0x00,                   // Type index 0
            
            // Memory section (ID: 5)
            0x05,                   // Section ID 5
            0x03,                   // Payload length: 3 bytes
            0x01,                   // 1 memory entry
            0x00,                   // Flags: no maximum
            0x01,                   // Initial pages: 1
            
            // Export section (ID: 7)
            0x07,                   // Section ID 7
            0x15,                   // Payload length: 21 bytes
            0x02,                   // 2 export entries
            
            // Export 0: "memory" (6 chars)
            0x06,                   // Name length: 6
            0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, // "memory"
            0x02,                   // Export kind: Memory (2)
            0x00,                   // Memory index: 0
            
            // Export 1: "passLoop" (8 chars)
            0x08,                   // Name length: 8
            0x70, 0x61, 0x73, 0x73, 0x4c, 0x6f, 0x6f, 0x70, // "passLoop"
            0x00,                   // Export kind: Function (0)
            0x00,                   // Function index: 0
            
			// Code section (ID: 10)
			0x0a,       // Section ID 10
			0x04,       // Payload length: 4 bytes
			0x01,       // 1 code body
			0x02,       // Body size: 2 bytes
			0x00,       // Local count: 0
			0x0b        // end
        ]);

		const module = await WebAssembly.compile(wasmBytes);
		this.instance = await WebAssembly.instantiate(module, {});

		// Grab the linear memory exported by Wasm
		this.memory = this.instance.exports.memory as WebAssembly.Memory;
		this.passLoop = this.instance.exports.passLoop as (len: number, tracerPid: number) => void;

		// Map TypedArrays directly over Wasm's linear memory buffer (Zero-Copy)
		const buffer = this.memory.buffer;
		const cap = this.capacity;

		// Layout offsets in linear memory:
		// lane: Int32Array -> cap * 4 bytes
		// posX: Float32Array -> cap * 4 bytes
		// posY: Float32Array -> cap * 4 bytes
		// val: Int32Array -> cap * 4 bytes
		// ops: Uint8Array -> cap * 1 byte

		let offset = 0;
		this.lane = new Int32Array(buffer, offset, cap);
		offset += cap * 4;
		this.posX = new Float32Array(buffer, offset, cap);
		offset += cap * 4;
		this.posY = new Float32Array(buffer, offset, cap);
		offset += cap * 4;
		this.val = new Int32Array(buffer, offset, cap);
		offset += cap * 4;
		this.ops = new Uint8Array(buffer, offset, cap);
		offset += cap * 1;

		// Ensure Wasm memory size can fit our layout (1 page = 64KB, expand if capacity is large)
		const requiredBytes = offset;
		const currentBytes = buffer.byteLength;
		if (requiredBytes > currentBytes) {
			const pagesNeeded = Math.ceil((requiredBytes - currentBytes) / 65536);
			this.memory.grow(pagesNeeded);
		}
	}
	public async init() {
		const wasmBytes = new Uint8Array([
			0x00, 0x61, 0x73, 0x6d,
			0x01, 0x00, 0x00, 0x00,
	
			// Type section: (i32, i32) -> ()
			0x01, 0x06, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x00,
	
			// Function section
			0x03, 0x02, 0x01, 0x00,
	
			// Memory section: min 17 pages
			0x05, 0x03, 0x01, 0x00, 0x11,
	
			// Export section
			0x07, 0x15, 0x02,
	
			0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79,
			0x02, 0x00,
	
			0x08, 0x70, 0x61, 0x73, 0x73, 0x4c, 0x6f, 0x6f, 0x70,
			0x00, 0x00,
	
			// Code section: empty function
			0x0a, 0x04, 0x01, 0x02, 0x00, 0x0b
		]);
	
		const module = await WebAssembly.compile(wasmBytes);
		this.instance = await WebAssembly.instantiate(module, {});
	
		this.memory = this.instance.exports.memory as WebAssembly.Memory;
		this.passLoop = this.instance.exports.passLoop as (
			len: number,
			tracerPid: number
		) => void;
	
		const cap = this.capacity;
		const requiredBytes = cap * 17; // 4 * cap * 4 + cap
	
		const currentPageCount = this.memory.buffer.byteLength / 65536;
		const pagesNeeded = Math.ceil(requiredBytes / 65536);
	
		if (pagesNeeded > currentPageCount) {
			this.memory.grow(pagesNeeded - currentPageCount);
		}
	
		// IMPORTANT: create views only after any grow()
		const buffer = this.memory.buffer;
	
		let offset = 0;
		this.lane = new Int32Array(buffer, offset, cap);
		offset += cap * 4;
	
		this.posX = new Float32Array(buffer, offset, cap);
		offset += cap * 4;
	
		this.posY = new Float32Array(buffer, offset, cap);
		offset += cap * 4;
	
		this.val = new Int32Array(buffer, offset, cap);
		offset += cap * 4;
	
		this.ops = new Uint8Array(buffer, offset, cap);
	}
	public write(x: number, y: number, value: number, pid: number) {
		this.posX[pid] = x;
		this.posY[pid] = y;
		this.val[pid] = value;
		this.ops[pid] = 1; // OP.WRITE
		if (this.laneLen < this.capacity) {
			this.lane[this.laneLen++] = pid;
		}
	}
	public tick(tracerPid: number) {
		// Runs at native speed over shared linear memory
		this.passLoop(this.laneLen, tracerPid);
	}
}
// #endregion
//                                                                                                FELKOR
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST
 FELKOR.publish
 sec | M writes/s | best M/s | avg M/s | CPU %
   1 |     722.18 |   722.18 |  722.18 | 100.1
   2 |     725.58 |   725.58 |  723.88 | 103.1
   3 |     729.29 |   729.29 |  725.69 | 103.1
   4 |     744.14 |   744.14 |  730.30 | 100.0
   5 |     743.11 |   744.14 |  732.86 | 100.0
   6 |     740.91 |   744.14 |  734.20 | 100.0
   7 |     703.13 |   744.14 |  729.76 | 100.0
   8 |     696.56 |   744.14 |  725.61 |  99.9
   9 |     732.36 |   744.14 |  726.36 | 100.0
  10 |     686.23 |   744.14 |  722.35 | 100.0
  11 |     703.77 |   744.14 |  720.66 | 100.0
 */
/** BARE METAL TEST
 --- FELKOR.publish ---
 Peak (Best Batch): 923.19 M ops/sec
 Average:           799.64 M ops/sec
 */
class FELKOR {
	public readonly capacity: number;
	public readonly mask: number;

	public readonly pids: Int32Array;
	public readonly values: Float64Array;
	public readonly flags: Uint8Array;

	public writeCursor = 0;
	public readCursor = 0;

	constructor(capacity = 65536) {
		if ((capacity & (capacity - 1)) !== 0) throw new Error("Capacity must be power of two");
		this.capacity = capacity;
		this.mask = capacity - 1;
		this.pids = new Int32Array(capacity);
		this.values = new Float64Array(capacity);
		this.flags = new Uint8Array(capacity);
	}

	public publish(pid: number, value: number, flag = 0): boolean {
		if (this.writeCursor - this.readCursor >= this.capacity) return false;
		const index = this.writeCursor & this.mask;
		this.pids[index] = pid;
		this.values[index] = value;
		this.flags[index] = flag;
		this.writeCursor++;
		return true;
	}

	public poll(handler: (pid: number, value: number, flag: number) => void): boolean {
		if (this.readCursor === this.writeCursor) return false;
		const index = this.readCursor & this.mask;
		handler(this.pids[index], this.values[index], this.flags[index]);
		this.readCursor++;
		return true;
	}
}
// #endregion
//                                                                                         DARTH_NIHILIS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const LANE_FOR_OP: Record<number, number> = {
  [OP.READ]: 0, [OP.WRITE]: 1, [OP.DELETE]: 2, [OP.EFFECT]: 3,
  [OP.COMPACT]: 4, [OP.NONE]: 5, [OP.EDIT]: 6, [OP.PUT]: 7,
  [OP.SEND]: 8, [OP.SUB]: 9, [OP.DUPLEX]: 10, [OP.STREAM]: 11,
  [OP.DRC]: 12, [OP.TRANSFORM]: 13,
};

function isPow2(n: number): boolean {
  return (n & (n - 1)) === 0 && n > 0;
}

class DARTH_NIHILIS {
  readonly capacity: number;
  readonly mask: number;
  readonly laneCount: number;
  static readonly RECORD_WORDS = 6;

  private readonly rings: Int32Array[] = [];
  private readonly heads: Int32Array;
  private readonly tails: Int32Array;
  private readonly clock: Int32Array;
  private readonly phase: Int32Array;
  private readonly pidToSlot: Int32Array;
  private readonly dirty: Uint32Array;
  private readonly maxBatch: number;

  readonly stats: {
    published: Uint32Array;
    consumed: Uint32Array;
    batches: Uint32Array;
    maxBatch: Uint32Array;
  };

  private handlers: Array<((record: Int32Array, base: number, clock: number) => void) | null> = [];

  constructor(options: { capacity?: number; lanes?: number; maxBatch?: number } = {}) {
    const capacity = options.capacity ?? 1024 * 1024;
    const lanes = options.lanes ?? 14;

    if (!isPow2(capacity)) throw new Error("capacity must be a power of two");
    if (!isPow2(lanes)) throw new Error("lanes must be a power of two");

    this.capacity = capacity;
    this.mask = capacity - 1;
    this.laneCount = lanes;
    this.maxBatch = options.maxBatch ?? 4096;

    const recordBytes = DARTH_NIHILIS.RECORD_WORDS * 4;
    for (let lane = 0; lane < lanes; lane++) {
      this.rings.push(new Int32Array(capacity * recordBytes / 4));
    }

    // Plain Int32Arrays — no SharedArrayBuffer, no Atomics.
    this.heads = new Int32Array(lanes);
    this.tails = new Int32Array(lanes);
    this.clock = new Int32Array(1);
    this.phase = new Int32Array(1);
    this.pidToSlot = new Int32Array(1 << 20);
    this.pidToSlot.fill(-1);
    // 1M PIDs => 1M bits => 128 KB => 32768 Uint32 words. This was wrong in the original.
    this.dirty = new Uint32Array((1 << 20) >>> 5);

    this.stats = {
      published: new Uint32Array(lanes),
      consumed: new Uint32Array(lanes),
      batches: new Uint32Array(lanes),
      maxBatch: new Uint32Array(lanes),
    };
  }

  onLane(lane: number, handler: (record: Int32Array, base: number, clock: number) => void): this {
    this.handlers[lane] = handler;
    return this;
  }

  /** Single-threaded emit: no atomics, plain stores. */
  emit(op: OpKind, pid: number, slot: number, payloadA = 0, payloadB = 0, flags = 0): boolean {
    const lane = LANE_FOR_OP[op] ?? 0;
    const ring = this.rings[lane];
    const tail = this.tails[lane];

    // Single-threaded: no CAS needed. Just check the head doesn't lap us.
    if (tail - this.heads[lane] >= this.capacity) return false;

    const base = (tail & this.mask) * DARTH_NIHILIS.RECORD_WORDS;
    ring[base + 0] = op;
    ring[base + 1] = pid;
    ring[base + 2] = slot;
    ring[base + 3] = payloadA;
    ring[base + 4] = payloadB;
    ring[base + 5] = flags;

    this.tails[lane] = tail + 1;
    this.stats.published[lane]++;
    return true;
  }

  drainPass(limit = this.maxBatch): number {
    const lane = this.phase[0];
    const handler = this.handlers[lane];
    const ring = this.rings[lane];

    if (!handler) {
      this.phase[0] = (lane + 1) % this.laneCount;
      return 0;
    }

    let head = this.heads[lane];
    const tail = this.tails[lane];
    const batchEnd = Math.min(tail, head + limit);
    const clock = this.clock[0];

    let processed = 0;
    const RW = DARTH_NIHILIS.RECORD_WORDS;
    const mask = this.mask;

    while (head < batchEnd) {
      const base = (head & mask) * RW;
      handler(ring, base, clock);
      head++;
      processed++;
    }

    if (processed > 0) {
      this.heads[lane] = head;
      this.stats.consumed[lane] += processed;
      this.stats.batches[lane]++;
      if (processed > this.stats.maxBatch[lane]) this.stats.maxBatch[lane] = processed;
    }

    this.phase[0] = (lane + 1) % this.laneCount;
    return processed;
  }

  runRevolution(maxPerPass = this.maxBatch): number {
    let total = 0;
    for (let lane = 0; lane < this.laneCount; lane++) {
      total += this.drainPass(maxPerPass);
    }
    this.clock[0]++;
    return total;
  }

  tick(): number { return this.clock[0]; }

  markDirty(pid: number): void {
    this.dirty[pid >>> 5] |= 1 << (pid & 31);
  }
  takeDirty(pid: number): boolean {
    const w = pid >>> 5, b = 1 << (pid & 31);
    if ((this.dirty[w] & b) === 0) return false;
    this.dirty[w] &= ~b;
    return true;
  }

  bindPid(pid: number, slot: number): void { this.pidToSlot[pid] = slot; }
  unbindPid(pid: number): void { this.pidToSlot[pid] = -1; }
  slotFor(pid: number): number { return this.pidToSlot[pid]; }

  write(iterations: number, op: OpKind = OP.WRITE, pid = 1, slot = 1,
        payloadA = 0xdead, payloadB = 0xbeef, flags = 0) {
    const lane = LANE_FOR_OP[op] ?? 0;
    const ring = this.rings[lane];
    const mask = this.mask;
    const RW = DARTH_NIHILIS.RECORD_WORDS;
    const capacity = this.capacity;
    const heads = this.heads;

    const t0 = performance.now();

    // Inlined single-threaded path — no atomics at all.
    let tail = this.tails[lane];
    for (let i = 0; i < iterations; i++) {
      if (tail - heads[lane] >= capacity) {
        // Ring full. In a bench you should have a consumer; else bail.
        return { ops: i, ms: performance.now() - t0, opsPerSec: i / ((performance.now() - t0) / 1000) };
      }
      const base = (tail & mask) * RW;
      ring[base + 0] = op;
      ring[base + 1] = pid;
      ring[base + 2] = slot;
      ring[base + 3] = payloadA;
      ring[base + 4] = payloadB;
      ring[base + 5] = flags;
      tail++;
    }
    this.tails[lane] = tail;

    const ms = performance.now() - t0;
    return { ops: iterations, ms, opsPerSec: iterations / (ms / 1000) };
  }
}
// #endregion
//                                                                                          DARTH_ATRIUS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const pow2 = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;

const DEFAULT_SCHEDULE = [
  OP.READ, OP.WRITE, OP.READ, OP.WRITE, OP.DELETE, OP.EFFECT, OP.COMPACT,
] as const;

interface LANE_STATS {
  published: number;
  consumed: number;
  batches: number;
  maxBatch: number;
  fullStalls: number;
  claimed: number;
}

interface HADRON_OPTIONS {
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

const REC = 8;
const F_OP = 0;
const F_PID = 1;
const F_SLOT = 2;
const F_A = 3;
const F_B = 4;
const F_C = 5;
const F_EPOCH = 6;
const F_EXT = 7;

class DARTH_ATRIUS {
  readonly capacity: number;
  readonly mask: number;
  readonly pidCapacity: number;
  readonly schedule: readonly number[];
  readonly shared: boolean;

  private readonly rings: Int32Array[] = [];

  // Per-lane shared control block layout:
  // 0 nextClaim  1 gatingSequence  2 cachedAvailable  3 publishedHighest
  // 4 fullStalls 5 claimed 6 published 7 consumed 8 batches 9 maxBatch
  private static readonly CTRL = 16;
  private readonly ctrl: Int32Array;

  private readonly available: Int32Array[];

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

  private handlers: Array<((ring: Int32Array, from: number, to: number, epoch: number, d: DARTH_ATRIUS) => void) | null> = [];

  // FIX: laneFor lookup table. Maps OP value -> schedule index.
  private readonly laneOf: Int32Array;

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

    this.rings = Array.from({ length: laneCount }, () => new Int32Array(new AB(capacity * REC * 4)));
    this.ctrl = new Int32Array(new AB(laneCount * DARTH_ATRIUS.CTRL * 4));
    this.available = Array.from({ length: laneCount }, () => new Int32Array(new AB(capacity * 4)));

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

    // FIX: build laneOf. For each schedule slot, map OP value -> lane index.
    this.laneOf = new Int32Array(32).fill(-1);
    for (let i = 0; i < this.schedule.length; i++) {
      this.laneOf[this.schedule[i]] = i;
    }
  }

  on(op: OpKind, handler: (ring: Int32Array, from: number, to: number, epoch: number, d: DARTH_ATRIUS) => void): this {
    const lane = this.laneFor(op);
    if (lane < 0) throw new Error(`op ${op} not in schedule`);
    this.handlers[lane] = handler;
    return this;
  }

  bind(pid: number, slot: number): void { this.pidToSlot[pid] = slot; }
  unbind(pid: number): void { this.pidToSlot[pid] = -1; }
  slot(pid: number): number { return this.pidToSlot[pid]; }

  dirtyMark(pid: number): void { this.dirty[pid >>> 5] |= 1 << (pid & 31); }
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

  allocF64(v: number): number { const at = this.f64Tail++; this.f64[at] = v; return at; }
  allocU32(v: number): number { const at = this.u32Tail++; this.u32[at] = v; return at; }
  allocI32(v: number): number { const at = this.i32Tail++; this.i32[at] = v; return at; }
  allocBytes(data: Uint8Array): number {
    const at = this.byteTail;
    this.bytes.set(data, at);
    this.byteTail += data.length;
    return at;
  }
  f64At(offset: number): number { return this.f64[offset]; }
  u32At(offset: number): number { return this.u32[offset]; }
  i32At(offset: number): number { return this.i32[offset]; }
  bytesAt(offset: number, length: number): Uint8Array { return this.bytes.subarray(offset, offset + length); }

  private ctrlAt(lane: number, field: number): number {
    return lane * DARTH_ATRIUS.CTRL + field;
  }

  claim(lane: number): number {
    const next = this.ctrlAt(lane, 0);
    const stall = this.ctrlAt(lane, 4);
    const claimed = this.ctrlAt(lane, 5);

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

      if (this.wait === "spin") continue;
      if (this.wait === "yield") { this.yieldNow(); continue; }
      Atomics.wait(this.ctrl, next, seq, 1);
    }
  }

  publish(lane: number, seq: number): void {
    const avail = this.available[lane];
    Atomics.store(avail, seq & this.mask, seq + 1);
    const pub = this.ctrlAt(lane, 6);
    Atomics.add(this.ctrl, pub, 1);
    const waiting = this.ctrlAt(lane, 0);
    Atomics.notify(this.ctrl, waiting);
  }

  emit(op: OpKind, pid: number, slot: number, a = 0, b = 0, c = 0, ext = 0, block = true): number {
    const lane = this.laneFor(op);
    if (lane < 0) return -1;
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

  drainPhase(limit = this.maxBatch): number {
    const schedule = this.schedule;
    const lane = schedule[Atomics.load(this.phaseIndex, 0)];
    const handler = this.handlers[lane];

    if (!handler) { this.nextPhase(); return 0; }

    const ring = this.rings[lane];
    const gateField = this.ctrlAt(lane, 1);

    const available = this.availableThrough(lane);
    const head = Atomics.load(this.ctrl, gateField);
    const end = Math.min(available, head + limit);

    if (end <= head) { this.nextPhase(); return 0; }

    const epoch = Atomics.load(this.clock, 0);

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

  revolution(limit = this.maxBatch): number {
    let total = 0;
    for (let i = 0; i < this.schedule.length; i++) total += this.drainPhase(limit);
    Atomics.add(this.clock, 0, 1);
    return total;
  }

  drainAll(limit = this.maxBatch): number {
    let total = 0;
    for (;;) {
      const before = total;
      total += this.revolution(limit);
      if (total === before) break;
    }
    return total;
  }

  tick(): number { return Atomics.load(this.clock, 0); }
  currentPhase(): OpKind { return this.schedule[Atomics.load(this.phaseIndex, 0)] as OpKind; }
  start(): void { Atomics.store(this.running, 0, 1); }
  stop(): void { Atomics.store(this.running, 0, 0); Atomics.notify(this.running, 0); }
  isRunning(): boolean { return Atomics.load(this.running, 0) === 1; }

  stats(lane: number): LANE_STATS {
    const b = lane * DARTH_ATRIUS.CTRL;
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

  private laneFor(op: OpKind): number {
    // FIX: lookup via laneOf table, not identity.
    return this.laneOf[op] ?? -1;
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

    const g = globalThis as any;
    if (typeof g.scheduler !== "undefined" && typeof g.scheduler.yield === "function") {
      g.scheduler.yield();
    } else if (typeof setImmediate === "function") {
      setImmediate(() => {});
    } else {
      setTimeout(() => {}, 0);
    }
  }

  benchOpsPerSecond(iterations: number, op: OpKind, pid = 1, slot = 1, a = 0xdead, b = 0xbeef, c = 0, ext = 0, inline = true): { ops: number; ms: number; opsPerSec: number } {
    const lane = this.laneFor(op);
    if (lane < 0) throw new Error(`op ${op} not in schedule`);

    const t0 = performance.now();

    if (inline) {
      const ring = this.rings[lane];
      const avail = this.available[lane];
      const ctrl = this.ctrl;
      const mask = this.mask;
      const capacity = this.capacity;
      const nextField = this.ctrlAt(lane, 0);
      const gateField = this.ctrlAt(lane, 1);
      const claimedField = this.ctrlAt(lane, 5);
      const pubField = this.ctrlAt(lane, 6);
      const epoch = Atomics.load(this.clock, 0);

      // FIX: cap iterations so we don't deadlock. `capacity` is the safe ceiling.
      const cap = Math.min(iterations, capacity);

      for (let i = 0; i < cap; i++) {
        let seq: number;
        for (;;) {
          seq = Atomics.load(ctrl, nextField);
          const wrap = seq - capacity;
          const gate = Atomics.load(ctrl, gateField);
          if (gate > wrap) {
            if (Atomics.compareExchange(ctrl, nextField, seq, seq + 1) === seq) break;
          }
        }
        Atomics.add(ctrl, claimedField, 1);

        const base = (seq & mask) * REC;
        ring[base + F_OP] = op;
        ring[base + F_PID] = pid;
        ring[base + F_SLOT] = slot;
        ring[base + F_A] = a;
        ring[base + F_B] = b;
        ring[base + F_C] = c;
        ring[base + F_EPOCH] = epoch;
        ring[base + F_EXT] = ext;

        Atomics.store(avail, seq & mask, seq + 1);
        Atomics.add(ctrl, pubField, 1);
      }

      const ms = performance.now() - t0;
      return { ops: cap, ms, opsPerSec: cap / (ms / 1000) };
    }

    const cap = Math.min(iterations, this.capacity);
    for (let i = 0; i < cap; i++) this.emit(op, pid, slot, a, b, c, ext, true);
    const ms = performance.now() - t0;
    return { ops: cap, ms, opsPerSec: cap / (ms / 1000) };
  }

  benchOpsPerSecondSaturated(iterations: number, op: OpKind, pid = 1, slot = 1, a = 0xdead, b = 0xbeef, c = 0, ext = 0): { ops: number; ms: number; opsPerSec: number } {
    const step = this.capacity >>> 1;
    const t0 = performance.now();
    let done = 0;
    while (done < iterations) {
      const n = Math.min(step, iterations - done);
      for (let i = 0; i < n; i++) this.emit(op, pid, slot, a, b, c, ext, true);
      this.drainAll();
      done += n;
    }
    const ms = performance.now() - t0;
    return { ops: done, ms, opsPerSec: done / (ms / 1000) };
  }
}
// #endregion
//                                                                                         DARTH_CALDOTH
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST

 */
/** BARE METAL TEST

 */
type Pid = number;

const OP1 = {
	NONE: 0,
	PUT: 1, // set / replace payload
	EDIT: 2, // queued transform-on-write (edit fn carried in the frame)
	DELETE: 3, // drop when it passes through the send pass
	TRANSFORM: 4, // divert to transformer, deliver to call sites, re-admit
} as const;
interface Particle {
	pid: Pid;
	/** The value. Nothing outside of the collider holds this. */
	payload: unknown;
	/** Queued op to be executed when this particle passes the send pass. */
	op: number;
	/** Edit fn carried with the particle (OP.EDIT), executed in the pass. */
	edit?: (payload: any) => any;
}
interface TransformTier {
	/** name of the tier, e.g. 'light' | 'heavy' | 'io' */
	name: string;
	/** how many transforms in this tier run concurrently per batch */
	concurrency: number;
	/** max transforms drained into a single batch flush for this tier */
	batch: number;
	/** the work */
	run: (particle: Particle) => Promise<unknown> | unknown;
}
interface TransformerQueue {
	/** enqueue a particle for the matching tier; returns a drain promise */
	submit(pid: Pid, tierName: string, work?: (p: Particle) => unknown): Promise<unknown>;
	/** drain pass: run all queued work in tiered concurrent batches */
	drain(): Promise<void>;
	readonly pending: number;
}
class TieredTransformer implements TransformerQueue {
	private queues = new Map<string, { pids: Pid[]; resolvers: Array<(v: unknown) => void> }>();
	constructor(
		private tiers: TransformTier[],
		private collider: DARTH_CALDOTH,
	) {
		for (const t of tiers) this.queues.set(t.name, { pids: [], resolvers: [] });
	}
	tier(name: string): TransformTier | undefined {
		return this.tiers.find((t) => t.name === name);
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
		return new Promise((resolve) => {
			q.pids.push(pid);
			q.resolvers.push(resolve);
			if (work) this.collider.markTierWork(pid, tierName, work);
		});
	}
	async drain(): Promise<void> {
		// tiers run concurrently; within a tier, batches run concurrently
		await Promise.all(
			this.tiers.map(async (tier) => {
				const q = this.queues.get(tier.name)!;
				while (q.pids.length > 0) {
					const batch = q.pids.splice(0, Math.min(tier.batch, q.pids.length));
					const resolvers = q.resolvers.splice(0, batch.length);
					await Promise.all(
						batch.map(async (pid, i) => {
							const particle = this.collider.particleAt(pid);
							if (particle) await tier.run(particle);
							resolvers[i]?.(particle?.payload);
							this.collider.clearTierWork(pid);
						}),
					);
					if (tier.concurrency === 1) continue; // preserve order for serial tiers
				}
			}),
		);
	}
	get pending(): number {
		let n = 0;
		for (const q of this.queues.values()) n += q.pids.length;
		return n;
	}
}
class BytecodeClock {
	readonly register = new Uint8Array(4);
	tick(): void {
		const seq = (this.register[3] + 1) & 0xff;
		this.register[3] = seq;
		if (seq === 0) this.register[1] = (this.register[1] + 1) & 0xff;
	}
	hasCompletedCycle(startSeq: number, currentSeq: number): boolean {
		return ((currentSeq - startSeq) << 24) >> 24 > 0;
	}
	get seq(): number {
		return this.register[3];
	}
	get epoch(): number {
		return this.register[1];
	}
}
class DirectSlotIndex {
	readonly pidToSlot: Int32Array;
	constructor(maxParticles: number) {
		this.pidToSlot = new Int32Array(maxParticles).fill(-1);
	}
	set(pid: number, slot: number): void {
		this.pidToSlot[pid] = slot;
	}
	get(pid: number): number {
		return this.pidToSlot[pid];
	}
	delete(pid: number): void {
		this.pidToSlot[pid] = -1;
	}
}
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
interface CallSite<T = any> {
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
interface CallSiteMeta {
	seq: number; // tracer tick at delivery time
	cycle: number; // completed cycles seen
	dirty: boolean; // did this particle change since last delivery?
}
interface ColliderOptions {
	maxParticles?: number; // hard cap; Int32Array sizing
	windowSize?: number; // send-pass batch window
	tiers?: TransformTier[]; // queued tiered concurrent batches
}
class DARTH_CALDOTH {
	// -- storage: SoA flat typed arrays, nothing lives anywhere else ----------
	private payloads: Array<unknown>; // payloads by slot
	private ops: Uint8Array; // queued op per slot
	private dirty: DenseRingCompactor;
	private slotIndex: DirectSlotIndex;
	private clock = new BytecodeClock();
	private cycleCount = 0;

	// -- the lane: ordered particle slots currently in the collider ----------
	private lane: Int32Array; // slot ids in traversal order
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
		throw new Error("collider full");
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

	queueTransform(pid: Pid, tierName = "light"): void {
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
	clearTierWork(pid: Pid): void {
		this.tierWork.delete(pid);
	}
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
			handlers.forEach((h) => h(value, meta));
		};
		(site as any)._deliver = deliver;

		site.set = (next) => {
			const edit = typeof next === "function" ? (next as (c: T) => T) : () => next;
			this.queueEdit(pid, edit as (p: any) => any);
		};
		site.del = () => this.queueDelete(pid);
		site.refresh = () => this.queueTransform(pid, "post-office-refresh");
		site.unsub = () => {
			this.postOffice.get(pid)?.delete(site);
		};
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
				const tierName = this.pendingTiers[pid] ?? "light";
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
		const w = pid >> 5,
			b = pid & 31;
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
	get cycles(): number {
		return this.cycleCount;
	}
	get tick(): number {
		return this.payloads[TRACER_PID] as number;
	}
	get particleCount(): number {
		return this.laneLen;
	}
	// #endregion
}
// ============================================================================
// DARTH_DESOLOUS
// ============================================================================
// #endregion
//                                                                                        DARTH_DESOLOUS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST

 */
/** BARE METAL TEST

 */
type K = string;
type Off = () => void;
type Timer = ReturnType<typeof setTimeout>;
export interface Message<P = unknown> {
  id: string;
  r: K;
  m: K;
  s: K;
  k: K;
  p: { p: P };
  ts: number;
  ttl?: number;
  _ack: boolean;
}
export interface Context<P = unknown> {
  msg: Message<P>;
  attempt: number;
  reply(value: unknown): boolean;
}
export type Handler<P = any> = (  payload: P,  context: Context<P>) => unknown | Promise<unknown>;
interface Channels {
  channels: Map<K, Set<Handler>>;
  sub_channels: Map<K, Map<K, Set<Handler>>>;
  trip_channels: Map<K, Map<K, Set<Handler>>>;
  quad_channels: Map<K, Map<K, Set<Handler>>>;
}
interface Delivery {
  handler: Handler;
  acked: boolean;
  running: boolean;
  attempt: number;
  value?: unknown;
}
interface Pending {
  msg: Message;
  channels: Channels;
  deliveries?: Delivery[];
  next: number;
  done: boolean;
  expiry?: Timer;
  resolve(value: unknown): void;
  reject(error: Error): void;
}
interface Mesh {
  sequence: number;
  queue: Map<string, Pending>;
  timer?: Timer;
}
const MESH = Symbol.for("SIG_BUS.GLOBAL_MESH.v1");
const RETRY_MS = 20_000;
const ACK_TIMEOUT_MS = 10_000;
function mesh(): Mesh {
  const global = globalThis as any;

  return global[MESH] ??= {
    sequence: 0,
    queue: new Map<string, Pending>()
  };
}// Your existing globalThis[root] -> master -> slave_CHANNELS layout.
function channels(s: K, m: K, r: K): Channels {
  const global = globalThis as any;

  const root = global[r] ??= new Map();

  if (!(root instanceof Map)) {
    throw new TypeError(`globalThis[${JSON.stringify(r)}] must be a Map`);
  }

  let master = root.get(m);

  if (master === undefined) {
    master = new Map();
    root.set(m, master);
  }

  if (!(master instanceof Map)) {
    throw new TypeError(`Master channel ${m} must be a Map`);
  }

  const key = `${s}_CHANNELS`;
  let registry = master.get(key) as Channels | undefined;

  if (!registry) {
    registry = {
      channels: new Map(),
      sub_channels: new Map(),
      trip_channels: new Map(),
      quad_channels: new Map()
    };

    master.set(key, registry);
  }

  return registry;
}
function add(
  map: Map<K, Set<Handler>>,
  key: K,
  handler: Handler
): void {
  let set = map.get(key);

  if (!set) map.set(key, set = new Set());

  set.add(handler);
}
function addNested(
  map: Map<K, Map<K, Set<Handler>>>,
  first: K,
  second: K,
  handler: Handler
): void {
  let inner = map.get(first);

  if (!inner) map.set(first, inner = new Map());

  add(inner, second, handler);
}
function remove(
  map: Map<K, Set<Handler>>,
  key: K,
  handler: Handler
): void {
  const set = map.get(key);

  set?.delete(handler);

  if (set?.size === 0) map.delete(key);
}
function removeNested(
  map: Map<K, Map<K, Set<Handler>>>,
  first: K,
  second: K,
  handler: Handler
): void {
  const inner = map.get(first);

  if (!inner) return;

  remove(inner, second, handler);

  if (!inner.size) map.delete(first);
}
function matching(pending: Pending): Handler[] {
  const { msg, channels: c } = pending;

  const root = c.channels.get(msg.r);
  const master = c.sub_channels.get(msg.m)?.get(msg.r);
  const slave = c.trip_channels.get(msg.s)?.get(msg.m);
  const key = c.quad_channels.get(msg.k)?.get(msg.s);

  if (!root || !master || !slave || !key) return [];

  // Match all four tiers; do not union them into a broad broadcast.
  return [...key].filter(handler =>
    root.has(handler) &&
    master.has(handler) &&
    slave.has(handler)
  );
}
function validReply(value: unknown): boolean {
    return value !== false;
}
function complete(state: Mesh, pending: Pending): void {
  const deliveries = pending.deliveries;

  if (
    pending.done ||
    !deliveries?.length ||
    !deliveries.every(delivery => delivery.acked)
  ) {
    return;
  }

  pending.done = true;
  pending.msg._ack = true;
  state.queue.delete(pending.msg.id);
  clearTimeout(pending.expiry);

  const values = deliveries.map(delivery => delivery.value);

  pending.resolve(values.length === 1 ? values[0] : values);
}
function dispatch(state: Mesh, pending: Pending): void {
    if (pending.done) return;
  
    if (!pending.deliveries) {
      const handlers = matching(pending);
      if (!handlers.length) {
        // Retry soon-ish rather than the full RETRY_MS; flush() also gets
        // called from sub(), so a late subscriber kicks this immediately.
        pending.next = Date.now() + Math.min(RETRY_MS, ACK_TIMEOUT_MS);
        return;
      }
      pending.deliveries = handlers.map((handler) => ({
        handler,
        acked: false,
        running: false,
        attempt: 0,
      }));
    }
  
    pending.next = Date.now() + RETRY_MS;
  
    for (const delivery of pending.deliveries) {
      if (delivery.acked || delivery.running) continue;
  
      delivery.running = true;
      const attempt = ++delivery.attempt;
  
      const release = () => {
        if (delivery.attempt === attempt) {
          delivery.running = false;
        }
      };
  
      const timeout = setTimeout(release, ACK_TIMEOUT_MS);
  
      const reply = (value: unknown): boolean => {
        if (pending.done || delivery.acked || !validReply(value)) {
          return false;
        }
        delivery.acked = true;
        delivery.value = value;
        clearTimeout(timeout);
        release();
        complete(state, pending);
        return true;
      };
  
      void Promise.resolve()
        .then(() => {
          if (pending.done || delivery.acked) return;
          return delivery.handler(pending.msg.p.p, {
            msg: pending.msg,
            attempt,
            reply,
          });
        })
        .then(
          (value) => {
            reply(value);
            clearTimeout(timeout);
            release();
          },
          () => {
            clearTimeout(timeout);
            release();
            // Unacknowledged: stays in the queue for the retry sweep.
          }
        );
    }
}
function schedule(state: Mesh): void {
  if (state.timer !== undefined) {
    clearTimeout(state.timer);
    state.timer = undefined;
  }

  if (!state.queue.size) return;

  let next = Infinity;

  for (const pending of state.queue.values()) {
    next = Math.min(next, pending.next);
  }

  state.timer = setTimeout(() => {
    state.timer = undefined;
    flush(state);
  }, Math.max(0, next - Date.now()));
}
function flush(state: Mesh): void {
    const now = Date.now();
    for (const pending of [...state.queue.values()]) {
      if (!pending.done && pending.next <= now) {
        dispatch(state, pending);
      }
    }
    schedule(state);
}
class DARTH_DESOLOUS {
  constructor(
    public readonly sl = "default",
    public readonly ms = "default",
    public readonly rt = "SIG_BUS"
  ) {}

  public sub<P = unknown>(
    handler: Handler<P>,
    k: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt
  ): Off {
    const c = channels(sl, ms, rt);

    // Unique registration prevents one unsubscribe from removing
    // another registration of the same caller-supplied function.
    const registered: Handler = (payload, context) =>
      handler(payload, context);

    add(c.channels, rt, registered);
    addNested(c.sub_channels, ms, rt, registered);
    addNested(c.trip_channels, sl, ms, registered);
    addNested(c.quad_channels, k, sl, registered);

    return () => {
      remove(c.channels, rt, registered);
      removeNested(c.sub_channels, ms, rt, registered);
      removeNested(c.trip_channels, sl, ms, registered);
      removeNested(c.quad_channels, k, sl, registered);
    };
  }

  public send<R = unknown>(
    payload: unknown,
    k: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt,
    ttl?: number
  ): Promise<R> {
    if (
      ttl !== undefined &&
      (!Number.isFinite(ttl) || ttl <= 0)
    ) {
      return Promise.reject(
        new RangeError("ttl must be a positive number of milliseconds")
      );
    }

    const state = mesh();
    const c = channels(sl, ms, rt);
    const ts = Date.now();
    const id = `${ts.toString(36)}:${++state.sequence}`;

    return new Promise<R>((resolve, reject) => {
      const pending: Pending = {
        msg: {
          id,
          r: rt,
          m: ms,
          s: sl,
          k,
          p: { p: payload },
          ts,
          ttl,
          _ack: false
        },
        channels: c,
        next: ts,
        done: false,
        resolve: value => resolve(value as R),
        reject
      };

      state.queue.set(id, pending);

      if (ttl !== undefined) {
        pending.expiry = setTimeout(() => {
          if (pending.done) return;

          pending.done = true;
          state.queue.delete(id);
          pending.reject(new Error(`Message ${id} exceeded its TTL`));
          schedule(state);
        }, ttl);
      }

      // New message + due retries across the entire mesh.
      flush(state);
    });
  }

  public stream<P = unknown>(
    k: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt
  ): ReadableStream<P> {
    let off: Off = () => {};

    return new ReadableStream<P>({
      start: controller => {
        off = this.sub<P>(payload => {
          controller.enqueue(payload);
          return true;
        }, k, sl, ms, rt);
      },

      cancel: () => off()
    });
  }

  public duplex<Incoming = unknown, Outgoing = unknown>(
    receiveK: K,
    sendK: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt
  ) {
    const send = <R = unknown>(payload: Outgoing) =>
      this.send<R>(payload, sendK, sl, ms, rt);

    return {
      readable: this.stream<Incoming>(receiveK, sl, ms, rt),

      writable: new WritableStream<Outgoing>({
        write: async payload => {
          await send(payload);
        }
      }),

      // Use this when the caller needs the response value.
      send
    };
  }
}
// ============================================================================
// DARTH_PLAGUEIS: High-Throughput CBOR Edge & Persistence Disruptor
// ============================================================================
// #endregion
//                                                                                        DARTH_PLAGUEIS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST

 */
/** BARE METAL TEST

 */
type CBORValue = undefined | null | boolean | number | 
string | Uint8Array | CBORValue[] | { [k: string]: CBORValue };
class BINARY_CORE {
	encodeJSONEnvelope(envelope: any): Uint8Array {
		return new TextEncoder().encode(JSON.stringify(envelope));
	}

	decodeJSONEnvelope(bytes: Uint8Array): any {
		return JSON.parse(new TextDecoder().decode(bytes));
	}
	private readonly encoder = new TextEncoder();
	private readonly decoder = new TextDecoder();
	private ensureAvailable(buf: Uint8Array, pos: number, length: number): void {
		if (pos < 0 || length < 0 || pos + length > buf.length) throw new Error("CBOR: truncated buffer");
	}
	private readUint(buf: Uint8Array, pos: number): [number, number] {
		this.ensureAvailable(buf, pos, 1);
		const info = buf[pos] & 0x1f;
		if (info <= 23) return [info, pos + 1];
		if (info === 24) {
			this.ensureAvailable(buf, pos + 1, 1);
			return [buf[pos + 1], pos + 2];
		}
		if (info === 25) {
			this.ensureAvailable(buf, pos + 1, 2);
			return [new DataView(buf.buffer, buf.byteOffset + pos + 1, 2).getUint16(0, false), pos + 3];
		}
		if (info === 26) {
			this.ensureAvailable(buf, pos + 1, 4);
			return [new DataView(buf.buffer, buf.byteOffset + pos + 1, 4).getUint32(0, false), pos + 5];
		}
		if (info === 27) {
			this.ensureAvailable(buf, pos + 1, 8);
			const value = new DataView(buf.buffer, buf.byteOffset + pos + 1, 8).getBigUint64(0, false);
			if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("CBOR: integer exceeds Number.MAX_SAFE_INTEGER");
			return [Number(value), pos + 9];
		}
		throw new Error(`CBOR: unsupported additional info ${info}`);
	}
	private encodeUint64(majorShifted: number, n: bigint): Uint8Array {
		if (n <= 23n) return new Uint8Array([majorShifted | Number(n)]);
		if (n <= 0xffn) {
			return new Uint8Array([majorShifted | 24, Number(n)]);
		}
		if (n <= 0xffffn) {
			const b = new Uint8Array(3);
			b[0] = majorShifted | 25;
			new DataView(b.buffer).setUint16(1, Number(n), false);
			return b;
		}
		if (n <= 0xffffffffn) {
			const b = new Uint8Array(5);
			b[0] = majorShifted | 26;
			new DataView(b.buffer).setUint32(1, Number(n), false);
			return b;
		}
		const b = new Uint8Array(9);
		b[0] = majorShifted | 27;
		new DataView(b.buffer).setBigUint64(1, n, false);
		return b;
	}
	private encode(value: CBORValue): Uint8Array {
		const parts: Uint8Array[] = [];
		this.encodeValue(value, parts);
		const total = parts.reduce((n, p) => n + p.length, 0);
		const out = new Uint8Array(total);
		let offset = 0;
		for (const p of parts) {
			out.set(p, offset);
			offset += p.length;
		}
		return out;
	}
	private encodeValue(v: CBORValue, out: Uint8Array[]): void {
		if (v === null) {
			out.push(new Uint8Array([0xf6]));
			return;
		}
		if (v === undefined) {
			out.push(new Uint8Array([0xf7]));
			return;
		}
		if (v === true) {
			out.push(new Uint8Array([0xf5]));
			return;
		}
		if (v === false) {
			out.push(new Uint8Array([0xf4]));
			return;
		}

		if (typeof v === "number") {
			if (Number.isSafeInteger(v)) {
				if (v >= 0) out.push(this.encodeUint64(0x00, BigInt(v)));
				else out.push(this.encodeUint64(0x20, BigInt(-1 - v)));
			} else {
				const b = new Uint8Array(9);
				b[0] = 0xfb;
				new DataView(b.buffer).setFloat64(1, v, false);
				out.push(b);
			}
			return;
		}

		if (typeof v === "string") {
			const encoded = this.encoder.encode(v);
			out.push(this.encodeUint(0x60, encoded.length));
			out.push(encoded);
			return;
		}
		if (v instanceof Uint8Array) {
			out.push(this.encodeUint(0x40, v.length));
			out.push(v);
			return;
		}
		if (Array.isArray(v)) {
			out.push(this.encodeUint(0x80, v.length));
			for (const item of v) {
				this.encodeValue(item, out);
			}
			return;
		}
		if (typeof v === "object") {
			const proto = Object.getPrototypeOf(v);
			if (proto !== Object.prototype && proto !== null) throw new Error(`CBOR: unsupported object type ${v.constructor?.name ?? "unknown"}`);
			const keys = Object.keys(v);
			out.push(this.encodeUint(0xa0, keys.length));
			for (const key of keys) {
				this.encodeValue(key, out);
				this.encodeValue(v[key], out);
			}
			return;
		}
		throw new Error(`CBOR: unsupported value type ${typeof v}`);
	}
	private encodeUint(majorShifted: number, n: number): Uint8Array {
		if (n <= 23) return new Uint8Array([majorShifted | n]);
		if (n <= 0xff) return new Uint8Array([majorShifted | 24, n]);
		if (n <= 0xffff) {
			const b = new Uint8Array(3);
			b[0] = majorShifted | 25;
			new DataView(b.buffer).setUint16(1, n, false);
			return b;
		}
		const b = new Uint8Array(5);
		b[0] = majorShifted | 26;
		new DataView(b.buffer).setUint32(1, n, false);
		return b;
	}
	private decode(buf: Uint8Array): CBORValue {
		const [value, end] = this.decodeValue(buf, 0);
		if (end !== buf.length) {
			throw new Error("CBOR: trailing bytes");
		}
		return value;
	}
	private decodeValue(buf: Uint8Array, pos: number): [CBORValue, number] {
		this.ensureAvailable(buf, pos, 1);
		const first = buf[pos];
		const major = first >> 5;
		const info = first & 0x1f;

		if (major === 7) {
			if (info === 20) return [false, pos + 1];
			if (info === 21) return [true, pos + 1];
			if (info === 22) return [null, pos + 1];
			if (info === 23) return [undefined, pos + 1];
			if (info === 27) {
				this.ensureAvailable(buf, pos + 1, 8);
				const dv = new DataView(buf.buffer, buf.byteOffset + pos + 1, 8);
				return [dv.getFloat64(0, false), pos + 9];
			}
		}
		const [n, nextPos] = this.readUint(buf, pos);
		if (major === 0) return [n, nextPos];
		if (major === 1) return [-1 - n, nextPos];
		if (major === 2) {
			this.ensureAvailable(buf, nextPos, n);
			const bytes = buf.slice(nextPos, nextPos + n);
			return [bytes, nextPos + n];
		}
		if (major === 3) {
			this.ensureAvailable(buf, nextPos, n);
			const bytes = buf.slice(nextPos, nextPos + n);
			return [this.decoder.decode(bytes), nextPos + n];
		}
		if (major === 4) {
			const arr: CBORValue[] = [];
			let p = nextPos;
			for (let i = 0; i < n; i++) {
				const [item, np] = this.decodeValue(buf, p);
				arr.push(item);
				p = np;
			}
			return [arr, p];
		}
		if (major === 5) {
			const obj: Record<string, CBORValue> = {};
			let p = nextPos;
			for (let i = 0; i < n; i++) {
				const [k, kp] = this.decodeValue(buf, p);
				const [v, vp] = this.decodeValue(buf, kp);
				obj[k as string] = v;
				p = vp;
			}
			return [obj, p];
		}
		throw new Error(`CBOR: unsupported major type ${major}`);
	}
	public encode_msg(msg: any): Uint8Array {
		// Instead of leaking a raw object, encode an explicit fallback/error frame
		if (msg instanceof Uint8Array) return msg; // If it's already an encoded Uint8Array, don't re-encode it
		try {
			return this.encode(msg);
		} catch (err) {
			console.log("[BINARY_PIPE] Failed to encode outbound packet strictly:", err);
			return this.encode({ type: "error", error: "Encoding failed", id: msg?.id || "unknown" });
		}
	}
	public decode_msg(raw: any): any {
		// Guard: If it didn't arrive as binary, it's a protocol violation for this core layer
		if (!(raw instanceof Uint8Array) && !(typeof Buffer !== "undefined" && Buffer.isBuffer(raw))) {
			console.error("[BINARY_PIPE] Protocol violation: Expected encoded Uint8Array data stream.");
			return null;
		}
		try {
			const uint8 = raw instanceof Uint8Array ? raw : new Uint8Array((raw as any).buffer, (raw as any).byteOffset, (raw as any).length);
			return this.decode(uint8);
		} catch (err) {
			console.error("[BINARY_PIPE] Failed to decode inbound packet:", err);
			return null;
		}
	}
}
const BINARY = new BINARY_CORE();
class DARTH_PLAGUEIS {
	/*  =========================================================================
     DARTH_PLAGUEIS: High-Throughput CBOR Edge & Persistence Disruptor
    ========================================================================= */
	private buffer: Uint8Array;
	private view: DataView;
	private writeCursor = 0;
	private readCursor = 0;

	constructor(public readonly capacity = 1 << 20) {
		// 1MB default ring slab
		this.buffer = new Uint8Array(capacity);
		this.view = new DataView(this.buffer.buffer);
	}

	public publish(payload: object): boolean {
		// Serialize object directly into CBOR binary bytes
		const encoded = BINARY.encode_msg(payload);
		const len = encoded.length;

		// 4 bytes for length prefix + payload length
		if (this.writeCursor - this.readCursor + len + 4 > this.capacity) {
			return false; // Ring full / backpressure
		}

		const slot = this.writeCursor % this.capacity;

		// Handle wrapping or write contiguous if space permits
		// For absolute speed, write 4-byte length header followed by CBOR payload
		this.view.setUint32(slot, len, true);

		// Copy encoded CBOR bytes into ring buffer slab
		const destOffset = (slot + 4) % this.capacity;
		if (destOffset + len <= this.capacity) {
			this.buffer.set(encoded, destOffset);
		} else {
			// Split wrap-around write if hitting end of buffer
			const firstChunk = this.capacity - destOffset;
			this.buffer.set(encoded.subarray(0, firstChunk), destOffset);
			this.buffer.set(encoded.subarray(firstChunk), 0);
		}

		this.writeCursor += len + 4;
		return true;
	}

	public consume(handler: (decoded: any) => void): number {
		if (this.readCursor === this.writeCursor) return 0;

		const slot = this.readCursor % this.capacity;
		const len = this.view.getUint32(slot, true);
		const srcOffset = (slot + 4) % this.capacity;

		let encoded: Uint8Array;
		if (srcOffset + len <= this.capacity) {
			encoded = this.buffer.subarray(srcOffset, srcOffset + len);
		} else {
			encoded = new Uint8Array(len);
			const firstChunk = this.capacity - srcOffset;
			encoded.set(this.buffer.subarray(srcOffset, this.capacity), 0);
			encoded.set(this.buffer.subarray(0, len - firstChunk), firstChunk);
		}

		const decoded = BINARY.decode_msg(encoded);
		handler(decoded);

		this.readCursor += len + 4;
		return 1;
	}
}
// #endregion
//                                                                                            NAGA_SADOW
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST

 */
/** BARE METAL TEST

 */
class NAGA_SADOW {
	/* =========================================================================
       DARTH_REVAN: Schema-Enforced Columnar Avro-Style Disruptor
       ========================================================================= */
	private buffer: Uint8Array;
	private view: DataView;
	private writeCursor = 0;
	private readCursor = 0;

	constructor(public readonly capacity = 1 << 20) {
		this.buffer = new Uint8Array(capacity);
		this.view = new DataView(this.buffer.buffer);
	}

	// Schema: [ID: Int32] [posX: Float32] [posY: Float32] [Value: Int32] -> 16 bytes fixed schema
	public admitDirect(id: number, posX: number, posY: number, val: number): boolean {
		const RECORD_SIZE = 16;
		if (this.writeCursor - this.readCursor + RECORD_SIZE > this.capacity) {
			return false;
		}

		const offset = this.writeCursor % this.capacity;

		// Zero-field-name raw binary packing (Avro principle)
		this.view.setInt32(offset, id, true);
		this.view.setFloat32(offset + 4, posX, true);
		this.view.setFloat32(offset + 8, posY, true);
		this.view.setInt32(offset + 12, val, true);

		this.writeCursor += RECORD_SIZE;
		return true;
	}

	public consume(handler: (id: number, x: number, y: number, val: number) => void): number {
		const RECORD_SIZE = 16;
		if (this.readCursor === this.writeCursor) return 0;

		const offset = this.readCursor % this.capacity;
		const id = this.view.getInt32(offset, true);
		const x = this.view.getFloat32(offset + 4, true);
		const y = this.view.getFloat32(offset + 8, true);
		const val = this.view.getInt32(offset + 12, true);

		handler(id, x, y, val);
		this.readCursor += RECORD_SIZE;
		return 1;
	}
}
// #endregion
//                                                                                         DARTH_SIDIOUS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST

 */
/** BARE METAL TEST

 */
const DISRUPTOR_HEADER_SIZE = 64;
const H_WRITE = 0,
	H_READ = 1,
	H_CAPACITY = 2,
	H_SLOT_BYTES = 3;
const EMPTY_PAYLOAD = new Uint8Array(0);
interface RingPairDescriptor {
	aToB_fast: SharedArrayBuffer;
	bToA_fast: SharedArrayBuffer;
	aToB_overflow: SharedArrayBuffer;
	bToA_overflow: SharedArrayBuffer;
}
const HEADER_SIZE_BYTES = 64;
const HEADER_IDX_WRITE_HEAD = 0;
const HEADER_IDX_READ_HEAD = 1;
const HEADER_IDX_MUTEX = 2;
const HEADER_IDX_CAPACITY = 3;
const MUTEX_UNLOCKED = 0;
const MUTEX_LOCKED = 1;
const SENTINEL_WRAP_MARKER = 0xffffffff;
function createSharedDepotBuffer(capacityBytes: number): SharedArrayBuffer {
	const alignedCapacity = Math.ceil(capacityBytes / 64) * 64;
	const totalSizeBytes = HEADER_SIZE_BYTES + alignedCapacity;
	const sab = new SharedArrayBuffer(totalSizeBytes);
	const headerView = new Int32Array(sab, 0, 4);
	Atomics.store(headerView, HEADER_IDX_WRITE_HEAD, 0);
	Atomics.store(headerView, HEADER_IDX_READ_HEAD, 0);
	Atomics.store(headerView, HEADER_IDX_MUTEX, MUTEX_UNLOCKED);
	Atomics.store(headerView, HEADER_IDX_CAPACITY, alignedCapacity);
	return sab;
}
function createSharedDisruptorBuffer(capacity: number, maxPayloadBytes: number): SharedArrayBuffer {
	if ((capacity & (capacity - 1)) !== 0) throw new Error("Disruptor capacity must be a power of two.");
	const slotPayloadBytes = Math.ceil(maxPayloadBytes / 8) * 8;
	const total = DISRUPTOR_HEADER_SIZE + capacity * 4 + capacity * 8 + capacity * 4 + capacity + capacity * slotPayloadBytes;
	const sab = new SharedArrayBuffer(total);
	const header = new Int32Array(sab, 0, 4);
	Atomics.store(header, H_WRITE, 0);
	Atomics.store(header, H_READ, 0);
	Atomics.store(header, H_CAPACITY, capacity);
	Atomics.store(header, H_SLOT_BYTES, slotPayloadBytes);
	return sab;
}
class DARTH_SIDIOUS {
	public readonly capacity: number;
	public readonly mask: number;
	public readonly slotPayloadBytes: number;
	public readonly pids: Int32Array;
	public readonly values: Float64Array;
	public readonly lengths: Int32Array;
	public readonly flags: Uint8Array;
	public readonly payload: Uint8Array;
	private readonly header: Int32Array;
	constructor(sab: SharedArrayBuffer) {
		this.header = new Int32Array(sab, 0, 4);
		const capacity = Atomics.load(this.header, H_CAPACITY);
		if ((capacity & (capacity - 1)) !== 0) throw new Error("Disruptor capacity must be a power of two.");
		this.capacity = capacity;
		this.mask = capacity - 1;
		this.slotPayloadBytes = Atomics.load(this.header, H_SLOT_BYTES);

		let offset = DISRUPTOR_HEADER_SIZE;
		this.pids = new Int32Array(sab, offset, capacity);
		offset += capacity * 4;
		this.values = new Float64Array(sab, offset, capacity);
		offset += capacity * 8;
		this.lengths = new Int32Array(sab, offset, capacity);
		offset += capacity * 4;
		this.flags = new Uint8Array(sab, offset, capacity);
		offset += capacity;
		this.payload = new Uint8Array(sab, offset, capacity * this.slotPayloadBytes);
	}
	public publish(pid: number, value: number, flag = 0, payload?: Uint8Array): boolean {
		const payloadLen = payload?.byteLength ?? 0;
		if (payloadLen > this.slotPayloadBytes) return false;
		const w = Atomics.load(this.header, H_WRITE);
		const r = Atomics.load(this.header, H_READ);
		if (w - r >= this.capacity) return false;
		const index = w & this.mask;
		this.pids[index] = pid;
		this.values[index] = value;
		this.flags[index] = flag;
		this.lengths[index] = payloadLen;
		if (payloadLen > 0) this.payload.set(payload!, index * this.slotPayloadBytes);
		Atomics.store(this.header, H_WRITE, w + 1);
		Atomics.notify(this.header, H_WRITE);
		return true;
	}
	public consume(handler: (pid: number, value: number, flag: number, payload: Uint8Array) => void): number {
		const targetWrite = Atomics.load(this.header, H_WRITE);
		let currentRead = Atomics.load(this.header, H_READ);
		if (currentRead === targetWrite) return 0;
		let processed = 0;
		while (currentRead < targetWrite) {
			const index = currentRead & this.mask;
			const len = this.lengths[index];
			const base = index * this.slotPayloadBytes;
			const payloadView = len > 0 ? this.payload.subarray(base, base + len) : EMPTY_PAYLOAD;
			handler(this.pids[index], this.values[index], this.flags[index], payloadView);
			currentRead++;
			processed++;
		}
		Atomics.store(this.header, H_READ, currentRead);
		return processed;
	}
	public waitForDataAsync(timeoutMs = 1000): Promise<"ok" | "not-equal" | "timed-out"> {
		const w = Atomics.load(this.header, H_WRITE);
		const r = Atomics.load(this.header, H_READ);
		if (w !== r) return Promise.resolve("ok");
		const res = (Atomics as any).waitAsync(this.header, H_WRITE, w, timeoutMs);
		return res.async ? res.value : Promise.resolve(res.value);
	}
	public reset(): void {
		Atomics.store(this.header, H_WRITE, 0);
		Atomics.store(this.header, H_READ, 0);
	}
}

function calculateFrameFootprint(payloadSizeBytes: number): number {
	const rawEnvelopeBytes = 4 + payloadSizeBytes;
	return Math.ceil(rawEnvelopeBytes / 4) * 4;
}
function mapDepotBuffer(sab: SharedArrayBuffer): HeaderViews {
	// Map control slots (first 16 bytes containing 4 x Int32 values)
	const headerInt32 = new Int32Array(sab, 0, 4);
	// Read capacity directly from header slot
	const capacity = Atomics.load(headerInt32, HEADER_IDX_CAPACITY);
	// Map p slice strictly starting at byte 64
	const payloadUint8 = new Uint8Array(sab, HEADER_SIZE_BYTES, capacity);
	return { headerInt32, payloadUint8, capacity };
}
// #endregion
//                                                                                              EXAR_KUN
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** NON-BARE METAL TEST

 */
/** BARE METAL TEST

 */
class EXAR_KUN {
	private headerInt32: Int32Array;
	private payloadUint8: Uint8Array;
	private payloadDataView: DataView;
	public readonly capacity: number;
	private static readonly HEADER_SIZE = 12; // 3 x 4-byte Int32 slots
	constructor(sab: SharedArrayBuffer) {
		const views: HeaderViews = mapDepotBuffer(sab);
		this.headerInt32 = views.headerInt32;
		this.payloadUint8 = views.payloadUint8;
		this.capacity = views.capacity;

		this.payloadDataView = new DataView(sab, HEADER_SIZE_BYTES, this.capacity); // DataView over the p region for atomic-safe 32-bit reads/writes
	}
	private acquireLock(): void {
		// DEV_LOG(`DISPATCH acquireLock `, 'DISPATCH')
		while (Atomics.compareExchange(this.headerInt32, HEADER_IDX_MUTEX, MUTEX_UNLOCKED, MUTEX_LOCKED) !== MUTEX_UNLOCKED) {} // Spin until lock is acquired
	}
	private releaseLock(): void {
		Atomics.store(this.headerInt32, HEADER_IDX_MUTEX, MUTEX_UNLOCKED);
	}
	public getAvailableWriteSpace(): number {
		//  DEV_LOG(`DISPATCH getAvailableWriteSpace `, 'DISPATCH')
		const writeHead = Atomics.load(this.headerInt32, HEADER_IDX_WRITE_HEAD);
		const readHead = Atomics.load(this.headerInt32, HEADER_IDX_READ_HEAD);
		if (writeHead >= readHead) {
			return this.capacity - (writeHead - readHead) - 4;
		} // Leave 4-byte margin to prevent head collision
		return readHead - writeHead - 4;
	}
	public getAvailableReadBytes(): number {
		//  DEV_LOG(`DISPATCH getAvailableReadBytes  `, 'DISPATCH')
		const writeHead = Atomics.load(this.headerInt32, HEADER_IDX_WRITE_HEAD);
		const readHead = Atomics.load(this.headerInt32, HEADER_IDX_READ_HEAD);
		if (writeHead >= readHead) {
			return writeHead - readHead;
		}
		return this.capacity - readHead + writeHead;
	}
	public write(p: Uint8Array): boolean {
		const footprint = calculateFrameFootprint(p.byteLength);
		if (footprint >= this.capacity) return false; // can never fit

		this.acquireLock();
		try {
			const writeHead = Atomics.load(this.headerInt32, HEADER_IDX_WRITE_HEAD);
			const readHead = Atomics.load(this.headerInt32, HEADER_IDX_READ_HEAD);
			let target = writeHead;

			if (readHead === writeHead) {
				// empty: reset both cursors, whole ring is free (reader is excluded by the lock)
				Atomics.store(this.headerInt32, HEADER_IDX_READ_HEAD, 0);
				target = 0;
			} else if (writeHead > readHead) {
				const tail = this.capacity - writeHead;
				if (footprint <= tail) {
					// ending exactly at capacity wraps to 0; that collides if the reader is at 0
					if (footprint === tail && readHead === 0) return false;
				} else {
					// wrap: after the jump only [0, readHead) is usable, and we must stop short of readHead
					if (footprint >= readHead) return false;
					this.payloadDataView.setUint32(writeHead, SENTINEL_WRAP_MARKER, true);
					target = 0;
				}
			} else {
				// writeHead < readHead: free region is [writeHead, readHead), strictly less than it
				if (footprint >= readHead - writeHead) return false;
			}

			this.payloadDataView.setUint32(target, p.byteLength, true);
			this.payloadUint8.set(p, target + 4);
			Atomics.store(this.headerInt32, HEADER_IDX_WRITE_HEAD, (target + footprint) % this.capacity);
			Atomics.notify(this.headerInt32, HEADER_IDX_WRITE_HEAD, 1);
			return true;
		} finally {
			this.releaseLock();
		}
	}
	public read(): Uint8Array | null {
		/// DEV_LOG(`DISPATCH read  `, 'DISPATCH')
		this.acquireLock();
		try {
			let readHead = Atomics.load(this.headerInt32, HEADER_IDX_READ_HEAD);
			const writeHead = Atomics.load(this.headerInt32, HEADER_IDX_WRITE_HEAD);
			if (readHead === writeHead) {
				return null;
			} // Buffer empty
			let frameHeaderVal = this.payloadDataView.getUint32(readHead, true); // Check for Sentinel Wrap Marker at current read head
			if (frameHeaderVal === SENTINEL_WRAP_MARKER) {
				// Skip sentinel and wrap read head to beginning
				readHead = 0;
				Atomics.store(this.headerInt32, HEADER_IDX_READ_HEAD, 0);
				if (readHead === writeHead) {
					return null;
				} // Buffer empty after wrap
				frameHeaderVal = this.payloadDataView.getUint32(readHead, true);
			}
			const payloadLength = frameHeaderVal;
			const footprint = calculateFrameFootprint(payloadLength); // Slice p segment (zero-copy view copy)
			const p = this.payloadUint8.slice(readHead + 4, readHead + 4 + payloadLength);
			const nextReadHead = (readHead + footprint) % this.capacity; // Advance read head by word-aligned frame footprint
			Atomics.store(this.headerInt32, HEADER_IDX_READ_HEAD, nextReadHead);

			return p;
		} finally {
			this.releaseLock();
		}
	}
	public waitForData(timeoutMs: number = 1000): "ok" | "not-equal" | "timed-out" {
		// DEV_LOG(`DISPATCH timeoutMs timeoutMs: ${timeoutMs}  `, 'DISPATCH')
		const currentWriteHead = Atomics.load(this.headerInt32, HEADER_IDX_WRITE_HEAD);
		const readHead = Atomics.load(this.headerInt32, HEADER_IDX_READ_HEAD); // Data is already available to read
		if (currentWriteHead !== readHead) {
			return "ok";
		} // Wait on main thread is forbidden in JS; safe inside Web Workers / Worker Threads
		return Atomics.wait(this.headerInt32, HEADER_IDX_WRITE_HEAD, currentWriteHead, timeoutMs);
	}
	public waitForDataAsync(timeoutMs = 1000): Promise<"ok" | "not-equal" | "timed-out"> {
		const writeHead = Atomics.load(this.headerInt32, HEADER_IDX_WRITE_HEAD);
		const readHead = Atomics.load(this.headerInt32, HEADER_IDX_READ_HEAD);
		if (writeHead !== readHead) return Promise.resolve("ok");
		// waitAsync returns 'not-equal' synchronously if the head moved since the load above,
		// so there is no lost-wakeup window
		const res = (Atomics as any).waitAsync(this.headerInt32, HEADER_IDX_WRITE_HEAD, writeHead, timeoutMs);
		return res.async ? res.value : Promise.resolve(res.value);
	}
}
// #endregion
//                                                                                           DARTH_TALON
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export const TRACER_PIDD = 0;

export const OPP = {
    NONE: 0,
    PUT: 1,     // implicit: no ops write required
    DELETE: 2,
} as const;

export class DARTH_TALON {
    private readonly capacity: number;
    private readonly lane: Int32Array;
    private readonly ops: Uint8Array;
    public readonly posX: Float32Array;
    public readonly posY: Float32Array;
    public readonly val: Int32Array;

    private laneLen = 0;

    constructor(capacity = 65536) {
        this.capacity = capacity;

        this.lane = new Int32Array(capacity);
        this.ops = new Uint8Array(capacity);
        this.posX = new Float32Array(capacity);
        this.posY = new Float32Array(capacity);
        this.val = new Int32Array(capacity);

        this.lane[0] = TRACER_PIDD;
        this.laneLen = 1;
    }

    // Four stores: posX, posY, val, lane.
    // No ops store. No capacity branch. No boolean return.
    public admitDirect(x: number, y: number, value: number, pid: number): void {
        this.posX[pid] = x;
        this.posY[pid] = y;
        this.val[pid] = value;
        this.lane[this.laneLen++] = pid;
    }
    public delete(pid: number): void {
        this.ops[pid] = OPP.DELETE;
        this.lane[this.laneLen++] = pid;
    }
    public pass(): void {
        const lane = this.lane;
        const ops = this.ops;
        const val = this.val;

        const len = this.laneLen;
        let write = 0;

        for (let i = 0; i < len; i++) {
            const pid = lane[i];

            if (pid === TRACER_PIDD) {
                val[TRACER_PIDD]++;
                lane[write++] = pid;
                continue;
            }

            const op = ops[pid];

            if (op === OPP.DELETE) {
                ops[pid] = OPP.NONE;
                continue;
            }

            if (op !== OPP.NONE) {
                // Handle explicit non-PUT operations here.
                ops[pid] = OPP.NONE;
            }

            // Implicit PUT: posX/posY/val were already written by admitDirect().
            lane[write++] = pid;
        }

        this.laneLen = write;
    }
    get length(): number {
        return this.laneLen;
    }
}
// #endregion
//                               SETTINGS - BATCH_SIZE - TOTAL_BATCHES - DURATION - REPORT_MS - CAPACITY
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/* =============================================================================
 this bench has been optimized to allow your fn to run at the absolute fucking
 by not impeding on its results. This bench does not provide a running log
 as the test takes place. Instead, it reads the current write speeds in a typed
 format, pushing them into an array and only once the test has concluded, 
 does it then take the information out, avg the results, determine what your 
 highest figure was, and reports its findings.
 opts for bare metal cpu test
=========================== ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [BARE METAL CPU BENCH] */

/* =============================================================================
 Once the test starts, reports what the running avgs and highest figure attained.
 set for as long as you need. If testing anything that will pull in figures in
 excess of 1-10 mil ops/sec, THE TEST NEEDS TO BE ATLEAST 10 SECS. Preferably
 20-30 seconds. Anything less than 10... is just not enough time since v8
 switches over into its turbo runtime at the 6 second mark... at which time
 it dips, a lot, and then starts to climb again. At or around the 10 sec mark
 is when... your engine has hit its peak and will not go any higher than the
 results you have attained at this point within the test. If you don't want
 to do 20-30 secs, I would set it to 12 as a min.
======================================= ⇦✦──⇦✦──✦──✦──←'pew pew' 🧙 [BENCH] */
const DURATION = 12;
const REPORT_MS = 1;
const BATCH = 1;

// #endregion
//                                                                                CONSTANTS: pid, v, ssq
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const pid = 1;
let seq = 0;
const v = ++seq;
// #endregion
//                                                                                                 BENCH
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const dur = 1000 * DURATION;
const report = 1000 * REPORT_MS;
function BARE_METAL_CPU(name: string, write: () => void): void {
	const DURATION = dur;
	const REPORT_MS = report;
	const BATCH = 1;
	const CAPACITY = 1024;
	const totalOps = BATCH_SIZE * TOTAL_BATCHES;
	const batchTimes = new Float64Array(TOTAL_BATCHES); // Pre-allocate typed arrays so there's zero GC or allocation during the run
	for (let i = 0; i < 2_000_000; i++) {
		write();
	} // Warm-up pass
	const globalStart = process.hrtime.bigint();
	for (let b = 0; b < TOTAL_BATCHES; b++) {
		// --- HOT LOOP ---
		const batchStart = process.hrtime.bigint();
		for (let i = 0; i < BATCH_SIZE; i++) {
			write();
		}
		batchTimes[b] = Number(process.hrtime.bigint() - batchStart);
	} // --- END HOT LOOP ---
	const globalEnd = process.hrtime.bigint();
	let bestOpsPerSec = 0; // Post-processing: Calculate highest peak and average AFTER everything is done
	for (let b = 0; b < TOTAL_BATCHES; b++) {
		const seconds = batchTimes[b] / 1e9;
		const opsPerSec = BATCH_SIZE / seconds;
		if (opsPerSec > bestOpsPerSec) {
			bestOpsPerSec = opsPerSec;
		}
	}
	const totalSeconds = Number(globalEnd - globalStart) / 1e9;
	const avgOpsPerSec = totalOps / totalSeconds;
	console.log(`\n--- ${name} ---`);
	console.log(`Peak (Best Batch): ${(bestOpsPerSec / 1e6).toFixed(2)} M ops/sec`);
	console.log(`Average:           ${(avgOpsPerSec / 1e6).toFixed(2)} M ops/sec`);
}
function BENCH(name: string, write: () => void): void {
	let windowOps = 0;
	let totalOps = 0;
	let best = 0;
	let elapsedTotal = 0;

	let start = process.hrtime.bigint();
	let windowStart = start;
	let cpuStart = process.cpuUsage();

	console.log(`\n${name}`);
	console.log("sec | M writes/s | best M/s | avg M/s | CPU %");

	while (elapsedTotal < dur) {
		for (let i = 0; i < 100_000; i++) {
			write();
		}

		windowOps += 100_000;
		totalOps += 100_000;

		const now = process.hrtime.bigint();
		const elapsedUs = Number(now - windowStart) / 1_000;
		elapsedTotal = Number(now - start) / 1e6;

		if (elapsedUs >= report * 1_000) {
			const mp = windowOps / elapsedUs;
			const avg = totalOps / (Number(now - start) / 1e9) / 1e6;
			const cpuNow = process.cpuUsage();
			const cpuUs = cpuNow.user - cpuStart.user + cpuNow.system - cpuStart.system;

			best = Math.max(best, mp);

			console.log(String(Math.floor(elapsedTotal / 1_000)).padStart(3), "|", mp.toFixed(2).padStart(10), "|", best.toFixed(2).padStart(8), "|", avg.toFixed(2).padStart(7), "|", ((cpuUs / elapsedUs) * 100).toFixed(1).padStart(5));

			windowOps = 0;
			windowStart = now;
			cpuStart = cpuNow;
		}
	}
}
const bench = RUN_BARE_METAL_CPU_TEST === false ? BENCH : BARE_METAL_CPU;
// #endregion
//                                                                                                  TEST
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════

if (FIGHT === "DARTH_TALON") {
	const talon = new DARTH_TALON(CAPACITY);
	bench("DARTH_TALON.publish", () => {
		talon.admitDirect(v,v, v & 0xffff, v & 0xffff);
	});
} else if (FIGHT === "DARTH_VADER") {
	const two = new DARTH_VADER(CAPACITY);
	bench("DARTH_VADER.publish", () => {
		two.publish(pid, v);
	});
} else if (FIGHT === "VIOLET_HOOD") {
	const two = new VIOLET_HOOD(CAPACITY);
	bench("VIOLET_HOOD.publish", () => {
		two.publish(pid, v);
	});
} else if (FIGHT === "HADRON_APEX") {
	const two = new HADRON_APEX(CAPACITY);
	bench("HADRON_APEX.write", () => {
		two.write(1,1, v, pid);
	});
} else if (FIGHT === "POWER_OF_TWO") {
	const two = new POWER_OF_TWO(CAPACITY);
	bench("POWER_OF_TWO.publish", () => {
		two.publish(pid, v);
	});
} else if (FIGHT === "DARTH_RAVEN") {
	const raven = new DARTH_RAVEN(CAPACITY);
	bench("DARTH_RAVEN.admitDirect", () => {
		raven.admitDirect(v, v, v, pid);
	});
} else if (FIGHT === "GOL_THE_WITHER_KING") {
	const gol = new GOL_THE_WITHER_KING(CAPACITY);
	bench("GOL_THE_WITHER_KING.publish", () => {
		gol.write(v, v, v, pid);
	});
} else if (FIGHT === "DARTH_MAUL") {
	const maul = new DARTH_MAUL(CAPACITY);
	bench("DARTH_MAUL.publish", () => {
		maul.write(v, v, v, pid);
	});
} else if (FIGHT === "DARTH_BANE") {
	const bane = new DARTH_BANE(CAPACITY);
    await bane.init();
	bench("DARTH_BANE.publish", () => {
		bane.write(v, v, v, pid);
	});
} else if (FIGHT === "DARTH_ANDEDDU") {
	const andeddu = new DARTH_ANDEDDU(CAPACITY);
	await andeddu.init();
	bench("DARTH_ANDEDDU.publish", () => {
		andeddu.tick(pid);
	});
} else if (FIGHT === "FELKOR") {
	const felkor = new FELKOR(CAPACITY);
	bench("FELKOR.publish", () => {
		felkor.publish(pid, v);
	});
} else if (FIGHT === "DARTH_NIHILIS") {
	const nihilis = new DARTH_NIHILIS({ capacity: 1 << 22, lanes: 8, wait: "spin" });
	nihilis.onLane(LANE_FOR_OP[OP.WRITE], (_r, _b, _c) => {});
	bench("DARTH_NIHILIS.emit", () => {
		nihilis.emit(OP.WRITE, pid, 0, v, v, v);
	});
} else if (FIGHT === "DARTH_ATRIUS") {
	const atrius = new DARTH_ATRIUS({ capacity: 1 << 18, wait: "spin" });
	//atrius.on(OP.WRITE, () => {});
	bench("DARTH_ATRIUS.emit", () => {
		atrius.benchOpsPerSecond(5000000, pid, 0, v, v, v);
	});
} else if (FIGHT === "DARTH_CALDOTH") {
	const caldoth = new DARTH_CALDOTH({ maxParticles: 1 << 20 });
	bench("DARTH_CALDOTH.admit", () => {
		caldoth.admit(v);
	});
} else if (FIGHT === "DARTH_DESOLOUS") {
	const desolous = new DARTH_DESOLOUS();
	bench("DARTH_DESOLOUS.send", () => {
		desolous.send(1, "k");
	});
} else if (FIGHT === "DARTH_PLAGUEIS") {
	const plagueis = new DARTH_PLAGUEIS(1 << 22);
	const samplePayload = { action: "sync", target: "cell_grid", matrix: [v, v, v, v] };
	bench("DARTH_PLAGUEIS.publish", () => {
		plagueis.publish(samplePayload);
	});
} else if (FIGHT === "DARTH_REVAN") {
	const naga_sadow = new NAGA_SADOW(1 << 22);
	bench("DARTH_REVAN.admitDirect", () => {
		naga_sadow.admitDirect(pid, v, v, v);
	});
} else if (FIGHT === "DARTH_SIDIOUS") {
	const descriptor: RingPairDescriptor = {
		aToB_fast: createSharedDisruptorBuffer(CAPACITY, CAPACITY),
		bToA_fast: createSharedDisruptorBuffer(CAPACITY, CAPACITY),
		aToB_overflow: createSharedDepotBuffer(CAPACITY),
		bToA_overflow: createSharedDepotBuffer(CAPACITY),
	};
	const sidius = new DARTH_SIDIOUS(descriptor.aToB_fast);
	bench("DARTH_SIDIOUS.publish", () => {
		sidius.publish(pid, v);
	});
} else if (FIGHT === "EXAR_KUN") {
	const descriptor: RingPairDescriptor = {
		aToB_fast: createSharedDisruptorBuffer(CAPACITY, CAPACITY),
		bToA_fast: createSharedDisruptorBuffer(CAPACITY, CAPACITY),
		aToB_overflow: createSharedDepotBuffer(CAPACITY),
		bToA_overflow: createSharedDepotBuffer(CAPACITY),
	};
	const sidius = new EXAR_KUN(descriptor.aToB_fast);
	bench("EXAR_KUN.publish", () => {
		sidius.write(EMPTY_PAYLOAD);
	});
}

// #endregion
//                                                                                                  TYPES
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
//DISRUPTOR.consume((pid, value, flag) => {});
// --- Execution & Telemetry ---
/**const CAPACITY = 65536;
 console.log("Populating engine lanes...");
 for (let i = 1; i < CAPACITY - 100; i++) {
   engine.admitDirect(1.0, 1.0, i, i);
 }
 
 console.log("Starting infinite hot path benchmark. Press Ctrl+C to exit.");
 
 let totalPasses = 0;
 let lastTime = Bun.nanoseconds();
 let lastPasses = 0;
 
 // Using a synchronous loop paired with a manual time check 
 // to ensure the CPU immediately locks to 100% core utilization.
 while (true) {
   for (let j = 0; j < 5_000_000; j++) {
     engine.pass();
   }
   totalPasses += 5_000_000;
 
   const now = Bun.nanoseconds();
   const elapsedSec = (now - lastTime) / 1_000_000_000;
 
   if (elapsedSec >= 2.0) {
     const delta = totalPasses - lastPasses;
     const mps = (delta / elapsedSec) / 1_000_000;
     console.log(`🔥 [HADRON HOT PATH] Rate: ${mps.toFixed(2)} M passes/sec | Total: ${totalPasses.toLocaleString()}`);
     lastTime = now;
     lastPasses = totalPasses;
   }
 
   if (engine.length < 1000) {
     for (let i = 1; i < 30000; i++) {
       engine.admitDirect(1.0, 1.0, i, i);
     }
   }
 } */
type OpKind = (typeof OP)[keyof typeof OP];
type WaitStrategy = "spin" | "yield" | "sleep";
interface DisruptorOptions {
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
interface RingStats {
	published: Uint32Array;
	consumed: Uint32Array;
	dropped: Uint32Array;
	batches: Uint32Array;
	maxBatch: Uint32Array;
}
// #endregion
