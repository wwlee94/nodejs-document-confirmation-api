var Mongoose = require('mongoose');

// 스키마
var Document = Mongoose.Schema({
    user_email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, '제목을 입력해주세요 !'],
        trim: true,
        unique: true
    },
    content: {
        type: String,
        required: [true, '내용을 입력해주세요 !'],
        trim: true
    },
    type: {
        type: String,
        required: [true, '타입을 입력해주세요 !'],
        trim: true,
        enum: ['RUNNING', 'APPROVED', 'CANCELED'],
        default: 'RUNNING' 
    },
    confirmed_user: {
        type: [String]
    },
    confirmation_order: {
        type: [String],
        required: [true, '결제자 순서를 입력해주세요 !'],
        validate: [minArraySize, '최소 1명 이상의 결재자를 입력해주세요.']
    }
});

Document.index({user_email: 1});

module.exports = Mongoose.model('Document', Document);

function minArraySize(val) {
    return val.length >= 1;
  }