export declare function sseSubscribe(url: string, rt: string, handler: SSEHandler, retryConfig?: RetryConfig): () => void;
export declare function sseRegisterYmir(url: string, ymir: A): void;
export declare function sseCloseAll(): void;
