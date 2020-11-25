const express = require('express')
const _ = require('lodash') 
const bcrypt = require('bcrypt')
const passport = require('passport')

const User = require('../models/user')
const router = express.Router()

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg','You have logged out')
  res.redirect('/')
})

//Middleware handle
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body
  let errors = []
  if (_.isEmpty(name) || _.isEmpty(email) || _.isEmpty(password) || _.isEmpty(password2)) errors.push('Please fill all the field')
  if (password.length < 6) errors.push('Password atleast 6 characters')
  if (password !== password2) errors.push('Password not match')

  if (errors.length > 0) {
    res.render('register', {
      errorMessage: errors[0],
      name: name,
      email: email,
      password: password,
      password2: password2
    })
  } else {
    const user = await User.find({ email: email })
    
    if (!_.isEmpty(user)) {
      res.render('register', {
        errorMessage: 'Email already registered'
      })
    } else {
      const newUser = new User({
        name: name,
        email: email,
        password: password,
        role: 0
      })
      try {
        newUser.password = await bcrypt.hash(newUser.password, 10)
        await newUser.save()
        req.flash('success_msg','You have now registered!')
        res.redirect('/users/login')
      } catch(err) {
        console.log(err)
        res.render('register', {
          errorMessage: 'Something wrong with API'
        })
      }
    }
  }
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash  : true
}))

module.exports = router
