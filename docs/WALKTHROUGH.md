# Walkthrough — V0 resuelta paso a paso

Esta guía resuelve **V0 (Reflected XSS)** de principio a fin como ejemplo. Úsala como plantilla mental: los pasos 1-8 son los mismos que vas a repetir para V1..V6.

> **No copies el fix sin entender el proceso.** El objetivo del taller es que internalices el loop *síntoma → STRIDE → NIST → fix → verificación*. En V0 te lo damos hecho; en V1..V6 te toca a ti.

---

## Paso 1 — Observar el síntoma

Corres los tests al empezar:

```bash
npm test
```

Entre las fallas aparece:

```
FAIL tests/security/V0_walkthrough.test.js
  V0 - Reflected XSS (walkthrough)
    ✗ payload <script> no debe aparecer sin escapar en la respuesta
```

Abre el test para entender exactamente qué espera:

```js
// tests/security/V0_walkthrough.test.js
const payload = '<script>alert(1)</script>';
const res = await request(app).get('/status?msg=' + encodeURIComponent(payload));
expect(res.text).not.toContain('<script>alert(1)</script>');
```

**Traducción**: la ruta `/status` recibe un parámetro `msg` y lo devuelve en la respuesta. El test dice: *si mando un `<script>`, la respuesta NO debe contener ese tag literal*.

## Paso 2 — Reproducir manualmente

Arranca la app:

```bash
npm start
```

En otra terminal:

```bash
curl 'http://localhost:3000/status?msg=<script>alert(1)</script>'
```

Ves esto en el HTML devuelto:

```html
<div class="post">Status: <script>alert(1)</script></div>
```

Si abres la URL en el navegador: **popup de alert**. Acabas de comprobar la vuln.

## Paso 3 — Detectar con herramientas (MobSF para web)

### OWASP ZAP (DAST)

```bash
# con npm start corriendo:
npm run scan:zap
```

En el reporte aparece:

```
WARN-NEW: Cross Site Scripting (Reflected) [40012]
  http://localhost:3000/status?msg=%3Cscript%3Ealert%281%29%3C%2Fscript%3E
```

### Semgrep (SAST)

```bash
npm run scan:semgrep
```

```
src/routes/status.js:11:
  javascript.express.security.audit.xss.direct-response-write.direct-response-write
  Detected directly writing or similar in `res.send`. This bypasses any HTML escaping.
```

ZAP te dice **dónde**, Semgrep te dice **por qué** en el código. Mismo hallazgo desde dos ángulos.

## Paso 4 — Clasificar con STRIDE

Usa el DFD (ver [`DFD.md`](DFD.md)). La query `msg=` cruza el límite de confianza LC1 (Internet → App) y termina ejecutándose **en el navegador de otro usuario**. Aplicas las 6 preguntas:

| Letra | Pregunta | Aplica aquí |
|---|---|---|
| **S**poofing | ¿Puede hacerse pasar por otro? | Indirecto (puede robar cookies) |
| **T**ampering | ¿Puede modificar datos? | **SÍ** — inyecta código que modifica el DOM del usuario |
| **R**epudiation | ¿Puede negar acciones? | No directamente |
| **I**nformation Disclosure | ¿Puede ver datos no autorizados? | Sí (robo de cookie de sesión con `document.cookie`) |
| **D**enial of Service | ¿Puede tumbar el servicio? | No |
| **E**levation of Privilege | ¿Puede ganar más privilegios? | Sí, si roba cookie de admin |

Categoría principal: **T (Tampering)**. Secundaria: I y E. *Elige la primaria; el atacante pivotea a las otras una vez tiene XSS.*

## Paso 5 — Mapear a un control NIST 800-53

Abres [`GUIA_HERRAMIENTAS.md`](GUIA_HERRAMIENTAS.md) o la doc del NIST y buscas:

- **SI-10 (Information Input Validation)** — validar y sanear entradas. ✓ aplica.
- **SC-18 (Mobile Code)** — controlar ejecución de código "móvil" (scripts) en el cliente. ✓ aplica.

Control elegido: **SI-10**.

## Paso 6 — Implementar el fix

Abres `src/routes/status.js`:

```js
// ANTES (vulnerable)
res.type('html').send(
  `<h1>Status: ${msg}</h1>`
);
```

Tres opciones de fix, de menos a más robusto:

**Opción A — Escape manual (mínimo viable):**

```js
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

res.type('html').send(`<h1>Status: ${escapeHtml(msg)}</h1>`);
```

**Opción B — Render con EJS (recomendado):**

Crear `src/views/status.ejs` con `<%= msg %>` (EJS auto-escapa con `<%=`) y hacer `res.render('status', { msg })`.

**Opción C — CSP como defensa en profundidad:**

Agregar header `Content-Security-Policy: default-src 'self'` en `app.js`. **No reemplaza** el escape; lo complementa.

Para el taller, la opción A o B alcanzan.

## Paso 7 — Validar el fix

```bash
npm test
```

Buscas:

```
PASS tests/security/V0_walkthrough.test.js
  V0 - Reflected XSS (walkthrough)
    ✓ payload <script> no debe aparecer sin escapar en la respuesta
    ✓ payload img onerror tampoco debe pasar
    ✓ mensaje legítimo (texto plano) sigue mostrándose
```

Re-escaneas con ZAP para confirmar que el finding desapareció:

```bash
npm run scan:zap | grep -i xss
# (sin resultados → fix confirmado)
```

## Paso 8 — Documentar

Abres [`STRIDE.md`](STRIDE.md) y llenas la fila de V0 (ya viene llena como ejemplo). Para V1..V6 esta es la columna que tú llenas.

| # | Test | STRIDE | Amenaza | Control NIST | Archivo |
|---|---|---|---|---|---|
| V0 | `V0_walkthrough.test.js` | **T** | Reflected XSS en `/status` | SI-10 | `src/routes/status.js` |

---

## Checklist mental para cada vuln siguiente

Cuando ataques V1..V6, repite este loop:

- [ ] Leí el test y entiendo qué espera
- [ ] Reproduje la vuln con curl o navegador
- [ ] Corrí al menos una herramienta (ZAP/Semgrep/npm audit) y vi el hallazgo
- [ ] Identifiqué la letra STRIDE principal
- [ ] Elegí 1-2 controles NIST 800-53 que aplican
- [ ] Apliqué el fix mínimo que hace pasar el test sin romper el caso legítimo
- [ ] `npm test` verde para esa V
- [ ] Llené la fila correspondiente en `STRIDE.md`

Si te atascas más de 15 min en una vuln, relee este walkthrough y aplica los 8 pasos a esa V. La técnica es la misma, lo que cambia es el detalle técnico del fix.
