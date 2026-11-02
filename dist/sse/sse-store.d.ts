export type SSEStore = Record<string, {
    value: unknown;
    version: number;
    lastUpdated: number;
    lastFetched: number;
    pending: boolean;
    error?: Error;
}>;
export declare function sseSet(key: string, value: unknown, version?: number): void;
export declare function sseGet(key: string): {
    value: unknown;
    version: number;
} | null;
export declare function sseDelete(key: string): void;
export declare function sseMerge(partial: Record<string, unknown>, baseVersion?: number): void;
export declare function sseReset(): void;
export declare function sseGetAll(): SSEStore;
export declare function sseSubscribeStore(listener: (store: SSEStore) => void): () => void;
