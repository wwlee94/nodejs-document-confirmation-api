const Mongoose = require('mongoose');

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
    // confirmedUsers: {
    //     type: [String]
    // }
    confirmedUsers: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Confirmation'
    }]
},
{
    versionKey: false,
    timestamps: true
});

Document.index({ title: 1, userEmail: 1 }, { unique: true });

// 결재 순서에서 현재 결재된 사용자를 뺀 리스트 반환하는 함수
Document.methods.confirmationOrderFilter = function(){
    confirmedUsers = this.confirmedUsers.map(x => x.userEmail);
    return this.confirmationOrder.filter(x => !this.confirmedUsers.includes(x));
};

module.exports = Mongoose.model('Document', Document);

function minArraySize(val) {
    return val.length >= 1;
}