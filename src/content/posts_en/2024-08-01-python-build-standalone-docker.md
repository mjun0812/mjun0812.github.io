---
title: "Building Portable Python Environments with python-build-standalone and Docker"
tags: [Python, Docker]
category: Python
date: 2024-08-01
update: 2024-08-01
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

Hello. This time I'll introduce python-build-standalone, which enables deployment of portable Python environments supporting Linux, macOS, Windows/x86, and ARM.

<https://github.com/indygreg/python-build-standalone>

<https://gregoryszorc.com/docs/python-build-standalone/main/>

## Overview

The python-build-standalone repository published on GitHub distributes pre-built Python binaries for various OS and CPU architectures.
The distributed Python includes pip, so you can start using the Python environment immediately after download.
Additionally, the Python provided here is used by recently notable package managers like Rye and mise, helping to build flexible Python environments.

Due to licensing, the distributed Python may behave differently from self-built versions, but there are no issues in most operations. Details are written in the following article:

<https://techtekt.persol-career.co.jp/entry/tech/240523_01>

## Provided Python

python-build-standalone provides pre-built Python binaries for various OS and CPU architectures.
They can be obtained from the following GitHub Release page:

<https://github.com/indygreg/python-build-standalone/releases>

The naming convention for available binaries follows this format:

```bash
cpython-(Python version)+(release timestamp)-(architecture)-(build configuration)-(included content)
```

Each item is as follows:

### Release Timestamp

Enter the date when the Release was published, set as a GitHub Tag.
The latest Release date can be confirmed from the following GitHub API:

<https://raw.githubusercontent.com/indygreg/python-build-standalone/latest-release/latest-release.json>

### Architecture

| Item                        | Content                                                                                                                  |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `aarch64-apple-darwin`      | macOS ARM CPU. M1, M2, M3, etc.                                                                                         |
| `x86_64-apple-darwin`       | macOS Intel CPU                                                                                                         |
| `i686-pc-windows-msvc`      | Windows 32-bit Intel/AMD CPU                                                                                            |
| `x86_64-pc-windows-msvc`    | Windows 64-bit Intel/AMD CPU                                                                                            |
| `*-windows-msvc-shared`     | Windows Python standard build. Has Python and extension DLLs. Same behavior as official Windows Python.               |
| `*-windows-msvc-static`     | Static-linked Python build. Very fragile with known compatibility issues. Not recommended unless comprehensive test coverage and verified operation in use case. |
| `x86_64-unknown-linux-gnu`  | Linux 64-bit Intel/AMD CPU, linked with GNU libc.                                                                      |
| `x86_64-unknown-linux-musl` | Linux 64-bit Intel/AMD CPU, linked with musl libc. Static binary with no shared library dependencies. Cannot load Python `.so` extensions. |
| `aarch64-unknown-linux-*`   | For Linux ARM64 CPUs. Applies to AWS Graviton EC2 instances etc. Many Linux ARM devices are also `aarch64`.          |
| `i686-unknown-linux-*`      | Linux 32-bit Intel/AMD CPU.                                                                                             |
| `x86_64_v2-*`               | For 64-bit Intel/AMD CPUs from 2008 Nehalem onwards. Has SSE3, SSE4, etc. Won't start on older CPUs.                 |
| `x86_64_v3-*`               | For 64-bit CPUs from 2013 Haswell (Intel) or 2015 Excavator (AMD) onwards. Has AVX, AVX2, MOVBE, etc. Won't start on older CPUs. |
| `x86_64_v4-*`               | For 64-bit Intel/AMD CPUs with some AVX-512 instructions. Targets Intel CPUs from 2017 onwards, but not all Intel CPUs have AVX-512. |

SIMD-enabled `x86_64_v2-*`, `x86_64_v3-*`, `x86_64_v4-*` will crash if run on unsupported CPUs.
According to documentation, `*-unknown-linux-gnu` is recommended for Linux, `*-windows-msvc-shared` for Windows. For macOS, choose according to CPU.

Other architectures like armv7 not mentioned here are also included in actual Releases, so please check.

### Build Configuration

- pgo+lto: Profile guided optimization and Link-time optimization applied during build. Fastest distribution
- pgo: Only Profile guided optimization applied
- lto: Only Link-time optimization applied
- noopt: Build with only normal optimization
- debug: Debug build without optimization

### Included Content

- install_only: Only files needed for post-build installation
- install_only_stripped: Lightweight version of install_only with debug symbols removed
- full: All files and artifacts used in build included. Distributed in .tar.zst format

Let's look at capacity differences between the above:

| Variation                                                                    | Size   |
|----------------------------------------------------------------------------|--------|
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-install_only.tar.gz`     | 60.5MB |
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-install_stripped.tar.gz` | 21.2MB |
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-pgo+lto-full.tar.zst`    | 87.3MB |
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-pgo-full.tar.zst`        | 47.8MB |

## Usage with Docker

Let's try introducing Python obtained from python-build-standalone in a Dockerfile.

This time, I'll install `cpython-3.11.9+20240726-x86_64-unknown-linux-gnu-pgo+lto-full.tar.zst` on a debian:latest image.

```dockerfile
FROM --platform=linux/amd64 debian:latest

ARG TAG="20240726"
ARG PYTHON_VERSION="3.11.9"

RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    zstd

RUN curl -sSL "https://github.com/indygreg/python-build-standalone/releases/download/${TAG}/cpython-${PYTHON_VERSION}+${TAG}-x86_64-unknown-linux-gnu-pgo+lto-full.tar.zst" -o python.tar.zst \
    && tar -axvf python.tar.zst \
    && mv python/install /usr/local/python \
    && rm -rf python.tar.zst python
ENV PATH="/usr/local/python/bin:$PATH"
ENV LD_LIBRARY_PATH="/usr/local/python/lib:$LD_LIBRARY_PATH"
```

```bash
docker build -f Dockerfile ./ -t debian-python

docker run --rm -it debian-python python
Python 3.11.9 (main, Jul 25 2024, 22:42:09) [Clang 18.1.8 ] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

The Python interpreter started successfully.

To introduce arbitrary Python versions in Docker containers, options were limited to registering apt repository `ppa:deadsnakes/ppa`, building with pyenv, poetry, etc., or building yourself.
Using python-build-standalone enables easy environment setup.
Particularly, NVIDIA Docker images like `nvidia/cuda` don't include Python by default, so this method allows easy Python environment addition.

## Summary

This time I introduced the method of installing pre-built Python supporting various OS and architectures distributed by python-build-standalone into Docker.
This method enables easy Python environment construction without new builds.