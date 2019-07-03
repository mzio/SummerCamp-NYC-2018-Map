import json  
import numpy as np


def inside_polygon(x, y, points):
    """
    Return True if a coordinate (x, y) is inside a polygon defined by
    a list of verticies [(x1, y1), (x2, x2), ... , (xN, yN)].
    Reference: http://www.ariel.com.au/a/python-point-int-poly.html
    """
    n = len(points)
    inside = False
    p1x, p1y = points[0]
    for i in range(1, n + 1):
        p2x, p2y = points[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside


def get_census_tracts():
    """Get relevant census tracts to consider"""
    hoods = ['Carroll Gardens-Columbia Street-Red Hook',
             'Brooklyn Heights-Cobble Hill',
             'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill',
             'Fort Greene', 'park-cemetery-etc-Brooklyn', 'Williamsburg',
             'North Side-South Side', 'East Williamsburg', 'Greenpoint',
             'Hunters Point-Sunnyside-West Maspeth', 'Woodside',
             'Queensbridge-Ravenswood-Long Island City', 'Astoria', 'Old Astoria',
             'Steinway', 'park-cemetery-etc-Queens','park-cemetery-etc-Manhattan']

    with open('census_hoods.geojson') as f:
        census_hoods = json.load(f)['features']
    print('Census Neighborhood GeoJSON Loaded!')

    # Get relevant geometries for Brooklyn and Queens
    hood_polygons = []
    for hood in census_hoods:
        if hood['properties']['ntaname'] in hoods:
            hood_polygons.append(hood['geometry']['coordinates'][0][0])

    with open('census_tracts.geojson') as f:
        census_tracts = json.load(f)['features']
    print('Census Tract GeoJSON Loaded!')

    # ID census tracts and get only relevant tracts
    census_tracts_1 = {'type': 'FeatureCollection', 'features': []}
    n = 0
    for tract in census_tracts:
        nta_id = tract['properties']['ntaname'] + ' ' + tract['properties']['ntacode']
        if tract['properties']['boro_name'] in ['Manhattan']:
            print('{} Added!'.format(tract['properties']['ntaname']))
            tract['properties'] = {'points': [], 'id': n, 'nta_id': nta_id, 
                                   'boro': tract['properties']['boro_name']}
            census_tracts_1['features'].append(tract)
            
        elif tract['properties']['boro_name'] in ['Brooklyn', 'Queens']:
            for x, y in tract['geometry']['coordinates'][0][0]:
                for poly in hood_polygons:
                    if inside_polygon(x, y, poly):
                        if tract not in census_tracts_1['features']:
                            print('{} Added!'.format(tract['properties']['ntaname']))
                            tract['properties'] = {'points': [], 'id': n, 'nta_id': nta_id, 
                                   'boro': tract['properties']['boro_name']}
                            census_tracts_1['features'].append(tract)
        n += 1
    print('Census Tracts Identified!')
    with open('census_tracts_1.js', 'w') as f:
        json.dump(census_tracts_1, f, indent=2)
    return census_tracts_1


def fill_census_tracts(census_tracts_1):
    with open('data_nyc.json') as f:
        data_nyc = json.load(f)['features']
    print('Point Data Loaded!')

    # Save new tracts and properties  
    census_tract_ids = {}
    census_tracts_2 = {'type': 'FeatureCollection', 'features': []}

    for point in data_nyc:
        # Remove identifying name info
        point['properties'].pop('FIRST_NAME', None)
        point['properties'].pop('LAST_NAME', None)
        for tract in census_tracts_1['features']:
            if inside_polygon(point['geometry']['coordinates'][0], 
                              point['geometry']['coordinates'][1],
                              tract['geometry']['coordinates'][0][0]):
            # if contains_point(tract['geometry']['coordinates'][0][0], point['geometry']['coordinates']):
                census_id = tract['properties']['id']
                if census_id not in census_tract_ids:
                    census_tract_ids[tract['properties']['id']] = [point['properties']]
                else:
                    census_tract_ids[tract['properties']['id']].append(point['properties'])
                print('{} Updated!'.format(census_id))

    for tract in census_tracts_1['features']:
        if tract['properties']['id'] in census_tract_ids.keys():
            tract['properties']['points'] = census_tract_ids[tract['properties']['id']]
            tract['properties']['number'] = len(tract['properties']['points'])
        # Keep all tracts  
        census_tracts_2['features'].append(tract)

    return census_tracts_2


def convert_properties(census_tracts):
    """Convert properties of census_tracts to cumulative digits for number of """
    census_tracts = census_tracts.copy()
    filters = {'TOTAL': ['NUMBER'],
               'CONCENTRATION': ['Applied Math', 'Computer Science', 'Economics',
                                 'Math', 'Statistics', 'Other'],
               'SECONDARY': ['Applied Math', 'Computer Science', 'Economics',
                             'Math', 'Statistics', 'Other'],
               'GRAD_YEAR': ['2018', '2019', '2020', '2021', 'Other'],
               'ROLE': ['Finance / Consulting', 'Software Engineering', 
                        'Business / Marketing / Ops / Sales', 'Data Science / ML / AI',
                        'PM / Product Design', 'Venture Capital', 'Other'],
               'FREQUENCY': ['Biweekly', 'Weekly', 'Monthly', 'Other'],
               'SIZE': ['EVENT_SIZE_LARGE', 'EVENT_SIZE_MEDIUM', 'EVENT_SIZE_SMALL'],
               'TYPE': ['EVENT_PREF_RESTAURANTS', 'EVENT_PREF_BARS', 'EVENT_PREF_MUSEUMS',
                        'EVENT_PREF_MUSIC', 'EVENT_PREF_TOURIST_SPOTS', 'EVENT_PREF_HOUSE_PARTIES']
              }
    for tract in census_tracts['features']:
        total_properties = {'id': tract['properties']['id'], 
                            'nta_id': tract['properties']['nta_id'], 
                            'boro': tract['properties']['boro']}
        for key in filters:
            values = filters[key]
            for value in values:
                new_key = key+'_'+value
                total_properties[new_key] = 0
        # for key in filters:
        #     values = filters[key]
            for point in tract['properties']['points']:
                if key not in ['SIZE', 'TYPE', 'TOTAL']:
                    point_key = str(point[key])
                    for value in values:
                        if point_key == value:
                            total_properties[key+'_'+value] += 1
                        elif (((('and '+value) in point_key) or 
                               ((value+' and') in point_key)) and 
                               (key in ['CONCENTRATION','SECONDARY'])):
                            for val in point_key.split(' and '):
                                total_properties[key+'_'+val] += 1
                    if (point_key not in filters[key]) and (point_key != 'None'):
                        total_properties[key+'_Other'] += 1
                elif key == 'TOTAL':
                    total_properties['TOTAL_NUMBER'] += 1
                else:
                    for value in values:
                        total_properties[key+'_'+value] += point[value]
        tract['properties'] = total_properties
    return census_tracts


def save_json(census_tracts, toJSON=False):
    fname = 'census_tracts_all.json' if toJSON else 'census_tracts_all.js' 
    with open(fname, 'w') as f:
        if toJSON == False:
            f.write('var census_tracts_all = ')
        json.dump(census_tracts, f, indent=2)


if __name__ == '__main__':
    census_tracts_1 = get_census_tracts()
    census_tracts_2 = fill_census_tracts(census_tracts_1)
    census_tracts_onehot = convert_properties(census_tracts_2)
    save_json(census_tracts_onehot)
    # save_json(census_tracts_2)
    # with open('census_tracts_all.json') as ct:
    #     census_tracts_onehot = convert_properties(json.load(ct))
    #     save_json(census_tracts_onehot)

    










# # Fast workaround, comment out when values are calculated
# with open('data_nyc.json') as f:
#     data_nyc = json.load(f)['features']
#     print('Point data loaded!')

# # Get bounding latitude and longitude  
# list_lng = np.array([x['geometry']['coordinates'][0] for x in data_nyc]) 
# list_lat = np.array([x['geometry']['coordinates'][1] for x in data_nyc])   

# max_lng = np.max(list_lng); min_lng = np.min(list_lng)
# max_lat = np.max(list_lat); min_lat = np.min(list_lat)

# print(max_lng)
# print(max_lat)
# print(min_lng)
# print(min_lat)

# filtered_census_tracts = {'type': 'FeatureCollection', 'features': []}
# with open('census_tracts.geojson') as f:
#     census_tracts = json.load(f)['features']

# n = 0
# for tract in census_tracts:
#     if tract['properties']['boro_name'] in ['Manhattan', 'Brooklyn', 'Queens']:
#         tract['properties'] = {'points': [], 'id': n}
#         filtered_census_tracts['features'].append(tract)
#         n += 1


# # with open('census_blocks_f1.json', 'w') as f:
# #     json.dump(filtered_census_tracts, f, indent=2)

# # max_lng = 40.778115999999997
# # max_lng = 

# # [(40.778115999999997, 40.842265300000001), (40.778115999999997, -73.969131000000004), (-74.062217399999994, -73.969131000000004), (-74.062217399999994, 40.842265300000001)]
# def contains_point(block_coords, point_coords):
#     # print(min(block_coords, key=lambda x: x[0])[0])
#     if ((min(block_coords, key=lambda x: x[0])[0] 
#          <= point_coords[0] <= max(block_coords, key=lambda x: x[0])[0]) and
#         (min(block_coords, key=lambda x: x[1])[1] 
#          <= point_coords[1] <= max(block_coords, key=lambda x: x[1])[1])):
#         return True
#     else: return False



# # Save new tracts and properties  
# census_tract_ids = {}
# filtered_census_tracts_2 = {'type': 'FeatureCollection', 'features': []}

# for point in data_nyc:
#     for tract in filtered_census_tracts['features']:
#         # print(point['geometry']['coordinates'])
#         # print(blosck['geometry']['coordinates'][0][0])
#         if inside_polygon(point['geometry']['coordinates'][0], 
#                           point['geometry']['coordinates'][1],
#                           tract['geometry']['coordinates'][0][0]):
#         # if contains_point(tract['geometry']['coordinates'][0][0], point['geometry']['coordinates']):
#             census_id = tract['properties']['id']
#             if census_id not in census_tract_ids:
#                 census_tract_ids[tract['properties']['id']] = [point['properties']]
#             else:
#                 census_tract_ids[tract['properties']['id']].append(point['properties'])


# # for census_id in census_tract_ids:
# #     filtered_census_tracts_2['features'].append()  

# for tract in filtered_census_tracts['features']:
#     if tract['properties']['id'] in census_tract_ids.keys():
#         tract['properties']['points'] = census_tract_ids[tract['properties']['id']]
#         tract['properties']['number'] = len(tract['properties']['points'])
#     filtered_census_tracts_2['features'].append(tract)
    

# # filtered_census_tracts['features'] = list(filtered_census_tracts['features'])

# with open('census_tracts_all.json', 'w') as f:
#     json.dump(filtered_census_tracts_2, f, indent=2)




# # Clockwise from top right
# # bbox = [(max_lng, max_lat), (max_lng, min_lat), (min_lng, min_lat), (min_lng, max_lat)]

# # print(bbox)
