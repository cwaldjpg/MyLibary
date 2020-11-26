const express = require('express')
const _ = require('lodash') 
const bcrypt = require('bcrypt')
const passport = require('passport')

const User = require('../models/user')
const Book = require('../models/book')
const { ensureAuthenticated } = require('../config/auth') 
const router = express.Router()

router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const users = await User.find(searchOptions)
    res.render('users/index', {
      users: users,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

router.delete('/:id', async (req, res) => {
  let user
  try {
    user = await User.findById(req.params.id)
    await user.remove()
    res.redirect('/users')
  } catch {
    if (user == null) {
      res.redirect('/')
    } else {
      res.redirect(`/users/${user.id}`)
    }
  }
})

router.get('/wishlist', ensureAuthenticated, async (req, res) => {
  try {
    const { currentUser: { _id } } = res.locals
    const user = await User.findById(_id)
    const books = await Book.find({
      '_id': { $in: user.wishlist.map(e => e.bookId) }
    }).populate('author').populate('location')
    res.render('wishlist', { books: books })
  } catch (err) {
    console.log(err)
  }
})

router.get('/login', (req, res) => {
  console.log('should ren login')
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

router.put('/addToWishlist/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { currentUser } = res.locals
    const user = await User.findOneAndUpdate({
      _id: currentUser._id,
      'wishlist.3': { $exists: false },
      'wishlist.bookId': { $ne: req.params.id }
    }, { $push: { wishlist: { bookId: req.params.id } } })
    if (user) {
      req.flash('success_msg' , 'Success add to wishlist');
      res.redirect('/')
    } else {
      req.flash('error_msg' , 'Reached limit of 3 or already has book in wishlist');
      res.redirect(`/books/${req.params.id}`)
    }
  }catch(err) {
    req.flash('error_msg' , 'Success');
  }
})

router.delete('/removeFromWishList/:id', async (req, res) => {
  try {
    const { currentUser } = res.locals
    const user = await User.update(
      { _id: currentUser._id },
      { $pull: { wishlist: { bookId: req.params.id } } }
    )
    console.log(user)
    res.redirect('/users/wishlist')
  } catch (err) {
    console.log(err)
  }
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

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const books = await Book.find({
      '_id': { $in: user.wishlist.map(e => e.bookId) }
    }).populate('author').populate('location')
    res.render('users/show', {
      user: user,
      books: books
    })
  } catch {
    res.redirect('/')
  }
})

module.exports = router
