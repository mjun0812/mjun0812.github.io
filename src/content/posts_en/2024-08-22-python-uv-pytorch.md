---
title: "Managing PyTorch CPU/CUDA Versions per Environment with uv"
tags: [Python, PyTorch, uv]
category: Python
date: 2024-08-22
update: 2024-08-22
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

Hello. This time I'll introduce how to switch and install PyTorch CPU/CUDA versions according to environments like Linux or macOS using the Python package manager uv.

> uv v0.4.23 added the ability to install by specifying multiple index-urls.
> This is introduced in the following new article.
> The method introduced in this article may not work for CUDA 12.4 and later,
> so please refer to the new article below.

<https://mjunya.com/posts/2024-10-22-python-uv-pytorch-2>

## Introduction

uv v0.30.0 recently released enabled Python management itself, similar to what was implemented in Rye.

<https://astral.sh/blog/uv-unified-python-packaging>

<https://nikkie-ftnext.hatenablog.com/entry/uv-0.3.0-release-awesome-future-python-project-package-manager>

The command system is almost the same as Rye, allowing you to build Python environments with any version like this:

```bash
uv python install 3.11
uv python pin 3.10
```

While poetry enables dependency resolution and package installation considering Multi Platform, dependency resolution is slow. Rye has fast dependency resolution thanks to Rust implementation, but creates requirements.lock dependent on specific machine environments, making it difficult to manage projects across multiple environments.
So with uv absorbing Rye's Python management functionality while enabling Multi Platform consideration like poetry, I think users of both can migrate without problems.

With this feature addition, I was trying to migrate projects managed with poetry or Rye and was experimenting with PyTorch installation methods.

<https://zenn.dev/mjun0812/scraps/671db64dc42ffa>

I discovered a method to switch PyTorch installation by environment, similar to poetry's environment markers, so I'll share it.

<https://zenn.dev/nakakiiro/articles/3cc5f4080a7a09>

## Result

First, here's the completed `pyproject.toml`:

```toml
[project]
name = "new-uv"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "torch==2.4.0+cu118; sys_platform == 'linux' and platform_machine == 'x86_64'",
    "torch==2.4.0; sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')",
    "torchvision==0.19.0+cu118; sys_platform == 'linux'",
    "torchvision==0.19.0; sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')",
    "numpy<2.0.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
find-links = [
    "https://download.pytorch.org/whl/cu118/torch",
    "https://download.pytorch.org/whl/cu118/torchvision",
]
```

The above pyproject.toml has been verified in the following environments:

- macOS 14.6 Sonoma, arm64, M1 MacBook Air 2020
- Ubuntu 22.04, x86_64, Ryzen 5700+RTX3090 custom PC

## Explanation

uv enables package dependency description based on [PEP508](https://peps.python.org/pep-0508/).

<https://docs.astral.sh/uv/concepts/dependencies/#pep-508>

This description method includes Environment Markers functionality, allowing dependency description per system environment.
The relevant part in the above pyproject.toml is:

```toml
"torch==2.4.0+cu118; sys_platform == 'linux' and platform_machine == 'x86_64'",
"torch==2.4.0; sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')",
```

This description installs:

- CUDA 11.8 compatible PyTorch for Linux + x86_64 architecture
- CPU version PyTorch for macOS + arm64 (Apple Silicon Mac)

Also, note that in PyTorch version notation `2.4.0+cu118`, the `+cu118` part is called Local Version, and when using Local Version with uv, you can only use `==` for package version specification (`>=` is not available).

<https://docs.astral.sh/uv/pip/compatibility/#local-version-identifiers>

As mentioned below, when installing torch on macOS, you must write `torch==2.4.0` not `torch==2.4.0+cpu` or installation will fail.
This might be improved in the future.

<https://github.com/astral-sh/uv/issues/5182>

That concludes the introduction to PyTorch installation with uv. With the addition of Python management functionality, uv seems to have no gaps. I'll be watching its future development.