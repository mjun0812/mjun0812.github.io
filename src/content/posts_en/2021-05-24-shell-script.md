---
title: "Shell Script"
tags: [shellscript]
category: shellscript
update: 2021-05-24
date: 2021-05-24
---

This article covers the basics of shell scripting.

## The First Line of Shell Scripts

```bash
#!/bin/sh

# For Python:
#!/usr/bin/env python
```

This first line is called a shebang [[1][1]]. It's specified as `#![interpreter path] [interpreter arguments]`.

## How to Write if Statements

```bash
if [ -f file ]
then
  echo 'file exists'
fi

if [ -f file ]; then
  echo 'file exists'
fi

if [ -f file ]; then echo 'file exists'; fi
```

A terminator semicolon (;) or newline is required before `then` and `fi`.

## Pipes ( | ) and Lists ( ; )

A pipeline connects multiple commands with pipes (|), connecting the standard output of one command to the standard input of another.
A list is one or more pipelines separated by newlines, ;, &, &&, or ||.
Commands before & run in the background.

## && and ||

&& is AND processing and || is OR processing, but in shell script (C language) systems, commands are executed from left to right.
With &&, if the left command is false, the right command is not executed.
With ||, if the left command is true, the right command is not executed.
This behavior can be used for simple conditional branching.
With &&, the right command is executed only when the left command is true. With ||, the right command is executed when the left command is false.

## if Statements

The basic form is as follows:

```bash
if [ "$i" -eq 3 ]; then
  echo 'i=3'
elif [ "$i" -eq 4 ]; then
  echo 'i=4'
else
  echo 'i!=3,4'
fi
```

When not using the test command (written as [ ] above), it's as follows:

```bash
if cmp -s file1 file2; then # -s option for no messages
  echo 'file1==file2'
else
  echo 'file1!=file2'
fi

# or

cmp -s file1 file2
if [ $? -eq 0 ]; then
  echo 'file1==file2'
fi
```

The second way of writing aligns the if statement notation with test ([]). Since you can check the execution status with `$?`, it utilizes that.

Negation conditions can also be used:

```bash
if [ ! "$i" -eq 3 ]; then
 echo 'i!=3'
fi
```

A space is required between `if` and `[`.

## case Statements

The basic form is as follows:

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

This can be written more concisely than executing commands every time with if statements.

## for Loops

The basic form is as follows:

```bash
for file in memo.txt prog.txt fig1.png
do 
  cp -p "$file" "$file".bak
done

memo.txt.bak
prog.txt.bak
fig1.png.bak
```

With `for file in *`, all files in the current directory are assigned to the argument `file`.
`` for file in `< filelist` `` allows input from a file.

```txt
# filelist
memo.txt
prog.txt
fig1.png
```

Like other languages, `continue` and `break` can be used.

For arithmetic expressions, use the following:

```bash
sum=0
for ((i=1; i <= 100; i++)) {
  ((sum += i))
}
```

## while Loops

The basic statement is as follows:

```bash
i=0
sum=0
while [ "$i" -le 100 ]; do
  sum=`expr "$sum" + "$i"`
  i=`expr "$i" + 1`
done
```

In bash, you can use `((i++))` instead of `` `expr "$i" + 1` ``.

For infinite loops:

```bash
while :
do
  echo "a"
done
```

Use a colon (:) like this.

## select Statements

You can display a selection menu and accept responses:

```bash
PS3='Command?'
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
      echo "$REPLAY"' is not selectable';;
  esac
done
```

Select outputs a menu with sequential numbers for select elements and PS3.
The result of the above code is as follows:

```txt
1) up      2) down    3) left    4) right   5) quit
Command?1
up
Command?2
down
Command?5
```

## Subshells and Group Commands

Subshells execute a series of commands in a separate shell, while group commands execute them in the current shell.
Usage examples are as follows:

```bash
# Subshell
(
  cd /hoge/etc
  cp -p aaa ../
) > log

# Group command
{
  uname -a
  date
  who
} > log
```

## Functions

The basic statement is as follows:

```bash
func()
{
  echo "Hello World!"
}

func
```

To use arguments within a function, call it as follows [[3][3]]:

```bash
func() {
  echo "$1"
}

func "test"
```

## Arrays

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

