const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type:String,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('History', historySchema);

module.exports = History;
