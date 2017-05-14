function storeValue(key, value) {
    if (typeof(Storage) !== "undefined") {
        return localStorage.setItem(key, value);
    } else {
        console.log("Browser does not support HTML5 webstorage.");
        alert("Your browser does not support HTML5 webstorage! Download a modern browser.");
    }
}

function retrieveValue(key) {
    if (typeof(Storage) !== "undefined") {
        return localStorage.getItem(key);
    } else {
        console.log("Browser does not support HTML5 webstorage.");
        alert("Your browser does not support HTML5 webstorage! Download a modern browser.");
    }
}

function confirmLocation() {
    var marker = getLatLong();
    storeValue("leaseLocation", getLatLong());
    console.log("Stored leaseLocation: " + getLatLong());
    storeValue("leaseTime", $('#timepicker1').val());
    console.log("Stored leaseTime: " + $('#timepicker1').val());
    document.getElementById("confirmLeaseButton").innerHTML = "Processing...";
    addLeaseCarToIPFS("0x0", marker.lat, marker.long, retrieveValue("leaseTime"));
    document.getElementById("confirmLeaseButton").innerHTML = "Complete!";
    // return window.location.assign("leaseconfirmed.html");
}

function addLeaseCarToIPFS(VCID, lat, lng, leaseTime) {
    var leaseObj = {
        "vehicleCID": VCID,
        "lat": lat,
        "lng": lng,
        "leaseTime": leaseTime,
        "lastUpdated": new Date().getTime()
    }
    return addFileToIPFS(leaseObj);
}

function retrieveLeaseCarFromIPFS(address) {
    ipfs.catJSON(address, (err, result) => {
        console.log(err, result);
    });
}

function createUserFile() {
    var userFile = {
        "userid": "0xa7427f960122a47997c5f26ab067ba73c753578a",
        "vehicles": [
            "QmdywW3hLj6ztujWyei3b3192kGtPNpKgXAyzEdBBridfA",
            "QmWYpy7WC79qfSwTsRQ2J55XJwQNi6ytexNsCnZnu7Rqkv"
        ]
    };
    return addFileToIPFS(userFile);
}


function signAndSend() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if ((this.readyState == 4 || this.readyState == 2) && this.status == 200) {
            //document.getElementById("demo").innerHTML =
            console.log(this.responseText);
        }
    };
    xhttp.open("GET", "http://play.oakeninnovations.com/caraccess?signed={%20address:%20%270xe31a295eae93bae9df252988f1267a5a64d34045%27,%20date:%20%272017-05-09T02:50:12.006Z%27,%20cmd:%20%27unlock%27,%20signature:%20%270xab97467fa19011e64d377271eef07a91a80384797ac978792f32058771077013480b0df0c56dea7ae33f22ded94d72a81b23a3c83757612fe18f6a65f5246fb100%27%20}", true);
    xhttp.send();
}
