---
title: python-build-standaloneとDockerによるポータブルなPython環境の構築
tags: [Python, Docker]
category: Python
date: 2024-08-01
update: 2024-08-01
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

こんにちは。今回は、Linux, macOS, Windows/x86,arm に対応した
ポータブルなPython環境を展開可能なpython-build-standaloneについて紹介します。

<https://github.com/indygreg/python-build-standalone>

<https://gregoryszorc.com/docs/python-build-standalone/main/>

## 概要

Githubで公開されているリポジトリであるpython-build-standaloneでは、
各OS, CPUアーキテクチャに対応したビルド済みのPythonが配布されています。
配布されているPythonはpipを同梱済みなので、ダウンロード後すぐにPython環境を
使い始めることができます。
また、ここで提供されているPythonは、最近注目されているパッケージマネージャのRyeやmiseでも
用いられており、柔軟なPython環境の構築に役立っています。

配布されているPythonはライセンスの関係で、自前でビルドしたものと挙動が異なる場合がありますが、
ほとんどの動作において問題はありません。詳しくは以下の記事に書かれています。

<https://techtekt.persol-career.co.jp/entry/tech/240523_01>

## 提供されているPython

python-build-standaloneでは、様々なOSとCPUアーキテクチャに対応したPythonのビルド済みバイナリが提供されています。
以下のGithubのReleaseページから入手することができます。

<https://github.com/indygreg/python-build-standalone/releases>

入手できるバイナリの命名規則は以下の順になっています。

```bash
cpython-(Pythonバージョン)+(releaseのタイムスタンプ)-(アーキテクチャ)-(ビルド設定)-(同梱内容)
```

それぞれの項目は以下のようになっています。

### releaseのタイムスタンプ

GitHubのTagとして設定されている、Releaseを公開した日付を入れます。
最新のReleaseの日付は以下のGitHub APIから確認することができます。

<https://raw.githubusercontent.com/indygreg/python-build-standalone/latest-release/latest-release.json>

### アーキテクチャ

| 項目                        | 内容                                                                                                                     |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `aarch64-apple-darwin`      | macOS ARM CPU。M1, M2, M3 など。                                                                                             |
| `x86_64-apple-darwin`       | macOS Intel CPU                                                                                                          |
| `i686-pc-windows-msvc`      | Windows 32 ビット Intel/AMD CPU                                                                                             |
| `x86_64-pc-windows-msvc`    | Windows 64 ビット Intel/AMD CPU                                                                                             |
| `*-windows-msvc-shared`     | Windows の Python 標準ビルド。Python とエクステンションの DLL がある。公式 Windows 用 Python と同様の動作。                                    |
| `*-windows-msvc-static`     | 静的リンクの Python ビルド。非常に脆弱で既知の互換性問題あり。包括的なテストカバレッジがあり、使用ケースで動作確認済みの場合以外は非推奨。                  |
| `x86_64-unknown-linux-gnu`  | Linux 64 ビット Intel/AMD CPU、GNU libc とリンク。                                                                                |
| `x86_64-unknown-linux-musl` | Linux 64 ビット Intel/AMD CPU、musl libc とリンク。静的バイナリで共有ライブラリ依存なし。Python の`.so`拡張を読み込めない。                           |
| `aarch64-unknown-linux-*`   | Linux ARM64 CPU 向け。AWS Graviton EC2 インスタンスなどに適用。多くの Linux ARM デバイスも`aarch64`。                                        |
| `i686-unknown-linux-*`      | Linux 32 ビット Intel/AMD CPU。                                                                                              |
| `x86_64_v2-*`               | 2008 年以降の Nehalem 以降の 64 ビット Intel/AMD CPU 向け。SSE3、SSE4 など搭載。古い CPU では起動不可。                                 |
| `x86_64_v3-*`               | 2013 年以降の Haswell（Intel）または 2015 年以降の Excavator（AMD）以降の 64 ビット CPU 向け。AVX、AVX2、MOVBE 等搭載。古い CPU では起動不可。 |
| `x86_64_v4-*`               | 一部の AVX-512 命令搭載の 64 ビット Intel/AMD CPU 向け。2017 年以降の Intel CPU 対象だが、全ての Intel CPU が AVX-512 搭載というわけではない。   |

