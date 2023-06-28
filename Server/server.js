const ws = require('ws');
const Lobby = require('./Lobbies/LobbyModel');
const UserService = require('./Users/UserService');
const RecieveHandler = require('./ServerUtils/WSMessageHandler');
const { v4: uuidv4 } = require('uuid');

class Server {
    /**
     * WebSocketServer object, runned on server.
     * @type {ws.WebSocketServer}
     */
    srv;

    /**
     * @type {Object.<string, Lobby>}
     */
    lobbies;

    constructor(port){
        this.lobbies = {};        
        this.srv = new ws.Server({ port: port });

        this.srv.on('connection', socket => {
            console.log("New connection established");

            socket.onmessage = (event) => {
                RecieveHandler(socket, event.data, this);
            };

            socket.send(JSON.stringify({uuid: uuidv4()}));
        });
    }

    HandleMessage(msg, callback){
        let respObj = {
            command: msg.command,
            code: 0,
            data: {}
        };

        switch(msg.command){
            case "user-registration": {
                console.log("user-registration fired");

                UserService.RegistryInSystem(msg.data, msg.socket);

                msg.socket.on("error", (error) => {
                    UserService.UnregisterFromSystem(msg.data.uuid);
                });

                msg.socket.on("close", (code, reason) => {
                    UserService.UnregisterFromSystem(msg.data.uuid);
                });
            }; break;

            case "create-lobby": {
                console.log("create-lobby fired");

                let lobby = new Lobby(this);
                this.lobbies[lobby.uuid] = lobby;

                let lobbyObject = this.ConnectUserToLobby(msg.data.uuid, lobby);

                respObj.data.lobby = lobbyObject;
            }; break;

            case "connect-to-lobby": {
                console.log("connect-to-lobby fired");

                let lobby = this.lobbies[msg.data.lobby_uuid];

                if(!lobby || lobby.started){
                    respObj.code = 1;
                    break;
                }

                let lobbyObject = this.ConnectUserToLobby(msg.data.user_uuid, lobby);

                respObj.data.lobby = lobbyObject;
            }; break;
        }

        callback(respObj);
    }

    ConnectUserToLobby(user_uuid, lobby){
        let user = UserService.FindUser(user_uuid)
        lobby.ConnectUser(user);

        return lobby.CreateLobbyObject();
    }
}

module.exports = Server;