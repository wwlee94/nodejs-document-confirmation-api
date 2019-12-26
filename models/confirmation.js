var Mongoose = require('mongoose');

// 스키마
var Confirmation = Mongoose.Schema({
    document: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: [true, '결재할 문서 id를 입력해주세요 !']
    },
    userEmail: {
        type: String,
        required: [true, '문서를 결재할 사용자 이메일을 입력해주세요 !'],
        trim: true
    },
    comment: {
        type: String,
        trim: true
    },
    confirmation: {
        type: String,
        required: [true, '타입을 입력해주세요 !'],
        trim: true,
        enum: ['APPROVED', 'CANCELED']
    }
},
{
    versionKey: false,
    timestamps: true
});

Confirmation.index({document: 1, userEmail: 1}, { unique: true });

module.exports = Mongoose.model('Confirmation', Confirmation);
