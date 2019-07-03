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
                     'EVENT_PREF_MUSIC', 'EVENT_PREF_TOURIST_SPOTS', 'EVENT_PREF_HOUSE_PARTIES']}

for k in filters:
   for v in filters[k]:
      val = '{}_{}'.format(k, v)
      print('{{value: "{}", text: "{}"}},'.format(val, v))