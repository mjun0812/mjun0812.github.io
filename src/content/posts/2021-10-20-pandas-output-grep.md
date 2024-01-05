---
title: Pandasで標準出力したDataframeにgrepする
tags: [pandas,python]
category: Python
date: 2021-10-20
update: 2021-10-20
---

Pythonのデータ分析のライブラリにPandasというライブラリがある．  
個人的には2次元配列をきれいに標準出力できるのでよく使っていたりする(完全に邪道)．  
Pandasは`print(df)`したときに，ご丁寧に端末の横幅を考慮して省略して出力してくれるのだが，それだと
`python pands.py | grep ABC`したときに省略部分に検索語句があると検索漏れしてしまう．  
そこで，データの行の横幅を無視するオプションを設定することでgrepで指定行を検索できるようにする．  

```python
import pandas as pd

pd.set_option("display.width", None)
```

`display.width`の初期値は80である．  
Noneにすることで制限を解除する．  
これでPandasの出力にgrepをかけることが可能になった．

