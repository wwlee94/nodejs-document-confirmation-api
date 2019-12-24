var Express = require('express');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception')

var Users = Express.Router();

//index
Users.get('/', Util.isLoggedin, function(req, res, next){
  User.find({})
  .sort({ email: 1 })
  .exec(function(err, users){
    err || !users ? next(new Exception('Not found data !', 400)) : res.send(Util.responseMsg(users));
  });
});

//crete
Users.post('/', function(req, res, next){
  var user = new User(req.body);
  user.save(function(err, user){
    err || !user ? next(new Exception('Register user error !', 400)) : res.send(Util.responseMsg(user));
  });
})

// show
Users.get('/:email', util.isLoggedin, function(req, res, next){
  User.findOne({ email:req.params.email })
  .exec(function(err, user){
    err || !user ? next(new Exception('Not found data !', 400)) : res.send(Util.responseMsg(user));
  });
});

module.exports = Users;