---
title: Troubleshooting Checklist
---

# Troubleshooting Checklist

## Service Not Appearing

- [ ] Container running? `docker ps`
- [ ] Traefik labels present?
- [ ] `traefik.enable=true` label set?
- [ ] Container on same network as Traefik?
- [ ] Check Traefik logs: `docker logs traefik`

**Fix**: Restart container, check labels

## 404 Errors

- [ ] Host header matches rule?
- [ ] Path matches rule?
- [ ] Router priority correct?
- [ ] Service exists in dashboard?
- [ ] Backend port correct?

**Test**: `curl -H "Host: myapp.local" http://localhost`

## 502 Errors

- [ ] Backend running? `docker ps`
- [ ] Backend listening on correct port?
- [ ] Service reachable from Traefik container?
- [ ] Health check passing?
- [ ] Network connectivity?

**Test**: `docker exec traefik curl http://backend:8080`

## HTTPS Issues

- [ ] Domain pointing to server IP?
- [ ] Port 80 open for HTTP challenge?
- [ ] Certificate issued? Check `acme.json`
- [ ] TLS enabled on router?
- [ ] Certificate valid?

**Test**: `curl https://localhost:443 -k`

## Slow Responses

- [ ] Traefik CPU high?
- [ ] Backend slow?
- [ ] Network latency?
- [ ] Compression overhead?

**Check**: `docker stats`

## General Debugging

1. Check Traefik logs: `docker logs traefik`
2. Check container logs: `docker logs <service>`
3. Test connectivity: `docker exec traefik curl http://service`
4. Verify configuration: Dashboard at `:8080/dashboard`
5. Check network: `docker network inspect <network>`

