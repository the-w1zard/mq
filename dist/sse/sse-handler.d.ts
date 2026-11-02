export type ServerResponse = {
    setHeader?: (key: string, value: string) => void;
    write?: (chunk: string) => boolean;
    on?: (event: string, cb: () => void) => void;
    flush?: () => void;
    end?: () => void;
};
export declare function createSSEChannel(res: ServerResponse): SSEChannel;
export declare function createWebSSEChannel(init?: ResponseInit): {
    response: Response;
    rt: SSEChannel;
};
type BroadcasterClient = {
    id: string;
    send: (event: string, data: unknown) => void;
    channels: Set<string>;
};
export declare const broadcaster: {
    clients: Map<string, BroadcasterClient>;
    channelClients: Map<string, Set<string>>;
    addClient(client: BroadcasterClient): void;
    removeClient(clientId: string): void;
    subscribe(clientId: string, rt: string): void;
    unsubscribe(clientId: string, rt: string): void;
    broadcast(rt: string, event: string, data: unknown): void;
    broadcastAll(event: string, data: unknown): void;
};
export { broadcaster as SSEBroadcaster };
