const { freshApp, request } = require('./helpers');

describe('V4 - Information Disclosure (Path Traversal + Stack Traces)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('path traversal con ../ debe rechazarse', async () => {
    // Sin fix: esto devuelve el package.json del proyecto.
    const res = await request(app).get('/files/download?name=' + encodeURIComponent('../package.json'));
    expect([400, 403, 404]).toContain(res.status);
    expect(res.text).not.toContain('hack-the-campus');
    expect(res.text).not.toContain('"dependencies"');
  });

  test('path traversal URL-encoded también debe rechazarse', async () => {
    const res = await request(app).get('/files/download?name=..%2Fpackage.json');
    expect([400, 403, 404]).toContain(res.status);
    expect(res.text).not.toContain('"dependencies"');
  });

  test('path absoluto debe rechazarse', async () => {
    const res = await request(app).get('/files/download?name=' + encodeURIComponent('/etc/passwd'));
    expect([400, 404]).toContain(res.status);
    expect(res.text).not.toMatch(/root:x:/);
  });

  test('archivo legítimo dentro de uploads sigue siendo descargable', async () => {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    fs.writeFileSync(path.join(uploadsDir, 'test_evidence.txt'), 'contenido legitimo');
    try {
      const res = await request(app).get('/files/download?name=test_evidence.txt');
      expect(res.status).toBe(200);
      expect(res.text).toContain('contenido legitimo');
    } finally {
      fs.unlinkSync(path.join(uploadsDir, 'test_evidence.txt'));
    }
  });
});
