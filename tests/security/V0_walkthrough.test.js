const { freshApp, request } = require('./helpers');

// V0 es el ejemplo guiado. Mira docs/WALKTHROUGH.md para la resolución paso a paso.
describe('V0 - Reflected XSS (walkthrough)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('payload <script> no debe aparecer sin escapar en la respuesta', async () => {
    const payload = '<script>alert(1)</script>';
    const res = await request(app).get('/status?msg=' + encodeURIComponent(payload));
    expect(res.status).toBe(200);
    // El tag literal <script> no debe renderizarse (debe estar escapado como &lt;script&gt;).
    expect(res.text).not.toContain('<script>alert(1)</script>');
  });

  test('payload img onerror tampoco debe pasar', async () => {
    const payload = '<img src=x onerror=alert(1)>';
    const res = await request(app).get('/status?msg=' + encodeURIComponent(payload));
    expect(res.text).not.toContain('<img src=x onerror=alert(1)>');
  });

  test('mensaje legítimo (texto plano) sigue mostrándose', async () => {
    const res = await request(app).get('/status?msg=' + encodeURIComponent('todo bien'));
    expect(res.status).toBe(200);
    expect(res.text).toContain('todo bien');
  });
});
