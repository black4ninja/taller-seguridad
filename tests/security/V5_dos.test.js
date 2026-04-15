const { freshApp, makeAgent, request } = require('./helpers');
const { isValidEmail } = require('../../src/utils/validators');

// testTimeout amplio por si la ReDoS está todavía activa; Jest no interrumpe
// regex síncronas, así que si el alumno aún no arregla V5 el test se cuelga.
// Workaround mientras lo arregla: `npm test -- --testPathIgnorePatterns=V5`.
jest.setTimeout(10000);

describe('V5 - Denial of Service (ReDoS + upload sin límite)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('validador de email resiste ReDoS: input malicioso responde en <1000ms', () => {
    const malicious = 'a'.repeat(15000) + '!';
    const start = Date.now();
    isValidEmail(malicious);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  test('validador de email sigue aceptando emails válidos', () => {
    expect(isValidEmail('neo@zion.net')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  test('upload de archivo excesivo (>2MB) debe rechazarse con 413', async () => {
    const agent = makeAgent(app);
    await agent.post('/auth/login').type('form').send({ username: 'neo', password: 'matrix' });
    const bigBuffer = Buffer.alloc(3 * 1024 * 1024, 'A'); // 3MB
    const res = await agent.post('/files')
      .field('email', 'neo@zion.net')
      .attach('file', bigBuffer, 'big.bin');
    expect(res.status).toBe(413);
  });
});
