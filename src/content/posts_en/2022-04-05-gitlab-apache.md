---
title: "Proxying GitLab via Apache on Ubuntu"
tags: [Server, Linux, Ubuntu, GitLab]
category: Server
date: 2022-04-05
update: 2022-04-05
---

This time I'll cover how to set up GitLab in a subdirectory using Apache on Ubuntu.
SSL certificates will be managed with Apache and certbot, not GitLab.

The goal this time is to set up GitLab at `https://hoge.com/gitlab`.

## Installing Apache

First, install apache2.

```bash
sudo apt install apache2
sudo systemctl status apache
```

## Introducing Certbot

Next, introduce certbot. Prepare an email address and domain for registration in advance.

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache

Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): hoge@hoge.com

You must agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
(A)gree/(C)ancel: A

Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let s Encrypt project and the non-profit
organization that develops Certbot?
(Y)es/(N)o: N

Which names would you like to activate HTTPS for?
----------------------------------------
1: hoge.com
----------------------------------------
 (Enter 'c' to cancel): 1

Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
----------------------------------------
1: No redirect
2: Redirect
----------------------------------------
(press 'c' to cancel): 2

Congratulations! You have successfully enabled https://hoge.com

# Check if automatic renewal is working
sudo systemctl status certbot.timer
```

## Apache Configuration

Next, configure proxy settings for Apache.
Add the following to `/etc/apache2/sites-enabled/000-default-le-ssl.conf`.

```bash
ProxyPass /gitlab http://localhost:8000/gitlab
ProxyPassReverse /gitlab http://localhost:8000/gitlab
```

Also, to hide the Apache version from outside, edit `/etc/apache2/conf-enabled/security.conf`.

```bash
ServerTokens Prod
ServerSignature Off
```

After configuration is complete, restart Apache.

```bash
sudo systemctl restart apache
```

## Starting GitLab

This time we'll start GitLab with docker-compose.

```yaml
version: '3.7'
services:
  gitlab:
    image: gitlab/gitlab-ce:14.7.7-ce.0
    restart: always
    hostname: 'hoge.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://hoge.com/gitlab/'
        gitlab_rails['gitlab_shell_ssh_port'] = 22
        gitlab_rails['time_zone'] = 'Asia/Tokyo'
        letsencrypt['enable'] = false
        nginx['listen_port'] = 8088

    ports:
      - '8000:8000'
      - '22:22'
    volumes:
      - ./gitlab/data:/var/opt/gitlab
      - ./gitlab/logs:/var/log/gitlab
      - ./gitlab/config:/etc/gitlab
```

Since SSL certificates are managed by Apache, set `letsencrypt['enable'] = false`.

With this, you can access GitLab via Apache in any subdirectory.