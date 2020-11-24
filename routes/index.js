const express = require('express')
const passport = require('passport')

const router = express.Router()
const Book = require('../models/book')
const User = require('../models/user')

router.get('/', async (req, res) => {
  console.log(res.locals)
  let books
  try {
    books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    books = []
  }
  res.render('index', { books: books })
})

module.exports = router