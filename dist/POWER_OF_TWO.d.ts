declare class THE_POWER_OF_TWO {
    readonly capacity: number;
    readonly mask: number;
    readonly pids: Int32Array;
    readonly values: Float64Array;
    readonly flags: Uint8Array;
    writeCursor: number;
    readCursor: number;
    constructor(capacity?: number);
    publish(pid: number, value: number, flag?: number): boolean;
    handler(handler: (pid: number, value: number, flag: number) => void): number;
    reset(): void;
}
export declare class IS_BETTER_THAN_ONE {
    two: THE_POWER_OF_TWO;
    constructor();
    send: () => () => (pid: number, value: number, flag?: number) => boolean;
    sub: () => () => (handler: (pid: number, value: number, flag: number) => void) => number;
}
export {};
