# Hack the Campus — Taller CTF de Seguridad Web

> Portal interno del Club de Ciberseguridad. **Deliberadamente vulnerable.**
> Tu misión: identificar y remediar las **6 vulnerabilidades** clasificadas bajo **STRIDE** en 1:30 horas.

---

## Reglas de la competencia

1. **Individual.** Clonas este repo, arreglas las vulnerabilidades en tu copia local.
2. **1:30 horas** desde el banderazo.
3. Gana quien primero tenga los **6 tests de `npm test` en verde**.
4. Validación: al terminar, levanta la mano y muestra al profesor/TA la salida de `npm test`. No hay defensa oral.
5. **No edites los archivos en `tests/security/`** — hay un test meta que detecta modificaciones.
6. Entregable paralelo: llenar `docs/STRIDE.md` con el mapeo vuln → letra STRIDE → control NIST 800-53 → commit que la arregló.

## Setup (minuto 0-10)

```bash
git clone <este-repo> hack-the-campus
cd hack-the-campus
npm install
npm start      # arranca en http://localhost:3000
```

Cuentas de prueba: `neo/matrix` · `trinity/zion` · `admin/admin123`

Corre los tests para ver el baseline rojo:

```bash
npm test
```

Deberías ver 6 bloques de tests fallando. Cada uno corresponde a una vulnerabilidad STRIDE.

## Herramientas de análisis (el "MobSF" para web)

Así como MobSF escanea apps móviles, para web usamos tres herramientas complementarias. Revisa [`docs/GUIA_HERRAMIENTAS.md`](docs/GUIA_HERRAMIENTAS.md) para comandos y tips.

| Herramienta | Tipo | Qué detecta en este repo |
|---|---|---|
| **OWASP ZAP** | DAST (caja negra) | Headers faltantes, stack traces, cookies inseguras |
| **Semgrep** | SAST (análisis de código) | SQLi, secretos hardcodeados, regex peligrosas |
| **npm audit** | SCA (dependencias) | Paquete vulnerable en `package.json` |

```bash
npm run scan:audit      # dependencias
npm run scan:semgrep    # código (requiere Docker)
npm run scan:zap        # app corriendo (requiere Docker + npm start en otra terminal)
```

## Las 6 vulnerabilidades (STRIDE)

Cada letra de STRIDE tiene **una** vulnerabilidad plantada. Los tests son la especificación del fix.

| Test | STRIDE | Hint |
|---|---|---|
| `V1_spoofing.test.js` | **S**poofing | login, cookies, rate limit |
| `V2_tampering.test.js` | **T**ampering | búsqueda del foro |
| `V3_repudiation.test.js` | **R**epudiation | tabla `audit` |
| `V4_disclosure.test.js` | **I**nformation Disclosure | descarga de archivos |
| `V5_dos.test.js` | **D**enial of Service | upload + validador de email |
| `V6_elevation.test.js` | **E**levation of Privilege | rutas `/admin` |

## Docs

- [`docs/DFD.md`](docs/DFD.md) — Diagrama de flujo de datos con límites de confianza.
- [`docs/STRIDE.md`](docs/STRIDE.md) — **Plantilla a llenar** (entregable paralelo).
- [`docs/GUIA_HERRAMIENTAS.md`](docs/GUIA_HERRAMIENTAS.md) — Comandos de ZAP/Semgrep/npm audit.

## Stack

Node.js 20+ · Express · EJS · better-sqlite3 (in-memory) · Arquitectura MVC + servicios.

---

> *Follow the white rabbit.*
