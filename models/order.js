const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  wishlist: {
    type: mongoose.Schema.Types.Mixed,
    require: true
  }
})

module.exports = mongoose.model('Order', orderSchema);
