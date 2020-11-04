const http = require('http');
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 5000;

const server = http.createServer(app);

const io = require('socket.io')(server);

require("./app")(app, io);

server.listen(port, (err) => {
       if (err) return console.log(`Something bad happened: ${err}`);
       console.log(`Node.js server listening on ${port}`);
});

// const http = require('http');
// const ngrok = require('ngrok');

// const port = process.env.port || 80;

// const app = require("./app");

// const server = http.createServer(app);


// server.listen(port, (err) => {
//        if (err) return console.log(`Something bad happened: ${err}`);
//        console.log(`Node.js server listening on ${port}`);

//        ngrok.connect(port, function (err, url) {
//            console.log(`Node.js local server is publicly-accessible at ${url}`);
//        });
// });