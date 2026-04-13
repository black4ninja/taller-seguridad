const { getDb } = require('../db/init');

function listPosts() {
  return getDb().prepare('SELECT * FROM posts ORDER BY id DESC').all();
}

// Fix V2: prepared statement con parámetros.
function searchPosts(q) {
  const pattern = `%${q}%`;
  return getDb()
    .prepare('SELECT * FROM posts WHERE title LIKE ? OR body LIKE ?')
    .all(pattern, pattern);
}

function createPost(author, title, body) {
  return getDb()
    .prepare('INSERT INTO posts (author, title, body) VALUES (?, ?, ?)')
    .run(author, title, body);
}

module.exports = { listPosts, searchPosts, createPost };
