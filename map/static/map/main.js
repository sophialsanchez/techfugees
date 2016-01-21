$(function() {

  myMap = new Map();
  instructionsAlert();
  $('#startOver').click(startOver)
  $('#endTrip').click(endTrip)
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
  }

  function endTrip() {
    swal({   title: "Mapping Smuggling Networks",   text: "You have ended your trip.",   type: "info",   confirmButtonText: "Got it!" });
    myMap.clear();
  }

  function uncheckBoxes()
  {
    var checkboxes = document.getElementsByTagName('input');   
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
  }
});

