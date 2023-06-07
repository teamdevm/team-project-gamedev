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
        this.srv = new ws.Server({ port: port });

        this.srv.on('connection', socket => {
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
        switch(msg.command){
            case "user-registration": {
                UserService.RegistryInSystem(msg.data, msg.socket);

                socket.on("error", (error) => {
                    UserService.UnregisterFromSystem(msg.data.uuid);
                });

                socket.on("close", (code, reason) => {
                    UserService.UnregisterFromSystem(msg.data.uuid);
                });

                return { code: 0 };
            }; break;

            case "create-lobby": {
                let lobby = new Lobby();
                this.lobbies[lobby.uuid] = lobby;

                let lobbyObject = this.ConnectUserToLobby(msg.data.uuid, lobby);

                return { 
                    code: 0,
                    lobby: lobbyObject
                };
            }; break;

            case "connect-to-lobby": {
                let lobby = this.lobbies[msg.data.lobby_uuid];

                if(!lobby){
                    return {
                        code: 1
                    };
                }

                let lobbyObject = this.ConnectUserToLobby(msg.data.user_uuid, lobby);

                return { 
                    code: 0,
                    lobby: lobbyObject
                };
            }; break;

            case "disconnect-from-lobby": {
                let lobby = this.lobbies[msg.data.lobby_uuid];

                if(!lobby){
                    return {
                        code: 1
                    };
                }

                let user = UserService.FindUser(msg.data.user_uuid)

                lobby.DisconnectUser(user);

                return {
                    code: 0
                }
            }; break;

            case "sync-lobby": {
                let lobby = this.lobbies[msg.data.uuid];
                let lobbyObject = lobby.CreateLobbyObject();

                return {
                    code: 0,
                    lobby: lobbyObject
                }
            }; break;
        }
    }

    ConnectUserToLobby(user_uuid, lobby){
        let user = UserService.FindUser(user_uuid)
        lobby.ConnectUser(user);

        return lobby.CreateLobbyObject();
    }
}

module.exports = Server;