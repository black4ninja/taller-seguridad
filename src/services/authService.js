const userRepo = require('../repositories/userRepo');

// VULN V1 (Spoofing):
//  - Mensajes de error distinguen usuario inexistente vs password incorrecto (user enumeration).
//  - No hay rate limiting.
//  - Password en texto plano (no hash).
function authenticate(username, password) {
  const user = userRepo.findByUsername(username);
  if (!user) {
    const err = new Error('Usuario no existe');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  if (user.password !== password) {
    const err = new Error('Contraseña incorrecta');
    err.code = 'BAD_PASSWORD';
    throw err;
  }
  return { id: user.id, username: user.username, role: user.role };
}

module.exports = { authenticate };
