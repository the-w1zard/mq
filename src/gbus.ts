// GLOBAL_BUS.ts
type K = string;
type Off = () => void;
type Timer = ReturnType<typeof setTimeout>;
export interface Message<P = unknown> {
  id: string;
  r: K;
  m: K;
  s: K;
  k: K;
  p: { p: P };
  ts: number;
  ttl?: number;
  _ack: boolean;
}
export interface Context<P = unknown> {
  msg: Message<P>;
  attempt: number;
  reply(value: unknown): boolean;
}
export type Handler<P = any> = (  payload: P,  context: Context<P>) => unknown | Promise<unknown>;
interface Channels {
  channels: Map<K, Set<Handler>>;
  sub_channels: Map<K, Map<K, Set<Handler>>>;
  trip_channels: Map<K, Map<K, Set<Handler>>>;
  quad_channels: Map<K, Map<K, Set<Handler>>>;
}
interface Delivery {
  handler: Handler;
  acked: boolean;
  running: boolean;
  attempt: number;
  value?: unknown;
}
interface Pending {
  msg: Message;
  channels: Channels;
  deliveries?: Delivery[];
  next: number;
  done: boolean;
  expiry?: Timer;
  resolve(value: unknown): void;
  reject(error: Error): void;
}
interface Mesh {
  sequence: number;
  queue: Map<string, Pending>;
  timer?: Timer;
}
const MESH = Symbol.for("SIG_BUS.GLOBAL_MESH.v1");
const RETRY_MS = 20_000;
const ACK_TIMEOUT_MS = 10_000;
function mesh(): Mesh {
  const global = globalThis as any;

  return global[MESH] ??= {
    sequence: 0,
    queue: new Map<string, Pending>()
  };
}// Your existing globalThis[root] -> master -> slave_CHANNELS layout.
function channels(s: K, m: K, r: K): Channels {
  const global = globalThis as any;

  const root = global[r] ??= new Map();

  if (!(root instanceof Map)) {
    throw new TypeError(`globalThis[${JSON.stringify(r)}] must be a Map`);
  }

  let master = root.get(m);

  if (master === undefined) {
    master = new Map();
    root.set(m, master);
  }

  if (!(master instanceof Map)) {
    throw new TypeError(`Master channel ${m} must be a Map`);
  }

  const key = `${s}_CHANNELS`;
  let registry = master.get(key) as Channels | undefined;

  if (!registry) {
    registry = {
      channels: new Map(),
      sub_channels: new Map(),
      trip_channels: new Map(),
      quad_channels: new Map()
    };

    master.set(key, registry);
  }

  return registry;
}
function add(
  map: Map<K, Set<Handler>>,
  key: K,
  handler: Handler
): void {
  let set = map.get(key);

  if (!set) map.set(key, set = new Set());

  set.add(handler);
}
function addNested(
  map: Map<K, Map<K, Set<Handler>>>,
  first: K,
  second: K,
  handler: Handler
): void {
  let inner = map.get(first);

  if (!inner) map.set(first, inner = new Map());

  add(inner, second, handler);
}
function remove(
  map: Map<K, Set<Handler>>,
  key: K,
  handler: Handler
): void {
  const set = map.get(key);

  set?.delete(handler);

  if (set?.size === 0) map.delete(key);
}
function removeNested(
  map: Map<K, Map<K, Set<Handler>>>,
  first: K,
  second: K,
  handler: Handler
): void {
  const inner = map.get(first);

  if (!inner) return;

  remove(inner, second, handler);

  if (!inner.size) map.delete(first);
}
function matching(pending: Pending): Handler[] {
  const { msg, channels: c } = pending;

  const root = c.channels.get(msg.r);
  const master = c.sub_channels.get(msg.m)?.get(msg.r);
  const slave = c.trip_channels.get(msg.s)?.get(msg.m);
  const key = c.quad_channels.get(msg.k)?.get(msg.s);

  if (!root || !master || !slave || !key) return [];

  // Match all four tiers; do not union them into a broad broadcast.
  return [...key].filter(handler =>
    root.has(handler) &&
    master.has(handler) &&
    slave.has(handler)
  );
}
function validReply(value: unknown): boolean {
  return value !== undefined && value !== false;
}
function complete(state: Mesh, pending: Pending): void {
  const deliveries = pending.deliveries;

  if (
    pending.done ||
    !deliveries?.length ||
    !deliveries.every(delivery => delivery.acked)
  ) {
    return;
  }

  pending.done = true;
  pending.msg._ack = true;
  state.queue.delete(pending.msg.id);
  clearTimeout(pending.expiry);

  const values = deliveries.map(delivery => delivery.value);

  pending.resolve(values.length === 1 ? values[0] : values);
}
function dispatch(state: Mesh, pending: Pending): void {
  if (pending.done) return;

  pending.next = Date.now() + RETRY_MS;

  if (!pending.deliveries) {
    const handlers = matching(pending);

    // No receiver yet: keep the original call queued.
    if (!handlers.length) return;

    pending.deliveries = handlers.map(handler => ({
      handler,
      acked: false,
      running: false,
      attempt: 0
    }));
  }

  for (const delivery of pending.deliveries) {
    if (delivery.acked || delivery.running) continue;

    delivery.running = true;
    const attempt = ++delivery.attempt;

    const release = () => {
      if (delivery.attempt === attempt) {
        delivery.running = false;
      }
    };

    const timeout = setTimeout(release, ACK_TIMEOUT_MS);

    // This closure is the return route to the originating send().
    const reply = (value: unknown): boolean => {
      if (
        pending.done ||
        delivery.acked ||
        !validReply(value)
      ) {
        return false;
      }

      delivery.acked = true;
      delivery.value = value;

      clearTimeout(timeout);
      release();
      complete(state, pending);

      return true;
    };

    void Promise.resolve()
      .then(() => {
        if (pending.done || delivery.acked) return;

        return delivery.handler(pending.msg.p.p, {
          msg: pending.msg,
          attempt,
          reply
        });
      })
      .then(
        value => {
          reply(value);
          clearTimeout(timeout);
          release();
        },
        () => {
          clearTimeout(timeout);
          release();
          // Still unacknowledged; retry from the shared queue.
        }
      );
  }
}
function schedule(state: Mesh): void {
  if (state.timer !== undefined) {
    clearTimeout(state.timer);
    state.timer = undefined;
  }

  if (!state.queue.size) return;

  let next = Infinity;

  for (const pending of state.queue.values()) {
    next = Math.min(next, pending.next);
  }

  state.timer = setTimeout(() => {
    state.timer = undefined;
    flush(state);
  }, Math.max(0, next - Date.now()));
}
function flush(state: Mesh): void {
  const now = Date.now();

  for (const pending of state.queue.values()) {
    if (!pending.done && pending.next <= now) {
      dispatch(state, pending);
    }
  }

  schedule(state);
}
export class GLOBAL_BUS {
  constructor(
    public readonly sl = "default",
    public readonly ms = "default",
    public readonly rt = "SIG_BUS"
  ) {}

