const RecieveHandler = require('../ServerUtils/WSMessageHandler');
const Lobby = require('../Lobbies/LobbyModel');
const GameService = require('../Game/GameService');

class User {
    /**
     * User name.
     * @type {string}
     */
    name;

    /**
     * User unique identificator (UUID).
     * @type {string}
     */
    uuid;

    /**
     * User's web socket.
     * @type {WebSocket}
     */
    socket;

    /**
     * Lobby object where user right now
     * @type {Lobby}
     */
    lobby;

    /**
     * GameService object where user right now
     * @type {GameService}
     */
    game;

    /**
     * User constructor
     * @param {string} name User name 
     * @param {string} uuid User UUID
     * @param {WebSocket} socket Socket which user connected to
     */
    constructor(name, uuid, socket){
        this.name = name;
        this.uuid = uuid;
        this.socket = socket;
        this.lobby = null;
        this.game = null;
    }

    /**
     * Set lobby object to this user
     * @param {string} lobby 
     */
    LinkToLobby(lobby){
        this.lobby = lobby;
    }

    /**
     * Set game service object to this user
     * @param {GameService} game 
     */
    LinkToGameService(game){
        this.game = game;
    }

    UnregisterFromServices(){
        if(this.lobby != null){
            this.lobby.DisconnectUser(this);
        }

        if(this.game != null){
            this.game.PlayerDisconnected({
                user_uuid: this.uuid
            });
        }
    } 

    /**
     * Create User object with main info
     * @returns {{
     *      name: string,
     *      uuid: string
     * }} user object
     */
    CreateUserObject(uuidFlag = true){
        let user = {
            name: this.name
        }

        if(uuidFlag){
            user.uuid = this.uuid;
        }

        return user;
    }

    /**
     * Send message to user by current opened socket
     * @param {{
     *      command: string,
     *      code: number,
     *      data
     * }} msg message object
     */
    SendMessage(msg){
        this.socket.send(JSON.stringify(msg));
    }

    SetMessageHandler(Handler){
        this.socket.on("message", (data, isBinary) => {
            RecieveHandler(socket, data, isBinary, Handler);
        });
    }
}

module.exports = User;