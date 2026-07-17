---
title: Reverse Proxy Flow
---

# Reverse Proxy Flow

## Request Flow Diagram

```
Client (192.168.1.100)
    |
    | HTTP Request (myapp.com/api/users)
    ↓
[Reverse Proxy - Traefik]
    ├─ Check routing rules
    ├─ Apply middlewares
    ├─ Determine backend service
    └─ Load balance across servers
    |
    +→ Backend Server 1 (10.0.0.2:8080)
    +→ Backend Server 2 (10.0.0.3:8080)
    +→ Backend Server 3 (10.0.0.4:8080)
    |
    ↓ (Server 1 selected)
[Backend Service]
    |
    | Process request
    | Generate response
    |
    ↓
[Reverse Proxy]
    |
    | Modify response
    | Add headers
    |
    ↓
Client receives response
```

## Why This Matters

- **Security**: Backends hidden behind proxy
- **Scalability**: Load balance across multiple servers
- **Flexibility**: Change backends without client knowledge
- **Control**: One point to manage routing

