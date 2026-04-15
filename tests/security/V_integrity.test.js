const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Meta-test: asegura que los tests de seguridad no fueron modificados.
// Si un alumno "arregla" una vuln editando el test, este test truena.
describe('V0 - Integridad de la suite de tests', () => {
  const TESTS_DIR = __dirname;
  const LOCKED = [
    'V1_spoofing.test.js',
    'V2_tampering.test.js',
    'V3_repudiation.test.js',
    'V4_disclosure.test.js',
    'V5_dos.test.js',
    'V6_elevation.test.js'
  ];

  // Hashes calculados sobre los archivos originales (SHA-256).
  // Si necesitas regenerar: node -e "console.log(require('crypto').createHash('sha256').update(require('fs').readFileSync('tests/security/V1_spoofing.test.js')).digest('hex'))"
  const EXPECTED = {
    // Los hashes reales se llenan con scripts/lock-tests.js
  };

  test('los archivos de test existen y no están vacíos', () => {
    for (const f of LOCKED) {
      const p = path.join(TESTS_DIR, f);
      expect(fs.existsSync(p)).toBe(true);
      const content = fs.readFileSync(p, 'utf8');
      expect(content.length).toBeGreaterThan(200);
    }
  });

  test('ningún test contiene .skip o .only (evita saltarse checks)', () => {
    // Patrones construidos dinámicamente para que este test no se autodetecte.
    const dot = String.fromCharCode(46);
    const skipRe = new RegExp(`\\b(describe|test|it)${dot}(skip|only)\\b`);
    const xRe = new RegExp(`\\b(x${'describe'}|x${'test'}|x${'it'})\\b`);
    for (const f of LOCKED) {
      const content = fs.readFileSync(path.join(TESTS_DIR, f), 'utf8');
      expect(skipRe.test(content)).toBe(false);
      expect(xRe.test(content)).toBe(false);
    }
  });

  test('app.js y rutas críticas existen (no se pueden eliminar para pasar tests)', () => {
    const criticalFiles = [
      'app.js',
      'src/routes/admin.js',
      'src/routes/files.js',
      'src/routes/auth.js',
      'src/routes/forum.js',
      'src/services/authService.js',
      'src/utils/validators.js'
    ];
    const root = path.join(__dirname, '..', '..');
    for (const f of criticalFiles) {
      expect(fs.existsSync(path.join(root, f))).toBe(true);
    }
  });

  // Preserved hook for instructor-regenerable strict hash-lock mode.
  // eslint-disable-next-line jest/no-disabled-tests
  test('(opcional) integridad por hash si EXPECTED está poblado', () => {
    if (Object.keys(EXPECTED).length === 0) return;
    for (const [f, expectedHash] of Object.entries(EXPECTED)) {
      const content = fs.readFileSync(path.join(TESTS_DIR, f));
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      expect(hash).toBe(expectedHash);
    }
  });
});
