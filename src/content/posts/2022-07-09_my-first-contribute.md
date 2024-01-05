---
title: 初めてのissueとPull ReqでPyTorchとYOLOv5に貢献した話
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

こんにちは．今回は私が初めて立てたissueがPyTorchのバグを修正に繋がり，
新しいCI/CDテスト項目を増やすに至った話と，
このバグをもとに初めてのPull RequestをYOLOv5に送ってcontributerになった話を
書きたいと思います．

個人的な話になりますが，大きなOSSに貢献するのは初めてなので，
記録に残して，OSSに貢献する流れが伝わればと思い書くことにします．

## 事の経緯

普段，深層学習手法の実装にPyTorchを利用しているのですが，
使用するGPUの切り替えを以下のようなコードで行っていました．

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

上記のコードではPyTorchでGPU割り当てに，
環境変数`CUDA_VISIBLE_DEVICES`を使用しています．
こうすることで，実行プロセス内で指定したGPU以外をマスクすることができるので，
安全にリソースを扱えます．(例えばコード上でどこでも`cuda:0`を書いても安全)

PyTorchでは`torch.cuda`モジュールが呼び出されるまではCUDA Deviceの初期化は
行われないので，環境変数をコード上で変更したあとに`touch.cuda`を呼び出せば，
環境変数が適用されます．(いわゆるlazy load)

環境変数なので，実行時にも`CUDA_VISIBLE_DEVICES=0 python train.py`というように指定できます．

このコードがPyTorch Version 1.11.0までは動いていたのですが，
1.12.0から動かなくなってしまいました．

具体的な例をあげます．
以下のような計算機があったとします．

```bash
CUDA:0 NVIDIA RTX A6000, 48685.3125MB
CUDA:1 NVIDIA GeForce RTX 3090, 24268.3125MB
```

この計算機でCUDA:1のRTX 3090を使いたいと考え，
上記のコードをVer 1.12.0と1.11.0で動かします．
すると出力は以下のようになります．

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

上記の通り，Ver 1.12ではコード上で書き換えた`CUDA_VISIBLE_DEVICES`の環境変数が
適用されていないことがわかります．

私はこの方法でGPUの割当を行っていたのでとても困りました．

## YOLOv5のIssue

物体検出手法である[YOLOv5](https://github.com/ultralytics/yolov5)は
PyTorchで実装されています．YOLOv５も同じような方法でGPUの割当を行っていたのを
思い出したので，YOLOv5で同じような問題が起きていないかIssueを探すことにしました．

すると，リポジトリのAuthorであるGlenn Jocher氏が以下のようなIssueを
上げていました．

[YOLOv5 issues with torch==1.12 on Multi-GPU systems](https://github.com/ultralytics/yolov5/issues/8395)

まさしく，私と同じ問題を抱えていました．
そこで，問題を再現可能な小さいコードを示しました．

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

そして，以下のように`import torch`の前に環境変数を指定すれば
上手く動作することもわかりました．

```python
import os

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

import torch
```

その後も`importlib`を使ったモジュールのreload等を試しましたが問題は解決せず，
これはPyTorch自体の問題であると考え，PyTorchに人生初のIssueを投稿することにしました．

## PyTorchのIssue

私がPyTorchのリポジトリに投稿したIssueは以下です．

[[1.12] os.environ["CUDA_VISIBLE_DEVICES"] has no effect](https://github.com/pytorch/pytorch/issues/80876)

投稿したところ，この問題が`high priority`に指定されたため，とても緊張した覚えがあります．

PyTorchのMain Contributerとやり取りする中で，この問題を再現できる人とできない人がいたため，
再現しやすいようにDockerfileの例を出しながら，どのような場合に問題が起きるかを調査しました．

最終的に，この問題を発生させる最小コードは以下のようになりました．

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

`CUDA_VISIBLE_DEVICES`を32というありえない数字にすることで，
GPUの割当を0にする試みです．このコードも1.12では期待した動作をしませんでした．

すると，Contributorであるmalfet氏が
[問題の原因を発見](https://github.com/pytorch/pytorch/issues/80876#issuecomment-1175359856)しました．

ver 1.11から1.12までのcommitで，`import torch`でモジュールを読み込むまでの間に
`torch.cuda`を呼び出している箇所があり，これが原因でCUDA Deviceの初期化が意図せず
行われていることがわかりました．一度CUDA Deviceの初期化が行われると
再度初期化を行うことはできないので，`torch.cuda`を呼び出さないように修正されました．

そして，この問題が再発しないように，
PyTorchのテスト項目として，以下のコードが追記されました．

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

この修正はPyTorch Version 1.12.1で適用される予定です．

## YOLOv5にPull Request

PyTorchに投稿したIssueを踏まえて，
この問題をYOLOv5のコード内で解決することは難しそうでしたが，
PyTorchの次期バージョンで修正されることがわかりました．

そのため，YOLOv5のリポジトリにある`requirements.txt`に以下の変更を加えて
修正するPull Requestを贈りました．

```diff
- torch>=1.7.0
- torchvision>=0.8.1

+ torch>=1.7.0,!=1.12.0  # https://github.com/ultralytics/yolov5/issues/8395
+ torchvision>=0.8.1,!=0.13.0 # https://github.com/ultralytics/yolov5/issues/8395
```

この問題は特定のバージョンのPyTorchで起こり，将来の1.12.1で修正されるので，
Ver 1.12と対応するtorchvisionのバージョンを除外することで問題を解決することにしました．

このPull Requestは無事mergeされ，私は初めてOSSにPull Requestを送ってmergeされました．

## まとめ

初めてのIssue, Pull Requestだったため，先人のサイトを読みながら慎重に
やり取りを進めました．

PyTorchのContributorがreproと言って気にしていたように，
Issue報告をする際は問題を再現する最小のコードを提供することが大切であると
痛感しました．これは普段の開発でも大切なことです．

下世話な話ですが，先にPyTorchの問題箇所を発見できていれば
PyTorchのContributorになれたのに...なんて思ったりしました．

以上，PyTorchとYOLOv5に貢献した話でした．
