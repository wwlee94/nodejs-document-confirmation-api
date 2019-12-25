var Express = require('express');
var Mongoose = require('mongoose');
var BodyParser = require('body-parser');

// env 설정
require('dotenv').config();

console.log('Start Nodejs Web Server !');

// MongoDB 설정
Mongoose.Promise = global.Promise;
Mongoose.connect( process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
});
Mongoose.set('debug', true);
var db = Mongoose.connection;
db.once('open', function () { console.log('Successfully connected to MongoDB!'); });
db.on('error', function (err) { console.log('MongoDB Error: ', err); });

var app = Express();

// app 미들웨어
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
    next();
});

// api 라우트 설정
app.use('/api/users', require('./api/users'));
app.use('/api/auth', require('./api/auth')); 
app.use('/api/documents', require('./api/documents'));
app.use('/api/confirmations', require('./api/confirmations'));

// 로그, 에러 핸들러
function logHandler(err, req, res, next) {
    console.error('[' + new Date() + ']\n' + err.stack);
    next(err);
}
function errorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.type('json').send(JSON.stringify({error: err || 'uncaught error !'}, null, 4));
}
app.use(logHandler);
app.use(errorHandler);

// server 설정
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log('listening on port: ' + port);
});