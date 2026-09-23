CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, email) VALUES
  (1, 'Taro Yamada', 'taro@example.com'),
  (2, 'Hanako Suzuki', 'hanako@example.com')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email);