---
title: TLS Handshake
---

# TLS Handshake

## Why TLS?

TLS (Transport Layer Security) encrypts communication so only intended parties can read it.

## TLS Handshake Steps

When client connects to Traefik on port 443:

**Step 1: Client Hello**
```
Client → Server: "Hello, I support TLS 1.2, TLS 1.3, these ciphers..."
```

**Step 2: Server Hello**
```
Server → Client: "We'll use TLS 1.3 with cipher suite X"
```

**Step 3: Certificate Exchange**
```
Server → Client: "Here's my certificate proving I'm example.com"
Client: "I trust the issuer, certificate valid"
```

**Step 4: Key Exchange**
```
Client → Server: "Here's ephemeral key (PFS)"
Server → Client: "Here's my ephemeral key"
Both compute shared secret: only they can decrypt
```

**Step 5: Finished**
```
Client: Sends "Finished" encrypted with new key
Server: Sends "Finished" encrypted with new key
Both: Verify encryption works
```

Connection now encrypted and authenticated.

## SNI (Server Name Indication)

Multiple certificates on one IP. Client tells server which certificate needed:

```
Client Hello (with SNI extension): "I want example.com"
  ↓
Server: "Sending example.com certificate"
  ↓
Client: Verifies certificate is for example.com
```

Without SNI, server must guess which certificate to send.

## Certificate Verification

Client verifies server certificate:

1. Certificate valid today?
2. Domain matches request?
3. Certificate signed by trusted CA?
4. Certificate chain valid?

If any fails → connection rejected.

## Handshake Timing

```
TCP handshake: 30-100ms
TLS 1.2 handshake: 100-300ms (extra round trip)
TLS 1.3 handshake: 0-100ms (1 fewer round trip)
```

TLS 1.3 faster due to improved design.

## Session Resumption

For subsequent connections (faster):

**Session ID**: Server remembers client
```
Connection 1: Full handshake, server stores session
Connection 2: Client sends session ID, skip some steps
Result: Faster, ~50% less handshake overhead
```

**Session Ticket**: Client stores ticket
```
Connection 1: Server gives encrypted ticket to client
Connection 2: Client sends ticket, no server-side storage needed
```

## Perfect Forward Secrecy (PFS)

Even if certificate compromised, past traffic safe:

```
Without PFS:
  Attacker gets certificate key
  Decrypts all past traffic

With PFS:
  Ephemeral keys used for each session
  Session key not derivable from certificate key
  Attacker can't decrypt past traffic even with certificate key
```

Traefik supports PFS via modern cipher suites.

## Certificate Pinning

High-security apps pin certificate:

```
App: "I only trust certificate fingerprint ABC123..."
If certificate doesn't match → refuse connection
```

Prevents attacks if CA compromised.

## TLS Versions

- **TLS 1.0/1.1**: Deprecated, vulnerable
- **TLS 1.2**: Secure, standard
- **TLS 1.3**: Latest, faster, more secure

Traefik supports configurable minimum version.

## Cipher Suites

Algorithms used for encryption:

```
TLS_AES_256_GCM_SHA384 (TLS 1.3)
TLS_CHACHA20_POLY1305_SHA256 (TLS 1.3)
ECDHE-ECDSA-AES256-GCM-SHA384 (TLS 1.2)
```

Different algorithms = different security/performance.

## Handshake Failures

**Certificate mismatch**: Domain doesn't match cert
**Untrusted CA**: Certificate not signed by trusted authority
**Expired**: Certificate expired
**Protocol mismatch**: Client/server don't support common TLS version

## Key Takeaway

TLS handshake establishes encrypted, authenticated connection. SNI allows multiple certificates on one IP. TLS 1.3 faster than TLS 1.2. Handshake is most expensive part of HTTPS connection.
