const express = require('express');
const app = express();
var server = require('http').Server(app);

var socket = require('socket.io');


app.get('/', (req, res) => {
    res.send('hi')
})



const port = process.env.PORT || 8080;
server.listen(port);
console.log('server listening on port ' + port);