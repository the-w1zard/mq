export declare class POWER_OF_TWO {
    readonly capacity: number;
    readonly mask: number;
    readonly pids: Int32Array;
    readonly values: Float64Array;
    readonly flags: Uint8Array;
    writeCursor: number;
    readCursor: number;
    constructor(capacity?: number);
    publish(pid: number, value: number, flag?: number): boolean;
    consume(handler: (pid: number, value: number, flag: number) => void): number;
    reset(): void;
}
/**
 * bench("DisruptorSoA.editDirect", () => {
DISRUPTOR.publish(pid , v );
//DISRUPTOR.consume((pid, value, flag) => {      });
});

 */
