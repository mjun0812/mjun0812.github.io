---
title: "Setting GPU Order on Multi-GPU Systems"
tags: [PyTorch, Tensorflow, Server]
category: PyTorch
date: 2021-12-13
update: 2022-04-24
---

This is a memo about the phenomenon where GPU IDs visible in `nvidia-smi` differ from GPU IDs specified in PyTorch, TensorFlow, and `CUDA_VISIBLE_DEVICES` on multi-GPU machines.

In conclusion, while `nvidia-smi` displays GPUs in PCI BUS order, CUDA assigns GPU IDs in fastest-first order (`FASTEST_FIRST`) by default.

Assuming a machine with A6000 x 2 and RTX 3090 x 2, where `nvidia-smi` shows GPUs in the following order:

```bash
0: RTX 3090
1: A6000
2: A6000
3: RTX 3090
```

Then on the PyTorch side, they would be ordered as follows:

```bash
0: A6000  # (1 in nvidia-smi)
1: A6000  # (2 in nvidia-smi)
2: RTX 3090  # (0 in nvidia-smi)
3: RTX 3090  # (3 in nvidia-smi)
```

When you want to assign GPU IDs in the same order as `nvidia-smi` (PCI bus order) on the PyTorch side, set the environment variable as follows:

```bash
export CUDA_DEVICE_ORDER="PCI_BUS_ID"
# or,
CUDA_DEVICE_ORDER="PCI_BUS_ID" CUDA_VISIBLE_DEVICES="0" python train.py
```

With this setting, on the above machine, the order will match `nvidia-smi`, and RTX 3090 will have ID=0.

To change this in code, do the following (Python):

```python
import os

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "0, 3"
```

By the way, in PyTorch, you can display GPU information with the following code:

```python
import torch

# os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
# os.environ["CUDA_VISIBLE_DEVICES"] = "0,1,2,3"

for i in range(torch.cuda.device_count()):
    info = torch.cuda.get_device_properties(i)
    print(f"CUDA:{i} {info.name}, {info.total_memory / 1024 ** 2}MB")
```

Note that environment variable settings must be done before calling torch.cuda functions.

After writing all this, you might think it's better to always use `PCI_BUS_ID` order, but when doing inference with different GPUs in Multi-GPU setups, loss calculations are performed on GPU ID=0, so it's beneficial to have the faster GPU as GPU ID=0. Therefore, having GPUs ordered by speed does have its advantages.

### References

<https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#env-vars>