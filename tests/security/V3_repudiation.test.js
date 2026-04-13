const { freshApp, makeAgent, request } = require('./helpers');
const { getDb } = require('../../src/db/init');

describe('V3 - Repudiation (Auditoría de acciones)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('login exitoso debe registrar entrada en la tabla audit con timestamp + actor + action', async () => {
    await request(app).post('/auth/login').type('form')
      .send({ username: 'neo', password: 'matrix' });
    const rows = getDb().prepare("SELECT * FROM audit WHERE action LIKE '%login%'").all();
    expect(rows.length).toBeGreaterThan(0);
    const row = rows[0];
    expect(row.actor).toBeTruthy();
    expect(row.timestamp).toBeTruthy();
    expect(row.action).toBeTruthy();
  });

  test('login fallido también debe auditarse', async () => {
    await request(app).post('/auth/login').type('form')
      .send({ username: 'neo', password: 'wrong' });
    const rows = getDb().prepare("SELECT * FROM audit WHERE action LIKE '%login%'").all();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('promoción de usuario (cambio de rol) debe auditarse', async () => {
    const agent = makeAgent(app);
    await agent.post('/auth/login').type('form').send({ username: 'admin', password: 'admin123' });
    await agent.post('/admin/users/2/promote');
    const rows = getDb().prepare("SELECT * FROM audit WHERE action LIKE '%promote%' OR action LIKE '%role%'").all();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].actor).toBe('admin');
  });
});
