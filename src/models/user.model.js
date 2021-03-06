const mongoose = require('mongoose');
const { env, jwtSecret, jwtExpirationInterval } = require('../config/vars');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const { omitBy, isNil } = require('lodash');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

const roles = ['user', 'admin'];
/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
  },
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  services: {
    facebook: String,
    google: String,
  },
  role: {
    type: String,
    enum: roles,
    default: 'user',
  },
  picture: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function save(next) {
    try {
      if (!this.isModified('password')) return next();

      const rounds = env === 'test' ? 1 : 10;

      const hash = await bcrypt.hash(this.password, rounds);
      this.password = hash;

      return next();
    } catch (error) {
      return next(error);
    }
  });

  userSchema.method({
    transform() {
      const transformed = {};
      const fields = ['id', 'name', 'email', 'picture', 'role', 'createdAt'];
      fields.forEach((field) => {
        transformed[field] = this[field];
      });

      return transformed;
    },

    token() {
      const playload = {
        exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
        iat: moment().unix(),
        sub: this._id,
      };
      return jwt.encode(playload, jwtSecret);
    },

    async passwordMatches(password) {
      return bcrypt.compare(password, this.password);
    },
  });

userSchema.statics = {

  roles,

  async get(id) {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
  },

  async list({
    page = 1, perPage = 30, name, email, role,
  }) {
    const options = omitBy({ name, email, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },


async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) throw new APIError({ message: 'An email is required to generate a token' });

    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (user && await user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  }
}
/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);