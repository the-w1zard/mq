// ============================================================================
// SSE SERVER (Response Handlers)
// ============================================================================


export type ServerResponse = {
  setHeader?: (key: string, value: string) => void;
  write?: (chunk: string) => boolean;
  on?: (event: string, cb: () => void) => void;
  flush?: () => void;
  end?: () => void;
};

export function createSSEChannel(res: ServerResponse): SSEChannel {
  if (res.setHeader) {
    // Node-style response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
  }

  let closed = false;
  let msgId = 0;

  const formatMessage = (event: string, data: unknown, id?: string): string => {
    const lines: string[] = [];
    if (id) lines.push(`id: ${id}`);
    lines.push(`event: ${event}`);
    lines.push(`data: ${JSON.stringify(data)}`);
    lines.push('\n');
    return lines.join('\n');
  };

  const send = (event: string, data: unknown) => {
    if (closed) return;
    
    const message = formatMessage(event, data, String(++msgId));
    
    if (res.write) {
      // Node-style
      res.write(message);
      res.flush?.();
    } else {
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

export function createWebSSEChannel(init: ResponseInit = {}): { response: Response; rt: SSEChannel } {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  let msgId = 0;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(c) { controller = c; },
    cancel() { closed = true; }
  });

  const formatMessage = (event: string, data: unknown, id?: string): string => {
    const lines: string[] = [];
    if (id) lines.push(`id: ${id}`);
    lines.push(`event: ${event}`);
    lines.push(`data: ${JSON.stringify(data)}`);
    lines.push('\n');
    return lines.join('\n');
  };

  const send = (event: string, data: unknown) => {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(formatMessage(event, data, String(++msgId))));
    } catch {
      closed = true;
    }
  };

  const close = () => {
    if (closed) return;
    closed = true;
    try { controller.close(); } catch {}
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

// ============================================================================
// SSE BROADCASTER (Server-side)
// ============================================================================

type BroadcasterClient = {
  id: string;
  send: (event: string, data: unknown) => void;
  channels: Set<string>;
};

export const broadcaster = new class {
  public clients = new Map<string, BroadcasterClient>();
  public channelClients = new Map<string, Set<string>>();

  addClient(client: BroadcasterClient): void {
    this.clients.set(client.id, client);
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.forEach(rt => {
        this.channelClients.get(rt)?.delete(clientId);
      });
      this.clients.delete(clientId);
    }
  }

  subscribe(clientId: string, rt: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.channels.add(rt);
    
    if (!this.channelClients.has(rt)) {
      this.channelClients.set(rt, new Set());
    }
    this.channelClients.get(rt)!.add(clientId);
  }

  unsubscribe(clientId: string, rt: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.delete(rt);
    }
    this.channelClients.get(rt)?.delete(clientId);
  }

  broadcast(rt: string, event: string, data: unknown): void {
    const clientIds = this.channelClients.get(rt);
    if (!clientIds) return;

    clientIds.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.send(event, data);
        } catch {
          // Client probably disconnected
          this.removeClient(clientId);
        }
      }
    });
  }

  broadcastAll(event: string, data: unknown): void {
    this.clients.forEach(client => {
      try {
        client.send(event, data);
      } catch {
        this.removeClient(client.id);
      }
    });
  }
};

export { broadcaster as SSEBroadcaster };