SIMD命令を有効にした`x86_64_v2-*`, `x86_64_v3-*`, `x86_64_v4-*`は対応していないCPUで実行するとクラッシュします。
ドキュメントによると、Linuxでは`*-unknown-linux-gnu`が、Windows では`*-windows-msvc-shared`が推奨されています。macOSはCPUに合わせて選べば良いです。

ここに書かれていないarmv7などのアーキテクチャでも、実際のReleaseには含まれているので確認してみてください。

### ビルド設定

- pgo+lto: Profile guided optimizationとLink-time optimizationをビルド時に適用している。最も高速なディストリビューション
- pgo: Profile guided optimizationのみを適用
- lto: Link-time optimizationのみを適用
- noopt: 通常の最適化のみを行ったビルド
- debug: 最適化を行っていないデバッグビルド

### 同梱内容

- install_only: ビルド後のインストールに必要なファイルのみ
- install_only_stripped: install_onlyからデバッグシンボルを削除した軽量版
- full: ビルドに使用したファイル・成果物全てが同梱されている。.tar.zst 形式での配布

上記の違いについて、容量を見てみます。

| バリエーション                                                                    | 容量   |
|----------------------------------------------------------------------------|--------|
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-install_only.tar.gz`     | 60.5MB |
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-install_stripped.tar.gz` | 21.2MB |
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-pgo+lto-full.tar.zst`    | 87.3MB |
| `cpython-3.12.4+20240726-x86_64-unknown-linux-gnu-pgo-full.tar.zst`        | 47.8MB |

## Dockerでの利用

Dockerfileでpython-build-standaloneから入手したPythonを導入してみます。

今回は、`cpython-3.11.9+20240726-x86_64-unknown-linux-gnu-pgo+lto-full.tar.zst`
をdebian:latestのイメージにインストールします。

```dockerfile
FROM --platform=linux/amd64 debian:latest

ARG TAG="20240726"
ARG PYTHON_VERSION="3.11.9"

RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    zstd

RUN curl -sSL "https://github.com/indygreg/python-build-standalone/releases/download/${TAG}/cpython-${PYTHON_VERSION}+${TAG}-x86_64-unknown-linux-gnu-pgo+lto-full.tar.zst" -o python.tar.zst \
    && tar -axvf python.tar.zst \
    && mv python/install /usr/local/python \
    && rm -rf python.tar.zst python
ENV PATH="/usr/local/python/bin:$PATH"
ENV LD_LIBRARY_PATH="/usr/local/python/lib:$LD_LIBRARY_PATH"
```

```bash
docker build -f Dockerfile ./ -t debian-python

docker run --rm -it debian-python python
Python 3.11.9 (main, Jul 25 2024, 22:42:09) [Clang 18.1.8 ] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

無事Pythonのインタープリターが起動しました。

Dockerコンテナ内で好きなバージョンのPythonを導入するには、aptのリポジトリ`ppa:deadsnakes/ppa`を登録するか、
pyenv, poetryなどでビルドするか、自前でビルドするくらいしか選択肢がありませんでしたが、
python-build-standaloneを利用することで、簡単に環境構築ができます。
特に、NVIDIAのDockerイメージである`nvidia/cuda`といったイメージはデフォルトではPythonが
入っていないのでこの方法であれば、手軽にPython環境を追加できます。

## まとめ

今回はpython-build-standaloneで配布されている様々なOS、アーキテクチャに対応したビルド済みPythonを
Dockerへの導入する方法を紹介しました。
この方法であれば、新たにビルドすることなく、手軽にPython環境を構築することが可能です。
