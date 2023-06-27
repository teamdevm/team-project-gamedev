const RecieveHandler = require('../ServerUtils/WSMessageHandler');

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
     * Lobby UUID where user right now
     * @type {string}
     */
    currentLobby;

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
        this.currentLobby = null;
    }

    /**
     * Set lobby UUID to this user
     * @param {string} lobbyUUID 
     */
    LinkToLobby(lobbyUUID){
        this.currentLobby = lobbyUUID;
    }

    /**
     * Create User object with main info
     * @returns {{
     *      name: string,
     *      uuid: string
     * }} user object
     */
    CreateUserObject(){
        let user = {
            name: this.name,
            uuid: this.uuid
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