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

router.put('/addToWishlist/:bookId', ensureAuthenticated, async (req, res) => {
  try {
    const { currentUser } = res.locals
    const book = await Book.findById(req.params.bookId)
    if (book.inventory > 0 ) {
      const user = await User.findOneAndUpdate({
        _id: currentUser._id,
        'wishlist.3': { $exists: false },
        'wishlist.bookId': { $ne: req.params.bookId }
      }, { $push: { wishlist: { bookId: req.params.bookId } } })
      if (user) {
        await Book.findOneAndUpdate({ _id: req.params.bookId }, { $inc: { inventory: -1 } })
        req.flash('success_msg' , 'Success add to wishlist');
        res.redirect('/')
      } else {
        req.flash('error_msg' , 'Reached limit of 3 or already has book in wishlist');
        res.redirect(`/books/${req.params.bookId}`)
      }
     }
  }catch(err) {
    req.flash('error_msg' , 'Success');
  }
})

router.delete('/removeFromWishList/:bookId', async (req, res) => {
  try {
    const { currentUser } = res.locals
    await User.update(
      { _id: currentUser._id },
      { $pull: { wishlist: { bookId: req.params.bookId } } }
    )
    await Book.findOneAndUpdate({ _id: req.params.bookId }, { $inc: { inventory: 1 } })
    res.redirect('/users/wishlist')
  } catch (err) {
    console.log(err)
  }
})

router.delete('/:userId/removeFromWishList/:bookId', async (req, res) => {
  try {
    await User.update(
      { _id: req.params.userId },
      { $pull: { wishlist: { bookId: req.params.bookId } }}
    )
    await Book.findOneAndUpdate({ _id: req.params.bookId }, { $inc: { inventory: 1 } })
    res.redirect(`/users/${req.params.userId}`)
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

// login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash  : true
}))

// Show user detail (admin)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
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

//Edit
router.get('/:userId/edit', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    res.render('users/edit', { user: user })
  } catch {
    res.redirect('/authors')
  }
})

//Update
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (req.body.password != null && req.body.password !== '') {
      if (req.body.password.length < 6) res.render('register', {
        errorMessage: 'Password atleast 6 characters',
        name: req.body.name,
        email: req.body.email
      })
      user.password = await bcrypt.hash(req.body.password, 10)
    }
    
    user.name = req.body.name
    user.email = req.body.email
    await user.save()
    res.redirect('/users')
  } catch {
    console.log('error')
  }
})

module.exports = router
