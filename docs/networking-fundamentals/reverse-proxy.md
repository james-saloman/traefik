---
title: Reverse Proxy
---

# Reverse Proxy

## What is a Reverse Proxy?

A reverse proxy sits between clients and backend servers, intercepting requests and forwarding them.

**Normal flow**: Client → Server
**With reverse proxy**: Client → Reverse Proxy → Server

It's called "reverse" because from the server's perspective, the proxy appears to be the client.

## How It Works

```
User (192.168.1.100:52000) 
    ↓
Reverse Proxy (80, 443)
    ↓
Backend Server (192.168.1.50:8080, private)
```

The user never talks directly to the backend server. All communication goes through the proxy.

## Key Benefits

**Load Balancing**: Distribute requests across multiple backend servers
- Server 1 gets 50% of traffic
- Server 2 gets 50% of traffic
- One fails? Traffic automatically goes to the other

**SSL/TLS Termination**: Decrypt HTTPS traffic once at proxy level
- Don't need SSL certificates on every backend
- Reduces CPU load on backends
- Centralized certificate management

**Security**: Backend servers are hidden behind the proxy
- Hide internal IP addresses
- Filter malicious requests at proxy level
- DDoS protection at edge

**Caching**: Proxy can cache responses
- Serve repeated requests from cache
- Reduces backend load
- Faster response times

**Header Modification**: Add/remove/modify HTTP headers
- Add security headers
- Pass client IP to backends (X-Forwarded-For)
- Remove sensitive headers

**Request Routing**: Route to different backends based on rules
- Route by domain name
- Route by path (/api → api-server, /images → static-server)
- Route by hostname
- Route by custom headers

## Common Use Cases

**Multi-service architecture**: Route requests to different microservices
**High availability**: Multiple identical servers behind proxy
**API Gateway**: Single entry point for multiple APIs
**Static content delivery**: Caching layer for static files
**Security**: Shield backend servers from direct internet access

## Reverse Proxy vs Forward Proxy

**Reverse Proxy**: Sits in front of servers (what Traefik does)
- Client doesn't know about it
- Protects backend servers

**Forward Proxy**: Sits in front of clients (like a VPN)
- Server doesn't know client's real IP
- Protects client privacy

## Traefik is a Reverse Proxy

Traefik sits between your clients and backend services, handling:
- HTTPS termination
- Request routing (based on host, path, headers)
- Load balancing
- Middleware (authentication, rate limiting)
- Certificate management
- Service discovery

## Key Takeaway

A reverse proxy is the traffic manager between clients and servers. It's essential for modern application architecture, enabling load balancing, security, and flexible routing.
