import path from 'path';

import dotenv from 'dotenv';

// PATHS
const ROOT_DIR = path.resolve(__dirname + './../..');
const LOG_DIR = path.resolve(`${ROOT_DIR}/logs`);

// ENV
dotenv.config();
const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB_NAME,
  POSTGRES_TEST_DB_NAME,
  PORT,
  DB_PORT,
  TEST_DB_PORT,
  ENV,
  SALT_ROUNDS,
  JWT_SECRET,
  BCRYPT_SECRET
} = process.env;

// Constant Strings
const USER_STATUS_MESSAGES = {
  user_created_success: 'User Creation Successful.',
  user_login_success: 'User Login Successful.',
  user_logout_success: 'User Logout Successful.',

  user_created_failed: 'User Creation Failed.',
  user_retrieval_failed: 'User Retrieval Failed.',
  user_login_failed: 'User Login Failed.',
  user_logout_failed: 'User Logout Failed.'
};

const PRODUCT_STATUS_MESSAGES = {
  product_created_success: 'Product Creation Successful.',
  product_created_failed: 'Product Creation Failed.',
  product_retrieval_failed: 'Product Retrieval Failed.'
};

const ORDER_STATUS_MESSAGES = {
  order_created_success: 'Order Creation Successful.',
  order_created_failed: 'Order Creation Failed.',
  order_retrieval_failed: 'Order Retrieval Failed.'
};

const DATABASE_STATUS_MESSAGES = {
  // Success
  database_init_success: 'Database Initialized Successfully',
  select_success_but_empty: 'Database Select Succeeded but no rows came back.',
  insert_success: 'Database Insertion Query Succeeded.',
  update_success: 'Database Update Query Succeeded.',
  delete_success: 'Database Deletion Query Succeeded.',
  tuncation_success: 'Database Truncation Query Succeeded.',

  // Failure
  database_init_failed: 'Database Initialized Failed',
  connection_failed: 'Database Connection Failed.',
  select_failed: 'Database Select Query Failed.',
  insert_failed: 'Database Insertion Query Failed.',
  insert_failed_unique_violation: `duplicate key value violates unique constraint`,
  update_failed: 'Database Update Query Failed.',
  delete_failed: 'Database Deletion Query Failed.',
  tuncation_failed: 'Database Truncation Query Failed.'
};

export {
  // ENV Vars
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB_NAME,
  POSTGRES_TEST_DB_NAME,
  PORT,
  DB_PORT,
  TEST_DB_PORT,
  ENV,
  SALT_ROUNDS,
  JWT_SECRET,
  BCRYPT_SECRET,

  // Paths
  LOG_DIR,

  // String Constants
  USER_STATUS_MESSAGES,
  PRODUCT_STATUS_MESSAGES,
  ORDER_STATUS_MESSAGES,
  DATABASE_STATUS_MESSAGES
};
