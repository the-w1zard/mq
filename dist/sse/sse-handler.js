// ============================================================================
// SSE SERVER (Response Handlers)
// ============================================================================
export function createSSEChannel(res) {
    if (res.setHeader) {
        // Node-style response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
    }
    let closed = false;
    let msgId = 0;
    const formatMessage = (event, data, id) => {
        const lines = [];
        if (id)
            lines.push(`id: ${id}`);
        lines.push(`event: ${event}`);
        lines.push(`data: ${JSON.stringify(data)}`);
        lines.push('\n');
        return lines.join('\n');
    };
    const send = (event, data) => {
        if (closed)
            return;
        const message = formatMessage(event, data, String(++msgId));
        if (res.write) {
            // Node-style
            res.write(message);
            res.flush?.();
        }
        else {
            // Web standard - would need different handling
            console.warn('SSE send called but response has no write method');
        }
    };
    const close = () => {
        closed = true;
        res.end?.();
    };
    if (res.on) {
        res.on('close', close);
    }
    return { id: String(Date.now()), send, close, status: () => closed ? 'disconnected' : 'connected' };
}
export function createWebSSEChannel(init = {}) {
    let controller;
    let closed = false;
    let msgId = 0;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(c) { controller = c; },
        cancel() { closed = true; }
    });
    const formatMessage = (event, data, id) => {
        const lines = [];
        if (id)
            lines.push(`id: ${id}`);
        lines.push(`event: ${event}`);
        lines.push(`data: ${JSON.stringify(data)}`);
        lines.push('\n');
        return lines.join('\n');
    };
    const send = (event, data) => {
        if (closed)
            return;
        try {
            controller.enqueue(encoder.encode(formatMessage(event, data, String(++msgId))));
        }
        catch {
            closed = true;
        }
    };
    const close = () => {
        if (closed)
            return;
        closed = true;
        try {
            controller.close();
        }
        catch { }
    };
    const response = new Response(stream, {
        ...init,
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            ...init.headers,
        },
    });
    return {
        response,
        rt: { id: String(Date.now()), send, close, status: () => closed ? 'disconnected' : 'connected' }
    };
}
export const broadcaster = new class {
    clients = new Map();
    channelClients = new Map();
    addClient(client) {
        this.clients.set(client.id, client);
    }
    removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.channels.forEach(rt => {
                this.channelClients.get(rt)?.delete(clientId);
            });
            this.clients.delete(clientId);
        }
    }
    subscribe(clientId, rt) {
        const client = this.clients.get(clientId);
        if (!client)
            return;
        client.channels.add(rt);
        if (!this.channelClients.has(rt)) {
            this.channelClients.set(rt, new Set());
        }
        this.channelClients.get(rt).add(clientId);
    }
    unsubscribe(clientId, rt) {
        const client = this.clients.get(clientId);
        if (client) {
            client.channels.delete(rt);
        }
        this.channelClients.get(rt)?.delete(clientId);
    }
    broadcast(rt, event, data) {
        const clientIds = this.channelClients.get(rt);
        if (!clientIds)
            return;
        clientIds.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client) {
                try {
                    client.send(event, data);
                }
                catch {
                    // Client probably disconnected
                    this.removeClient(clientId);
                }
            }
        });
    }
    broadcastAll(event, data) {
        this.clients.forEach(client => {
            try {
                client.send(event, data);
            }
            catch {
                this.removeClient(client.id);
            }
        });
    }
};
export { broadcaster as SSEBroadcaster };
