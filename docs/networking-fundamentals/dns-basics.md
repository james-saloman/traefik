---
title: DNS Basics
---

# DNS Basics

## What is DNS?

DNS (Domain Name System) is like the phone book of the internet. It translates human-readable domain names into IP addresses.

**You type**: google.com
**DNS translates to**: 142.250.185.46 (or another Google IP)
**Computer connects to**: 142.250.185.46

## How DNS Works

1. Browser needs to visit google.com
2. Browser asks DNS resolver: "What's the IP for google.com?"
3. Resolver queries DNS servers in order:
   - Root nameserver (points to TLD server)
   - TLD nameserver (points to authoritative nameserver)
   - Authoritative nameserver (has the answer)
4. Answer comes back: "It's 142.250.185.46"
5. Browser connects to that IP address

## DNS Records

- **A Record**: Maps domain to IPv4 address
- **AAAA Record**: Maps domain to IPv6 address
- **CNAME**: Alias for another domain (www.example.com → example.com)
- **MX Record**: Mail server address
- **TXT Record**: Arbitrary text (often for verification)
- **NS Record**: Nameserver for domain

## Key Concepts

**Propagation**: DNS changes can take 24-48 hours to spread worldwide (cached at various levels)

**TTL (Time To Live)**: How long DNS results are cached (300 seconds = 5 minutes)

**Nameserver**: The server that stores and answers DNS queries for a domain

## Common Scenarios

- **Domain registration**: You point nameservers to DNS provider
- **Docker/Kubernetes**: Container DNS automatically resolves service names
- **Traefik**: Watches for domain changes and routes accordingly
- **Local development**: Edit `/etc/hosts` to map domain to localhost

## Key Takeaway

DNS is the directory service that makes the internet human-friendly. Without it, you'd type IP addresses instead of domain names.
