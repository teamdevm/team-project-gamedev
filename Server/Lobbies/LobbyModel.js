const { default: ShortUniqueId } = require('short-unique-id');
const suuid = new ShortUniqueId({ length: 4 });
const User = require('../Users/UserModel');
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

    constructor(){
        this.maxPlayers = maxPlayerConst;
        this.currentPlayers = 0;
        this.uuid = suuid();
        this.users = [];
        this.private = true;
    }

    ConnectUser(user){
        let msg = {
            command: "player-enter-lobby",
            data: {
                uuid: user.uuid,
                name: user.name
            }
        };

        this.users.forEach((item, i, arr) => {
            item.SendMessage(msg);
        });

        this.users.push(user);
        this.currentPlayers++;
    }

    DisconnectUser(user){
        let userIndex = this.users.findIndex((item, i, arr) => {
            if(item.uuid == user.uuid){
                return i;
            }
        });

        this.users.splice(userIndex, 1);
        this.currentPlayers--;

        let msg = {
            command: "player-leave-lobby",
            data: {
                uuid: user.uuid
            }
        };

        this.users.forEach((item, i, arr) => {
            item.SendMessage(msg);
        });
    }

    CreateLobbyObject(){
        let usersList = [];

        for(let i = 0; i < this.users.length; i++){
            usersList.push(this.users[i].CreateUserObject());
        }

        return {
            uuid: this.uuid,
            users: usersList
        }
    }
}

module.exports = Lobby;