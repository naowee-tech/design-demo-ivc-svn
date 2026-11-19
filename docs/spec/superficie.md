# Superficie · Gestión de infractores (IVC SVN, fase 1)

Inventario de las 17 vistas del módulo: dónde viven, cómo se navega entre ellas, quién las ve, qué contienen, qué acciones ofrecen y qué estados manejan.

## Dónde vive

El módulo entra como una sección nueva del menú del IVC. Ninguna pantalla actual del IVC cambia.

Sección **Control de acceso** en el menú del IVC, con tres entradas: Gestión de sanciones, Búsqueda avanzada, Calidad y auditoría.

## Mapa de navegación

| Entrada del menú | Abre | Desde ahí | Ventanas de confirmación |
|---|---|---|---|
| Gestión de sanciones | Gestión · Indicadores, Gestión · Registros de infractores | Panel del expediente, Registrar infractor, Carga masiva, Ficha del infractor | Validar registro, Devolver por subsanar, Editar registro, ¿Salir de la carga masiva? |
| Búsqueda avanzada | Búsqueda avanzada | Panel de la persona, Ficha del infractor | Abrir datos de un menor |
| Calidad y auditoría | Calidad y auditoría · Calidad, Calidad y auditoría · Trazabilidad | Ficha del infractor | — |

## Resumen de vistas

| Vista | Tipo | Ruta | Quién la ve | Historias |
|---|---|---|---|---|
| Gestión · Indicadores | Pestaña | `#/control-acceso/infractores` | Profesional, Coordinador, Director | HU-09 |
| Gestión · Registros de infractores | Pestaña | `#/control-acceso/infractores` | Profesional, Coordinador, Director | HU-07 |
| Panel del expediente | Panel lateral | `#/control-acceso/infractores` | Profesional, Coordinador, Director | HU-07 |
| Registrar infractor | Asistente por pasos | `#/control-acceso/infractores/nuevo` | Profesional, Coordinador | HU-01, HU-02 |
| Carga masiva | Asistente de 6 pasos | `#/control-acceso/infractores/carga-masiva` | Profesional, Coordinador | HU-03 |
| ¿Salir de la carga masiva? | Ventana de confirmación | `#/control-acceso/infractores/carga-masiva` | Profesional, Coordinador | HU-03 |
| Ficha del infractor | Pantalla | `#/control-acceso/infractores/INF-2026-0065` | Profesional, Coordinador, Director | HU-05, HU-07, HU-08 |
| Validar registro | Ventana de confirmación | `#/control-acceso/infractores/INF-2026-0065` | Coordinador, Director | HU-05 |
| Devolver por subsanar | Ventana de confirmación | `#/control-acceso/infractores/INF-2026-0065` | Coordinador, Director | HU-05 |
| Editar registro | Confirmación + formulario | `#/control-acceso/infractores/INF-2026-0044/editar` | Profesional, Coordinador | HU-06 |
| Búsqueda avanzada | Pantalla | `#/control-acceso/consulta` | Profesional, Coordinador, Director | HU-02, HU-07 |
| Panel de la persona | Panel lateral | `#/control-acceso/consulta` | Profesional, Coordinador, Director | HU-02, HU-07 |
| Abrir datos de un menor | Ventana de confirmación | `#/control-acceso/consulta` | Profesional, Coordinador, Director | HU-02 |
| Calidad y auditoría · Calidad | Pestaña | `#/control-acceso/calidad` | Coordinador, Director | HU-09 |
| Calidad y auditoría · Trazabilidad | Pestaña | `#/control-acceso/calidad` | Coordinador, Director | HU-09 |
| Avisos breves | Aviso emergente | `#/control-acceso/infractores` | Profesional, Coordinador, Director | HU-01, HU-03, HU-05, HU-06 |
| Inicio de sesión | Del SUID | `login` | Profesional, Coordinador, Director | — |

## Gestión de sanciones

Donde se registran, se revisan y se cierran los registros.

### Gestión · Indicadores

- **Tipo:** Pestaña
- **Ruta:** `#/control-acceso/infractores`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Ver de un vistazo cómo está la base hoy y hacia dónde va.
- **Capturas:** Indicadores y gráfica, Ayuda ⓘ de un indicador
- **Historias:** HU-09

**Qué tiene**

- Seis indicadores: vencen en 30 días, corren sin bloquear (sin validar), revisión media en días, devueltos a inspección, reincidencia a 3 años y conducta más frecuente; cada uno con su tendencia. El cálculo de cada uno está en indicadores.md.
- Gráfica de infractores mes a mes: nuevos contra los que salen por cumplimiento, con selector de periodo y tabla accesible.

**Acciones**

