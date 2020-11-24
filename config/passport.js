const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user')

module.exports = (passport) => {
  passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try {
      console.log('****login')
      const user = await User.findOne({ email: email })
      if (!user) {
        return done(null,false, { message:'Email not registered' });
      }
      //match passwords
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message:'Password incorrect'})
      }
    } catch(err) {
      console.log(err)
      done(err)
    }
  }))
  passport.serializeUser((user, done) => {
    console.log('mehh why not')
    done(null, user.id);
  })
  passport.deserializeUser((id, done) => {
    console.log('something')
    User.findById(id, (err, user) => {
      done(err, user);
    })
  })
}