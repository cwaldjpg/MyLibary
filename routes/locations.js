const express = require('express')
const router = express.Router()
const Location = require('../models/location')
const Book = require('../models/book')

//All and Search
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const locations = await Location.find(searchOptions)
    res.render('locations/index', {
      locations: locations,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

//render form new
router.get('/new', (req, res) => {
  res.render('locations/new', { location: new Location() })
})

//Create
router.post('/', async (req, res) => {
  const checkLocation = await Location.find({name: req.body.name})
  if(checkLocation.length>0){
    console.log('Location exist')
    res.render('locations/new', {
      location: {name: req.body.name},
      errorMessage: 'Location exist'
    })
  }
  else{
    const location = new Location({
      name: req.body.name
    })
    try {
      const newLocation = await location.save()
      res.redirect(`locations/${newLocation.id}`)
    } catch {
      res.render('locations/new', {
        location: location,
        errorMessage: 'Error creating Location'
      })
    }
  }
})

//Get author by id
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
    const books = await Book.find({ location: location.id }).limit(6).exec()
    res.render('locations/show', {
      location: location,
      booksByAuthor: books
    })
  } catch {
    res.redirect('/')
  }
})

//Edit
router.get('/:id/edit', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
    res.render('locations/edit', { location: location })
  } catch {
    res.redirect('/locations')
  }
})

//Update
router.put('/:id', async (req, res) => {
  let location
  try {
    location = await Location.findById(req.params.id)
    location.name = req.body.name
    await location.save()
    res.redirect(`/locations/${location.id}`)
  } catch {
    if (location == null) {
      res.redirect('/')
    } else {
      res.render('locations/edit', {
        location: location,
        errorMessage: 'Error updating Location'
      })
    }
  }
})

//Delete
router.delete('/:id', async (req, res) => {
  let location
  try {
    location = await Location.findById(req.params.id)
    await location.remove()
    res.redirect('/locations')
  } catch {
    if (location == null) {
      res.redirect('/')
    } else {
      res.redirect(`/locations/${location.id}`)
    }
  }
})

module.exports = router