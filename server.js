const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

mongoose.connect('mongodb+srv://admin:admin@for-final-jt0cq.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true})
.then(result => {
  console.log('connect to DB')
})
.catch(error => {
  console.log('***'+error)
})

app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit:'10mb', extended: false}))
app.use(methodOverride('_method'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(3000,() => {
    console.log('Listening to port 3000')
})