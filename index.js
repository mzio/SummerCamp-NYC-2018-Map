mapboxgl.accessToken = 'pk.eyJ1IjoibXppbyIsImEiOiJjajM3YzVpbGkwMGgyMnFvMmE2ZWxoMWs3In0.CcIzbqMViGz_OQmZ9_v3nw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mzio/cjhnxcbt51l0t2rr225g41bre',
  // style: 'mapbox://styles/light-v9',
  center: [-74.0072542, 40.772178],
  zoom: 11.45,
  pitch: 0
});

var colorStops = ['#FFFFFF', '#C9C9E2', '#A7A7D0', '#6565A5', '#494991']
var colorActive = ['#494991']

var typeList = ['TOTAL_NUMBER', 'CONCENTRATION_Applied Math', 'CONCENTRATION_Computer Science', 
                'CONCENTRATION_Economics', 'CONCENTRATION_Math', 'CONCENTRATION_Statistics', 
                'CONCENTRATION_Other', 'SECONDARY_Applied Math', 'SECONDARY_Computer Science', 
                'SECONDARY_Economics', 'SECONDARY_Math', 'SECONDARY_Statistics', 'SECONDARY_Other', 
                'GRAD_YEAR_2018', 'GRAD_YEAR_2019', 'GRAD_YEAR_2020', 'GRAD_YEAR_2021', 
                'GRAD_YEAR_Other', 'ROLE_Finance / Consulting', 'ROLE_Software Engineering', 
                'ROLE_Business / Marketing / Ops / Sales', 'ROLE_Data Science / ML / AI', 
                'ROLE_PM / Product Design', 'ROLE_Venture Capital', 'ROLE_Other', 
                'FREQUENCY_Biweekly', 'FREQUENCY_Weekly', 'FREQUENCY_Monthly', 'FREQUENCY_Other', 
                'SIZE_EVENT_SIZE_LARGE', 'SIZE_EVENT_SIZE_MEDIUM', 'SIZE_EVENT_SIZE_SMALL', 
                'TYPE_EVENT_PREF_RESTAURANTS', 'TYPE_EVENT_PREF_BARS', 'TYPE_EVENT_PREF_MUSEUMS', 
                'TYPE_EVENT_PREF_MUSIC', 'TYPE_EVENT_PREF_TOURIST_SPOTS', 'TYPE_EVENT_PREF_HOUSE_PARTIES']

var tractActive = {
  'type': 'FeatureCollection',
  'features': []
}
// Determine shading based on property of how many interns in each tract fit the type
var activeType = 'TOTAL_NUMBER'

