---
title: Request Lifecycle
---

# Request Lifecycle

## Full Journey of an HTTP Request

Let's trace what happens when you visit google.com

### Stage 1: DNS Resolution

```
Browser: "Where is google.com?"
    ↓
DNS Resolver (recursive resolver)
    ↓
Root Nameserver: "Ask TLD server"
    ↓
TLD Nameserver (.com): "Ask authoritative server"
    ↓
Google's Nameserver: "It's 142.250.185.46"
    ↓
Browser gets IP: 142.250.185.46
```

### Stage 2: TCP Connection (3-way Handshake)

```
Browser: "Hello, 142.250.185.46:443, can we talk?" (SYN)
    ↓
Google: "Yes, I can talk" (SYN-ACK)
    ↓
Browser: "Great, let's go" (ACK)
    ↓
Connection established
```

### Stage 3: TLS Handshake (for HTTPS)

```
Browser: "Can you prove who you are?"
    ↓
Google: "Here's my certificate signed by Digicert" (Certificate)
    ↓
Browser: "I trust Digicert, certificate is valid"
    ↓
Browser: "Let's encrypt using this cipher suite" (Client Key Exchange)
    ↓
Google: "Agreed, here's my key" (Server Key Exchange)
    ↓
Encrypted connection ready
```

### Stage 4: HTTP Request

```
Browser sends:
GET / HTTP/1.1
Host: google.com
User-Agent: Chrome/91.0
Accept: text/html
...other headers...
[body if POST request]
```

### Stage 5: Server Processing

```
Google's server:
1. Receives request
2. Parses URL and headers
3. Routes to appropriate handler
4. Executes business logic
5. Generates response
6. Adds headers (Content-Type, Cache-Control, etc.)
7. Returns response
```

### Stage 6: HTTP Response

```
Server sends:
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 12345
Cache-Control: public, max-age=3600
...other headers...
[HTML body]
```

### Stage 7: Browser Processing

```
Browser receives response:
1. Parses HTML
2. Encounters <link> tags, fetches CSS
3. Encounters <script> tags, fetches JS
4. Renders page while loading resources
5. Executes JavaScript
6. Page is interactive
```

### Stage 8: Connection Close

```
Browser/Server: "We're done, closing connection" (FIN)
TCP connection closes
```

## Timing Breakdown

Typical request for google.com:

- DNS lookup: 50-100ms
- TCP handshake: 30-50ms
- TLS handshake: 100-150ms
- HTTP request/response: 50-200ms
- **Total**: 230-500ms before page starts rendering

Then hundreds more MS for:
- CSS parsing and styling
- JavaScript execution
- Image loading
- Final rendering

## With Traefik in the Middle

```
Client HTTPS request
    ↓
Traefik (handles TLS termination)
    ↓
Traefik decrypts, sees routing rules
    ↓
Traefik routes to appropriate backend (HTTP)
    ↓
Backend processes request
    ↓
Backend sends HTTP response
    ↓
Traefik encrypts response
    ↓
Client receives HTTPS response
```

## Key Points in Lifecycle

**DNS**: Slowest part if not cached, happens once per domain
**TCP Handshake**: Minimal cost, happens once per connection
**TLS Handshake**: Expensive, happens once per HTTPS connection
**HTTP Request/Response**: Actual work, varies by content size
**Rendering**: Browser work, not server

## Connection Reuse (Keep-Alive)

Modern HTTP benefits from persistent connections:

```
Connection established (handshake overhead once)
Request 1 ↔ Response 1
Request 2 ↔ Response 2
Request 3 ↔ Response 3
Connection closes
```

This avoids repeating handshake overhead for each resource.

## Key Takeaway

An HTTP request journey involves DNS, TCP, TLS, HTTP protocol, server processing, and response. Understanding this lifecycle helps you debug performance issues and understand where bottlenecks occur.
