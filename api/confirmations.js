var Express = require('express');
var Confirmation = require('../models/confirmation');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Confirmations = Express.Router();

Confirmations.get('/', Util.isLoggedin, function(req, res, next){
    res.send('hello, confiramtions get !');
});

module.exports = Confirmations;