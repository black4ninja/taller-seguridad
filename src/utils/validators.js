// Fix V5: regex lineal, sin grupos anidados con cuantificadores.
// Longitud máxima razonable para evitar abuso.
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

module.exports = { isValidEmail };
