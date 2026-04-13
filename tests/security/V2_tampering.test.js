const { freshApp, request } = require('./helpers');

describe('V2 - Tampering (SQL Injection en búsqueda del foro)', () => {
  let app;
  beforeEach(() => { app = freshApp(); });

  test('payload clásico OR 1=1 no debe dumpear todos los posts', async () => {
    // Baseline: sin fix, `' OR '1'='1` devuelve todos los posts (3 seed).
    const res = await request(app).get(`/forum/search?q=${encodeURIComponent("' OR '1'='1")}`);
    expect(res.status).toBeLessThan(500);
    // El término literal "' OR '1'='1" no aparece en ningún post sembrado, así que
    // los resultados deben ser 0. Contamos apariciones del marker de post.
    const markers = (res.text.match(/class="post"/g) || []).length;
    // La página siempre muestra la lista global de posts abajo; el bloque de
    // "Resultados para" sólo se renderiza si hay resultados distintos a la lista base.
    // Un dump exitoso duplicaría los posts sembrados. Verificamos que no se duplican.
    expect(markers).toBeLessThanOrEqual(3);
  });

  test('payload UNION no debe leer la tabla users', async () => {
    const payload = "' UNION SELECT id, username, password, role FROM users--";
    const res = await request(app).get(`/forum/search?q=${encodeURIComponent(payload)}`);
    // Nunca debe aparecer un password de la seed en el HTML.
    expect(res.text).not.toContain('matrix');
    expect(res.text).not.toContain('admin123');
    expect(res.text).not.toContain('redpill');
  });

  test('búsqueda legítima sigue funcionando', async () => {
    const res = await request(app).get('/forum/search?q=Welcome');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Welcome to the underground forum');
  });
});
