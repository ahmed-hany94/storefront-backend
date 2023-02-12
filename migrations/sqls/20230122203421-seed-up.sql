CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  username VARCHAR(100) UNIQUE NOT NULL,
  firstName VARCHAR(100) NOT NULL, 
  lastName VARCHAR(100) NOT NULL, 
  hash VARCHAR(60) NOT NULL,
  user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  prod_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  name VARCHAR(100) NOT NULL, 
  price decimal NOT NULL,
  product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity INT NOT NULL,
  status TEXT CHECK (status IN ('active', 'complete')),
  product_id uuid REFERENCES products(prod_id) NOT NULL,
  user_id uuid REFERENCES users(user_id) NOT NULL,
  order_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);