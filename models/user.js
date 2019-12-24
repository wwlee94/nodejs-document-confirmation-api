var crypto = require('crypto');
var mongoose = require('mongoose')
require('dotenv').config();

// 해쉬 함수
function hash(password){
    return  crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');
}

// 스키마
var User = mongoose.Schema({
    email:{
        type:String,
        required:[true,'Email is required!'],
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
        trim:true,
        unique:true
    },
    password:{
      type:String,
      required:[true,'Password is required!'],
      select:false
    }
  });