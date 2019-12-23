var express = require('express');
var mongoose = require('mongoose');

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

// 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  next();
});

// Server 설정
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('listening on port:' + port);
});