// form/streams.ts

export interface WritableLike {
  write(chunk: Uint8Array | string): void
  end(): void
  destroy?(error?: Error): void
  flush?(): void
}

export interface ReadableLike {
  readableHighWaterMark?: number
  readable?: boolean
  on(event: 'data', listener: (chunk: Uint8Array | string) => void): this
  on(event: 'error', listener: (error: Error) => void): this
  on(event: 'end', listener: () => void): this
  on(event: 'close', listener: () => void): this
  once(event: 'error' | 'end' | 'close', listener: (...args: any[]) => void): this
  off(event: 'data' | 'error' | 'end' | 'close', listener: (...args: any[]) => void): this
  pause?(): void
  resume?(): void
  destroy?(error?: Error): void
}

export async function writeReadableStreamToWritable(
  stream: ReadableStream<Uint8Array>,
  writable: WritableLike
) {
  const reader = stream.getReader()
  const flushable = writable as { flush?: () => void }

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        writable.end()
        break
      }

      if (value) {
        writable.write(value)
        if (typeof flushable.flush === 'function') {
          flushable.flush()
        }
      }
    }
  } catch (error) {
    writable.destroy?.(error as Error)
    throw error
  }
}

export async function writeAsyncIterableToWritable(
  iterable: AsyncIterable<Uint8Array>,
  writable: WritableLike
) {
  try {
    for await (const chunk of iterable) {
      writable.write(chunk)
    }
    writable.end()
  } catch (error) {
    writable.destroy?.(error as Error)
    throw error
  }
}

export async function readableStreamToString(
  stream: ReadableStream<Uint8Array>,
  encoding: BufferEncoding = 'utf-8'
) {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  return Buffer.from(chunks.reduce((acc, c) => {
    const out = new Uint8Array(acc.length + c.length)
    out.set(acc)
    out.set(c, acc.length)
    return out
  }, new Uint8Array(0))).toString(encoding)
}

export const createReadableStreamFromReadable = (
  source: ReadableLike
): ReadableStream<Uint8Array> => {
  const pump = new StreamPump(source)
  return new ReadableStream<Uint8Array>(pump, pump)
}

class StreamPump implements UnderlyingSource<Uint8Array>, QueuingStrategy<Uint8Array> {
  highWaterMark: number
  accumulatedSize: number
  private stream: ReadableLike
  private controller?: ReadableStreamController<Uint8Array>

  constructor(stream: ReadableLike) {
    this.highWaterMark = stream.readableHighWaterMark ?? 16 * 1024
    this.accumulatedSize = 0
    this.stream = stream
    this.enqueue = this.enqueue.bind(this)
    this.error = this.error.bind(this)
    this.close = this.close.bind(this)
  }

  size(chunk: Uint8Array) {
    return chunk?.byteLength || 0
  }

  start(controller: ReadableStreamController<Uint8Array>) {
    this.controller = controller
    this.stream.on('data', this.enqueue)
    this.stream.once('error', this.error)
    this.stream.once('end', this.close)
    this.stream.once('close', this.close)
  }

  pull() {
    this.resume()
  }

  cancel(reason?: Error) {
    this.stream.destroy?.(reason)
    this.stream.off('data', this.enqueue)
    this.stream.off('error', this.error)
    this.stream.off('end', this.close)
    this.stream.off('close', this.close)
  }

  private enqueue(chunk: Uint8Array | string) {
    if (!this.controller) return
  
    try {
      const bytes: Uint8Array<ArrayBuffer> =
        chunk instanceof Uint8Array
          ? (chunk as Uint8Array<ArrayBuffer>)
          : Buffer.from(chunk)
      const available = (this.controller.desiredSize ?? 0) - bytes.byteLength
      this.controller.enqueue(bytes)
      if (available <= 0) {
        this.pause()
      }
    } catch {
      this.controller.error(
        new Error(
          'Could not create Buffer, chunk must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object'
        )
      )
      this.cancel()
    }
  }

  private pause() {
    this.stream.pause?.()
  }

  private resume() {
    if (this.stream.readable && this.stream.resume) {
      this.stream.resume()
    }
  }

  private close() {
    if (!this.controller) return
    this.controller.close()
    this.controller = undefined
  }

  private error(error: Error) {
    if (!this.controller) return
    this.controller.error(error)
    this.controller = undefined
  }
}
