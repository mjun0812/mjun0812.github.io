---
title: "Building Python from Source with Custom Version in Dockerfile"
tags: [docker]
category: Docker
date: 2022-02-08
update: 2022-02-08
---

Sometimes you want to freely specify versions and use Python within containers.
Possible methods include:

1. Install with apt etc.
2. Use pyenv
3. Use python-build ([reference](https://qiita.com/shngt/items/51102aeb81834d0d3d7a))
4. Build from source

With method 1 using apt, you can specify up to the second digit like 3.7 or 3.9, but you can't specify down to 3.9.1 or 3.9.2 (though this is better for security). Sometimes the desired version isn't available depending on the image.

For methods 2 and 3 using pyenv or python-build, you need to clone pyenv, which is roundabout.
Also, if you mount a directory where you've done `pyenv local` on the host machine and enter that directory in the container, it will reference a non-existent version, making it difficult to work with.

Building from source might be the most straightforward and easiest approach.

Here's a Dockerfile example:

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

Since I'm creating an alias from python3 to python, you can use any Python version directly with the python command.