var Express = require('express');
var Jwt = require('jsonwebtoken');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception')

var Auth = Express.Router();

// login
Auth.post('/login', checkValidation, signIn);

module.exports = Auth;

function checkValidation(req, res, next){
    console.log('Check Email, Password Validation ...')
    msg = ''
    if(!req.body.email){
        msg += '이메일을 입력해주세요 !\n ';
    }
    if(!req.body.password){
        msg += '패스워드를 입력해주세요 ! ';
    }
    if (msg !== '') return next(new Exception.NotFoundParameterError(msg));
    else next();
}

function signIn(req, res, next){
    console.log('Sign in by email and token ...')
    User.findOne({ email: req.body.email })
        .select({ email:1, password:1 })
        .exec(function(err, user){
            if(err) return next(new Exception.ExceptionError(err.message));
            else if(!user || !user.authenticatePassword(req.body.password)) return next(new Exception.Forbidden('이메일 혹은 패스워드가 틀렸습니다. 다시 입력해주세요 !'));
            else {
                var payload = {
                    _id : user._id,
                    email: user.email
                };
                var options = { expiresIn: 60*60*24 };
                Jwt.sign(payload, process.env.JWT_SECRET, options, function(err, token){
                    if(err) return next(new Exception.ExceptionError(err.message));
                    res.send(Util.responseMsg({ 'token': token }));
                    console.log('Success sign in !');
                });
            }
        });
}