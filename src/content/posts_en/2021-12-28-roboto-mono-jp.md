---
title: "Created a Font with Japanese Characters Added to RobotoMono"
tags: [design, font]
category: Design
date: 2021-12-28
update: 2021-12-28
---

Hello. This time I'll introduce a font I created myself.

I usually use RobotoMono distributed by GoogleFont for terminal and editor fonts, but this font doesn't include Japanese characters.
Therefore, when I input Japanese, it becomes tofu (missing characters) or defaults to the OS default font.
So I used FontForge to composite Japanese fonts, making it possible to handle everything with a single font.

The composite font includes:

- [RobotoMono](https://fonts.google.com/specimen/Roboto+Mono)
- [IBM plex Sans JP](https://github.com/IBM/plex)
- [Nerd Font](https://github.com/ryanoasis/nerd-fonts)

All of these are published as open source, so they can be freely modified.
Nerd Font allows embedding various icons into fonts, and I think many people use it when they have terminal shells like Powerline.

The font appearance looks like this:

![RobotoMonoJP](./images/RobotoMonoJP.png)

You can download it from my GitHub repository:

<https://github.com/mjun0812/RobotoMonoJP>

Since I'm not very knowledgeable about fonts, there might be some issues. Please understand.
Source code is also included, so if you want to modify it, please check that out.
The license is also open.