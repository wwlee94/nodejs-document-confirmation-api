var Express = require('express');
var Confirmation = require('../models/confirmation');
var Document = require('../models/document');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Confirmations = Express.Router();
var title = '';

Confirmations.get('/', Util.isLoggedin, function(req, res, next){
    Confirmation.find().populate('document', 'userEmail title').exec((err, data) => {
        res.send(data);
    });
});
Confirmations.post('/', Util.isLoggedin, validateParamsAndToken, validateDocument);

module.exports = Confirmations;

// * promise 사용 할건지 코드 일관성 있도록 구현할 것

// 파라미터 & 토큰 검증
function validateParamsAndToken(req, res, next){

    // 파라미터 검증
    if (!req.body.id) return next(new Exception.InvalidParameterError('결재 서류 ID를 입력해주세요 !'));
    if (!req.body.email) return next(new Exception.InvalidParameterError('이메일을 입력해주세요 !'));
    if (!req.body.confirmation) return next(new Exception.InvalidParameterError('확인한 결재 서류가 승인인지 취소인지 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.body.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다 !'));
    
    // 승인 종류
    confirmationList = ['APPROVED', 'CANCELED'];
    var confirm = req.body.confirmation;
    if (confirm && !confirmationList.includes(req.body.confirmation)) return next(new Exception.InvalidParameterError("confirmation 값은 ['APPROVED', 'CANCELED'] 중 하나를 가집니다 !"));
    next();
};

// 결재 서류 검증
function validateDocument(req, res, next){

    var title = '';
    // 결재 서류 ID 검증 및 confirm 가능한 문서인지
    Confirmation.find({ 'document': req.body.id }).populate('document', 'title confirmationOrder confirmedUsers').select('document')
        .then((result) => { 
            if (!result.length) return next(new Exception.InvalidParameterError('유효하지 않은 결재 서류 ID 입니다 !'));

            doc = result[0].document;
            title = doc.title;
            confirmationOrder = doc.confirmationOrder.filter(x => !doc.confirmedUsers.includes(x));
            if (confirmationOrder[0] !== req.body.email) return next(new Exception.ExceptionError(`해당 사용자는 결재 차례가 아닙니다 ! 다음 결재자는 '${confirmationOrder[0]}' 입니다.`));
     
            Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: req.body.email }})
                .catch((err) => { return next(new Exception.ExceptionError(err.message)); });

            params = {
                "document": req.body.id,
                "userEmail": req.body.email,
                "comment": req.body.comment || '',
                "confirmation": req.body.confirmation
            };
        
            var confirmation = new Confirmation(params);
            confirmation.save()
                .then((result) => res.send(Util.responseMsg(`'${title}' 제목의 문서를 결재했습니다.`)) )
                .catch((err) => { return next(new Exception.ExceptionError(err.message)); });
            return 'Hello';
        })
        .then((result) => console.log(result))
        .catch((err) => {
            return next(new Exception.ExceptionError(err.message));
        });
};