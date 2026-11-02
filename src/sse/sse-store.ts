// ============================================================================
// STORE (SSE Store with versioning)
// ============================================================================

export type SSEStore = Record<string, {
  value: unknown;
  version: number;
  lastUpdated: number;
  lastFetched: number;
  pending: boolean;
  error?: Error;
}>;

const store: SSEStore = {};
const storeListeners = new Set<(store: SSEStore) => void>();

export function sseSet(key: string, value: unknown, version?: number): void {
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

export function sseGet(key: string): { value: unknown; version: number } | null {
  const entry = store[key];
  return entry ? { value: entry.value, version: entry.version } : null;
}

export function sseDelete(key: string): void {
  delete store[key];
  notifyStore();
}

export function sseMerge(partial: Record<string, unknown>, baseVersion?: number): void {
  Object.entries(partial).forEach(([key, value]) => {
    const current = store[key];
    sseSet(key, value, current?.version ?? 0);
  });
}

export function sseReset(): void {
  Object.keys(store).forEach(key => delete store[key]);
  notifyStore();
}

export function sseGetAll(): SSEStore {
  return { ...store };
}

export function sseSubscribeStore(listener: (store: SSEStore) => void): () => void {
  storeListeners.add(listener);
  listener({ ...store });
  return () => storeListeners.delete(listener);
}

function notifyStore(): void {
  const snapshot = { ...store };
  storeListeners.forEach(l => l(snapshot));
}
