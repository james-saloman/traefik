---
title: What is HTTP?
---

# What is HTTP?

HTTP (Hypertext Transfer Protocol) is how your browser talks to web servers. It's the protocol that powers the entire web.

## The Basics

**Request-Response Model**: Your browser sends a request → server processes it → sends a response back.

**Stateless**: Each request is independent. The server doesn't remember previous requests (unless you use cookies/sessions).

**Text-Based**: Everything is sent as plain text, making it human-readable and easy to debug.

## How It Works

1. Client makes a request (GET /page.html)
2. Server receives and processes it
3. Server sends back a response with status code and content
4. Connection closes (or stays open for more requests)

## HTTP Methods

- **GET**: Retrieve data (no body sent)
- **POST**: Submit data (body contains data)
- **PUT**: Replace entire resource
- **DELETE**: Remove resource
- **PATCH**: Partial update

## Status Codes

- **2xx (Success)**: 200 OK, 201 Created, 204 No Content
- **3xx (Redirect)**: 301 Moved Permanently, 302 Found, 304 Not Modified
- **4xx (Client Error)**: 400 Bad Request, 401 Unauthorized, 404 Not Found
- **5xx (Server Error)**: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable

## Key Points

- HTTP is connectionless (request completes, connection ends)
- Default port is 80
- Used by every website you visit
- Foundation for building APIs and web services
