# Roles de la fase 1 · IVC SVN

Spec para dev. Fuente: `docs/model/roles.json`. Vista: `docs/index.html#roles`. Demo: `suid/app.html?rol=<id>`.

## Principio

Todo se maneja por rol: si un flujo requiere cierre, hay al menos un rol que puede cerrarlo.

## Roles

| Rol | Quién es | Qué hace |
|---|---|---|
| `profesional` | Profesional del IVC | Digita: registra, edita y consulta, y puede cargar en masa. No cierra el registro. |
| `coordinador` | Coordinador del área | Todo lo del profesional, y cierra: valida o devuelve por subsanar. Edita registros validados, con motivo. |
| `director` | Director Técnico | Aprueba: valida o devuelve por subsanar. Consulta. No digita. |

Fuera de la fase 1:

- **Jurídica**: Apelaciones: no está en la HU-26.3.
- **Atención al usuario (ATU)**: Notificaciones: no está en la HU-26.3.
- **Entidades que reportan (usuario externo)**: Reportan por integración o solicitud: propuesta fuera de la fase 1.
- **Calidad y auditoría**: Hallazgos y trazabilidad (HU-09): sale de la fase 1 y queda para integraciones futuras. La bitácora de cada registro se ve en su ficha.

## Matriz rol × acción

| Acción | Profesional | Coordinador | Director | Origen |
|---|---|---|---|---|
| Consultar y buscar | sí | sí | sí | HU-26.3 |
| Registrar | sí | sí | — | HU-26.3 |
| Editar | sí | sí | — | HU-26.3 |
| Editar un registro validado | — | sí | — | Criterio de diseño |
| Carga masiva | sí | sí | — | HU-26.3 |
| Validar registro | — | sí | sí | Criterio de diseño |
| Devolver por subsanar | — | sí | sí | Criterio de diseño |

## Quién cierra cada flujo

| Flujo | Cambio de estado | Rol que cierra | Nota |
|---|---|---|---|
| Registro de un infractor | Recibido → Validado o Por subsanar | Coordinador, Director | Por confirmar con el IVC si quien digita puede validar su propio registro; en la fase 1 no se restringe. |
| Corrección de un registro devuelto | Por subsanar → Validado | Coordinador, Director | El profesional (o el coordinador) corrige con «Editar»; el cierre sigue siendo la validación. |
| Carga masiva | Registros nuevos en Recibido | Coordinador, Director | Cada registro cargado se valida o devuelve como uno individual. |
| Vigencia de la restricción | Activa → Cumplida | — | Automática al vencer: no requiere rol. |

## Comportamiento esperado

- Rol por `?rol=<id>` (se recuerda por sesión). Sin rol: `coordinador`.
- Sin permiso, el control **no se muestra**; si se llega por URL, la pantalla dice «Sin permiso» y ofrece volver a Gestión.
- Calidad y auditoría está apagada en la demo de la fase 1 (`SUID_CALIDAD = false`).
- «Editar» sobre un registro Validado solo aparece con `editar_validado` (coordinador) y pide motivo al guardar.
- La firma de cada operación lleva el nombre y cargo del rol activo.
- La autorización real la define el SUID; esto describe lo que la interfaz debe mostrar.

## Menores de edad

La reserva sobre menores de edad es igual para todos los roles: ninguno ve distinto los datos de un menor ni de su representante. Se aplica en la búsqueda (solo por documento completo).

## Criterios de aceptación

- [ ] Cada acción de la matriz aparece solo para los roles que la tienen.
- [ ] Los datos de un menor y de su representante se ven igual para todos los roles.
- [ ] Cada flujo tiene al menos un rol que lo cierra, salvo los automáticos y de consulta.
- [ ] El rol activo se ve en la firma de validar y devolver.
- [ ] Alineado con los roles de `suite-web-ivc` y el SUID (por confirmar).
