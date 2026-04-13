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

// Fix V4: valida que el nombre sea un basename simple y que el path resuelto
// siga dentro de UPLOAD_DIR.
function download(req, res) {
  const name = req.query.name || '';
  if (!name || name !== path.basename(name) || name.includes('\0')) {
    return res.status(400).type('text/plain').send('Nombre inválido');
  }
  const filePath = path.resolve(UPLOAD_DIR, name);
  if (!filePath.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    return res.status(400).type('text/plain').send('Ruta inválida');
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).type('text/plain').send('No encontrado');
  }
  res.sendFile(filePath);
}

module.exports = { showUpload, doUpload, download };
