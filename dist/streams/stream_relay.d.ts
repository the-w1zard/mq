export declare class StreamRelay<T = unknown> {
    private ss;
    private k;
    private sl;
    private ms;
    private rt;
    private maxSubscribers;
    private bufferSize;
    private strategy;
    private subs;
    private buffer;
    private paused;
    private ingesting;
    private unsub?;
    private errorHandler?;
    constructor(ss: any, k: any, sl: string, ms: string, rt: string, opts?: StreamRelayOptions);
    onError(cb: (err: Error) => void): void;
    subscribe(fn: (data: T) => void): () => void;
    private ingest;
    pause(): void;
    resume(): void;
    private drain;
    private applyBackpressure;
    private handleError;
    bufferedCount(): number;
    subscriberCount(): number;
}
