const express = require('express')
const passport = require('passport')

const router = express.Router()
const Book = require('../models/book')
const User = require('../models/user')

router.get('/', async (req, res) => {
  let books
  try {
    books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    books = []
  }
  res.render('index', { books: books })
})

// const isLoggedIn = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next()
//   }
//   res.redirect('login')
// }

// router.get('/secret', isLoggedIn ,async (req, res) => {
//   res.render('secret')
// })

// // Auth Routes
// router.get('/register', async (req, res) => {
//   res.render('register')
// })
// router.get('/login', async (req, res) => {
//   res.render('login')
// })

// // Middleware handle
// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/secret',
//   failureRedirect: 'login'
// }), (req, res) => {
//   res.send('User is ' + req.user.id)
// })
// router.post('/register', async (req, res) => {
//   console.log(req.body)
//   User.register(new User({ username: req.body.username, password: req.body.password }), req.body.password, (err, user) => {
//     if(err){
//         console.log(err);
//         return res.render('register');
//      } //user stragety
//      passport.authenticate('local')(req, res, () => {
//          res.redirect('/secret'); //once the user sign up
//     }); 
//  });
// })

// router. get('/logout', async (req, res) => {
//   req.logout()
//   res.redirect('/')
// })

module.exports = router