- Registrar infractores (lleva a Registrar)
- Cambiar a la pestaña Registros

**Estados y errores**

- Sin datos para comparar: «Aún no hay comparación.»
- Nada por vencer: «Ninguna medida vigente termina este mes.»

### Gestión · Registros de infractores

- **Tipo:** Pestaña
- **Ruta:** `#/control-acceso/infractores`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Encontrar un registro y ver en qué estado está.
- **Capturas:** Tabla de registros
- **Historias:** HU-07

**Qué tiene**

- Tabla de registros: número, infractor (con marca de menor), origen de la obligación, acto administrativo, fin de vigencia, estado del registro y estado de la restricción.
- Filtros por estado del registro y de la restricción.
- Paginación.

**Acciones**

- Tocar una fila abre el panel lateral del expediente
- Ver expediente (abre la ficha)
- Registrar infractores

**Estados y errores**

- Sin resultados con los filtros: invita a quitar filtros.

### Panel del expediente

- **Tipo:** Panel lateral
- **Ruta:** `#/control-acceso/infractores`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Revisar un registro rápido sin salir de la lista.
- **Capturas:** Desde la tabla de registros
- **Historias:** HU-07

**Qué tiene**

- Estado del registro y de la restricción, nombre, documento y marca de menor.
- Franja de la sanción: si bloquea y hasta cuándo, con barra de avance.
- Resumen de la medida (conducta, acto, evento, fecha, lugar, tiempo, valor) y últimos movimientos.

**Acciones**

- Ver expediente (abre la ficha)
- Editar
- Cerrar; tocar otra fila cambia el contenido

**Estados y errores**

- No tapa la pantalla ni bloquea el resto: es un panel, no un modal.

### Registrar infractor

- **Tipo:** Asistente por pasos
- **Ruta:** `#/control-acceso/infractores/nuevo`
- **Quién la ve:** Profesional, Coordinador
- **Para qué:** Registrar una decisión en firme, un infractor a la vez.
- **Capturas:** Antes de empezar, Paso 1 · Infractor, Paso 2 · Hechos y conducta, Paso 3 · Sobre la sanción, Paso 4 · Gestión interna, Error junto al campo
- **Historias:** HU-01, HU-02

**Qué tiene**

- Antes de empezar: los bloques Infractor (B), Representante o tutor (C, solo si es menor), Hechos y conducta (D), Sobre la sanción (E) y Gestión interna (F), con su número de campos.
- Asistente por pasos con avance en porcentaje y estado de cada bloque; el bloque del representante aparece como paso solo si el infractor es menor.
- La fecha de registro (A) la pone el sistema.
- Aviso cuando la persona ya tiene una sanción vigente.

**Acciones**

- Comenzar
- Siguiente y Atrás entre pasos
- Guardar registro
- Cancelar
- Ir a Carga masiva

**Estados y errores**

- Error junto al campo: obligatorio vacío, fechas que no cuadran (acto, ejecutoria, radicado, hechos), mínimo 6 meses de sanción, representante mayor de edad.
- Bloque incompleto: «Este bloque está incompleto.»

### Carga masiva

- **Tipo:** Asistente de 6 pasos
- **Ruta:** `#/control-acceso/infractores/carga-masiva`
- **Quién la ve:** Profesional, Coordinador
- **Para qué:** Subir muchos registros a la vez con la plantilla de la base de sancionatorios.
- **Capturas:** 1 · Descarga la plantilla, 2 · Sube el archivo, 3 · Validamos el archivo, 4 · Corrige o excluye filas, 5 · Confirma la importación, 6 · Carga terminada
- **Historias:** HU-03

**Qué tiene**

- 1. Descarga la plantilla.
- 2. Sube el archivo diligenciado.
- 3. Validamos el archivo fila por fila (estructura, obligatoriedad y consistencia).
- 4. Corrige o excluye las filas con error.
- 5. Confirma la importación con el resumen.
- 6. Carga terminada, con el reporte descargable.

**Acciones**

- Continuar / Validar archivo / Importar
- Corregir fila, Excluir fila, Incluir de nuevo
- Descargar el reporte

**Estados y errores**

- Errores por fila: documento vacío, tipo de documento fuera del catálogo, menos de 6 meses, menor sin representante, duplicado.
- Salir a mitad: «¿Salir de la carga masiva?»

### ¿Salir de la carga masiva?

- **Tipo:** Ventana de confirmación
- **Ruta:** `#/control-acceso/infractores/carga-masiva`
- **Quién la ve:** Profesional, Coordinador
- **Para qué:** Evitar perder una carga a medias por error.
- **Capturas:** Al salir a mitad de la carga
- **Historias:** HU-03

**Qué tiene**

