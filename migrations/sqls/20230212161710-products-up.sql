CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
  prod_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  name VARCHAR(100) NOT NULL, 
  price decimal NOT NULL,
  product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);