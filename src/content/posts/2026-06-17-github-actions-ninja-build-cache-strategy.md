---
title: "GitHub ActionsでGitHub-hosted Runnerの限界を超えてCUDAのNinja Buildを通す方法"
tags:
  - GitHub Actions
  - CI/CD
  - PyTorch
  - CUDA
  - GitHub
  - Ninja
category: GitHub Actions
date: 2026-06-17
update: 2026-06-17
# For Zenn
emoji: "🙂‍↕️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics:
  - "githubactions"
  - "cicd"
  - "pytorch"
  - "cuda"
  - "github"
published: true
---

こんにちは。今回は、GitHub ActionsでGitHub-hosted Runnerの6時間の実行時間の限界を超えてCUDAのNinja Buildを通す方法について説明します。
まずは、この方法が必要になった背景と、GitHub-hosted Runnerの制限、Ninja Buildのキャッシュの仕組みについて説明し、その上で、どのようにして長時間のビルドをGitHub Actionsで成功させたかについて説明します。

> [!WARNING]
> この記事は、GitHub Actionsをどうしても長時間走らせる必要がある人向けの記事となります。
> [こちら](https://github.blog/jp/2025-12-18-simpler-pricing-and-a-better-experience-for-github-actions/)にあるように、インフラサービスの維持のために、PublicのRepositoryであっても、GitHub hosted Runnerへの課金が検討されています。
> インフラに負荷をかけないためにも、長時間のジョブを回す前に、無駄な処理を減らすなどしましょう。

## 背景

私のGitHubのリポジトリの1つに[mjun0812/flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels)というリポジトリがあります。

https://github.com/mjun0812/flash-attention-prebuild-wheels

flash-attentionは、TransformerのAttention機構を高速化するためのCUDAカーネルを提供するライブラリで、多くのLLMや画像生成モデルで利用されています。

しかし、このライブラリは、Python, PyTorch, CUDAのバージョンやWindows/Linux、x86/arm64などのプラットフォームの組み合わせごとにビルドする必要があります。さらに、CUDAカーネルをビルドするため、非常にリソースと時間がかかります。

そこで、私のリポジトリである[mjun0812/flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels)では、GitHub Actionsを利用して、複数のプラットフォーム向けのwheelファイルをビルドして配布しています。
これによって、ユーザーは自分の環境に合ったwheelファイルをダウンロードしてインストールするだけで、flash-attentionを利用できるようになり、苦痛と時間を伴うビルドプロセスを回避できます。

https://x.com/mjun0812/status/1850706663982137615?s=20

非常にニッチな問題を解決するためのリポジトリですが、2026/6/10時点で1.5kのスターと700万以上のダウンロードがあり、多くのユーザーに利用されています。

## 課題: GitHub-hosted Runnerの6時間制限

flash-attentionは、多くの人がビルド時間に苦しんでいるライブラリです。
当然、それをGitHub Actionsでビルドするのにも非常に時間がかかります。

長時間かかるとしても、1度でもビルドに成功すれば、その後の時間を大幅に短縮できるので、なんとか成功させたいところです。
しかし、あまり知られていないことですが、GitHub Actionsには以下の実行時間の上限があります。

| Runnerの種類         | 動作                  | 上限 |
| -------------------- | --------------------- | -------------- |
| GitHub-hosted Runner | Workflow全体時間      | 6時間          |
| Self-hosted Runner   | Workflow全体時間      | 5日            |
| Self-hosted Runner   | Job Queueでの待ち時間 | 24時間         |

そのため、上記の実行時間以内にビルドを完了させる必要があります。
self-hosted Runnerを利用すれば、実質24時間まで実行できます。しかし、ビルドする環境のうち、特にARM64 Linux環境を自前で用意するのは非常に困難です。
そして、長時間のビルドを大量に行うことになるため、外部のCIサービスを利用するのもコスト的に厳しいです。
そのため、GitHub-hosted Runnerの6時間の上限を超えてビルドを成功させる方法を考える必要がありました。

そこで今回は、GitHub Actionsの[actions/cache](https://github.com/actions/cache)機能を利用して、ビルドの途中経過を保存し、6時間の上限に達したら一旦ビルドを止めて、次のrunで保存した途中経過からビルドを再開するという戦略を採用しました。
この戦略により、ビルドの途中経過を保存して次のrunで再開することができるため、6時間の上限を超えてビルドを成功させることができます。
概念は簡単ですが、実際にはいくつかのハマりどころがありましたので、以下にその詳細を説明します。

## 解決策: actions/cacheを利用したNinja Buildのキャッシュ戦略

今回の解決策は、一言でいうと **「6時間になる前に自分でビルドを止め、Ninjaのbuild directoryをキャッシュに保存し、rerunで続きをビルドする」** というものです。

GitHub-hosted Runnerでは、6時間を超えるとjobが強制的に終了します。この終了はかなり容赦がなく、後続stepでキャッシュを保存する余地がありません。
そのため、6時間ぎりぎりまで走らせるのではなく、あえて少し手前の **5時間45分** で `timeout` によってビルドを終了させます。
そして、その時点までに生成されたbuild directoryを `actions/cache/save` で保存します。
次に同じworkflowをrerunすると、`actions/cache/restore` によって前回のbuild directoryが復元されます。
これにより、1つのGitHub-hosted Runnerの6時間制限を超えるようなビルドでも、複数回のattemptに分割して完走できるようになります。

### Ninja Buildのキャッシュの仕組みと落とし穴

flash-attentionのビルドは、C++/CUDAのコンパイルを伴うため、ビルドシステムとしてNinja Build Systemを利用しています。

Ninjaは、ビルドの高速化のために、ビルドの途中経過を`.ninja_deps`というバイナリファイルに保存しており、途中でビルドが止まってしまったり、ソースコードを再度編集したときには、この.ninja_depsの情報をもとに、必要なファイルだけを再コンパイルすることで、ビルド時間を短縮しています。
そのため、この`.ninja_deps`と`.o`ファイルを`actions/cache`で保存して、次のrunで復元することで、ビルドの途中経過を保存して再開することができます。

ここまで聞くと、`.o` ファイルと `.ninja_deps` をキャッシュすれば終わりに見えるかもしれません。
しかし、ここには大きな落とし穴があります。
Ninjaは単に「`.o` ファイルが存在するか」だけを見ているわけではありません。
Ninjaは `.ninja_deps` というバイナリファイルに、`.o`ファイルと依存するヘッダーファイルの最終更新日時(mtime)をナノ秒精度で記録しています。
そして、次回ビルド時に以下のような条件を見て、そのtargetを再ビルドするかどうかを判定します。

- output fileが存在するか
- output fileがinput fileより新しいか
- `.ninja_deps` に記録された最終更新日時と、実ファイルの最終更新日時が一致するか
- depfileに記録された依存関係が現在のbuild graphと整合しているか

このため、attemptをまたいでbuild directoryを復元すると、最終更新日時の微妙なズレだけでNinjaが「output fileが古い」と判断して、全てを再ビルドしてしまう可能性があります。
この点について、GitHub Actionsで正しくNinja Buildのキャッシュを利用するためには、以下のような3つのハマりどころがありました。

### ハマりどころ1: tarでmtimeのnanosecond精度が落ちる

Ninjaの `.ninja_deps` は最終更新時刻をnanosecond精度で記録します。一方で、`actions/cache` の内部ではキャッシュをtar archiveとして保存します。
このとき、ファイルシステム上では

```text
1234567890.123456789
```

のようなnanosecond精度の最終更新時刻を持っていたファイルが、restore後には

```text
1234567890.000000000
```

のように秒精度へ丸められることがあります。
すると、`.ninja_deps` の中には `1234567890.123456789` と記録されているのに、実際の `.o` ファイルは `1234567890.000000000` になります。
この時点でNinjaから見ると最終更新時刻が一致しません。
その結果、復元した `.o` ファイルが存在していても、Ninjaはそれを信用せず、再ビルドしてしまいます。

これを避けるため、キャッシュ保存前にbuild directory配下の全ファイルの最終更新時刻を整数秒に上書きしています。
さらに、`.ninja_deps` のbinary formatも直接書き換えて、記録されている最終更新時刻も同じく整数秒に丸めています。
これにより、キャッシュ restore後にNinjaが見る最終更新時刻と、`.ninja_deps` に記録された最終更新時刻が一致するようになります。

### ハマりどころ2: 毎回fresh installされるheaderが `.o` より新しくなる

GitHub-hosted Runnerでは、実行ごとに環境が作り直されます。
そのため、PyTorch、CUDA、flash-attention本体、CUTLASSなどのビルドに必要なファイルは毎回新しくインストール・配置されます。
つまり、restoreした `.o` ファイルよりも、依存headerの最終更新時刻の方が新しくなってしまいます。
Ninjaから見ると、これは

```text
input header > output object
```

という状態です。この場合、`.o` ファイルは古いと判断され、再ビルドされます。
実際には同じversionのPyTorch、CUDA、flash-attentionを使っているため内容は同じなのですが、最終更新時刻だけを見ると「headerが更新された」ように見えてしまいます。
これを避けるため、ビルドに必要なheader類の最終更新時刻を古い時刻に戻しています。

```bash
PAST=197001020000

find flash-attention -path flash-attention/hopper/build -prune \
                    -o -path flash-attention/csrc/cutlass -prune \
                    -o -type f -print 2>/dev/null \
  | xargs -r touch -t "$PAST" 2>/dev/null || true

find .venv/lib -path '*/site-packages/torch/include*' -type f \
  -exec touch -t "$PAST" {} + 2>/dev/null || true

sudo find /usr/local/cuda/include -type f \
  -exec touch -t "$PAST" {} + 2>/dev/null || true
```

ここで重要なのは、`.o` を新しくするのではなく、input側を古くすることです。
restore済みの `.o` の最終更新時刻はNinjaの記録と一致している必要があるため、`.o` 側は触りません。

### ハマりどころ3: `.ninja_deps` にheaderの最終更新時刻も入っている

さらに面倒なのは、`.ninja_deps` にはoutputの最終更新時刻だけでなく、ビルドに必要なPyTorchなどの依存headerの最終更新時刻の情報も入っていることです。

ビルドに必要なheaderの最終更新時刻を1970年に戻すと、今度は `.ninja_deps` に記録されているheaderの最終更新時刻と実際のheaderの最終更新時刻が一致しなくなります。
つまり、単にheaderを古くするだけでは、別の理由でNinjaがdirty判定してしまいます。
この問題に対しては、復元後に `.ninja_deps` をそのまま信用させるのではなく、Ninjaに状態を再同期させる必要があります。
今回の実装では、restore後にbuild directoryを戻したうえで、`ninja -t restat` を実行しています。

```bash
BUILD_TEMP=flash-attention/hopper/build/temp.linux-aarch64-cpython-312

if [ -f "$BUILD_TEMP/build.ninja" ]; then
  uv pip install --quiet ninja 2>/dev/null || true
  if command -v ninja >/dev/null; then
    (
      cd "$BUILD_TEMP" &&
      find . -name '*.o' -type f -printf '%P\n' |
        xargs -r -n 500 ninja -t restat
    ) 2>/dev/null || true
  fi
fi
```

これにより、restoreした `.o` ファイル群を再認識させ、不要な再ビルドを避けます。
以上のように、泥臭く最終更新日時を操作することで、CUDAの巨大なNinja buildをGitHub-hosted Runner上で継続することができるようになりました。

## 実際の実行例

それでは、実際にこの戦略を適用した例を見てみましょう。
まずは、キャッシュを使っていなかった場合です。

### Linux ARM64 GitHub-hosted Runnerでビルドした例

https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/26828098662

- 24 ジョブのうち 1 つが 6:00:16経過でcancel
- 周辺ジョブは 5h30m〜5h59m で完走、限界ギリギリでBuildが完了

先ほど述べた通り、GitHub-hosted Runnerでは実行時間が足りず、ビルドが途中で止まってしまいました。
次はビルドを成功させるために、ビルドキャッシュを設定していきます。

### Linux ARM64 GitHub-hosted Runnerでビルドした例 (キャッシュ戦略適用)

https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/27098881346

attempt 個別 URL:

- 実行1(失敗): https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/27098881346/attempts/1
  - 5:48:42 failure (5:45でビルドを打ち切って、キャッシュsave)
- 実行2(成功): https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/27098881346/attempts/2
  - 1:23:36 success (キャッシュ restore → 完走)

また、例としてLinux arm64であるraspberry pi 5 RAM 8GB上で同じビルドを走らせた例もあります。

### Raspberry Pi 5で17hかけてビルドした例

https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/24447352042

- [17:02:56] success — Linux ARM64 self-hosted FA3 build

Raspberry Pi 5でも一応ビルドすることもできますが、1台につき17時間もかかってしまい、24時間のjob queueの上限もあるため、複数のビルドをするには現実的ではありません。また、動作中はCPU使用率が100%近くになるため、ファンの音が非常にうるさくなります。

## まとめ

GitHub ActionsのGitHub-hosted Runnerには6時間の実行時間制限があります。
通常、これを超えるビルドはself-hosted Runnerに逃がす必要があります。しかし、Linux ARM64環境などを自前で用意するのは非常に困難です。

そこで、Ninjaのbuild directoryを `actions/cache` でattempt間に持ち越すことで、GitHub-hosted Runner上でも実質的に6時間を超えるCUDA buildを完走できました。
この戦略を採用するためには、Ninjaのキャッシュの仕組みを理解し、最終更新時刻のズレによる再ビルドを避けるために、ビルドファイルの最終更新時刻を操作するなどの細かい調整が必要でした。
この方法を採用することで、GitHub-hosted Runnerの制限を超えてビルドを成功させることができ、多数のユーザーに利用されているflash-attentionのwheelファイルを継続的にビルド・配布することができています。

かなりニッチな内容ですが、CUDA extensionや巨大なC++プロジェクトをGitHub Actionsでビルドしている場合には、同じ問題に遭遇することがあると思います。
今回紹介したキャッシュ戦略が、同じような問題に直面している人の参考になれば幸いです。
