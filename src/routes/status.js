const express = require('express');

const router = express.Router();

// VULN V0 (Reflected XSS):
// El parámetro `msg` se concatena directamente al HTML sin escapar.
// Payload: /status?msg=<script>alert(1)</script>
// Ver docs/WALKTHROUGH.md para la resolución guiada paso a paso.
router.get('/', (req, res) => {
  const msg = req.query.msg || 'OK';
  res.type('html').send(
    `<!DOCTYPE html>
<html><head><title>Status</title><link rel="stylesheet" href="/style.css"></head>
<body>
  <main>
    <h1>&gt; status_</h1>
    <div class="post">Status: ${msg}</div>
    <p><a href="/">[home]</a></p>
  </main>
</body></html>`
  );
});

module.exports = router;
