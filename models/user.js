const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); 

const wishlistSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  date: {
    type: Date
  }
})

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    required: true
  },
  wishlist: {
    type: [wishlistSchema],
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);