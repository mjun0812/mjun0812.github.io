---
title: "Comparing Image Loading Speed in PyTorch"
tags: [PyTorch, OpenCV, Pillow, Torchvision]
category: PyTorch
date: 2021-10-10
update: 2021-10-10
---

Hello. This time I compared the speed of loading images and converting them to tensors in PyTorch using various libraries.

## Libraries Used

- opencv-python: 4.5.3.56
- Pillow(PIL): 8.3.2
- Pillow-SIMD: 7.0.0.post3
- torchvision.io(PIL): 0.10.1
- torchvision.io(accimage): 0.10.1
- scikit-image: 0.18.3

I'll omit the installation methods for each.

Pillow-SIMD is a high-speed version of Pillow, but it hasn't been updated recently and stopped at version 7.0.0.
[accimage](https://github.com/pytorch/accimage) is a library that can be specified as a backend for torchvision and can be installed with conda.

## Experiment

The source code is as follows:
Referenced from [here](https://buildersbox.corp-sansan.com/entry/2020/11/05/110000).

```python
import time
from contextlib import contextmanager

import cv2
from PIL import Image
import skimage.io
import torchvision
import torchvision.transforms.functional as TF
from torchvision.io import read_image


@contextmanager
def timer(name):
    t0 = time.time()
    yield
    print(f"[{name}] done in {(time.time() - t0)*1000:.03f} ms")


N_ITERS = 100
for FILENAME in ["./image.jpg","./image.png"]:
    print(FILENAME)
    with timer("PIL"):
        for i in range(N_ITERS):
            img = Image.open(FILENAME).convert("RGB")
            img = TF.to_tensor(img)

    with timer("OpenCV"):
        for i in range(N_ITERS):
            img = cv2.imread(FILENAME)[:, :, ::-1].copy()
            img = TF.to_tensor(img)

    with timer("default_torchvision"):
        for i in range(N_ITERS):
            img = read_image(FILENAME)

    with timer("accimage_torchvision"):
        torchvision.set_image_backend("accimage")
        for i in range(N_ITERS):
            img = read_image(FILENAME)

    with timer("skimage"):
        for i in range(N_ITERS):
            img = skimage.io.imread(FILENAME)
            img = TF.to_tensor(img)
```

I've also published the source on GitHub:

<https://github.com/mjun0812/Pytorch-Image-Load-Speed>

The commonly used mandrill image was used for testing.

|Image Format|Library|Speed(ms)|
|:-:|-| -:|
|jpg|opencv-python|673.799|
||Pillow(PIL)|772.203|
||Pillow-SIMD|648.018|
||torchvision.io(PIL)|301.993|
||torchvision.io(PIL-SIMD)|278.904|
||torchvision.io(accimage)|274.502|
||scikit-image|794.349|
||scikit-image(PIL-SIMD)|545.362|
|png|opencv-python|1066.164|
||Pillow(PIL)|1752.472|
||Pillow-SIMD|1085.250|
||torchvision.io(PIL)|877.775|
||torchvision.io(PIL-SIMD)|867.422|
||torchvision.io(accimage)|847.297|
||scikit-image|1878.370|
||scikit-image(PIL-SIMD)|1108.291|

The fastest was `torchvision.io.read_image`.
The acceleration with Pillow-SIMD also affects scikit-image, presumably because it's used internally.
However, torchvision didn't show the effects of Pillow-SIMD.

While at it, I also compared image loading speed.
Sometimes you might not convert to tensors.
For `torchvision.io.read_image` which outputs tensors, I measured up to converting to ndarray with `numpy()`.

|Image Format|Library|Speed(ms)|
|:-:|-|-:|
|jpg|opencv-python|457.877|
||Pillow(PIL)|772.203|
||Pillow-SIMD|648.018|
||torchvision.io|273.161|
||scikit-image|794.349|
||scikit-image(PIL-SIMD)|545.362|
|png|opencv-python|962.926|
||Pillow(PIL)|1752.472|
||Pillow-SIMD|1085.250|
||torchvision.io|795.085|
||scikit-image|1878.370|
||scikit-image(PIL-SIMD)|1108.291|

Surprisingly, `torchvision.io` was also the fastest here.

## Caution

Since Pillow-SIMD is based on an older Pillow, the following warning appears:

```txt
UserWarning: Your installed pillow version is < 7.1.0. Several security issues (CVE-2020-11538, CVE-2020-10379, CVE-2020-10994, CVE-2020-10177) have been fixed in pillow 7.1.0 or higher. We recommend to upgrade this library.
```

Since there appear to be security risks, it's safer not to use it.