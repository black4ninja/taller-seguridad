// VULN V6 (Elevation of Privilege):
// Este middleware existe pero NO está conectado en las rutas de /admin.
// El check de rol solo se hace en el frontend (menú oculto para no-admins).
// Un usuario normal puede hacer curl directamente a /admin/users y pasar.
function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(403).render('error', { message: 'Forbidden' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'Forbidden' });
  }
  next();
}

module.exports = { requireAdmin };
