var Express = require('express');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception')

var Users = Express.Router();

// //index
// Users.get('/', Util.isLoggedin, function(req, res, next){
//   User.find({})
//   .sort({ email: 1 })
//   .exec(function(err, users){
//     err || !users ? next(new Exception(err, 400)) : res.send(Util.responseMsg(users));
//   });
// });

//crete
Users.post('/', function(req, res, next){
  var user = new User(req.body);
  user.save(function(err, user){
    err || !user ? next(new Exception(err, 400)) : res.send(Util.responseMsg(user));
  });
})

// show
Users.get('/:email', Util.isLoggedin, function(req, res, next){
  User.findOne({ email:req.params.email })
  .exec(function(err, user){
    err || !user ? next(new Exception(err, 400)) : res.send(Util.responseMsg(user));
  });
});

// destroy
Users.delete('/:email', Util.isLoggedin, checkPermission, function(req, res, next){
  User.findOneAndRemove({ email:req.params.email })
  .exec(function(err, user){
    // err 이고 user 없으면
    err || !user ? next(new Exception(err, 400)) : res.send(Util.responseMsg({ 'user': user, 'message': user.email + ' delete success !'}));
  });
});

module.exports = Users;

function checkPermission(req, res, next){
  User.findOne({ email: req.params.email }, function(err, user){
    if(err) return next(new Exception(err, 400));
    else if (!user) return next(new Exception('Not found data !', 400));
    else if (!req.decoded || user._id != req.decoded._id) 
      return res.send('You don\'t have permission', 401);
    else next();
  });
}