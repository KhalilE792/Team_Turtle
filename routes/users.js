require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../models/user')
const path = require('path')

const initializePassport = require('../passport-config')
initializePassport(
    passport,
    async email => await User.findOne({ email: email }),
    async id => await User.findById(id)
)

// Main pages (protected by authentication)
router.get('/', checkAuthenticated, (req, res) => {
    res.sendFile('html/homepage.html', { root: 'public' })
})

router.get('/stats', checkAuthenticated, (req, res) => {
    res.sendFile('html/Stats.html', { root: 'public' })
})

router.get('/fortune', checkAuthenticated, (req, res) => {
    res.sendFile('html/FortuneTeller.html', { root: 'public' })
})

router.get('/interact', checkAuthenticated, (req, res) => {
    res.sendFile('html/Interact.html', { root: 'public' })
})

// Authentication routes
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile('html/login.html', { root: 'public' })
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
}))

router.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile('html/register.html', { root: 'public' })
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
        res.status(400).json({ error: 'Registration failed' })
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
    console.log('Not logged in')
    next()
}

module.exports = router