---
title: Ports and Sockets
---

# Ports and Sockets

## Ports

A port is a logical endpoint for network communication on a machine. Think of it as a door through which data enters/exits.

**Port range**: 0-65535
**Format**: IP:Port (192.168.1.1:8080)

## Port Categories

**System/Well-known ports (0-1023)**: Reserved for system processes
- 80: HTTP
- 443: HTTPS
- 22: SSH
- 53: DNS
- 25: SMTP (email)

**User ports (1024-49151)**: Available for applications
- 3000: Node.js development
- 5000: Flask development
- 8080: Traefik (often)
- 8000: Django development

**Dynamic/Private ports (49152-65535)**: Temporary connections, ephemeral use

## Socket

A socket is the actual connection point between two applications. It's a combination of:
- IP Address
- Port number
- Protocol (TCP or UDP)

**Example**: 192.168.1.1:8080:TCP = a specific socket

Think: IP = house address, Port = door number, Socket = specific door at specific house with specific protocol

## How They Work Together

```
Server listening on 0.0.0.0:8080 (TCP)
↓
Client connects from 192.168.1.100:12345 → Server 192.168.1.1:8080
↓
Socket connection established: (192.168.1.100:12345 ↔ 192.168.1.1:8080)
↓
Data flows through this socket
```

## Network Byte Order

- **0.0.0.0**: Listen on all available network interfaces
- **127.0.0.1**: Localhost (loopback, local machine only)
- **192.168.x.x**: Private network (home/office)
- **10.0.0.0 - 10.255.255.255**: Private network (large organizations)

## Checking Open Ports

```bash
# Linux/Mac: See listening ports
netstat -tuln

# See which process is using a port
lsof -i :8080

# Windows
netstat -ano
```

## Common Port Assignments

- **Web servers**: 8000-8080
- **Databases**: 3000+ range
- **Message queues**: 5672 (RabbitMQ), 6379 (Redis)
- **API servers**: Varies by application

## Key Takeaway

Ports let multiple services run on one machine. Sockets are the actual connections using IP:Port:Protocol combinations. In Traefik, you listen on entrypoint ports and forward to backend service ports.
