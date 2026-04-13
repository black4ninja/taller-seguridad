const authService = require('../services/authService');
const { logAction } = require('../middlewares/audit');

function showLogin(req, res) {
  res.render('login', { error: null });
}

// Fix V1: mensaje genérico (no user enumeration).
// Fix V3: se audita cada intento de login (exitoso o fallido).
function doLogin(req, res) {
  const { username, password } = req.body;
  try {
    const user = authService.authenticate(username, password);
    req.session.user = user;
    logAction(user.username, 'login:success', `user:${user.id}`);
    res.redirect('/');
  } catch (err) {
    logAction(username || 'unknown', 'login:failed', err.code || 'error');
    return res.status(401).render('login', { error: 'Credenciales inválidas' });
  }
}

function doLogout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

module.exports = { showLogin, doLogin, doLogout };
