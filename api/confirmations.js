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

    Confirmation.find({ 'document': req.body.id }).populate('document', 'title type confirmationOrder confirmedUsers').select('document')
        .then((result) => validateDocumentIdAndConfirm(result, req, res))
        .then((result) => createConfirmation(result, req, res))
        .catch((err) => {
            if (err instanceof Exception.ExceptionError) return next(err);
            return next(new Exception.ExceptionError(err.message));
        });
};

// 결재 서류 ID 검증 및 confirm 가능한 문서인지 검증
function validateDocumentIdAndConfirm(result, req, res){

    doc = result[0].document;
    title = doc.title;
    type = doc.type;

    if (!result.length) throw new Exception.InvalidParameterError('유효하지 않은 결재 서류 ID 입니다 !');
    if (type !== 'RUNNING') throw new Exception.InvalidParameterError('진행 중인 결재 서류만 컨펌이 가능합니다.');

    confirmationOrder = doc.confirmationOrder.filter(x => !doc.confirmedUsers.includes(x));
    if (confirmationOrder.length > 0 && confirmationOrder[0] !== req.body.email) throw new Exception.ExceptionError(`지금은 해당 사용자의 결재 차례가 아닙니다 ! 다음 결재자는 '${confirmationOrder[0]}' 입니다.`);
    if (req.body.confirmation === 'APPROVED'){
        if (confirmationOrder.length === 1) 
            return Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: req.body.email }, $set: { type: 'APPROVED' }});
        else 
            return Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: req.body.email }});
    }
    else return Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: req.body.email }, $set: { type: 'CANCELED' }});
}

// 결재 승인 생성
function createConfirmation(result, req, res){

    params = {
        "document": req.body.id,
        "userEmail": req.body.email,
        "comment": req.body.comment || '',
        "confirmation": req.body.confirmation
    };

    var confirmation = new Confirmation(params);
    return confirmation.save()
            .then((result) => {
                res.send(Util.responseMsg(`['${title}'] 문서를 결재했습니다.`));
            });
};