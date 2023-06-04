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
    }
}