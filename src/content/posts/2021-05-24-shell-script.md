---
title: "Shell Script"
tags: [shellscript]
category: shellscript
update: 2021-05-24
date: 2021-05-24
---

本稿ではshellscriptについて基本的なことを書く。

## Shell Scriptの1行目

```bash
#!/bin/sh

pythonは
#!/usr/bin/env python
```

この一行目はシバン(shebang) [[1][1]] という。`#![インタプリタのパス] [インタプリタの引数]`で指定する。

## if文の書き方

```bash
if [ -f file ]
then
  echo 'fileが存在します'
fi

if [ -f file ]; then
  echo 'fileが存在します'
fi

if [ -f file ]; then echo 'ファイルが存在します'; fi
```

then, fiの前には終端記号のコロン(;)か改行が必要。

## パイプ( | ), リスト( ; )

パイプラインは複数のコマンドをパイプ(|)でつなげたもの。コマンドの標準出力を別のコマンドの標準出力に接続させる。
リストは1つ以上のパイプラインを、改行・;・&・&&・||で区切って並べたもの。
&の前はバックグラウンドで動作する。

## && と ||

&&はAND処理、||はOR処理であるが、Shellscript(C言語)のシステム上、左から順にコマンドが実行される。  
&&の場合は左のコマンドが偽であった場合は右のコマンドは実行されない。  
||の場合は左のコマンドが真であった場合は右のコマンドが実行されない。  
この挙動を利用して、簡単な条件分岐が行える。
&&では左のコマンドが真のときのみ右のコマンドを行う。||では左のコマンドが偽のときに右のコマンドを行う。
といったように使用できる。

## if文

基本形は以下の通り。

```bash
if [ "$i" -eq 3 ]; then
  echo 'i=3'
elif [ "$i" -eq 4 ]; then
  echo 'i=4'
else
  echo 'i!=3,4'
fi
```

testコマンド（上記だと[ ]で書かれている）を用いない場合は以下の通り

```bash
if cmp -s file1 file2; then # -sオプションでメッセージなし
  echo 'file1==file2'
else
  echo 'file1!=file2'
fi

#または

cmp -s file1 file2
if [ $? -eq 0 ]; then
  echo 'file1==file2'
fi
```

2つ目の書き方は、if文の記法をtest([])に揃えるためのもの。`$?`で実行ステータスを確認できるため、それを利用している。

否定条件も使える。

```bash
if [ ! "$i" -eq 3 ]; then
 echo 'i!=3'
fi
```

