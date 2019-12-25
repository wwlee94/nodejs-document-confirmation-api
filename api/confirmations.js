var Express = require('express');
var Confirmation = require('../models/confirmation');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Confirmations = Express.Router();

Confirmations.get('/', Util.isLoggedin, function(req, res, next){
    res.send('hello, confiramtions get !');
});
Confirmations.post('/', Util.isLoggedin, function(req, res, next){

    // 파라미터 검증
    if (!req.body.id) return next(new Exception.InvalidParameterError('결재 서류 ID를 입력해주세요 !'));
    if (!req.body.email) return next(new Exception.InvalidParameterError('이메일을 입력해주세요 !'));
    if (!req.body.confirmation) return next(new Exception.InvalidParameterError('결재가 승인인지 취소인지 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.body.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.'));
    
    // 승인 종류
    confirmationList = ['APPROVED', 'CANCELED'];
    var confirm = req.body.confirmation;
    if (confirm && !confirmationList.includes(req.body.confirmation)) return next(new Exception.InvalidParameterError("confirmation은 ['APPROVED', 'CANCELED'] 중 하나를 가집니다."))

    params = {
        "document_id": req.body.id,
        "email": req.body.email,
        "comment": req.body.comment || '',
        "confirmation": req.body.confirmation
    };

    var confirmation = new Confirmation(params);
    confirmation.save(function(err, confirmation){
        if (err) return next(new Exception.ExceptionError(err.message));
        res.send(Util.responseMsg('문서를 결재했습니다.'));
    });
});

module.exports = Confirmations;