# Actas de decisión · Portal web

## Acta W1: Arquitectura y dependencias del portal web

**Estado:** Aprobada (Trigo la aprobó el 2026-10-19)
**Fecha:** 2026-10-19
**Aprobado por:** Trigo
**Aplicabilidad:** Todo el repositorio `web-portal`: estructura, reglas de dependencia, dependencias npm,
contrato vendorizado, pruebas y build.

---

### Contexto

El portal del nutricionista empieza sin código. Consume el contrato `openapi-v1.7.0.json` del backend y
se despliega en el mismo origen que la API: el portal en la raíz y la API en `/api`.

- Maneja datos sensibles de salud, protegidos por la Ley 29733.
- El repositorio es público: no contiene secretos ni datos reales, solo datos sintéticos.
- El backend es la autoridad del contrato. El portal no recalcula estados, acciones permitidas,
  prioridades ni métricas que resuelve el servidor.

### Decisión

**1. Monolito modular con Clean Architecture**, con el mismo modelo que el backend. Los módulos siguen
los del backend: `identity`, `patients`, `clinical-registry`, `recommendations`, `reports` y
`notifications`. Cada uno tiene las capas `domain`, `application`, `infrastructure` y `presentation`, y
expone solo su `index.ts`. `src/app` es la raíz de composición y `src/shared` reúne lo transversal con
las mismas cuatro capas.

**2. Dependencias hacia adentro, controladas por ESLint sin plugins adicionales.** `eslint.config.js`
genera un bloque de `no-restricted-imports` por módulo y capa:

