const ws = require('ws');

class Server {
    srv;

    constructor(port){
        this.srv = new ws.Server({ port: port });

        this.srv.on('connection', socket => {
            socket.on('message', (data, isBinary) => {
                
            });
        });
    }
}

module.exports = Server;