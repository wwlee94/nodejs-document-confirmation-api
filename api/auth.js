var Express = require('express');
var Jwt = require('jsonwebtoken');
var User = require('../models/user');

var Auth = Express.Router();

// login
Auth.post('/login',
  function (req, res, next){
    var validationError = new Error('paramsValidationError');
    validationError.status = 400;
    validationError.message = ''
    if(!req.body.email){
      validationError.message += 'Email is required !\n';
    }
    else if(!req.body.password){
      validationError.message += 'Password is required !';
    }

    if (validationError.message !== '') return next(validationError);
    else next();
  },
  function(req, res, next){
    User.findOne({ email: req.body.email })
    .select({ email:1, password:1 })
    .exec(function(err, user){
      if(err) return next(err);
      else if(!user || !user.authenticatePassword(req.body.password))
        return res.send('Email or Password is invalid');
      else {
        var payload = {
          _id : user._id,
          email: user.email
        };
        var options = { expiresIn: 60*60*24 };
        Jwt.sign(payload, process.env.JWT_SECRET, options, function(err, token){
          if(err) return next(err);
          res.send(token);
        });
      }
    });
  }
);

module.exports = Auth;