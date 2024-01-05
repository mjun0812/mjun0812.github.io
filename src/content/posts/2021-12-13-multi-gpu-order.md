---
title: GPUを複数搭載した計算機でGPUの順番を設定する
tags: [PyTorch, Tensorflow, Server]
category: PyTorch
date: 2021-12-13
update: 2022-04-24
---

マルチ GPU を搭載したマシンで，`nvidia-smi`で見える GPU ID と，
PyTorch や Tensorflow，`CUDA_VISIBLE_DEVICES`で指定する GPU ID が異なる現象についてのメモ．

結論から言うと，`nvidia-smi`では PCI BUS 順に並ぶが，
CUDA ではデフォルトでは早い順(`FASTEST_FIRST`)に GPU の ID が振られることが原因だった．

A6000 x 2，RTX 3090 x 2 が刺さっているマシンを想定し，
`nvidia-smi`で並ぶ GPU の順番が以下のようだったとする．

```bash
0: RTX 3090
1: A6000
2: A6000
3: RTX 3090
```

すると，PyTorch 側では以下のように並ぶ．

```bash
0: A6000  # (nvidia-smiでは1)
1: A6000  # (nvidia-smiでは2)
2: RTX 3090  # (nvidia-smiでは0)
3: RTX 3090  # (nvidia-smiでは3)
```

PyTorch 側でも`nvidia-smi`(PCI バス順)の順番で
GPU の ID を振りたい時は以下のように環境変数を設定する．

```bash
export CUDA_DEVICE_ORDER="PCI_BUS_ID"
# または，
CUDA_DEVICE_ORDER="PCI_BUS_ID" CUDA_VISIBLE_DEVICES="0" python train.py
```

これで，上記のマシンでは，`nvidia-smi`の順番となり，RTX 3090 が ID=0 となる．

コード上で変更するには，以下のようにする(Python)

```python
import os

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "0, 3"
```

ちなみに，PyTorch では，以下のコードで GPU の情報を表示できる

```python
import torch

# os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
# os.environ["CUDA_VISIBLE_DEVICES"] = "0,1,2,3"

for i in range(torch.cuda.device_count()):
    info = torch.cuda.get_device_properties(i)
    print(f"CUDA:{i} {info.name}, {info.total_memory / 1024 ** 2}MB")
```

環境変数の設定は，torch.cuda 周りを呼び出す前に行わければならないのに注意．

ここまで書いてきて，常に`PCI_BUS_ID`順にすればいいじゃんと思うかもしれないが，
Multi-GPU で異なる GPU を混ぜて推論するときには，
GPU ID=0 で損失計算などを行うので，GPU ID=0 の GPU の計算が早いほうが嬉しい．
そのため，早い順に GPU が並ぶのも利点が一応ある．

### 参考

<https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#env-vars>
