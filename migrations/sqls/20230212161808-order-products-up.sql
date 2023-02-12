CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS order_products (
  order_product_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity INT NOT NULL,
  order_id uuid REFERENCES orders(order_id) NOT NULL,
  product_id uuid REFERENCES products(prod_id) NOT NULL,
  order_product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);