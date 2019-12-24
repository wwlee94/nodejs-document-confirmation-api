var Express = require('express');
var Jwt = require('jsonwebtoken');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception')

var Auth = Express.Router();

// login
Auth.post('/login',
  function (req, res, next){
    error = {
      errors: {
        'name': 'ValidatorError',
        'log': ''
      }
    }
    msg = ''
    if(!req.body.email){
      msg += 'Email is required !\n ';
    }
    if(!req.body.password){
      msg += 'Password is required ! ';
    }
    error['errors']['log'] = msg
    if (msg !== '') return next(new Exception(error, 400));
    else next();
  },
  function(req, res, next){
    User.findOne({ email: req.body.email })
    .select({ email:1, password:1 })
    .exec(function(err, user){
      if(err) return next(new Exception(err, 500));
      else if(!user || !user.authenticatePassword(req.body.password))
        return next(new Exception('Email or Password is invalid', 401));
      else {
        var payload = {
          _id : user._id,
          email: user.email
        };
        var options = { expiresIn: 60*60*24 };
        Jwt.sign(payload, process.env.JWT_SECRET, options, function(err, token){
          if(err) return next(new Exception(err, 400));
          res.send(Util.responseMsg({ 'token': token }));
        });
      }
    });
  }
);

module.exports = Auth;