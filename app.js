const express = require('express');
const session = require('express-session');
const path = require('path');

const { initDb } = require('./src/db/init');
const authRoutes = require('./src/routes/auth');
const forumRoutes = require('./src/routes/forum');
const fileRoutes = require('./src/routes/files');
const adminRoutes = require('./src/routes/admin');
const indexRoutes = require('./src/routes/index');

function createApp() {
  const app = express();

  initDb();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'src', 'views'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'src', 'public')));

  // VULN V1 (parcial): cookies sin flags de seguridad + secreto hardcodeado débil.
  app.use(session({
    secret: 'admin123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60
    }
  }));

  app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
  });

  app.use('/', indexRoutes);
  app.use('/auth', authRoutes);
  app.use('/forum', forumRoutes);
  app.use('/files', fileRoutes);
  app.use('/admin', adminRoutes);

  // VULN V4 (parcial): error handler expone stack trace al cliente.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(500).type('text/plain').send(
      `ERROR: ${err.message}\n\nSTACK:\n${err.stack}`
    );
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`\n  [+] Hack the Campus running on http://localhost:${port}`);
    console.log('  [+] Default accounts:  neo/matrix  |  trinity/zion  |  admin/admin123\n');
  });
}

module.exports = { createApp };
