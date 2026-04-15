const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Meta-test: asegura que los tests de seguridad no fueron modificados.
// Si un alumno "arregla" una vuln editando el test, este test truena.
describe('V0 - Integridad de la suite de tests', () => {
  const TESTS_DIR = __dirname;
  const LOCKED = [
    'V0_walkthrough.test.js',
    'V1_spoofing.test.js',
    'V2_tampering.test.js',
    'V3_repudiation.test.js',
    'V4_disclosure.test.js',
    'V5_dos.test.js',
    'V6_elevation.test.js'
  ];

  // Hashes SHA-256 generados por `node scripts/lock-tests.js`.
  // Si EXPECTED tiene entradas, el test exige match exacto (modo estricto).
  const EXPECTED = {
    'V0_walkthrough.test.js': '5a7da573c6ebd78c24739ad451bc4517e7a75ecdd60b8bd8ca5d826c0dae093b',
    'V1_spoofing.test.js': '1141ff7bdddcdcd0c85f51306d808892b456daa9d3090a475bdd69ac437d758e',
    'V2_tampering.test.js': 'e43f95d828b09a7e887fc11fc8e1cbadfbaf120d5001b0161cf86c27cb31af90',
    'V3_repudiation.test.js': 'faf3c5449fca5b8dc0c2ca3919fed54f63119dfd4bd78cd59430493eb9ecc2d1',
    'V4_disclosure.test.js': 'd8998e8ae60878ce977aa64341fd69990b6fe69477f721ad28b23efeaf6cbb24',
    'V5_dos.test.js': '4153b2b136bff66867f8c31287f444bbddf09b8d074d7164a6580f585a12e1d4',
    'V6_elevation.test.js': 'ef8576c745cfc9468481d015bfb95bf63762256acd6add65be04e2dfe938a961'
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
