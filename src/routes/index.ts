import express, { Router } from 'express';
import { hasAuthroization, isAuthenticated, login, logout } from './authCtrl';
import {
  createUser,
  getUser,
  getUsers,
  userByID,
  updateUser,
  deleteUser
} from '../controllers/userCtrl';
import {
  listProducts,
  createProducts,
  productByID,
  getProduct
} from '../controllers/productsCtrl';
import { createUserOrder, getUserOrder } from '../services';

const router: Router = express.Router();

// auth
router.route('/auth/login').post(login);
router.route('/auth/logout').get(logout);

// user's order
router
  .route('/users/:userID/orders')
  .get(isAuthenticated, hasAuthroization, getUserOrder)
  .post(isAuthenticated, hasAuthroization, createUserOrder);

// users
router
  .route('/users/:userID')
  .get(isAuthenticated, getUser)
  .put(isAuthenticated, hasAuthroization, updateUser)
  .delete(isAuthenticated, hasAuthroization, deleteUser);
router.route('/users').get(isAuthenticated, getUsers).post(createUser);

router.param('userID', userByID);

// products
router.route('/products/:prodID').get(getProduct);
router
  .route('/products')
  .get(listProducts)
  .post(isAuthenticated, createProducts);

router.param('prodID', productByID);

// orders

export { router };
