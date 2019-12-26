var Mongoose = require('mongoose');

// 스키마
var Document = Mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: [true, '제목을 입력해주세요 !'],
        trim: true
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
    confirmationOrder: {
        type: [String],
        required: [true, '결제자 순서를 입력해주세요 !'],
        validate: [minArraySize, '최소 1명 이상의 결재자를 입력해주세요.']
    },
    confirmedUsers: {
        type: [String]
    }
    // confirmedUsers: [{
    //     type: Mongoose.Schema.Types.ObjectId,
    //     ref: 'Confirmation'
    // }],
},
{
    versionKey: false,
    timestamps: true
});

Document.index({ title: 1, userEmail: 1}, { unique: true });

module.exports = Mongoose.model('Document', Document);

function minArraySize(val) {
    return val.length >= 1;
}