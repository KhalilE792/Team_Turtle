const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    date: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    deposits: {
        type: String, 
        default: 0
    },
    withdrawals: {
        type: String,
        default: 0
    },
    balance: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Transaction', transactionSchema)