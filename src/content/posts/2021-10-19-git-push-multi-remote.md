---
title: git pushで複数の場所にpushする
tags: [git]
category: Git
date: 2021-10-19
update: 2021-10-19
---

いつも忘れてしまうのでメモ。  
自宅サーバでGitLabを動かしてたり、サーバー内にもリモートリポジトリを置きたい等の理由から、
Github以外にもリモートリポジトリを持ちたいという場合は多い。  
その際、いちいちpush先を選択してそれぞれpushしていくのは手間なので、
一度のgit pushで複数のリモートリポジトリにpushできるようにする。

```bash
# まずはpush, fetch先の登録
git remote add origin git@github.com:hoge/hoge.git
git remote set-url --add origin git@gitlab.com:fuga/fuga.git

git remote -v

origin  git@github.com:hoge/hoge.git (fetch)
origin  git@github.com:hoge/hoge.git (push)
origin  git@gitlab.com:huga/huga.git (push)
```

これでgit pushすれば1回で複数のリモートリポジトリにpushできる。

リスク分散は大事。

