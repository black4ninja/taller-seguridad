const Database = require('better-sqlite3');

let db;

function initDb() {
  if (db) return db;
  db = new Database(':memory:');

  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      email TEXT
    );
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT,
      action TEXT,
      target TEXT,
      timestamp TEXT
    );
  `);

  const insertUser = db.prepare('INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)');
  insertUser.run('neo', 'matrix', 'user', 'neo@zion.net');
  insertUser.run('trinity', 'zion', 'user', 'trinity@zion.net');
  insertUser.run('admin', 'admin123', 'admin', 'admin@campus.edu');
  insertUser.run('morpheus', 'redpill', 'user', 'morpheus@zion.net');

  const insertPost = db.prepare('INSERT INTO posts (author, title, body) VALUES (?, ?, ?)');
  insertPost.run('neo', 'Welcome', 'Welcome to the underground forum.');
  insertPost.run('trinity', 'Rules', 'Follow the white rabbit. Do not talk about the club.');
  insertPost.run('admin', 'CTF 2026', 'Next CTF competition coming soon.');

  return db;
}

function getDb() {
  if (!db) initDb();
  return db;
}

function resetDb() {
  if (db) {
    db.close();
    db = null;
  }
  return initDb();
}

module.exports = { initDb, getDb, resetDb };
