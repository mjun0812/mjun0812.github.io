---
title: 本サイトをGatsby.jsからAstroに移行した
tags: [Gatsby, Astro, Javascript]
category: Web
date: 2024-01-13
update: 2024-01-13
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

こんにちは．今回は本サイトのフレームワークをGatsby.jsからAstroに変更したことについて，お話しします．

## 変更理由

元々このサイトは静的サイトジェネレーターのGataby.jsというフレームワークで作成していました．
しかし，Gatsby.jsはシンプルなサイト構成であっても，追加で入れるべきプラグインが多いため，久しぶりにいじろうとするとプラグインのアップデートや依存関係解決を行わなければならない場面がかなり多く，大変な面がありました．

そこで，公式で様々な機能のサポートが手厚いAstroを選ぶことにしました．AstroはReact, Vue, Svelteのコンポーネントも利用可能なため，移行や組み合わせも簡単そう見えました．

具体的には，`package.json`の依存パッケージの数が以下のように減りました．

- Gatsby.js時代

```json
"dependencies": {
  "gatsby": "^5.7.0",
  "gatsby-awesome-pagination": "^0.3.8",
  "gatsby-plugin-feed": "^5.7.0",
  "gatsby-plugin-google-tagmanager": "^5.7.0",
  "gatsby-plugin-image": "^3.7.0",
  "gatsby-plugin-sass": "^6.7.0",
  "gatsby-plugin-sharp": "^5.7.0",
  "gatsby-plugin-sitemap": "^6.7.0",
  "gatsby-remark-amazon-link": "^1.0.0",
  "gatsby-remark-autolink-headers": "^6.7.0",
  "gatsby-remark-images": "^7.7.0",
  "gatsby-remark-link-beautify": "^2.2.1",
  "gatsby-remark-prismjs": "^7.7.0",
  "gatsby-remark-responsive-iframe": "^6.7.0",
  "gatsby-source-filesystem": "^5.7.0",
  "gatsby-transformer-remark": "^6.7.0-next",
  "gatsby-transformer-sharp": "^5.7.0",
  "prismjs": "^1.23.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "sass": "^1.50.0",
  "sharp": "^0.31.3"
},
"devDependencies": {
  "gatsby-cli": "^5.12.2",
  "gh-pages": "^5.0.0",
  "prettier": "2.8.4"
},
```

- Astroに変えた場合

```json
"dependencies": {
  "@astrojs/partytown": "^2.0.3",
  "@astrojs/rss": "^4.0.1",
  "@astrojs/sitemap": "^3.0.4",
  "astro": "^4.0.9",
  "astro-icon": "^1.0.2",
  "remark-link-card": "^1.3.1",
  "sharp": "^0.33.1"
},
"devDependencies": {
  "@iconify-json/mdi": "^1.1.64",
  "@iconify-json/simple-icons": "^1.1.86",
  "sass": "^1.69.7"
}
```

半分以下に減っています．

## 移行してみての感想

このサイトは元々，cssフレームワークを使用せずにスクラッチでcssを書いていたため，非常に移行しやすかったです．これは今後も続けたいと思っています．

- 依存パッケージを大幅に減らせた  
上記でも説明した通り，半分以下に減らせています．Astroではフレームワーク自体にMarkdownをhtmlに変換するremark, shikiによるsyntax highlightが備わっていたり，Pagination, 画像最適化と言った機能が搭載されているほか，rssやsitemapと言ったSEO周りも少ない記述で導入できるためとても助かりました．

- GraphQLではなく相対パス(ファイルベース)で要素を扱えるようになった  
Gatsby.jsでは画像を扱うにあたっても，GraphQLを通さなければならなかったりして，かなり使いづらいなと思っていたのですが，Astroでは相対パスで扱えるようになったので，非常に分かりやすくなりました．

- 単純にパフォーマンスが良い  
これは開発サーバを建てるときやビルド時に感じるのですが，Gatsbyよりも大幅に高速化しているように感じます．サイト自体のパフォーマンスも向上しているように感じます．

- Svelteっぽい書き方  
以前使用していたGatsbyはReactベースだったため，JSXなどの特別な記法が必要でしたが，AstroではSvelteに似たように，ファイルの上部にスクリプトを書いて，下部にはhtml,cssを書けば良いので非常に基本的な文法のみで書くことができます．

## まとめ

今回のAstroへの移行は簡単にできて，依存パッケージやファイル数も削減できてシンプルになったので，非常に満足しています．

このブログのソースコードは以下に公開しています．

<https://github.com/mjun0812/mjun0812.github.io>
