const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    option: String,
    votes: {
        type: Number,
        default: 0
    }
});

const pollSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    question: String,
    options: [optionSchema],
    voted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created: {
        type: Date,
        default: Date.now
    },
    expireDate: {type: Date, default: undefined}
});

module.exports = mongoose.model('Poll', pollSchema);