---
title: "HuggingFace datasetsのBuilder classを使ってデータセットを自作する"
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

こんにちは。今回はHuggingFace datasetsから
呼び出せる形式でデータセットを自作する方法を紹介します。この記事では特にBuilder classを用いた方法について書いていきます。
やっていることは以下と同様です。

<https://huggingface.co/docs/datasets/dataset_script>

<https://github.com/huggingface/datasets/tree/main/templates>

## 前提: HuggingFaceでデータセットを作成する方法

HuggingFaceのデータセットを自作する方法は、大きく分けて以下の3つあります。

1. あらかじめ特定の構造のファイル or ディレクトリを用意して`datasets.load_dataset`を使う方法
2. dictやgeneratorを定義して`datasets.Dataset.from_*`関数を利用する方法
3. データセットのロードをコードで定義する`datasets.DatasetBuilder`クラスを利用する方法(今回紹介する方法)

### 1. あらかじめ特定の構造のファイル or ディレクトリを用意してdatasets.load_datasetを使う方法

まず、ファイルを読むこむ方法は以下のリンクのように、あらかじめ用意した`csv, json`などの形式のファイルをそのままload_dataset関数で読み込みます。

<https://huggingface.co/docs/datasets/loading#local-and-remote-files>

例えばcsv形式のファイルなら以下のように読み込みます。

```python
import datasets as ds

dataset = ds.load_dataset(
    "csv",
    data_files={"train": ["my_train_file_1.csv", "my_train_file_2.csv"], "test": "my_test_file.csv"}
)
```

あらかじめファイルを用意しておくだけなので簡単です。

ディレクトリを読み込む方法は、以下のリンクのように特定のディレクトリ以下に`train, validation`などのsplitディレクトリを作成して、そのディレクトリを`load_dataset`関数で読み込みます。

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

この方法は画像以外にも`audiofolder`とすることで音声ファイルにも利用することができます。

### 2. datasets.Dataset.from_*関数を利用する方法

この方法では、以下のチュートリアルにあるように、Pythonの関数やdictを渡すことでデータセットを作成することができます。

<https://huggingface.co/docs/datasets/create_dataset#from-python-dictionaries>

例えば、dictを渡す場合は以下のように作成します。

```python
import datasets as ds

dataset_dict = {
    "text": ["hoge", "fuga"]
    "label": [1, 3]
}

dataset = ds.Dataset.from_dict(dataset_dict)
```

generatorを渡す場合は以下のように作成します。引数の`gen_kwargs`にgenerator関数に渡す引数を、`num_proc`に並列数を渡すことができます。

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

個人的に最も手軽なのは、generatorと`datasets.Dataset.from_generator`を使う方法かと思います。スクリプト上で元データの整形をしながら並列にデータセットを作成可能なので手軽でおすすめです。

### 3. datasets.DatasetBuilderクラスを利用する方法

今回紹介する方法です。後に詳しく書きます。

## 本題: datasets.DatasetBuilderクラスを利用したデータセットの作成の概要

本記事の本題である、`datasets.DatasetBuilder`などのBuilder classを利用したデータセット作成方法を紹介します。今回はBuilder classの中でも、`datasets.GeneratorBasedBuilder`を使います。まずはBuilder classを利用するとどんな利点があるのかをまとめてから、実際に作成するコードを紹介します。

### メリット

Builder classを使うと以下のような利点があります。

- データセットのファイル自体を入手し、前準備をする方法を定義できる
- HuggingFace datasetsでサポートされていない形式や複雑な準備が必要なデータセットにも対応できる
- 複数のデータセットを束ねることができる

前述した1,2のload_datasetやfrom_generator関数を利用した方法では、あらかじめダウンロードやディレクトリの準備が必要でしたが、Builder classを使うと準備の操作もコードとして定義することが可能なため、Pythonスクリプトのみを共有するだけでHuggingFace datasetsを共有することが可能です。

