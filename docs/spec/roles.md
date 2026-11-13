# Roles de la fase 1 · IVC SVN

Spec para dev. Fuente: `docs/model/roles.json`. Vista: `docs/index.html#roles`. Demo: `suid/app.html?rol=<id>`.

## Principio

Todo se maneja por rol: si un flujo requiere cierre, hay al menos un rol que puede cerrarlo.

## Roles

| Rol | Quién es | Qué hace |
|---|---|---|
| `profesional` | Profesional del IVC | Digita: registra, edita y consulta, y puede cargar en masa. No cierra el registro. |
| `coordinador` | Coordinador del área | Todo lo del profesional y además cierra: valida o devuelve por subsanar. Ve Calidad y auditoría. |
| `director` | Director Técnico | Aprueba: valida o devuelve por subsanar. Consulta y ve Calidad y auditoría. No digita. |

Fuera de la fase 1:

- **Jurídica**: Apelaciones: no está en la HU-26.3.
- **Atención al usuario (ATU)**: Notificaciones: no está en la HU-26.3.
- **Entidades que reportan (usuario externo)**: Reportan por integración o solicitud: propuesta fuera de la fase 1.

## Matriz rol × acción

| Acción | Profesional | Coordinador | Director | Origen |
|---|---|---|---|---|
| Consultar y buscar | sí | sí | sí | HU-26.3 |
| Registrar | sí | sí | — | HU-26.3 |
| Editar | sí | sí | — | HU-26.3 |
| Carga masiva | sí | sí | — | HU-26.3 |
| Validar registro | — | sí | sí | Criterio de diseño |
| Devolver por subsanar | — | sí | sí | Criterio de diseño |
| Calidad y auditoría | — | sí | sí | HU-26.3 |

## Quién cierra cada flujo

| Flujo | Cambio de estado | Rol que cierra | Nota |
|---|---|---|---|
| Registro de un infractor | Recibido → Validado o Por subsanar | Coordinador, Director | Quien digita no se cierra a sí mismo: el profesional deja el registro en Recibido. |
| Corrección de un registro devuelto | Por subsanar → Validado | Coordinador, Director | El profesional (o el coordinador) corrige con «Editar»; el cierre sigue siendo la validación. |
| Carga masiva | Registros nuevos en Recibido | Coordinador, Director | Cada registro cargado se valida o devuelve como uno individual. |
| Vigencia de la restricción | Activa → Cumplida | — | Automática al vencer: no requiere rol. |
| Calidad y auditoría | Sin cierre | — | Es de consulta. |

## Comportamiento esperado

- Rol por `?rol=<id>` (se recuerda por sesión). Sin rol: `coordinador`.
- Sin permiso, el control **no se muestra**; si se llega por URL, la pantalla dice «Sin permiso» y ofrece volver a Gestión.
- El menú oculta Calidad y auditoría a quien no la puede ver.
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
