---
title: Nginxで任意のポートのhttp通信をhttpsにリダイレクトする
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

Webサーバを立てる時に使用するNginxで，
任意のポートにきたhttpリクエストをhttpsにリダイレクトする方法のメモ．

Nginxで，ポート80を443にリダイレクトして
強制的にhttps化する方法はよく書かれているが，
ポート8080や8065に立てたWebアプリへのhttp通信をhttpsにする方法は
書かれていなかったのでメモ．

例えば，Nginxをリバースプロキシとして使っていて，
exemple.com:8065のアクセスをexample.com:8060に
飛ばしていた時の例．
example.comのSSL証明書はcertbotで取得しているとする．

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

ポイントはここ．

```bash
error_page 497 @force_https;
location @force_https {
  return 301 'https://$host:$server_port$request_uri';
}
```

httpsでListenしているポートにhttpでリクエストを送ると，`The plain HTTP request was sent to HTTPS port`
というようなエラーメッセージが帰ってくる．
この時のエラーコードはNginx専有の497が帰ってきている．  
これを利用して，497エラーの時はhttpsに飛ばすようにしてあげると，
任意のポートへのhttps通信を強制することが可能となる．

