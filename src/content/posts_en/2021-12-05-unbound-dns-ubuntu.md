---
title: "Creating an Internal DNS Server with Unbound (Ubuntu 20.04)"
tags: [Linux, Ubuntu, Server, Home Lab]
category: Server
date: 2021-12-05
update: 2021-12-05
---

This page covers how to set up a DNS server within a home network.
This time, I'll build it using unbound.

## Reasons for Setting Up a Home DNS Server

The benefits of setting up an internal DNS server at home include:

1. Not being affected by DNS servers provided by ISPs
2. If you have externally published servers with assigned domains, you can resolve names by domain even from within your home network
3. You can resolve names for hosts within your home with custom names

Regarding point 1, you're probably using your ISP's DNS most of the time.
If you want to change this DNS, there's merit in setting up your own.
While you can change it per device, if you want to apply it to all devices in the network, it's faster to change the main DNS reference.

Regarding point 2, if you have a domain assigned to your home's global IP, you can access your home server from outside by resolving the domain name (that's why you assigned the domain in the first place).
However, when you're on the same network as the server you want to access, you can't access it by domain name (some routers apparently solve this nicely).
Solutions include writing to the device's hosts file, but doing this every time a new device comes is endless, so setting up your own DNS server makes it easier.

Regarding point 3, this is a bonus - you can use custom names with SSH config, and although it gets a `.local` suffix, you can also use mDNS via avahi.

In summary, the big advantage of setting up a home DNS server is being able to configure name resolution for the entire network "all at once".

## Technology Selection

There are several ways to set up a DNS server, and the most famous is probably bind.
While there are scattered reports of many vulnerabilities, if you're only using it within your home and not exposing it externally, it's probably not something to worry too much about.

However, the functionality is excessive for home-only use and the configuration files are verbose, so this time I selected unbound, which has simpler configuration files.

## Installation

```bash
apt install unbound
```

Here's an example configuration file:

Place configuration files in `/etc/unbound/unbound.conf.d/`.

```yaml
server:
  chroot: ""
  verbosity: 2
  interface: 127.0.0.0
  interface: ::0

  do-ip4: yes
  do-ip6: yes

  # Access control - only allow local
  access-control: 0.0.0.0/0 refuse
  access-control: ::1/0 refuse
  access-control: 127.0.0.1/32 allow
  access-control: 192.168.0.0/24 allow
  access-control: ::1/128 allow
  access-control: fd00::/8 allow
  access-control: fe80::/64 allow

  prefetch: yes
  hide-identity: yes
  hide-version: yes

  # Reverse lookup
  local-data: "hoge.com. IN A 1.1.1.1"

# Google DNS
forward-zone:
  name: "."
  forward-addr: 8.8.8.8
  forward-addr: 8.8.4.4
  forward-addr: 2001:4860:4860::8888
  forward-addr: 2001:4860:4860::8844
```

The `local-data:` section is for reverse lookup settings.
The forward-zone is configured with Google DNS.
After that, just configure your router to reference the DNS server and you're OK.