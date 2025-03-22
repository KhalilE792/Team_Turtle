const express = require('express')
const router = express.Router()
const Transaction = require('../models/transaction')

// Getting all
router.get('/', async (req,res) => {
    try {
        const transactions = await Transaction.find()
        res.json(transactions)
    }
    catch (err) {
        res.status(500).json({message: err.message})
    }

})

// Getting one
router.get('/:id', getTransactions, (req,res) => {
    res.send(res.transaction.name)

})
// Creating one
router.post('/', async (req,res) => {
    const transaction = new Transaction({
        date: req.body.date,
        description: req.body.description,
        deposits: req.body.deposits,
        withdrawals: req.body.withdrawals,
        balance: req.body.balance
    })
    try {
        const newTransaction = await transaction.save()
        res.status(201).json(newTransaction)
    }
    catch (err) {
        res.status(400).json({message: err.message})
    }

})
// Updating one
router.patch('/:id', getTransactions, async (req,res) => {
    if(req.body.name != null) {
        res.transaction.name = req.body.name
    }
    if(req.body.subscribedToChannel!= null) {
        res.transaction.subscribedToChannel= req.body.subscribedToChannel
    }
    try {
        const updatedSubscriber = await res.transaction.save()
        res.json(updatedSubscriber)
    }
    catch (err) {
        res.status(400).json({message: err.message})
    }

})

// Deleting One
router.delete('/:id', getTransactions, async (req,res) => {
    try {
        await res.transaction.deleteOne()
        res.json({message: 'transaction deleted.'})
    }
    catch (err){
        res.status(500).json({message: err.message})
    }

})

async function getTransactions(req,res,next) {
    let transaction
    try {
        transaction = await Transaction.findById(req.params.id)
        if  (transaction == null) {
            return res.status(404).json({message: 'Cannot find Transaction'})
        }
    }
    catch (err){
        return res.status(500).json({message: err.message})

    }
    res.transaction = transaction
    next()

}

module.exports = router