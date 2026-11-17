# Historias de usuario · Gestión de infractores (IVC SVN, fase 1)

9 historias que desglosan la HU-26.3 «Gestión de infractores» (v04 · 22-sep-2026 · aprobada por la Dirección Técnica del IVC) por quién hace qué. La HU original está adjunta en PROD-45.

| Historia | Título | Rol | Trabajo | De la HU-26.3 |
|---|---|---|---|---|
| HU-01 | Registrar un infractor | Profesional o coordinador | 1 · Registrar una sanción en firme una sola vez, y bien | Registro de sanciones · Criterio de aceptación 01 |
| HU-02 | Registrar al representante de un menor | Profesional o coordinador | 6 · Proteger a los menores de edad | Registro de sanciones (representante) · reserva igual para todos: decisión de diseño |
| HU-03 | Cargar varios registros con la plantilla | Profesional o coordinador | 1 · Registrar una sanción en firme una sola vez, y bien | Registro masivo con reporte de inconsistencias |
| HU-04 | Recibir registros por integración (modelo propuesto) | Sistema externo | 1 · Registrar una sanción en firme una sola vez, y bien | Registro por integración |
| HU-05 | Validar o devolver un registro | Coordinador o director | 2 · Revisar que lo registrado esté completo antes de que cuente | «Validar la completitud formal» · Criterio 01 · quién cierra: decisión de diseño |
| HU-06 | Corregir un registro | Profesional o coordinador | 2 · Revisar que lo registrado esté completo antes de que cuente | «Requiero… actualizar» |
| HU-07 | Buscar a una persona y ver su ficha | Todos los roles | 3 · Saber rápido si una persona tiene una restricción vigente | «Requiero… consultar» · ficha única con historial |
| HU-08 | Que la vigencia se actualice sola | Sistema | 4 · Que la vigencia se cuide sola | Administración de restricciones · las cumplidas no se eliminan |
| HU-09 | Revisar la calidad y la trazabilidad | Coordinador o director | 5 · Poder confiar en la base | Calidad, vigencia y auditoría |

## Registrar

Cómo entra una sanción en firme a la base del IVC.

### HU-01 · Registrar un infractor

- **Rol:** Profesional o coordinador
- **De la HU-26.3:** Registro de sanciones · Criterio de aceptación 01

> Como profesional del IVC, quiero registrar una decisión en firme con los datos del infractor, los hechos y la sanción, para que quede en la base y pase a revisión.

**Criterios de aceptación**

1. **Dado** llega una decisión en firme completa, **cuando** diligencio el formulario y guardo, **entonces** el registro queda Recibido y se abre su ficha.
2. **Dado** falta un campo obligatorio o las fechas no cuadran (acto antes de ejecutoria y de radicado; hechos antes del acto), **cuando** guardo, **entonces** el sistema marca el error junto al campo y no guarda.
3. **Dado** ya existe un registro de la misma persona, con el mismo acto y la misma vigencia, **cuando** guardo, **entonces** el sistema avisa que es un duplicado.

### HU-02 · Registrar al representante de un menor

- **Rol:** Profesional o coordinador
- **De la HU-26.3:** Registro de sanciones (representante) · reserva igual para todos: decisión de diseño

> Como profesional del IVC, quiero registrar al representante cuando el infractor era menor en la fecha de los hechos, para cumplir la reserva que exige la ley.

**Criterios de aceptación**

1. **Dado** la fecha de nacimiento indica que era menor en la fecha de los hechos, **cuando** diligencio el registro, **entonces** el bloque del representante aparece y es obligatorio.
2. **Dado** el infractor es menor, **cuando** cualquier rol lo busca, **entonces** solo se encuentra por documento completo; la reserva es igual para todos los roles.

### HU-03 · Cargar varios registros con la plantilla

- **Rol:** Profesional o coordinador
- **De la HU-26.3:** Registro masivo con reporte de inconsistencias

> Como profesional del IVC, quiero subir varios registros con la plantilla de la base de sancionatorios, para no digitarlos uno por uno.

**Criterios de aceptación**

1. **Dado** la plantilla trae filas con errores, **cuando** la subo, **entonces** veo cada fila con su error y la corrijo o la dejo fuera; no puedo confirmar sin decidir todas.
2. **Dado** todas las filas están decididas, **cuando** confirmo la carga, **entonces** las válidas entran como registros y las excluidas quedan en un reporte que puedo descargar.