ifと[の間にはスペースが必要。

## case文

基本形は以下の通り。

```bash
case `uname -s` in
  Linux|FreeBSD)
    echo 'this OS is Linux or FreeBSD'
    ;;
  *)
    echo 'other OS'
    ;;
esac
```

if文で毎回コマンド実行するよりはこっちのほうが簡潔に書けたりする。

## for文

基本形は以下の通り。

```bash
for file in memo.txt prog.txt fig1.png
do 
  cp -p "$file" "$file".bak
done

memo.txt.bak
prog.txt.bak
fig1.png.bak
```

`for file in *`のようにすると、カレントディレクトリの全てのファイルが引数fileに代入される。
`` for file in `< filelist` ``のようにするとファイルから入力を行える。

```txt
# filelist
memo.txt
prog.txt
fig1.png
```

他の言語と同じように`continue, break`が使える。

算術式を用いる場合は以下の通り。

```bash
sum=0
for ((i=1; i <= 100; i++)) {
  ((sum += i))
}
```

## while文

基本の文は以下の通り。

```bash
i=0
sum=0
while [ "$i" -le 100 ]; do
  sum=`expr "$sum" + "$i"`
  i=`expr "$i" + 1`
done
```

bashの場合は`` `expr "$i" + 1` ``の代わりに`((i++))`が使える。

無限ループにする場合は

```bash
while :
do
  echo "a"
done
```

のようにセミコロン(:)を用いる。

## select文

選択メニューを表示して、応答を受け付ける事ができる。

```bash
PS3='コマンド?'
select cmd in up down left right quit
do
  case $cmd in
    up)
      echo 'up';;
    down)
      echo 'down';;
    left)
      echo 'left';;
    right)
      echo 'right';;
    quit)
      break;;
    *)
      echo "$REPLAY"'は選択不可';;
  esac
done
```

selectの要素に連番をつけたメニューとPS3を出力する。
上のコードの結果は以下のようになる。

```txt
1) up      2) down    3) left    4) right   5) quit
コマンド?1
up
コマンド?2
down
コマンド?5
```

## サブシェルとグループコマンド

サブシェルでは別のシェルで、グループコマンドは現在のシェルで一連のコマンドを行う。
使用例は以下。

```bash
# サブシェル
(
  cd /hoge/etc
  cp -p aaa ../
) > log

#グループコマンド
{
  uname -a
  date
  who
} > log
```

## 関数

基本文は以下。

```bash
func()
{
  echo "Hello World!"
}

func
```

関数内で引数を用いるには、呼び出し時に以下のようにする。[[3][3]]

```bash
func() {
  echo "$1"
}

func "test"
```

## 配列

```bash
array[3]='three'
echo "${array[3]}"
# three
array2=(one two three)
echo "${array2[@]}"
# one two three
unset 'array2[1]'
echo "${array2[@]}"
# one three
```

関数の最初の{の後にはスペースか改行が必要。
`func(){ echo Hello;}`

## 算術式の評価(())と条件式の評価[[]]

bashにて実装された機能。  
算術式の評価では中にC言語Likeな算術を書ける。
条件式の評価では`<>,(),&&,||`をクォートする必要がない。

```bash
((i++))

[ a -a b ]
[[ a && b ]]
[ a -o b ]
[[ a || b ]]

```

testコマンドとの違い[[2][2]]

条件式|test|[[]]
-|-|-
AND|a -a b|a && b
OR|a -o b|a || b
文字列比較| 文字列a == 文字列b|文字列a == パターンb

## シェル変数の代入と参照

```bash
a='hello world'
echo "$a"
echo "${a}"
```

シングルクォートとダブルクォートの使い分けに気をつける。シングルなら展開無しでそのまま代入される。

## 位置パラメータ

シェルスクリプトのの引数を参照できる。

```bash
$ ./aaa.sh a b c d
echo "$1"
# a
echo "$0"
# ./aaa.sh

set Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
echo "${10}"
# Oct
```

## 特殊パラメータ

パラメータ|内容
-|-
$0|起動されたシェルスクリプト名
$1~9|それぞれの引数(arg1~9)
$@|引数全てのリスト
$*|引数全てを連結して参照する
$#|引数の数を表示する($0は含まれない)
$?|終了コードを参照する
$!|最後にバックグラウンドで実行したプロセスID
\$$|シェル自身のプロセスID
$-|現在のシェルのオプションフラグ
$_|直前に実行したコマンドの最後の引数

## パラメータ展開

### パラメータのデフォルト値

```bash
cp file "${1:-/tmp}"
cp file "${1-/tmp}"
```

上の例の場合は引数1が設定されていないか、空文字のときに`/tmp`が展開され、下の場合には設定されてない場合のみ`/tmp`が展開される。
空文字を無視するかしないかで判断する。

### パラメータへデフォルト値を代入

```bash
cp file "${DIST:=/tmp}"
cp file "${DIST=/tmp}"
```

前述のものと違い、代入してから展開する。

### パラメータ未設定時にエラーを出力

```bash
cp "${1:?error!}" ./
cp "${1?error!}" ./
```

パラメータが設定されていなければ、?の後に記述したメッセージが表示されてスクリプトが終了する。

### パラメータの長さ

```bash
echo ${#test}
```

パラメータの文字列の長さを返す。  
スクリプトで使わなくても、コマンド`cat text | wc -c`でも代用できる。

### パラメータからパターンを削除

```bash
echo "${DIR#*/}"
echo "${DIR##*/}"
```

`${パラメータ#パターン}`のように使う。#が1つだと最短の部分が、#が2つだと最長の部分が左から取り除かれる。

\#を%に変更すると右側から取り除かれる。

### 文字列の一部を抜粋

```bash
${パラメータ:オフセット:長さ}
```

オフセットで戦闘から何文字削除するか、長さで削除した文字列のうち先頭の何文字を表示するか決定する。

### パラメータの置換

```bash
${パラメータ/パターン/置換文字列}
${パラメータ//パターン/置換文字列}
```

`/`が1つだと先頭の1つを置換する。2つだと全て置換する。

## 文字列の囲み方

シングルクォート`' '`では文字列がそのまま表示される。ダブルクオート`" "`ではパラメータ展開とコマンド置換が行われる。
バッククォート`` ` ` ``では囲んだ部分でのコマンドの標準入力で置換が行われる。`$( )`はバッククォートと同じことを書き方を変えて行える。

```bash
a='hello'
echo '${a}'
# ${a}
echo "${a}"
# hello
echo "`pwd`"
# /home/user
echo "$(pwd)"
# /home/user
```

## リダイレクト

### 入力

```bash
cat < file
```

### 出力

```bash
cat 'Hello World' > log
```

### 追記

```bash
date >> log
```

### エラー出力

```bash
rm -rf non-exist 2> /dev/null # エラーメッセージを出さずに削除
```

### ヒアドキュメント

```bash
cat << 'EOF'
abcde
abcde
EOF
```

終了文字列(上記だとEOF)がシングルクォートされてると変数展開等は行われない。

### ヒアストリング

基本的にはヒアストリングと一緒。終了文字列を書かなくて良い。

```bash
cat <<< 'abcde
abcde'
```

## よく使うコマンド

### expr

数値計算を行う。

```bash
expr 3 + 5
# 8
```

### basename

ファイル名のみを出力する。

```bash
basename /home/user/test.txt
# test.txt
basename /home/user/test.txt .txt
# test
```

### dirname

ディレクトリ名を表示する。

```bash
dirname /home/user/test.txt
# /home/user
dirname test.txt
# .
```

### wc

ファイルの行数、文字数、サイズを表示できる。

```bash
wc -lwc test.txt
# row
# words
# size
```

### sed

ファイルの中の文字列を置き換える。

```bash
echo 'aaaaccccaaaa' > old.txt

sed 's/aaaa/b/' old.txt
# bccccaaaa
sed 's/aaaa/b/g' old.txt
# bccccb
```

## 参考

### 文献

\[1]: <https://qiita.com/nafuka/items/c97bfd2a4ca26e70e722>  
[1]:https://qiita.com/nafuka/items/c97bfd2a4ca26e70e722
\[2]: <https://qiita.com/kiyodori/items/e9fabcba03fc1e76dbdd>
[2]: https://qiita.com/kiyodori/items/e9fabcba03fc1e76dbdd
\[3]: <https://qiita.com/kaw/items/034bc4221c4526fe8866>
[3]: https://qiita.com/kaw/items/034bc4221c4526fe8866

### 書籍

[[改訂第3版]シェルスクリプト基本リファレンス ──#!/bin/shで、ここまでできる (WEB+DB PRESS plus)](https://amzn.to/3vkzkgM)
