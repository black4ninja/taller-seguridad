const express = require('express');

const router = express.Router();

// Fix V0: escapar HTML antes de insertar input del usuario.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

router.get('/', (req, res) => {
  const msg = req.query.msg || 'OK';
  res.type('html').send(
    `<!DOCTYPE html>
<html><head><title>Status</title><link rel="stylesheet" href="/style.css"></head>
<body>
  <main>
    <h1>&gt; status_</h1>
    <div class="post">Status: ${escapeHtml(msg)}</div>
    <p><a href="/">[home]</a></p>
  </main>
</body></html>`
  );
});

module.exports = router;
