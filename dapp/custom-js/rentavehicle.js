initMap();

function initMap() {
    map = new google.maps.Map(document.getElementById('rent-a-vehicle-map'), {
        center: { lat: 40.7358469, lng: -74.0420572 },
        zoom: 15
    });
    infoWindow = new google.maps.InfoWindow;

    // Below is for gelocation auto-detect
    /*    // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                marker = new Marker({
                    position: pos,
                    map: map,
                    draggable: true,
                    icon: {
                        path: MAP_PIN,
                        fillColor: '#f56954',
                        fillOpacity: 1,
                        strokeColor: '#FFF',
                        strokeWeight: 2
                    },
                    map_icon_label: '<span class="map-icon map-icon-car-rental"></span>'
                });
                //infoWindow.setPosition(pos);
                //infoWindow.setContent('Location found.');
                infoWindow.open(map);
                map.setCenter(pos);
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }*/
    geocoder = new google.maps.Geocoder();
}

function addRentableVehicles() {
    // TODO: get global file
    //var globalFileJSON = retrieveFileFromIPFS(retrieveGlobalFile());

    // parse global file
    var globalFileJSON = { "States": { "NewYork": ["QmacziDbWJ5dYTaq1ZgRMu3ZHAPDSwJBhpuUCdsVFcKS1G"], "Texas": [] }, "last_updated": "0000000000000" };

    // https://coderwall.com/p/kvzbpa/don-t-use-array-foreach-use-for-instead
    for (i = 0; i < globalFileJSON.States.NewYork.length; i++) {
        console.log("globalFileJSON.States.NewYork[i] is: " + globalFileJSON.States.NewYork[i]);
        var userFromList = retrieveFileFromIPFS(globalFileJSON.States.NewYork[i], function(result) {
            console.log("inside var userFromList: " + result);

            // {"userid":"0xa7427f960122a47997c5f26ab067ba73c753578a","vehicles":["QmdywW3hLj6ztujWyei3b3192kGtPNpKgXAyzEdBBridfA","QmWYpy7WC79qfSwTsRQ2J55XJwQNi6ytexNsCnZnu7Rqkv"]}
            var userID = result.userid;
            console.log("userID: " + userID);
            for (j = 0; j < result.vehicles.length; j++) {
                var resolvedVehicle = resolveFromIPNS(result.vehicles[j], function(vehicleIPNS) {
                    console.log("inside resolvedVehicle: " + vehicleIPNS);
                    var cleanIPNSAddress = JSON.stringify(vehicleIPNS.Path).slice(7).replace("\"", "");
                    console.log("resolvedVehicle cleaned string: " + cleanIPNSAddress);
                    var userFromList = retrieveFileFromIPFS(cleanIPNSAddress, function(vehicleFile) {
                        console.log("vehicleFile is: " + vehicleFile);
                        return addMarkerFromIPFS(vehicleFile);
                    });
                });
            }
        });


    }
}

function addMarkerFromIPFS(vehicleFile) {
    var pos = {
        lat: vehicleFile.loc.lat,
        lng: vehicleFile.loc.lon
    };

    var contentString = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h1 id="firstHeading" class="firstHeading">50 MOB Tokens</h1>' +
        '<div id="bodyContent">' +
        '<p>' + vehicleFile.info.year + ' ' + vehicleFile.info.make + ' ' + vehicleFile.info.model + '</p>' +
        '</div>' +
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });


    marker = new Marker({
        title: (vehicleFile.info.year + ' ' + vehicleFile.info.make + ' ' + vehicleFile.info.model),
        position: pos,
        map: map,
        draggable: false,
        icon: {
            path: MAP_PIN,
            fillColor: '#f56954',
            fillOpacity: 1,
            strokeColor: '#FFF',
            strokeWeight: 2
        },
        map_icon_label: '<span class="map-icon map-icon-car-rental"></span>'
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
}


function addMarker(name, carObject) {
    var pos = {
        "lat": carObject.lat,
        "lng": carObject.lon
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