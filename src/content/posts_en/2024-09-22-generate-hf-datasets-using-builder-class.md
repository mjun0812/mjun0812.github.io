---
title: "Creating Custom Datasets Using HuggingFace datasets Builder Class"
tags: ["HuggingFace", "dataset"]
category: "HuggingFace"
date: 2024-09-22
update: 2024-09-22
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

Hello. This time I'll introduce how to create custom datasets that can be called from HuggingFace datasets. This article specifically focuses on methods using Builder classes.
This is essentially the same as what's covered here:

<https://huggingface.co/docs/datasets/dataset_script>

<https://github.com/huggingface/datasets/tree/main/templates>

## Premise: Methods for Creating Datasets in HuggingFace

There are broadly three methods for creating custom HuggingFace datasets:

1. Prepare files or directories with specific structures in advance and use `datasets.load_dataset`
2. Define dicts or generators and use `datasets.Dataset.from_*` functions
3. Use `datasets.DatasetBuilder` class to define dataset loading in code (the method introduced today)

### 1. Prepare files or directories with specific structures in advance and use datasets.load_dataset

First, the file reading method loads pre-prepared files in formats like `csv, json` directly with the load_dataset function as shown in the following link:

<https://huggingface.co/docs/datasets/loading#local-and-remote-files>

For example, for csv format files, load them as follows:

```python
import datasets as ds

dataset = ds.load_dataset(
    "csv",
    data_files={"train": ["my_train_file_1.csv", "my_train_file_2.csv"], "test": "my_test_file.csv"}
)
```

This is simple since you just need to prepare files in advance.

The directory reading method creates split directories like `train, validation` under specific directories as shown in the following link, then loads those directories with the `load_dataset` function:

<https://huggingface.co/docs/datasets/create_dataset#folder-based-builders>

<https://huggingface.co/docs/datasets/image_dataset#imagefolder>

<https://huggingface.co/docs/datasets/audio_dataset#audiofolder>

```bash
hoge/dataset_root/train/label/1.png
hoge/dataset_root/train/label/2.png
...
hoge/dataset_root/test/label/1.png
hoge/dataset_root/test/label/2.png
...
```

```python
import datasets as ds

dataset = ds.load_dataset("imagefolder", data_dir="hoge/dataset_root")
```

This method can also be used for audio files by using `audiofolder` instead of images.

### 2. Using datasets.Dataset.from_* functions

This method allows creating datasets by passing Python functions or dictionaries as shown in the following tutorial:

<https://huggingface.co/docs/datasets/create_dataset#from-python-dictionaries>

For example, when passing a dictionary, create it as follows:

```python
import datasets as ds

dataset_dict = {
    "text": ["hoge", "fuga"]
    "label": [1, 3]
}

dataset = ds.Dataset.from_dict(dataset_dict)
```

When passing a generator, create it as follows. You can pass arguments to the generator function in `gen_kwargs` and the number of parallel processes in `num_proc`:

```python
import os
import datasets as ds

dataset_data = [
    {"summary": "hoge", "class": 1},
    {"summary": "fuga", "class": 2},
]

def generator(data):
    for d in data:
        yield {
            "text": d["summary"],
            "label": d["class"]
        }

dataset = ds.Dataset.from_generator(generator,
                                    gen_kwargs={"data": dataset_data},
                                    num_proc=os.cpu_count() // 2)
```

Personally, I think the most convenient method is using generators with `datasets.Dataset.from_generator`. It's handy and recommended since you can create datasets in parallel while reshaping original data in the script.

### 3. Using datasets.DatasetBuilder class

This is the method I'll introduce today. I'll write about it in detail later.

## Main Topic: Overview of Dataset Creation Using datasets.DatasetBuilder Class

I'll introduce the main topic of this article: dataset creation methods using Builder classes like `datasets.DatasetBuilder`. This time I'll use `datasets.GeneratorBasedBuilder` among Builder classes. First, let me summarize the advantages of using Builder classes, then introduce the actual creation code.

### Benefits

Using Builder classes provides the following advantages:

- Can define methods to obtain dataset files and prepare them
- Can handle formats not supported by HuggingFace datasets or datasets requiring complex preparation
- Can bundle multiple datasets

While methods 1 and 2 using load_dataset or from_generator functions required advance downloading and directory preparation, using Builder classes allows defining preparation operations as code, making it possible to share HuggingFace datasets by sharing only Python scripts.

