if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()

// PASSWORD STUFF
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// MONGOOSE SERVER
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database!!!'))

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(bodyParser.json());
app.use(express.json())

const usersRouter = require('./routes/users')
app.use('/', usersRouter)

const subscribersRouter = require('./routes/subscribers')
app.use('/subscribers', subscribersRouter)

const transactionsRouter = require('./routes/transactions')
app.use('/transactions', transactionsRouter)

app.listen(3002, () => console.log('Server Started'))