---
title: "My First Issue and Pull Request: Contributing to PyTorch and YOLOv5"
tags: [PyTorch, Github]
category: Dev
date: 2022-07-11
update: 2022-07-11
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: false
---

Hello. This time I'd like to write about how my first issue led to fixing a PyTorch bug and adding new CI/CD test items, and how I became a contributor by sending my first pull request to YOLOv5 based on this bug.

This is a personal story, but since this is my first time contributing to major open-source software, I decided to write it down to record the process and hopefully convey the flow of contributing to OSS.

## How It All Started

I usually use PyTorch for implementing deep learning methods, and I was switching GPUs with code like this:

```python
import os
import torch

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

# print using GPU Info
print(f"Using GPU is CUDA:{os.environ['CUDA_VISIBLE_DEVICES']}")

for i in range(torch.cuda.device_count()):
    info = torch.cuda.get_device_properties(i)
    print(f"CUDA:{i} {info.name}, {info.total_memory / 1024 ** 2}MB")

device = torch.device("cuda:0")
```

The above code uses the environment variable `CUDA_VISIBLE_DEVICES` for GPU allocation in PyTorch.
This way, you can mask GPUs other than the specified one within the execution process, allowing safe resource handling (for example, it's safe to write `cuda:0` anywhere in the code).

In PyTorch, CUDA Device initialization doesn't occur until the `torch.cuda` module is called, so if you call `torch.cuda` after changing environment variables in code, the environment variables are applied (so-called lazy load).

Since it's an environment variable, you can also specify it at execution time like `CUDA_VISIBLE_DEVICES=0 python train.py`.

This code worked until PyTorch Version 1.11.0, but stopped working from 1.12.0.

Here's a specific example.
Suppose you have a machine like this:

```bash
CUDA:0 NVIDIA RTX A6000, 48685.3125MB
CUDA:1 NVIDIA GeForce RTX 3090, 24268.3125MB
```

On this machine, wanting to use CUDA:1 RTX 3090, I ran the above code with Ver 1.12.0 and 1.11.0.
The output was as follows:

- Ver 1.11

```bash
Using GPU is CUDA:1
CUDA:0 NVIDIA GeForce RTX 3090, 24268.3125MB
```

- Ver 1.12

```bash
Using GPU is CUDA:1
CUDA:0 NVIDIA RTX A6000, 48685.3125MB
CUDA:1 NVIDIA GeForce RTX 3090, 24268.3125MB
```

As shown above, in Ver 1.12, the `CUDA_VISIBLE_DEVICES` environment variable rewritten in code wasn't being applied.

I was very troubled since I used this method for GPU allocation.

## YOLOv5 Issue

[YOLOv5](https://github.com/ultralytics/yolov5), an object detection method, is implemented in PyTorch. I remembered that YOLOv5 also used a similar method for GPU allocation, so I decided to search for issues to see if the same problem was occurring in YOLOv5.

Sure enough, repository author Glenn Jocher had raised the following issue:

[YOLOv5 issues with torch==1.12 on Multi-GPU systems](https://github.com/ultralytics/yolov5/issues/8395)

It was exactly the same problem I was facing.
So I provided a small reproducible code snippet:

```python
import os
import torch

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

# print using GPU Info
print(f"Using GPU is CUDA:{os.environ['CUDA_VISIBLE_DEVICES']}")

for i in range(torch.cuda.device_count()):
    info = torch.cuda.get_device_properties(i)
    print(f"CUDA:{i} {info.name}, {info.total_memory / 1024 ** 2}MB")
```

I also found that it would work properly if you specify environment variables before `import torch`:

```python
import os

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

import torch
```

After trying module reload using `importlib` and other approaches without success, I concluded this was a PyTorch issue itself and decided to post my first issue ever to PyTorch.

## PyTorch Issue

The issue I posted to the PyTorch repository was:

[[1.12] os.environ["CUDA_VISIBLE_DEVICES"] has no effect](https://github.com/pytorch/pytorch/issues/80876)

When I posted it, this problem was marked as `high priority`, which made me very nervous.

While communicating with PyTorch's main contributors, since some people could reproduce this problem and others couldn't, I investigated what conditions caused the problem while providing Dockerfile examples to make reproduction easier.

Eventually, the minimal code that triggered this problem became:

```python
import os
import torch

os.environ["CUDA_VISIBLE_DEVICES"] = "32"
print(torch.__version__, torch.cuda.device_count())
```

```bash
# ver 1.11
$ python cudev.py 
1.11.0+cu113 0

# ver 1.12
$ python3 cudev.py
1.12.0+cu113 7
```

This attempts to set GPU allocation to 0 by setting `CUDA_VISIBLE_DEVICES` to an impossible number like 32. This code also didn't work as expected in 1.12.

Then contributor malfet [discovered the cause of the problem](https://github.com/pytorch/pytorch/issues/80876#issuecomment-1175359856).

In commits between ver 1.11 and 1.12, there was a place calling `torch.cuda` during module loading with `import torch`, which was causing unintended CUDA Device initialization. Since CUDA Device can't be reinitialized once initialized, it was fixed to not call `torch.cuda`.

To prevent this problem from recurring, the following code was added as a PyTorch test item:

```python
@unittest.skipIf(TEST_WITH_ROCM, "ROCm doesn't support CUDA_VISIBLE_DEVICES")
@unittest.skipIf(TEST_MULTIGPU, "Testing on one GPU is sufficient")
def test_lazy_init(self):
    """ Validate that no CUDA calls are made during `import torch` call"""
    from subprocess import check_output
    test_script = "import os; import torch;os.environ['CUDA_VISIBLE_DEVICES']='32';print(torch.cuda.device_count())"
    rc = check_output([sys.executable, '-c', test_script]).decode("ascii").strip()
    self.assertEqual(rc, "0")
```

This fix is scheduled to be applied in PyTorch Version 1.12.1.

## Pull Request to YOLOv5

Based on the issue I posted to PyTorch, while solving this problem within YOLOv5's code seemed difficult, I learned it would be fixed in the next PyTorch version.

Therefore, I sent a Pull Request to fix this by making the following changes to `requirements.txt` in the YOLOv5 repository:

```diff
- torch>=1.7.0
- torchvision>=0.8.1

+ torch>=1.7.0,!=1.12.0  # https://github.com/ultralytics/yolov5/issues/8395
+ torchvision>=0.8.1,!=0.13.0 # https://github.com/ultralytics/yolov5/issues/8395
```

Since this problem occurs with specific PyTorch versions and will be fixed in future 1.12.1, I decided to solve the problem by excluding Ver 1.12 and the corresponding torchvision version.

This Pull Request was successfully merged, and I had my first Pull Request sent to OSS merged.

## Summary

Since this was my first Issue and Pull Request, I carefully proceeded with interactions while reading veteran sites.

As PyTorch contributors emphasized when they said "repro," I deeply felt that providing minimal code to reproduce problems is crucial when reporting issues. This is also important in everyday development.

On a more mundane note, I thought that if I had discovered the problem location in PyTorch first, I could have become a PyTorch contributor...

That's the story of how I contributed to PyTorch and YOLOv5.