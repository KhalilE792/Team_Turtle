const express = require('express')
const router = express.Router()
const Transaction = require('../models/transaction')


// Get transactions by year
router.get('/year/:year', async (req, res) => {
    try {
        const year = req.params.year
        console.log('Searching for year:', year)
        const transactions = await Transaction.find().then(docs => {
            console.log('Total documents found:', docs.length)
            const filtered = docs.filter(doc => {
                const dateParts = doc.date.split('-')
                // Convert two-digit year to full year
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
                const fullYear = '20' + dateParts[2]  // converts '25' to '2025'
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
            
            // Format the date parts
            const day = String(date.getDate()).padStart(2, '0') 
            const month = date.toLocaleString('en', { month: 'short' })
            const year = String(date.getFullYear()).slice(-2)

            
            // Combine parts into "DD-MMM-YYYY" format
            dates.push(`${day}-${month}-${year}`)
        }

        // Find transactions that match any of the dates in our array
        const transactions = await Transaction.find().then(docs => {
            return docs.filter(doc => dates.includes(doc.date))
        })
        res.json(transactions)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

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
    res.send(res.transaction)

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