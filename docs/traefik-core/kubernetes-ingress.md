---
title: Kubernetes Ingress
---

# Kubernetes Ingress

## What is Kubernetes Ingress?

**Ingress** is a Kubernetes resource that defines HTTP/HTTPS routing rules for your services. **Traefik** is an **Ingress Controller** that watches for Ingress resources and implements the actual routing.

## The Relationship

```
┌─────────────────────────────────────────────┐
│  Kubernetes Ingress Resource                │
│  (declarative routing config)               │
│  "Route example.com → myapp-service"        │
└──────────────────┬──────────────────────────┘
                   ↓
         Traefik Ingress Controller
         (watches for Ingress changes)
                   ↓
┌──────────────────┴──────────────────────────┐
│  Live Routing Rules                         │
│  (traffic flows based on Ingress config)    │
│  example.com → Pod 1, 2, 3 (load balanced) │
└─────────────────────────────────────────────┘
```

## How Ingress Works in Kubernetes

```
Client Request to myapp.example.com
         ↓
Kubernetes Cluster Entry Point (Traefik)
         ↓
Read matching Ingress rule
         ↓
"Route to myapp-service:8080"
         ↓
Service Endpoint Discovery
         ↓
Get Pods behind myapp-service
(via label selector)
         ↓
Load Balance across Pods
(round-robin by default)
         ↓
Pod receives request
(container port 8080)
```

## Basic Ingress Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 8080
```

**What this Ingress does:**
- Listens for requests to `myapp.example.com`
- Routes all traffic to `myapp-service` on port `8080`
- Automatically load-balances across all Pods behind the service

## Installing Traefik in Kubernetes

```bash
# Via Helm
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik -n traefik --create-namespace
```

Traefik controller now watches for Ingress resources.

## Traefik IngressRoute

Traefik provides extended ingress via IngressRoute (more powerful than native Ingress):

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: myapp-route
spec:
  entryPoints:
    - web
    - websecure
  routes:
  - match: Host(`myapp.example.com`)
    kind: Rule
    services:
    - name: myapp-service
      port: 8080
  tls:
    certResolver: letsencrypt
```

Features beyond native Ingress:
- Middleware support
- TLS per route
- More matcher options

## Multiple Paths

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-path
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 3000
      
      - path: /static
        pathType: Prefix
        backend:
          service:
            name: static-service
            port:
              number: 8090
```

Different paths → different services.

## TLS/HTTPS

Define TLS with secret containing certificate:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-app
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls-cert
  
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 8080
```

Secret contains certificate and key:

```bash
kubectl create secret tls myapp-tls-cert \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key
```

## Let's Encrypt with Traefik

Configure ACME in Traefik:

```yaml
# Traefik Helm values
traefik:
  certificatesResolvers:
    letsencrypt:
      acme:
        email: admin@example.com
        storage: /data/acme.json
        httpChallenge:
          entryPoint: web
```

Then use in IngressRoute:

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: auto-tls
spec:
  entryPoints:
    - web
    - websecure
  routes:
  - match: Host(`myapp.example.com`)
    kind: Rule
    services:
    - name: myapp-service
      port: 8080
  tls:
    certResolver: letsencrypt
```

Automatic HTTPS!

## Middleware in IngressRoute

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: auth
spec:
  basicAuth:
    secret: auth-secret

---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: protected-app
spec:
  entryPoints:
    - web
  routes:
  - match: Host(`admin.example.com`)
    kind: Rule
    middlewares:
    - name: auth
    services:
    - name: admin-service
      port: 8080
```

Middleware applied to route.

## Service Discovery

Traefik automatically discovers Kubernetes services:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
```

Traefik discovers 3 pods, load-balances across them.

## Health Checks

K8s readiness probes work with Traefik:

```yaml
containers:
- name: myapp
  readinessProbe:
    httpGet:
      path: /health
      port: 8080
    initialDelaySeconds: 10
    periodSeconds: 5
```

Unhealthy pods removed from load balancing automatically.

## Namespace Isolation

Ingressroutes only work in their namespace:

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: myapp-route
  namespace: production
spec:
  # Routes in production namespace
```

To watch multiple namespaces, configure Traefik RBAC.

## Complete Example

```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: myapp

---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
  namespace: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 8080
    targetPort: 8080

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /health
            port: 8080

---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: myapp-route
  namespace: myapp
spec:
  entryPoints:
    - web
    - websecure
  routes:
  - match: Host(`myapp.example.com`)
    kind: Rule
    services:
    - name: myapp-service
      port: 8080
  tls:
    certResolver: letsencrypt
```

Complete setup: service, deployment, ingress route.

## Key Takeaway

Kubernetes Ingress is the configuration layer for exposing services. Traefik Ingress Controller implements the routing based on Ingress/IngressRoute resources. IngressRoute provides advanced features beyond standard Ingress.
