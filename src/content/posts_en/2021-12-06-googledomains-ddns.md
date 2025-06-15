---
title: "Setting up DDNS with Google Domains"
tags: [Server, Linux, Ubuntu, Google Domains]
category: Server
date: 2021-12-06
update: 2022-02-08
---

This time, I'll cover how to dynamically assign IP addresses to domains using Google Domains' DDNS.

## What is DDNS

DDNS stands for Dynamic DNS, which is a service that notifies DNS servers when there are changes to the IP address of a host assigned to a domain, updating the domain's IP.

With typical fiber optic contracts, a new global IP is often assigned each time you restart your HGW router. In such cases, you need to change the IP associated with your domain each time. While you can contract for a fixed IP, it costs money, so for small-scale home servers, using DDNS is more cost-effective for constant domain name access to your home server.

## Google Domains

Google Domains offers DDNS functionality, and you can easily use DDNS with `ddclient` on the server side.
Since this is Google, there are likely to be many specification changes, so refer to the official documentation for acquisition methods.

## ddclient

```bash
apt install ddclient
```

During installation, you'll be asked various questions through a GUI, but since we'll configure everything in the configuration file later, just fill them out arbitrarily.

Here's a configuration example. The location is `/etc/ddclient.conf`:

```bash
# /etc/ddclient.conf
daemon=60 # Interval for periodic execution as a service

ssl=yes
protocol=googledomains
use=web
login=[Obtained from Google Domains]
password=[Obtained from Google Domains]
hoge.hoge.com # Domain to configure DDNS for
```

Here's where to get the credentials from Google Domains:

![images](./images/ddns.png)

Get the authentication information from here and configure it.

Additionally, to make DDNS a service for periodic execution, edit `/etc/default/ddclient`:

```diff
# /etc/default/ddclient

- run_daemon="false"
+ run_daemon="true"

```

After this, just register it as a service and you're OK.

To execute manually, run the following:

```bash
sudo ddclient -daemon=0 -verbose
```

## References

<https://qiita.com/gorohash/items/8287738ffe47ab52a36f>
<https://www.uchidigi.com/2020/01/ddclient-google-ddns.html>