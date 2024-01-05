---
title: UbuntuでGitLabをapache経由でproxyする
tags: [Server, Linux, Ubuntu, GitLab]
category: Server
date: 2022-04-05
update: 2022-04-05
---

今回はUbuntuでApacheを使ってGitlabをサブディレクトリで立てる方法です．  
SSL証明書はGitLabではなく，Apacheとcertbotで管理します．  

今回のゴールは，`https://hoge.com/gitlab`にGitLabを立てることです．

## apacheのインストール

まずはapache2のインストール．

```bash
sudo apt install apache2
sudo systemctl status apache
```

## certbotの導入

次にcertbotを導入します．予め，登録用のメールアドレスとドメインを用意してください．

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

# 自動更新が働いているかを確認
sudo systemctl status certbot.timer
```

## apacheの設定

次に，apacheにProxyの設定をします．  
`/etc/apache2/sites-enabled/000-default-le-ssl.conf`に以下を加筆します．

```bash
ProxyPass /gitlab http://localhost:8000/gitlab
ProxyPassReverse /gitlab http://localhost:8000/gitlab
```

ついでにapacheのバージョンが外から見えないように，`/etc/apache2/conf-enabled/security.conf`を編集します．

```bash
ServerTokens Prod
ServerSignature Off
```

設定が終わったら，apacheを再起動します．

```bash
sudo systemctl restart apache
```

## GitLabの立ち上げ

今回はdocker-composeでGitLabを立ち上げます．

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

SSL証明書はapacheで管理するので，`letsencrypt['enable'] = false`としておきます．  

以上でapache経由で任意のサブディレクトリでGitLabにアクセスできます．
