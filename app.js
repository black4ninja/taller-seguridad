const express = require('express');
const session = require('express-session');
const path = require('path');

const { initDb } = require('./src/db/init');
const authRoutes = require('./src/routes/auth');
const forumRoutes = require('./src/routes/forum');
const fileRoutes = require('./src/routes/files');
const adminRoutes = require('./src/routes/admin');
const indexRoutes = require('./src/routes/index');
const statusRoutes = require('./src/routes/status');

function createApp() {
  const app = express();

  initDb();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'src', 'views'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'src', 'public')));

  // Fix V1: cookies httpOnly + sameSite strict, secreto desde env.
  app.use(session({
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
  app.use('/status', statusRoutes);

  // Fix V4 (parte): error handler genérico sin stack al cliente.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[error]', err.message, err.stack);
    res.status(err.status || 500).type('text/plain').send('Internal server error');
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
