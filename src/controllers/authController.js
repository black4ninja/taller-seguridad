const authService = require('../services/authService');

function showLogin(req, res) {
  res.render('login', { error: null });
}

// VULN V1 + V3:
//  V1: mensajes diferenciados (user enumeration) + sin rate limit.
//  V3: no se registra el intento de login en la tabla audit.
function doLogin(req, res) {
  const { username, password } = req.body;
  try {
    const user = authService.authenticate(username, password);
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    if (err.code === 'USER_NOT_FOUND') {
      return res.status(401).render('login', { error: 'Usuario no existe' });
    }
    if (err.code === 'BAD_PASSWORD') {
      return res.status(401).render('login', { error: 'Contraseña incorrecta' });
    }
    return res.status(500).render('login', { error: 'Error del servidor' });
  }
}

function doLogout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

module.exports = { showLogin, doLogin, doLogout };
