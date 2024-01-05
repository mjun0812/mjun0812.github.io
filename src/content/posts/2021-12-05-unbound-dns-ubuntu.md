---
title: unboundで内向きDNSを作る(Ubuntu20.04)
tags: [Linux, Ubuntu, Server, Home Lab]
category: Server
date: 2021-12-05
update: 2021-12-05
---

本ページでは，自宅ネットワーク内にDNSサーバを立ち上げる方法についてメモを書く．  
今回はunboundを使って構築する．

## 自宅DNSサーバを立てる理由

自宅に内向きDNSサーバを立てるメリットは以下があげられる．

1. プロバイダーの提供するDNSサーバに影響を受けない
2. ドメインを付与した外部公開しているサーバがある場合，自宅ネットワーク内からでもドメインで名前解決できる．
3. 好きな名前で自宅内のホストに名前解決できる

1について，大抵はプロバイダーのDNSを使っていると考えられる．
このDNSを変更したい場合は自分で立てるメリットがある．
デバイスごとに変更することもできるが，ネットワーク内の全デバイスに対して適用したい場合は，大本のDNS参照先を変えてしまったほうが早い．

2について，自宅のグローバルIPにドメインを振っている場合，外部からドメイン名で名前解決して自宅内サーバにアクセスすることはできる．(というかそのためにドメイン振ってる)  
しかし，アクセスしたいサーバと同じネットワークにいる場合，ドメイン名でアクセスができない．(これをうまく解決してくれるルーターもあるらしい．)
これを解決する方法は，デバイスのhostsファイルに書き込むなどの方法があるが，新しいデバイスが来るたびにこれをやっているときりがないので，自分でDNSサーバを立てると楽できる．

3についてはおまけで，sshならconfigで好きな名前にできるし，`.local`がついてしまうが，avahiを利用してmDNSを使うこともできる．

まとめると，自宅DNSサーバを立てるは，「一括で」ネットワーク内の名前解決を設定できるという点が大きい．

## 技術選定

DNSサーバを立てる方法はいくつかあって，一番有名なのはbindだと思う．  
脆弱性が多いというデメリットが散見されるが，自宅内だけで利用し，外部に公開しないのであればそこまで気にしなくても大丈夫だと考えられる．

しかし，自宅内だけで使うには機能が過剰で，設定ファイルも冗長なので，今回は設定ファイルが簡素なunboundを選定した．

## install

```bash
apt install unbound
```

設定ファイル例は以下．

`/etc/unbound/unbound.conf.d/`に設定ファイルを置く．

```yaml
server:
  chroot: ""
  verbosity: 2
  interface: 127.0.0.0
  interface: ::0

  do-ip4: yes
  do-ip6: yes

  # アクセス制限 ローカルのみ許可
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

  # 逆引き
  local-data: "hoge.com. IN A 1.1.1.1"

# Google DNS
forward-zone:
  name: "."
  forward-addr: 8.8.8.8
  forward-addr: 8.8.4.4
  forward-addr: 2001:4860:4860::8888
  forward-addr: 2001:4860:4860::8844
```

`local-data:`のところが逆引き設定．
forward-zoneはGoogleのDNSを設定している．
あとはルータでDNSサーバが参照されるようにすればOK．
