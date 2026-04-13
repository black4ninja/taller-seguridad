const express = require('express');
const ctrl = require('../controllers/adminController');

const router = express.Router();

// VULN V6: rutas sin middleware requireAdmin.
router.get('/users', ctrl.listUsers);
router.post('/users/:id/promote', ctrl.promoteUser);

module.exports = router;
