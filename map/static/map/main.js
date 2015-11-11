var currentlySelectedCountry = null;
var currentTarget = null;
var endCountries = {};
var latlngs = Array();
var polylineLayergroup = L.layerGroup();

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
			async: false, // this is probably not the best way; use a callback function instead?
			success: function(data) {
       		 	endCountries = JSON.parse(data);
    		},
    		failure: function(data) { 
        		alert('Got an error dude');
    		}
		});

		// draw green border possible end countries
		// this is also asynchronous - need to use a callback to fix double-click bug?
		d3.json("{% static 'map/ne-countries-50m.json' %}", function (json){
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
					console.log(myPolygon);
				}
			}
		});

		for (var i = 0; i < latlngs.length; i++) {
			latlngs[i].setStyle({
				weight: 2,
				color: 'green',
				dashArray: '',
				fillOpacity: 0.1
				});
			polylineLayergroup.addLayer(latlngs[i]);

			};

		polylineLayergroup.addTo(map);

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
		latlngs = Array();
	}
}