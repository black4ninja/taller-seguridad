const express = require('express');
const ctrl = require('../controllers/forumController');
const { requireLogin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', ctrl.listPosts);
router.get('/search', ctrl.searchPosts);
router.post('/', requireLogin, ctrl.createPost);

module.exports = router;
