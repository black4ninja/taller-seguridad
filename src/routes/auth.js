const express = require('express');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.get('/login', ctrl.showLogin);
router.post('/login', ctrl.doLogin);
router.post('/logout', ctrl.doLogout);
router.get('/logout', ctrl.doLogout);

module.exports = router;
