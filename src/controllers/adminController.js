const userRepo = require('../repositories/userRepo');

// VULN V6: estos handlers NO verifican `req.session.user.role === 'admin'`.
// El menú de admin está oculto en el frontend para usuarios normales,
// pero un curl directo a /admin/users pasa sin problema.
// Además, V3: no se audita quién cambió el rol ni cuándo.

function listUsers(req, res) {
  if (!req.session.user) {
    return res.status(401).render('error', { message: 'Login requerido' });
  }
  const users = userRepo.listAll();
  res.render('admin', { users });
}

function promoteUser(req, res) {
  if (!req.session.user) {
    return res.status(401).render('error', { message: 'Login requerido' });
  }
  const { id } = req.params;
  userRepo.updateRole(id, 'admin');
  res.redirect('/admin/users');
}

module.exports = { listUsers, promoteUser };
