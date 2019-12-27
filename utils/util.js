const Jwt = require('jsonwebtoken');
const Exception = require('../exceptions/exception')

var Util = {};

// 반환 메시지
Util.responseMsg = function(data){
    return{
        status: 200,
        data: data
    }
}

// 현재 로그인 된 상태인지 검증
Util.isLoggedin = function(req, res, next){
    var token = req.headers['x-access-token'];
    if (!token) return next(new Exception.NotFoundTokenError)
    else {
        Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { 
            if (err) next(new Exception.InvalidTokenError);
            else {
                req.user = decoded;
                next();
            }
        });
    }
};

module.exports = Util;