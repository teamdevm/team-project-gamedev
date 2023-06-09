const User = require('./UserModel');

class UserService {
    /**
     * @type {Object.<string, User>}
     */
    users;

    constructor(){
        this.users = {};
    }

    RegistryInSystem(userData, socket){
        if(!this.FindUser(userData.uuid)){
            this.users[userData.uuid] = new User(userData.name, userData.uuid, socket);
        } else {
            this.users[userData.uuid].socket = socket;
            this.users[userData.uuid].name = userData.name;
        }
    }

    UnregisterFromSystem(uuid){
        delete this.users[uuid];
    }

    FindUser(uuid){
        return this.users[uuid];
    }
}

module.exports = new UserService();