---
title: "Redirecting HTTP Traffic to HTTPS on Arbitrary Ports with Nginx"
tags: [Linux, Server]
category: Server
date: 2023-03-06
update: 2023-03-06
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

A memo on how to redirect HTTP requests coming to arbitrary ports to HTTPS using Nginx when setting up web servers.

While methods to redirect port 80 to 443 and force HTTPS with Nginx are commonly documented, methods to redirect HTTP traffic to web apps running on ports 8080 or 8065 to HTTPS weren't documented, so here's a memo.

For example, when using Nginx as a reverse proxy, redirecting access to example.com:8065 to example.com:8060.
Assume the SSL certificate for example.com is obtained with certbot.

```bash
server {
  server_name example.com:8065$;
  listen 8065 ssl;
  listen [::]:8065 ssl;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

  error_page 497 @force_https;
  location @force_https {
      return 301 'https://$host:$server_port$request_uri';
  }

  location / {
    proxy_pass http://localhost:8060;
    proxy_set_header X-Forwarded-Host $host;
  }
}
```

The key point is here:

```bash
error_page 497 @force_https;
location @force_https {
  return 301 'https://$host:$server_port$request_uri';
}
```

When you send an HTTP request to a port listening for HTTPS, you get an error message like `The plain HTTP request was sent to HTTPS port`.
The error code returned at this time is Nginx's proprietary 497.
By utilizing this to redirect to HTTPS when a 497 error occurs, you can force HTTPS communication to arbitrary ports.