---
title: WebSocket Handling
---

# WebSocket Handling

## HTTP vs WebSocket

**HTTP**: Request-response, connection closes after response

**WebSocket**: Long-lived connection, bidirectional communication

```
HTTP:  Client → Request → Server → Response → Close
WebSocket: Client ↔ Server (connection stays open) ↔ Server
```

## How WebSocket Upgrade Works

```
1. Client sends HTTP request with:
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: ...

2. Server responds:
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Sec-WebSocket-Accept: ...

3. Connection switches to WebSocket protocol
4. Bidirectional messaging begins
```

## Traefik WebSocket Support

Traefik automatically handles WebSocket upgrade:

No special configuration needed! Traefik:

1. Sees Upgrade header
2. Doesn't buffer response
3. Switches to tunnel mode
4. Forwards all data bidirectionally
5. Keeps connection open

## Configuration Example

```yaml
services:
  chat-app:
    loadBalancer:
      servers:
        - url: "http://chat-backend:8080"

routers:
  chat:
    rule: "Host(`chat.local`)"
    service: chat-app
```

Client connects via WebSocket:

```javascript
const ws = new WebSocket("ws://chat.local:8080");
ws.onmessage = (msg) => {
  console.log(msg.data);
};
```

Traefik transparently forwards WebSocket frames.

## Connection Upgrade Headers

Traefik preserves upgrade headers:

```
Client: "Upgrade: websocket"
Traefik: Forwards to backend: "Upgrade: websocket"
Backend: Responds with 101 Switching Protocols
Traefik: Returns to client: 101 Switching Protocols
Tunnel established
```

## Buffering with WebSocket

Don't buffer WebSocket connections:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      readers:
        headerTimeout: 0  # Disable for streaming
```

Allow streaming without buffering entire message.

## Load Balancing WebSocket

WebSocket connects to one backend, stays connected:

```
Client A ─→ Traefik ─→ Backend 1
Client B ─→ Traefik ─→ Backend 2
Client C ─→ Traefik ─→ Backend 1
```

Traefik balances new connections across backends.

## Connection Persistence

WebSocket must maintain same backend connection:

```
Client A → Backend 1 (connection 1)
  Message 1 → Backend 1 (same connection)
  Message 2 → Backend 1 (same connection)
  Message 3 → Backend 1 (same connection)
```

Can't switch backends mid-connection.

## Sticky Sessions for WebSocket

Ensure same client always hits same backend:

```yaml
services:
  chat:
    loadBalancer:
      sticky:
        cookie:
          name: "lb"
      servers:
        - url: "http://ws-1:8080"
        - url: "http://ws-2:8080"
```

Cookie ensures client always connects to same backend.

## WebSocket Timeouts

Idling WebSocket connections timeout:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      readers:
        idleTimeout: 60s  # Close if idle for 60s
```

Adjust based on WebSocket usage pattern.

## Heartbeat/Ping-Pong

Prevent timeout with periodic messages:

```javascript
setInterval(() => {
  ws.send(JSON.stringify({type: 'ping'}));
}, 30000);  // Every 30 seconds
```

Backend responds with pong, connection stays alive.

## Debugging WebSocket Issues

Enable tracing:

```bash
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:8080/ws
```

Check for 101 Switching Protocols response.

## HTTPS WebSocket (WSS)

Secure WebSocket over HTTPS:

```javascript
const wss = new WebSocket("wss://chat.local");
```

Traefik handles:

1. HTTPS connection
2. TLS negotiation
3. WebSocket upgrade
4. Tunneling over encrypted channel

## Middleware with WebSocket

Some middlewares don't work with WebSocket:

**Works**: Rate limiting (at connection level), authentication (upgrade check)

**Doesn't work**: Response compression (not applicable to WebSocket frames)

## Key Takeaway

Traefik transparently handles WebSocket upgrades and tunneling. No special configuration needed for basic WebSocket support. Use sticky sessions for multiple backends. Prevent timeout with heartbeat messages.
