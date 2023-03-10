CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  username VARCHAR(100) UNIQUE NOT NULL,
  firstName VARCHAR(100) NOT NULL, 
  lastName VARCHAR(100) NOT NULL, 
  hash VARCHAR(60) NOT NULL,
  user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);