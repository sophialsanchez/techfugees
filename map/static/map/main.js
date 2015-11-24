$(function() {

  function Country (leafletMap, countryName, coordinates) {
    // for some reason, we need to reverse the coordinates
    var reverseCoordinates = function(coordinates) {
      return coordinates.map(function reverse(item) {
        return Array.isArray(item) && Array.isArray(item[0])
          ? item.map(reverse)
          : item.reverse();
        });
    };

    var polygon = L.polygon(reverseCoordinates(coordinates));
    this.state = null;
    this.name = countryName;

    var highlight = function(style) {
      polygon.setStyle($.extend({
        dashArray: ''
      }, style));
      leafletMap.addLayer(polygon);
    };

    this.removeHighlight = function() {
      this.state = null;
      leafletMap.removeLayer(polygon);
    };

    this.highlightGreen = function() {
      this.state = 'green';
      highlight({
        color: 'green',
        weight: 2,
        fillOpacity: .1
      });
    };

    this.highlightRed = function() {
      this.state = 'red';
      highlight({
        color: 'red',
        weight: 2,
        fillOpacity: .7
      });
    };

    this.highlightGrey = function() {
      this.state = 'grey';
      highlight({
        color: '#666',
        weight: 2,
        fillOpacity: .2
      });
    }
  };

  function Map() {
    var leafletMap = L.map('map').setView([41.505, 25.00], 3);
    var countries = {};
    var currentlySelectedCountry = null;
    var currentEndCountries = [];

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'sophiasanchez.c3eddfe3',
        accessToken: 'pk.eyJ1Ijoic29waGlhc2FuY2hleiIsImEiOiJjaWdrMjB5NzgwMDlidWpsenRjbzBqb3p2In0.46Rk8ZSkTEtq0cK3nAJmfQ'
    }).addTo(leafletMap);

    var countryExists = function(countryName) {
      return countries.hasOwnProperty(countryName);
    };

    var forEachCountry = function(countryNames, callback) {
      for (var i = 0; i < countryNames.length; i++) {
        if (countryExists(countryNames[i])) {
          var country = countries[countryNames[i]];
          callback(country);
        }
      }
    };

    var selectStartCountry = function(startCountry) {
      if (!startCountry) { return; }

      if (currentlySelectedCountry) {
        currentlySelectedCountry.removeHighlight();
      }

      forEachCountry(currentEndCountries, function(country) { country.removeHighlight() });

      startCountry.highlightRed();
      currentlySelectedCountry = startCountry;

      $.ajax({
        type: 'GET',
        url: '/map/query/' + startCountry.name,
        success: function(reply) {
          endCountries = JSON.parse(reply);
          currentEndCountries = endCountries;
          forEachCountry(endCountries, function(country) { country.highlightGreen(); });
        }
      });
    };

    var countryFromName = function(countryName) {
      if (!countryExists(countryName)) {
        return null;
      }
      return countries[countryName];
    };

    var countryFromEvent = function(e) {
      var countryName = e.target.feature.properties.name;
      return countryFromName(countryName);
    };

    var onCountryHighLight = function(e) {
      var country = countryFromEvent(e);

      if (!country) { return; }

      if (country.state === null) {
        country.highlightGrey();
      }
    };

    var onCountryMouseOut = function(e) {
      var country = countryFromEvent(e);

      if (!country) { return; }

      if (country.state === 'grey') {
        country.removeHighlight();
      }
    };

    var onCountryClick = function(e) {
      var country = countryFromEvent(e);
      selectStartCountry(country);
    };

    var cacheCountries = function() {
      d3.json(COUNTRIES_DATA_JSON_URL, function (json) {
        data = json.features;
        for (var i = 0; i < data.length; i++) {
          var countryName = data[i].properties.name;
          var countryCoordinates = data[i].geometry.coordinates[0];
          var country = new Country(leafletMap, countryName, countryCoordinates);
          countries[countryName] = country;
        }

        L.geoJson(json, {
          onEachFeature: function(feature, layer) {
            layer.on({
              mouseover : onCountryHighLight,
              mouseout : onCountryMouseOut,
              click: onCountryClick
            });
          },
          style:  {
            fillColor: "#E3E3E3",
            weight: 1,
            opacity: 0.4,
            color: 'white',
            fillOpacity: 0.3
          },
          onCountryMouseOut: onCountryMouseOut,
          onCountryClick: onCountryClick
        }).addTo(leafletMap);
      });
    };
    cacheCountries();
  };

  myMap = new Map();

