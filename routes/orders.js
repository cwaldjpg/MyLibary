const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const Book = require('../models/book')

router.get('/', async (req, res) => {
  console.log('render orders pagge')
})

router.post('/:id', async (req, res) => {
  console.log(req.params.id)
  try {
    const { currentUser } = res.locals
    console.log('yo oy im stucked here')
    // const orders = new Order()
    // const order = new Order({
    //   userId: currentUser._id,
    //   wishlist: {
    //     {}
    //   }
    // })
    console.log(book)
  } catch {
    console.log('oh theres a bug here')
  }
})

module.exports = router