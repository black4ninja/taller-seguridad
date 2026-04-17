# Guía de herramientas — El "MobSF para web"

MobSF escaneaba apps móviles de tres formas: decompilaba el APK (SAST), corría la app en emulador (DAST), y revisaba librerías (SCA). Para web usamos el equivalente con tres herramientas separadas.

---

## 1. OWASP ZAP — DAST (Dynamic Application Security Testing)

Corre un escaneo **con la app corriendo**. Es el equivalente más directo a MobSF: le das la URL, corre sondas pasivas y activas, y te devuelve un reporte HTML con findings clasificados.

### Instalación (Docker, sin instalar nada más)

```bash
# En una terminal, arranca la app:
npm start

# En otra terminal (Win/Mac/Linux):
npm run scan:zap
```

`npm run scan:zap` y `npm run scan:semgrep` son wrappers Node (`scripts/scan-*.js`)
que funcionan idéntico en Windows (cmd/PowerShell), macOS y Linux. El reporte
HTML queda en `reports/zap/zap-report.html`.

En Linux puede ser necesario agregar `--network=host` al script si
`host.docker.internal` no resuelve.

### Qué debe detectar

- Cookies sin `HttpOnly` / `Secure` / `SameSite` → pista para **V1**.
- Respuestas con stack trace (Information Disclosure) → pista para **V4**.
- Ausencia de headers de seguridad (`X-Frame-Options`, `Content-Security-Policy`, etc.).
- Form sin CSRF token.

### Cómo leer el reporte

```
WARN-NEW: Cookie No HttpOnly Flag [10010] x 1
  http://localhost:3000/ (200 OK)
```

Cada finding tiene un ID (p.ej. `10010`) y una URL. Busca el ID en la doc de ZAP para el detalle.

---

## 2. Semgrep — SAST (Static Application Security Testing)

Analiza el **código fuente** sin ejecutarlo. Usa reglas basadas en patrones de sintaxis + dataflow.

### Ejecución

```bash
npm run scan:semgrep
# internamente:
# docker run --rm -v $PWD:/src semgrep/semgrep semgrep --config=p/owasp-top-ten --config=p/nodejsscan /src/src
```

### Qué debe detectar

- Concatenación de strings SQL → **V2**.
- Secreto hardcodeado (`SESSION_SECRET = 'admin123'`) → extra para **V1**.
- Regex potencialmente ReDoS → **V5**.
- `path.join` con input del usuario sin validar → **V4**.

### Cómo leer el output

```
src/repositories/forumRepo.js:15:  javascript.express.security.injection.tainted-sql-string
  Detected a SQL injection vulnerability. The user input `q` flows into a raw SQL string.
```

Te marca archivo:línea y categoría OWASP. Cada regla tiene link a doc con el fix recomendado.

---

## 3. npm audit — SCA (Software Composition Analysis)

Revisa las **dependencias** contra la base de datos de vulnerabilidades de GitHub/npm.

### Ejecución

```bash
npm run scan:audit
```

### Qué debe detectar

- `lodash@4.17.15` tiene **6 vulnerabilidades** conocidas (severidad high/moderate): Prototype Pollution (x3), Command Injection, Code Injection vía `_.template`, y ReDoS. `npm audit` las lista con enlaces a GitHub Security Advisories. Es un extra, no cuenta para los 6 tests, pero es buen ejercicio actualizarlo.

### Fix típico

```bash
npm audit fix       # aplica fixes compatibles
npm install lodash@latest   # si el fix compatible no alcanza
```

---

## Cómo mapear hallazgos a STRIDE

| Hallazgo del escáner | Letra STRIDE | Control NIST |
|---|---|---|
| Cookie sin HttpOnly (ZAP) | S | IA-5, SC-23 |
| SQLi (Semgrep) | T | SI-10 |
| Sin logs de auditoría | R | AU-2, AU-3 |
| Stack trace / path traversal | I | SI-10, SI-11 |
| Regex catastrófica / upload sin límite | D | SC-5 |
| Endpoint admin sin check de rol | E | AC-3, AC-6 |

## Regla de oro

El escáner encuentra **síntomas**. STRIDE te dice la **categoría**. NIST 800-53 te dice el **control**. Tu commit aplica el **fix**. Si te saltas algún paso, estás remediando a ciegas.
