const Express = require('express');
const Mongoose = require('mongoose');
const BodyParser = require('body-parser');

// env 설정
require('dotenv').config();

var MONGO_DB_URL;
var PORT;
if(process.env.NODE_ENV === "test"){
    MONGO_DB_URL = process.env.MONGO_TEST_DB_URL;
    PORT = process.env.TEST_PORT;
}
else{
    MONGO_DB_URL = process.env.MONGO_DB_URL;
    PORT = process.env.PORT;
}

console.log('Start Nodejs Web Server !');

// MongoDB 설정
Mongoose.Promise = global.Promise;
Mongoose.connect(MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
Mongoose.set('debug', true);
var db = Mongoose.connection;
db.once('open', function () { console.log(`Successfully connected to MongoDB! at ${MONGO_DB_URL}`); });
db.on('error', function (err) { console.log('MongoDB Error: ', err); });

var app = Express();

// app 미들웨어
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
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
    // if (process.env.NODE_ENV === "test") 
    console.error('[' + new Date() + ']\n' + err.stack);
    next(err);
}
function errorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.type('json').send(JSON.stringify({ error: err || 'Uncaught Error !' }, null, 4));
}
app.use(logHandler);
app.use(errorHandler);

// server 설정
var port = PORT || 3000;
app.listen(port, () => {
    console.log('listening on port: ' + port);
});

module.exports = app;