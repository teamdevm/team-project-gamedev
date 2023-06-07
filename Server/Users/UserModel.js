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

    constructor(name, uuid, socket){
        this.name = name;
        this.uuid = uuid;
        this.socket = socket;
        this.currentLobby = null;
    }

    LinkToLobby(lobbyUUID){
        this.currentLobby = lobbyUUID;
    }

    CreateUserObject(){
        let user = {
            name: this.name,
            uuid: this.uuid
        }

        return user;
    }

    SendMessage(msg){
        this.socket.send(JSON.stringify(msg));
    }
}

module.exports = User;