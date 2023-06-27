const User = require('./UserModel');

class UserService {
    /**
     * @type {Object.<string, User>}
     */
    users;

    constructor(){
        this.users = {};
    }

    /**
     * Registry new connected user in system
     * @param {{
     *      name: string,
     *      uuid: string
     * }} userData User main data
     * @param {WebSocket} socket User's socket
     */
    RegistryInSystem(userData, socket){
        if(!this.FindUser(userData.uuid)){
            this.users[userData.uuid] = new User(userData.name, userData.uuid, socket);
        } else {
            this.users[userData.uuid].socket = socket;
            this.users[userData.uuid].name = userData.name;
        }
    }

    /**
     * Unregister user from user system
     * @param {string} uuid User uuid 
     */
    UnregisterFromSystem(uuid){
        delete this.users[uuid];
    }

    /**
     * Find user in system by UUID
     * @param {string} uuid User UUID
     * @returns {User}
     */
    FindUser(uuid){
        return this.users[uuid];
    }
}

module.exports = new UserService();