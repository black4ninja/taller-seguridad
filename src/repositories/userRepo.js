const { getDb } = require('../db/init');

function findByUsername(username) {
  return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function findById(id) {
  return getDb().prepare('SELECT id, username, role, email FROM users WHERE id = ?').get(id);
}

function listAll() {
  return getDb().prepare('SELECT id, username, role, email FROM users').all();
}

function updateRole(id, role) {
  return getDb().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
}

module.exports = { findByUsername, findById, listAll, updateRole };
