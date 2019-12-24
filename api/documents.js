var Express = require('express');
var Document = require('../models/document');
var Util = require('../utils/util');
var Exception = require('../exceptions/exception');

var Documents = Express.Router();

Documents.get('/', Util.isLoggedin, findDocumentsByEmail);

module.exports = Documents;

function findDocumentsByEmail(req, res, next){
    msg = '';
    if (!req.query.email) msg += '이메일을 입력해주세요 !';
    if (msg !== '') return next(new Exception(msg, 400));
    Document.find({ user_email: req.query.email })
            .exec(function(err, doc){
                if (err) return next(new Exception(err.message, 400));
                response = doc ? doc : '검색된 데이터가 없습니다.';
                res.send(Util.responseMsg(response));
            });
}