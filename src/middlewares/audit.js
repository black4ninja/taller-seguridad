// Fix V3: middleware helper para registrar acciones en la tabla audit.
const { getDb } = require('../db/init');

function logAction(actor, action, target) {
  try {
    getDb().prepare(
      'INSERT INTO audit (actor, action, target, timestamp) VALUES (?, ?, ?, ?)'
    ).run(actor || 'anonymous', action, target || '', new Date().toISOString());
  } catch (_) {
    // No-op: el logging no debe romper la request.
  }
}

module.exports = { logAction };
