---
title: "MLflowをDocker ComposeとMySQLとRustFSを用いてオンプレサーバで構築する"
tags:
  - Python
  - Research
  - MLflow
  - Docker
  - PyTorch
  - MySQL
  - RustFS
  - Docker Compose
  - MLOps
category: Tool
date: 2025-12-16
update: 2025-12-16
# For Zenn
emoji: "😖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics:
  - "mlops"
  - "mlflow"
  - "mysql"
  - "rustfs"
  - "dockercompose"
published: true
---

> [!NOTE]
> この記事は[MLflow をオンプレサーバで構築する](https://mjunya.com/posts/2022-09-05_mlflow-onpre/)の更新版です．
> 前回は artifact ストレージを MinIO を用いて構築していますが，今回は RustFS を用いて構築しています．

こんにちは．今回は実験・モデル管理などの MLOps プラットフォームである MLflow を Docker Compose と MySQL と RustFS を用いてオンプレミスで構築する方法についてご紹介します．

前回書いた記事では，OSS の S3 互換オブジェクトファイルストレージである MinIO を用いて構築していましたが，OSS 版の MinIO は Docker イメージの配布が終了し，ソースコード自体もメンテナンスモードに移行してしまいました．
そこで，代替として今回は Rust で書かれた OSS のオブジェクトファイルストレージである RustFS を用いて構築していきます．

> [!WARNING]
> 2025.12.16 現在，RustFS はまだ正式リリースされていないため，
> 本記事では RustFS の alpha 版を用いて構築しています．
> 開発中のため予期せぬ不具合が発生する可能性があります．
> 予めご了承ください．

本記事の構築例は以下の Github リポジトリにて公開しています．

https://github.com/mjun0812/MLflow-Docker

公式ドキュメントは以下です．

**MLflow**

https://www.mlflow.org/

**RustFS**

https://github.com/rustfs/rustfs

## 導入の背景

機械学習プロジェクトでは，ハイパーパラメータやモデル，データセットを変更しながら様々な実験を行うことになります．この際，結果の比較を効率的に行える実験管理ツールを導入することで，モデルの開発に集中できます．
この手の実験管理ツールは，Tensorboard や Weight and Bias(wandb)など様々ありますが，データの外部送信を行わずに扱える「オンプレミス」という点に着目すると選択肢はさほど多くないです．
そこで，オンプレミスで構築可能な代表的なプラットフォームである MLflow を構築してみようと思います．

## MLflow とは

Mlflow はオープンソースの MLOps プラットフォームで，以下の 5 つのケースをサポートしています．

- Tracking & Experiment Management: 実験の結果を管理し，比較を行う
- Model Registry: 機械学習モデルのバージョン管理を行う
- Model Deployment: 機械学習モデルのサービングを行う
- ML Library Integration: 機械学習ライブラリとの統合
- Model Evaluation: 機械学習モデルの性能評価

これらのケースで MLflow を利用するためには，backend store としてパラメータを保存するデータベースと，artifact store としてモデルの重みやログファイル等を保存するオブジェクトファイルストレージが必要になります．そこで今回は，Docker Compose を用いて以下のような構成を取ることで，完全オンプレミスで MLflow を構築していきます．

- backend store: MySQL
- artifact store: RustFS

私は主に実験の管理を行う Tracking Server を利用するため，その部分を中心に記事を書いていますが，他のケースについても今回の構築例をベースとして利用できるはずです．

## 構成図

今回は Docker Compose を用いて，以下のような構成で MLflow Server を構築していきます．

![architecture](./images/mlflow.png)

MLflow の Tracking Server は，実験のパラメータや結果を MySQL の DB に保存し，artifact を RustFS に保存します．
また，MLflow の WebUI は Nginx Proxy を用いて Basic 認証をかけることで，一部のユーザーのみがアクセスできるようにします．

## Quick Start

手取り早く構築する場合は，以下の GitHub リポジトリをクローンして，`README.md`の手順に従うか，以下のコマンドを実行してください．

https://github.com/mjun0812/MLflow-Docker

```bash
git clone https://github.com/mjun0812/MLflow-Docker.git
cd MLflow-Docker
cp env.template .env
vim .env
```

`.env`ファイルを編集して，待ち受けドメインと MLflow のバージョンを指定してください．

```bash
# 待ち受けドメインを指定．
# localhostのみだと，ローカルからのみアクセスできるようになります．
VIRTUAL_HOST=localhost
# MLflowのバージョンを指定したい場合はここに指定
# 指定しない場合は最新版が使用されます
MLFLOW_VERSION=
```

(Optional) Basic 認証をかける場合は，`nginx/htpasswd/localhost`ファイルにユーザー名とパスワードを設定してください．

```bash
htpasswd -c nginx/htpasswd/localhost [username]
```

次に，以下のコマンドを実行して，イメージのビルドとコンテナの起動を行います．

```bash
docker compose up -d
```

これで，`localhost:15000`で MLflow の WebUI にアクセスできるようになります．

Python のコードから MLflow を利用する場合は，以下のようにしてください．

```python
import os

import mlflow

# Basic認証をかける場合
os.environ["MLFLOW_TRACKING_USERNAME"] = "username"
os.environ["MLFLOW_TRACKING_PASSWORD"] = "password"

# 環境変数で設定する場合
os.environ["MLFLOW_TRACKING_URI"] = "http://localhost:15000"

mlflow.set_tracking_uri("http://localhost:15000")
mlflow.set_experiment("example")

with mlflow.start_run():
  mlflow.log_param("param1", 1)
  mlflow.log_metric("metric1", 1)
```

## 構築の詳細

次に，構築の詳細について説明します．まずファイルの全体を示し，その後，各コンテナの設定を見ていきます．本記事の例では，以下のコンテナを立てて構築しています．

- Nginx Proxy([jwilder/nginx-proxy](https://github.com/nginx-proxy/nginx-proxy))
- MLflow Server (自前 Dockerfile)
- MySQL
- RustFS

```yaml
services:
  nginx-proxy:
    image: jwilder/nginx-proxy:latest
    restart: unless-stopped
    ports:
      - "15000:80"
    volumes:
      - ./nginx/htpasswd:/etc/nginx/htpasswd
      - ./nginx/conf.d/proxy.conf:/etc/nginx/conf.d/proxy.conf
      - /var/run/docker.sock:/tmp/docker.sock:ro
    networks:
      - mlflow-net

  mlflow:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        MLFLOW_VERSION: ${MLFLOW_VERSION}
    expose:
      - "80"
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
      rustfs-init:
        condition: service_completed_successfully
    env_file:
      - .env
    environment:
      TZ: Asia/Tokyo
      VIRTUAL_HOST: "${VIRTUAL_HOST:-localhost}"
      MLFLOW_S3_ENDPOINT_URL: http://rustfs:9000
      AWS_ACCESS_KEY_ID: rustfs-mlflow
      AWS_SECRET_ACCESS_KEY: rustfs-mlflow
      MLFLOW_BACKEND_STORE_URI: mysql+mysqldb://mlflow:mlflow@db:3306/mlflow
    command: >
      mlflow server
      --backend-store-uri 'mysql+mysqldb://mlflow:mlflow@db:3306/mlflow'
      --artifacts-destination 's3://mlflow/artifacts'
      --serve-artifacts
      --host 0.0.0.0
      --port 80
    networks:
      - mlflow-net
      - mlflow-internal-net

  db:
    image: mysql:latest
    restart: unless-stopped
    environment:
      MYSQL_USER: mlflow
      MYSQL_PASSWORD: mlflow
      MYSQL_ROOT_PASSWORD: mlflow
      MYSQL_DATABASE: mlflow
      TZ: Asia/Tokyo
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/my.cnf:/etc/mysql/conf.d/my.cnf
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 10s
      retries: 5
    networks:
      - mlflow-internal-net

  rustfs:
    image: rustfs/rustfs:latest
    security_opt:
      - "no-new-privileges:true"
    # ports:
    #   - "9000:9000" # S3 API port
    environment:
      - RUSTFS_VOLUMES=/data/rustfs
      - RUSTFS_ADDRESS=0.0.0.0:9000
      - RUSTFS_CONSOLE_ENABLE=false
      - RUSTFS_EXTERNAL_ADDRESS=:9000
      - RUSTFS_CORS_ALLOWED_ORIGINS=*
      - RUSTFS_ACCESS_KEY=rustfs-mlflow
      - RUSTFS_SECRET_KEY=rustfs-mlflow
      - RUSTFS_OBS_LOGGER_LEVEL=info
      # Object Cache
      - RUSTFS_OBJECT_CACHE_ENABLE=true
      - RUSTFS_OBJECT_CACHE_TTL_SECS=300
    volumes:
      - ./rustfs:/data/rustfs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "sh", "-c", "curl -f http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - mlflow-internal-net
      # - mlflow-net

  rustfs-init:
    image: amazon/aws-cli:latest
    depends_on:
      rustfs:
        condition: service_healthy
    environment:
      - AWS_ACCESS_KEY_ID=rustfs-mlflow
      - AWS_SECRET_ACCESS_KEY=rustfs-mlflow
      - AWS_DEFAULT_REGION=us-east-1
      - AWS_REGION=us-east-1
    entrypoint: /bin/sh
    command: -c "aws --endpoint-url http://rustfs:9000 s3api create-bucket --bucket mlflow || true"
    restart: "no"
    networks:
      - mlflow-internal-net

  # RustFS volume permissions fixer service
  volume-permission-helper:
    image: alpine
    volumes:
      - ./rustfs:/data
    command: >
      sh -c "
        chown -R 10001:10001 /data &&
        echo 'Volume Permissions fixed' &&
        exit 0
      "
    restart: "no"

networks:
  mlflow-net:
    driver: bridge
  mlflow-internal-net:
    internal: true
```

### nginx-proxy

Nginx Proxy は，MLflow の WebUI を Nginx で Proxy するために用いています．ここで用いている[jwilder/nginx-proxy](https://github.com/nginx-proxy/nginx-proxy)の Docker イメージは，Nginx の設定ファイルをほとんど書かずに`compose.yml`の記述と特定のボリュームのマウント，環境変数の編集を行うだけで，Basic 認証をかけた Nginx Proxy を立てることができます．

```yaml
nginx-proxy:
  image: jwilder/nginx-proxy:latest
  restart: unless-stopped
  ports:
    - "15000:80"
  volumes:
    - ./nginx/htpasswd:/etc/nginx/htpasswd
    - ./nginx/conf.d/proxy.conf:/etc/nginx/conf.d/proxy.conf
    - /var/run/docker.sock:/tmp/docker.sock:ro
  networks:
    - mlflow-net
```

今回は proxy したいサービスが MLflow Server 1 つだけなので，nginx-proxy の利用は過剰に見えますが，ファイルの配置だけで，簡単に待ち受けドメインの指定や Basic 認証の on/off を切り替えることができるため利用しています．

まず，nginx 全体の設定として，`nginx/conf.d/proxy.conf`に以下のような設定を追加しておきます．

```conf
client_max_body_size 100g;
```

これは，MLflow Server が送信するファイルのサイズが大きい場合に備えて，巨大なファイルを送信できるようにするための設定です．

次に待ち受けするドメインの指定と Basic 認証の設定を mlflow のコンテナの環境変数`VIRTUAL_HOST`で記述しておきます．

```yaml
mlflow:
  expose:
    - "80"
  environment:
    VIRTUAL_HOST: "example.com,localhost"
```

この環境変数の値はカンマ区切りで複数のドメインを指定できます．また，proxy したいポートを`expose`で指定しておきます．ここで`expose`で指定したポートは，nginx-proxy のポートにマッピングされるため，`nginx-proxy`側で以下のようにポートを指定しておきます．

```yaml
nginx-proxy:
  ports:
    - "15000:80"
```

これで，外から`example.com:15000`と`localhost:15000`で MLflow の WebUI にアクセスできるようになります．

Basic 認証を設定する場合は，nginx-proxy のボリュームにマウントした`nginx/htpasswd`ファイルにユーザー名とパスワードを設定しておきます．このとき，Basic 認証のファイル名はドメイン名と同じになるようにしておきます．

```bash
cd nginx/htpasswd
htpasswd -c example.com [username]
cp example.com localhost
```

これで，`example.com`と`localhost`から MLflow の WebUI にアクセスできるようになります．待ち受けドメインの変更や Basic 認証が不要になった場合でも，nginx の設定ファイルはコンテナ起動時に更新されるため，手動で変更する必要はありません．

### MLflow

MLflow Server は，以下の Dockerfile と compose.yml で構築しています．MLflow のバージョンを環境変数`MLFLOW_VERSION`で指定できるようにしています．指定を行わない場合は最新版が使用されます．

MLflow は DB との接続に SQLAlchemy を使用しているため，DB に合わせたドライバーの MySQL のクライアントライブラリである`mysqlclient`が必要になります．また，S3 互換のオブジェクトファイルストレージである RustFS にアクセスするために，`boto3`をインストールしておきます．

```dockerfile
FROM python:3.13

ARG MLFLOW_VERSION=""

RUN if [ -n "$MLFLOW_VERSION" ]; then \
        pip install --no-cache-dir mlflow=="$MLFLOW_VERSION" mysqlclient boto3; \
    else \
        pip install --no-cache-dir mlflow mysqlclient boto3; \
    fi
```

コンテナ内で`mlflow server`コマンドを実行し，MLflow Server を立てています．
ここで，`--backend-store-uri`オプションで MySQL の接続情報を指定し，
`--artifacts-destination`オプションで RustFS 内のバケットやフォルダのパスを指定しています．
また，`--serve-artifacts`オプションで，artifact を MLflow Server が動作しているコンテナから RustFS に保存するようにしています．この設定がない場合は，クライアントが S3 に直接アクセスして，artifact を保存することになります．

```yaml
mlflow:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      MLFLOW_VERSION: ${MLFLOW_VERSION}
  expose:
    - "80"
  restart: unless-stopped
  depends_on:
    db:
      condition: service_healthy
    rustfs-init:
      condition: service_completed_successfully
  env_file:
    - .env
  environment:
    TZ: Asia/Tokyo
    VIRTUAL_HOST: "${VIRTUAL_HOST:-localhost}"
    MLFLOW_S3_ENDPOINT_URL: http://rustfs:9000
    AWS_ACCESS_KEY_ID: rustfs-mlflow
    AWS_SECRET_ACCESS_KEY: rustfs-mlflow
    MLFLOW_BACKEND_STORE_URI: mysql+mysqldb://mlflow:mlflow@db:3306/mlflow
  command: >
    mlflow server
    --backend-store-uri 'mysql+mysqldb://mlflow:mlflow@db:3306/mlflow'
    --artifacts-destination 's3://mlflow/artifacts'
    --serve-artifacts
    --host 0.0.0.0
    --port 80
  networks:
    - mlflow-net
    - mlflow-internal-net
```

### RustFS

RustFS は起動時のみ動作する`rustfs-init`, `volume-permission-helper`の 2 つのコンテナと，Serve を行うコンテナの`rustfs`の 3 つのコンテナで構成されています．

- `rustfs-init`: RustFS の起動時にバケットを作成するためのコンテナ.
- `volume-permission-helper`: RustFS のボリュームのパーミッションを修正するためのコンテナ．RustFS のボリュームのパーミッションが不適切な場合に動作する．
- `rustfs`: RustFS のコンテナ

```yaml
rustfs:
  image: rustfs/rustfs:latest
  security_opt:
    - "no-new-privileges:true"
  # ports:
  #   - "9000:9000" # S3 API port
  environment:
    - RUSTFS_VOLUMES=/data/rustfs
    - RUSTFS_ADDRESS=0.0.0.0:9000
    - RUSTFS_CONSOLE_ENABLE=false
    - RUSTFS_EXTERNAL_ADDRESS=:9000
    - RUSTFS_CORS_ALLOWED_ORIGINS=*
    - RUSTFS_ACCESS_KEY=rustfs-mlflow
    - RUSTFS_SECRET_KEY=rustfs-mlflow
    - RUSTFS_OBS_LOGGER_LEVEL=info
    # Object Cache
    - RUSTFS_OBJECT_CACHE_ENABLE=true
    - RUSTFS_OBJECT_CACHE_TTL_SECS=300
  volumes:
    - ./rustfs:/data/rustfs
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "sh", "-c", "curl -f http://localhost:9000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
  networks:
    - mlflow-internal-net
    # - mlflow-net

rustfs-init:
  image: amazon/aws-cli:latest
  depends_on:
    rustfs:
      condition: service_healthy
  environment:
    - AWS_ACCESS_KEY_ID=rustfs-mlflow
    - AWS_SECRET_ACCESS_KEY=rustfs-mlflow
    - AWS_DEFAULT_REGION=us-east-1
    - AWS_REGION=us-east-1
  entrypoint: /bin/sh
  command: -c "aws --endpoint-url http://rustfs:9000 s3api create-bucket --bucket mlflow || true"
  restart: "no"
  networks:
    - mlflow-internal-net

# RustFS volume permissions fixer service
volume-permission-helper:
  image: alpine
  volumes:
    - ./rustfs:/data
  command: >
    sh -c "
      chown -R 10001:10001 /data &&
      echo 'Volume Permissions fixed' &&
      exit 0
    "
  restart: "no"
```

上記の例では，RustFS の WebUI を無効化していますが，必要に応じて以下のように設定し，有効化することもできます．

```yaml
nginx-proxy:
  ports:
    - "15001:9001"

rustfs:
  image: rustfs/rustfs:latest
  security_opt:
    - "no-new-privileges:true"
  ports:
    # - "9000:9000" # S3 API port
  # Nginx Proxyの設定を追記
  expose:
    - "9001"
  environment:
    # 待ち受けドメインの指定
    - VIRTUAL_HOST=example.com,localhost

    - RUSTFS_VOLUMES=/data/rustfs
    - RUSTFS_ADDRESS=0.0.0.0:9000
    - RUSTFS_EXTERNAL_ADDRESS=:9000
    - RUSTFS_CORS_ALLOWED_ORIGINS=*
    - RUSTFS_ACCESS_KEY=rustfs-mlflow
    - RUSTFS_SECRET_KEY=rustfs-mlflow
    - RUSTFS_OBS_LOGGER_LEVEL=info

    # WebUIの設定を追記
    - RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001
    - RUSTFS_CONSOLE_ENABLE=true
    - RUSTFS_CONSOLE_CORS_ALLOWED_ORIGINS=*

    # Object Cache
    - RUSTFS_OBJECT_CACHE_ENABLE=true
    - RUSTFS_OBJECT_CACHE_TTL_SECS=300
  volumes:
    - ./rustfs:/data/rustfs
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "sh", "-c", "curl -f http://localhost:9000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
  networks:
    - mlflow-internal-net
```

上記の設定では，RustFS の WebUI を`example.com:15001`と`localhost:15001`からアクセスできるようにしています．

## RustFS への移行方法

RustFS へのデータの移行には，MinIO が開発している`mc`コマンドを用いると便利です．

https://github.com/minio/mc

`mc`コマンドにはバケットのミラー(rsync)機能があるため，これを用いて簡単にデータを移行することができます．

1. 移行元と移行先，両方の S3 互換ストレージへアクセスできる状態にします。
2. MinIO Client（mc）のコンテナを`--net host`で起動します。

```bash
docker run --rm -it --net host --entrypoint sh minio/mc
```

1. コンテナ内で、移行元と移行先の接続情報の設定を行います。

```bash
# 移行元
mc alias set src http://host.docker.internal:10000 <ACCESS_KEY> <SECRET_KEY>
# 移行先
mc alias set dst http://host.docker.internal:9000 <ACCESS_KEY> <SECRET_KEY>
```

1. `mc mirror`コマンドでデータをコピーします。

```bash
mc mirror src/mlflow/artifacts dst/mlflow/artifacts
```

## 参考

https://www.mlflow.org/

https://github.com/rustfs/rustfs

https://note.com/sakachan333/n/n76ac771c7504

https://github.com/nginx-proxy/nginx-proxy
