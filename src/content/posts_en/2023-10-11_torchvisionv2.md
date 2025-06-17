---
title: "Exploring TorchVision's transforms.v2"
tags: [PyTorch]
category: PyTorch
date: 2023-10-11
update: 2023-10-11
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

Recently, TorchVision version 0.16.0, a library that consolidates PyTorch's image processing functionality, was released.
With this update, documentation for version v2 of `torchvision.transforms`, commonly used for data augmentation, was enhanced.
While `torchvision.transforms.v2` existed as a beta version since 0.15.0, this update enriched the documentation and made it the recommended version, so I'd like to see how it differs from previous methods.
Note that v2 is still in beta. It will become stable in 0.17.0.

- Release Notes

<https://github.com/pytorch/vision/releases/tag/v0.16.0>

- Documentation

<https://pytorch.org/vision/stable/transforms.html#v2-api-reference-recommended>

Since future updates will only be made to v2, this is a good opportunity to migrate.

## Main Changes

- transforms can now handle object detection bounding boxes, segmentation masks, and videos as input
- Support for data augmentation methods like CutMix and MixUp
- Speed improvements
- Accepts arbitrary inputs (dictionaries, lists, tuples, etc.)
- Resize etc. can accept torch.uint8 type as input

Based on the above changes, v2 recommends the following approaches:

- Use Tensor type as input instead of PIL.Image type
- When performing Resize etc., make input torch.uint8 ([0~255])
- Perform Resize with bilinear or bicubic

## Migration Method

Migration is simple. Just change `import torchvision.transforms` to `import torchvision.transforms.v2`.

```python
# V1
from torchvision import transforms

# V2 (when calling v2 while keeping transforms)
from torchvision.transforms import v2 as transforms
```

## Experiment 1: Measuring Conversion Speed

As mentioned earlier, v2 lists speed improvements in transforms and uint8 type support as changes.
So I'd like to measure speed between v1 and v2.

I'll compare v1 and v2 for both PIL.Image and Tensor type inputs.

I prepared the following input image.
Since I want to see the effect of Resize, I prepared a large-sized image.

![otter](./images/torchvisionv2_2.png)

> Quote: <https://publicdomainq.net/otter-animal-0014492/>

```bash
identify image.jpg
image.jpg JPEG 3872x2592 3872x2592+0+0 8-bit sRGB 1.93051MiB 0.000u 0:00.001
```

The code I measured is as follows:

```python
import time

import torch
import torchvision
import torchvision.transforms as v1
import torchvision.transforms.v2 as v2
from PIL import Image


def get_v1_transforms_tensor():
    return v1.Compose(
        [
            v1.RandomHorizontalFlip(p=0.5),
            v1.RandomVerticalFlip(p=0.5),
            v1.RandomResizedCrop((224, 224), (0.01, 2.0), antialias=False),
            v1.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
        ]
    )


def get_v2_transforms_tensor():
    return v2.Compose(
        [
            v2.RandomHorizontalFlip(p=0.5),
            v2.RandomVerticalFlip(p=0.5),
            v2.RandomResizedCrop((224, 224), (0.01, 2.0), antialias=False),
            v2.ToDtype(torch.float32, scale=True),
            v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
        ]
    )


def get_v1_transforms_pil():
    return v1.Compose(
        [
            v1.ToTensor(),
            v1.RandomHorizontalFlip(p=0.5),
            v1.RandomVerticalFlip(p=0.5),
            v1.RandomResizedCrop((224, 224), (0.01, 2.0), antialias=False),
            v1.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
        ]
    )


def get_v2_transforms_pil():
    return v2.Compose(
        [
            v2.ToImage(),
            v2.RandomHorizontalFlip(p=0.5),
            v2.RandomVerticalFlip(p=0.5),
            v2.RandomResizedCrop((224, 224), (0.01, 2.0), antialias=False),
            v2.ToDtype(torch.float32, scale=True),
            v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
        ]
    )


def main():
    num_iter = 200

    transforms = get_v1_transforms_tensor()
    elapsed_times = []
    for _ in range(num_iter):
        img = torchvision.io.read_image("./image.jpg")

        t = time.time()
        img = img / 255
        transforms(img)
        elapsed_times.append(time.time() - t)
    elapsed_times = elapsed_times[len(elapsed_times) // 2 :]
    print("V1 Elapsed Time(Input Tensor): ", sum(elapsed_times) / len(elapsed_times) * 1000, "ms")

    transforms = get_v2_transforms_tensor()
    elapsed_times = []
    for _ in range(num_iter):
        img = torchvision.io.read_image("./image.jpg")

        t = time.time()
        transforms(img)
        elapsed_times.append(time.time() - t)
    elapsed_times = elapsed_times[len(elapsed_times) // 2 :]
    print("V2 Elapsed Time(Input Tensor): ", sum(elapsed_times) / len(elapsed_times) * 1000, "ms")

    transforms = get_v1_transforms_pil()
    elapsed_times = []
    for _ in range(num_iter):
        img = Image.open("./image.jpg").convert("RGB")
        t = time.time()
        transforms(img)
        elapsed_times.append(time.time() - t)
    elapsed_times = elapsed_times[len(elapsed_times) // 2 :]
    print("V1 Elapsed Time(Input PIL): ", sum(elapsed_times) / len(elapsed_times) * 1000, "ms")

    transforms = get_v2_transforms_pil()
    elapsed_times = []
    for _ in range(num_iter):
        img = Image.open("./image.jpg").convert("RGB")
        t = time.time()
        transforms(img)
        elapsed_times.append(time.time() - t)
    elapsed_times = elapsed_times[len(elapsed_times) // 2 :]
    print("V2 Elapsed Time(Input PIL): ", sum(elapsed_times) / len(elapsed_times) * 1000, "ms")


if __name__ == "__main__":
    main()
```

