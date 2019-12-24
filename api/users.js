var express = require('express');
var User = require('../models/user');
var util = require('../utils/util');

var users = express.Router();

// index
users.get('/', util.isLoggedin, function(req,res,next){
  User.find({})
  .sort({ email: 1 })
  .exec(function(err, users){
    err || !users ? next(err) : res.send(users);
  });
});

module.exports = users;