// Dropdown filtering list
var options = [
    {
        id: 1, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "TOTAL_NUMBER", text: "Total Number"},
            {value: "CONCENTRATION", text: "Concentration", nextId: 2},
            {value: "SECONDARY", text: "Secondary", nextId: 3},
            {value: "GRAD_YEAR", text: "Class Year", nextId: 4},
            {value: "ROLE", text: "Company Role", nextId: 5},
            {value: "FREQUENCY", text: "Preferred Event Frequency", nextId: 6},
            {value: "SIZE", text: "Preferred Event Size", nextId: 7},
            {value: "TYPE", text: "Preferred Event Type", nextId: 8}
        ]
    },
    {
        id: 2, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "CONCENTRATION_Computer Science", text: "Computer Science"},
            {value: "CONCENTRATION_Applied Math", text: "Applied Math"},
            {value: "CONCENTRATION_Economics", text: "Economics"},
            {value: "CONCENTRATION_Statistics", text: "Statistics"},
            {value: "CONCENTRATION_Other", text: "Other"}
        ]
    },
    {
        id: 3, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "CONCENTRATION_Computer Science", text: "Computer Science"},
            {value: "CONCENTRATION_Applied Math", text: "Applied Math"},
            {value: "CONCENTRATION_Economics", text: "Economics"},
            {value: "CONCENTRATION_Statistics", text: "Statistics"},
            {value: "CONCENTRATION_Other", text: "Other"}
        ]
    },
    {
        id: 4, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "GRAD_YEAR_2018", text: "2018"},
            {value: "GRAD_YEAR_2019", text: "2019"},
            {value: "GRAD_YEAR_2020", text: "2020"},
            {value: "GRAD_YEAR_2021", text: "2021"},
            {value: "GRAD_YEAR_Other", text: "Other"}
        ]
    },
    {
        id: 5, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "ROLE_Finance / Consulting", text: "Finance / Consulting"},
            {value: "ROLE_Software Engineering", text: "Software Engineering"},
            {value: "ROLE_Business / Marketing / Ops / Sales", text: "Business / Marketing / Ops / Sales"},
            {value: "ROLE_Data Science / ML / AI", text: "Data Science / ML / AI"},
            {value: "ROLE_PM / Product Design", text: "PM / Product Design"},
            {value: "ROLE_Venture Capital", text: "Venture Capital"},
            {value: "ROLE_Other", text: "Other"}
        ]
    },
    {
        id: 6, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "FREQUENCY_Biweekly", text: "Biweekly"},
            {value: "FREQUENCY_Weekly", text: "Weekly"},
            {value: "FREQUENCY_Monthly", text: "Monthly"},
            {value: "FREQUENCY_Other", text: "Other"},
        ]
    },
    {
        id: 7, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "SIZE_EVENT_SIZE_LARGE", text: "LARGE"},
            {value: "SIZE_EVENT_SIZE_MEDIUM", text: "MEDIUM"},
            {value: "SIZE_EVENT_SIZE_SMALL", text: "SMALL"},
        ]
    },
    {
        id: 8, 
        name: "VAL", 
        defaultVal: "Select from", 
        choices: [
            {value: "TYPE_EVENT_PREF_RESTAURANTS", text: "RESTAURANTS"},
            {value: "TYPE_EVENT_PREF_BARS", text: "BARS"},
            {value: "TYPE_EVENT_PREF_MUSEUMS", text: "MUSEUMS"},
            {value: "TYPE_EVENT_PREF_MUSIC", text: "MUSIC"},
            {value: "TYPE_EVENT_PREF_TOURIST_SPOTS", text: "TOURIST_SPOTS"},
            {value: "TYPE_EVENT_PREF_HOUSE_PARTIES", text: "HOUSE_PARTIES"}
        ]
    }
];
var DropdownWidget = (function() {
    var DropdownWidget = function(options) {
        // TODO: type-checking on options: should be array of acceptable configurations...
        this.options = options;
        this.selectedVals = [];
        this.showing = false;
        this.handlers = [];
    };
    DropdownWidget.prototype.onComplete = function(handler) {
        this.handlers.push(handler);    
    };
    DropdownWidget.prototype.addTo = function(element) {
        if (this.showing) {
            alert("Oops!");  // TODO: real error handling, or should this be moveable?
            return;
        }
        var dropdown = createDropdown(this.options[0]);
        this.elements = [dropdown];
        addHandlers(this, dropdown, options, 0);
        element.appendChild(dropdown);
    };
    var createDropdown = function(config) {
        var select = document.createElement("SELECT");
        select.name = config.name;
        select.options[select.options.length] = new Option(config.defaultVal, "default");
        config.choices.forEach(function(choice) {
            select.options[select.options.length] = new Option(choice.text, choice.value);
        });
        return select;
    };
    var addHandlers = function(widget, select, options, index) {
        select.onchange = function() {
            removeSubsequentSelects(widget, options, index);
            if (this.selectedIndex > 0) {
                var choice = options[index].choices[this.selectedIndex - 1];
                if (widget.selectedVals[widget.selectedVals.length - 1] !== options[index]) {
                    widget.selectedVals.push(options[index]);
                }
                if (choice.nextId) {
                    var nextIndex = findIndex(function(item) {
                        return item.id === choice.nextId;
                    }, options);
                    if (nextIndex > -1) {
                        var dropdown = createDropdown(options[nextIndex]);
                        widget.elements.push(dropdown);
                        addHandlers(widget, dropdown, options, nextIndex);
                        this.parentNode.appendChild(dropdown);
                    }
                } else {
                    complete(widget);
                }
            }
        }
    };
    var removeSubsequentSelects = function(widget, options, index) {
        var start = findIndex(function(selected) {
            return selected == options[index];
        }, widget.selectedVals);
        var idx = start;
        if (idx > -1) {
            while (++idx < widget.elements.length) {
                widget.elements[idx].parentNode.removeChild(widget.elements[idx]);
            }
            widget.elements.length = widget.selectedVals.length = start + 1;
        }
    }
    
    var findIndex = function(predicate, list) {
        var idx = -1;
        while (++idx < list.length) {if (predicate(list[idx])) {return idx;}}
        return -1;
    };
    
    var complete = function(widget) {
        var vals = widget.selectedVals.map(function(val, idx) {
            return {name: val.name, val: val.choices[widget.elements[idx].selectedIndex - 1].value}
        }).reduce(function(memo, obj) {memo[obj.name] = obj.val; return memo;}, {});
        widget.handlers.forEach(function(handler) {
            handler(vals);
        });
    }
    
    return DropdownWidget;
}());

