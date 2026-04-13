function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).render('error', { message: 'Debes iniciar sesión' });
  }
  next();
}

module.exports = { requireLogin };
