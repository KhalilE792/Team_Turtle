const express = require('express')
const router = express.Router()
const Transaction = require('../models/transaction')
const path = require('path')


// Get transactions by year
router.get('/year/:year', async (req, res) => {
    try {
        const year = req.params.year
        console.log('Searching for year:', year)
        const transactions = await Transaction.find().then(docs => {
            console.log('Total documents found:', docs.length)
            const filtered = docs.filter(doc => {
                const dateParts = doc.date.split('-')
                const fullYear = '20' + dateParts[2]  // converts '25' to '2025'
                return fullYear === year
            })
            console.log('Filtered documents:', filtered.length)
            return filtered
        })
        res.json(transactions)
    } catch (err) {
        console.error('Error:', err)
        res.status(500).json({ message: err.message })
    }
})

// Get transactions by month
router.get('/month/:month/:year', async (req, res) => {
    try {
        const { month, year } = req.params
        const transactions = await Transaction.find().then(docs => {
            return docs.filter(doc => {
                const dateParts = doc.date.split('-')
                const fullYear = '20' + dateParts[2]  
                return dateParts[1] === month && fullYear === year
            })
        })
        res.json(transactions)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get transactions by week 
router.get('/week', async (req, res) => {
    try {
        const today = new Date() 
        const dates = []         
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() - i) 
            
            const day = String(date.getDate()).padStart(2, '0') 
            const month = date.toLocaleString('en', { month: 'short' })
            const year = String(date.getFullYear()).slice(-2)

            
            dates.push(`${day}-${month}-${year}`)
        }

        const transactions = await Transaction.find().then(docs => {
            return docs.filter(doc => dates.includes(doc.date))
        })
        res.json(transactions)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get all transactions for the logged-in user only
router.get('/', checkAuthenticated, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
        res.json(transactions)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting one
router.get('/:id', getTransaction, (req,res) => {
    res.send(res.transaction)
})

// Create new transaction with user ID
router.post('/', checkAuthenticated, async (req, res) => {
    const transaction = new Transaction({
        date: req.body.date,
        description: req.body.description,
        deposits: req.body.deposits,
        withdrawals: req.body.withdrawals,
        balance: req.body.balance,
        user: req.user._id  
    })

    try {
        const newTransaction = await transaction.save()
        res.status(201).json(newTransaction)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Update transaction 
router.patch('/:id', checkAuthenticated, getTransaction, async (req, res) => {
    if (res.transaction.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Cannot modify other users transactions' })
    }

    if (req.body.date != null) {
        res.transaction.date = req.body.date
    }
    if (req.body.description != null) {
        res.transaction.description = req.body.description
    }
    if (req.body.deposits != null) {
        res.transaction.deposits = req.body.deposits
    }
    if (req.body.withdrawals != null) {
        res.transaction.withdrawals = req.body.withdrawals
    }
    if (req.body.balance != null) {
        res.transaction.balance = req.body.balance
    }

    try {
        const updatedTransaction = await res.transaction.save()
        res.json(updatedTransaction)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Delete transaction 
router.delete('/:id', checkAuthenticated, getTransaction, async (req, res) => {
    if (res.transaction.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Cannot delete other users transactions' })
    }

    try {
        await res.transaction.remove()
        res.json({ message: 'Deleted Transaction' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Add this route to serve the Stats page
router.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Stats.html'))
})

// Middleware to get transaction
async function getTransaction(req, res, next) {
    let transaction
    try {
        transaction = await Transaction.findById(req.params.id)
        if (transaction == null) {
            return res.status(404).json({ message: 'Cannot find transaction' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.transaction = transaction
    next()
}

// Authentication middleware
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.status(401).json({ message: 'You need to be logged in' })
}

module.exports = router