var jwt = require('jsonwebtoken');

var util = {};

// 미들 웨어
util.isLoggedin = function(req,res,next){
  var token = req.headers['x-access-token'];
  if (!token) return res.send('token is required!');
  else {
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if(err) return next(err)
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = util;