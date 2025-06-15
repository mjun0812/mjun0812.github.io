---
title: "uv, ruff, devcontainer, Claude Codeを使ったモダンなPython開発環境のテンプレート"
tags: [Python, uv, ruff, devcontainer, Claude Code, Cursor, pytest, pre-commit, "docker"]
category: Python
date: 2025-06-15
update: 2025-06-15
emoji: "😉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["python", "devcontainer", "uv", "claude"]
published: true
---

こんにちは．今回は，uv, ruff, devcontainer, Claude Code, Cursorなどのモダンなツールを使ったPythonの開発環境テンプレートを作成したので，その内容を紹介します．
テンプレートは以下のリポジトリで公開しています．

https://github.com/mjun0812/python-copier-template

https://github.com/mjun0812/python-project-template

## テンプレートの特徴・構成

本テンプレートは，シンプルで自由度の高いテンプレートを目指すため，あまり多くのツールを導入しないように心がけています．多くのツールを導入すると，学習コストも高くなるためです．

- **uv**: Rust製の高速なPythonの仮想環境・パッケージ管理ツール
- **ruff**: Rust製の高速なFormatter, Linter
- **pytest**: テストフレームワーク
- **pre-commit**: コミット前のFormat, Lintによるコード品質の担保
- **devcontainer**: 統一された開発環境の提供
- **Docker, Docker Compose**: コンテナ化されたポータブルな実行環境の提供
- **GitHub Actions**: CIの提供
- **AI rules**: ルール定義によるCursor, Claude Codeの適切なAI開発支援

ディレクトリ構造は以下のようになっています．

```text
python-template/
├── .github/
│   └── workflows/                    # GitHub Actionsのワークフロー置き場
├── .devcontainer/devcontainer.json   # devcontainerの設定ファイル
├── .cursor/rules/                    # Cursorのルール定義置き場
├── src/
│   └── python_template/              # パッケージのルートディレクトリ
├── tests/                            # pytestのテストスクリプト置き場
├── docker/                           # Dockerファイル置き場
├── .gitignore                        # git管理から除外するファイルを記述するファイル
├── .python-version                   # Pythonのバージョンを記述するファイル
├── .pre-commit-config.yaml           # pre-commitの設定ファイル
├── compose.yml                       # Docker Compose
├── pyproject.toml                    # プロジェクトの設定
├── CLAUDE.md                         # Claude Codeのルール定義
└── README.md                         # プロジェクトの説明
```

## Quick Start

