# Mapeo STRIDE → Control NIST 800-53

**Entregable paralelo.** Llena esta tabla a medida que resuelves cada vulnerabilidad.
Sirve para que fijes el ciclo teórico que vieron en clase: test falla → STRIDE identifica la categoría → NIST 800-53 te dice qué control implementar → tu fix lo aplica.

## Ejemplo resuelto (V0) — úsalo de plantilla

Esta fila ya viene llena como ejemplo. Para la resolución completa paso a paso ver [`WALKTHROUGH.md`](WALKTHROUGH.md).

| # | Test archivo | Letra STRIDE | Amenaza concreta | Control NIST 800-53 | Archivo(s) modificado(s) |
|---|---|---|---|---|---|
| V0 | `tests/security/V0_walkthrough.test.js` | **T**ampering | Reflected XSS en `/status?msg=` — el servidor devuelve el input sin escapar y el atacante ejecuta JS en el navegador de la víctima | SI-10 (Information Input Validation), SC-18 (Mobile Code) | `src/routes/status.js` |

## Tabla a llenar

| # | Test archivo | Letra STRIDE | Amenaza concreta | Control NIST 800-53 | Archivo(s) modificado(s) |
|---|---|---|---|---|---|
| V1 | `tests/security/V1_spoofing.test.js` | **S**poofing | | | |
| V2 | `tests/security/V2_tampering.test.js` | **T**ampering | | | |
| V3 | `tests/security/V3_repudiation.test.js` | **R**epudiation | | | |
| V4 | `tests/security/V4_disclosure.test.js` | **I**nformation Disclosure | | | |
| V5 | `tests/security/V5_dos.test.js` | **D**enial of Service | | | |
| V6 | `tests/security/V6_elevation.test.js` | **E**levation of Privilege | | | |

## Referencia rápida NIST 800-53 (familias más relevantes)

| Familia | Nombre | Útil para |
|---|---|---|
| **AC** | Access Control | Autorización, RBAC, mínimos privilegios (V6) |
| **AU** | Audit & Accountability | Logs de auditoría, no-repudio (V3) |
| **IA** | Identification & Authentication | Autenticación, MFA, políticas de password (V1) |
| **SC** | System & Communications Protection | Disponibilidad, cifrado, headers (V5, parte V1) |
| **SI** | System & Information Integrity | Validación de input, sanitización (V0, V2, V4) |

## Reflexión final (opcional, para el cierre)

Después de resolver, responde en 3 líneas:

> El escáner (ZAP/Semgrep/npm audit) me mostró el *síntoma*.
> STRIDE me dio la *categoría* de amenaza.
> NIST 800-53 me dijo *qué control* implementar.
> Mi fix cerró el ciclo.

¿En qué vuln te dio más trabajo que el escáner te llevara directamente al fix? ¿Por qué?
