CREATE TABLE customers (
    id CHAR(21) PRIMARY KEY,
    vocab_data JSON
);

INSERT INTO customers (id, vocab_data)
VALUES (
    "f7aV82SCiRW9IZQvh1zL5p", 
    '{
  "english": {
    "nouns": ["cat", "dog"],
    "verbs": ["run", "jump"]
  },
  "spanish": {
    "nouns": ["gato", "perro"],
    "verbs": ["correr", "saltar"]
  }
}'
);