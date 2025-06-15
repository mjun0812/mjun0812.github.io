---
title: "Using grep on Pandas DataFrame Output"
tags: [pandas,python]
category: Python
date: 2021-10-20
update: 2021-10-20
---

Pandas is a Python library for data analysis.
Personally, I often use it to nicely output 2D arrays to standard output (completely unorthodox).
When you `print(df)` with Pandas, it thoughtfully considers the terminal width and outputs with truncation. However, this means that when you do `python pandas.py | grep ABC`, if the search term is in the truncated part, you'll miss it in the search.
So by setting an option to ignore the horizontal width of data rows, you can search for specific lines with grep.

```python
import pandas as pd

pd.set_option("display.width", None)
```

The default value for `display.width` is 80.
Setting it to None removes the restriction.
Now you can use grep on Pandas output.