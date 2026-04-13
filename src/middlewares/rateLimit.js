// Fix V1: rate limit simple en memoria por IP (reseteable por test).
const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map();

function loginRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  attempts.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).type('text/plain').send('Demasiados intentos. Intenta más tarde.');
  }
  next();
}

function reset() { attempts.clear(); }

module.exports = { loginRateLimit, reset };
