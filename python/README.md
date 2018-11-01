### Usage

```python
import circDraw
import pandas as pd
import matplotlib.pyplot as plt
input = pd.read_csv('backsplice.csv')
circDraw.circDraw(input)
plt.show()
```

```python
circDraw(inst, title='circDraw', dpi=400, chr_color='black', palette=None, save='png')
```

- inst: the input instance
- dpi: The output dpi of the picture
- chr_color: the color of chromosome
- palette: A list object contain colors more than the number of input 'type'.
- save: save file format