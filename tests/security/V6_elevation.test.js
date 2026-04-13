const { freshApp, makeAgent, request } = require('./helpers');

describe('V6 - Elevation of Privilege (RBAC en /admin)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('usuario no autenticado no puede ver /admin/users', async () => {
    const res = await request(app).get('/admin/users');
    expect([401, 403, 302]).toContain(res.status);
  });

  test('usuario normal (rol=user) no puede ver /admin/users', async () => {
    const agent = makeAgent(app);
    await agent.post('/auth/login').type('form').send({ username: 'neo', password: 'matrix' });
    const res = await agent.get('/admin/users');
    expect(res.status).toBe(403);
  });

  test('usuario normal no puede promover a otro usuario', async () => {
    const agent = makeAgent(app);
    await agent.post('/auth/login').type('form').send({ username: 'trinity', password: 'zion' });
    const res = await agent.post('/admin/users/1/promote');
    expect(res.status).toBe(403);
    // Y el usuario NO debe haber cambiado de rol.
    const { getDb } = require('../../src/db/init');
    const neo = getDb().prepare('SELECT role FROM users WHERE username = ?').get('neo');
    expect(neo.role).toBe('user');
  });

  test('admin sí puede ver /admin/users', async () => {
    const agent = makeAgent(app);
    await agent.post('/auth/login').type('form').send({ username: 'admin', password: 'admin123' });
    const res = await agent.get('/admin/users');
    expect(res.status).toBe(200);
    expect(res.text).toContain('neo');
  });
});
