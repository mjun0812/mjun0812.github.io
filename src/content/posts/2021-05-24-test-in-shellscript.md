---
title: "Shell Scriptで使う条件分岐 test"
tags: [shellscript]
category: shellscript
update: 2021-05-24
date: 2021-05-24
---

本稿ではShell Scriptで条件分岐に用いられる、testコマンドについて書く。
どのような条件分岐が可能であるかを、testコマンドのオプションをベースに列挙する。
シェルスクリプトでの利用を想定しているため、`[ ]`での記述を行う。

条件|内容
-|-
-a file|ファイルが存在すればtrue
-d file|ファイルがディレクトリならtrue
-e file|ファイルが存在すればtrue
-f file|ファイルが通常ファイルならtrue
-h file|ファイルがシンボリックリンクならtrue
-r file|ファイルが読み込み可能ならtrue
-s file|ファイルサイズが0より大きければtrue
-w file|ファイルが書き込み可能ならtrue
-x file|ファイルが実行可能ならtrue
a -nt b|aがbより更新日時が新しければtrue
a -ot b|aがbより更新日時が古ければtrue
-z str|strが空文字ならtrue
-n str|strが空文字でないならtrue
str1 = str2|str1,str2が同じならtrue
str1 == str2|str1,str2が同じならtrue
str1 != str2|str1,str2が異なるならtrue
str1 < str2|str1がstr2よりも辞書順で前ならtrue
str1 > str2|str1がstr2よりも辞書順で後ならtrue
a -eq b|a,bの数字が等しければtrue
a -ne b|a,bの数字が等しくなければtrue
a -lt b|aがb以下ならtrue
a -le b|aがb未満ならtrue
a -gt b|aがbより大きければtrue
a -ge b|aがb以上ならtrue

## 参考

### 書籍

[[改訂第3版]シェルスクリプト基本リファレンス ──#!/bin/shで、ここまでできる (WEB+DB PRESS plus)](https://amzn.to/3vkzkgM)