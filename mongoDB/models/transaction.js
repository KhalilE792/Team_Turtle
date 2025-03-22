const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true

    },
    transaction_id: {
        type: Number,
        required: true

    },
    transaction_time: {
        type: Date,
        required: true,

    },
    item_code: {
        type: Number,
        required: true,
    },
    item_description: {
        type: String,
        required: true,
    },
    num_of_items_purchased: {
        type: Number,
        required: true,
    },
    cost_per_item: {
        type: Double,
        required: true,
    },
    country: {
        type: String,
        required: true,
    }
    
})

module.exports = mongoose.model('Transaction', transactionSchema)