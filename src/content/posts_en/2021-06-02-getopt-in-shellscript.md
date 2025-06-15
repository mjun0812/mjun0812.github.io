---
title: "Option Parsing in Shell Script with getopts"
tags: [shellscript]
category: shellscript
date: 2021-06-02
update: 2021-06-02
---

Hello. This is another Shell Script related post.
This article covers getopts for handling option arguments in shell scripts.
In Python, this would be argparse.

## getopt vs getopts

There are two ways to handle option arguments in shell scripts: getopt and getopts.
getopt is an external command while getopts is a bash built-in command.
Since getopt behaves differently between BSD (macOS) and GNU (Linux), it's better to use getopts for portability. [[1][1]]

## Usage

So this article focuses on getopts for handling option arguments.
The usage is as follows: [[2][2]]

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

The execution result of the above script is as follows:

```bash
./a.sh

./a.sh -a
# use -a option

./a.sh -b
# use -b option

./a.sh -d
#./a.sh: illegal option -- d
```

To suppress error messages in the above script:

```bash
- while getopts abc OPT

+ while getopts :abc OPT
```

Change to this format and error messages won't be displayed.

To accept arguments in addition to options, add `:` after the option character as follows:

```bash
while getopts a: OPT
do
  case $OPT in
     a) echo "use -a option and input $OPTARG";;
  esac
done
```

When executed:

```bash
./a.sh -a aaa
# use -a option and input aaa
```

## References

### Literature

\[1]: <https://takuya-1st.hatenablog.jp/entry/2015/12/24/234238>  
[1]:https://takuya-1st.hatenablog.jp/entry/2015/12/24/234238
\[2]: <https://www.atmarkit.co.jp/ait/articles/2002/13/news025.html>  
[2]:https://www.atmarkit.co.jp/ait/articles/2002/13/news025.html