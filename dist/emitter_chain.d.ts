export declare class EMITTER {
    private MODULE_CACHE;
    CH_1: string;
    CH_2: string;
    CH_3: string;
    constructor();
    getNestedStoreMap<K, V>(sl_reg?: any, ms_reg?: any, globalKey?: any): Map<K, V>;
    duplexStream(readConfig: {
        k: string;
        sl?: string;
        ms?: string;
        rt?: string;
    }, writeConfig: {
        k?: string;
        sl?: string;
        ms?: string;
        rt?: string;
    }): {
        readable: ReadableStream;
        writable: WritableStream;
    };
    /**const { readable, writable } = emitters.duplexStream(
    { quad: 'inbound_messages' },
    { quad: 'outbound_messages' }
); */
    transformStream(readConfig: {
        k: string;
        sl?: string;
        ms?: string;
        rt?: string;
    }, writeConfig: {
        k?: string;
        sl?: string;
        ms?: string;
        rt?: string;
    }, transformer?: (chunk: any) => any | Promise<any>): TransformStream;
    readableStream(k: string, sl?: string, ms?: string, rt?: string): ReadableStream;
    /**const readable = emitters.readableStream('telemetry_events');

// Native Web Stream consumption anywhere
readable.pipeTo(new WritableStream({
    write(chunk) {
        console.log('Stream received:', chunk);
    }
})); */
    writableStream(k?: string, sl?: string, ms?: string, rt?: string): WritableStream;
    /**const writable = emitters.writableStream('incoming_logs');

// Pipe browser fetch response body straight into your SIGNALS instance
const response = await fetch('/api/stream');
response.body?.pipeTo(writable); */
    send(data: any, k?: string, sl?: string, ms?: string, rt?: string): EMITTER_CHAIN;
    sub(k: string, handler: (data: any) => void, sl?: string, ms?: string, rt?: string): () => void;
    subAny(handler: (k: string, data: any) => void, sl?: string, ms?: string, rt?: string): () => void;
    subAll(fn: (k: string | symbol, value: any) => void, sl?: string, ms?: string, rt?: string): () => void;
    unsub(k: string, handler: (data: any) => void, sl?: string, ms?: string, rt?: string): void;
    emit(event: string, p: any, sl?: string, ms?: string, rt?: string): void;
    once(event: string, fn: Function, sl?: string, ms?: string, rt?: string): () => void;
    removeAllListeners(event?: string, sl?: string, ms?: string, rt?: string): void;
    listenerCount(event: string, sl?: string, ms?: string, rt?: string): number;
    eventNames(sl?: string, ms?: string, rt?: string): string[];
}
export declare class EMITTER_CHAIN {
    private emitter;
    private data;
    private k;
    private sl;
    private ms;
    private rt;
    private _operators;
    private _subscribers;
    constructor(emitter: EMITTER, data: any, k: string, sl: any, ms: any, rt: any);
    map(fn: (data: any) => any): this;
    filter(fn: (data: any) => boolean): this;
    reduce(fn: (acc: any, data: any) => any, initial: any): this;
    scan(fn: (acc: any, data: any) => any, initial: any): this;
    debounce(ms: number): this;
    throttle(ms: number): this;
    take(n: number): this;
    delay(ms: number): this;
    bufferTime(ms: number): this;
    buffer(size: number): this;
    takeLast(n: number): this;
    skip(n: number): this;
    distinct(): this;
    distinctUntilChanged(): this;
    catchError(fn: (error: any) => any): this;
    retry(attempts: number): this;
    tap(fn: (data: any) => void): this;
    log(): this;
    logError(): this;
    subscribe(handler: (data: any) => void): this;
    private _processData;
    send(): Promise<void>;
    next(): this;
    toPromise(): Promise<any>;
    toDRS(key: string, opts?: any): this;
    toChannel(k: string): this;
    persist(key: string, opts?: any): this;
}
export declare const emitter_chain: EMITTER;
