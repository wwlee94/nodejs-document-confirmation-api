var Express = require('express');
var User = require('../models/user');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Users = Express.Router();

// 이메일로 유저 조회
Users.get('/', Util.isLoggedin, findUserByEmail);

// 유저 생성
Users.post('/', createUser);

// 유저 삭제
Users.delete('/', Util.isLoggedin, checkPermission, deleteUserByEmail);

module.exports = Users;

function findUserByEmail(req, res, next){
    msg = '';
    if (!req.query.email) msg += '이메일을 입력해주세요 !';
    if (msg !== '') return next(new Exception.NotFoundParameterError(msg));
    User.findOne({ email: req.query.email })
        .exec(function(err, user){
            if (err) return next(new Exception.ExceptionError(err.message));
            response = user ? user : '검색된 데이터가 없습니다.';
            res.send(Util.responseMsg(response));
        });
}

function createUser(req, res, next){
    var user = new User(req.body);
    user.save(function(err, user){
        if (err) return next(new Exception.ExceptionError(err.message));
        res.send(Util.responseMsg(`${user.email} 계정을 생성했습니다 !`));
    });
}

function checkPermission(req, res, next){
    User.findOne({ email: req.params.email }, function(err, user){
        if(err) return next(new Exception.ExceptionError(err.message));
        else if (!req.user || user._id != req.user._id) return next(new Exception.Forbidden('유저를 삭제할 권한이 없습니다.'));
        else if (!user) return next(new Exception.NotFoundDataError(`'${req.user.email}' 사용자를 찾을 수 없습니다.`));
        else next();
    });
}

function deleteUserByEmail(req, res, next){
    User.findOneAndRemove({ email: req.query.email })
        .exec(function(err, user){
            if (err) return next(new Exception.ExceptionError(err.message));
            response = user ? { 'user': user.email, 'message': `${user.email} 가 삭제되었습니다 !`} : '검색된 데이터가 없습니다.';
            res.send(Util.responseMsg(response));
        });
}