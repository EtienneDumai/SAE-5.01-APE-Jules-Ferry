CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at);
