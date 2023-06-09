
require('dotenv').config();
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const SocketServer = require('./server');
const path = require('path');
global.serverAppRoot = path.resolve(__dirname);

var socketServer;

let httpServer;
let app = express();
const httpRouter = require('./Routes/router');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use('/', httpRouter);


var start = async () => {
    let httpPort = process.env.HTTP_PORT;
    let socketPort = process.env.SOCKET_PORT;

    httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    socketServer = new SocketServer(socketPort);
    
    console.log(`HTTP server started on port ${httpPort}`);
    console.log(`Socket server started on port ${socketPort}`);
}

start();