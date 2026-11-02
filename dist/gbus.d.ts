type K = string;
type Off = () => void;
export interface Message<P = unknown> {
    id: string;
    r: K;
    m: K;
    s: K;
    k: K;
    p: {
        p: P;
    };
    ts: number;
    ttl?: number;
    _ack: boolean;
}
export interface Context<P = unknown> {
    msg: Message<P>;
    attempt: number;
    reply(value: unknown): boolean;
}
export type Handler<P = any> = (payload: P, context: Context<P>) => unknown | Promise<unknown>;
export declare class GLOBAL_BUS {
    readonly sl: string;
    readonly ms: string;
    readonly rt: string;
    constructor(sl?: string, ms?: string, rt?: string);
    sub<P = unknown>(handler: Handler<P>, k: K, sl?: string, ms?: string, rt?: string): Off;
    send<R = unknown>(payload: unknown, k: K, sl?: string, ms?: string, rt?: string, ttl?: number): Promise<R>;
    stream<P = unknown>(k: K, sl?: string, ms?: string, rt?: string): ReadableStream<P>;
    duplex<Incoming = unknown, Outgoing = unknown>(receiveK: K, sendK: K, sl?: string, ms?: string, rt?: string): {
        readable: ReadableStream<Incoming>;
        writable: WritableStream<Outgoing>;
        send: <R = unknown>(payload: Outgoing) => Promise<R>;
    };
}
export {};