  public sub<P = unknown>(
    handler: Handler<P>,
    k: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt
  ): Off {
    const c = channels(sl, ms, rt);

    // Unique registration prevents one unsubscribe from removing
    // another registration of the same caller-supplied function.
    const registered: Handler = (payload, context) =>
      handler(payload, context);

    add(c.channels, rt, registered);
    addNested(c.sub_channels, ms, rt, registered);
    addNested(c.trip_channels, sl, ms, registered);
    addNested(c.quad_channels, k, sl, registered);

    return () => {
      remove(c.channels, rt, registered);
      removeNested(c.sub_channels, ms, rt, registered);
      removeNested(c.trip_channels, sl, ms, registered);
      removeNested(c.quad_channels, k, sl, registered);
    };
  }

  public send<R = unknown>(
    payload: unknown,
    k: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt,
    ttl?: number
  ): Promise<R> {
    if (
      ttl !== undefined &&
      (!Number.isFinite(ttl) || ttl <= 0)
    ) {
      return Promise.reject(
        new RangeError("ttl must be a positive number of milliseconds")
      );
    }

    const state = mesh();
    const c = channels(sl, ms, rt);
    const ts = Date.now();
    const id = `${ts.toString(36)}:${++state.sequence}`;

    return new Promise<R>((resolve, reject) => {
      const pending: Pending = {
        msg: {
          id,
          r: rt,
          m: ms,
          s: sl,
          k,
          p: { p: payload },
          ts,
          ttl,
          _ack: false
        },
        channels: c,
        next: ts,
        done: false,
        resolve: value => resolve(value as R),
        reject
      };

      state.queue.set(id, pending);

      if (ttl !== undefined) {
        pending.expiry = setTimeout(() => {
          if (pending.done) return;

          pending.done = true;
          state.queue.delete(id);
          pending.reject(new Error(`Message ${id} exceeded its TTL`));
          schedule(state);
        }, ttl);
      }

      // New message + due retries across the entire mesh.
      flush(state);
    });
  }

  public stream<P = unknown>(
    k: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt
  ): ReadableStream<P> {
    let off: Off = () => {};

    return new ReadableStream<P>({
      start: controller => {
        off = this.sub<P>(payload => {
          controller.enqueue(payload);
          return true;
        }, k, sl, ms, rt);
      },

      cancel: () => off()
    });
  }

  public duplex<Incoming = unknown, Outgoing = unknown>(
    receiveK: K,
    sendK: K,
    sl = this.sl,
    ms = this.ms,
    rt = this.rt
  ) {
    const send = <R = unknown>(payload: Outgoing) =>
      this.send<R>(payload, sendK, sl, ms, rt);

    return {
      readable: this.stream<Incoming>(receiveK, sl, ms, rt),

      writable: new WritableStream<Outgoing>({
        write: async payload => {
          await send(payload);
        }
      }),

      // Use this when the caller needs the response value.
      send
    };
  }
}
