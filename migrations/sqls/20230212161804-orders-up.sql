CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT CHECK (status IN ('active', 'complete')),
  user_id uuid REFERENCES users(user_id) NOT NULL,
  order_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);