---
title: "Conditional Branching with test Command in Shell Script"
tags: [shellscript]
category: shellscript
update: 2021-05-24
date: 2021-05-24
---

This article covers the test command used for conditional branching in shell scripts.
It enumerates what types of conditional branching are possible based on the options of the test command.
Since it's intended for use in shell scripts, the notation uses `[ ]`.

Condition|Description
-|-
-a file|True if file exists
-d file|True if file is a directory
-e file|True if file exists
-f file|True if file is a regular file
-h file|True if file is a symbolic link
-r file|True if file is readable
-s file|True if file size is greater than 0
-w file|True if file is writable
-x file|True if file is executable
a -nt b|True if a is newer than b in modification time
a -ot b|True if a is older than b in modification time
-z str|True if str is an empty string
-n str|True if str is not an empty string
str1 = str2|True if str1 and str2 are the same
str1 == str2|True if str1 and str2 are the same
str1 != str2|True if str1 and str2 are different
str1 < str2|True if str1 comes before str2 in dictionary order
str1 > str2|True if str1 comes after str2 in dictionary order
a -eq b|True if numbers a and b are equal
a -ne b|True if numbers a and b are not equal
a -lt b|True if a is less than or equal to b
a -le b|True if a is less than b
a -gt b|True if a is greater than b
a -ge b|True if a is greater than or equal to b

## References

### Books

[[改訂第3版]シェルスクリプト基本リファレンス ──#!/bin/shで、ここまでできる (WEB+DB PRESS plus)](https://amzn.to/3vkzkgM)