A space or newline is required after the first { in functions.
`func(){ echo Hello;}`

## Arithmetic Expression Evaluation (()) and Conditional Expression Evaluation [[]]

Features implemented in bash.
In arithmetic expression evaluation, you can write C-like arithmetic inside.
In conditional expression evaluation, you don't need to quote `<>, (), &&, ||`.

```bash
((i++))

[ a -a b ]
[[ a && b ]]
[ a -o b ]
[[ a || b ]]

```

Differences from the test command [[2][2]]:

Conditional expression|test|[[]]
-|-|-
AND|a -a b|a && b
OR|a -o b|a || b
String comparison|string a == string b|string a == pattern b

## Shell Variable Assignment and Reference

```bash
a='hello world'
echo "$a"
echo "${a}"
```

Be careful about the distinction between single quotes and double quotes. With single quotes, it's assigned as-is without expansion.

## Positional Parameters

You can reference shell script arguments:

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

## Special Parameters

Parameter|Content
-|-
$0|Name of the invoked shell script
$1~9|Each argument (arg1~9)
$@|List of all arguments
$*|Concatenates and references all arguments
$#|Number of arguments ($0 is not included)
$?|References the exit code
$!|Process ID of the last process executed in background
$$|Process ID of the shell itself
$-|Current shell option flags
$_|Last argument of the previously executed command

## Parameter Expansion

### Default Values for Parameters

```bash
cp file "${1:-/tmp}"
cp file "${1-/tmp}"
```

In the above example, `/tmp` is expanded when argument 1 is not set or is an empty string. In the lower case, `/tmp` is expanded only when it's not set.
The decision is based on whether to ignore empty strings or not.

### Assigning Default Values to Parameters

```bash
cp file "${DIST:=/tmp}"
cp file "${DIST=/tmp}"
```

Unlike the previous ones, this assigns and then expands.

### Output Error When Parameter is Unset

```bash
cp "${1:?error!}" ./
cp "${1?error!}" ./
```

If the parameter is not set, the message written after ? is displayed and the script terminates.

### Parameter Length

```bash
echo ${#test}
```

Returns the length of the parameter string.
Even without using it in scripts, you can substitute with the command `cat text | wc -c`.

### Remove Pattern from Parameter

```bash
echo "${DIR#*/}"
echo "${DIR##*/}"
```

Use like `${parameter#pattern}`. With one #, the shortest part is removed from the left; with two #s, the longest part is removed from the left.

Changing # to % removes from the right side.

### Extract Part of String

```bash
${parameter:offset:length}
```

Offset determines how many characters to delete from the beginning, and length determines how many characters from the beginning of the deleted string to display.

### Parameter Substitution

```bash
${parameter/pattern/replacement}
${parameter//pattern/replacement}
```

With one `/`, it replaces the first occurrence. With two, it replaces all occurrences.

## String Enclosure Methods

Single quotes `' '` display the string as-is. Double quotes `" "` perform parameter expansion and command substitution.
Backticks `` ` ` `` substitute with the standard input of commands in the enclosed part. `$( )` can do the same as backticks with different notation.

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

## Redirection

### Input

```bash
cat < file
```

### Output

```bash
cat 'Hello World' > log
```

### Append

```bash
date >> log
```

### Error Output

```bash
rm -rf non-exist 2> /dev/null # Delete without showing error messages
```

### Here Document

```bash
cat << 'EOF'
abcde
abcde
EOF
```

When the terminating string (EOF in the above case) is single-quoted, variable expansion etc. is not performed.

### Here String

Basically the same as here document. You don't need to write the terminating string.

```bash
cat <<< 'abcde
abcde'
```

## Commonly Used Commands

### expr

Performs numerical calculations:

```bash
expr 3 + 5
# 8
```

### basename

Outputs only the filename:

```bash
basename /home/user/test.txt
# test.txt
basename /home/user/test.txt .txt
# test
```

### dirname

Displays the directory name:

```bash
dirname /home/user/test.txt
# /home/user
dirname test.txt
# .
```

### wc

Can display the number of lines, words, and size of a file:

```bash
wc -lwc test.txt
# row
# words
# size
```

### sed

Replaces strings in files:

```bash
echo 'aaaaccccaaaa' > old.txt

sed 's/aaaa/b/' old.txt
# bccccaaaa
sed 's/aaaa/b/g' old.txt
# bccccb
```

## References

### Literature

\[1]: <https://qiita.com/nafuka/items/c97bfd2a4ca26e70e722>  
[1]:https://qiita.com/nafuka/items/c97bfd2a4ca26e70e722
\[2]: <https://qiita.com/kiyodori/items/e9fabcba03fc1e76dbdd>
[2]: https://qiita.com/kiyodori/items/e9fabcba03fc1e76dbdd
\[3]: <https://qiita.com/kaw/items/034bc4221c4526fe8866>
[3]: https://qiita.com/kaw/items/034bc4221c4526fe8866

### Books

[[改訂第3版]シェルスクリプト基本リファレンス ──#!/bin/shで、ここまでできる (WEB+DB PRESS plus)](https://amzn.to/3vkzkgM)