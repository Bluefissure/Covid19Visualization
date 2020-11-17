import geopandas
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json


data = None
with open('timeseries.json', 'r') as f:
    data = json.load(f)

for k, v in data.items():
    assert len(v) == 294

world = geopandas.read_file(geopandas.datasets.get_path('naturalearth_lowres'))
world.replace({'name':'W. Sahara'}, 'Western Sahara', inplace=True)
world.replace({'name':'United States of America'}, 'US', inplace=True)
world.replace({'name':'Dem. Rep. Congo'}, 'Congo (Kinshasa)', inplace=True)
world.replace({'name':'Dominican Rep.'}, 'Dominican Republic', inplace=True)
# no falkland, belongs to United Kingdom?
# no Greenland, belongs to Denmark?
# no Fr. S. Antarctic Lands, belongs to france?
# no Puerto Rico, belongs to US?
world.replace({'name':"Côte d'Ivoire"}, "Cote d'Ivoire", inplace=True)
world.replace({'name':'Central African Rep.'}, 'Central African Republic', inplace=True)
world.replace({'name':'Congo'}, 'Congo (Brazzaville)', inplace=True)
world.replace({'name':'Eq. Guinea'}, 'Equatorial Guinea', inplace=True)
world.replace({'name':'eSwatini'}, 'Eswatini', inplace=True)
world.replace({'name':'Palestine'}, 'West Bank and Gaza', inplace=True)
world.replace({'name':'Myanmar'}, 'Burma', inplace=True)
# no North Korea
world.replace({'name':'South Korea'}, 'Korea, South', inplace=True)
# no Turkmenistan
# no New Caledonia, belongs to France?
world.replace({'name':'Solomon Is.'}, 'Solomon Islands', inplace=True)
world.replace({'name':'Taiwan'}, 'Taiwan*', inplace=True)
# no Antarctica
# no N. Cyprus
# no Somaliland
world.replace({'name':'Bosnia and Herz.'}, 'Bosnia and Herzegovina', inplace=True)
world.replace({'name':'Macedonia'}, 'North Macedonia', inplace=True)
world.replace({'name':'S. Sudan'}, 'South Sudan', inplace=True)

con_arr = []
dea_arr = []
rec_arr = []
date_lst = []

for e in data['US']:
	date_lst.append(e['date'])

for k, v in data.items():
    con_l, dea_l, rec_l = [k], [k], [k]
    for e in v:
        con_l.append(e['confirmed'])
        dea_l.append(e['deaths'])
        rec_l.append(e['recovered'])
    con_arr.append(con_l)
    dea_arr.append(dea_l)
    rec_arr.append(rec_l)

con_arr = np.array(con_arr)
dea_arr = np.array(dea_arr)
rec_arr = np.array(rec_arr)
# print(con_arr.shape, dea_arr.shape, rec_arr.shape)
con_df = pd.DataFrame(con_arr)
dea_df = pd.DataFrame(dea_arr)
rec_df = pd.DataFrame(rec_arr)
con_df.rename(columns={0:'name'}, inplace=True)
dea_df.rename(columns={0:'name'}, inplace=True)
rec_df.rename(columns={0:'name'}, inplace=True)

merged = world.merge(con_df, on='name')
for i in range(1, len(con_l)):
    merged[i] = merged[i].astype('int64')
merged = merged.to_crs("EPSG:3395")

fig, ax = plt.subplots(1, 1, figsize=(10,10))
fig.suptitle('Confirmed Cases', fontsize=20)
for i in range(1, 295):
	merged.plot(column=i,
	#             ax=ax1,
	            ax=ax,
	            legend=True,
	            cmap='OrRd',
	            # cmap='Greys',
	            # cmap='Greens',
	            scheme='percentiles'
	#             legend_kwds={'label': "Population by Country",
	#                          'orientation': "horizontal"},
	          )
	plt.plot()
	plt.axis('off')
	ax.set_title(date_lst[i-1])
	plt.pause(0.01)
	ax.cla()

merged = world.merge(dea_df, on='name')
for i in range(1, len(dea_l)):
    merged[i] = merged[i].astype('int64')
merged = merged.to_crs("EPSG:3395")
fig.suptitle('Death Cases', fontsize=20)
for i in range(1, 295):
	merged.plot(column=i,
	#             ax=ax1,
	            ax=ax,
	            legend=True,
	            # cmap='OrRd',
	            cmap='Greys',
	            # cmap='Greens',
	            scheme='percentiles'
	            # legend_kwds={'label': "Population by Country",
	            #              'orientation': "horizontal"},
	          )
	plt.plot()
	plt.axis('off')
	ax.set_title(date_lst[i-1])
	plt.pause(0.01)
	ax.cla()

merged = world.merge(rec_df, on='name')
for i in range(1, len(dea_l)):
    merged[i] = merged[i].astype('int64')
merged = merged.to_crs("EPSG:3395")
fig.suptitle('Recovered Cases', fontsize=20)
for i in range(1, 295):
	merged.plot(column=i,
	#             ax=ax1,
	            ax=ax,
	            legend=True,
	            # cmap='OrRd',
	            # cmap='Greys',
	            cmap='Greens',
	            scheme='percentiles'
	#             legend_kwds={'label': "Population by Country",
	#                          'orientation': "horizontal"},
	          )
	plt.plot()
	plt.axis('off')
	ax.set_title(date_lst[i-1])
	plt.pause(0.01)
	ax.cla()