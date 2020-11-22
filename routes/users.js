const express = require('express')
const _ = require('lodash') 

const User = require('../models/user')
const router = express.Router()

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/logout', (req, res) => {

})

//Middleware handle
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body
  let errorMessage
  if (_.isEmpty(name) || _.isEmpty(email) || _.isEmpty(password) || _.isEmpty(password2)) errorMessage = 'Please fill all the field'
  if (password !== password2) errorMessage = 'Password not match'
  if (password.length < 6) errorMessage = 'Password atleast 6 characters'

  if (errorMessage.length > 0) {
    res.render('register', {
      errorMessage: errorMessage,
      name: name,
      email: email,
      password: password,
      password2: password2
    })
  } else {
    try {
      const user = await User.findOne({ email: email })
      console.log(user)
    } catch {
      res.render('register', {
        errorMessage: 'Email already registered'
      })
    }
  }
})

router.post('/login', (req, res) => {

})

module.exports = router
