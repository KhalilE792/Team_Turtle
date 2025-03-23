require('dotenv').config()
const fs = require('fs')
const csv = require('csv-parser')
const mongoose = require('mongoose')
const Transaction = require('./models/transaction')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

async function importCSV() {
    console.log('starting importCSV...')
    try {
        const results = []
        console.log('Starting CSV import...')
        
        await new Promise((resolve, reject) => {
            console.log('Reading CSV file...')
            fs.createReadStream('./50000.csv')
            // fs.createReadStream('./transaction-dataset.csv')
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data)
                    if (results.length % 100 === 0) {
                        console.log(`Processed ${results.length} rows...`)
                    }
                })
                .on('end', () => {
                    console.log('Finished reading CSV')
                    resolve()
                })
                .on('error', reject)
        })

        console.log(`Converting ${results.length} rows to transactions...`)
        const transactions = results.map(row => ({
            date: row.date,
            description: row.description,
            deposits: row.deposits || '0',
            withdrawals: row.withdrawals || '0',
            balance: row.balance
        }))

        console.log('Inserting into MongoDB...')
        await Transaction.insertMany(transactions)
        console.log(`Successfully imported ${transactions.length} transactions!`)
        
    } catch (error) {
        console.error('Error importing data:', error)
    } finally {
        console.log('Closing database connection...')
        mongoose.connection.close()
    }
}

// Run the import
importCSV()
