# Humo del portal

Dos pruebas automáticas con Playwright (solo Chromium) y un recorrido manual corto. Ninguna aprueba,
rechaza ni modifica recomendaciones.

## Preparación

1. Instala el navegador una vez: `npx playwright install chromium`.
2. Copia `.env.smoke.example` a `.env.smoke.local` (git lo ignora) y llena los valores. Una variable
   ya definida en la terminal gana sobre el archivo.
3. Usa solo las cuentas sintéticas del humo, nunca las cuentas de los CP.

Trace, video y capturas están apagados: el registro de Playwright guardaría lo que se escribe,
contraseñas incluidas.

No pegues en ningún chat la salida de una prueba fallida sin revisarla antes.

## Automático

| Comando               | Contra qué                                                               | Qué cubre                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run smoke:image` | La imagen arrancada en local (`PORTAL_BASE_URL` y `PORTAL_FILES_ORIGIN`) | Cabeceras, caché, gzip, 404 de rutas de servicio y de assets, `/healthz`, y que el login, el panel, la ficha con el gráfico y el editor de modificar carguen sin violaciones de CSP                                                                                                      |
| `npm run smoke`       | El portal desplegado (`PORTAL_BASE_URL`)                                 | Login; cookie `cauce_portal_rt` con HttpOnly, Secure, SameSite Strict y Path `/api/v1/auth/portal`; recarga; dos pestañas; ruta profunda; cierre de sesión y refresh posterior con 401; CSP y HSTS; `/realms/cauce`; 404 de `/admin`, `/realms/master` y `/api/v1/admin`; `/mail`; CP017 |

Keycloak detecta la fuerza bruta: el humo prueba una contraseña errónea una sola vez por ejecución y
solo sobre la cuenta del nutricionista del humo.

## Manual, en este orden

| #   | Qué                                                                                                | Datos                                                                                |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Corre `npm run smoke` y confirma que todo pasa                                                     | Cuentas del humo                                                                     |
| 2   | CP006 variantes B a D en el login: el mismo mensaje en cada una                                    | Cuentas de CP006; la contraseña errónea, una sola vez                                |
| 3   | A los 13 minutos sin actividad aparece el aviso; «Seguir conectado» lo cierra y la sesión sigue    | Cuenta del humo                                                                      |
| 4   | Con dos pestañas abiertas, a los 15 minutos sin actividad las dos vuelven a `/login` con el motivo | Cuenta del humo                                                                      |
| 5   | Panel: el orden de CP049 con varios pacientes; ficha: «Vinculado el…» (CP087)                      | Pacientes sembrados de CP049 y CP087                                                 |
| 6   | Revisión: CP045, CP046, CP036 parte A y CP048 pasos 2 a 8 (abriendo cada recomendación por su URL) | Recomendaciones sembradas en cada estado                                             |
| 7   | Modificación: CP047 y CP086                                                                        | La pendiente «Reducir cebolla y ajo» y los alimentos del catálogo que nombran los CP |
| 8   | Los enlaces del menú se ven separados                                                              | Cualquier cuenta                                                                     |
| 9   | Cierra sesión                                                                                      | Cuenta usada                                                                         |

Los pasos 6 y 7 aprueban, rechazan y modifican: se hacen solo con los datos sembrados para esos CP.
