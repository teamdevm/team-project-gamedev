const User = require('./UserModel');

class UserService {
    /**
     * @type {Object.<string, User>}
     */
    users;

    constructor(){}

    RegistryInSystem(userData, socket){
        if(!FindUser){
            this.users[uuid] = new User(userData.name, userData.uuid, socket);
        } else {
            this.users[uuid].socket = socket;
            this.users[uuid].name = userData.name;
        }
    }

    UnregisterFromSystem(uuid){
        delete this.users[uuid];
    }

    FindUser(uuid){
        return users[uuid];
    }
}

module.exports = new UserService();