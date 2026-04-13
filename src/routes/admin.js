const express = require('express');
const ctrl = require('../controllers/adminController');
const { requireAdmin } = require('../middlewares/rbac');

const router = express.Router();

// Fix V6: middleware requireAdmin en todas las rutas admin.
router.use(requireAdmin);
router.get('/users', ctrl.listUsers);
router.post('/users/:id/promote', ctrl.promoteUser);

module.exports = router;
