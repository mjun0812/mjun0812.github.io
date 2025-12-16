---
title: "GitHub Callouts テスト"
tags:
  - test
category: test
date: 2025-12-16
update: 2025-12-16
---

このページはGitHub Flavored Markdownのcallouts（alerts）機能のテストページです。

## 基本的なCallouts

### Note

> [!NOTE]
> 有用な情報をユーザーに強調表示します。

### Tip

> [!TIP]
> ユーザーがより良い結果を得るのに役立つヒントです。

### Important

> [!IMPORTANT]
> ユーザーが成功するために重要な情報です。

### Warning

> [!WARNING]
> 潜在的なリスクについてユーザーに警告する緊急情報です。

### Caution

> [!CAUTION]
> 特定のアクションの負の潜在的な結果についてユーザーに助言します。

## 複数行のテスト

> [!NOTE]
> これは複数行のcalloutです。
>
> - リスト項目1
> - リスト項目2
> - リスト項目3
>
> **太字**や*斜体*も使えます。
>
> `インラインコード`も表示できます。

## コードブロックを含むCallout

> [!TIP]
> 以下のようにPythonコードを実行できます：
>
> ```python
> def hello_world():
>     print("Hello, World!")
>
> hello_world()
> ```

## 長い説明のCallout

> [!IMPORTANT]
> この実装では`remark-github-alerts`パッケージを使用しています。
> このパッケージはGitHub標準のcallouts構文に完全準拠しており、以下の5つのタイプをサポートしています：
>
> 1. **NOTE** - 一般的な情報や注釈
> 2. **TIP** - 便利なヒントや推奨事項
> 3. **IMPORTANT** - 重要な情報
> 4. **WARNING** - 警告や注意が必要な情報
> 5. **CAUTION** - 危険性を伴う操作についての警告
>
> スタイルはライトモード・ダークモードの両方に対応しています。

## ネストされたCallout

> [!WARNING]
> 複雑なネスト構造は推奨されませんが、以下のように複数のcalloutを連続して配置できます。

> [!TIP]
> calloutの直後に別のcalloutを配置することで、関連する情報をグループ化できます。

## 既存のBlockquoteとの互換性

通常のblockquoteは引き続き正常に動作します：

> これは通常の引用文です。
> `> [!TYPE]`構文を使わない場合は、従来通りのblockquoteとして表示されます。

## まとめ

GitHub Calloutsは以下の用途に最適です：

- ドキュメントの重要な情報を強調
- チュートリアルでのヒントや警告の表示
- API仕様での注意事項の明示
- ベストプラクティスの推奨事項

> [!NOTE]
> この機能を使用するには、Markdownファイル内で`> [!TYPE]`の形式で記述するだけです。
