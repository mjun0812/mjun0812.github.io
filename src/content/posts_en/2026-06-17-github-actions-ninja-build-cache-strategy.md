---
title: "How to Push CUDA Ninja Builds Beyond the GitHub-hosted Runner Limit on GitHub Actions"
tags:
  - GitHub Actions
  - CI/CD
  - PyTorch
  - CUDA
  - GitHub
  - Ninja
category: GitHub Actions
date: 2026-06-17
update: 2026-06-17
# For Zenn
emoji: "🙂‍↕️"
type: "tech" # tech: technical article / idea: idea
topics:
  - "githubactions"
  - "cicd"
  - "pytorch"
  - "cuda"
  - "github"
published: true
---

Hi there! In this post I will explain how to push a CUDA Ninja build through GitHub Actions beyond the 6-hour execution limit imposed on GitHub-hosted Runners.
I will first cover the background that made this approach necessary, the limits of GitHub-hosted Runners, and how Ninja's build cache works. Then I will describe how I managed to make long-running builds succeed on GitHub Actions.

> [!WARNING]
> This article is aimed at people who absolutely need to run GitHub Actions jobs for a long time.
> As described [here](https://github.blog/2025-12-18-simpler-pricing-and-a-better-experience-for-github-actions/), to keep the infrastructure sustainable, GitHub is considering billing for GitHub-hosted Runners even on public repositories.
> To avoid putting unnecessary load on the infrastructure, please try to eliminate wasted work before running long-running jobs.

## Background

One of my GitHub repositories is [mjun0812/flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels).

https://github.com/mjun0812/flash-attention-prebuild-wheels

flash-attention is a library that provides CUDA kernels for accelerating the attention mechanism used in Transformers, and it is widely used in LLMs and image generation models.

However, this library needs to be built for each combination of Python, PyTorch, and CUDA versions, as well as for platforms such as Windows/Linux and x86/arm64. On top of that, since it builds CUDA kernels, it requires significant resources and time.

That is why my repository [mjun0812/flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels) uses GitHub Actions to build and distribute wheel files for multiple platforms.
With these prebuilt wheels, users can simply download and install the wheel that matches their environment to use flash-attention, avoiding the painful and time-consuming build process.

https://x.com/mjun0812/status/1850706663982137615?s=20

It solves a very niche problem, but as of 2026-06-10, the repository has 1.5k stars and over 7 million downloads, so it is used by many people.

## The Problem: The 6-hour Limit on GitHub-hosted Runners

flash-attention is a library that many people struggle to build because of its build time.
Naturally, building it on GitHub Actions also takes a very long time.

Even if it takes a long time, once the build succeeds even once, the subsequent build time can be significantly reduced, so I really wanted to make it succeed somehow.
However, perhaps not so widely known, GitHub Actions has the following execution time limits:

| Runner type          | Behavior                  | Limit  |
| -------------------- | ------------------------- | ------ |
| GitHub-hosted Runner | Total workflow time       | 6 hours |
| Self-hosted Runner   | Total workflow time       | 5 days  |
| Self-hosted Runner   | Job queue wait time       | 24 hours |

So the build must complete within these time limits.
If you use self-hosted Runners, you effectively get up to 24 hours of execution time. However, among the target build environments, preparing ARM64 Linux on your own is extremely difficult.
And because you need to run a large number of long builds, using an external CI service is also too costly.
That is why I needed to figure out how to make builds succeed beyond the 6-hour limit on GitHub-hosted Runners.

To solve this, I adopted a strategy that uses the [actions/cache](https://github.com/actions/cache) feature of GitHub Actions to save the build's intermediate state. When the 6-hour limit is approached, the build is intentionally stopped, and the saved intermediate state is restored on the next run to resume the build.
With this strategy, the intermediate state of the build is saved and restored across runs, allowing the build to succeed beyond the 6-hour limit.
The concept is simple, but there were several gotchas in practice. I will describe them in detail below.

## Solution: A Ninja Build Cache Strategy Using actions/cache

In a single sentence, the solution is: **"Stop the build yourself before the 6-hour mark, save Ninja's build directory to the cache, and continue the build on a rerun."**

On GitHub-hosted Runners, once 6 hours is exceeded, the job is forcibly terminated. The termination is quite unforgiving and does not leave room for subsequent steps to save a cache.
So instead of running right up to the 6-hour line, we deliberately terminate the build at **5 hours and 45 minutes** using `timeout`.
Then the build directory generated up to that point is saved with `actions/cache/save`.
On the next rerun of the same workflow, `actions/cache/restore` restores the previous build directory.
This way, even builds that exceed the 6-hour limit of a single GitHub-hosted Runner can be split into multiple attempts and run to completion.

### How Ninja Build's Cache Works and Its Pitfalls

The flash-attention build involves compiling C++ and CUDA code, so it uses the Ninja Build System as its build system.

To speed up incremental builds, Ninja saves the build's intermediate state in a binary file called `.ninja_deps`. If the build is interrupted, or if you edit source code again, Ninja consults `.ninja_deps` to recompile only the necessary files and shrink the build time.
So by saving `.ninja_deps` and the `.o` files via `actions/cache` and restoring them on the next run, we can preserve and resume the build's intermediate state.

So far this might sound like just caching `.o` files and `.ninja_deps` is the end of the story.
However, there is a major pitfall here.
Ninja does not simply check "whether the `.o` file exists."
Ninja records the modification timestamps (mtime) of the `.o` files and their dependent header files in `.ninja_deps`, a binary file, with nanosecond precision.
And on the next build, it uses conditions like the following to decide whether a target needs to be rebuilt:

- Whether the output file exists.
- Whether the output file is newer than the input files.
- Whether the modification timestamp recorded in `.ninja_deps` matches the actual file's modification timestamp.
- Whether the dependencies recorded in the depfile are consistent with the current build graph.

For this reason, when you restore the build directory across attempts, even a tiny mismatch in the modification timestamps can cause Ninja to decide that "the output file is stale" and rebuild everything from scratch.
To use Ninja's build cache correctly on GitHub Actions, I ran into the following three pitfalls.

### Pitfall 1: tar Loses Nanosecond Precision on mtime

Ninja's `.ninja_deps` records modification timestamps with nanosecond precision. On the other hand, `actions/cache` internally stores the cache as a tar archive.
At that point, a file with a nanosecond-precision modification timestamp on the filesystem like

```text
1234567890.123456789
```

may be rounded to second precision after restore, like

```text
1234567890.000000000
```

As a result, `.ninja_deps` records `1234567890.123456789`, while the actual `.o` file becomes `1234567890.000000000`.
At this point, the modification timestamps do not match from Ninja's perspective.
Consequently, even if the restored `.o` files exist, Ninja does not trust them and rebuilds them.

To avoid this, I overwrite the modification timestamps of all files under the build directory to integer seconds before saving the cache.
On top of that, I also directly rewrite the binary format of `.ninja_deps` so the recorded modification timestamps are also rounded to integer seconds.
This way, after the cache is restored, the modification timestamps Ninja observes match the ones recorded in `.ninja_deps`.

### Pitfall 2: Freshly Installed Headers Become Newer Than `.o` Every Time

GitHub-hosted Runners rebuild the environment on every run.
So files required for the build—PyTorch, CUDA, flash-attention itself, CUTLASS, etc.—are freshly installed and placed every time.
In other words, the modification timestamps of dependent headers end up newer than those of the restored `.o` files.
From Ninja's perspective, this looks like

```text
input header > output object
```

In this case, the `.o` file is considered stale and is rebuilt.
In reality the contents are the same because we are using the same versions of PyTorch, CUDA, and flash-attention, but looking only at modification timestamps it appears that "the header has been updated."
To avoid this, I set the modification timestamps of the headers required for the build back to a past time.

```bash
PAST=197001020000

find flash-attention -path flash-attention/hopper/build -prune \
                    -o -path flash-attention/csrc/cutlass -prune \
                    -o -type f -print 2>/dev/null \
  | xargs -r touch -t "$PAST" 2>/dev/null || true

find .venv/lib -path '*/site-packages/torch/include*' -type f \
  -exec touch -t "$PAST" {} + 2>/dev/null || true

sudo find /usr/local/cuda/include -type f \
  -exec touch -t "$PAST" {} + 2>/dev/null || true
```

The important point here is to make the input side older, not to make the `.o` files newer.
The modification timestamps of the restored `.o` files need to match what Ninja recorded, so I do not touch the `.o` side.

### Pitfall 3: `.ninja_deps` Also Contains Header Modification Timestamps

To make things even more annoying, `.ninja_deps` records not only the modification timestamps of outputs but also those of dependent headers from PyTorch and the like.

If we roll back the modification timestamps of build-time headers to 1970, the timestamps recorded in `.ninja_deps` no longer match the actual headers' timestamps.
That is, simply making the headers older causes Ninja to mark things dirty for a different reason.
For this issue, instead of trusting `.ninja_deps` as-is after restore, we need to re-synchronize Ninja's state.
In this implementation, after restore I put the build directory back in place and run `ninja -t restat`.

```bash
BUILD_TEMP=flash-attention/hopper/build/temp.linux-aarch64-cpython-312

if [ -f "$BUILD_TEMP/build.ninja" ]; then
  uv pip install --quiet ninja 2>/dev/null || true
  if command -v ninja >/dev/null; then
    (
      cd "$BUILD_TEMP" &&
      find . -name '*.o' -type f -printf '%P\n' |
        xargs -r -n 500 ninja -t restat
    ) 2>/dev/null || true
  fi
fi
```

This makes Ninja re-recognize the restored `.o` files and avoids unnecessary rebuilds.
As shown above, by doing this kind of grubby modification-timestamp surgery, I was able to keep going on a huge CUDA Ninja build on GitHub-hosted Runners.

## Real Execution Examples

Now let's look at examples where this strategy was actually applied.
First, the case where no caching was used.

### Linux ARM64 GitHub-hosted Runner Without Caching

https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/26828098662

- 1 out of 24 jobs canceled after 6:00:16 elapsed.
- The surrounding jobs finished in 5h30m to 5h59m, completing the build right at the edge.

As I mentioned above, the GitHub-hosted Runner ran out of execution time and the build was cut off partway. Next, to make the build succeed, I configure the build cache.

### Linux ARM64 GitHub-hosted Runner With the Cache Strategy

https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/27098881346

Per-attempt URLs:

- Attempt 1 (failure): https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/27098881346/attempts/1
  - 5:48:42 failure (build cut off at 5:45, then cache saved)
- Attempt 2 (success): https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/27098881346/attempts/2
  - 1:23:36 success (cache restored, then run to completion)

For comparison, there is also an example of running the same build on a Raspberry Pi 5 with 8GB of RAM as a Linux arm64 machine.

### A Build That Took 17 Hours on a Raspberry Pi 5

https://github.com/mjun0812/flash-attention-prebuild-wheels/actions/runs/24447352042

- [17:02:56] success — Linux ARM64 self-hosted FA3 build

The Raspberry Pi 5 can build it too, but a single machine takes 17 hours, and with the 24-hour job queue limit, running multiple builds is unrealistic. On top of that, the CPU runs at nearly 100% usage during the build, which makes the fan very loud.

## Summary

GitHub Actions' GitHub-hosted Runners have a 6-hour execution time limit.
Normally, builds exceeding that need to be moved off to self-hosted Runners. However, preparing environments like Linux ARM64 on your own is extremely difficult.

By carrying Ninja's build directory across attempts using `actions/cache`, I was able to effectively complete CUDA builds that exceed 6 hours even on GitHub-hosted Runners.
To make this strategy work, I had to understand how Ninja's cache works and apply detailed adjustments such as manipulating file modification timestamps to avoid unnecessary rebuilds caused by timestamp mismatches.
Thanks to this approach, I am able to keep the limit at bay and continuously build and distribute flash-attention wheels that are used by many people.

It is a fairly niche topic, but if you are building a CUDA extension or a huge C++ project on GitHub Actions, you may run into the same problem.
I hope the cache strategy introduced here is useful to anyone facing a similar issue.
