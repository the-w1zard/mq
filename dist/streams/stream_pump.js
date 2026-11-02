// form/streams.ts
export async function writeReadableStreamToWritable(stream, writable) {
    const reader = stream.getReader();
    const flushable = writable;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                writable.end();
                break;
            }
            if (value) {
                writable.write(value);
                if (typeof flushable.flush === 'function') {
                    flushable.flush();
                }
            }
        }
    }
    catch (error) {
        writable.destroy?.(error);
        throw error;
    }
}
export async function writeAsyncIterableToWritable(iterable, writable) {
    try {
        for await (const chunk of iterable) {
            writable.write(chunk);
        }
        writable.end();
    }
    catch (error) {
        writable.destroy?.(error);
        throw error;
    }
}
export async function readableStreamToString(stream, encoding = 'utf-8') {
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        if (value)
            chunks.push(value);
    }
    return Buffer.from(chunks.reduce((acc, c) => {
        const out = new Uint8Array(acc.length + c.length);
        out.set(acc);
        out.set(c, acc.length);
        return out;
    }, new Uint8Array(0))).toString(encoding);
}
export const createReadableStreamFromReadable = (source) => {
    const pump = new StreamPump(source);
    return new ReadableStream(pump, pump);
};
class StreamPump {
    highWaterMark;
    accumulatedSize;
    stream;
    controller;
    constructor(stream) {
        this.highWaterMark = stream.readableHighWaterMark ?? 16 * 1024;
        this.accumulatedSize = 0;
        this.stream = stream;
        this.enqueue = this.enqueue.bind(this);
        this.error = this.error.bind(this);
        this.close = this.close.bind(this);
    }
    size(chunk) {
        return chunk?.byteLength || 0;
    }
    start(controller) {
        this.controller = controller;
        this.stream.on('data', this.enqueue);
        this.stream.once('error', this.error);
        this.stream.once('end', this.close);
        this.stream.once('close', this.close);
    }
    pull() {
        this.resume();
    }
    cancel(reason) {
        this.stream.destroy?.(reason);
        this.stream.off('data', this.enqueue);
        this.stream.off('error', this.error);
        this.stream.off('end', this.close);
        this.stream.off('close', this.close);
    }
    enqueue(chunk) {
        if (!this.controller)
            return;
        try {
            const bytes = chunk instanceof Uint8Array
                ? chunk
                : Buffer.from(chunk);
            const available = (this.controller.desiredSize ?? 0) - bytes.byteLength;
            this.controller.enqueue(bytes);
            if (available <= 0) {
                this.pause();
            }
        }
        catch {
            this.controller.error(new Error('Could not create Buffer, chunk must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object'));
            this.cancel();
        }
    }
    pause() {
        this.stream.pause?.();
    }
    resume() {
        if (this.stream.readable && this.stream.resume) {
            this.stream.resume();
        }
    }
    close() {
        if (!this.controller)
            return;
        this.controller.close();
        this.controller = undefined;
    }
    error(error) {
        if (!this.controller)
            return;
        this.controller.error(error);
        this.controller = undefined;
    }
}
