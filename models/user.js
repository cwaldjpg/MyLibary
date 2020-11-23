const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); 

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
  date: {
    type: Date,
    default: Date.now
  }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);