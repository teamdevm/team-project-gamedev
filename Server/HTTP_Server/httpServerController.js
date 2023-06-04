const path = require('path');
const { v4: uuidv4 } = require('uuid');

class HTTPController {
    async SiteInitialization(req, res){
        let clientUUID = req.cookies.uuid;

        if(!clientUUID){
            res.cookie(
                'uuid',
                uuidv4(), {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: false
                }
            );            
        }

        res.sendFile(path.join(serverAppRoot + '/TestBuild/TestBuild.html'));
    }
}

module.exports = new HTTPController();