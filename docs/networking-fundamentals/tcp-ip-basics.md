---
title: TCP/IP Basics
---

# TCP/IP Basics

## The Network Stack

Think of network communication in layers:

```
Layer 4: Application (HTTP, HTTPS, FTP)
Layer 3: Transport (TCP, UDP)
Layer 2: Internet (IP addresses)
Layer 1: Physical (cables, WiFi)
```

## IP (Internet Protocol)

**What it does**: Delivers data packets between computers using IP addresses

**IPv4**: 192.168.1.1 (32-bit addresses)
**IPv6**: 2001:0db8::1 (128-bit addresses, more addresses available)

Each device on a network needs a unique IP address to receive data.

## TCP (Transmission Control Protocol)

**Connection-oriented**: Establishes a connection before sending data

**Reliable**: Ensures all data arrives in order and complete

**How it works**:
1. Three-way handshake (SYN, SYN-ACK, ACK) = connection established
2. Data sent in streams
3. Acknowledgments confirm receipt
4. Connection closed when done

**Use cases**: HTTP, HTTPS, FTP, SSH (anything that needs reliability)

## UDP (User Datagram Protocol)

**Connectionless**: Sends data without establishing connection

**Fast but unreliable**: Doesn't guarantee delivery or order

**Use cases**: DNS queries, video streaming, online gaming (can afford to lose packets)

## TCP vs UDP

| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Required | Not required |
| Reliability | Guaranteed delivery | Best effort |
| Speed | Slower | Faster |
| Order | Guaranteed | Not guaranteed |
| Use | Reliable data | Speed priority |

## Ports

Ports are like apartment numbers on an IP address building:
- IP Address = Building address (192.168.1.1)
- Port = Apartment number (80 for HTTP, 443 for HTTPS)

Well-known ports:
- 80: HTTP
- 443: HTTPS
- 22: SSH
- 3306: MySQL
- 5432: PostgreSQL

## Key Takeaway

TCP/IP is the foundation of internet communication. TCP ensures reliability (good for web), UDP prioritizes speed (good for real-time).
