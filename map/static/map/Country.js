function Country (leafletMap, countryName, coordinates, polygonType) {
  // for some reason, we need to reverse the coordinates

  var reverseCoordinates = function(coordinates) {
    return coordinates.map(function reverse(item) {
      return Array.isArray(item) && Array.isArray(item[0])
        ? item.map(reverse)
        : item.reverse();
      });
  };

  var createPolygon = function() {
    if (polygonType === "Polygon") {
      return L.polygon(coordinates);
    }
    else {
      return L.multiPolygon(coordinates);
    }
  }

  this.getPolygonCenter = function () {
    // hardcoded because multipolygon center formula didn't work, looking for better solution
    if (countryName === "Russia") {
      return [62.431074232920906, 95.2734375]
    }
    else {
      return polygon.getBounds().getCenter();
    }
  }

  var polygon = createPolygon();
  this.tripDetails = null;
  this.state = null;
  this.name = countryName;

  // Refactor code to delete this?
  this.setTripDetails = function(details) {
    this.tripDetails = details;
  }

  this.reversePolygon = function() {
    if (polygonType === "Polygon") {
      polygon = L.polygon(reverseCoordinates(coordinates), {clickable: false});
    }
    else {
      polygon = L.multiPolygon(reverseCoordinates(coordinates), {clickable: false});
    }
  }

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

  this.getMarker = function() {
    var marker = new L.marker(this.getPolygonCenter());
    return marker;
  }

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
      fillOpacity: .1
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

  this.closePricePopUp = function() {
    leafletMap.closePopup()
  }

  this.addPricePopUp = function() {
    cities = Object.keys(this.tripDetails);
    modesOfTransport = []
    for (var i=0; i<cities.length;i++) {
      modesOfTransport.push(Object.keys(this.tripDetails[cities[i]]))
    }
    var mergedModesOfTransport = [].concat.apply([], modesOfTransport);
    mergedModesOfTransport = this.unique(mergedModesOfTransport).join().replace(/,/g, ", ")
    polygon.bindPopup("Modes of Transport to " + this.name + ": " + mergedModesOfTransport, {offset: new L.Point(0, -30)}).openPopup();
  }

  this.unique = function(lst) {
    var result = [];
    $.each(lst, function(i, e) {
      if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  }
};