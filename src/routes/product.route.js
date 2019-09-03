/* eslint-disable max-len */
const express = require('express');
const validate = require('express-validation');
const { authorize, ADMIN } = require('../middlewares/auth.middleware');
const {
  listProduts,
  createProduct,
  updateProduct,
} = require('../validations/product.validation');
const controller = require('../controllers/product.controller');

const router = express.Router();
/**
 * Load product when API with productId route parameter is hit
 */
router.param('productId', controller.load);

router
  .route('/')
/**
   * @api {get} v1/product List Produts
   * @apiDescription Get a list of produts
   * @apiVersion 1.0.0
   * @apiName ListProducts
   * @apiGroup Product
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   Product's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Produts per page
   * @apiParam  {String}             [name]       Product's name
   * @apiParam  {String}             [category]      Product's category
   *
   * @apiSuccess {Object[]} produts List of produts.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated produts can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
  .get(validate(listProduts), controller.list)
  /**
   * @api {post} v1/product Create Product
   * @apiDescription Create a new product
   * @apiVersion 1.0.0
   * @apiName CreateProduct
   * @apiGroup Product
   * @apiPermission logged
   *
   *
   * @apiParam  {String{..128}}      name    Product's name
   * @apiParam  {Number}      [stock]    Product's name
   * @apiParam  {String}      category    Product's category
   *
   * @apiSuccess (Created 201) {String}  id         Product's id
   * @apiSuccess (Created 201) {String}  name       Product's name
   * @apiSuccess (Created 201) {String}  category      Product's category
   * @apiSuccess (Created 201) {String}  price      Product's price
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated products can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createProduct), controller.create);

router
  .route('/:productId')
/**
   * @api {get} v1/product/:id Get Product
   * @apiDescription Get product information
   * @apiVersion 1.0.0
   * @apiName GetProduct
   * @apiGroup Product
   * @apiPermission product
   *
   * @apiHeader {String} Authorization   Product's access token
   *
   * @apiSuccess {String}  id         Product's id
   * @apiSuccess {String}  name       Product's name
   * @apiSuccess {String}  stock      Product's stock
   * @apiSuccess {String}  category      Product's category
   * @apiSuccess {String}  price      Product's price
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated products can access the data
   * @apiError (Forbidden 403)    Forbidden    Only product with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Product does not exist
   */
  .get(authorize(), controller.get)
  /**
   * @api {patch} v1/product/:id Update Product
   * @apiDescription Update some fields of a product document
   * @apiVersion 1.0.0
   * @apiName UpdateProduct
   * @apiGroup Product
   * @apiPermission product
   *
   * @apiHeader {String} Authorization   Product's access token
   *
   * @apiParam  {String{..128}}      [name]    Product's name
   * @apiParam  {String}             [stock]     Product's stock
   * @apiParam  {String}             [category]     Product's category
   * @apiParam  {String}             [price]     Product's price
   * (You must be an admin to change the product's role)
   *
   * @apiSuccess {String}  id         Product's id
   * @apiSuccess {String}  name       Product's name
   * @apiSuccess {String}  stock      Product's stock
   * @apiSuccess {String}  category      Product's category
   * @apiSuccess {String}  price      Product's price
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated products can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only product with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Product does not exist
   */
  .patch(authorize(ADMIN), validate(updateProduct), controller.update)
  /**
   * @api {delete} v1/product/:id Delete Product
   * @apiDescription Delete a product
   * @apiVersion 1.0.0
   * @apiName DeleteProduct
   * @apiGroup Product
   * @apiPermission product
   *
   * @apiHeader {String} Authorization   Product's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated products can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only product with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Product does not exist
   */
  .delete(authorize(ADMIN), controller.remove);
module.exports = router;
