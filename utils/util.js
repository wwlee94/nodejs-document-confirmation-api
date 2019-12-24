var Jwt = require('jsonwebtoken');
var Exception = require('../exceptions/exception')

var Util = {};

Util.responseMsg = function(data){
  return{
    status: 200,
    data: data
  }
}

// 미들 웨어
Util.isLoggedin = function(req, res, next){
  var token = req.headers['x-access-token'];
  if (!token) return res.send('token is required !');
  else {
    Jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) { 
      if (err) {
        next(new Exception('Token invalid error !', 400));
      }
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = Util;