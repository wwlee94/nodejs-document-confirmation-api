const Express = require('express');
const _ = require("lodash");
const User = require('../models/user');
const Document = require('../models/document');
const Util = require('../utils/util');
const Exception = require('../exceptions/exception');

const Documents = Express.Router();

Documents.get('/', Util.isLoggedin, findDocuments);
Documents.get('/:id', Util.isLoggedin, findDocumentAndConfirmation);
Documents.post('/', Util.isLoggedin, createDocumentRunner);

module.exports = Documents;

// 요청된 타입에 따른 문서 목록을 찾아주는 함수
function findDocuments(req, res, next) {

    // 파라미터 검증
    if (!req.query.email) return next(new Exception.NotFoundParameterError('사용자 이메일을 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.query.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.'));

    // 문서의 상태 종류
    typeList = ['OUTBOX', 'INBOX', 'ARCHIVE'];
    type = req.query.type;
    email = req.query.email;

    if (type && typeList.includes(type)) {
        if (type === 'OUTBOX') {
            console.error('OUTBOX');
            findDocumentsBy({ userEmail: email, type: 'RUNNING' }, res);
        }
        else if (type === 'INBOX') {
            console.error('INBOX');
            findDocumentsBy({ confirmationOrder: email, type: 'RUNNING' }, res);
        }
        else {
            //내가 관여한 문서중 결재가 완료된 문서 -> (내가 생성한 문서이거나 결재 지목을 받은 문서)를 관여한 문서라고 정의했습니다.
            console.error('ARCHIVE');
            findDocumentsBy({ $or: [{ userEmail: email }, { confirmationOrder: email }], type: { $in: ['APPROVED', 'CANCELED'] } }, res);
        }
    }
    else if (type && !typeList.includes(type)) return next(new Exception.InvalidParameterError("type은 ['OUTBOX', 'INBOX', 'ARCHIVE'] 중 하나를 가집니다."));
    else {
        console.error('default');
        findDocumentsBy({ userEmail: req.query.email }, res);
    }
}

// email query 파라미터로 documents 찾아주는 함수
function findDocumentsBy(params, res) {

    Document.find(params).select('userEmail title type confirmationOrder confirmedUsers')
        .then(doc => {
            response = doc[0] ? doc : '검색된 데이터가 없습니다 !';
            res.send(Util.responseMsg(response));
        })
        .catch(err => { return next(new Exception.ExceptionError(err.message)); });
}

// 문서의 세부 정보를 찾아주는 함수
function findDocumentAndConfirmation(req, res, next) {
    Document.findOne({ '_id': req.params.id }).populate('confirmedUsers', 'userEmail comment confirmation')
        .then(doc => {
            if (doc) authenticateUserForShowDocument(doc, req, next);

            result = doc ? doc : '검색된 데이터가 없습니다 !';
            res.send(Util.responseMsg(result));
        })
        .catch(err => {
            if (err instanceof Exception.ExceptionError) return next(err);
            return next(new Exception.ExceptionError(err.message));
        });
}

// 문서의 세부정보 조회시 문서와 관련된 사용자들만 조회 가능하도록 권한 확인
function authenticateUserForShowDocument(doc, req, next) {
    authenticateUser = _.cloneDeep(doc.confirmationOrder);
    authenticateUser.push(doc.userEmail);
    if (!authenticateUser.includes(req.user.email)) return next(new Exception.Forbidden('해당 문서의 세부 정보를 조회할 권한이 없습니다 !'));
}

// 검증 후 결재 문서 생성하는 함수
function createDocumentRunner(req, res, next) {

    // 파라미터 검증
    if (!req.body.email) return next(new Exception.InvalidParameterError('사용자 이메일을 입력해주세요 !'));
    if (!req.body.title) return next(new Exception.InvalidParameterError('문서 제목을 입력해주세요 !'));
    if (!req.body.content) return next(new Exception.InvalidParameterError('문서 내용을 입력해주세요 !'));
    if (!req.body.order) return next(new Exception.InvalidParameterError('결재 순서를 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.body.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.'));

    //결재 요청한 email 검증
    emailList = req.body.order.split(',').map(x => x.trim());
    if (emailList.length >= 1) {
        User.find({ email: { $in: emailList } })
            .then(user => {
                if (user && emailList.length !== user.length) {
                    userEmail = user.map(x => x['email']);
                    invalidEmailList = emailList.filter(x => !userEmail.includes(x));
                    return next(new Exception.InvalidParameterError(`존재하지 않는 이메일입니다.\n [${invalidEmailList.join(', ')}]`));
                }
                createDocument(req, res, next);
            })
            .catch(err => { return next(new Exception.ExceptionError(err.message)); });
    }
    else return next(new Exception.InvalidParameterError('최소 1명 이상의 결재자를 입력해주세요.'));
}

// 결재 문서 생성하는 함수
function createDocument(req, res, next) {

    params = {
        "userEmail": req.body.email,
        "title": req.body.title,
        "content": req.body.content,
        "confirmationOrder": emailList
    };
    var document = new Document(params);
    document.save()
        .then(doc => {
            res.send(Util.responseMsg(`['${document.title}'] 결재 문서를 생성했습니다 !`));
        })
        .catch(err => { return next(new Exception.ExceptionError(err.message)); });
}