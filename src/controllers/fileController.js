const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../services/uploadService');
const { isValidEmail } = require('../utils/validators');

function showUpload(req, res) {
  const files = fs.existsSync(UPLOAD_DIR) ? fs.readdirSync(UPLOAD_DIR).filter(f => f !== '.gitkeep') : [];
  res.render('files', { files, message: null });
}

function doUpload(req, res) {
  // V5 relacionado: el email se valida con regex catastrófica antes de aceptar el upload.
  const email = req.body.email || '';
  if (!isValidEmail(email)) {
    return res.status(400).render('files', {
      files: fs.readdirSync(UPLOAD_DIR).filter(f => f !== '.gitkeep'),
      message: 'Email inválido'
    });
  }
  res.redirect('/files');
}

// VULN V4 (Information Disclosure - Path Traversal):
// El parámetro `name` se concatena directamente al UPLOAD_DIR sin validación.
// Payload: GET /files/download?name=../../package.json  -> filtra archivos del repo.
// Payload: GET /files/download?name=../../../../../etc/passwd (en Linux).
function download(req, res) {
  const name = req.query.name || '';
  const filePath = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).type('text/plain').send('No encontrado');
  }
  res.sendFile(filePath);
}

module.exports = { showUpload, doUpload, download };
