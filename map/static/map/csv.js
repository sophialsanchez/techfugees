function csv() {
	var convertTripObjectToCSV = function(trip) {
		rowDelim = "\n";
		headers = "Trip leg, Start City, Start Country, End City, End Country, Cost (USD Equivalent), Mode of Transportation, Older Prices";
		data = headers + rowDelim;
		if (trip.length === 1) {
			row = "1," + trip[0].city + "," + trip[0].country + ",N/A,N/A,N/A,N/A,N/A" + rowDelim;
			data = data + row;
		}
		else if (trip.length > 0) {
			for (var i = 0; i < trip.length-1; i++) {
				tripLeg = i+1
				olderPricesObj = trip[i+1].previousYears;
				olderPricesKeys = Object.keys(olderPricesObj);
				olderPrices = "";
				for (var k=0; k < olderPricesKeys.length; k++) {
					console.log(olderPricesKeys[k])
					console.log(olderPrices)
					olderPrices = olderPrices + olderPricesKeys[k] + ": $" + olderPricesObj[olderPricesKeys[k]] + "; "; 
				}
				if (olderPrices == "") {
					olderPrices = "N/A"
				}
				row = tripLeg + "," + trip[i].city + "," + trip[i].country + "," + trip[i+1].city + "," + trip[i+1].country + ",$" + trip[i+1].cost + "," + trip[i+1].mode + "," + olderPrices + rowDelim;
				data = data + row;
			}
		}
		return data;
	}

	this.downloadCSV = function(trip) {
		var csvData = convertTripObjectToCSV(trip)
		if (csvData.length === 0) {return;}
		filename = "itinerary_export.csv";
		 if (!csvData.match(/^data:text\/csv/i)) {
            csvData = 'data:text/csv;charset=utf-8,' + csvData;
        }
        data = encodeURI(csvData);
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
	}
};