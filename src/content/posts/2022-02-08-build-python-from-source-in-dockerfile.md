---
title: Dockerfile内で任意のバージョンのPythonをソースからビルドする
tags: [docker]
category: Docker
date: 2022-02-08
update: 2022-02-08
---

コンテナ内で自由にバージョンを指定して Python を使いたいときがある．  
方法としては以下が考えられる．

1. apt などでインストールする
2. pyenv を使う
3. python-build を使う([参考](https://qiita.com/shngt/items/51102aeb81834d0d3d7a))
4. ソースからビルドする

1 の apt だと，3.7 や 3.9 などの 2 桁目までは指定できるが，
3.9.1 や 3.9.2 までは指定できない．(セキュリティ的にはこっちが良いが)．
そもそも Image によっては欲しいバージョンがない場合もある．

次に 2,3 の pyenv や python-build を使用する方法だが，
pyenv をクローンしてこなければならないので，回りくどい．  
あと，ホストマシンで pyenv local しているディレクトリをマウントして，
コンテナ内でそのディレクトリに入ると，存在しないバージョンを参照されてしまうので，
何かとやりづらい．

やっぱりソースからビルドするのが一番素直で楽なのかもしれない．

というわけで，Dockerfile 例は以下．

```dockerfile
FROM nvidia/cuda:11.2-cudnn8-devel-ubuntu20.04

ARG PYTHON="3.9.10"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    # Python build dependencies
    make \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    wget \
    curl \
    llvm \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    libffi-dev \
    liblzma-dev

RUN wget -q "https://www.python.org/ftp/python/${PYTHON}/Python-${PYTHON}.tar.xz" &&\
    tar xvf Python-${PYTHON}.tar.xz && \
    cd Python-${PYTHON} &&\
    ./configure --enable-optimizations --without-ensurepip --enable-loadable-sqlite-extensions && \
    make -j 8 &&\
    make install && \
    cd ../ && rm -rf Python-${PYTHON} && \
    python3 -V && \
    ln -s /usr/local/bin/python3 /usr/local/bin/python

RUN curl -kL https://bootstrap.pypa.io/get-pip.py | python && \
    pip --version &&\
    rm -rf get-pip.py

RUN echo 'export PATH=~/.local/bin:$PATH' >> ~/.bashrc
```

python3 に python のエイリアスを貼っているので，python コマンドでそのまま任意の Python を使用できる．
