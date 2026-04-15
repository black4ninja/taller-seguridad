#!/usr/bin/env node
// Uso (solo el profe, antes de entregar): `node scripts/lock-tests.js`
// Calcula SHA-256 de V1..V6 + V0_walkthrough y los escribe dentro
// de V_integrity.test.js entre los marcadores LOCKED_HASHES_BEGIN/END.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TESTS_DIR = path.join(__dirname, '..', 'tests', 'security');
const INTEGRITY_FILE = path.join(TESTS_DIR, 'V_integrity.test.js');

const LOCKED = [
  'V0_walkthrough.test.js',
  'V1_spoofing.test.js',
  'V2_tampering.test.js',
  'V3_repudiation.test.js',
  'V4_disclosure.test.js',
  'V5_dos.test.js',
  'V6_elevation.test.js'
];

function sha256(file) {
  return crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(TESTS_DIR, file)))
    .digest('hex');
}

const hashes = {};
for (const f of LOCKED) hashes[f] = sha256(f);

const lines = [
  '  // LOCKED_HASHES_BEGIN (generado por scripts/lock-tests.js, no editar)',
  ...Object.entries(hashes).map(([f, h]) => `  const EXPECTED_${f.replace(/[^a-zA-Z0-9]/g, '_')} = '${h}';`),
  '  // LOCKED_HASHES_END'
].join('\n');

let content = fs.readFileSync(INTEGRITY_FILE, 'utf8');
content = content.replace(
  /\/\/ LOCKED_HASHES_BEGIN[\s\S]*?\/\/ LOCKED_HASHES_END/,
  lines.trim().split('\n').slice(0).join('\n').replace(/^  /gm, '  ')
);

// Reemplazar también el objeto EXPECTED del test, dejándolo como const:
const expectedBlock = Object.entries(hashes)
  .map(([f, h]) => `    '${f}': '${h}'`)
  .join(',\n');

content = content.replace(
  /const EXPECTED = \{[\s\S]*?\};/,
  `const EXPECTED = {\n${expectedBlock}\n  };`
);

fs.writeFileSync(INTEGRITY_FILE, content);
console.log('[lock-tests] hashes escritos en', path.relative(process.cwd(), INTEGRITY_FILE));
for (const [f, h] of Object.entries(hashes)) console.log(`  ${f}  ${h.slice(0, 16)}...`);