Evaluation metric repositories for models using multiple datasets like [JMTEB](https://huggingface.co/datasets/sbintuitions/JMTEB) and [JGLUE](https://huggingface.co/datasets/shunk031/JGLUE) already published on HuggingFace are defined with Builder classes. The multilingual dataset [wikimedia/wikipedia](https://huggingface.co/datasets/wikimedia/wikipedia) used for language model pre-training can switch languages by calling as follows, and Builder classes can handle such complex divisions:

```python
from datasets import load_dataset

ds = load_dataset("wikimedia/wikipedia", name="20231101.en")
```

### Related Classes and Objects

When defining datasets, we use several related classes and objects:

- `datasets.BuilderConfig`
  Defines dataset names, versions, data_dir, etc. needed to call datasets with Builder classes. When bundling multiple datasets, you'll define multiple of these.
- `datasets.DatasetInfo`
  Defines dataset information including citation, homepage, and element types in the dataset.
- `datasets.SplitGenerator`
  Defines dataset splits. For example, if a dataset contains splits like train, val, test, you'll define that many.
- `datasets.GeneratorBasedBuilder`
  Defines a class to create Datasets based on the above three classes.

## Implementation

Let's actually create a `JapaneseTextDataset` that bundles Japanese corpus [livedoor News Corpus](https://www.rondhuit.com/download.html) and [llm-book/japanese-wikipedia](https://huggingface.co/datasets/llm-book/japanese-wikipedia) using `datasets.GeneratorBasedBuilder`.
We'll obtain livedoor News Corpus from the web and use llm-book/japanese-wikipedia as uploaded to HuggingFace.

The directory structure is as follows:

```bash
JapaneseTextDataset/
└── JapaneseTextDataset.py
```

Here's the content of `JapaneseTextDataset.py`. I'll explain it step by step:

```python
from dataclasses import dataclass
from pathlib import Path
from typing import Literal, Optional

import datasets as ds


@dataclass
class LivedoorCorpusConfig(ds.BuilderConfig):
    """BuilderConfig for LivedoorCorpus"""

    def __init__(self, name: str = "livedoor", **kwargs):
        super().__init__(name, **kwargs)


@dataclass
class WikiJPConfig(ds.BuilderConfig):
    """BuilderConfig for WikiJP"""

    def __init__(self, name: str = "wiki", **kwargs):
        super().__init__(name, **kwargs)


class JapaneseTextDataset(ds.GeneratorBasedBuilder):
    """Japanese Text Dataset"""

    VERSION = "1.0.0"
    DEFAULT_CONFIG_NAME = "wiki"
    BUILDER_CONFIGS = [
        WikiJPConfig(
            version=ds.Version(version_str=VERSION), description="Japanese Wikipedia"
        ),
        LivedoorCorpusConfig(
            version=ds.Version(version_str=VERSION), description="Livedoor News Corpus"
        ),
    ]

    def _info(self) -> ds.DatasetInfo:
        if self.config.name == "wiki":
            return ds.DatasetInfo(
                homepage="https://huggingface.co/datasets/llm-book/japanese-wikipedia",
                features=ds.Features(
                    {
                        "text": ds.Value("string"),
                    }
                ),
            )
        elif self.config.name == "livedoor":
            return ds.DatasetInfo(
                homepage="http://www.rondhuit.com/download.html#ldcc",
                features=ds.Features(
                    {
                        "url": ds.Value("string"),
                        "title": ds.Value("string"),
                        "text": ds.Value("string"),
                    }
                ),
            )

    def _split_generators(self, dl_manager: ds.DownloadManager):
        if self.config.name == "wiki":
            dataset = ds.load_dataset(
                "llm-book/japanese-wikipedia",
                trust_remote_code=True,
            )
            return [
                ds.SplitGenerator(
                    name=ds.Split.TRAIN,
                    gen_kwargs={"data": dataset["train"]},
                )
            ]
        elif self.config.name == "livedoor":
            file_path = dl_manager.download_and_extract(
                "http://www.rondhuit.com/download/ldcc-20140209.tar.gz"
            )
            return [
                ds.SplitGenerator(
                    name=ds.Split.TRAIN,
                    gen_kwargs={"file_path": file_path, "split": "train"},
                ),
                ds.SplitGenerator(
                    name=ds.Split.TEST,
                    gen_kwargs={"file_path": file_path, "split": "test"},
                ),
            ]

    def _generate_examples(
        self,
        data: Optional[ds.Dataset] = None,
        file_path: Optional[str] = None,
        split: Literal["train", "test"] | None = None,
    ):
        if self.config.name == "wiki":
            if data is None:
                raise ValueError("data must be specified")
            for i, example in enumerate(data):
                yield i, {"text": example["text"]}
        elif self.config.name == "livedoor":
            if file_path is None:
                raise ValueError("file_path must be specified")
            if split is None:
                raise ValueError("split must be specified")

            paths = [
                p
                for p in (Path(file_path) / "text").glob("*/*.txt")
                if p.name != "LICENSE.txt"
            ]
            if split == "train":
                paths = paths[: int(len(paths) * 0.8)]
            else:
                paths = paths[int(len(paths) * 0.8) :]
            for i, path in enumerate(paths):
                with open(path, "r", encoding="utf-8") as f:
                    url = f.readline().strip()
                    title = f.readline().strip()
                    text = f.read()
                yield i, {"url": url, "title": title, "text": text}
```

### datasets.BuilderConfig

In the following part of the above code, we define BuilderConfigs for Livedoor and Wikipedia:

```python
@dataclass
class LivedoorCorpusConfig(ds.BuilderConfig):
    """BuilderConfig for LivedoorCorpus"""

    def __init__(self, name: str = "livedoor", **kwargs):
        super().__init__(name, **kwargs)


@dataclass
class WikiJPConfig(ds.BuilderConfig):
    """BuilderConfig for WikiJP"""

    def __init__(self, name: str = "wiki", **kwargs):
        super().__init__(name, **kwargs)
```

This time we're not doing anything special, but when adding arguments when calling `load_dataset`, do it as follows:

```python
@dataclass
class WikiJPConfig(ds.BuilderConfig):
    """BuilderConfig for WikiJP"""

    def __init__(self, name: str = "wiki", language: str = "ja", **kwargs):
        super().__init__(name, **kwargs)
        self.language = "ja"
```

In the above example, we added a `language` argument. This way, when loading the dataset, you can pass the `language` argument as follows:

```python
dataset = ds.load_dataset("JapaneseTextDataset", name="wiki", language="ja")
```

### datasets.GeneratorBasedBuilder

The `JapaneseTextDataset` class inheriting `datasets.GeneratorBasedBuilder` sets `VERSION`, `DEFAULT_CONFIG_NAME`, and `BUILDER_CONFIGS`.
When enabling multiple dataset calls, list multiple `datasets.BuilderConfig` in `BUILDER_CONFIGS`.
`DEFAULT_CONFIG_NAME` sets which config_name is called when nothing is specified in load_dataset. The default value is `"default"`.

```python
class JapaneseTextDataset(ds.GeneratorBasedBuilder):
    """Japanese Text Dataset"""

    VERSION = "1.0.0"
    DEFAULT_CONFIG_NAME = "wiki"
    BUILDER_CONFIGS = [
        WikiJPConfig(
            version=ds.Version(version_str=VERSION), description="Japanese Wikipedia"
        ),
        LivedoorCorpusConfig(
            version=ds.Version(version_str=VERSION), description="Livedoor News Corpus"
        ),
    ]
```

### datasets.GeneratorBasedBuilder::_info

The `_info` function of `datasets.GeneratorBasedBuilder` returns dataset information in `datasets.DatasetInfo` format. At this time, you can reference the contents of `BUILDER_CONFIGS` with `self.config`, allowing dynamic changes to dataset information being called.

```python
def _info(self) -> ds.DatasetInfo:
    if self.config.name == "wiki":
        return ds.DatasetInfo(
            homepage="https://huggingface.co/datasets/llm-book/japanese-wikipedia",
            features=ds.Features(
                {
                    "text": ds.Value("string"),
                }
            ),
        )
    elif self.config.name == "livedoor":
        return ds.DatasetInfo(
            homepage="http://www.rondhuit.com/download.html#ldcc",
            features=ds.Features(
                {
                    "url": ds.Value("string"),
                    "title": ds.Value("string"),
                    "text": ds.Value("string"),
                }
            ),
        )
```

### datasets.GeneratorBasedBuilder::_split_generators

The `_split_generators(self, dl_manager: ds.DownloadManager)` function of `datasets.GeneratorBasedBuilder` defines what splits the dataset has with `ds.SplitGenerator` and returns them as a list. The `gen_kwargs` of `SplitGenerator` defines arguments to pass to `_generate_examples` which returns one data row later.

This time, since `"llm-book/japanese-wikipedia"` is obtained from HuggingFace, we call load_dataset internally.
Since Livedoor News Corpus is downloaded from the web, we write the download in the script and pass the storage destination to `gen_kwargs`.
Using `dl_manager.download_and_extract` performs download and extraction from URL at once, so we use this.

```python
def _split_generators(self, dl_manager: ds.DownloadManager):
    if self.config.name == "wiki":
        dataset = ds.load_dataset(
            "llm-book/japanese-wikipedia",
            trust_remote_code=True,
        )
        return [
            ds.SplitGenerator(
                name=ds.Split.TRAIN,
                gen_kwargs={"data": dataset["train"]},
            )
        ]
    elif self.config.name == "livedoor":
        file_path = dl_manager.download_and_extract(
            "http://www.rondhuit.com/download/ldcc-20140209.tar.gz"
        )
        return [
            ds.SplitGenerator(
                name=ds.Split.TRAIN,
                gen_kwargs={"file_path": file_path, "split": "train"},
            ),
            ds.SplitGenerator(
                name=ds.Split.TEST,
                gen_kwargs={"file_path": file_path, "split": "test"},
            ),
        ]
```

### datasets.GeneratorBasedBuilder::_generate_examples

The `_generate_examples` function of `datasets.GeneratorBasedBuilder` defines how to return one dataset entry. Arguments receive the `gen_kwargs` defined in the earlier `_split_generators`. Since it's defined as a generator, we use `yield` syntax.

```python
def _generate_examples(
        self,
        data: Optional[ds.Dataset] = None,
        file_path: Optional[str] = None,
        split: Literal["train", "test"] | None = None,
    ):
        if self.config.name == "wiki":
            if data is None:
                raise ValueError("data must be specified")
            for i, example in enumerate(data):
                yield i, {"text": example["text"]}
        elif self.config.name == "livedoor":
            if file_path is None:
                raise ValueError("file_path must be specified")
            if split is None:
                raise ValueError("split must be specified")

            paths = [
                p
                for p in (Path(file_path) / "text").glob("*/*.txt")
                if p.name != "LICENSE.txt"
            ]
            if split == "train":
                paths = paths[: int(len(paths) * 0.8)]
            else:
                paths = paths[int(len(paths) * 0.8) :]
            for i, path in enumerate(paths):
                with open(path, "r", encoding="utf-8") as f:
                    url = f.readline().strip()
                    title = f.readline().strip()
                    text = f.read()
                yield i, {"url": url, "title": title, "text": text}
```

## Calling the Dataset

This completes dataset construction. Let's actually call the dataset.
You can call it with a script like this:

```python
import datasets as ds

# Load the dataset
dataset = ds.load_dataset("./JapaneseTextDataset", "wiki", trust_remote_code=True)
print(dataset)

# Load the dataset
dataset = ds.load_dataset(
    "./JapaneseTextDataset", "livedoor", trust_remote_code=True
)
print(dataset)
```

The execution results are as follows:

```bash
ja_wiki.jsonl: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 6.37G/6.37G [00:53<00:00, 38.7MB/s]
Generating train split: 1363395 examples [00:38, 35532.80 examples/s]
Generating train split: 1363395 examples [03:22, 6731.14 examples/s]
DatasetDict({
    train: Dataset({
        features: ['text'],
        num_rows: 1363395
    })
})
Downloading data: 31.6MB [00:00, 50.9MB/s]
Generating train split: 5893 examples [00:01, 3227.36 examples/s]
Generating test split: 1474 examples [00:00, 2580.49 examples/s]
DatasetDict({
    train: Dataset({
        features: ['url', 'title', 'text'],
        num_rows: 5893
    })
    test: Dataset({
        features: ['url', 'title', 'text'],
        num_rows: 1474
    })
})
```

The dataset was successfully called.

## Uploading to HuggingFace Hub

To upload the created dataset to HuggingFace, just push the `JapaneseTextDataset` directory created earlier as-is.

As shown in the following template, if you write dataset information in `README.md`, it will be used directly:

<https://github.com/huggingface/datasets/tree/main/templates>

Also, the following repository uploads JGLUE to HuggingFace and even includes CI/CD, making it very helpful for reference:

<https://github.com/shunk031/huggingface-datasets_JGLUE/tree/main>

That concludes this brief introduction to creating HuggingFace datasets using Builder classes.

## References

[https://github.com/shunk031/huggingface-datasets_JGLUE/tree/main](https://github.com/shunk031/huggingface-datasets_JGLUE/tree/main)

[https://qiita.com/oyahiroki/items/662ed10ab3f8d4bf8f61](https://qiita.com/oyahiroki/items/662ed10ab3f8d4bf8f61)

[https://github.com/huggingface/datasets/tree/main/templates](https://github.com/huggingface/datasets/tree/main/templates)

[https://huggingface.co/docs/datasets/package_reference/builder_classes](https://huggingface.co/docs/datasets/package_reference/builder_classes)

[https://huggingface.co/datasets/sbintuitions/JMTEB/blob/main/JMTEB.py](https://huggingface.co/datasets/sbintuitions/JMTEB/blob/main/JMTEB.py)