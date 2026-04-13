const { freshApp, makeAgent, request } = require('./helpers');

describe('V1 - Spoofing (Autenticación)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('no debe haber user enumeration: credenciales inválidas devuelven mensaje genérico', async () => {
    const r1 = await request(app).post('/auth/login').type('form')
      .send({ username: 'usuario_que_no_existe', password: 'x' });
    const r2 = await request(app).post('/auth/login').type('form')
      .send({ username: 'neo', password: 'password_incorrecto' });

    const body1 = r1.text.toLowerCase();
    const body2 = r2.text.toLowerCase();

    expect(body1).not.toMatch(/usuario no existe|user not found|no existe el usuario/);
    expect(body2).not.toMatch(/contraseña incorrecta|wrong password|password incorrect/);
    // Ambos responses deben ser indistinguibles en el texto de error.
    const strip = s => s.replace(/\s+/g, ' ').replace(/<[^>]+>/g, '');
    expect(strip(body1)).toEqual(strip(body2));
  });

  test('rate limiting: 11 intentos fallidos desde la misma IP deben devolver 429', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post('/auth/login').type('form')
        .send({ username: 'neo', password: 'wrong' + i });
    }
    const res = await request(app).post('/auth/login').type('form')
      .send({ username: 'neo', password: 'wrong_final' });
    expect(res.status).toBe(429);
  });

  test('cookie de sesión debe tener flag HttpOnly', async () => {
    const res = await request(app).post('/auth/login').type('form')
      .send({ username: 'neo', password: 'matrix' });
    const cookies = res.headers['set-cookie'] || [];
    const sessCookie = cookies.find(c => /connect\.sid|session/i.test(c));
    expect(sessCookie).toBeDefined();
    expect(sessCookie.toLowerCase()).toContain('httponly');
  });

  test('login legítimo debe seguir funcionando tras aplicar los fixes', async () => {
    const agent = makeAgent(app);
    const res = await agent.post('/auth/login').type('form')
      .send({ username: 'neo', password: 'matrix' });
    expect([200, 302]).toContain(res.status);
    const home = await agent.get('/');
    expect(home.text).toContain('neo');
  });
});
