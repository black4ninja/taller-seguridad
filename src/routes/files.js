const express = require('express');
const ctrl = require('../controllers/fileController');
const { uploader } = require('../services/uploadService');
const { requireLogin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireLogin, ctrl.showUpload);
router.post('/', requireLogin, uploader.single('file'), ctrl.doUpload);
router.get('/download', ctrl.download);

module.exports = router;
