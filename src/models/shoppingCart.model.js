const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

/**
 * shoppingCart Schema
 * @private
 */
const shoppingCartSchema = new mongoose.Schema({

  status: {
    type: String,
    enum: ['pending', 'ordered'],
    default: 'pending'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 10,
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});
/**
 * Methods
 */
shoppingCartSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'productId', 'status', 'amount', 'userId', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
shoppingCartSchema.statics = {
  /**
   * Get shoppingCart
   *
   * @param {ObjectId} id - The objectId of shoppingCart.
   * @returns {Promise<shoppingCart, APIError>}
   */
  async get(id) {
      let shoppingCart;

      if (mongoose.Types.ObjectId.isValid(id)) {
        shoppingCart = await this.findById(id).exec();
      }
      if (shoppingCart) {
        return shoppingCart;
      }else {
        throw new APIError({
          message: 'shoppingCart does not exist',
          status: httpStatus.NOT_FOUND,
        });
      }
  },

  /**
   * List shoppingCarts in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of shoppingCarts to be skipped.
   * @param {number} limit - Limit number of shoppingCarts to be returned.
   * @returns {Promise<shoppingCart[]>}
   */
  list({
    page = 1, perPage = 30, productId, status, amount, userId, createdAt
  }) {
    const options = omitBy({
      productId, status, amount, userId, createdAt
    }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateName(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'name',
          location: 'body',
          messages: ['"name" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
}
/**
 * @typedef shoppingCart
*/
module.exports = mongoose.model('shoppingCart', shoppingCartSchema);