map.on('load', function() {

  // Add census tracts  
  map.addSource('json-tracts', {
    'type': 'geojson',
    'data': census_tracts_all
  });
  map.addLayer({
    'id': 'json-tracts-fill',
    'type': 'fill',
    'source': 'json-tracts',
    'paint': {
      'fill-color': '#FFFFFF'
    }
  });
  map.addLayer({
    'id': 'json-tracts-hover',
    'type': 'fill',
    'source': 'json-tracts',
    'paint': {
      'fill-color': '#627BC1',
      'fill-opacity': 0.75
    }
  });
  map.addLayer({
    'id': 'json-tracts-line',
    'type': 'line',
    'source': 'json-tracts',
    'paint': {
       'line-width': 1.5,
       'line-color': '#A7A7D0'
    }
  });
})
// Hover to display info about tract and borough
map.on("mousemove", "json-tracts-fill", function(x) {
  var props =  x.features[0].properties
  map.setFilter("json-tracts-hover", ["==", "id", props.id]);
  document.getElementById('tract-nta').innerHTML = props.nta_id
  document.getElementById('tract-boro').innerHTML = props.boro
});
map.on("mouseleave", "json-tracts-fill", function() {
  map.setFilter("json-tracts-hover", ["==", "id", ""]);
});
// Click to display info about interns
map.on("click", "json-tracts-fill", function(x) {
  var props =  x.features[0].properties
  var description = ''
  if (props[activeType] == 0) {
    description = 'No interns registered here (yet!)'
  } else if (props[activeType] == 1) {
    description = props[activeType] + ' intern working in the area'
  } else {
    description = props[activeType] + ' interns working in the area'
  }
  new mapboxgl.Popup()
            .setLngLat(x.lngLat)
            .setHTML(description)
            .addTo(map);
})

map.dragPan.disable();
map.scrollZoom.disable();
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

