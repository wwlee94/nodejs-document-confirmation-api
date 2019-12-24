var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// env 설정
require('dotenv').config();

console.log('Start Nodejs Web Server !');

// MongoDB 설정
mongoose.Promise = global.Promise;
mongoose.connect( process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
});
var db = mongoose.connection;
db.once('open', function () {
  console.log('Successfully connected to MongoDB!');
});
db.on('error', function (err) {
  console.log('MongoDB Error: ', err);
});

var app = express();

// app.get('*', function(req, res, next) {
//   var error = new Error('My Error occurred');
//   error.status = 500;
//   next(error);
// });

// app 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  next();
});
app.use(logHandler);
app.use(errorHandler);

// 에러 핸들러 메소드
function logHandler(err, req, res, next) {
  console.error('[' + new Date() + ']\n' + err.stack);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.type('json').send(JSON.stringify({error: err}, null, 4));
}

// api 라우트 설정
app.use('/api/users', require('./api/users')); 

// server 설정
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('listening on port:' + port);
});