本テンプレートは，[Copier](https://copier.readthedocs.io/en/stable/)というツールを使用して，対話式で簡単にテンプレートからプロジェクトを作成することができます．

https://github.com/mjun0812/python-copier-template

```bash
uvx copier copy gh:mjun0812/python-copier-template <output_directory>
```

このコマンドを実行すると，対話式でプロジェクトの基本情報を入力することができます．

- Project name: プロジェクト名
- Python version: Pythonのバージョン
- Package name: パッケージ名
- Description: プロジェクトの説明
- Author name: 作者名
- Author email: 作者のメールアドレス

これらの情報を入力すると，テンプレートからプロジェクトが作成されます．

または，以下のGitHub Templateから作成することもできます．

https://github.com/mjun0812/python-project-template

テンプレートからプロジェクトを作成した後はdevcontainerを使用して開発環境の構築を行うか，以下のコマンドを実行してローカルで開発を始めることができます．

```bash
uv sync
uv run pre-commit install
```

これらのコマンドを実行すると，uvによってPythonの仮想環境が作成され，pre-commitがインストールされます．

## 解説

ここでは，本テンプレートの各ツールの解説を行います．

### pyproject.toml

`pyproject.toml`は，Pythonのプロジェクトの設定を行うファイルです．
setup.pyに変わるプロジェクト管理ファイルで，プロジェクト名やバージョン，依存関係，ビルドなどの基本情報から，後述するuvやruffなどのツールの設定もこのファイルに記述できます．

本テンプレートでは，uvで自動作成されたpyproject.tomlをベースとしており，以下のような内容になっています．

```toml
[project]
name = "{{project_name}}"
version = "0.0.1"
description = "{{description}}"
readme = "README.md"
authors = [{ name = "{{author_name}}", email = "{{author_email}}" }]
requires-python = ">={{python_version}}"
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/{{package_name}}"]

[dependency-groups]
dev = ["pre-commit>=4.2.0", "pytest>=8.4.0", "ruff>=0.11.12"]

[tool.ruff]
line-length = 100
target-version = "py{{python_version | replace('.', '')}}"
exclude = [".git", ".ruff_cache", ".venv", ".vscode"]
```

### uv: Pythonの仮想環境・パッケージ管理

https://docs.astral.sh/uv/

**uv**はastral社が開発しているRust製のPythonの仮想環境・パッケージ管理ツールです．  

これまで，Pythonの仮想環境・パッケージ管理には，pyenv, pipenv, poetry, Ryeなどがありましたが，uvは，これらのツールよりも10倍以上高速に動作し，ポータビリティも高いことから，uvがPythonの環境管理のデファクトスタンダードとなっています．事実上，Pythonの環境管理ツールはuvに統一されたと言って良いでしょう．

uvのインストールは，以下のコマンドで行うことができます．

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

以下のコマンドで，uvの仮想環境とパッケージを同時にインストールできます．

```bash
uv sync
```

パッケージをプロジェクトに追加するには，以下のコマンドを実行します．

```bash
uv add <package_name>
```

パッケージを削除するには，以下のコマンドを実行します．

```bash
uv remove <package_name>
```

パッケージの更新は，以下のコマンドを実行します．

```bash
uv add <package_name> --upgrade-package <package_name>
```

作成された仮想環境でコマンドを実行するには，以下のコマンドを実行します．

```bash
uv run <command>
# 例
uv run python app.py
uv run ruff check .
```

virtualenvベースなので，仮想環境を現在のシェルに反映することもできます．

```bash
# .venvがあるディレクトリで
source .venv/bin/activate
# 仮想環境から抜ける
deactivate
```

プロジェクトで使用するPythonのバージョンを指定するには，以下のコマンドを実行します．

```bash
uv python pin <python_version>
# 例
uv python pin 3.12
```

このコマンドを実行すると，`.python-version`ファイルが作成され，そのファイルにPythonのバージョンが記述されます．uvは，このファイルを読んで仮想環境のPythonのバージョンを決定します．

実際にインストールされる依存パッケージも含めた，全てのパッケージの詳細が書かれている`uv.lock`ファイルを更新するには，以下のコマンドを実行します．手動で`pyproject.toml`を書き換えた場合などに使用します．

```bash
uv lock
```

### 型ヒント

Pythonにおける型ヒントとは，コード中に関数などの引数や返り値の型を明示することで，コードの可読性や保守性を向上させるための機能です．さらに，型ヒントを用いることで，エディタの補完機能の向上や，Cursor, Claude CodeのAI開発支援の精度を向上させることができます．

Pythonの型ヒントは，以下のような記法で記述します．

```python
name: str = "mjun"
names: list[str] = ["mjun", "moririn"]

def add(a: int, b: int) -> int:
    return a + b
```

C/C++やGoなどの静的型付け言語とは異なり，Pythonの型ヒントは，実行時に型チェックが行われるわけではないため，型ヒントが誤っていた場合でも，エラーが発生しません．型ヒントの正しさを確認するには，mypyやpyrightなどの静的型チェッカーを使用する必要があります．

```bash
uv add mypy
uv run mypy .
```

このテンプレートでは，uvやruffを開発しているastral社が開発しているRust製の[ty](https://github.com/astral-sh/ty)の安定リリースを待っているため，導入していませんが，型ヒントを厳密に行いたい場合は，現時点ではmypyやpyrightを使用するのが良いでしょう．

動的型言語にわざわざ型をつけるのか？と私も最初は疑問に思っていたのですが，これからAIを用いた開発が主流になっていく中で，型ヒントを用いてAIの出力精度を高めることが重要になると感じたため，Pythonは型ヒントをつける言語になったのだと割り切っています．

### ruff: コードのFormat, Lint

https://docs.astral.sh/ruff/

**ruff**は，Rust製のPythonのコードのFormat, Lintを行うツールです．前述のuvと同様にastral社が開発しているツールで，Rust製のため，非常に高速に動作します．ruffではGoogle製のblackやflake8などのFormatter, Linterと同様の機能を提供しており，これ1つで，コードのFormat, Lintを網羅してくれます．

前述のuvと組み合わせて，以下のコマンドでコードのFormat, Lintを行うことができます．

```bash
uv run ruff format . # Format
uv run ruff check . # Lint
uv run ruff check --fix . # Lint & Fix it
```

`ruff check`で`--fix`オプションを使用すると，可能な限りLint Errorを修正してくれます．
RuffでFormat，Lintの設定を行うには，`pyproject.toml`を以下のように編集します．

```toml
[tool.ruff]
line-length = 100 # 行の長さ
target-version = "py{{python_version | replace('.', '')}}" # 対象とするPythonのバージョン
exclude = [".git", ".ruff_cache", ".venv", ".vscode"] # 除外するディレクトリ

[tool.ruff.lint]
preview = true # 安定版ではない新しいルールや機能を有効にします．
select = [
    # ルールの選択
    "ANN", # type annotation
    "E",   # pycodestyle errors
    "F",   # pyflakes
    "I",   # isort
    "RUF", # ruff specific rules
    "W",   # pycodestyle warnings
    ...
]
ignore = [
    # 無視するルール
    "B007",   # Unused loop variable
    "B008",   # Function call in default argument
    "B905",   # `zip()` without `strict=True`
    ...
]
unfixable = [
    # uv run ruff check --fix . で自動修正しないルール
    "F401", # unused import
    "F841", # unused variable
]

[tool.ruff.lint.per-file-ignores]
# ファイルごとに無視するルール
"__init__.py" = ["F401"]

[tool.ruff.lint.pydocstyle]
# pydocstyleルールの設定
# docstringのスタイルを指定
convention = "google"
```

上記は一部抜粋したもので，このテンプレートでは，私がよく使うルールを設定しています．以下の考えに基づいています．

- 日本語のコメント・docstringを許可
- Pythonのモダン構文を積極的に利用
  - os.pathではなくpathlib.Pathを使用
  - pyupgradeルールによるPythonのモダン構文への移行
- 型ヒントを前提とした設計
  - エディタの補完機能の活用
  - Cursor, Claude CodeのAI開発支援を活用するためには，型ヒントを用いた方が精度の良い出力が得やすい
  - Any型の使用を許可することで，最悪逃げ道を残す
- 開発の邪魔になりやすい警告は無効化
  - 未使用変数 (F841)・未使用 import (F401) は開発途中に消されないように自動修正しない
  - G004（f-string での logging 禁止）等、現実的なワークフローを妨げるルールも除外

ruffのルールはまだ試行錯誤している状況ですが，できるだけモダンな文法を使いつつ，開発フレンドリーなルールを目指しています．

### pytest: テストフレームワーク

https://docs.pytest.org/en/stable/

**pytest**は，Pythonのテストフレームワークです．Pythonでは標準ライブラリとしてユニットテストの行えるunittestがありますが，pytestはunittestよりも使い勝手の良いAPIを提供しており，Python開発においては広く使われています．

pytestは特定の命名規則のテストファイル・テスト関数を自動的に検出して，テストを実行してくれます．pytestのテストファイルは，以下のような命名規則に従っています．

```text
tests/test_<test_name>.py
```

テスト関数は，以下のような命名規則に従っています．

```python
def test_<test_name>():
    ...
```

テスト時に実際に実行されると困るような関数などのテストは，モックを利用してテスト時に振る舞いを変えることができます．モックを利用するには，標準ライブラリの`unittest.mock`を使用するか，`pytest-mock`を使用します．

```bash
uv add --dev pytest-mock
```

pytestを実行するには，以下のコマンドを実行します．

```bash
uv run pytest
```

pytest実行時に標準出力や標準エラー出力を表示するには，`-s`オプションを使用します．また，テストの実行結果を詳細に表示するには，`-v`オプションを使用します．

```bash
uv run pytest -s -v
```

### pre-commit: コミット前のFormat, Lintによるコード品質の担保

https://pre-commit.com/

**pre-commit**は，Gitのコミット前に決まったタスクを実行するツールです．このテンプレートでは，ruffのFormat, Lintをコミット前に実行するように設定することで，Gitにバージョン管理される前に，コードの品質を担保しています．

pre-commitの設定は，`.pre-commit-config.yaml`ファイルに記述します．

```yaml
repos:
  - repo: https://github.com/astral-sh/uv-pre-commit
    # uv version.
    rev: 0.7.11
    hooks:
      - id: uv-lock
  - repo: https://github.com/astral-sh/ruff-pre-commit
    # Ruff version.
    rev: v0.11.12
    hooks:
      # Run the linter.
      - id: ruff-check
        args: [--fix]
      # Run the formatter.
      - id: ruff-format
```

1つ目の`uv-pre-commit`は，uv lockを実行するための設定です．これを行うことで，`pyproject.toml`と`uv.lock`が同期されます．
2つ目の`ruff-pre-commit`は，ruffのFormat, Lintを実行するための設定です．pre-commit実行時は，エラーを出してcommitを止めることもできるのですが，このテンプレートでは，可能な限り自動修正を行うように設定しています．

pre-commitのインストールを行うには，以下のコマンドを実行します．

```bash
uv run pre-commit install
```

pre-commitに定義したタスクは，以下のコマンドで手動実行することもできます．

```bash
uv run pre-commit run
```

### devcontainer: 統一された開発環境の提供

https://containers.dev/

**devcontainer**は開発環境をコンテナ化して，統一された開発環境を提供するための仕組みです．初期はVSCodeの拡張機能として提供されていましたが，現在はOrganizationで管理され，標準仕様が定義されており，CLIからも操作できるようになっています．

devcontainerはその名の通り，コンテナを使用して隔離された開発環境を提供します．コンテナ内に，開発に使うツールや環境，VSCodeやCursorなどの拡張機能をインストールしておくことで，ホストの環境を問わず簡単に開発環境を用意することができます．
正直，uvの仮想環境を使えば簡単に環境を用意できるので，必要ないと思われるかもしれませんが，コンテナを利用していることで，OSの差異を減らせることや，VSCodeの拡張機能を隔離して揃えることができる点がdevcontainerの利点となるのではないかと思います．

本テンプレートでは，VSCodeやCursorでのコーディング時にdevcontainerを使用して，統一されたPython開発環境を提供しています．

devcontainerの設定は，`.devcontainer/devcontainer.json`ファイルに記述します．

以下が本テンプレートで使用しているdevcontainer.jsonの設定例です．本テンプレートでは，新たにdevcontainer用のDockerfileを用意する管理コストを避けるために，Microsoftから公開されているdevcontainer用のUbuntuイメージを使用し，featuresを使用して開発に必要なツールをインストールしています．devcontainer用のDockerイメージを使うと，コンテナ内に自動でホストと同じIDのユーザーが作成されるなどのdevcontainerを使う上での利点があります．

以下に`devcontainer.json`の設定例を示します．

```json
{
 "name": "python-devcontainer",
 "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
 "containerEnv": {
  "DISPLAY": "${localEnv:DISPLAY}",
  "PYTHONUNBUFFERED": "1",
  "PYTHONDONTWRITEBYTECODE": "1",
  "UV_CACHE_DIR": "${containerWorkspaceFolder}/.cache/uv",
  "UV_LINK_MODE": "copy",
  "UV_PROJECT_ENVIRONMENT": "/home/vscode/.venv",
  "UV_COMPILE_BYTECODE": "1"
 },
 "features": {
  "ghcr.io/devcontainers/features/github-cli:1": {},
  "ghcr.io/devcontainers/features/common-utils:2": {
   "configureZshAsDefaultShell": true
  },
  "ghcr.io/rocker-org/devcontainer-features/apt-packages:1": {
   "packages": "curl,wget,git,jq,ca-certificates,build-essential,ripgrep"
  },
  "ghcr.io/va-h/devcontainers-features/uv:1": {
   "shellAutocompletion": true
  },
  "ghcr.io/devcontainers/features/node:1": {},
  "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}
 },
 "runArgs": [
  "--init",
  "--rm"
 ],
 "hostRequirements": {
  "gpu": "optional"
 },
 "customizations": {
  "vscode": {
   "settings": {
    "python.defaultInterpreterPath": "/home/vscode/.venv/bin/python"
   },
   "extensions": [
    "ms-python.python",
    "charliermarsh.ruff",
    "eamodio.gitlens",
    "tamasfe.even-better-toml",
    "ms-toolsai.jupyter",
    "yzhang.markdown-all-in-one"
   ]
  }
 },
 "mounts": [
  "source=claude-code-config,target=/home/vscode/.claude,type=volume"
 ],
 "postCreateCommand": "uv sync",
 "postStartCommand": "uv run pre-commit install"
}
```

devcontainer.jsonの設定は，以下のような項目があります．

- `features`: 開発環境に追加する機能を指定します．featuresを使うことで，新たにDockerfileを書かなくてもuvやClaude Codeなどのツールをインストールすることができます．
- `customizations`: VSCodeの拡張機能などエディタの設定をします．VSCodeのsettings.jsonに書く内容もここで指定できます．
- `hostRequirements`: ホストの要件を指定します．例えば割り当てるCPUコア数やRAMの容量を指定できます．ホストでGPUが利用可能な場合に，GPUをコンテナ内に割り当てるには，`gpu`を`optional`に指定します．すると，docker run時に`--gpus all`オプションが自動で付与され，コンテナ内で`nvidia-smi`コマンドを実行することができます．optionalなのでGPUがホストにない場合でも動作します。
- `postCreateCommand`: コンテナ作成後に実行するコマンドを指定します．上記の例では，`uv sync`を実行して，uvの仮想環境を作成しています．
- `postStartCommand`: コンテナ起動後に実行するコマンドを指定します．上記の例では，`pre-commit install`を実行して，pre-commitをインストールしています．

### Docker, Docker Compose: コンテナ化されたポータブルな実行環境の提供

https://docs.docker.com

**Docker**は，アプリケーションを実行するために必要な環境(OS、ライブラリ、ツールなど)をまとめた軽量なコンテナを作成、配布、実行するためのプラットフォームです．Dockerを使うことで，簡単にポータブルな実行環境を共有することができます．コンテナの定義は，Dockerfileというファイルに記述し，このファイルからDockerイメージをビルドして，コンテナを起動することができます．

**Docker Compose**は，Dockerを使って複数のコンテナを管理するためのツールです．プロジェクトにMySQLなどのデータベースなどが必要になった場合には，Docker Composeを使って，データベースを含むコンテナをまとめて管理・起動することができます．

本テンプレートではmulti-stage buildを使って，最終的な実行環境となるDockerイメージの容量を小さくし，実行時間の削減に繋がるようにしています．さらに，multi-stage buildを使うことで，ビルドキャッシュのヒット率を向上させたり，ビルド自体が並列に実行されるため，ビルド時間の削減に繋がります．

以下が本テンプレートで使用しているDockerfileの設定例です．

```dockerfile
# syntax=docker/dockerfile:1

ARG BUILDER_IMAGE="ubuntu:24.04"
ARG RUNNER_IMAGE="ubuntu:24.04"

FROM $BUILDER_IMAGE AS builder # ビルダーステージ

ENV DEBIAN_FRONTEND=noninteractive \
    UV_PYTHON_INSTALL_DIR="/opt/python" \
    UV_PROJECT_ENVIRONMENT="/opt/venv" \
    # Compile packages to bytecode after installation
    UV_COMPILE_BYTECODE=1 \
    # Copy packages from wheel
    UV_LINK_MODE=copy

RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
--mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
WORKDIR /app

# Sync dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=.python-version,target=.python-version \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    ulimit -n 8192 \
    && uv sync --locked --no-install-project --no-editable

# Sync this project
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-editable

FROM $RUNNER_IMAGE AS production # ランナーステージ

ENV DEBIAN_FRONTEND=noninteractive \
    PATH="/opt/venv/bin:$PATH" \
    UV_PYTHON_INSTALL_DIR="/opt/python" \
    UV_PROJECT_ENVIRONMENT="/opt/venv" \
    # Disable buffering of standard output and error streams
    PYTHONUNBUFFERED=1 \
    # Disable generation of .pyc files
    PYTHONDONTWRITEBYTECODE=1

# Copy Python
COPY --from=builder /opt/python /opt/python
COPY --from=builder /opt/venv /opt/venv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    build-essential \
    sudo \
    gosu

# Allow sudo without password
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

COPY --chmod=755 ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
```

`FROM $BUILDER_IMAGE AS builder`から，`FROM $RUNNER_IMAGE AS production`までのブロックが，multi-stage buildにおけるビルダーステージです．ビルダーステージでは，uvを使って依存関係をインストールやソースコードのビルドなどを行います．

`FROM $RUNNER_IMAGE AS production`以降のブロックが，multi-stage buildにおけるランナーステージです．ここでは以下のように，ビルダーステージでインストールしたパッケージをコピーして，実行環境を構築しています．

```dockerfile
# ビルダーステージでビルドした生成物をコピー
COPY --from=builder /opt/python /opt/python
COPY --from=builder /opt/venv /opt/venv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
```

ビルダーステージの生成物のみをコピーすることで，実行環境では必要のないツールやパッケージを最終的なイメージに含めず，軽量なDockerイメージを作成することができます．
また，上記の例ではDockerfile中に[キャッシュマウント](https://docs.docker.com/reference/dockerfile/#example-cache-apt-packages)を使用することで，
繰り返し行われる`apt install`や`uv sync`を高速化しています．

```dockerfile
RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    build-essential \
    sudo \
    gosu
```

Dockerでaptを実行すると，通常はダウンロードしたパッケージがキャッシュされないため，キャッシュが作成されるように最初のRUNブロックで，aptのキャッシュを有効化しています．次のRUNブロックでは，`--mount=type=cache,target=/var/cache/apt,sharing=locked`と`--mount=type=cache,target=/var/lib/apt,sharing=locked`を使用して，一度ダウンロードしたパッケージやパッケージ一覧のダウンロードをキャッシュしています．

さらに本テンプレートでは，コンテナ内のユーザーをホストのユーザーと揃えることでコンテナ内の生成物をホストのユーザーが操作できるようにしています．詳しくは，テンプレート内の[docker/entrypoint.sh](https://github.com/mjun0812/python-project-template/blob/main/docker/entrypoint.sh)や[docker/run.sh](https://github.com/mjun0812/python-project-template/blob/main/docker/run.sh)を参照してください．

### GitHub Actions: CIの提供

https://docs.github.com/ja/actions

**GitHub Actions**は，GitHubが提供しているCI/CDのツールです．GitHubでホストされているリポジトリに対して，コミット時やプルリクエストが発行された時などの条件を指定して，特定のアクションを実行することができます．

本テンプレートでは，GitHub Actionsを使用して，コミット時やプルリクエストが発行された時に，ruffのFormat, Lintを行うように設定しています．pre-commitでもruffのFormat, Lintを行うように設定していますが，ローカル環境での開発時はpre-commitは手動でインストールを行う必要があるため，Format, Lintの実行漏れがないようにGitHub Actionsでも実行するようにしています．

GitHub Actionsの設定は，`.github/workflows`ディレクトリに配置します．
以下が本テンプレートで使用しているGitHub Actionsの設定例です．

```yaml
name: CI
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install uv
        uses: astral-sh/setup-uv@v4

      - name: Format
        run: uvx ruff format . --check --diff

      - name: Lint
        run: uvx ruff check --output-format=github .
```

この設定では，`main`ブランチにコミットがpushされた時や，
`main`ブランチに対してプルリクエストが発行された時に，
ruffのFormat, Lintを行うように設定しています．

### AI rules: ルール定義によるCursor, Claude Codeの適切なAI開発支援

https://docs.anthropic.com/ja/docs/claude-code/overview

https://docs.cursor.com/context/rules

本テンプレートではClaude CodeやCursorを使用する際に，プロジェクトの開発ルールを定義して，適切なAI開発支援が受けられるようにしています．Claude Codeを使う際には`CLAUDE.md`ファイルにルールを定義し，Cursorを使う際には`.cursor/rules`以下にルールを定義します．
以下の記事を参考に，できるだけシンプルなルール定義を行っています．

https://zenn.dev/yareyare/articles/d67aa75b37537c

## 利用例

### PyTorchを使ったモデル開発の場合(CUDA対応)

PyTorchを使ったモデル開発の場合，torchのパッケージ追加は以下のように`pyproject.toml`に記述します．

```toml
[project]
name = "project"
version = "0.1.0"
requires-python = ">=3.12.0"
dependencies = [
  "torch>=2.7.0",
]

[tool.uv.sources]
torch = [
    { index = "torch-cuda", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'" },
    { index = "torch-cpu", marker = "sys_platform == 'darwin' or (sys_platform == 'linux' and platform_machine == 'aarch64')" },
]

[[tool.uv.index]]
name = "pytorch-cpu"
url = "https://download.pytorch.org/whl/cpu"
explicit = true

[[tool.uv.index]]
name = "pytorch-cuda"
url = "https://download.pytorch.org/whl/cu128"
explicit = true
```

上記のように記述することで，x86_64のLinuxではCUDAを使ったPyTorchをインストールし，それ以外の環境(macOSやmacOS上のdevcontainer, arm Linux)ではCPUを使ったPyTorchをインストールすることができます．
さらに，DockerのビルダーイメージをCUDAを使ったイメージにすることで，ビルドにCUDAが必要なパッケージのインストールを行うことができます．

```bash
BUILDER_IMAGE="nvcr.io/nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04"
RUNNER_IMAGE="ubuntu:24.04"
IMAGE_NAME=$(basename $(pwd) | tr '[:upper:]' '[:lower:]')

docker build \
    --build-arg BUILDER_IMAGE=${BUILDER_IMAGE} \
    --build-arg RUNNER_IMAGE=${RUNNER_IMAGE} \
    -t "${IMAGE_NAME}:latest" \
    -f docker/Dockerfile .
```

また，ランナーイメージにはCUDAの入っていないイメージを使用することで，Docker Imageの軽量化ができます．
なお，PyTorchインストール時にはbuiltinのCUDAが入るため，PyTorchを使用する分にはイメージにCUDAが必要ないことに注意してください．

参考:
https://zenn.dev/turing_motors/articles/3a434d046bbf48

学習・推論などのスクリプトを実行する際には，以下のように[docker/run.sh](https://github.com/mjun0812/python-project-template/blob/main/docker/run.sh)をつけて，コンテナ環境で実行します．

```bash
./docker/run.sh python train.py
```

上記のスクリプトを使って実行することで，ホストとコンテナ内のユーザーを揃えることができるので，学習後のモデルの重みやログをホストでも権限の問題なく操作することができます．

### 静的型チェッカーmypyを追加する場合

本テンプレートに静的型チェッカーのmypyを追加する場合は，まず，uvでmypyをインストールします．

```bash
uv add --dev mypy
```

pre-commitでmypyを実行するように設定します．

```yaml
- repo: https://github.com/pre-commit/mirrors-mypy
  rev: v1.16.0
  hooks:
    - id: mypy
      args: [--ignore-missing-imports]
```

GitHub Actionsでmypyを実行するように設定します．

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install uv
        uses: astral-sh/setup-uv@v4

      - name: Format
        run: uvx ruff format . --check --diff

      - name: Lint
        run: uvx ruff check --output-format=github .
      
      - name: Type check
        run: uvx mypy . --ignore-missing-imports --no-namespace-packages
```

### Jupyter Notebookを使う場合

Jupyter Notebookを使う場合は，まず，uvでJupyterをインストールします．

```bash
uv add jupyter
```

Jupyter Notebookを実行するには，以下のコマンドを実行します．

```bash
uv run jupyter notebook --no-browser
```

Jupyter Notebookは書き捨てで書くことが多いので，ruffのLintを行わない場合は以下のように`pyproject.toml`に記述します．

```toml
[tool.ruff]
exclude = ["*.ipynb"]
```

## まとめ

以上，今回作成したテンプレートと，そこで使用しているツールの解説を行いました．
プロジェクトでどのようなツールを採用するかは，その時々によると思いますので，このテンプレートを参考に，自分のプロジェクトに合わせてツールを選定してください．
この記事が参考になれば幸いです！

## 参考

https://cyberagentailab.github.io/BestPracticesForPythonCoding/

https://future-architect.github.io/articles/20240726a/

https://containers.dev/implementors/json_reference/

https://zenn.dev/voluntas/scraps/07ab8f2e17c44f

https://docs.astral.sh/uv/guides/integration/pytorch/

https://zenn.dev/turing_motors/articles/594fbef42a36ee

https://github.com/pre-commit/mirrors-mypy

https://qiita.com/yitakura731/items/36a2ba117ccbc8792aa7

https://qiita.com/yohm/items/047b2e68d008ebb0f001
