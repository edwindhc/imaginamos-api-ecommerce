/* eslint-disable max-len */
const express = require('express');
const { authorize, ADMIN } = require('../middlewares/auth.middleware');

const controller = require('../controllers/order.controller');

const router = express.Router();
/**
 * Load order when API with orderId route parameter is hit
 */
router.param('orderId', controller.load);

router
  .route('/')
/**
   * @api {get} v1/order List Produts
   * @apiDescription Get a list of order
   * @apiVersion 1.0.0
   * @apiName ListOrders
   * @apiGroup Order
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   Order's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Produts per page
   * @apiParam  {Array}             [cart]       Cart or Products
   * @apiParam  {Number}             [total]      Order's total
   * @apiParam  {String= pending, confirmed}             [status]      Order's status
   *
   * @apiSuccess {Object[]} order List of order.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated order can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
  .get(controller.list)
  /**
   * @api {post} v1/order Create Order
   * @apiDescription Create a new order
   * @apiVersion 1.0.0
   * @apiName CreateOrder
   * @apiGroup Order
   * @apiPermission logged
   *
   *
   * @apiParam  {Array}             [cart]       Cart or Products
   * @apiParam  {Number}             [total]      Order's total
   * @apiParam  {String=pending,confirmed}             [status]      Order's status
   *
   * @apiSuccess (Created 201) {String}  id         Order's id
   * @apiSuccess (Created 201) {Array}  cart       Cart Products
   * @apiSuccess (Created 201) {Number}  total      Total Order
   * @apiSuccess (Created 201) {String=pending,confirmed}  status     Status Order
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated orders can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(), controller.create);

router
  .route('/:orderId')
/**
   * @api {get} v1/order/:id Get Order
   * @apiDescription Get order information
   * @apiVersion 1.0.0
   * @apiName GetOrder
   * @apiGroup Order
   * @apiPermission order
   *
   * @apiHeader {String} Authorization   Order's access token
   *
   * @apiParam  {Array}             [cart]       Cart or Products
   * @apiParam  {Number}             [total]      Order's total
   * @apiParam  {String=pending,confirmed}             [status]      Order's status
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated orders can access the data
   * @apiError (Forbidden 403)    Forbidden    Only order with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Order does not exist
   */
  .get(authorize(), controller.get)
  /**
   * @api {patch} v1/order/:id Update Order
   * @apiDescription Update some fields of a order document
   * @apiVersion 1.0.0
   * @apiName UpdateOrder
   * @apiGroup Order
   * @apiPermission order
   *
   * @apiHeader {String} Authorization   Order's access token
   *
   * @apiParam  {Array}             [cart]       Cart or Products
   * @apiParam  {Number}             [total]      Order's total
   * @apiParam  {String=pending,confirmed}             [status]      Order's status
   * (You must be an admin to change the order's role)
   *
   * @apiSuccess (Created 201) {String}  id         Order's id
   * @apiSuccess (Created 201) {Array}  cart       Cart Products
   * @apiSuccess (Created 201) {Number}  total      Total Order
   * @apiSuccess (Created 201) {String = pending,confirmed}  status     Status Order
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated orders can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only order with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Order does not exist
   */
  .patch(authorize(ADMIN), controller.update)
  /**
   * @api {delete} v1/order/:id Delete Order
   * @apiDescription Delete a order
   * @apiVersion 1.0.0
   * @apiName DeleteOrder
   * @apiGroup Order
   * @apiPermission order
   *
   * @apiHeader {String} Authorization   Order's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated orders can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only order with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Order does not exist
   */
  .delete(authorize(), controller.remove);
module.exports = router;
