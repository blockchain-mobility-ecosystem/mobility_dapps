var currentCoords = document.getElementById("currentCoords");
var marker, geocoder;

function addMarker(name, carObject) {
    var pos = {
        "lat": carObject.lat,
        "lng": carObject.lng
    };
    var marker = new Marker({
        position: pos,
        title: name,
        map: map
    });
}

document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);

    function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('address').value;
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                marker = new Marker({
                    map: resultsMap,
                    draggable: true,
                    position: results[0].geometry.location
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
});

function getLatLong() {
    currentCoords.innerHTML = marker.getPosition();
    return marker.getPosition();
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}
