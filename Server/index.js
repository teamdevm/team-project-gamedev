
require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const SocketServer = require('./server');
const path = require('path');
global.serverAppRoot = path.resolve(__dirname);

var socketServer;

let httpServer;
let httpsServer;
let socketHttpsServer;

var privateKey = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');

var credentials = {
    key: privateKey,
    cert: certificate
};

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

    httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpPort);

    socketHttpsServer = https.createServer(credentials);
    socketHttpsServer.listen(socketPort);
    socketServer = new SocketServer(socketHttpsServer);
    
    console.log(`HTTP server started on port ${httpPort}`);
    console.log(`Socket server started on port ${socketPort}`);
}

start();