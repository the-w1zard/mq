export interface WritableLike {
    write(chunk: Uint8Array | string): void;
    end(): void;
    destroy?(error?: Error): void;
    flush?(): void;
}
export interface ReadableLike {
    readableHighWaterMark?: number;
    readable?: boolean;
    on(event: 'data', listener: (chunk: Uint8Array | string) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    once(event: 'error' | 'end' | 'close', listener: (...args: any[]) => void): this;
    off(event: 'data' | 'error' | 'end' | 'close', listener: (...args: any[]) => void): this;
    pause?(): void;
    resume?(): void;
    destroy?(error?: Error): void;
}
export declare function writeReadableStreamToWritable(stream: ReadableStream<Uint8Array>, writable: WritableLike): Promise<void>;
export declare function writeAsyncIterableToWritable(iterable: AsyncIterable<Uint8Array>, writable: WritableLike): Promise<void>;
export declare function readableStreamToString(stream: ReadableStream<Uint8Array>, encoding?: BufferEncoding): Promise<string>;
export declare const createReadableStreamFromReadable: (source: ReadableLike) => ReadableStream<Uint8Array>;
