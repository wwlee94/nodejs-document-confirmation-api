var Mongoose = require('mongoose');

// 스키마
var Confirmation = Mongoose.Schema({
    document_id: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    user_email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    conment: {
        type: String,
        trim: true
    },
    confirmation: {
        type: String,
        required: [true, '타입을 입력해주세요 !'],
        trim: true,
        enum: ['APPROVED', 'CANCELED']
    }
});

Confirmation.index({document_id: 1, user_email: 1});

module.exports = Mongoose.model('Confirmation', Confirmation);
