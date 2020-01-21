const Crypto = require('crypto');
const Mongoose = require('mongoose');
const Bcrypt = require('bcrypt');
const Exception = require('../exceptions/exception');
require('dotenv').config();

// 스키마
var User = Mongoose.Schema({
    email: {
        type: String,
        required: [true, '이메일을 입력해주세요 !'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '이메일 주소여야 합니다 ! (ex: nodejs@gmail.com)'],
        trim: true
    },
    password: {
        type: String,
        required: [true, '패스워드를 입력해주세요 !'],
        select: false
    }
},
    {
        versionKey: false,
        timestamps: true
    });

User.index({ email: 1 }, { unique: true });

// virtuals
User.virtual('passwordConfirm')
    .get(function () { return this._passwordConfirm; })
    .set(function (value) { this._passwordConfirm = value; });

User.path('password').validate(function (v) {
    var user = this;

    if (user.isNew) {
        if (!user.passwordConfirm) {
            user.invalidate('_passwordConfirm', '패스워드 확인이 필요합니다 !');
        }
        else {
            if (user.password !== user.passwordConfirm) {
                user.invalidate('_passwordConfirm', '입력한 패스워드와 패스워드 확인이 일치 하지 않습니다 !');
            }
        }
    }
});

// 해쉬 함수
function hash(password) {
    return new Promise(function (resolve, reject) {
        Bcrypt.genSalt(10, (err, salt) => {
            Bcrypt.hash(password, salt, (err, hash) => {
                resolve(hash);
            })
        });
    });
}

// 세이브 전 패스워드 해시 암호화
User.pre('save', function (next) {
    var user = this;
    hash(user.password).then(hashed_password => {
        user.password = hashed_password;
        return next();
    });
});

User.methods.authenticatePassword = function (password) {
    return new Promise(function (resolve, reject) {
        // 함수로 전달받은 password 의 해시값과, 데이터에 담겨있는 해시값과 비교를 합니다.
        console.log(password)
        console.log(this.password)
        Bcrypt.compare(password, this.password).then(res => {
            resolve(res);
        });
    });
};

// 구 버전
// 해쉬 함수
// function hash(password) {
//     return Crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');
// }

// User.methods.authenticatePassword = function (password) {
//     // 함수로 전달받은 password 의 해시값과, 데이터에 담겨있는 해시값과 비교를 합니다.
//     const hashed_password = hash(password);
//     return this.password === hashed_password;
// };

module.exports = Mongoose.model('User', User);