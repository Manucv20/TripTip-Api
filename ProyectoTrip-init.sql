CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  password CHAR(60) NOT NULL,
  profile_photo VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY (email)
);

CREATE TABLE recommendations (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  summary VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photo VARCHAR(255),
  votes BIGINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  recommendation_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE votes (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT,
  recommendation_id INT NOT NULL,
  vote_value TINYINT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id)
);
