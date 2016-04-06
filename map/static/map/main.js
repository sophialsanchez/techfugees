$(function() {

  myMap = new Map();
  myCsv = new csv();
  instructionsAlert();
  $('#startOver').click(startOver)
  $('#downloadCSV').click(downloadCSV)
  $('#showOlderPrices').click(function(){$(".olderPrices").toggle()});

  function instructionsAlert() {
    swal({
      title: "Mapping Smuggling Networks",
      text: "Click on a country to start building your itinerary. Red highlighting shows the country you have selected. Green highlighting shows places you can select based on available data.",
      html: true,
      type: "info",
      confirmButtonText: "Got it!" });
  }

  function startOver() {
    myMap.clear();
    uncheckBoxes();
  }

  function downloadCSV() {
    swal({
      title: "Download Itinerary",
      text: "Would you like to download your itinerary as a .csv?",
      showCancelButton: true,
      confirmButtonText: "Yes"
    },
    function(isConfirm) {
      if (isConfirm) {
        myCsv.downloadCSV(myMap.getTrip());
      }
    }
    );
  }

  function uncheckBoxes()
  {
    var checkboxes = document.getElementsByTagName('input');   
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
  }

});

