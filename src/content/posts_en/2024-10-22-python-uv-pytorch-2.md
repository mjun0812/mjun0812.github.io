---
title: "Managing PyTorch CPU/CUDA Versions per Environment with uv Part 2"
tags: [Python, PyTorch, uv]
category: Python
date: 2024-10-22
update: 2024-10-22
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

Hello. This time, continuing from the previous article, I'll introduce methods for installing PyTorch using the Python package manager uv.

Previous article:

https://mjunya.com/posts/2024-08-22-python-uv-pytorch/

With the uv v0.4.23 update, functionality to specify multiple index-urls for a single package was added.

https://github.com/astral-sh/uv/releases/tag/0.4.23

Using this functionality, you can explicitly change the index-url referenced per environment, enabling more reliable PyTorch installation.

> The reason I'm writing this article now is that the method introduced [previously](https://mjunya.com/posts/2024-08-22-python-uv-pytorch/) 
> became unusable for CUDA 12.4 cases.
> When using PyTorch for CUDA 12.4 and later, please use the techniques described in this article.

First, let's update uv to v0.4.23 or later. You can update with the following command:

```bash
uv self update
```

Next, write the pyproject.toml with uv dependencies as follows.
This time it's for switching between CPU and CUDA versions of PyTorch on macOS/aarch64 Linux and x86_64 Linux.

```toml
[project]
name = "new-uv"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "torch==2.5.0+cu124; sys_platform == 'linux' and platform_machine == 'x86_64'",
    "torch==2.5.0; sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')",
]

[[tool.uv.index]]
name = "torch-cuda"
url = "https://download.pytorch.org/whl/cu124"
explicit = true

[[tool.uv.index]]
name = "torch-cpu"
url = "https://download.pytorch.org/whl/cpu"
explicit = true

[tool.uv.sources]
torch = [
    { index = "torch-cuda", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'"},
    { index = "torch-cpu", marker = "sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')"},
]
```

Let's look at this step by step.

First, write torch dependencies for each environment using environment markers ([PEP508](https://peps.python.org/pep-0508/)) in the dependencies section:

```toml
dependencies = [
    "torch==2.5.0+cu124; sys_platform == 'linux' and platform_machine == 'x86_64'",
    "torch==2.5.0; sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')",
]
```

Next, configure index-urls for CPU and CUDA versions of PyTorch.
Don't forget `explicit = true` at this time. Here's the explanation of the explicit option:

> The explicit flag is optional and indicates that the index should only be used for packages that explicitly specify it in tool.uv.sources. If explicit is not set, other packages may be resolved from the index, if not found elsewhere.  
> Quoted from <https://docs.astral.sh/uv/concepts/dependencies/#index>

In essence, it's an option to restrict the index-specified url from being used when searching for other packages.
Since this time's index-url is only used for torch installation, and it might reference packages incompatible with the current architecture causing errors, don't forget this.

```toml
[[tool.uv.index]]
name = "torch-cuda"
url = "https://download.pytorch.org/whl/cu124"
explicit = true

[[tool.uv.index]]
name = "torch-cpu"
url = "https://download.pytorch.org/whl/cpu"
explicit = true
```

Next, let's enable torch installation from index-urls.
Here too, use environment-markers to configure index-urls per environment.
In `index = "torch-cpu"`, specify the name from the previously defined `[[tool.uv.index]]`.

```toml
[tool.uv.sources]
torch = [
    { index = "torch-cuda", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'"},
    { index = "torch-cpu", marker = "sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')"},
]
```

Using uv sync based on this `pyproject.toml`, appropriate PyTorch can be installed on both macOS and Linux.

By the way, here's a sample for installing `torchvision`:

```toml
[project]
name = "new-uv"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "torch==2.4.0+cu124; sys_platform == 'linux' and platform_machine == 'x86_64'",
    "torch==2.4.0; sys_platform == 'darwin' or ( sys_platform == 'linux' and platform_machine == 'aarch64')",
    "torchvision==0.19.0+cu124; sys_platform == 'linux' and platform_machine == 'x86_64'",
    "torchvision==0.19.0; sys_platform == 'darwin' or ( sys_platform == 'linux' and platform_machine == 'aarch64')",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv.sources]
torch = [
    { index = "torch-cuda", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'"},
    { index = "torch-cpu", marker = "sys_platform == 'darwin' or ( sys_platform == 'linux' and platform_machine == 'aarch64')"},
]
torchvision = [
    { index = "torch-cuda", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'"},
    { index = "torch-cpu", marker = "sys_platform == 'darwin' or ( sys_platform == 'linux' and platform_machine == 'aarch64')"},
]

[[tool.uv.index]]
name = "torch-cuda"
url = "https://download.pytorch.org/whl/cu124"
explicit = true

[[tool.uv.index]]
name = "torch-cpu"
url = "https://download.pytorch.org/whl/cpu"
explicit = true
```

That concludes the introduction to PyTorch installation using multiple pinned indexes with uv.