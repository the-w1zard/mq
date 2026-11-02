// the-cloud/sse/sse-client.ts

import { sseGet, sseSet } from "./sse-store.js";


// ============================================================================
// SSE CLIENT (EventSource Manager)
// ============================================================================

type ManagedSource = {
  source: EventSource;
  url: string;
  channels: Map<string, Set<SSEHandler>>;
  attempts: number;
  retryTimer: ReturnType<typeof setTimeout> | null;
  status: 'connected' | 'disconnected' | 'reconnecting';
  ymirInstances: Map<string,A>;
};

const sources = new Map<string, ManagedSource>();

function scheduleReconnect(url: string, config: Required<RetryConfig>) {
  const managed = sources.get(url);
  if (!managed) return;

  const { baseDelay, maxDelay, maxAttempts, backoff } = config;

  if (managed.attempts >= maxAttempts) {
    sources.delete(url);
    return;
  }

  let delay: number;
  switch (backoff) {
    case 'linear':
      delay = baseDelay * (managed.attempts + 1);
      break;
    case 'fixed':
      delay = baseDelay;
      break;
    case 'exponential':
    default:
      delay = Math.min(baseDelay * 2 ** managed.attempts, maxDelay);
  }

  managed.status = 'reconnecting';
  
  managed.retryTimer = setTimeout(() => {
    managed.attempts++;
    connect(url, config);
  }, delay);
}

function connect(url: string, retryConfig: Required<RetryConfig>) {
  const existing = sources.get(url);
  const channels = existing?.channels ?? new Map();
  const ymirInstances = existing?.ymirInstances ?? new Map();

  const source = new EventSource(url, { withCredentials: true });

  const managed: ManagedSource = {
    source,
    url,
    channels,
    attempts: existing?.attempts ?? 0,
    retryTimer: null,
    status: 'connected',
    ymirInstances
  };

  sources.set(url, managed);

  source.addEventListener('message', (e: MessageEvent) => {
    try {
      const messages = JSON.parse(e.data) as SSEMessage | SSEMessage[];
      const msgArray = Array.isArray(messages) ? messages : [messages];
      
      msgArray.forEach(msg => {
        // Store in global store
        sseSet(msg.rt, msg.data, msg.version);
        
        // Notify rt subscribers
        managed.channels.get(msg.rt)?.forEach(h => 
          h(msg.data, { id: msg.id, version: msg.version })
        );

        // Update Ymir instances
        const ymir = managed.ymirInstances.get(msg.rt);
        if (ymir) {
          // Ymir will handle conflict resolution when needed
        }
      });
    } catch {}
  });

  source.addEventListener('error', () => {
    managed.status = 'disconnected';
    source.close();
    scheduleReconnect(url, retryConfig);
  });

  source.addEventListener('open', () => {
    managed.attempts = 0;
    managed.status = 'connected';
  });
}

export function sseSubscribe(
  url: string,
  rt: string,
  handler: SSEHandler,
  retryConfig: RetryConfig = {}
): () => void {
  const config: Required<RetryConfig> = {
    baseDelay: retryConfig.baseDelay ?? 1000,
    maxDelay: retryConfig.maxDelay ?? 30000,
    maxAttempts: retryConfig.maxAttempts ?? 10,
    backoff: retryConfig.backoff ?? 'exponential'
  };

  if (!sources.has(url)) connect(url, config);

  const managed = sources.get(url)!;

  if (!managed.channels.has(rt)) {
    managed.channels.set(rt, new Set());
  }
  
  managed.channels.get(rt)!.add(handler);

  // Send current store value immediately if exists
  const current = sseGet(rt);
  if (current) {
    handler(current.value, { version: current.version });
  }

  return () => {
    const channelHandlers = managed.channels.get(rt);
    if (channelHandlers) {
      channelHandlers.delete(handler);
      if (channelHandlers.size === 0) {
        managed.channels.delete(rt);
      }
    }

    if (managed.channels.size === 0 && managed.ymirInstances.size === 0) {
      managed.source.close();
      if (managed.retryTimer) clearTimeout(managed.retryTimer);
      sources.delete(url);
    }
  };
}

export function sseRegisterYmir(url: string, ymir: A): void {
  if (!sources.has(url)) return;
  const managed = sources.get(url)!;
  managed.ymirInstances.set(ymir['key'], ymir);
}

export function sseCloseAll(): void {
  sources.forEach(m => {
    m.source.close();
    if (m.retryTimer) clearTimeout(m.retryTimer);
  });
  sources.clear();
}
