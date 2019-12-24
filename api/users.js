var Express = require('express');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Users = Express.Router();

//index
Users.get('/', Util.isLoggedin, findAllOrderByEmail);

// 유저 생성
Users.post('/', createUser);

// 토큰 값 + 이메일로 유저 조회
Users.get('/:email', Util.isLoggedin, findUserByEmailAndToken);

// 유저 삭제
Users.delete('/:email', Util.isLoggedin, checkPermission, deleteUserByEmail);

module.exports = Users;

function findAllOrderByEmail(req, res, next){
  User.find({})
  .sort({ email: 1 })
  .exec(function(err, users){
    err || !users ? next(new Exception(err, 400)) : res.send(Util.responseMsg(users));
  });
}

function createUser(req, res, next){
  var user = new User(req.body);
  user.save(function(err, user){
    err || !user ? next(new Exception(err, 400)) : res.send(Util.responseMsg(user));
  });
}

function findUserByEmailAndToken(req, res, next){
  User.findOne({ email:req.params.email })
      .exec(function(err, user){
        err || !user ? next(new Exception(err, 400)) : res.send(Util.responseMsg(user));
      });
}

function checkPermission(req, res, next){
  console.error(req.user)
  User.findOne({ email: req.params.email }, function(err, user){
    if(err) return next(new Exception(err, 400));
    else if (!user) return next(new Exception('user를 찾을 수 없습니다.', 400));
    else if (!req.user || user._id != req.user._id) 
      return res.send('유저를 삭제할 권한이 없습니다.', 401);
    else next();
  });
}

function deleteUserByEmail(req, res, next){
  User.findOneAndRemove({ email:req.params.email })
      .exec(function(err, user){
        // err 이고 user 없으면
        err || !user ? next(new Exception(err, 400)) : res.send(Util.responseMsg({ 'user': user, 'message': `${user.email} 가 삭제되었습니다 !`}));
      });
}