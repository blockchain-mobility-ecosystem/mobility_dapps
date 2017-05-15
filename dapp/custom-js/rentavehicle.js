initMap();

function initMap() {
    map = new google.maps.Map(document.getElementById('rent-a-vehicle-map'), {
        center: { lat: 40.713470, lng: -74.008969 },
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
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
    /*
        var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-33.8902, 151.1759),
            new google.maps.LatLng(-33.8474, 151.2631));
        map.fitBounds(defaultBounds);*/

    // Create the search box and link it to the UI element.
    var input = /** @type {HTMLInputElement} */ (
        document.getElementById('map-lookup'));
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    var searchBox = new google.maps.places.SearchBox(
        /** @type {HTMLInputElement} */
        (input));

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        markers = [];

        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });

        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: image,
                title: place.name,
                position: place.geometry.location
            });

            markers.push(marker);

            bounds.extend(place.geometry.location);
        }

        map.fitBounds(bounds);
    });
    // [END region_getplaces]

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}

function searchBox() {
    function initialize() {

        var markers = [];
        var map = new google.maps.Map(document.getElementById('rent-a-vehicle-map'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-33.8902, 151.1759),
            new google.maps.LatLng(-33.8474, 151.2631));
        map.fitBounds(defaultBounds);

        // Create the search box and link it to the UI element.
        var input = /** @type {HTMLInputElement} */ (
            document.getElementById('map-lookup'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var searchBox = new google.maps.places.SearchBox(
            /** @type {HTMLInputElement} */
            (input));

        // [START region_getplaces]
        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }
            for (var i = 0, marker; marker = markers[i]; i++) {
                marker.setMap(null);
            }

            // For each place, get the icon, place name, and location.
            markers = [];
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0, place; place = places[i]; i++) {
                var image = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                var marker = new google.maps.Marker({
                    map: map,
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });

                markers.push(marker);

                bounds.extend(place.geometry.location);
            }

            map.fitBounds(bounds);
        });
        // [END region_getplaces]

        // Bias the SearchBox results towards places that are within the bounds of the
        // current map's viewport.
        google.maps.event.addListener(map, 'bounds_changed', function() {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });
    }

    google.maps.event.addDomListener(window, 'load', initialize);

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

function demo() {
    var v1 = { "CID": "0xa7427f960122a47997c5f26ab067ba73c753578a", "info": { "vin": "K538822", "year": 2017, "make": "Toyota", "model": "Prius", "color": "Black", "transmission": "ai", "seats": 4 }, "loc": { "time": 1494646169000, "lat": 40.711632, "lon": -74.009017, "alt": 86.4 }, "speed": 1.74088 }
    addMarkerFromIPFS(v1);
    var v2 = { "CID": "0xa7427f960122a47997c5f26ab067ba73c753578a", "info": { "vin": "K538822", "year": 2017, "make": "Toyota", "model": "Yaris", "color": "Blue", "transmission": "ai", "seats": 4 }, "loc": { "time": 1494646169000, "lat": 40.714283, "lon": -74.006142, "alt": 86.4 }, "speed": 1.74088 }
    addMarkerFromIPFS(v2);
    var v3 = { "CID": "0xa7427f960122a47997c5f26ab067ba73c753578a", "info": { "vin": "K538822", "year": 2017, "make": "Toyota", "model": "Forerunner", "color": "Red", "transmission": "ai", "seats": 4 }, "loc": { "time": 1494646169000, "lat": 40.713096, "lon": -74.010541, "alt": 86.4 }, "speed": 1.74088 }
    addMarkerFromIPFS(v3);
    var v4 = { "CID": "0xa7427f960122a47997c5f26ab067ba73c753578a", "info": { "vin": "K538822", "year": 2017, "make": "Toyota", "model": "Tundra", "color": "White", "transmission": "ai", "seats": 4 }, "loc": { "time": 1494646169000, "lat": 40.715064, "lon": -74.008138, "alt": 86.4 }, "speed": 1.74088 }
    addMarkerFromIPFS(v4);
    console.log(v1.constructor.name);
}

demo();

function addMarkerFromIPFS(vehicleFile) {
    var pos = {
        lat: vehicleFile.loc.lat,
        lng: vehicleFile.loc.lon
    };

    var contentString = '<div id="content">' +
        '<h4>' + vehicleFile.info.year + ' ' + vehicleFile.info.make + ' ' + vehicleFile.info.model + '</h4>' +
        '<img src="images/' + vehicleFile.info.model.toLowerCase() + '.png" class="car-maps-window-image" alt="' + vehicleFile.info.make + '">' +
        '<h5>50 MOB per day</h5>' +
        '<div id="bodyContent">' +
        '<a data-toggle="modal" data-target="#registerVehicle data-vehicle="' + + '""><h5>Register this car</h3></4>' +
        '</div>' +
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });


    var marker = new Marker({
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
