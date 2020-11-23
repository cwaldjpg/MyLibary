const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const expressSession = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const localStrategy = require('passport-local')
const flash = require('connect-flash')

const User = require('./models/user')

const app = express()

const indexRouter = require('./routes/index')
const userRouter = require('./routes/users')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

mongoose.connect('mongodb+srv://admin:admin@mylibary.jt0cq.mongodb.net/MyLibary?retryWrites=true&w=majority', {useNewUrlParser: true})
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

app.use(expressSession({    
  secret:'Hello World, this is a session',    
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req,res,next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
})

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(3000,() => {
    console.log('Listening to port 3000')
})