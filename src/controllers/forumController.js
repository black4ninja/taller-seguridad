const forumRepo = require('../repositories/forumRepo');

function listPosts(req, res) {
  const posts = forumRepo.listPosts();
  res.render('forum', { posts, query: '', results: null });
}

function searchPosts(req, res) {
  const q = req.query.q || '';
  const results = forumRepo.searchPosts(q);
  res.render('forum', { posts: forumRepo.listPosts(), query: q, results });
}

function createPost(req, res) {
  const { title, body } = req.body;
  forumRepo.createPost(req.session.user.username, title, body);
  res.redirect('/forum');
}

module.exports = { listPosts, searchPosts, createPost };
