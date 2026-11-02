// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export class StreamRelay<T = unknown> {
  private ss: any;
  private k: any;
  private sl: string;
  private ms: string;
  private rt: string;
  private maxSubscribers: number;
  private bufferSize: number;
  private strategy: any;
  private subs = new Set<(data: T) => void>();
  private buffer: T[] = [];
  private paused = false;
  private ingesting = false;
  private unsub?: () => void;
  private errorHandler?: (err: Error) => void;

  constructor(ss: any, k: any, sl :string, ms :string, rt: string, opts: StreamRelayOptions = {}) {
    this.ss = ss
    this.k = k;
    this.sl = sl;
    this.ms = ms;
    this.rt = rt;
    this.maxSubscribers = opts.maxSubscribers ?? 32;
    this.bufferSize = opts.bufferSize ?? 512;
    this.strategy = opts.backpressureStrategy ?? "pause";
  }

  public onError(cb: (err: Error) => void): void { this.errorHandler = cb; }
  public subscribe(fn: (data: T) => void): () => void {
    if (this.subs.size >= this.maxSubscribers) { throw new Error(`streamRelay ${this.rt}: max subscribers (${this.maxSubscribers})`); }
    this.subs.add(fn);
    if (!this.unsub) { this.unsub = this.ss.sub((data: unknown) => { this.ingest(data as T); }, this.k, this.sl, this.ms, this.rt); }
    return () => {
      this.subs.delete(fn);
      if (this.subs.size === 0 && this.unsub) {
        this.unsub();
        this.unsub = undefined;
      }
    };
  }
  private ingest(data: T): void {
    if (this.paused || this.ingesting) {
      this.buffer.push(data);
      if (this.buffer.length > this.bufferSize) this.applyBackpressure();
      return;
    }
    this.ingesting = true;
    try {
      for (const fn of [...this.subs]) { try { fn(data); } catch (err) { this.handleError(err as Error); } }
    } finally {
      this.ingesting = false;
      this.drain();
    }
  }
  public pause(): void { this.paused = true; }
  public resume(): void {
    this.paused = false;
    this.drain();
  }
  private drain(): void {
    if (this.paused || this.ingesting || this.buffer.length === 0) return;
    this.ingesting = true;
    try {
      const atOnce = this.buffer;
      this.buffer = [];
      for (const data of atOnce) {
        for (const fn of [...this.subs]) {
          try { fn(data); } catch (err) { this.handleError(err as Error); }
        }
      }
    } finally {
      this.ingesting = false;
    }
    if (this.buffer.length > 0) this.drain();
  }
  private applyBackpressure(): void {
    if (this.strategy === "pause") this.paused = true;
    else if (this.strategy === "drop") this.buffer.shift();
    else if (this.strategy === "error") {
      const err = new Error(`streamRelay ${this.rt}: buffer overflow`);
      if (this.errorHandler) this.errorHandler(err);
      else reportError(err);
    }
  }
  private handleError(err: Error): void { if (this.errorHandler) this.errorHandler(err); else reportError(err); }
  public bufferedCount(): number { return this.buffer.length; }
  public subscriberCount(): number { return this.subs.size; }
}
// #endregion
