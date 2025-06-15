---
title: "SSH Options and Config Settings"
tags: [Linux]
category: Linux
date: 2021-07-04
update: 2021-07-04
---

## The Basics

```bash
ssh username@{hostname or ip}
```

By default, it connects to port 22. The username can be omitted. If omitted, it connects with the current PC's username.

## ~/.ssh/config

On Unix and Linux systems, private keys and config are stored under `.ssh/` in the user's home directory.
The .ssh directory should have 700 permissions, and files under .ssh should have 600 permissions.

```bash
~/.ssh/
├── authorized_keys
├── config
├── id_rsa
├── id_rsa.pub
├── known_hosts
├── known_hosts-e
```

To make SSH connections easier, write connection settings in advance in the config file.

```bash
Host hoge
  HostName 192.168.0.0
  User hoge
  Port 22
  IdentifyFile ~/.ssh/id_rsa
```

With the above settings written in `~/.ssh/config`, you can connect with just `ssh hoge`.

## Multi-hop SSH

For security reasons, sometimes you can't connect directly to the target machine.
For example, you might only be able to connect to the target machine via local network, requiring connection through a proxy server (which is in the same network as the target machine and accessible from outside).
In this case, you need to layer SSH connections like Client -> Proxy -> Target. Here's how to do this with a single SSH command or SSH config.

First, the SSH command:

```bash
ssh -o ProxyCommand='ssh -W %h:%p Proxy' Target
```

`-o` is an option to specify SSH settings, which takes priority over SSH config.

Next, the SSH config setting:

```bash
Host proxy
    User hoge

Host target
    User fuga
    ProxyCommand  ssh -W %h:%p proxy
```

With the above settings, running `ssh target` will connect to the server behind the proxy.

## SSH Command Options and SSH Config Correspondence

| command                   | config                | Description                                                    | Example                                                |
| ------------------------- | --------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| -p                        | Port                  | Specify the port of the connection target                      | ssh -p 22                                             |
| -i                        | IdentifyFile          | Path to the private key used for connection                    | ssh -i ~/.ssh/hoge_rsa                                |
| -X                        | ForwardX11            | Whether to forward X window                                    | ForwardX11 yes                                         |
| -Y                        | ForwardX11Trusted     | Trusted X window forwarding. Use this for Xquartz on macOS    | ForwardX11Trusted yes                                  |
| -L                        | LocalForward          | Forward client port to PC in remote network                   | ssh -L 8080:remote_pc:80                              |
| -o StrictHostKeyChecking= | StrictHostKeyChecking | Determines how to handle known_hosts                           | yes(don't connect), no(connect), ask(default confirm) |

### Settings Available for macOS

- AddKeysToAgent
- UseKeychain

Register keys with SSH agent. Effective even after restart.