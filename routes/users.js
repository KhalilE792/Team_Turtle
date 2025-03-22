const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../models/user')

const initializePassport = require('../passport-config')
initializePassport(
    passport,
    async email => await User.findOne({ email: email }),
    async id => await User.findById(id)
)

router.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save()
        res.redirect('/login')
    } catch (error) {
        console.error('Registration error:', error)
        res.redirect('/register')
    }
})

router.post('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

module.exports = router