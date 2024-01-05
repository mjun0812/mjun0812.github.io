---
title: Shell Scriptでオプション解析をする getopts
tags: [shellscript]
category: shellscript
date: 2021-06-02
update: 2021-06-02
---

こんにちは。今回もShellScript絡みです。  
本稿ではShell Scriptでオプション引数を扱うgetoptについてメモします。  
Pythonだとargparseですね。

## getoptとgetopts

Shell Scriptでオプション引数を扱うにはgetoptとgetoptsの2つの方法がある。  
getoptは外部コマンドでgetoptsはbash組み込みのコマンドです。  
getoptはBSD(macOS)とGNU(Linux)で挙動が異なるため、汎用性を考えたときにはgetoptsを使ったほうが良い。[[1][1]]

## Usage

というわけで本稿ではgetoptsに絞ってオプション引数の扱い方を見ていきます。  
早速ですが使い方は以下のようになります。[[2][2]]

```bash
while getopts abc OPT
do
  case $OPT in
     a) echo "use -a option";;
     b) echo "use -b option";;
     c) echo "use -c option";;
  esac
done
```

上記のスクリプトの実行結果は以下です。

```bash
./a.sh

./a.sh -a
# use -a option

./a.sh -b
# use -b option

./a.sh -d
#./a.sh: illegal option -- d
```

上記のスクリプトですが、エラーメッセージを表示させない場合は

```bash
- while getopts abc OPT

+ while getopts :abc OPT
```

に変更すればErrorメッセージが表示されません。

オプションに追加して引数を受け入れる場合は以下のように、オプション文字の後に`:`を追加します。

```bash
while getopts a: OPT
do
  case $OPT in
     a) echo "use -a option and input $OPTARG";;
  esac
done
```

これを実行すると、

```bash
./a.sh -a aaa
# use -a option and input aaa
```

となります。

## 参考

### 文献

\[1]: <https://takuya-1st.hatenablog.jp/entry/2015/12/24/234238>  
[1]:https://takuya-1st.hatenablog.jp/entry/2015/12/24/234238
\[2]: <https://www.atmarkit.co.jp/ait/articles/2002/13/news025.html>  
[2]:https://www.atmarkit.co.jp/ait/articles/2002/13/news025.html