HuggingFaceで既に公開されている[JMTEB](https://huggingface.co/datasets/sbintuitions/JMTEB)や[JGLUE](https://huggingface.co/datasets/shunk031/JGLUE)といった複数のデータセットを用いるモデルの評価指標リポジトリはBuilder classで定義されています。言語モデルの事前学習に用いる多言語データセットの[wikimedia/wikipedia](https://huggingface.co/datasets/wikimedia/wikipedia)は以下のように呼び出すことで、言語の切り替えを行うことが可能ですが、Builder classを用いると、このような複雑な分割についても扱うことができます。

```python
from datasets import load_dataset

ds = load_dataset("wikimedia/wikipedia", name="20231101.en")
```

### 関連class, object

データセットを定義するに当たって、以下のいくつかの関連クラスやオブジェクトを利用します。

- `datasets.BuilderConfig`
  Builder classでデータセットを呼び出すのに必要なデータセットの名前、バージョンやdata_dirなどを定義します。複数のデータセットを束ねる場合は複数定義することになります。
- `datasets.DatasetInfo`
  データセットの情報を定義します。citationやhomepage、データセットの要素の型などを定義します。
- `datasets.SplitGenerator`
  データセットのsplitの定義をします。例えばデータセットにtrain, val, testといったsplitが含まれる場合はその数だけ定義することになります。
- `datasets.GeneratorBasedBuilder`
  上記3つのclassを元に、Datasetを作成するClassを定義します。

## 実装

それでは実際に`datasets.GeneratorBasedBuilder`を使って、日本語コーパスの[livedoor ニュースコーパス](https://www.rondhuit.com/download.html)と[llm-book/japanese-wikipedia](https://huggingface.co/datasets/llm-book/japanese-wikipedia)を束ねた`JapaneseTextDataset`を作成してみます。
livedoor ニュースコーパスはWebから入手し、llm-book/japanese-wikipediaはHuggingFaceにアップロードされているものをそのまま利用します。

ディレクトリ構成は以下とします。

```bash
JapaneseTextDataset/
└── JapaneseTextDataset.py
```

以下が`JapaneseTextDataset.py`の中身です。順に説明していきます。

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

上記のコードの以下の部分で、LivedoorとWikipediaのBuilderConfigを定義しています。

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

今回は特別なことはしていませんが、`load_dataset`を呼ぶときに引数を追加する場合は以下のようにします。

```python
@dataclass
class WikiJPConfig(ds.BuilderConfig):
    """BuilderConfig for WikiJP"""

    def __init__(self, name: str = "wiki", language: str = "ja", **kwargs):
        super().__init__(name, **kwargs)
        self.language = "ja"
```

上記の例では`language`という引数を足しています。こうすることで、データセットを読み込む時に以下のような方法で`language`引数を渡すことができるようになります。

```python
dataset = ds.load_dataset("JapaneseTextDataset", name="wiki", language="ja")
```

### datasets.GeneratorBasedBuilder

`datasets.GeneratorBasedBuilder`を継承した`JapaneseTextDataset`クラスには`VERSION`, `DEFAULT_CONFIG_NAME`,  `BUILDER_CONFIGS`を設定します。
複数データセットを呼べるようにする場合は`BUILDER_CONFIGS`に複数の`datasets.BuilderConfig`をリストで列挙しておきます。
`DEFAULT_CONFIG_NAME`ではload_datasetで何も指定しなかった場合に、どのconfig_nameが呼ばれるかを設定します。デフォルト値は`"default"`です。

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

`datasets.GeneratorBasedBuilder`の`_info`関数では、`datasets.DatasetInfo`形式でデータセットの情報を返してあげます。このとき、`self.config`で、`BUILDER_CONFIGS`の内容を参照できるので、呼び出すデータセットの情報を動的に変更できます。

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

`datasets.GeneratorBasedBuilder`の`_split_generators(self, dl_manager: ds.DownloadManager)`関数では、データセットにどのようなsplitがあるのかを`ds.SplitGenerator`で定義してリストで返します。`SplitGenerator`の`gen_kwargs`は後ほど出てくる、データ1行を返す`_generate_examples`に渡す引数を定義します。

今回は、`"llm-book/japanese-wikipedia"`はHuggingFaceから取得するので内部でload_datasetを呼んでいます。
Livedoor News Corpusはウェブからダウンロードして利用するので、ダウンロードをスクリプトで書き、保存先を`gen_kwargs`に渡してあります。
`dl_manager.download_and_extract`を使うと、URLからダウンロードと回答を一気に行ってくれるのでこれを利用します。

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

`datasets.GeneratorBasedBuilder`の`_generate_examples`関数では、データセットの1データをどのように返すかを定義します。引数には先ほどの`_split_generators`で定義した`gen_kwargs`が渡されます。generatorで定義するので、`yield`構文を使っています。

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

## データセットの呼び出し

以上でデータセットの構築は終了です。実際にデータセットを呼び出してみます。
以下のようなスクリプトで呼び出せます。

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

実行結果は以下です。

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

無事データセットが呼び出せました。

## HuggingFace Hubへのアップロード

作成したデータセットをHuggingFaceにアップロードするには、先ほど作成した`JapaneseTextDataset`ディレクトリをそのままpushすれば良いです。

以下のTemplateにあるように、`README.md`にDatasetの情報を書いておくとそのまま使われます。

<https://github.com/huggingface/datasets/tree/main/templates>

また、以下のリポジトリはJGLUEをHuggingFaceにアップロードしているGitHubのリポジトリなのですが、CI/CDまで組んであり、大変参考になります。

<https://github.com/shunk031/huggingface-datasets_JGLUE/tree/main>

以上、簡単にですがBuilder classを使ったHuggingFace datasetsの作成方法でした。

## 参考

[https://github.com/shunk031/huggingface-datasets_JGLUE/tree/main](https://github.com/shunk031/huggingface-datasets_JGLUE/tree/main)

[https://qiita.com/oyahiroki/items/662ed10ab3f8d4bf8f61](https://qiita.com/oyahiroki/items/662ed10ab3f8d4bf8f61)

[https://github.com/huggingface/datasets/tree/main/templates](https://github.com/huggingface/datasets/tree/main/templates)

[https://huggingface.co/docs/datasets/package_reference/builder_classes](https://huggingface.co/docs/datasets/package_reference/builder_classes)

[https://huggingface.co/datasets/sbintuitions/JMTEB/blob/main/JMTEB.py](https://huggingface.co/datasets/sbintuitions/JMTEB/blob/main/JMTEB.py)
