const ws = require('ws');
const Lobby = require('./Lobbies/LobbyModel');
const UserService = require('./Users/UserService');

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

            socket.on('message', (data, isBinary) => {
                const jsonStr = String.fromCharCode(...data);
                const dataObj = JSON.parse(jsonStr);
                dataObj.socket = socket;

                let response = this.HandleMessage(dataObj);
                socket.send(JSON.stringify(response));
            });
        });
    }

    HandleMessage(msg){
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

                let lobby = new Lobby();
                this.lobbies[lobby.uuid] = lobby;

                let lobbyObject = this.ConnectUserToLobby(msg.data.uuid, lobby);

                respObj.data.lobby = lobbyObject;
            }; break;

            case "connect-to-lobby": {
                console.log("connect-to-lobby fired");

                let lobby = this.lobbies[msg.data.lobby_uuid];

                if(!lobby){
                    respObj.code = 1;
                    break;
                }

                let lobbyObject = this.ConnectUserToLobby(msg.data.user_uuid, lobby);

                respObj.data.lobby = lobbyObject;
            }; break;

            case "disconnect-from-lobby": {
                console.log("disconnect-from-lobby fired");

                let lobby = this.lobbies[msg.data.lobby_uuid];

                if(!lobby){
                    respObj.code = 1;
                    break;
                }

                let user = UserService.FindUser(msg.data.user_uuid)

                lobby.DisconnectUser(user);
            }; break;

            case "sync-lobby": {
                console.log("sync-lobby fired");

                let lobby = this.lobbies[msg.data.uuid];
                let lobbyObject = lobby.CreateLobbyObject();

                respObj.data.lobby = lobbyObject;
            }; break;
        }

        return respObj;
    }

    ConnectUserToLobby(user_uuid, lobby){
        let user = UserService.FindUser(user_uuid)
        lobby.ConnectUser(user);

        return lobby.CreateLobbyObject();
    }
}

module.exports = Server;