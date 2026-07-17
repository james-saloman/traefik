---
title: Basic Routing Lab
---

# Basic Routing Lab

## Objective

Learn basic HTTP routing with Traefik and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Basic Docker knowledge
- Terminal familiarity

## What You'll Learn

- Set up Traefik with Docker Compose
- Create basic routing rules
- Access Traefik dashboard
- Route traffic to multiple services

## Lab Structure

1. Start with docker-compose.yml
2. Launch services
3. Configure routing via labels
4. Test routing
5. Explore dashboard

## Quick Start

```bash
docker-compose up -d
curl http://myapp.local
```

Access dashboard: http://localhost:8080/dashboard

## Exercises

### Exercise 1: Single Service Routing

Route myapp.local → nginx container

Expected: See "Welcome to nginx"

### Exercise 2: Multiple Services

Add a second service, route by domain:
- api.local → api service
- web.local → web service

### Exercise 3: Path-Based Routing

Route by path:
- /api → api service
- /web → web service (same service, different path)

## Troubleshooting

**Service not appearing?**
- Check labels on container
- Verify network connectivity
- Check Traefik logs

**404 error?**
- Verify Host/Path rules
- Check service is running
- Test via dashboard

## Next Steps

- Explore host-based routing lab
- Learn about path-based routing
- Configure HTTPS with Let's Encrypt

