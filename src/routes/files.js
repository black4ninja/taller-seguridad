const express = require('express');
const ctrl = require('../controllers/fileController');
const { uploader } = require('../services/uploadService');
const { requireLogin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireLogin, ctrl.showUpload);
// Fix V5: handler de multer envía 413 cuando se excede el límite.
router.post('/', requireLogin, (req, res, next) => {
  uploader.single('file')(req, res, (err) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).type('text/plain').send('Archivo demasiado grande');
    }
    if (err) return next(err);
    next();
  });
}, ctrl.doUpload);
router.get('/download', ctrl.download);

module.exports = router;
