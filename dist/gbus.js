// GLOBAL_BUS.ts
const MESH = Symbol.for("SIG_BUS.GLOBAL_MESH.v1");
const RETRY_MS = 20_000;
const ACK_TIMEOUT_MS = 10_000;
function mesh() {
    const global = globalThis;
    return global[MESH] ??= {
        sequence: 0,
        queue: new Map()
    };
}
// Your existing globalThis[root] -> master -> slave_CHANNELS layout.
function channels(s, m, r) {
    const global = globalThis;
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
    let registry = master.get(key);
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
function add(map, key, handler) {
    let set = map.get(key);
    if (!set)
        map.set(key, set = new Set());
    set.add(handler);
}
function addNested(map, first, second, handler) {
    let inner = map.get(first);
    if (!inner)
        map.set(first, inner = new Map());
    add(inner, second, handler);
}
function remove(map, key, handler) {
    const set = map.get(key);
    set?.delete(handler);
    if (set?.size === 0)
        map.delete(key);
}
function removeNested(map, first, second, handler) {
    const inner = map.get(first);
    if (!inner)
        return;
    remove(inner, second, handler);
    if (!inner.size)
        map.delete(first);
}
function matching(pending) {
    const { msg, channels: c } = pending;
    const root = c.channels.get(msg.r);
    const master = c.sub_channels.get(msg.m)?.get(msg.r);
    const slave = c.trip_channels.get(msg.s)?.get(msg.m);
    const key = c.quad_channels.get(msg.k)?.get(msg.s);
    if (!root || !master || !slave || !key)
        return [];
    // Match all four tiers; do not union them into a broad broadcast.
    return [...key].filter(handler => root.has(handler) &&
        master.has(handler) &&
        slave.has(handler));
}
function validReply(value) {
    return value !== undefined && value !== false;
}
function complete(state, pending) {
    const deliveries = pending.deliveries;
    if (pending.done ||
        !deliveries?.length ||
        !deliveries.every(delivery => delivery.acked)) {
        return;
    }
    pending.done = true;
    pending.msg._ack = true;
    state.queue.delete(pending.msg.id);
    clearTimeout(pending.expiry);
    const values = deliveries.map(delivery => delivery.value);
    pending.resolve(values.length === 1 ? values[0] : values);
}
function dispatch(state, pending) {
    if (pending.done)
        return;
    pending.next = Date.now() + RETRY_MS;
    if (!pending.deliveries) {
        const handlers = matching(pending);
        // No receiver yet: keep the original call queued.
        if (!handlers.length)
            return;
        pending.deliveries = handlers.map(handler => ({
            handler,
            acked: false,
            running: false,
            attempt: 0
        }));
    }
    for (const delivery of pending.deliveries) {
        if (delivery.acked || delivery.running)
            continue;
        delivery.running = true;
        const attempt = ++delivery.attempt;
        const release = () => {
            if (delivery.attempt === attempt) {
                delivery.running = false;
            }
        };
        const timeout = setTimeout(release, ACK_TIMEOUT_MS);
        // This closure is the return route to the originating send().
        const reply = (value) => {
            if (pending.done ||
                delivery.acked ||
                !validReply(value)) {
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
            if (pending.done || delivery.acked)
                return;
            return delivery.handler(pending.msg.p.p, {
                msg: pending.msg,
                attempt,
                reply
            });
        })
            .then(value => {
            reply(value);
            clearTimeout(timeout);
            release();
        }, () => {
            clearTimeout(timeout);
            release();
            // Still unacknowledged; retry from the shared queue.
        });
    }
}
function schedule(state) {
    if (state.timer !== undefined) {
        clearTimeout(state.timer);
        state.timer = undefined;
    }
    if (!state.queue.size)
        return;
    let next = Infinity;
    for (const pending of state.queue.values()) {
        next = Math.min(next, pending.next);
    }
    state.timer = setTimeout(() => {
        state.timer = undefined;
        flush(state);
    }, Math.max(0, next - Date.now()));
}
function flush(state) {
    const now = Date.now();
    for (const pending of state.queue.values()) {
        if (!pending.done && pending.next <= now) {
            dispatch(state, pending);
        }
    }
    schedule(state);
}
export class GLOBAL_BUS {
    sl;
    ms;
    rt;
    constructor(sl = "default", ms = "default", rt = "SIG_BUS") {
        this.sl = sl;
        this.ms = ms;
        this.rt = rt;
    }
    sub(handler, k, sl = this.sl, ms = this.ms, rt = this.rt) {
        const c = channels(sl, ms, rt);
        // Unique registration prevents one unsubscribe from removing
        // another registration of the same caller-supplied function.
        const registered = (payload, context) => handler(payload, context);
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
    send(payload, k, sl = this.sl, ms = this.ms, rt = this.rt, ttl) {
        if (ttl !== undefined &&
            (!Number.isFinite(ttl) || ttl <= 0)) {
            return Promise.reject(new RangeError("ttl must be a positive number of milliseconds"));
        }
        const state = mesh();
        const c = channels(sl, ms, rt);
        const ts = Date.now();
        const id = `${ts.toString(36)}:${++state.sequence}`;
        return new Promise((resolve, reject) => {
            const pending = {
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
                resolve: value => resolve(value),
                reject
            };
            state.queue.set(id, pending);
            if (ttl !== undefined) {
                pending.expiry = setTimeout(() => {
                    if (pending.done)
                        return;
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
    stream(k, sl = this.sl, ms = this.ms, rt = this.rt) {
        let off = () => { };
        return new ReadableStream({
            start: controller => {
                off = this.sub(payload => {
                    controller.enqueue(payload);
                    return true;
                }, k, sl, ms, rt);
            },
            cancel: () => off()
        });
    }
    duplex(receiveK, sendK, sl = this.sl, ms = this.ms, rt = this.rt) {
        const send = (payload) => this.send(payload, sendK, sl, ms, rt);
        return {
            readable: this.stream(receiveK, sl, ms, rt),
            writable: new WritableStream({
                write: async (payload) => {
                    await send(payload);
                }
            }),
            // Use this when the caller needs the response value.
            send
        };
    }
}
