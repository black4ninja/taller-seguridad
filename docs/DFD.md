# Diagrama de Flujo de Datos (DFD) — Hack the Campus

Recordatorio: el DFD es el input para STRIDE. **Sin DFD no se puede hacer STRIDE correctamente.**

## Zonas de confianza

| Zona | Nivel | Qué contiene |
|---|---|---|
| Internet | Ninguno | El alumno (tú), bots, atacantes, curl |
| Navegador del usuario | Bajo | UI EJS renderizada, cookies de sesión |
| App Server (Express) | Medio | Controllers, services, middlewares |
| Data Store (SQLite in-memory + filesystem) | Alto | Tabla `users`, `posts`, `audit`, carpeta `uploads/` |

## DFD textual

```
   ┌─────────────┐                                      ┌───────────────────────────┐
   │  Usuario    │  (1) HTTP request                    │  Express App              │
   │ (Internet)  │ ───────────────────────────────────▶ │  ┌─────────────────────┐  │
   │  [Entidad   │                                      │  │ routes/controllers  │  │
   │   externa]  │ ◀─── (2) HTML render / JSON          │  └──────────┬──────────┘  │
   └─────────────┘                                      │             │ (3) llama   │
          ▲                                             │  ┌──────────▼──────────┐  │
          │                                             │  │ services            │  │
          │ ─ ─ ─ ─ ─ ─ LC1 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│  └──────────┬──────────┘  │
          │             (límite de confianza)           │             │ (4) query   │
                                                        │  ┌──────────▼──────────┐  │
                                                        │  │ repositories        │  │
                                                        │  └──────────┬──────────┘  │
                                                        │             │             │
                                                        │  ─ ─ ─ ─ ─ ─│─ LC2 ─ ─ ─  │
                                                        │             ▼             │
                                                        │  ┌─────────────────────┐  │
                                                        │  │ SQLite :memory:     │  │
                                                        │  │ uploads/ (FS)       │  │
                                                        │  │ [Data Store]        │  │
                                                        │  └─────────────────────┘  │
                                                        └───────────────────────────┘
```

## Flujos de datos y amenazas STRIDE relevantes

| Flujo | Cruza límite | Amenazas STRIDE aplicables | Vuln plantada |
|---|---|---|---|
| (1) Usuario → App: credenciales de login | LC1 | **S**, T, R, I, D | V1 |
| (1) Usuario → App: query `q=` de búsqueda | LC1 | **T**, I | V2 |
| (1) Usuario → App: nombre de archivo a descargar | LC1 | **I**, T | V4 |
| (1) Usuario → App: archivo subido + email | LC1 | **D**, T | V5 |
| (1) Usuario → App: request a `/admin/...` | LC1 | **E**, S, R | V6 |
| (3)/(4) Services → Repos → SQLite | LC2 | T, I, **R** | V2, V3 |
| (app interna, sin flujo saliente) | — | R | V3 (ausencia de audit log) |

## Cómo usarlo durante el taller

1. Identifica el flujo sospechoso a partir del test que falla.
2. Localiza dónde cruza un límite de confianza.
3. Aplica la letra STRIDE → define el control NIST 800-53 → implementa el fix.
4. Registra el mapeo en [`STRIDE.md`](STRIDE.md).
