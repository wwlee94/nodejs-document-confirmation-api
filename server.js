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

// Server 설정
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('listening on port:' + port);
});