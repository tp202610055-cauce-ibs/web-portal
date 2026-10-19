# Trazabilidad · Portal web

Relación entre historias de usuario, casos de prueba (CP, versión 3), rutas, endpoints y pruebas.

## Casos de prueba

| HU  | Escenario | CP  | Ruta | Endpoint | Prueba | Estado |
| --- | --------- | --- | ---- | -------- | ------ | ------ |

Todavía no hay filas: el andamiaje no cubre ningún caso de prueba.

## Rutas y su prueba desde la raíz

| Ruta         | Acceso        | Punto de entrada                         | Prueba                                                                                                                                                         |
| ------------ | ------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`     | Público       | Redirección de la guardia                | `tests/integration/routes/routing.test.tsx` › `root_withoutSession_redirectsToLogin`                                                                           |
| `/`          | Nutricionista | Raíz del portal; redirige a `/pacientes` | `routing.test.tsx` › `root_withNutritionistSession_redirectsToPatients`                                                                                        |
| `/pacientes` | Nutricionista | Menú «Pacientes»                         | `routing.test.tsx` › `menuLink_withNutritionistSession_opensPatients`, `patients_withoutSession_redirectsToLogin`, `patients_withAnotherRole_redirectsToLogin` |
| `*`          | Público       | Cualquier ruta inexistente               | `routing.test.tsx` › `unknownRoute_anySession_showsNotFound`                                                                                                   |
