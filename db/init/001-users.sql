CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

INSERT INTO users (id, name) VALUES
  (1, 'Taro Yamada'),
  (2, 'Hanako Suzuki')
ON DUPLICATE KEY UPDATE name = VALUES(name);