export declare class DisruptorSoA {
    readonly capacity: number;
    readonly mask: number;
    readonly pids: Int32Array;
    readonly values: Float64Array;
    readonly flags: Uint8Array;
    writeCursor: number;
    readCursor: number;
    constructor(capacity?: number);
    publish(pid: number, value: number, flag?: number): boolean;
    poll(handler: (pid: number, value: number, flag: number) => void): boolean;
}
