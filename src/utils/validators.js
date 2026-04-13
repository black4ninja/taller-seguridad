// VULN V5 (parcial - ReDoS):
// Regex de email con backtracking catastrófico.
// Input malicioso: 'a'.repeat(50000) + '!' -> bloquea el event loop.
const EMAIL_REGEX = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+\.([a-zA-Z]{2,})+$/;

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email);
}

module.exports = { isValidEmail };
