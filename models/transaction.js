const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    date: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
    },
    deposits: {
        type: String, 
        default: 0,
        required: true
    },
    withdrawals: {
        type: String,
        default: 0,
        required: true
    },
    balance: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Transaction', transactionSchema)