# web-portal

Portal web administrativo del proyecto Cauce Health construido en React/TypeScript, orientado al rol de nutricionista para revisión HITL de recomendaciones y gestión de pacientes.

## Requisitos

- Node 24 (ver `.nvmrc`) y npm 11.
- Para usar la API en desarrollo, el backend de Cauce en `http://localhost:5074`.

## Comandos

| Comando                 | Qué hace                                                                          |
| ----------------------- | --------------------------------------------------------------------------------- |
| `npm ci`                | Instala las dependencias exactas de `package-lock.json`                           |
| `npm run dev`           | Servidor de desarrollo en `http://localhost:5173`, con proxy de `/api` al backend |
| `npm run build`         | Chequeo de tipos y build de producción en `dist/`                                 |
| `npm run lint`          | ESLint, incluidas las reglas de dependencias entre capas                          |
| `npm run typecheck`     | Chequeo de tipos de la aplicación, las pruebas y la configuración                 |
| `npm test`              | Pruebas con Vitest                                                                |
| `npm run test:coverage` | Pruebas con el umbral de cobertura                                                |
| `npm run api:generate`  | Genera los tipos del cliente desde `openapi/`                                     |
| `npm run api:check`     | Falla si los tipos generados no coinciden con el contrato vendorizado             |
| `npm run verify`        | Lint, tipos, pruebas con cobertura, contrato y build                              |

## Arquitectura

Las decisiones de arquitectura y dependencias están en `docs/DECISIONS-BLOCK-WEB-1.md` (acta W1), y la
trazabilidad en `docs/TRACEABILITY.md`.