/*

  var currentlySelectedCountry = null;
  var currentTarget = null;
  var endCountries = {};
  var latlngs = Array();
  var polylines = [];
  var polylineLayergroup = L.layerGroup();

  // FIXME: cache the JSON, don't reload it every time
  d3.json(COUNTRIES_DATA_JSON_URL, function (json){

    function style(feature) {
      return {
        fillColor: "#E3E3E3",
        weight: 1,
        opacity: 0.4,
        color: 'white',
        fillOpacity: 0.3
      };
    }
    geojson = L.geoJson(json, {
      onEachFeature: onEachFeature,
      style : style
    }).addTo(map);

    function onEachFeature(feature, layer){
      layer.on({
        click : onCountryClick,
        mouseover : onCountryHighLight,
        mouseout : onCountryMouseOut
      });
    }
  });


  function onCountryHighLight(e){

    if (e.target.feature.properties.name == currentlySelectedCountry) {
      changeCountryColor(e.target, 2, 'red', .7)
    }
    else {e.target.feature.properties.name in 
      changeCountryColor(e.target, 2, '#666', .7)
    }

    if (!L.Browser.ie && !L.Browser.opera) {
      e.target.bringToFront();
    }

  }


  function onCountryMouseOut(e){
    geojson.resetStyle(e.target);

    if (currentTarget != null) {
      changeCountryColor(currentTarget, 2, 'red', .7)

      if (!L.Browser.ie && !L.Browser.opera) {
        currentTarget.bringToFront();
      }
    }
  }


  function onCountryClick(e){
    polylineLayergroup.clearLayers();
    polylneLayergroup = L.layerGroup();

    if (e.target.feature.properties.name == currentlySelectedCountry) {
      currentlySelectedCountry = null;
      currentTarget = null;
      geojson.resetStyle(e.target);
    }
    else {
      // deselect old country - could also potentially just use resetStyle
      if (currentTarget != null){
        changeCountryColor(currentTarget, 1, "#E3E3E3", .3)
      }

      // draw red border around selected country
      currentlySelectedCountry = e.target.feature.properties.name;
      currentTarget = e.target;
      changeCountryColor(currentTarget, 2, 'red', .7)

      // grab the data for that start country
      $.ajax({
        type: 'GET',
        url: '/map/query/' + currentlySelectedCountry,
        success: makeEndCountriesGreen()
      });
    }
  }

  function makeEndCountriesGreen() {
    return function(data) {
      endCountries = JSON.parse(data);

      // draw green border for possible end countries
      // this should really just be a lookup, not a for loop
        d3.json(COUNTRIES_DATA_JSON_URL, function (json){
          data = json.features;
          for (var i = 0; i < data.length; i++) {
            if (data[i].properties.name in endCountries) {
              coordinates = data[i].geometry.coordinates[0];

               // for some reason, we need to reverse the coordinates
              var reversed = reverseCoordinates(coordinates);
              myPolygon = L.polygon(reversed);
              latlngs.push(myPolygon);
              }
            }

            for (var i = 0; i < latlngs.length; i++) {
              changeCountryColor(latlngs[i], 2, 'green', .1)
              polylineLayergroup.addLayer(latlngs[i]);
            }

            polylineLayergroup.addTo(map);
            if (!L.Browser.ie && !L.Browser.opera) {
              currentTarget.bringToFront();
            }
            
            latlngs = Array();
          });
        }
  }

  function changeCountryColor(layer, weight, color, fillOpacity) {
    return layer.setStyle({
      weight: weight,
      color: color,
      dashArray: '',
      fillOpacity: fillOpacity,
    });
  }

  function reverseCoordinates(coordinates) {
    return coordinates.map(function reverse(item) {
      return Array.isArray(item) && Array.isArray(item[0]) 
        ? item.map(reverse) 
        : item.reverse();
      });
  } 
*/

});



