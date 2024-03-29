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

        res.cookie(
            'addr',
            process.env.SOCKET_ADDRESS + ":" + process.env.SOCKET_PORT, {
                sameSite: 'Strict'
            }
        );

        res.sendFile(path.join(serverAppRoot + '/HTMLGame/Erudit.html'));
    }
}

module.exports = new HTTPController();