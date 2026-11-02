


export class EMITTER {
    private MODULE_CACHE = new Map<any, Map<any, Map<any, any>>>();
    public CH_1 = '__THE_WIZARD_EMITTER__'
    public CH_2 = '__SAURON__'
    public CH_3 = '__STATE__'
    constructor() {
    }
    public getNestedStoreMap<K, V>(sl_reg: any = this.CH_3, ms_reg: any = this.CH_2, globalKey: any = this.CH_1): Map<K, V> {
        // 1. Root Lookup via Module Cache (Fast path)
        let root = this.MODULE_CACHE.get(globalKey);
        if (!root) {
            root = new Map<any, Map<any, Map<any, any>>>();
            this.MODULE_CACHE.set(globalKey, root);
        }

        // 2. Master Map Lookup
        let masterMap = root.get(ms_reg);
        if (!masterMap) {
            masterMap = new Map<any, Map<any, any>>();
            root.set(ms_reg, masterMap);
        }

        // 3. Slave Map Lookup
        let slaveMap = masterMap.get(sl_reg);
        if (!slaveMap) {
            slaveMap = new Map<K, V>();
            masterMap.set(sl_reg, slaveMap);
        }

        return slaveMap;
    }
    public duplexStream(
        readConfig: { k: string; sl?: string; ms?: string; rt?: string },
        writeConfig: { k?: string; sl?: string; ms?: string; rt?: string }
    ): { readable: ReadableStream; writable: WritableStream } {
        return {
            readable: this.readableStream(readConfig.k, readConfig.sl, readConfig.ms, readConfig.rt),
            writable: this.writableStream(writeConfig.k, writeConfig.sl, writeConfig.ms, writeConfig.rt)
        };
    }
    /**const { readable, writable } = emitters.duplexStream(
    { quad: 'inbound_messages' },
    { quad: 'outbound_messages' }
); */
    public transformStream(
        readConfig: { k: string; sl?: string; ms?: string; rt?: string },
        writeConfig: { k?: string; sl?: string; ms?: string; rt?: string },
        transformer?: (chunk: any) => any | Promise<any>
    ): TransformStream {
        return new TransformStream({
            transform: async (chunk, controller) => {
                const transformed = transformer ? await Promise.resolve(transformer(chunk)) : chunk;
                if (transformed !== null && transformed !== undefined) {
                    this.send(transformed, writeConfig.k, writeConfig.sl, writeConfig.ms, writeConfig.rt).send();
                    controller.enqueue(transformed);
                }
            }
        });
    }
    public readableStream(k: string, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): ReadableStream {
        let unsubscribe: (() => void) | null = null;

        return new ReadableStream({
            start: (controller) => {
                unsubscribe = this.sub(
                    k,
                    (data) => {
                        try {
                            controller.enqueue(data);
                        } catch {
                            // Stream was closed or canceled downstream
                        }
                    },
                    sl,
                    ms,
                    rt
                );
            },
            cancel: () => {
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
                }
            }
        });
    }
    /**const readable = emitters.readableStream('telemetry_events');

// Native Web Stream consumption anywhere
readable.pipeTo(new WritableStream({
    write(chunk) {
        console.log('Stream received:', chunk);
    }
})); */
    public writableStream(k?: string, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): WritableStream {
        return new WritableStream({
            write: (chunk) => {
                this.send(chunk, k, sl, ms, rt).send();
            }
        });
    }
    /**const writable = emitters.writableStream('incoming_logs');

// Pipe browser fetch response body straight into your SIGNALS instance
const response = await fetch('/api/stream');
response.body?.pipeTo(writable); */
    public send(data: any, k?: string, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): EMITTER_CHAIN {
        return new EMITTER_CHAIN(this, data, k || 'default', sl, ms, rt);
    }
    public sub(k: string, handler: (data: any) => void, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): () => void {
        const _listeners = this.getNestedStoreMap<string, Set<(data: any) => void>>(sl, ms, rt);
        if (!_listeners.has(k)) {
            _listeners.set(k, new Set());
        }
        _listeners.get(k)!.add(handler);
        return () => {
            const set = _listeners.get(k);
            if (set) {
                set.delete(handler);
                if (set.size === 0) _listeners.delete(k);
            }
        };
    }
    public subAny(handler: (k: string, data: any) => void, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): () => void {
        return this.sub('*', handler as any, sl, ms, rt);
    }
    public subAll(fn: (k: string | symbol, value: any) => void, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): () => void {
        return this.sub('*', fn as any, sl, ms, rt);
    }
    public unsub(k: string, handler: (data: any) => void, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): void {
        const _listeners = this.getNestedStoreMap<string, Set<(data: any) => void>>(sl, ms, rt);
        const set = _listeners.get(k);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) _listeners.delete(k);
    }
    public emit(event: string, p: any, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): void {
        const _listeners = this.getNestedStoreMap<string, Set<(data: any) => void>>(sl, ms, rt);
        const set = _listeners.get(event);
        if (!set) return;
        for (const fn of set) {
            fn(p);
        }
    }
    public once(event: string, fn: Function, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): () => void {
        const wrapper = (data: any) => {
            fn(data);
            this.unsub(event, wrapper, sl, ms, rt);
        };
        return this.sub(event, wrapper as any, sl, ms, rt);
    }
    public removeAllListeners(event?: string, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): void {
        const _listeners = this.getNestedStoreMap<string, Set<(data: any) => void>>(sl, ms, rt);
        if (event) {
            _listeners.delete(event);
        } else {
            _listeners.clear();
        }
    }
    public listenerCount(event: string, sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): number {
        const _listeners = this.getNestedStoreMap<string, Set<(data: any) => void>>(sl, ms, rt);
        const set = _listeners.get(event);
        return set ? set.size : 0;
    }
    public eventNames(sl = this.CH_3, ms = this.CH_2, rt = this.CH_1): string[] {
        const _listeners = this.getNestedStoreMap<string, Set<(data: any) => void>>(sl, ms, rt);
        return Array.from(_listeners.keys());
    }
}

