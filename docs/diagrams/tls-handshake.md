---
title: TLS Handshake
---

# TLS Handshake

## TLS 1.3 Handshake Sequence

```
Client                                    Traefik (:443)
  |                                            |
  |──── ClientHello ─────────────────────────→ |
  |     (supported versions, ciphers, SNI)     |
  |                                            |
  | ←──── ServerHello ────────────────────────|
  |     (chosen cipher, certificate,           |
  |      key share)                            |
  |                                            |
  |──── Finished ─────────────────────────────→|
  |     (encrypted with derived session key)  |
  |                                            |
  | ←──── Finished ────────────────────────────|
  |                                            |
  |════ Encrypted application data ═══════════|
```

TLS 1.3 does this in **one round trip** (vs. two for TLS 1.2) — the client sends its key share in the same flight as `ClientHello`, so the server can derive the session key and respond with data already encrypted.

## SNI: Picking the Right Certificate

Traefik can terminate TLS for many domains on the same `:443` entrypoint. SNI is what tells it which certificate to present *before* the connection is encrypted:

```
ClientHello (SNI: "api.example.com")
        ↓
Traefik checks its certificate store
        ↓
   ┌────────────┴────────────┐
   │                         │
 match found              no match
   ↓                         ↓
serve cert for          serve default cert
api.example.com         (or reject)
```

Without SNI, Traefik would have no way to know which of its many certificates to send back before the handshake completes.

## Where ACME Fits In

The handshake above assumes a certificate already exists. Traefik obtains it beforehand via ACME (Let's Encrypt):

```
Traefik starts up / new Host() rule appears
        ↓
No valid certificate for this domain?
        ↓
ACME HTTP-01 or TLS-ALPN-01 challenge
        ↓
Let's Encrypt verifies domain ownership
        ↓
Certificate issued → stored in acme.json
        ↓
Used for all subsequent TLS handshakes
        ↓
Auto-renewed before expiry (~30 days out)
```

## Why This Matters

- **One round trip, less latency**: TLS 1.3's simplified handshake shaves a full round trip off every new HTTPS connection compared to TLS 1.2.
- **SNI enables multi-tenancy**: a single `:443` entrypoint can terminate TLS for dozens of unrelated domains, each with its own certificate.
- **Certificates are automatic, not static files you manage**: Traefik requests, stores, and renews them itself — nothing to rotate by hand.

## Related Concepts

- [TLS Handshake (deep dive)](../internals/tls-handshake.md) — full breakdown of every step, cipher suites, and PFS
- [Certificate Renewal](../internals/certificate-renewal.md) — how Traefik keeps certificates from expiring
- [ACME and Let's Encrypt](../traefik-core/acme-and-letsencrypt.md) — configuring the certificate resolver
- [TLS Termination](../networking-fundamentals/tls-termination.md) — why terminating TLS at the proxy instead of the backend
