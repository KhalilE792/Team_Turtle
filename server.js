const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')

// Middleware
app.use(express.static('public'))
app.use(express.json())

// Routes
const transactionsRouter = require('./routes/transactions')
const usersRouter = require('./routes/users')

// API Routes
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/homepage.html'))
})

app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Stats.html'))
})

app.get('/fortune', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/FortuneTeller.html'))
})

// ... rest of your server.js code 