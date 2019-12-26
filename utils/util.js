var Jwt = require('jsonwebtoken');
var Exception = require('../exceptions/exception')

var Util = {};

Util.responseMsg = function(data){
    return{
        status: 200,
        data: data
    }
}

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