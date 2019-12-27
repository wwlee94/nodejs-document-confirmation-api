const Express = require('express');
const Confirmation = require('../models/confirmation');
const Document = require('../models/document');
const Util = require('../utils/util');
const Exception = require('../exceptions/exception');

const Confirmations = Express.Router();

Confirmations.get('/', Util.isLoggedin, findConfirmationByEmail);
Confirmations.post('/', Util.isLoggedin, validateParamsAndToken, createConfirmationRunner);

module.exports = Confirmations;

// 결재 문서에 관여한 confirmation 검색
function findConfirmationByEmail(req, res, next) {
    Confirmation.find({ 'userEmail': req.query.email }).populate('document', 'title type').select('comment confirmation createdAt')
        .then(confirm => {
            res.send(Util.responseMsg(confirm));
        })
        .catch(err => {
            if (err instanceof Exception.ExceptionError) return next(err);
            return next(new Exception.ExceptionError(err.message));
        });
};

// 파라미터 & 토큰 검증
function validateParamsAndToken(req, res, next) {

    // 파라미터 검증
    if (!req.body.id) return next(new Exception.InvalidParameterError('결재 문서 ID를 입력해주세요 !'));
    if (!req.body.email) return next(new Exception.InvalidParameterError('사용자 이메일을 입력해주세요 !'));
    if (!req.body.confirmation) return next(new Exception.InvalidParameterError('확인한 결재 문서가 승인인지 취소인지 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.body.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다 !'));

    // 승인 종류
    confirmationList = ['APPROVED', 'CANCELED'];
    var confirm = req.body.confirmation;
    if (confirm && !confirmationList.includes(req.body.confirmation)) return next(new Exception.InvalidParameterError("confirmation 값은 ['APPROVED', 'CANCELED'] 중 하나를 가집니다 !"));
    next();
};

// 결재 확인 Runner 
function createConfirmationRunner(req, res, next) {

    Document.findOne({ '_id': req.body.id })
        .then(doc => validateDocumentIdAndConfirm(doc, req))
        .then(doc => createConfirmation(doc, req, res))
        .catch(err => {
            if (err instanceof Exception.ExceptionError) return next(err);
            return next(new Exception.ExceptionError(err.message));
        });
};

// 결재 문서 ID 검증 및 confirm 가능한 문서인지
function validateDocumentIdAndConfirm(doc, req) {

    if (!doc) throw new Exception.InvalidParameterError('유효하지 않은 결재 문서 ID 입니다 !');
    if (doc.type !== 'RUNNING') throw new Exception.InvalidParameterError('진행 중인 결재 문서만 컨펌이 가능합니다.');

    // 결재 순서에서 현재 결재된 사용자를 뺀 리스트
    confirmationOrder = doc.confirmationOrderFilter();
    if (confirmationOrder.length > 0 && doc.confirmationOrder[0] !== req.body.email) throw new Exception.ExceptionError(`지금은 해당 사용자의 결재 차례가 아닙니다 ! 다음 결재자는 '${confirmationOrder[0]}' 입니다.`);
    return doc;
};

// 결재 승인 생성
function createConfirmation(doc, req, res) {

    params = {
        "document": req.body.id,
        "userEmail": req.body.email,
        "comment": req.body.comment || '',
        "confirmation": req.body.confirmation
    };

    var confirmation = new Confirmation(params);
    return confirmation.save()
            .then(confirm => updateDocumentByConfirmedUser(confirm, doc, req, res));
};

// 현재 결재자의 결재에 따라 문서 업데이트 
function updateDocumentByConfirmedUser(confirm, doc, req, res){
    if (req.body.confirmation === 'APPROVED') {
        if (doc.confirmationOrderFilter().length === 1)
            updateRunner = Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: confirm._id }, $set: { type: 'APPROVED' } });
        else
            updateRunner = Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: confirm._id } });
    }
    else updateRunner = Document.updateOne({ _id: req.body.id }, { $push: { confirmedUsers: confirm._id }, $set: { type: 'CANCELED' } });

    updateRunner.then(result => {
        confirm_msg = req.body.confirmation === 'APPROVED' ? '승인' : '취소';
        res.send(Util.responseMsg(`'${params.userEmail}'님이 ['${doc.title}'] 문서를 ${confirm_msg}했습니다.`));
    });
}