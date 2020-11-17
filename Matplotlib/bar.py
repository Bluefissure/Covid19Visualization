import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json


data = None
with open('timeseries.json', 'r') as f:
    data = json.load(f)

con_arr = []
dea_arr = []
rec_arr = []
date_lst = []

for k, v in data.items():
    con_l, dea_l, rec_l = [], [], []
    for e in v:
        con_l.append(e['confirmed'])
        dea_l.append(e['deaths'])
        rec_l.append(e['recovered'])
    con_arr.append(con_l)
    dea_arr.append(dea_l)
    rec_arr.append(rec_l)

for e in data['China']:
    date_lst.append(e['date'])

con_df = pd.DataFrame(np.array(con_arr))
dea_df = pd.DataFrame(np.array(dea_arr))
rec_df = pd.DataFrame(np.array(rec_arr))
con_df['name'] = list(data.keys())

fig, ax = plt.subplots(1, 1)
fig.suptitle('Confirmed Cases', fontsize=20)
for i in range(len(con_arr[0])):
    ax.cla()

    con_df.sort_values(i, ascending=False, inplace=True)

# print(con_df.columns)
    name = con_df['name'].tolist()[:20]
    score = con_df.iloc[:20, i]
      
    # Horizontal Bar Plot 
    ax.barh(name, score) 
      
    # Remove axes splines 
    for s in ['top', 'bottom', 'left', 'right']: 
        ax.spines[s].set_visible(False) 
      
    # Remove x, y Ticks 
    ax.xaxis.set_ticks_position('none') 
    ax.yaxis.set_ticks_position('none') 
      
    # Add padding between axes and labels 
    # ax.xaxis.set_tick_params(pad = 5) 
    # ax.yaxis.set_tick_params(pad = 10) 
      
    # Add x, y gridlines 
    ax.grid(b = True, color ='grey', 
            linestyle ='-.', linewidth = 0.5, 
            alpha = 0.2) 
      
    # Show top values  
    ax.invert_yaxis() 
      
    # Add annotation to bars 
    for j in ax.patches: 
        plt.text(j.get_width()+0.2, j.get_y()+0.5,  
                 str(round((j.get_width()), 2)), 
                 fontsize = 10, fontweight ='bold', 
                 color ='grey') 
      
    # Add Plot Title 
    ax.set_title(date_lst[i], 
                 loc ='left', ) 
      
    # Show Plot
    plt.plot()
    plt.pause(0.01)
plt.pause(10)
    
    