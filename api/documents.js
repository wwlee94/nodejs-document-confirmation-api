var Express = require('express');
var Document = require('../models/document');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Documents = Express.Router();

Documents.get('/', Util.isLoggedin, findDocuments);

module.exports = Documents;

function findDocuments(req, res, next){
    msg = '';
    if (!req.query.email) msg += '이메일을 입력해주세요 !';
    if (msg !== '') return next(new Exception(msg, 400));

    // 토큰 검증
    if (req.user.email !== req.query.email) return next(new Exception('발급 받은 토큰의 사용자 이메일과 입력한 이메일이 유효하지 않습니다.', 400));

    // 문서의 상태 종류
    type_list = ['OUTBOX', 'INBOX', 'ARCHIVE'];
    type = req.query.type;
    email = req.query.email;
    if (type && type_list.includes(type)){
        if (type === 'OUTBOX'){
            console.error('OUTBOX');
            findDocumentsBy({ user_email: email, type: 'RUNNING' }, res);
        }
        else if (type === 'INBOX'){
            console.error('INBOX');
            findDocumentsBy({ approval_order: email, type: 'RUNNING' }, res);
        }
        else {
            console.error('ARCHIVE');
            findDocumentsBy({ $or: [{user_email: email}, {approval_order: email}], type: {$in: ['APPROVED', 'CANCELED']}}, res);
        } 
    }
    else if (type && !type_list.includes(type)) return next(new Exception("type은 ['OUTBOX', 'INBOX', 'ARCHIVE'] 중 하나를 가집니다.", 400));
    else {
        console.error('default');
        findDocumentsBy({ user_email: req.query.email }, res);
    }
}

// email query 파라미터로 documents 찾아주는 함수
function findDocumentsBy(params, res){
    Document.find(params)
            .exec(function(err, doc){
                if (err) return next(new Exception(err.message, 400));
                response = doc ? doc : '검색된 데이터가 없습니다.';
                res.send(Util.responseMsg(response));
            });
}