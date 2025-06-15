---
title: "Setting Up GitLab Email Notifications with Google Workspace SMTP Relay in Docker Compose"
tags: [Server, Linux, Ubuntu, GitLab, SMTP]
category: Server
date: 2022-04-04
update: 2022-04-04
---

I self-host GitLab on my home server to manage credential source code.
While basically only I use it, I thought email notifications would be convenient, so I decided to set up email.

Since I happen to have a Google Workspace contract using this site's domain, I'll use the provided SMTP relay service to send email notifications via Google.

## About the OP25B Problem

A problem when sending emails from home servers is "OP25B".

<https://www.ntt.com/personal/services/option/mail/ocnmail/meiwaku/op25b.html>

This is an issue where ISPs block email sending from homes as an anti-spam measure.
To bypass this, you relay through SMTP relay servers provided by ISPs, but sometimes SMTP servers aren't provided or have restrictions.
So this time, I'll use Google Workspace's SMTP relay service, which has loose restrictions within custom domains.

## Google Workspace Configuration

First, go to the Google Workspace admin console.

<https://support.google.com/a/answer/2956491?hl=ja>

As written on the above site,
from the admin console, go to Apps -> Google Workspace -> Gmail -> Routing to open the SMTP relay service configuration screen.

![smtp](./images/2022-04-04-gitlab.png)

As shown above, configure:

- Only addresses in domain
- Require SMTP authentication
- Enable TLS encryption

Next, if you have 2-factor authentication set up on your Google account,
issue an app password in your account settings.

![google_app](./images/google_app_password.png)

Use this app password to perform SMTP authentication and send emails.

## GitLab docker-compose.yml Configuration

```yaml
version: '3.7'
services:
  gitlab:
    image: gitlab/gitlab-ce:14.7.2-ce.0
    restart: always
    hostname: 'hoge.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://hoge.com'
        gitlab_rails['time_zone'] = 'Asia/Tokyo'

        # mail
        gitlab_rails['smtp_enable'] = true
        gitlab_rails['smtp_address'] = "smtp-relay.gmail.com"
        gitlab_rails['smtp_port'] = 587
        gitlab_rails['smtp_domain'] = [custom domain or gmail.com]
        gitlab_rails['smtp_authentication'] = "login"
        gitlab_rails['smtp_user_name'] = [Google account username]
        gitlab_rails['smtp_password'] = [Google account password or app password]
        gitlab_rails['gitlab_email_from'] = 'gitlab@gmail.com'
        gitlab_rails['gitlab_email_reply_to'] = 'noreply@gmail.com'
    ports:
      - '80:80'
      - '22:22'
    volumes:
      - ./gitlab/data:/var/opt/gitlab
      - ./gitlab/logs:/var/log/gitlab
      - ./gitlab/config:/etc/gitlab
```

Edit the docker-compose.yaml as above and start it - that's all for configuration.

To check if email sending is working, try GitLab account email address verification.

### References

<https://www.ntt.com/personal/services/option/mail/ocnmail/meiwaku/op25b.html>

<https://support.google.com/a/answer/2956491?hl=ja>

<https://docs.gitlab.com/omnibus/settings/smtp.html>