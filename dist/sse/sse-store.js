// ============================================================================
// STORE (SSE Store with versioning)
// ============================================================================
const store = {};
const storeListeners = new Set();
export function sseSet(key, value, version) {
    const current = store[key];
    store[key] = {
        value,
        version: version ?? (current?.version ?? 0) + 1,
        lastUpdated: Date.now(),
        lastFetched: current?.lastFetched ?? Date.now(),
        pending: false
    };
    notifyStore();
}
export function sseGet(key) {
    const entry = store[key];
    return entry ? { value: entry.value, version: entry.version } : null;
}
export function sseDelete(key) {
    delete store[key];
    notifyStore();
}
export function sseMerge(partial, baseVersion) {
    Object.entries(partial).forEach(([key, value]) => {
        const current = store[key];
        sseSet(key, value, current?.version ?? 0);
    });
}
export function sseReset() {
    Object.keys(store).forEach(key => delete store[key]);
    notifyStore();
}
export function sseGetAll() {
    return { ...store };
}
export function sseSubscribeStore(listener) {
    storeListeners.add(listener);
    listener({ ...store });
    return () => storeListeners.delete(listener);
}
function notifyStore() {
    const snapshot = { ...store };
    storeListeners.forEach(l => l(snapshot));
}
