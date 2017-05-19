var host = "127.0.0.1";
var port = 1337;
var express = require("express");

var app = express();
app.use('/', express.static(__dirname + '/'));
app.listen(port, host);

console.log('Running server at http://localhost:' + port + '/');

