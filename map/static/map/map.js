  function Map() {
    var leafletMap = L.map('map').setView([41.505, 25.00], 3);
    var countries = {};
    var currentEndCountries = [];
    var trip = []
    var tripPolyline = null;
    var markerGroup = new L.LayerGroup();

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

    var updateTripLineMarkersAndItinerary = function() {
      drawTripLine();
      removeTripMarkers();
      addTripMarkers();
      updateItinerary();
    }

    var drawTripLine = function() {
      if (this.tripPolyline != null) {
        leafletMap.removeLayer(this.tripPolyline);
      }
      pointList = [];
      for (var i = 0; i < trip.length; i++) {
        pointList.push(countries[trip[i].country].getPolygonCenter());
      }
      this.tripPolyline = L.polyline(pointList)
      this.tripPolyline.addTo(leafletMap);
    }

    var removeTripMarkers = function() {
      leafletMap.removeLayer(markerGroup);
      markerGroup.clearLayers();
    }

    var addTripMarkers = function() {
      if (trip.length > 0) {
        firstCountry = countries[trip[0].country];
        lastCountry = countries[trip[trip.length-1].country];
        markerGroup.addLayer(firstCountry.getMarker());
        markerGroup.addLayer(lastCountry.getMarker());
        leafletMap.addLayer(markerGroup);
      }
    }

    var updateItinerary = function() {
      var list = document.getElementById('itineraryList');
      $("ul").empty(); // probably would be better to just add and subtract specific items
      var totalCost = 0;
      if (trip.length > 0) {
        for (var i = 0; i < trip.length - 1; i++) {
          if (trip[i].cost != null) {
            totalCost += trip[i].cost;
          }

          // Adds the main part of the trip entry
          fromCountryToCountry = trip[i].city + ", " + trip[i].country + " to " + trip[i+1].city + ", " + trip[i+1].country;
          mode = trip[i+1].mode
          mostRecentPrice = "Price (" + trip[i+1].year + "): " +"$" + trip[i+1].cost;
          entry = createItineraryEntryHTML(fromCountryToCountry, mode, mostRecentPrice);
          list.appendChild(entry);

          // Adds the (hidden) older prices
          allYears = Object.keys(trip[i+1].previousYears).sort(function(a, b){return b-a});
          olderPricesEntry = createOlderPricesEntryHTML(allYears, i);
          entry.appendChild(olderPricesEntry);

        }

        // Adds total cost to the bottom of the list
        totalCost += trip[trip.length - 1].cost; // gets the last cost; might wanna change
        var totalCostP = document.createElement('p');
        totalCostP.appendChild(document.createTextNode("Total cost: $" + totalCost));
        list.appendChild(totalCostP);
        setPricesAsHiddenOrShown();
      }
    }

    var createItineraryEntryHTML = function(fromCountryToCountry, mode, mostRecentPrice) {
      var entry = document.createElement('div');
      entry.setAttribute("id", "tripEntry");
      var header = document.createElement('h3');
      header.appendChild(document.createTextNode(fromCountryToCountry));
      entry.appendChild(header);
      entry.appendChild(document.createElement('br'));
      entry.appendChild(document.createTextNode("Mode: " + mode));
      entry.appendChild(document.createElement('br'));
      entry.appendChild(document.createTextNode(mostRecentPrice));
      entry.appendChild(document.createElement('br'));

      return entry;
    }

    var createOlderPricesEntryHTML = function(allYears, i) {
      var unorderedList = document.createElement('ul');
      unorderedList.setAttribute("class", "olderPrices");
      for (var j = 0; j < allYears.length; j++) {
        currYear = allYears[j];
        currPrice = trip[i+1].previousYears[currYear];
        if (currYear != trip[i+1].year) {
          var olderPrice = document.createElement('li')
          olderPrice.appendChild(document.createTextNode(currYear + ": $" + currPrice));
          unorderedList.appendChild(olderPrice);
        }
      }
      if (allYears.length == 0) {
        unorderedList.appendChild(document.createTextNode("No older prices available."))
      }
      return unorderedList;
    }

    function setPricesAsHiddenOrShown() {
      if ($('#showOlderPrices').is(':checked')) {
        $(".olderPrices").show();
      }
      else {
       $(".olderPrices").hide();
      } 
    }

    var selectStartCountry = function(startCountry) {
      if (!startCountry) { return; }

      // You can't click on a country that's not red or green, if it's not the very first selection in the trip
      if (trip.length > 0 && startCountry.state === 'grey') {
        return;
      }

      // If you're going backward (deselecting), update the map accordingly
      else if (startCountry.state === 'red') {
        startCountry = backtrackOneStepAndUpdateStartCountry(startCountry);
      }

      // If you're selecting the very first country, find all possible end countries, and update map
      else if (trip.length === 0) {
        startCountry.highlightRed();
        ajaxGetCitiesInACountry(startCountry.name);
      }

      // If you're going forward in the trip, select the city and mode of transport
      else if (startCountry.state === 'green') {
        forEachCountry(currentEndCountries, function(country) { country.removeHighlight() });
        startCountry.highlightRed();
        startCities = Object.keys(startCountry.tripDetails);
        selectCityPopUp(startCities, startCountry, false);
      }
    };

    var backtrackOneStepAndUpdateStartCountry = function(startCountry) {
        startCountry.removeHighlight();
        trip.pop();
        updateTripLineMarkersAndItinerary();
        forEachCountry(currentEndCountries, function(country) { country.removeHighlight() });
        if (trip.length > 0) {
          previousCountry = trip[trip.length - 1].country;
          startCountry = countries[previousCountry];
          startCountry.highlightRed();
          ajaxQueryByStartCity(trip[trip.length - 1].city, trip[trip.length - 1].country);
        }
        else {
          startCountry = null;
        }

        return startCountry;
    }

    var getCityButtons = function(startCities) {
      cityButtons = "";
      for (var i = 0; i < startCities.length; i++) {
        button = '<input class=\"visibleInput\" type=\"radio\" name=\"city\" value=\"' + cities[i] + '\">' + " " + cities[i] + '<br>'
        cityButtons = cityButtons + button;
      }

      return cityButtons;
    }

    var getTransportationInfo = function(startCountry, selectedCity) {
      transportation = Object.keys(startCountry.tripDetails[selectedCity]);
      fullTripInfo = {};
      fullTripInfoButtons = "";
        for (var i = 0; i < transportation.length; i++) {
          years = Object.keys(startCountry.tripDetails[selectedCity][transportation[i]]);
          mostRecentYear = Math.max.apply(Math, years);
          cost = startCountry.tripDetails[selectedCity][transportation[i]][mostRecentYear];
          button = '<input class=\"visibleInput\" type=\"radio\" name=\"mode\" value=\"' + transportation[i] + '\">' + " " + transportation[i] + ": $" + cost + " (" + mostRecentYear + ")" + '<br>'
          fullTripInfo[transportation[i]] = {cost: cost, year: mostRecentYear, previousYears: {}};
          for (var j = 0; j < years.length; j++) {
              if (years[j] != mostRecentYear) {
                costForThatYear = startCountry.tripDetails[selectedCity][transportation[i]][years[j]];
                fullTripInfo[transportation[i]].previousYears[years[j]] = costForThatYear;
              }
          }
          fullTripInfoButtons = fullTripInfoButtons + button
        }

        return {'buttons': fullTripInfoButtons,
                'fullTripInfo': fullTripInfo};
      }

    var noDataAvailablePopUp = function(startCountry) {
      swal({
        title: "Oops!",
        text: "Looks like there are no data entries available for " + startCountry.name + ". Please select a different country. If you have already started your journey, you can backtrack by clicking on the country again.",
      },
      function(isConfirm) {
        cancelPopUp;
      })
    }

    var selectCityPopUp = function(startCities, startCountry, departureBool) {
      buttons = getCityButtons(startCities);
      swal({
        title: "Select City",
        text: "Please select a city in " + startCountry.name + ":<br><br>" + buttons,
        html: true,
        showCancelButton: true,
        closeOnCancel: true, 
        closeOnConfirm: departureBool, // close if it's the first departure city, otherwise don't so that the transportation pop up shows up
        },
        function(isConfirm) {
          if (isConfirm) {
            selectedCity = $('input[name="city"]:checked').val();
            // if user is selecting the very first departure city, push that city to the trip and display the new end countries
            if (departureBool){
              startCountry.highlightRed();
              trip.push({country: startCountry.name, city: selectedCity, cost: null});
              ajaxQueryByStartCity(selectedCity, startCountry.name)
            }
            else {
              selectTransportationPopUp(startCountry, getTransportationInfo(startCountry, selectedCity), selectedCity);
            }
          }
          else {
            cancelPopUp(startCountry);
          }
        });
    }

    var selectTransportationPopUp = function(startCountry, tripInfo, selectedCity) {
      fullTripInfo = tripInfo.fullTripInfo;
      fullTripInfoButtons = tripInfo.buttons;
      swal({
        title: "Select Mode of Transportation",
        text: "Please select a mode of transportation to " + selectedCity + ", " + startCountry.name + ":<br><br>" + fullTripInfoButtons,
        html: true,
        showCancelButton: true,
        closeOnCancel: true,
        },
        function(isConfirm) {
          if (isConfirm) {
            previousCountry = trip[trip.length - 1].country;
            countries[previousCountry].removeHighlight();
            mode = $('input[name="mode"]:checked').val();
            trip.push({country: startCountry.name, city: selectedCity, cost: fullTripInfo[mode]["cost"], mode: mode, year: fullTripInfo[mode]["year"], previousYears: fullTripInfo[mode].previousYears});
            updateTripLineMarkersAndItinerary();
            ajaxQueryByStartCity(selectedCity, startCountry.name);
          }
          else {
            cancelPopUp(startCountry);
          }
        });
    }

    var cancelPopUp = function(startCountry) {
      startCountry.removeHighlight();
      forEachCountry(currentEndCountries, function(country) { country.removeHighlight() });
      if (trip.length > 0) {
        previousCountry = trip[trip.length - 1].country;
        countries[previousCountry].highlightRed();
        ajaxQueryByStartCity(trip[trip.length-1].city, trip[trip.length-1].country);
      }
    }

    var ajaxQueryByStartCity= function(city, country) {
      countryNoSpace = country;
      if (country.indexOf(" ") > -1) {
        countryNoSpace = country.replace(/ /g, "-");
      }
      if (city.indexOf(" ") > -1) {
        city = city.replace(/ /g, "-");
      }
      $.ajax({
        type: 'GET',
        url: '/map/queryByStartCity/' + countryNoSpace + "/" + city,
        success: function(reply) {
          endCountries = JSON.parse(reply);
          currentEndCountries = Object.keys(endCountries);
          if (currentEndCountries.length === 0) {
            noDataAvailablePopUp(countries[country]);
          }
          else {
            forEachCountry(currentEndCountries, function(country) { country.highlightGreen(); country.setTripDetails(endCountries[country.name])});
          }
        }
      });
    }

    var ajaxGetCitiesInACountry = function(ajaxCallName) {
      var ajaxCallNameNoSpace = ajaxCallName;
      if (ajaxCallName.indexOf(" ") > -1) {
        ajaxCallNameNoSpace = ajaxCallName.replace(/ /g, "-");
      }

      $.ajax({
        type: 'GET',
        url: '/map/getCitiesInACountry/' + ajaxCallNameNoSpace,
        success: function(reply) {
          citiesJSON = JSON.parse(reply);
          cities = citiesJSON[ajaxCallName]
          if (cities.length === 0) {
            noDataAvailablePopUp(countries[ajaxCallName]);
            backtrackOneStepAndUpdateStartCountry(countries[ajaxCallName]); // only want to do this because ajaxGetCitiesInACountry only called for very first country click
          }
          else {
            selectCityPopUp(cities, countries[ajaxCallName], true);
          }
        }
      });
    }

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

      if (country.state === 'green') {
        country.addPricePopUp();
      }

      if (country.state === null) {
        country.highlightGrey();
        if (!L.Browser.ie && !L.Browser.opera) {
          e.target.bringToFront();
        }
      }
    };

    var onCountryMouseOut = function(e) {
      var country = countryFromEvent(e);

      if (!country) { return; }

      if (country.state === 'green') {
        country.closePricePopUp();
      }

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
          var polygonType = data[i].geometry.type;
          // takes care of countries with several islands, like Italy
          var countryCoordinates = []
          if (data[i].geometry.type === "MultiPolygon") {
            for (var j = 0; j < data[i].geometry.coordinates.length; j++) {
              countryCoordinates.push(data[i].geometry.coordinates[j]);
            }
          }
          else {
            countryCoordinates = data[i].geometry.coordinates[0];
          }
          var country = new Country(leafletMap, countryName, countryCoordinates, polygonType);
          countries[countryName] = country;
        }

        L.geoJson(json, {
          style:  {
            fillColor: "#E3E3E3",
            weight: 1,
            opacity: 0.4,
            color: 'white',
            fillOpacity: 0.3
          },
          onEachFeature: function(feature, layer) {
            countries[feature.properties.name].reversePolygon();
            layer.on({
              mouseover : onCountryHighLight,
              mouseout : onCountryMouseOut,
              click: onCountryClick
            });
          },
          onCountryMouseOut: onCountryMouseOut,
          onCountryClick: onCountryClick,
        }).addTo(leafletMap);
      });
    };
    cacheCountries();

    var resetMapVars = function() {
      currentEndCountries = [];
      trip = []
      tripPolyline = null;
    }

    var clearMap = function() {
      if (trip.length === 0) {
        return;
      }
      else {
        countryName = trip[trip.length-1].country;
        countries[countryName].removeHighlight();
        forEachCountry(currentEndCountries, function(country) { country.removeHighlight() });
        if (this.tripPolyline != null) {
          leafletMap.removeLayer(this.tripPolyline);
        }
        $("ul").empty();
      }
    }

    this.getTrip = function() {
      return trip;
    }

    this.clear = function() {
      removeTripMarkers();
      clearMap();
      resetMapVars();
    }
  };