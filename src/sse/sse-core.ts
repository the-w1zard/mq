// FILE: sse-core.ts
/**
 * #sauron/sse-core
 * 
 * Server-Sent Events core with Ymir conflict resolution
 * 
 * YMIR PATTERN:
 * 1. Before any action, fetch current server state
 * 2. Merge with local changes
 * 3. Push merged result back
 * 4. Zero errors, even with concurrent edits
 */

// ============================================================================
// TYPES
// ============================================================================

export type SSEChannel = {
  id: string;
  send: (event: string, data: unknown) => void;
  close: () => void;
  status: () => 'connected' | 'disconnected' | 'reconnecting';
};

export type SSEEvent = {
  event: string;
  data: unknown;
  id?: string;
  timestamp: number;
};

export type SSEMessage = {
  rt: string;
  event: string;
  data: unknown;
  id?: string;
  version?: number;
};

export type SSEHandler = (data: unknown, metadata?: { id?: string; version?: number }) => void;

export type RetryConfig = {
  baseDelay?: number;    // Default: 1000ms
  maxDelay?: number;     // Default: 30000ms
  maxAttempts?: number;  // Default: 10
  backoff?: 'exponential' | 'linear' | 'fixed';
};

export type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge' | 'version' | 'custom';

export type YmirConfig<T = unknown> = {
  /** Conflict resolution strategy */
  conflictStrategy?: ConflictStrategy;
  /** Custom merge function */
  mergeFn?: (local: T, server: T) => T;
  /** Version field name for version-based resolution */
  versionField?: string;
  /** Auto-fetch on focus */
  prefetchOnFocus?: boolean;
  /** Prefetch threshold in ms (fetch if last fetch > threshold) */
  prefetchThreshold?: number;
  /** Debounce write in ms */
  debounce?: number;
  /** Retry configuration */
  retry?: RetryConfig;
};


