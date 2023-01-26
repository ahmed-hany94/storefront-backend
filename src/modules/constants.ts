// Node Module Imports
import path from 'path';

// PATHS
const ROOT_DIR = path.resolve(__dirname + './../..');
const LOG_DIR = path.resolve(`${ROOT_DIR}/logs`);

// Package Imports
import dotenv from 'dotenv';

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
  user_created_succes: 'User Creation Successful.',
  user_created_failed: 'User Creation Failed.',
  user_retrieval_failed: 'User Retrieval Failed.'
};

const DATABASE_STATUS_MESSAGES = {
  // Success
  select_success_but_empty: 'Database Select Succeeded but no rows came back.',
  insert_success: 'Database Insertion Query Succeeded.',
  // Failure
  select_failed: 'Database Select Query Failed.',
  insert_failed: 'Database Insertion Query Failed.',
  insert_failed_unique_violation: 'Unique Key Violation:'
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
  DATABASE_STATUS_MESSAGES
};
