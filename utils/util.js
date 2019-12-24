var Jwt = require('jsonwebtoken');
var Exception = require('../exceptions/exception')

var Util = {};

Util.responseMsg = function(data){
  return{
    statusCode: 200,
    data: data
  }
}

Util.isLoggedin = function(req, res, next){
  var token = req.headers['x-access-token'];
  if (!token) return next(new Exception('로그인 후 발급된 토큰이 필요합니다 !', 400))
  else {
    Jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) { 
      if (err) {
        next(new Exception('유효한 토큰이 아닙니다 !', 401));
      }
      else {
        req.user = decoded;
        next();
      }
    });
  }
};

module.exports = Util;