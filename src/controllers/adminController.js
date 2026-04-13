const userRepo = require('../repositories/userRepo');
const { logAction } = require('../middlewares/audit');

// Fix V6: rbac lo maneja requireAdmin en el router.
// Fix V3: se audita cada promoción.

function listUsers(req, res) {
  const users = userRepo.listAll();
  res.render('admin', { users });
}

function promoteUser(req, res) {
  const { id } = req.params;
  userRepo.updateRole(id, 'admin');
  logAction(req.session.user.username, 'promote:role', `user:${id}`);
  res.redirect('/admin/users');
}

module.exports = { listUsers, promoteUser };
