$(function() {
  var map = L.map('map').setView([41.505, 25.00], 3);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'sophiasanchez.c3eddfe3',
      accessToken: 'pk.eyJ1Ijoic29waGlhc2FuY2hleiIsImEiOiJjaWdrMjB5NzgwMDlidWpsenRjbzBqb3p2In0.46Rk8ZSkTEtq0cK3nAJmfQ'
  }).addTo(map);

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

  /**
   * Callback for when a country is highlighted. Will take care of the ui aspects, and it will call
   * other callbacks after done.
   * @param e
   */
  function onCountryHighLight(e){
    var layer = e.target;

    if (e.target.feature.properties.name == currentlySelectedCountry) {
      layer.setStyle({
        weight: 2,
        color: 'red',
        dashArray: '',
        fillOpacity: 0.7
      });
    }
    else {
      layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });
    }

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }

    var countryName = e.target.feature.properties.name;
    var countryCode = e.target.feature.properties.iso_a2;
  }

  /**
   * Callback for mouse out of the country border. Will take care of the ui aspects, and will call
   * other callbacks after done.
   * @param e the event
   */
  function onCountryMouseOut(e){
    geojson.resetStyle(e.target);
    var countryName = e.target.feature.properties.name;
    var countryCode = e.target.feature.properties.iso_a2;

    if (currentTarget != null) {
      var layer = currentTarget;

      layer.setStyle({
        weight: 2,
        color: 'red',
        dashArray: '',
        fillOpacity: 0.7
      });
      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }
    }
  }

  /**
   * Callback for when a country is clicked. Will take care of the ui aspects, and it will call
   * other callbacks when done
   * @param e
   */
  function onCountryClick(e){
  //callback for clicking inside a polygon

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
        var layer = currentTarget;
          layer.setStyle({
            fillColor: "#E3E3E3",
            weight: 1,
            opacity: 0.4,
            color: 'white',
            fillOpacity: 0.3
        });
      }

      // draw red border around selected country
      currentlySelectedCountry = e.target.feature.properties.name;
      currentTarget = e.target;
      var layer = currentTarget;

      layer.setStyle({
        weight: 2,
        color: 'red',
        dashArray: '',
        fillOpacity: 0.7
      });

      // grab the data for that start country
      $.ajax({
        type: 'GET',
        url: '/map/query/' + currentlySelectedCountry,
        success: function(data) {
            endCountries = JSON.parse(data);

            // draw green border for possible end countries
            d3.json(COUNTRIES_DATA_JSON_URL, function (json){
              data = json.features;
              for (var i = 0; i < data.length; i++) {
                if (data[i].properties.name in endCountries) {
                  coordinates = data[i].geometry.coordinates[0];

                  // for some reason, we need to reverse the coordinates
                  var reversed = coordinates.map(function reverse(item) {
                      return Array.isArray(item) && Array.isArray(item[0]) 
                             ? item.map(reverse) 
                             : item.reverse();
                    });

                  myPolygon = L.polygon(reversed);
                  latlngs.push(myPolygon);
                }
              }

              for (var i = 0; i < latlngs.length; i++) {
                latlngs[i].setStyle({
                  weight: 2,
                  color: 'green',
                  dashArray: '',
                  fillOpacity: 0.1
                  });
                polylineLayergroup.addLayer(latlngs[i]);

              }

              polylineLayergroup.addTo(map);
              if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
              }
              latlngs = Array();
            });
          },
          failure: function(data) {
            alert('Got an error dude'); // TODO: remove this, yo.
          }
      });
    }
  }
});
