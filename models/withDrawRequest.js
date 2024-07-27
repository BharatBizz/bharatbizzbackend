const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
    userId: {
        type: String, // Use String to match userId from User schema
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;
