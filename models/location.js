const mongoose = require('mongoose')
const Book = require('./book')

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

locationSchema.pre('remove', function(next) {
  Book.find({ location: this.id }, (err, books) => {
    if (err) {
      next(err)
    } else if (books.length > 0) {
      console.log('This location has books still')
      next(new Error('This location has books still'))
    } else {
      next()  
    }
  })
})

module.exports = mongoose.model('Location', locationSchema)