| Capa           | No puede importar                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| domain         | application, infrastructure, presentation, otros módulos, react, react-router, @tanstack/*, openapi-fetch, zod, msw |
| application    | infrastructure, presentation, otros módulos, las mismas librerías que domain                                        |
| infrastructure | presentation, otros módulos, react, react-router, @tanstack/*                                                       |
| presentation   | infrastructure, rutas internas de otros módulos, openapi-fetch, zod, msw                                            |

También prohíbe los imports relativos hacia carpetas superiores, los imports dinámicos, el atributo
`style` y `localStorage`, `sessionStorage` e `indexedDB`. `tests/architecture/dependency-rules.test.ts`
comprueba 10 importaciones prohibidas y 1 permitida con la configuración real.

**3. Dominio delgado.** Estados, acciones permitidas, prioridad del panel y métricas clínicas llegan del
servidor. El cliente solo tiene reglas de entrada para avisar antes de enviar, y la autoridad sigue en
el backend.

**4. Dependencias con versión exacta**, verificadas con `npm view` el 2026-10-19 sobre Node 24.21.0 y
npm 11.19.0:

| Uso              | Paquetes                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interfaz         | react 19.3.1, react-dom 19.3.1, react-router 7.18.4, @tabler/icons-react 3.49.0, @fontsource-variable/inter 5.3.0, @fontsource/jetbrains-mono 5.3.0                                                |
| Datos y contrato | @tanstack/react-query 5.104.4, zod 4.6.7, openapi-fetch 0.14.1, openapi-typescript 7.13.0                                                                                                          |
| Build y tipos    | vite 7.3.7, @vitejs/plugin-react 5.2.0, typescript 5.9.3, @types/react 19.3.0, @types/react-dom 19.3.0, @types/node 24.19.2                                                                        |
| Pruebas          | vitest 3.2.7, @vitest/coverage-v8 3.2.7, jsdom 27.4.0, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.8, @testing-library/jest-dom 6.9.1, msw 2.15.0 |
| Calidad          | eslint 9.39.5, @eslint/js 9.39.5, typescript-eslint 8.71.2, eslint-plugin-react-hooks 7.1.1, eslint-plugin-jsx-a11y 6.10.2, prettier 3.9.10                                                        |

`@testing-library/jest-dom` queda en 6.9.1 porque npm marca la 6.10.0 como deprecada: la publicaron
con cambios incompatibles dentro de la misma versión mayor.

Mayores nuevas que no se adoptan:

| Paquete                    | Mayor nueva | Motivo                                                                           |
| -------------------------- | ----------- | -------------------------------------------------------------------------------- |
| typescript                 | 7           | typescript-eslint 8.71.2 admite `<6.1.0` y openapi-typescript 7.13.0 pide `^5.x` |
| eslint, @eslint/js         | 10          | eslint-plugin-jsx-a11y 6.10.2 admite hasta `^9`                                  |
| react-router               | 8           | Sin necesidad, y cambio mayor no evaluado                                        |
| vite, @vitejs/plugin-react | 8 y 6       | plugin-react 6 exige vite 8; se queda el par 7 y 5                               |
| vitest, jsdom              | 5 y 30      | Cambio mayor no evaluado                                                         |
| @testing-library/jest-dom  | 7           | Cambio mayor no evaluado                                                         |
| msw                        | 3           | Cambio mayor no evaluado                                                         |
| openapi-fetch              | 0.17        | Serie 0.x: cada versión menor puede romper; se queda 0.14.1                      |

**5. Contrato vendorizado.** `openapi/openapi-v1.7.0.json` es una copia con fines de línea LF del
snapshot del backend. SHA-256 sobre el contenido LF:
`b74a80b7e31c89b63abb1ef6d01cff0bfa404e79c1790c21a42765a36c97af7d`. `npm run api:generate` produce
`src/shared/infrastructure/api/generated/schema.d.ts` con `propertiesRequiredByDefault`, y la cabecera
registra el archivo de origen y su hash. `npm run api:check` falla si hay más de un snapshot o si el
archivo generado no coincide con una generación nueva.

**6. Pruebas espejo de `src`**, con Vitest, jsdom, Testing Library y MSW. Toda petición sin handler
hace fallar la prueba. Las rutas se prueban montando la tabla real desde la raíz. La cobertura mínima es
del 80% global en líneas, funciones, ramas y sentencias. Los umbrales por capa (90% en domain y
application, 80% en infrastructure) se activan con el primer caso de uso.

**7. Mismo origen.** En desarrollo, el proxy de Vite envía `/api` a `http://localhost:5074` sin
reescribir la ruta. El cliente no usa variables de entorno. El build deja `dist/` con `index.html` y
`assets/` con hash, sin scripts en línea y sin recursos `data:`.

**8. Solo español**, con un catálogo único en `src/shared/presentation/i18n/es.ts` y trato de tú. Sin
almacenamiento del navegador para datos clínicos ni para tokens: el access token vive en memoria y la
renovación usa la cookie HttpOnly del backend (acta A68 del backend).

### Desviaciones

- **Pruebas, `RouterProvider`:** `tests/support/renderApp.tsx` lo importa de `react-router`, y no de
  `react-router/dom` como `src/app/main.tsx`. Bajo Vitest, los dos puntos de entrada cargan copias
  distintas del paquete y `<Navigate>` no encuentra el router.
- **Pruebas, shim de `Request`:** el entorno jsdom de Vitest reemplaza `AbortSignal`, mientras `Request`
  sigue siendo el de Node, que rechaza esa señal. `tests/setup.ts` descarta la señal solo cuando el
  `Request` de Node la rechaza. No toca `src/`.
- **Design system, tipografía:** `--font-sans` empieza con `'Inter Variable'`, el nombre con que se
  registra la fuente variable autoalojada. El resto de la pila es la del design system.
- **Design system, tokens:** `tokens.css` copia los 35 tokens del `:root` del design system. El design
  system no define tokens de espaciado.

### Riesgos

- ESLint 9.39.5 está marcado por npm como sin soporte. ESLint 10 sigue bloqueado por
  eslint-plugin-jsx-a11y 6.10.2.
- `glob` 10.5.0 llega como dependencia transitiva deprecada.
- El shim de `Request` en `tests/setup.ts` se revisa al subir vitest o jsdom. Las pruebas no ejercitan
  la cancelación de navegaciones mientras exista.

### Consecuencias

- Cada pantalla nueva entra por su módulo y su ruta, con una prueba que la alcanza desde la raíz.
- Un cambio del contrato exige copiar el snapshot nuevo y regenerar el cliente en el mismo commit.
- Subir de mayor TypeScript, ESLint o cualquier paquete de la tabla requiere un acta nueva.
- `dist/` se sirve en el mismo origen que la API. El retorno a `index.html` excluye `/api`, `/realms`,
  `/resources` y `/mail`; el bloque de despliegue lo detalla.
- npm 11 no ejecuta los scripts de instalación de `msw` ni de `esbuild` sin aprobación, y no se
  aprueban. Web-Deploy-1 debe comprobar que `npm ci` en el contenedor construye sin esos postinstall.

### Referencias

- `backend/docs/api/openapi-v1.7.0.json` y `backend/docs/api/ENDPOINTS.md` 1.8.0.
- Actas A68 (sesión del portal) y A72 (parámetros obligatorios) del backend.
- `docs/02-design-system/00-design-system.html` del repositorio `docs`.
- `eslint.config.js`, `scripts/api.mjs`, `tests/setup.ts`, `tests/architecture/dependency-rules.test.ts`.

---

## Acta W2: Sesión del portal

**Estado:** Aprobada (Trigo aprobó el plan el 2026-10-20)
**Fecha:** 2026-10-20
**Aprobado por:** Trigo
**Aplicabilidad:** Módulo `identity`, cliente HTTP de `shared` y composición en `src/app`.

### Contexto

El backend autentica el portal con `POST /auth/portal/login`, `refresh` y `logout` (acta A68 del
backend): el refresh token viaja en la cookie HttpOnly `cauce_portal_rt` y rota en cada uso, sin
admitir reuso. El portal debe cerrar la sesión tras 15 minutos sin actividad.

### Decisión

1. **Token solo en memoria.** `SessionService` guarda el access token; nada va a `localStorage`,
   `sessionStorage` ni IndexedDB. Al cargar, un `refresh` recupera la sesión desde la cookie.
2. **Renovación serializada.** Una sola renovación en vuelo por pestaña y un Web Lock entre pestañas
   (con cola local si el navegador no tiene `navigator.locks`). Es proactiva 60 s antes del
   vencimiento, solo si hubo actividad del usuario; ante un 401 sin `errorCode`, el cliente HTTP
   renueva una vez y repite la petición una vez, clonada antes de enviarla. Las rutas
   `/auth/portal/*` quedan fuera del Bearer y del reintento.
3. **Inactividad.** Actividad es puntero, teclado o rueda, a lo sumo una vez por segundo; las
   peticiones automáticas no cuentan. Aviso modal a los 13 minutos y cierre a los 15, medidos con
   marcas de tiempo y recalculados al volver la pestaña visible y al navegar. Esc equivale a
   «Seguir conectado».
4. **Logout local siempre.** El estado local se limpia aunque falle la red. Si el token venció o vence
   en menos de 60 s, se renueva una vez antes de llamar a `logout`; si esa renovación falla, no se
   llama a `logout`. Así un cierre por inactividad no deja viva la cookie.
5. **Estado `unavailable`.** Si el arranque falla por red, 5xx o una respuesta fuera del contrato, el
   portal muestra «Reintentar» en lugar del login. Una caída de red nunca cierra una sesión abierta.
6. **Canal entre pestañas sin datos.** `BroadcastChannel` transmite solo el tipo de evento y su marca
   de tiempo: actividad, cierre manual, cierre por inactividad o sesión vencida. Las demás pestañas
   vuelven a `/login` con el motivo y todas vacían la caché de consultas.
7. **Un solo mensaje para todo login rechazado.** Los 401 y 400 muestran el mismo texto; el 423 muestra
   la hora de desbloqueo en Lima, con la fecha si no es hoy. Un 200 con un rol distinto de
   `nutritionist` se trata como rechazo: se descarta el token y se intenta un logout.
8. **Temporizadores con dueño.** `IdleMonitor` (inactividad) y `SessionService` (renovación) se
   encienden al autenticarse y se apagan al cerrar sesión y en `dispose()`; la cuenta regresiva del
   diálogo es del propio diálogo.

### Dependencia del servidor

El cliente `cauce-web-portal` de Keycloak tiene hoy 1800 s de inactividad. Hasta que B-1 lo baje a
900 s, el cierre a los 15 minutos lo impone el cliente y el servidor corta a los 30.

### Desviaciones de pruebas

- `tests/setup.ts` simula `showModal` y `close` de `<dialog>`, que jsdom no implementa: solo cambian
  `open` y emiten `close`.
- El shim de `Request` reconoce como instancia a todo `Request` de Node (`Symbol.hasInstance`); sin eso,
  MSW trata como GET un `request.clone()` y el reintento con cuerpo falla.

### Consecuencias

- Los textos del bloqueo (423), del límite de intentos (429), del arranque sin conexión y del diálogo de
  inactividad son propuestas y los valida nutrición.
- Una nota sin enviar se pierde al cerrar por inactividad; el aviso de los 13 minutos es la protección.
- El recorrido contra el backend local, la cookie en DevTools y `/api/v1/health` por el proxy quedan
  para después de B-1.

### Referencias

- `src/modules/identity/application/SessionService.ts`, `IdleMonitor.ts`;
  `src/shared/infrastructure/apiClient.ts`.
- `tests/unit/modules/identity/application/SessionService.test.ts`,
  `tests/integration/routes/session.test.tsx`.
- Acta A68 y `CONTRACT-IDENTITY-v1.md` §2.12 del backend.
