#!/usr/bin/env node
// Wrapper cross-platform para semgrep vía Docker.

const path = require('path');
const { spawnSync } = require('child_process');

function dockerPath(p) {
  if (process.platform !== 'win32') return p;
  return p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, d) => '/' + d.toLowerCase());
}

const cwd = path.resolve(process.cwd());

const args = [
  'run', '--rm',
  '-v', `${dockerPath(cwd)}:/src`,
  'semgrep/semgrep',
  'semgrep',
  '--config=p/owasp-top-ten',
  '--config=p/nodejsscan',
  '/src/src'
];

console.log('[scan:semgrep] docker', args.join(' '));
const result = spawnSync('docker', args, { stdio: 'inherit' });

if (result.error && result.error.code === 'ENOENT') {
  console.error('\n[scan:semgrep] Docker no encontrado. Instala Docker Desktop e inténtalo de nuevo.');
  process.exit(127);
}

// semgrep devuelve 1 cuando encuentra findings (esperado, no es error nuestro).
const code = result.status ?? 1;
if (code === 0 || code === 1) process.exit(0);
process.exit(code);
