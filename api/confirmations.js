var Express = require('express');
var Confirmation = require('../models/confirmation');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Confirmations = Express.Router();

Confirmations.get('/', Util.isLoggedin, function(req, res, next){
    res.send('hello, confiramtions get !');
});

Confirmations.post('/', Util.isLoggedin, function(req, res, next){

    // 토큰 검증
    if (req.body.user_email) {
        if (req.user.email !== req.body.user_email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.'));
    }

    // 승인 종류
    confirmationList = ['APPROVED', 'CANCELED'];
    var confirm = req.body.confirmation;
    if (confirm && !confirmationList.includes(req.body.confirmation)) return next(new Exception.InvalidParameterError("confirmation은 ['APPROVED', 'CANCELED'] 중 하나를 가집니다."))

    var confirmation = new Confirmation(req.body);
    confirmation.save(function(err, confirmation){
        if (err) return next(new Exception.ExceptionError(err.message));
        res.send(Util.responseMsg('문서를 결재했습니다.'));
    });
});

module.exports = Confirmations;