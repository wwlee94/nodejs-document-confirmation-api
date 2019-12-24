var Express = require('express');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception')

var users = Express.Router();

// index
users.get('/', Util.isLoggedin, function(req, res, next){
  User.find({})
  .sort({ email: 1 })
  .exec(function(err, users){
    err || !users ? next(new Exception('Not found data !', 400)) : res.send(Util.responseMsg(data));
  });
});

module.exports = users;