var updateScale = function() {
  var values = census_tracts_all.features.map(tract => tract.properties[activeType])
  var max_val = Math.max.apply(null, values)
  // Update Summary Box
  const add = (a, b) => a + b
  var sum_val = values.reduce(add)
  // Update Summary Analysis
  document.getElementById('total-number').innerHTML = sum_val
  census_tracts_all.features.sort(
    function(a,b) {return (a.properties[activeType] > b.properties[activeType]) ? 1 : 
                          ((b.last_nom > a.properties[activeType]) ? -1 : 0);} );
  // Get Top 3 Locations
  var top_tracts = census_tracts_all.features.slice(Math.max(census_tracts_all.features.length - 3, 0))
  var top_locs = top_tracts.map(tract => tract.properties.nta_id)
  // Function to create unordered list
  function makeUL(array) {
    var list = document.createElement('ol')
    list.setAttribute('id', 'loc-list')
    for (var i = array.length - 1; i >= 0; i--) {
      var item = document.createElement('li')
      item.appendChild(document.createTextNode(array[i]))
      list.appendChild(item)
    }
    return list
  }
  document.getElementById('top-locations').innerHTML = ''
  document.getElementById('top-locations').appendChild(makeUL(top_locs))

  // Find outliers, don't include 0s
  values = values.filter(item => item !== 0)
  if (max_val > 4) {
    values = values.filter(item => item !== 1)
  }
  var outlier = outliers(values)
  values = values.filter(item => !outlier.includes(item))
  var max_no_outlier = Math.max.apply(null, values)
  // Update color gradient and legend labels
  if (max_val == 1) {
    var colorOne = colorStops[4]
    var colorTwo = colorStops[4]
    var colorMax = colorStops[4]
    var valOne = '0'
    var valTwo = '1'
  }
  if (max_val == max_no_outlier) {
    var colorTwo = colorStops[4]
    var colorMax = colorStops[4]
    var valOne = '1'
    var valTwo = max_val
    document.getElementById('max-li').style.visibility = "hidden"
  } else {
    document.getElementById('max-li').style.visibility = "visible"
  }
  if (max_val == 0) {
    var colorOne = colorStops[0]
    var colorTwo = colorStops[0]
    var colorMax = colorStops[0]
    var valOne = '0'
    var valTwo = '0'
  }
  if (max_no_outlier == 1) {
    var colorOne = colorStops[3]
    var colorTwo = colorStops[3]
    var colorMax = colorStops[4]
    var valOne = '0'
    var valTwo = '1'
  } else {
    var colorOne = colorStops[1]
    var colorTwo = colorStops[3]
    var colorMax = colorStops[4]
    var valOne = '1'
    var valTwo = max_no_outlier
    
  }
  document.getElementById('inter').innerHTML = valOne + '-' + valTwo
  document.getElementById('max').innerHTML = max_val
  var interBar = document.getElementById('inter-bar')
  var maxBar   = document.getElementById('max-bar')

  interBar.style.background = 'linear-gradient(to right, ' + colorOne + ', ' + colorTwo + ')'
  maxBar.style.background = colorMax

  var key = document.getElementById('key')
  if (key.style.visibility = "hidden") {
    key.style.visibility = "visible";
  }

  var stops = [[0, colorStops[0]], [1, colorStops[1]], [max_no_outlier, colorStops[3]], [max_val, colorStops[4]]]
  return max_val, stops
}

function outliers(arr, key) {
  arr = arr.slice(0);

  if (key) arr = arr.map(function(v) { return v[key]; });

  arr = arr.sort(function(a, b) {
    return a - b;
  });

  var len = arr.length;
  var middle = median(arr);
  var range = iqr(arr);
  var outliers = [];

  for (var i = 0; i < len; i++) {
    Math.abs(arr[i] - middle) > range && outliers.push(arr[i]);
  }

  return outliers;
}

function median(arr) {
  var len = arr.length;
  var half = ~~(len / 2);

  return len % 2
    ? arr[half]
    : (arr[half - 1] + arr[half]) / 2;
}

function iqr(arr) {
  var len = arr.length;
  var q1 = median(arr.slice(0, ~~(len / 2)));
  var q3 = median(arr.slice(Math.ceil(len / 2)));
  var g = 1.5;

  return (q3 - q1) * g
}

// Add refocusing
var widget = new DropdownWidget(options);
widget.onComplete(function(vals) {
    activeType = vals.VAL;
    var max_val, new_stops = updateScale()
    map.setPaintProperty('json-tracts-fill', 'fill-color', {
        property: activeType,
        stops: new_stops
    });
});
widget.addTo(document.getElementById("dropdown-1"));
