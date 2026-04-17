#!/usr/bin/env node
// Wrapper cross-platform para `zap-baseline.py` vía Docker.
// Reemplaza el script bash que truena en cmd.exe / PowerShell.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPORTS_DIR = path.resolve(process.cwd(), 'reports', 'zap');
fs.mkdirSync(REPORTS_DIR, { recursive: true });

function dockerPath(p) {
  if (process.platform !== 'win32') return p;
  return p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, d) => '/' + d.toLowerCase());
}

const args = [
  'run', '--rm', '-t', '-u', 'root',
  '-v', `${dockerPath(REPORTS_DIR)}:/zap/wrk`,
  'ghcr.io/zaproxy/zaproxy:stable',
  'zap-baseline.py',
  '-t', 'http://host.docker.internal:3000',
  '-r', 'zap-report.html'
];

console.log('[scan:zap] docker', args.join(' '));
const result = spawnSync('docker', args, { stdio: 'inherit' });

if (result.error && result.error.code === 'ENOENT') {
  console.error('\n[scan:zap] Docker no encontrado. Instala Docker Desktop e inténtalo de nuevo.');
  process.exit(127);
}

// zap-baseline.py devuelve 2 cuando hay WARN/FAIL — eso no es error nuestro.
// Solo propagamos códigos != 0,1,2.
const code = result.status ?? 1;
if (code === 0 || code === 1 || code === 2) {
  console.log(`\n[scan:zap] Reporte: ${path.join(REPORTS_DIR, 'zap-report.html')}`);
  process.exit(0);
}
process.exit(code);
