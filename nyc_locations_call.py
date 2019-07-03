import requests  
import pandas as pd
import numpy as np
import json

key = 'AIzaSyDo3HoweLEu4QmRnu98pErLiSHB2vL7JE4'

df_data_nyc = pd.read_csv('df_data_nyc.csv')

dict_geo = {}

# Get latitude and longitude coordinates for workplaces
for company in df_data_nyc['WORKPLACE']:
    if company != 'None':
        if company not in dict_geo:
            try:
                print(company)
                r = requests.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.782178,-73.9672542&radius=10000&keyword={}&key={}'.format(company, key))
                # print(r.url)
                dict_geo[company] = r.json()['results'][0]['geometry']['location']
                # print(dict_geo[company])
            except:
                dict_geo[company] = {'lat': np.nan, 'lng': np.nan}
                print('Nearbysearch failed for {}'.format(company))

# Save data to new CSV file  
list_geo = []
for company in df_data_nyc['WORKPLACE']:
    if company != 'None':
        list_geo.append(dict_geo[company])
    else:
        list_geo.append({'lat': np.nan, 'lng': np.nan})
df_data_nyc_geo = df_data_nyc.join(pd.DataFrame(list_geo))
df_data_nyc_geo.to_csv('df_data_nyc-geo.csv')

# df_data_nyc_geo = pd.read_csv('df_data_nyc-geo.csv')

# Convert DataFrame to GeoJSON  
def df_to_geojson(df, properties, lat='lat', lon='lng'):
    geojson = {'type':'FeatureCollection', 'features':[]}
    for _, row in df.iterrows():
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'Point',
                               'coordinates':[]}}
        feature['geometry']['coordinates'] = [row[lon], row[lat]]
        for prop in properties:
            feature['properties'][prop] = row[prop]
        geojson['features'].append(feature)
    return geojson

cols = df_data_nyc.columns
geojson_data_nyc = df_to_geojson(df_data_nyc_geo, cols)

# Save data to JSON file  
fname = 'data_nyc_geo.json'
with open(fname, 'w') as f:
    json.dump(geojson_data_nyc, f, indent=2)

