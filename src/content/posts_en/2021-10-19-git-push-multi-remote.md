---
title: "Git Push to Multiple Remote Repositories"
tags: [git]
category: Git
date: 2021-10-19
update: 2021-10-19
---

I always forget this, so taking notes.
There are many cases where you want to have remote repositories other than GitHub, such as running GitLab on a home server or wanting to place remote repositories on a server.
In such cases, it's tedious to select each push destination and push to them one by one, so I'll set it up so that you can push to multiple remote repositories with a single git push.

```bash
# First, register push and fetch destinations
git remote add origin git@github.com:hoge/hoge.git
git remote set-url --add origin git@gitlab.com:fuga/fuga.git

git remote -v

origin  git@github.com:hoge/hoge.git (fetch)
origin  git@github.com:hoge/hoge.git (push)
origin  git@gitlab.com:huga/huga.git (push)
```

Now with git push, you can push to multiple remote repositories at once.

Risk distribution is important.