const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user')

module.exports = (passport) => {
  passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try {
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
      done(err)
    }
  }))
  passport.serializeUser((user, done) => {
    done(null, user);
  })
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    })
  })
}