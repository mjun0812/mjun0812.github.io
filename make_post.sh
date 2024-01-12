#!/bin/bash

echo "Input title"
read TITLE
echo "Input file prefix"
read FILE_TITLE

FILE_TITLE=`echo $FILE_TITLE | sed 's/ /-/g'`

if [ -z "$TITLE" ]; then
  echo "Plz type TITLE"
  exit
fi

TODAY=`date "+%Y-%m-%d"`

FILE="./src/content/posts/$TODAY-$FILE_TITLE.md"

if [ -e $FILE ]; then
 echo "This file is existed!"
 exit
fi

echo "make post at $FILE"
touch $FILE

# Write Frontmatter
cat <<< "---
title: $TITLE
tags: [None]
category: None
date: $TODAY
update: $TODAY
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---" > "$FILE"
