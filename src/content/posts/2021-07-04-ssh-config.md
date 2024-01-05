---
title: SSHのOption, Configまわりの設定
tags: [Linux]
category: Linux
date: 2021-07-04
update: 2021-07-04
---

## まずは基本系

```bash
ssh username@{hostname or ip}
```

デフォルトではポート22に接続される。usernameは省略できる。省略した場合は現在のPCのusernameで接続される。

## ~/.ssh/config

Unix, Linuxではuserのホームディレクトリの`.ssh/`以下に秘密鍵やconfigを保存する。
.sshディレクトリは700、.ssh以下のファイルには600の権限を付与する。

```shell-session
~/.ssh/
├── authorized_keys
├── config
├── id_rsa
├── id_rsa.pub
├── known_hosts
├── known_hosts-e
```

ssh接続を楽にするためにconfigファイルに予め接続設定を書いておく。

```shell-session
Host hoge
  HostName 192.168.0.0
  User hoge
  Port 22
  IdentifyFile ~/.ssh/id_rsa
```

上記の設定を`~/.ssh/config`に書いておくと`ssh hoge`のみで接続することが可能になる。

## 多段ssh

セキュリティ上の理由で。接続したい端末に直接接続出来ない場合がある。
例えば、接続したい端末へローカルネットワークでしか接続できず、プロキシーサーバ(接続したい端末と同じネットワーク内にあり、外からアクセスできる。)を介して接続する場合が考えられる。
この場合、Client -> Proxy -> Targetというようにssh接続を重ねて接続しなければならない。これをsshコマンド1行またはssh configで行う方法について説明する。

まずはsshコマンド

```bash
ssh -o ProxyCommand='ssh -W %h:%p Proxy' Target
```

`-o`はssh の設定を指定できるオプションで、ssh configよりも優先される。

続いてssh configでの設定。

```shell-session
Host proxy
    User hoge

Host target
    User fuga
    ProxyCommand  ssh -W %h:%p proxy
```

上記の設定をした上で`ssh target`をすれば踏み台の先のサーバに接続できる。

## sshコマンドのオプションとssh configの対応

command|config|説明|例
|-|-|-|-|
-p|Port|接続先のPortの指定| ssh -p 22
-i|IdentifyFile|接続に使用する秘密鍵のPath| ssh -i ~/.ssh/hoge_rsa
-X|ForwardX11|Xwindowを転送するかどうか。| ForwardX11 yes
-Y|ForwardX11Trusted|信頼されたXwindowの転送。macOSでXquartzを使うときはこれ。|ForwardX11Trusted yes
-L|LocalForward|クライアントのポートをリモートのネットワーク内のPCに飛ばす| ssh -L 8080:remote_pc:80
-o StrictHostKeyChecking= |StrictHostKeyChecking| known_hostの扱いを決める。|yes(接続しない)、no(接続する)、ask(default 確認させる)

### macOSに使える設定

- AddKeysToAgent
- UseKeychain

ssh agentに鍵を登録する。再起動時にも有効。
