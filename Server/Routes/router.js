const path = require('path');
const Router = require('express');
let router = new Router();

const httpController = require('../HTTP_Server/httpServerController');

router.use('/', Router.static(path.join(serverAppRoot + '/TestBuild')));
router.get('/', httpController.SiteInitialization);

module.exports = router;