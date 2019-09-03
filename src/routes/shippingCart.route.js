/* eslint-disable max-len */
const express = require('express');
const { authorize, ADMIN } = require('../middlewares/auth.middleware');
const controller = require('../controllers/shoppingCart.controller');

const router = express.Router();
/**
 * Load shoppingCard when API with shoppingCardId route parameter is hit
 */
router.param('shoppingCardId', controller.load);

router
  .route('/')
/**
   * @api {get} v1/shoppingCard List Produts
   * @apiDescription Get a list of shoppingCard
   * @apiVersion 1.0.0
   * @apiName ListShoppingCarts
   * @apiGroup ShoppingCart
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   ShoppingCart's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Shopping Cart per page
   * @apiParam  {String}             [userId]       User's id
   * @apiParam  {String}             [productId]       Product's Id
   * @apiParam  {String}             [amount]       Amount
   * @apiSuccess {Object[]} shoppingCard List of shoppingCard.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated shoppingCard can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
  .get(controller.list)
  /**
   * @api {post} v1/shoppingCard Create ShoppingCart
   * @apiDescription Create a new shoppingCard
   * @apiVersion 1.0.0
   * @apiName CreateShoppingCart
   * @apiGroup ShoppingCart
   * @apiPermission logged
   *
   * @apiParam  {Number}      userId    User Id
   * @apiParam  {String}      productId    Product Id
   * @apiParam  {String}      amount    Amount
   *
   * @apiSuccess (Created 201) {String}  id         ShoppingCart's id
   * @apiSuccess (Created 201) {String}  userId       User Id
   * @apiSuccess (Created 201) {String}  productId      Product Id
   * @apiSuccess (Created 201) {Number}  amount      Amount
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated shoppingCards can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(), controller.create);

router
  .route('/:shoppingCardId')
/**
   * @api {get} v1/shoppingCard/:id Get Shopping Cart
   * @apiDescription Get shoppingCard information
   * @apiVersion 1.0.0
   * @apiName GetShoppingCart
   * @apiGroup ShoppingCart
   * @apiPermission shoppingCard
   *
   * @apiHeader {String} Authorization   ShoppingCart's access token
   *
   * @apiSuccess {String}  id         ShoppingCart's id
   * @apiSuccess {String}  userId       User Id
   * @apiSuccess {String}  productId      Product Id
   * @apiSuccess {String}  amount      Amount
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated shoppingCards can access the data
   * @apiError (Forbidden 403)    Forbidden    Only shoppingCard with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     ShoppingCart does not exist
   */
  .get(authorize(), controller.get)
  /**
   * @api {patch} v1/shoppingCard/:id Update ShoppingCart
   * @apiDescription Update some fields of a shoppingCard document
   * @apiVersion 1.0.0
   * @apiName UpdateShoppingCart
   * @apiGroup ShoppingCart
   * @apiPermission shoppingCard
   *
   * @apiHeader {String} Authorization   ShoppingCart's access token
   *
   * @apiParam  {String}      [userId]    User Id
   * @apiParam  {String}             [productId]     Product Id
   * @apiParam  {String}             [amount]     Amount
   * (You must be an admin to change the shoppingCard's role)
   *
   * @apiSuccess {String}  id         ShoppingCart's id
   * @apiSuccess {String}  userId       User Id
   * @apiSuccess {String}  productId      Product Id
   * @apiSuccess {String}  amount      Amount
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated shoppingCards can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only shoppingCard with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     ShoppingCart does not exist
   */
  .patch(authorize(ADMIN), controller.update)
  /**
   * @api {delete} v1/shoppingCard/:id Delete ShoppingCart
   * @apiDescription Delete a shoppingCard
   * @apiVersion 1.0.0
   * @apiName DeleteShoppingCart
   * @apiGroup ShoppingCart
   * @apiPermission shoppingCard
   *
   * @apiHeader {String} Authorization   ShoppingCart's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated shoppingCards can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only shoppingCard with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      ShoppingCart does not exist
   */
  .delete(authorize(), controller.remove);
module.exports = router;
