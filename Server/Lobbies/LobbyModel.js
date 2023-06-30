const { default: ShortUniqueId } = require('short-unique-id');
const suuid = new ShortUniqueId({ length: 4 });
const User = require('../Users/UserModel');
const GameService = require('../Game/GameService');
const RecieveHandler = require('../ServerUtils/WSMessageHandler');
const UserService = require('../Users/UserService');
const maxPlayerConst = 4;

/**
 * Lobby (Room) class
 */
class Lobby {
    /**
     * Current number of players in lobby
     * @type {number}
     */
    currentPlayers;

    /**
     * Max possible players in lobby
     * @type {number}
     */
    maxPlayers;

    /**
     * Users currently in lobby
     * @type {User[]}
     */
    users;

    /**
     * Lobby UUID
     * @type {string}
     */
    uuid;

    /**
     * Private variable (If private, other users cannot see lobby).
     * @type {boolean}
     */
    private;

    /**
     * Started game flag
     * @type {boolean}
     */
    started;

    /**
     * Game service object which serving lobby
     * @type {GameService}
     */
    gameService;

    _srv;

    constructor(_srv){
        this.maxPlayers = maxPlayerConst;
        this.currentPlayers = 0;
        this.uuid = suuid();
        this.users = [];
        this.private = true;
        this._srv = _srv;
        this.gameService = null;
        this.started = false;
    }

    /**
     * Connect user to lobby and send connection message to all users, connected to lobby
     * @param {User} user User object
     * @returns {number}
     */
    ConnectUser(user){
        let userIndex = this.users.length; 

        let msg = {
            command: "player-enter-lobby",
            data: {
                index: userIndex,
                name: user.name
            }
        };

        this.users.forEach(async (item, i, arr) => {
            item.SendMessage(msg);
        });

        this.users[userIndex] = user;
        this.currentPlayers++;
        user.LinkToLobby(this);

        user.socket.onmessage = (event) => {
            RecieveHandler(user.socket, event.data, this);
        };

        return userIndex;
    }

    /**
     * Disconnect user from lobby and send message to all users in lobby
     * @param {User} user
     */
    DisconnectUser(user){
        let userIndex = this.users.findIndex((item, i, arr) => {
            if(item.uuid == user.uuid){
                return true;
            }
        });

        this.users.splice(userIndex, 1);
        this.currentPlayers--;

        for(let i = 0; i < this.users.length; i++){
            let msg = {
                command: "player-leave-lobby",
                data: {
                    index: userIndex,
                    new_index: i
                }
            };

            this.users[i].SendMessage(msg);
        }
    }

    /**
     * Start game
     */
    StartGame(){
        this.started = true;
        this.gameService = new GameService(this.users, this._srv);
    }

    CreateLobbyObject(){
        let usersList = [];

        for(let i = 0; i < this.users.length; i++){
            let userObject = this.users[i].CreateUserObject(false);
            userObject.index = i;
            usersList.push(userObject);
        }

        return {
            uuid: this.uuid,
            users: usersList
        }
    }

    HandleMessage(msg, callback){
        let respObj = {
            command: msg.command,
            code: 0,
            data: {}
        };

        switch(msg.command){
            case "disconnect-from-lobby": {
                console.log("disconnect-from-lobby fired");

                let user = UserService.FindUser(msg.data.user_uuid)

                this.DisconnectUser(user);
            }; break;

            case "sync-lobby": {
                console.log("sync-lobby fired");

                let lobbyObject = this.CreateLobbyObject();

                respObj.data.lobby = lobbyObject;
            }; break;

            case "start-game": {
                if(msg.data.user_uuid != this.users[0].uuid){
                    respObj.code = 1;
                    break;
                }

                this.StartGame();
            }
        }

        callback(respObj);
    }
}

module.exports = Lobby;