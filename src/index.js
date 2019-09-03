const app = require('./app');
const mongoose = require('./config/mongoose');
const passport = require('passport');
const strategies = require('./config/passport');
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// open mongoose connection
mongoose.connect();

// enable authentication
app.use(passport.initialize());
passport.use('jwt', strategies.jwt);

const main = async () => {
    await app.listen(8080);
    console.log('Server run on port 300')
}

main();