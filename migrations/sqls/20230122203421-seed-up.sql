CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "ORDER_STATUS" AS ENUM ('active', 'complete');

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  name VARCHAR(100) NOT NULL, 
  price decimal NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  username VARCHAR(100) UNIQUE NOT NULL,
  firstName VARCHAR(100) NOT NULL, 
  lastName VARCHAR(100) NOT NULL, 
  hash VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  status "ORDER_STATUS" NOT NULL,
  product_id uuid NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL
);