- Aviso de que se pierde el archivo, la validación y las correcciones; nada se ha importado todavía.
- Paso en el que va la carga.

**Acciones**

- Seguir aquí
- Salir y descartar

**Estados y errores**

- Solo aparece si ya hay avance; si no, sale directo.

### Ficha del infractor

- **Tipo:** Pantalla
- **Ruta:** `#/control-acceso/infractores/INF-2026-0065`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Ver todo lo de una persona en un solo lugar y cerrar el registro.
- **Capturas:** Recibido, Por subsanar, Validado · sanción activa
- **Historias:** HU-05, HU-07, HU-08

**Qué tiene**

- Encabezado con nombre, número de registro y documento.
- Bloques: Infractor, Representante (si es menor), Hechos y conducta, Sanción y Gestión interna.
- Columna lateral: estado de la restricción con sus pasos, historial de cambios y otras restricciones de la misma persona.

**Acciones**

- Editar (profesional y coordinador)
- Validar registro y Devolver por subsanar (coordinador y director, mientras no esté Validado)

**Estados y errores**

- Sin movimientos en el historial.
- Sin otras restricciones: «Ninguna».

### Validar registro

- **Tipo:** Ventana de confirmación
- **Ruta:** `#/control-acceso/infractores/INF-2026-0065`
- **Quién la ve:** Coordinador, Director
- **Para qué:** Cerrar el registro dejando constancia de quién lo validó.
- **Capturas:** Validar registro
- **Historias:** HU-05

**Qué tiene**

- Firma de quien opera: nombre, cargo, fecha y hora.
- Qué pasa al confirmar: el registro queda Validado y la restricción se activa si su vigencia está corriendo.
- Observación opcional.

**Acciones**

- Confirmar
- Cancelar

### Devolver por subsanar

- **Tipo:** Ventana de confirmación
- **Ruta:** `#/control-acceso/infractores/INF-2026-0065`
- **Quién la ve:** Coordinador, Director
- **Para qué:** Devolver un registro incompleto diciendo qué falta.
- **Capturas:** Devolver por subsanar
- **Historias:** HU-05

**Qué tiene**

- Firma de quien opera: nombre, cargo, fecha y hora.
- Motivo obligatorio: qué falta para poder validarlo.

**Acciones**

- Confirmar
- Cancelar

**Estados y errores**

- Sin motivo no se puede confirmar.

### Editar registro

- **Tipo:** Confirmación + formulario
- **Ruta:** `#/control-acceso/infractores/INF-2026-0044/editar`
- **Quién la ve:** Profesional, Coordinador
- **Para qué:** Corregir un registro, incluido uno devuelto por subsanar.
- **Capturas:** Formulario en edición
- **Historias:** HU-06

**Qué tiene**

- Ventana de confirmación firmada antes de abrir la edición.
- El mismo formulario del registro, con los datos cargados.

**Acciones**

- Guardar cambios
- Cancelar

**Estados y errores**

- Las mismas validaciones del registro; el estado no cambia al guardar y el cambio queda en el historial.

## Búsqueda avanzada

Donde se responde si una persona tiene una restricción vigente.

### Búsqueda avanzada

- **Tipo:** Pantalla
- **Ruta:** `#/control-acceso/consulta`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Saber si una persona tiene una medida vigente y hasta cuándo.
- **Capturas:** Recientes, Ayuda ⓘ: cómo buscar, Búsqueda avanzada activa, Resultados, Sin resultados
- **Historias:** HU-02, HU-07

**Qué tiene**

- Búsqueda por documento completo (mínimo 6 dígitos) o por nombre (al menos 3 letras), con ayuda ⓘ de cómo buscar.
- Filtros: estado de la medida, tipo de documento y ciudad.
- Búsqueda avanzada: persona (rango de edad, nombres, apellidos), medida (motivo, estado, entidad que la impuso) y fechas (impuesta, vence), y «solo las que bloquean hoy».
- Recientes como tarjetas y resultados como tabla ordenada por urgencia.
- Los menores salen enmascarados.

**Acciones**

- Consultar
- Reiniciar filtros
- Activar búsqueda avanzada
- Ver todos
- Tocar una persona abre su panel lateral

**Estados y errores**

- Sin coincidencias: «Ninguna persona coincide con los criterios.»
- Falta información o hay caracteres no válidos.
- Error al consultar: «No pudimos completar la consulta.»

### Panel de la persona

- **Tipo:** Panel lateral
- **Ruta:** `#/control-acceso/consulta`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Responder en segundos si la persona puede entrar.
- **Capturas:** Persona mayor de edad, Persona menor de edad · datos reservados
- **Historias:** HU-02, HU-07

**Qué tiene**