export class EMITTER_CHAIN {
    private emitter: EMITTER;
    private data: any;
    private k: string;
    private sl: any;
    private ms: any;
    private rt: any;
    private _operators: ((data: any) => any)[] = [];
    private _subscribers: Set<(data: any) => void> = new Set();
    constructor(
        emitter: EMITTER,
        data: any,
        k: string,
        sl: any,
        ms: any,
        rt: any
    ) {
        this.emitter = emitter;
        this.data = data;
        this.k = k;
        this.sl = sl;
        this.ms = ms;
        this.rt = rt;
    }
    // === OPERATORS ===
    map(fn: (data: any) => any): this {
        this._operators.push(fn);
        return this;
    }
    filter(fn: (data: any) => boolean): this {
        this._operators.push((data) => fn(data) ? data : null);
        return this;
    }
    reduce(fn: (acc: any, data: any) => any, initial: any): this {
        let acc = initial;
        this._operators.push((data) => {
            acc = fn(acc, data);
            return acc;
        });
        return this;
    }
    scan(fn: (acc: any, data: any) => any, initial: any): this {
        let acc = initial;
        this._operators.push((data) => {
            acc = fn(acc, data);
            return acc;
        });
        return this;
    }
    debounce(ms: number): this {
        let timer: any = null;
        let lastData: any = null;
        let resolveFn: any = null;
        this._operators.push((data) => {
            if (timer) clearTimeout(timer);
            lastData = data;
            return new Promise((resolve) => {
                resolveFn = resolve;
                timer = setTimeout(() => {
                    resolve(lastData);
                    timer = null;
                    resolveFn = null;
                }, ms);
            });
        });
        return this;
    }
    throttle(ms: number): this {
        let lastTime = 0;
        this._operators.push((data) => {
            const now = Date.now();
            if (now - lastTime >= ms) {
                lastTime = now;
                return data;
            }
            return null;
        });
        return this;
    }
    take(n: number): this {
        let count = 0;
        this._operators.push((data) => {
            if (count >= n) return null;
            count++;
            return data;
        });
        return this;
    }
    delay(ms: number): this {
        this._operators.push((data) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(data), ms);
            });
        });
        return this;
    }
    bufferTime(ms: number): this {
        let buffer: any[] = [];
        let timer: any = null;
        this._operators.push((data) => {
            buffer.push(data);
            if (!timer) {
                timer = setTimeout(() => {
                    if (buffer.length > 0) {
                        const result = [...buffer];
                        buffer = [];
                        // This needs to emit - limitation with current design
                    }
                    timer = null;
                }, ms);
            }
            return null;
        });
        return this;
    }
    buffer(size: number): this {
        let buffer: any[] = [];
        this._operators.push((data) => {
            buffer.push(data);
            if (buffer.length >= size) {
                const result = [...buffer];
                buffer = [];
                return result;
            }
            return null;
        });
        return this;
    }
    takeLast(n: number): this {
        const buffer: any[] = [];
        this._operators.push((data) => {
            buffer.push(data);
            if (buffer.length > n) buffer.shift();
            if (buffer.length === n) return [...buffer];
            return null;
        });
        return this;
    }
    skip(n: number): this {
        let count = 0;
        this._operators.push((data) => {
            if (count < n) { count++; return null; }
            return data;
        });
        return this;
    }
    // === DISTINCT OPERATORS ===
    distinct(): this {
        const seen = new Set();
        this._operators.push((data) => {
            const key = typeof data === 'object' ? JSON.stringify(data) : data;
            if (seen.has(key)) return null;
            seen.add(key);
            return data;
        });
        return this;
    }
    distinctUntilChanged(): this {
        let last: any = undefined;
        this._operators.push((data) => {
            if (last === data) return null;
            last = data;
            return data;
        });
        return this;
    }
    // === ERROR HANDLING ===
    catchError(fn: (error: any) => any): this {
        this._operators.push((data) => {
            try { return data; }
            catch (e) { return fn(e); }
        });
        return this;
    }
    retry(attempts: number): this {
        let count = 0;
        this._operators.push((data) => {
            if (data === null && count < attempts) {
                count++;
                return this.data; // Retry with original data
            }
            return data;
        });
        return this;
    }
    tap(fn: (data: any) => void): this {
        this._operators.push((data) => {
            fn(data);
            return data;
        });
        return this;
    }
    log(): this {
        return this.tap((data) => console.log(`[EMITTER:${this.k}]:`, data));
    }
    logError(): this {
        return this.tap((data) => {
            if (data?.error) console.error(`[EMITTER ERROR:${this.k}]:`, data.error);
        });
    }
    subscribe(handler: (data: any) => void): this {
        this._subscribers.add(handler);
        return this;
    }
    // === EXECUTION ===
    private async _processData(input: any): Promise<any> {
        let processed = input;
        for (const op of this._operators) {
            try {
                const result = op(processed);
                if (result === null) return null;
                processed = await Promise.resolve(result);
            } catch (e) {
                console.error('[CHAIN ERROR]:', e);
                processed = e;
            }
        }
        return processed;
    }
    async send(): Promise<void> {
        const processed = await this._processData(this.data);
        if (processed === null) return;

        for (const handler of this._subscribers) {
            try { handler(processed); }
            catch (e) { console.error('[SUBSCRIBER ERROR]:', e); }
        }

        this.emitter.emit(this.k, processed, this.sl, this.ms, this.rt);
    }
    next(): this {
        queueMicrotask(() => this.send());
        return this;
    }
    async toPromise(): Promise<any> {
        await this.send();
        return this.data;
    }
    toDRS(key: string, opts: any = {}): this {
        return this.tap((data) => {
            // Store directly using getNestedStoreMap
            const store = this.emitter.getNestedStoreMap(this.sl, this.ms, this.rt);
            store.set(key, data);
        });
    }
    toChannel(k: string): this {
        return this.tap((data) => {
            this.emitter.emit(k, data, this.sl, this.ms, this.rt);
        });
    }
    persist(key: string, opts: any = {}): this {
        return this.tap((data) => {
            const persistent = this.emitter.getNestedStoreMap(
                `${this.sl}_PERSISTENT`,
                this.ms,
                this.rt
            );
            const persistKeys = this.emitter.getNestedStoreMap(
                `${this.sl}_PERSIST_KEYS`,
                this.ms,
                this.rt
            );
            persistKeys.set(key, true);
            persistent.set(key, data);
        });
    }
}

export const emitter_chain  =  new EMITTER()
 