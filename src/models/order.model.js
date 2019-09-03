const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

const orderSchema = new Schema({
  cart: {
    type: Array,
    items: [
      {type: String},
      {type: Number}
    ]
  },
  total: {
    type: Number,
    trim: true,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending'
  },
},
{
  timestamps: true,
});

/**
 * Methods
 */
orderSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'cart', 'total', 'createdAt', 'userId', 'status'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
orderSchema.statics = {
  /**
   * Get order
   *
   * @param {ObjectId} id - The objectId of order.
   * @returns {Promise<Order, APIError>}
   */
  async get(id) {
      let order;

      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await this.findById(id).exec();
      }
      if (order) {
        return order;
      }

      throw new APIError({
        message: 'Order does not exist',
        status: httpStatus.NOT_FOUND,
      });
  },

  /**
   * List orders in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of orders to be skipped.
   * @param {number} limit - Limit number of orders to be returned.
   * @returns {Promise<Order[]>}
   */
  list({
    page = 1, perPage = 30, cart, total, userId, createdAt, status,
  }) {
    const options = omitBy({
      cart, total, userId, createdAt, status,
    }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

module.exports = mongoose.model('Order', orderSchema);