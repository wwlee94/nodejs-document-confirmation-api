var Document = require('../models/document');
var Mongoose = require('mongoose');

// MongoDB 설정
Mongoose.Promise = global.Promise;
Mongoose.connect( "mongodb+srv://nodejs:nodejs@cluster-nodejs-dnpk0.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true 
});
var db = Mongoose.connection;
db.once('open', function () { console.log('Successfully connected to MongoDB!'); });

// var doc = new Document({
//     user_email: "wjdtjddus1109@naver.com",
//     title: '세번째 결제 서류',
//     content: '내용은 다음과 같습니다',
//     approval_order: ['wjdtjddus1109@naver.com']
// });

// doc.save(function(err, doc){
//   err || !doc ? console.error(`Error : ${err}`) : console.log(doc);
// });

var doc = Document.find({user_email: 'wjdtjddus1109@naver.com'});
doc.exec(function(err, doc){
    // err 이고 user 없으면
    err || !doc ? console.error(`Error : ${err}`) : console.log(doc);
});