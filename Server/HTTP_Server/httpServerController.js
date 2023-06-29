const path = require('path');
const { v4: uuidv4 } = require('uuid');

class HTTPController {
    async SiteInitialization(req, res){
        let clientUUID = req.cookies.uuid;

        if(!clientUUID){
            res.cookie(
                'uuid',
                uuidv4(), {
                    sameSite: 'Strict'
                }
            );            
        }

        res.sendFile(path.join(serverAppRoot + '/HTMLGame/Game.html'));
    }
}

module.exports = new HTTPController();