- Franja de la medida: «Medida vigente · bloquea en todo el país», hasta cuándo, días que faltan y barra de avance.
- Conducta, acto, evento, fecha, lugar y tiempo de la medida.
- Últimos movimientos del registro.
- Si es menor: nombre y documento ocultos hasta abrir con motivo.

**Acciones**

- Ampliar expediente (abre la ficha)
- Abrir con motivo (si es menor)
- Cerrar

**Estados y errores**

- Cargando: esqueleto mientras consulta.
- Menor con datos abiertos: aviso de apertura auditada con el motivo, usuario y hora.

### Abrir datos de un menor

- **Tipo:** Ventana de confirmación
- **Ruta:** `#/control-acceso/consulta`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Ver los datos reservados de un menor dejando constancia de para qué.
- **Capturas:** Elegir el motivo
- **Historias:** HU-02

**Qué tiene**

- Explicación de la reserva reforzada.
- Motivos para elegir (uno o varios).

**Acciones**

- Abrir datos
- Cancelar

**Estados y errores**

- Sin motivo: «Selecciona al menos un motivo para continuar.»
- Al abrir: aviso «Apertura registrada en la auditoría.»

## Calidad y auditoría

Donde se cuida la base: hallazgos y rastro de cada cambio.

### Calidad y auditoría · Calidad

- **Tipo:** Pestaña
- **Ruta:** `#/control-acceso/calidad`
- **Quién la ve:** Coordinador, Director
- **Para qué:** Encontrar los registros que hay que corregir.
- **Capturas:** Hallazgos
- **Historias:** HU-09

**Qué tiene**

- Contadores por tipo de hallazgo: incompleto, duplicado y fechas incoherentes.
- Buscador y tabla con el registro, el hallazgo y el detalle (qué falta o con qué registro se duplica).

**Acciones**

- Buscar
- Abrir el registro

**Estados y errores**

- Sin hallazgos.

### Calidad y auditoría · Trazabilidad

- **Tipo:** Pestaña
- **Ruta:** `#/control-acceso/calidad`
- **Quién la ve:** Coordinador, Director
- **Para qué:** Saber quién cambió qué y cuándo.
- **Capturas:** Bitácora
- **Historias:** HU-09

**Qué tiene**

- Bitácora de cada cambio de estado con fecha y hora, registro, usuario, estado anterior, estado nuevo y nota.

**Acciones**

- Buscar
- Abrir el registro

**Estados y errores**

- Sin movimientos.

## En todo el módulo

Lo que aparece en varias vistas.

### Avisos breves

- **Tipo:** Aviso emergente
- **Ruta:** `#/control-acceso/infractores`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Confirmar que una acción salió bien sin interrumpir.
- **Capturas:** —
- **Historias:** HU-01, HU-03, HU-05, HU-06

**Qué tiene**

- «Registro INF-… creado en estado Recibido.»
- «Cambios guardados.»
- «Registro validado. La restricción quedó activa / inactiva.»
- «Registro devuelto por subsanar.»
- «Apertura registrada en la auditoría.»
- «Plantilla descargada.» / «Reporte de la carga descargado.» / «N registros cargados en estado Recibido.»

**Acciones**

- Se cierran solos

**Estados y errores**

- El de devolución va en tono de advertencia.

### Inicio de sesión

- **Tipo:** Del SUID
- **Ruta:** `login`
- **Quién la ve:** Profesional, Coordinador, Director
- **Para qué:** Entrar con la cuenta del SUID; el rol define qué ve cada uno.
- **Capturas:** Inicio de sesión
- **Historias:** —

**Qué tiene**

- Login del SUID. En la demo es simulado.

**Acciones**

- Iniciar sesión

## Dependencias

| Qué | De quién | Nota |
|---|---|---|
| Inicio de sesión | SUID | El módulo no tiene login propio: usa el del SUID. |
| Roles y permisos | SUID | El SUID decide qué rol ve qué; la pestaña Roles dice qué debe mostrar la interfaz. |
| Menú y navegación | IVC | Sección Control de acceso en el menú, con migas de pan. |
| Firma de cada operación | SUID | Validar, devolver y editar llevan el nombre y el cargo de quien opera. |
| Datos y auditoría | Backend del módulo | Guarda los registros con el modelo de la pestaña Datos y cada cambio con usuario, fecha, hora, estado anterior y nuevo. |

## Criterios de aceptación

- [ ] Las 17 vistas existen con el contenido, las acciones y los estados descritos.
- [ ] Cada vista se muestra solo a los roles indicados; las acciones respetan la matriz de Roles.
- [ ] La navegación sigue el mapa: menú → vista → ficha → confirmaciones.
- [ ] Ninguna pantalla actual del IVC cambia; el módulo entra como sección nueva del menú.
