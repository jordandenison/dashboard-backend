const authentication = require('@feathersjs/authentication')
const jwt = require('@feathersjs/authentication-jwt')
const oauth2 = require('@feathersjs/authentication-oauth2')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const populateUser = () =>
  async hook => {
    const user = await hook.app.service('users').get(hook.params.payload.id)
    hook.result.user = user

    return hook
  }

const oauthRedirectHandler = (app, url) => {
  const config = app.get('authentication')
  const options = {
    jwt: config.jwt,
    secret: config.secret
  }

  return (req, res, next) => {
    if (req.feathers && req.feathers.payload) {
      return app.passport.createJWT(req.feathers.payload, options)
        .then(token => res.redirect(`${url}?accessToken=${token}`))
        .catch(error => next(error))
    }
  }
}

class CustomVerifier extends oauth2.Verifier {
  async verify (req, accessToken, refreshToken, profile, done) {
    const email = profile.emails[0].value

    const entity = {
      accessToken,
      refreshToken
    }

    const { data } = await this.service.find({ query: { email } })
    const [payload] = data

    if (payload) { return done(null, entity, payload) }

    const newAccount = await this.app.service('accounts').create({ name: email })

    const newUser = await this.service.create({ email, accountId: newAccount.id, role: 'admin' })
    const id = newUser[this.service.id]
    const newUserPayload = { id }

    return done(null, entity, newUserPayload)
  }
}

module.exports = function () {
  const app = this
  const config = app.get('authentication')

  app.configure(authentication(config))
  app.configure(jwt())

  app.configure(oauth2({
    name: 'google',
    Strategy: GoogleStrategy,
    handler: oauthRedirectHandler(app, config.google.successRedirect),
    Verifier: CustomVerifier
  }))

  app.service('authentication').hooks({
    before: {
      create: [ authentication.hooks.authenticate(config.strategies) ],
      remove: [ authentication.hooks.authenticate('jwt') ]
    },
    after: {
      create: [ populateUser() ]
    }
  })
}
