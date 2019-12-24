var Crypto = require('crypto');
var Mongoose = require('mongoose')
require('dotenv').config();

// 해쉬 함수
function hash(password){
  return Crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');
}

// 스키마
var User = Mongoose.Schema({
  email:{
    type:String,
    required:[true, 'Email is required!'],
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Should be a vaild email address!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true, 'Password is required!'],
    select:false
  }
  });

// virtuals
User.virtual('passwordConfirmation')
    .get(function(){ return this._passwordConfirmation; })
    .set(function(value){ this._passwordConfirmation=value; });

User.path('password').validate(function(v) {
  var user = this;

  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required!');
    }
    else {
      if(user.password !== user.passwordConfirmation) {
        user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
      }
    }
  }
});

// User.statics.findByEmail = function(email){
//     return this.findOne({email}).exec();
// }

// 세이브 전 패스워드 해시 암호화
User.pre('save', function (next){
  var user = this;
  user.password = hash(user.password);
  return next();
});

User.methods.authenticatePassword = function(password) {
  // 함수로 전달받은 password 의 해시값과, 데이터에 담겨있는 해시값과 비교를 합니다.
  const hashed_password = hash(password);
  return this.password === hashed_password;
};

module.exports = Mongoose.model('User', User);