### HU-04 · Recibir registros por integración

- **Rol:** Sistema externo · modelo propuesto
- **De la HU-26.3:** Registro por integración

> Como IVC, quiero recibir registros desde otro sistema con los mismos datos del formulario, para no volver a digitar lo que otra entidad ya tiene.

**Criterios de aceptación**

1. **Dado** llega un registro con los datos del infractor, los hechos y la sanción, **cuando** el sistema lo recibe, **entonces** aplica las mismas reglas del formulario y lo deja Recibido.
2. **Dado** el registro no cumple una regla, **cuando** el sistema lo recibe, **entonces** lo rechaza con el detalle por campo.

## Revisar y corregir

Qué pasa antes de que un registro cuente.

### HU-05 · Validar o devolver un registro

- **Rol:** Coordinador o director
- **De la HU-26.3:** «Validar la completitud formal» · Criterio 01 · quién cierra: decisión de diseño

> Como coordinador o director, quiero validar un registro o devolverlo por subsanar con un motivo, para que en la base solo cuente lo completo y correcto.

**Criterios de aceptación**

1. **Dado** un registro Recibido o Por subsanar está completo, **cuando** lo valido y confirmo en el modal firmado, **entonces** queda Validado y su restricción se activa si está en vigencia.
2. **Dado** al registro le falta algo, **cuando** lo devuelvo, **entonces** el motivo es obligatorio y el registro queda Por subsanar.
3. **Dado** valido o devuelvo, **cuando** confirmo, **entonces** los datos de la decisión no cambian: solo cambia el estado.

### HU-06 · Corregir un registro

- **Rol:** Profesional o coordinador
- **De la HU-26.3:** «Requiero… actualizar»

> Como profesional del IVC, quiero corregir un registro, incluido uno devuelto por subsanar, para que pueda validarse.

**Criterios de aceptación**

1. **Dado** un registro está Por subsanar, **cuando** lo edito y guardo en el modal firmado, **entonces** se guarda el cambio, el estado no cambia y queda en el historial.

## Consultar

Cómo se responde si una persona puede entrar.

### HU-07 · Buscar a una persona y ver su ficha

- **Rol:** Todos los roles
- **De la HU-26.3:** «Requiero… consultar» · ficha única con historial

> Como funcionario del IVC, quiero buscar por documento, nombre, estado de la medida o fechas y ver una sola ficha, para responder con certeza si hoy tiene una restricción vigente.

**Criterios de aceptación**

1. **Dado** la persona tiene varias sanciones, **cuando** abro su ficha, **entonces** las veo todas en una sola ficha, sin confundirlas, con su historial.
2. **Dado** la búsqueda no encuentra a nadie, **cuando** busco, **entonces** veo un estado vacío que dice cómo seguir.

## Cuidar la base

Lo que mantiene la información confiable y vigente.

### HU-08 · Que la vigencia se actualice sola

- **Rol:** Sistema
- **De la HU-26.3:** Administración de restricciones · las cumplidas no se eliminan

> Como IVC, quiero que la restricción se active y pase a cumplida sin que nadie lo haga a mano, para que la base coincida siempre con la realidad.

**Criterios de aceptación**

1. **Dado** un registro está Validado y la fecha está dentro de la vigencia, **cuando** llega ese día, **entonces** la restricción queda Activa.
2. **Dado** la vigencia terminó, **cuando** pasa la fecha final, **entonces** la restricción queda Cumplida sola, no se borra y queda en el historial.

### HU-09 · Revisar la calidad y la trazabilidad

- **Rol:** Coordinador o director
- **De la HU-26.3:** Calidad, vigencia y auditoría

> Como coordinador o director, quiero ver los registros incompletos, duplicados o con fechas incoherentes, y quién cambió qué, para corregir a tiempo y respaldar cada decisión.

**Criterios de aceptación**

1. **Dado** hay registros con problemas de calidad, **cuando** entro a Calidad y auditoría, **entonces** los veo agrupados por tipo de problema.
2. **Dado** un registro cambia de estado, **cuando** consulto su trazabilidad, **entonces** veo usuario, fecha, hora, estado anterior y nuevo.
