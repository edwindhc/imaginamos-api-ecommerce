const httpStatus = require('http-status');
const Cart = require('../models/shoppingCart.model');
const Product = require('../models/product.model');
const { omit } = require('lodash');

/**
 * Create new cart
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const cart = new Cart(req.body);
    const savedCart = await cart.save();
    res.status(httpStatus.CREATED);
    res.json(savedCart.transform());
  } catch (error) {
    next(Cart.checkDuplicateName(error));
  }
};

exports.load = async (req, res, next, id) => {
  try {
    const cart = await Cart.get(id);
    req.locals = { cart };
    return next();
  } catch (error) {
    return next(error);
  }
};


/**
 * Get cart list
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
    const totalCarts = await Cart.list({ query, perPage: 0 });
    const carts = await Cart.list(query);
    let transformedCarts = carts.map(cart => cart.transform());
    let productDetail = [];
    let totalToPay = 0;
    if (transformedCarts.length){
      for (let product of transformedCarts){
        let data = await Product.get(product.productId)
        totalToPay += data.price;
        productDetail.push({...product, ...data, ...totalToPay})
      }
    }
    res.json({ data: productDetail, totals: totalCarts.length, totalToPay });
  } catch (error) {
    next(error);
  }
};

/**
 * Replace existing cart
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { cart } = req.locals;
    const newCart = new Cart(req.body);
    const newCartObject = omit(newCart.toObject(), '_id');

    await cart.update(newCartObject, { override: true, upsert: true });
    const savedCart = await Cart.findById(cart._id);

    res.json(savedCart.transform());
  } catch (error) {
    next(Cart.checkDuplicateEmail(error));
  }
};

/**
 * Update existing cart
 * @public
 */
exports.update = (req, res, next) => {
  const updatedCart = omit(req.body);
  const cart = Object.assign(req.locals.cart, updatedCart);

  cart.save()
    .then(savedCart => res.json(savedCart.transform()))
    .catch(e => next(e));
};

/**
 * Get cart
 * @public
 */
exports.get = (req, res) => res.json(req.locals.cart.transform());

/**
 * Delete cart
 * @public
 */
exports.remove = (req, res, next) => {
  const { cart } = req.locals;

  cart.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