The execution results were as follows:

```bash
python exp.py
V1 Elapsed Time(Input Tensor):  42.47044086456299 ms
V2 Elapsed Time(Input Tensor):  4.662487506866455 ms
V1 Elapsed Time(Input PIL):  63.41712474822998 ms
V2 Elapsed Time(Input PIL):  13.053297996520996 ms
```

Summarized as follows:

| version | Input  | elapsed time |
|---------|--------|-------------:|
| v1      | Tensor |      42.4704 |
| v2      | Tensor |       4.6625 |
| v1      | PIL    |      63.4171 |
| v2      | PIL    |      13.0533 |

In this case, it was 9.1x faster with Tensor input and 4.9x faster with PIL input.
Quite fast!

## Experiment 2: Inputting Boxes

Previous transforms could only input images, but now it seems you can input BBoxes and masks.
So I'll experiment with BBoxes, which are easy to prepare.

The following code is borrowed from the official tutorial:

https://pytorch.org/vision/stable/auto_examples/transforms/plot_transforms_getting_started.html

```python
import matplotlib.pyplot as plt
import torch
from torchvision import tv_tensors
from torchvision.io import read_image
from torchvision.transforms import v2
from torchvision.transforms.v2 import functional as F
from torchvision.utils import draw_bounding_boxes, draw_segmentation_masks


def plot(imgs, row_title=None, **imshow_kwargs):
    if not isinstance(imgs[0], list):
        # Make a 2d grid even if there's just 1 row
        imgs = [imgs]

    num_rows = len(imgs)
    num_cols = len(imgs[0])
    _, axs = plt.subplots(nrows=num_rows, ncols=num_cols, squeeze=False)
    for row_idx, row in enumerate(imgs):
        for col_idx, img in enumerate(row):
            boxes = None
            masks = None
            if isinstance(img, tuple):
                img, target = img
                if isinstance(target, dict):
                    boxes = target.get("boxes")
                    masks = target.get("masks")
                elif isinstance(target, tv_tensors.BoundingBoxes):
                    boxes = target
                else:
                    raise ValueError(f"Unexpected target type: {type(target)}")
            img = F.to_image(img)
            if img.dtype.is_floating_point and img.min() < 0:
                # Poor man's re-normalization for the colors to be OK-ish. This
                # is useful for images coming out of Normalize()
                img -= img.min()
                img /= img.max()

            img = F.to_dtype(img, torch.uint8, scale=True)
            if boxes is not None:
                img = draw_bounding_boxes(img, boxes, colors="yellow", width=3)
            if masks is not None:
                img = draw_segmentation_masks(
                    img, masks.to(torch.bool), colors=["green"] * masks.shape[0], alpha=0.65
                )

            ax = axs[row_idx, col_idx]
            ax.imshow(img.permute(1, 2, 0).numpy(), **imshow_kwargs)
            ax.set(xticklabels=[], yticklabels=[], xticks=[], yticks=[])

    if row_title is not None:
        for row_idx in range(num_rows):
            axs[row_idx, 0].set(ylabel=row_title[row_idx])

    plt.tight_layout()


def main():
    img = read_image("./image.jpg")

    boxes = tv_tensors.BoundingBoxes(
        [[500, 500, 2540, 2540]],
        format="XYXY",
        canvas_size=img.shape[-2:],
    )

    transforms = v2.Compose(
        [
            v2.RandomResizedCrop(size=(1024, 1024), antialias=True),
            v2.RandomPhotometricDistort(p=1),
            v2.RandomHorizontalFlip(p=1),
        ]
    )
    out_img, out_boxes = transforms(img, boxes)
    print(type(boxes), type(out_boxes))

    plot([(img, boxes), (out_img, out_boxes)])
    plt.show()


if __name__ == "__main__":
    main()
```

The result looks like this:

![box](./images/torchvisionv2_2.png)

The important part in the above code example is here:

```python
boxes = tv_tensors.BoundingBoxes(
            [[500, 500, 2540, 2540]],
            format="XYXY",
            canvas_size=img.shape[-2:],
        )
```

In v2, BBoxes go into `tv_tensors.BoundingBoxes` and Masks go into `tv_tensors.Mask` to enable data augmentation for Boxes and Masks.

## Summary

That was a brief introduction to torchvision.transforms v2.
As shown in Experiment 1, perhaps due to the ability to process Resize with uint8, significant speed improvements have been made to transforms.
Since implementation is easy, people using torchvision.transforms might want to consider migrating to v2.