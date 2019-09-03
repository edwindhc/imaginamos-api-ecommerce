const httpStatus = require('http-status');
const Order = require('../models/order.model');
const shoppingCart = require('../models/shoppingCart.model');
const { omit } = require('lodash');

/**
 * Create new order
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await shoppingCart.remove({userId: order.userId})
    const savedOrder = await order.save();
    res.status(httpStatus.CREATED);
    res.json(savedOrder.transform());
  } catch (error) {
    next(error);
  }
};

exports.load = async (req, res, next, id) => {
  try {
    const order = await Order.get(id);
    req.locals = { order };
    return next();
  } catch (error) {
    return next(error);
  }
};


/**
 * Get order list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const query = req.query;
    if (query.name) {
      query.name = new RegExp(query.name, 'i');
    } else if (query.category) {
      query.category = new RegExp(query.category, 'i');
    }
    const totalOrders = await Order.list({ query, perPage: 0 });
    const orders = await Order.list(query);
    const transformedOrders = orders.map(order => order.transform());
    res.json({ data: transformedOrders, totals: totalOrders.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing order
 * @public
 */
exports.update = (req, res, next) => {
  const updatedOrder = omit(req.body);
  const order = Object.assign(req.locals.order, updatedOrder);

  order.save()
    .then(savedOrder => res.json(savedOrder.transform()))
    .catch(e => next(e));
};

/**
 * Get order
 * @public
 */
exports.get = (req, res) => res.json(req.locals.order.transform());

/**
 * Delete order
 * @public
 */
exports.remove = (req, res, next) => {
  const { order } = req.locals;

  order.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
