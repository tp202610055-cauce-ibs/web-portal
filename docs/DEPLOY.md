# Despliegue del portal (portal-web)

Cómo se construye la imagen del portal en la VM, cómo se arranca y cómo se vuelve atrás. El Caddy
exterior, el compose y la red son de la conversación de despliegue (D-1); este repo entrega la imagen,
`deploy/caddy/portal.caddy` y `deploy/compose.portal-web.yml` para que los adopte.

## Qué es la imagen

| Dato                 | Valor                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Contenido            | Solo `dist/` del portal, servido por nginx sin root                                         |
| Base                 | `nginxinc/nginx-unprivileged:1.30.6-alpine3.24-slim`, fijada por digest del índice          |
| Build                | `node:24.21.0-alpine3.24`, fijada por digest; `npm ci` desde `package-lock.json`            |
| Puerto               | 8080, solo en la red interna; sin puerto publicado                                          |
| Usuario              | 101 (`nginx`)                                                                               |
| Variable obligatoria | `PORTAL_FILES_ORIGIN`: origen https del almacenamiento de archivos, solo para `connect-src` |
| Salud                | `GET /healthz` responde `ok`; el healthcheck usa `127.0.0.1`                                |
| Sistema de archivos  | `read_only`, con tmpfs en `/tmp` y `/etc/nginx/conf.d` (uid y gid 101)                      |

Zod corre en modo `jitless` (`src/shared/infrastructure/schemaConfig.ts`, primer import de
`main.tsx`): la CSP no permite `eval`, y sin ese modo Zod prueba `new Function` al cargar cada esquema y
el navegador lo registra como violación. No se quita ni se mueve de lugar.

La imagen no lleva secretos ni URLs: el portal usa el mismo origen que la API. Sin
`PORTAL_FILES_ORIGIN`, con un origen que no sea https o con `/etc/nginx/conf.d` sin escritura, el
contenedor no arranca.

Medido el 2026-10-22 en la laptop de desarrollo:

| Medida                    | Valor                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| Tamaño de la imagen       | 30,9 MB (29,2 MB son la base)                                                  |
| Memoria en reposo         | 15,2 MiB con 14 procesos de nginx, uno por núcleo; en la VM son 2              |
| Pico de memoria del build | Hasta unos 700 MB, según la corrida; el heap de Node está limitado a 1024 MB   |
| Contexto del build        | 1,05 MB, por la lista permitida de `deploy/portal-web/Dockerfile.dockerignore` |

## Construir en la VM

Desde la raíz del repo del portal, en el tag que se va a desplegar:

```sh
git fetch --tags
git checkout --detach <tag>
docker build -f deploy/portal-web/Dockerfile -t cauce/portal-web:<tag> .
```

- El tag de la imagen es el mismo tag del repo. Nunca se usa `latest`.
- El build usa hasta unos 700 MB de memoria; conviene lanzarlo con el resto del stack en reposo.
- Desde el congelamiento del sábado 24 por la noche no se construye nada nuevo: durante la semana de
  pruebas solo se puede volver a una imagen ya construida.

## Arrancar

En el compose de D-1, con el fragmento `deploy/compose.portal-web.yml`:

```sh
PORTAL_WEB_TAG=<tag> PORTAL_FILES_ORIGIN=https://archivos.<dominio> docker compose up -d portal-web
docker inspect --format '{{.State.Health.Status}}' <contenedor de portal-web>
```

El estado debe llegar a `healthy` en menos de un minuto. Después se corre el humo desplegado
(`docs/SMOKE.md`).

## Volver atrás

1. Mantén en la VM la imagen del despliegue anterior hasta que el nuevo pase el humo:
   `docker image ls cauce/portal-web`.
2. Para volver, arranca el servicio con el tag anterior:
   `PORTAL_WEB_TAG=<tag anterior> PORTAL_FILES_ORIGIN=https://archivos.<dominio> docker compose up -d portal-web`.
3. Comprueba que llega a `healthy` y corre el humo otra vez.

Volver atrás no reconstruye nada: solo cambia el tag de una imagen que ya existe. `index.html` va
sin caché y los assets llevan su hash en el nombre, así que el navegador toma la versión que esté
sirviendo nginx en la siguiente carga.

## Qué hace cada pieza

| Pieza             | Responsable | Qué hace                                                                                                                                             |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caddy exterior    | D-1         | TLS, HSTS de una semana, `/api` al backend, `/realms` y `/resources` a Keycloak, `/mail` a Mailpit con clave, `/admin` y `/realms/master` bloqueados |
| portal-web        | Este repo   | El portal, la CSP y las demás cabeceras, la regla SPA y la caché                                                                                     |
| Rutas de servicio | portal-web  | `/api`, `/realms`, `/resources`, `/mail` y `/admin` dan 404 si llegan al portal, nunca el `index.html`                                               |
