var Express = require('express');
var Document = require('../models/document');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Documents = Express.Router();

Documents.get('/',function(req, res, next){
    res.send('docuement get root !');
});

module.exports = Documents;