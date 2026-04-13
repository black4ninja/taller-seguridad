const { getDb } = require('../db/init');

function listPosts() {
  return getDb().prepare('SELECT * FROM posts ORDER BY id DESC').all();
}

// VULN V2 (Tampering - SQL Injection):
// Concatenación directa del input en la query.
// Payload: q=' OR '1'='1  devuelve todos los posts.
// Payload: q=' UNION SELECT id,username,password,role,email FROM users--
function searchPosts(q) {
  const sql = `SELECT * FROM posts WHERE title LIKE '%${q}%' OR body LIKE '%${q}%'`;
  return getDb().prepare(sql).all();
}

function createPost(author, title, body) {
  return getDb()
    .prepare('INSERT INTO posts (author, title, body) VALUES (?, ?, ?)')
    .run(author, title, body);
}

module.exports = { listPosts, searchPosts, createPost };
