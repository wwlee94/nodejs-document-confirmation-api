var Express = require('express');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');
var User = require('../models/user')
var Document = require('../models/document');

var Documents = Express.Router();

Documents.get('/', Util.isLoggedin, findDocuments);
Documents.get('/:id', Util.isLoggedin, findDocumentsAndConfirmation);
Documents.post('/', Util.isLoggedin, createDocuments);

module.exports = Documents;

// 요청된 타입에 따른 문서 목록을 찾아주는 함수
function findDocuments(req, res, next){
    
    // 파라미터 검증
    if (!req.query.email) return next(new Exception.NotFoundParameterError('이메일을 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.query.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.'));

    // 문서의 상태 종류
    typeList = ['OUTBOX', 'INBOX', 'ARCHIVE'];
    type = req.query.type;
    email = req.query.email;

    if (type && typeList.includes(type)){
        if (type === 'OUTBOX'){
            console.error('OUTBOX');
            findDocumentsBy({ userEmail: email, type: 'RUNNING' }, res);
        }
        else if (type === 'INBOX'){
            console.error('INBOX');
            findDocumentsBy({ confirmationOrder: email, type: 'RUNNING' }, res);
        }
        else {
            //내가 관여한 문서중 결재가 완료된 문서 -> (내가 생성한 문서이거나 결재 지목을 받은 문서)를 관여한 문서라고 정의했습니다.
            console.error('ARCHIVE');
            findDocumentsBy({ $or: [{userEmail: email}, {confirmationOrder: email}], type: {$in: ['APPROVED', 'CANCELED']}}, res);
        } 
    }
    else if (type && !typeList.includes(type)) return next(new Exception.InvalidParameterError("type은 ['OUTBOX', 'INBOX', 'ARCHIVE'] 중 하나를 가집니다."));
    else {
        console.error('default');
        findDocumentsBy({ userEmail: req.query.email }, res);
    }
}

// email query 파라미터로 documents 찾아주는 함수
function findDocumentsBy(params, res){
    Document.find(params).select('userEmail title type confirmationOrder confirmedUsers')
        .then(doc => {
            response = doc[0] ? doc : '검색된 데이터가 없습니다.';
            res.send(Util.responseMsg(response));
        })
        .catch(err => { return next(new Exception.ExceptionError(err.message));
    });
}

// 문서의 세부 정보를 찾아주는 함수
function findDocumentsAndConfirmation(req, res, next){

    res.send('id는? '+req.params.id);
}

// 검증 후 결재 문서 생성하는 함수 ** promise로 수정 예정
function createDocuments(req, res, next){

    // 파라미터 검증
    if (!req.body.email) return next(new Exception.InvalidParameterError('이메일을 입력해주세요 !'));
    if (!req.body.title) return next(new Exception.InvalidParameterError('제목을 입력해주세요 !'));
    if (!req.body.content) return next(new Exception.InvalidParameterError('내용을 입력해주세요 !'));
    if (!req.body.order) return next(new Exception.InvalidParameterError('결재 순서를 입력해주세요 !'));

    // 토큰 검증
    if (req.user.email !== req.body.email) return next(new Exception.InvalidTokenError('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.'));

    //결재 요청한 email 검증 - 함수로 뺄지 고민
    emailList = req.body.order.split(',').map(x => x.trim());
    if (emailList.length >= 1){
        User.find({email: {$in : emailList}})
            .exec(function(err, user){
                if (err) return next(new Exception.ExceptionError(err.message, err.status));
                if (user && emailList.length !== user.length) {
                    userEmail = user.map(x => x['email']);
                    invalidEmailList = emailList.filter(x => !userEmail.includes(x));
                    return next(new Exception.InvalidParameterError(`존재하지 않는 이메일입니다.\n [${invalidEmailList.join(', ')}]`));
                }
                params = {
                    "userEmail" : req.body.email,
                    "title" : req.body.title,
                    "content" : req.body.content,
                    "confirmationOrder" : emailList
                };
                var document = new Document(params);
                document.save(function(err, document){
                    if (err) return next(new Exception.ExceptionError(err.message, 400));
                    res.send(Util.responseMsg(`'${document.title}' 결재 서류를 생성했습니다 !`));
                });
            });
    }
    else return next(new Exception.InvalidParameterError('최소 1명 이상의 결재자를 입력해주세요.'));
}