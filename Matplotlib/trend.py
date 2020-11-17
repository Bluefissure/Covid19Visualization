import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import json

data = None
with open('timeseries.json', 'r') as f:
    data = json.load(f)

# print(data.keys())
df = pd.DataFrame(data['US']);
# print(df.tail())
# x = range(len(df))
x = matplotlib.dates.datestr2num(df['date'])
plt.xticks(rotation=45)

plt.plot_date(x, df['confirmed'], '-', color='red', label='confirmed')
plt.plot_date(x, df['deaths'], '-', color='black', label='deaths')
plt.plot_date(x, df['recovered'], '-', color='green', label='recovered')

plt.xlabel("Date")
plt.ylabel("Cases")
plt.legend()
plt.grid()
plt.show()