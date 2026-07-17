---
title: Kubernetes Debugging
---

# Kubernetes Debugging

## Check Ingress

```bash
kubectl get ingress
kubectl describe ingress myapp
```

Shows:
- Hosts
- Paths
- Services
- TLS status

## Check Services

```bash
kubectl get svc myapp-service
kubectl describe svc myapp-service
```

Shows:
- Endpoints (pod IPs)
- Port mapping
- Type (ClusterIP, NodePort, LoadBalancer)

## Check Endpoints

```bash
kubectl get endpoints
# Lists service endpoints (pod IPs)

kubectl describe endpoints myapp-service
# Shows which pods are endpoints
```

If empty, service isn't selecting any pods.

## Pod Readiness

```bash
kubectl get pods
# Check STATUS

kubectl describe pod myapp-0
# Check readiness probes
```

Pods must be "Running" and "Ready 1/1".

## Traefik Controller Logs

```bash
kubectl logs -n traefik deploy/traefik
# Traefik logs
```

Look for:
- Ingress created
- Route added
- Errors

## Test from Traefik Pod

```bash
kubectl exec -it traefik-0 -- bash
curl http://myapp-service:8080/health
```

Can Traefik reach service?

## Service DNS

Kubernetes provides DNS:

```
Service: myapp-service
Namespace: default
Full name: myapp-service.default.svc.cluster.local
```

From pod:

```bash
kubectl exec myapp-0 -- nslookup myapp-service
```

## Network Policies

Check if network policies block traffic:

```bash
kubectl get networkpolicies
```

If present, may block traffic between namespaces.

## RBAC Permissions

Traefik needs RBAC permissions:

```bash
kubectl describe clusterrolebinding traefik
```

Check Traefik can read:
- Ingress
- Services
- Endpoints

## Namespace Isolation

Traefik must watch correct namespaces:

```yaml
rbac:
  namespaced: false  # Watch all namespaces
```

Or specify in Traefik config.

## DNS Debugging

Test DNS resolution:

```bash
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
nslookup myapp-service
```

## Port Forwarding

Test service directly:

```bash
kubectl port-forward svc/myapp-service 8080:8080
curl localhost:8080
```

If works locally, issue is routing.

## Key Takeaway

Kubernetes debugging checks: Ingress exists, Services have endpoints, Pods are ready, Traefik can reach services, RBAC correct. Use `kubectl logs` and `kubectl exec` to test connectivity.
