# Notas del profesor — briefing "Hack the Campus"

Abre `docs/PRESENTACION.html` en pantalla completa (`F11`) mientras hablas. Los bloques numerados de la slide corresponden a los bloques aquí.

## Antes de empezar (día previo)

- [ ] Envía la URL del repo a los alumnos con **24h de anticipación** para que hagan el setup en casa (npm install puede tardar en red lenta, y algunos tendrán que instalar Xcode CLT / build tools). Diles: *"solo instalen, NO abran el código"*.
- [ ] Confirma que tienen Docker Desktop corriendo el día del taller — es el prerrequisito que más tropieza.
- [ ] Corre tú mismo el flujo completo en la máquina del salón para tener baseline y para pre-cachear las imágenes Docker de ZAP y Semgrep (así no descargan 500 MB en el minuto 1 de los alumnos).

## Minuto a minuto (90 min total)

| Tiempo | Bloque | Qué decir / hacer |
|---|---|---|
| **0-5** | Bienvenida | Proyecta la slide. Explica el escenario: "eres miembro del club de ciberseguridad; el portal está lleno de hoyos; tienes 90 min para taparlos todos antes del demo day." |
| **5-10** | Bloque 1-2 (setup) | Ellos: `git clone`, `npm install`, `npm start`, `npm test`. Confirman 7 rojos. *Si alguno no arranca, tenlo a mano en una laptop extra.* |
| **10-25** | Bloque 4 + WALKTHROUGH | Pídeles abrir `docs/WALKTHROUGH.md` y leer V0 (5 min). Resuelve V0 contigo en vivo en tu pantalla si quieres reforzar el loop. Luego los sueltas. |
| **25-80** | Competencia activa | Tú caminas entre ellos. Avisos cada 15 min: "20 min", "40 min", "60 min", "10 min restantes". |
| **80-90** | Cierre | Cuando alguien llegue a 28/28 lo anuncias. Fin del podio. Los demás terminan lo que puedan. |
| **Post-1:30** (~15 min opcional) | Debrief | Toma 1 vuln (ideal V2 SQLi) y camínala con las 3 herramientas: ZAP detecta nada (es SQLi, no se ve desde afuera fácil), Semgrep la marca, npm audit nada. Enseña que las 3 son complementarias. |

## Cosas que probablemente van a preguntar

| Pregunta | Respuesta rápida |
|---|---|
| "¿Puedo usar Google / StackOverflow?" | Sí. El WALKTHROUGH ya te dice mucho. |
| "¿Puedo usar Claude / Copilot / Cursor?" | Depende de tu política. Recomiendo: *no*, el loop mental se pierde. |
| "¿El test X se está colgando?" | Es V5 (ReDoS). Usa `npm test -- --testPathIgnorePatterns=V5` mientras arreglas esa. |
| "ZAP no corre" | Verifica Docker corriendo. En Linux agrega `--network=host`. |
| "¿Qué pasa si no termino?" | Cuentan tests verdes parciales como feedback. Solo el 1er 28/28 gana. |
| "¿Puedo editar los tests?" | No. Hay hash-lock en `tests/security/V_integrity.test.js`. Si los tocas, todo truena. |
| "`docs/STRIDE.md` ¿sí lo voy a entregar?" | Sí — es el entregable paralelo. Lo llenas conforme resuelves. |

## Criterios de desempate (por si dos terminan cerca)

1. Primer alumno que muestra `npm test` con 28/28 gana.
2. Si son literalmente simultáneos: menor número de commits totales gana (premia soluciones limpias, penaliza brute-force).
3. Tiebreak final: calidad de `docs/STRIDE.md` llenado (si alguno lo dejó vacío, pierde).

## Material de apoyo proyectable (si alguien se atora)

- **Si nadie detecta V3**: proyecta la ruta `/auth/login` en `authController.js` y pregunta: *"¿qué pasa en la tabla `audit` cuando alguien hace login?"*. Spoiler: nada. Repudiation.
- **Si varios se atoran en V6**: abre `src/routes/admin.js` y deja que vean que no hay middleware. Es la vuln más "bug obvio" de todas.
- **Si hay confusión sobre qué letra STRIDE aplica**: recuérdales el DFD de `docs/DFD.md`. Cada flecha que cruza LC1 (Internet→App) es candidata a S, T, R, I, D.

## Pedagogía clave — lo que importa que salgan sabiendo

1. **El escáner encuentra síntomas, no categorías.** Por eso necesitan STRIDE.
2. **STRIDE categoriza, pero no dice qué hacer.** Por eso necesitan NIST 800-53.
3. **NIST dice qué control aplicar, pero no el código exacto.** Por eso siguen necesitando ingeniería.
4. El loop completo es: **síntoma → categoría → control → fix → verificación**.

Si al final del taller los alumnos pueden recitar ese loop con sus palabras, ganaste.

## Si algo sale muy mal

- **Internet muerto**: `scan:semgrep` y `scan:zap` requieren descargar imágenes Docker. Si las tenías pre-cacheadas en el salón, sigue funcionando offline. `npm audit` sí requiere internet.
- **Nadie termina en 1:30h**: no es fracaso. Extiende 15 min o toma al de más tests verdes como ganador. Lo importante es el loop mental.
- **Un alumno hackea el harness**: si muestra 28/28 pero al revisar `git log` ves solo 1-2 commits gigantes, pregunta en vivo cómo arregló V3 (es la más conceptual — difícil de copiar de IA sin entender).
