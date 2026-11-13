# Flujos de la fase 1 · IVC SVN

Spec para dev. Fuente: `docs/model/flujos.json`. Vista: `docs/index.html#flujos`.

## Estados

- **Estado del registro:** Recibido → Validado; Recibido → Por subsanar → Validado. Un registro Por subsanar se corrige y luego se valida; no vuelve a Recibido.
- **Estado de la restricción:** Inactiva → Activa → Cumplida. Activa solo con el registro Validado y la fecha dentro de la vigencia. Cumplida sola al vencer.

## Registro individual

- **Roles:** Profesional, Coordinador
- **Origen:** HU-26.3
- **Pantalla:** `#/control-acceso/infractores/nuevo`

**Camino feliz**

1. En Gestión, pulsar «Registrar infractores».
2. Diligenciar el bloque B: identificación, residencia, dirección, contacto y datos personales.
3. Si la persona era menor a la fecha de los hechos, aparece el bloque C del representante.
4. Diligenciar hechos (D), sanción (E) y registro interno (F).
5. Guardar: el registro queda Recibido y se abre su ficha.

**Errores**

- Campo obligatorio vacío: «<campo> es obligatorio.»
- Ejecutoria no posterior al acto: «La ejecutoria debe ser posterior a la fecha del acto.»
- Radicado no posterior a la ejecutoria: «El radicado debe ser posterior a la ejecutoria.»
- Fecha de los hechos hoy o futura, o posterior al acto.

**Estados vacíos**

- Sin datos previos de la persona: el formulario se llena desde cero.

**Reglas**

- Campos 1 a 55 y su obligatoriedad: pestaña Datos.
- Acto < ejecutoria < radicado; hechos < acto.

## Edición de un registro

- **Roles:** Profesional, Coordinador
- **Origen:** HU-26.3
- **Pantalla:** `#/control-acceso/infractores/INF-2026-0003/editar`

**Camino feliz**

1. Desde la ficha, pulsar «Editar» y confirmar en el modal firmado con nombre y cargo.
2. Corregir los campos necesarios.
3. Guardar: el cambio queda en el historial con usuario y fecha; el estado no cambia.
4. Si el registro estaba Por subsanar, sigue así hasta que el coordinador o el director lo valide.

**Errores**

- Las mismas validaciones del registro.

**Estados vacíos**

- —

**Reglas**

- Cada cambio de estado se audita: usuario, fecha, hora, estado anterior y nuevo.

## Validación o devolución

- **Roles:** Coordinador, Director
- **Origen:** criterio de diseño, por confirmar
- **Pantalla:** `#/control-acceso/infractores`

**Camino feliz**

1. Abrir la ficha de un registro Recibido o Por subsanar.
2. Pulsar «Validar registro» o «Devolver por subsanar».
3. Confirmar en el modal, firmado con nombre y cargo de quien opera.
4. Validar: el registro pasa a Validado y la restricción se activa si está en vigencia.
5. Devolver: se indica qué falta y el registro queda Por subsanar.

**Errores**

- Devolver sin motivo: el modal no deja confirmar.

**Estados vacíos**

- Registro ya Validado: no muestra las acciones de cierre.

**Reglas**

- Quien digita no se valida a sí mismo.

## Consulta

- **Roles:** Profesional, Coordinador, Director
- **Origen:** HU-26.3
- **Pantalla:** `#/control-acceso/consulta`

**Camino feliz**

1. Abrir Búsqueda avanzada.
2. Buscar por documento, nombre, estado de la medida o fechas.
3. Leer el resultado: medida vigente y hasta cuándo.
4. Abrir la ficha si hace falta el detalle.

**Errores**

- Si se busca por nombre, los menores no aparecen: solo por documento completo.

**Estados vacíos**

- «Sin medidas registradas»: no hay medidas para ese documento o coincidencias por nombre.

**Reglas**

- Los menores se consultan solo por documento completo, igual para todos los roles.

## Carga masiva

- **Roles:** Profesional, Coordinador
- **Origen:** HU-26.3
- **Pantalla:** `#/control-acceso/infractores/carga-masiva`

**Camino feliz**

1. Descargar la plantilla.
2. Subir el archivo (en la demo es simulado).
3. El sistema valida estructura, obligatoriedad y consistencia fila por fila.
4. Si hay filas con error: corregir cada una en pantalla o dejarla fuera de la carga.
5. Revisar el resumen, marcar la confirmación e importar: las filas importadas entran como Recibido.

**Errores**

- Fila con error: se muestra con su motivo; se corrige ahí mismo o se excluye.
- Sin decidir todas las filas con error no se puede continuar.
- Si no queda ninguna fila para importar, no se puede confirmar.

**Estados vacíos**

- Sin filas con error: pasa directo al resumen.
- Las filas excluidas quedan en el reporte descargable para corregir y volver a subir.

**Reglas**

- Cada registro cargado se valida o devuelve como uno individual.

## Calidad y auditoría

- **Roles:** Coordinador, Director
- **Origen:** HU-26.3
- **Pantalla:** `#/control-acceso/calidad`

**Camino feliz**

1. Abrir Calidad y auditoría desde el menú.
2. En Calidad, filtrar por tipo de hallazgo: incompleto, duplicado o fechas incoherentes.
3. En Trazabilidad, revisar la bitácora de cada cambio de estado.

**Errores**

- —

**Estados vacíos**

- Sin hallazgos: la pantalla lo dice y no muestra tabla.

**Reglas**

- Es de consulta: no tiene cierre.

## Criterios de aceptación

- [ ] Registro individual: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.
- [ ] Edición de un registro: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.
- [ ] Validación o devolución: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.
- [ ] Consulta: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.
- [ ] Carga masiva: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.
- [ ] Calidad y auditoría: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.
- [ ] Reglas de fechas cotejadas con la hoja «Diccionario de Datos» (pendiente: hasta 5 direcciones adicionales y abreviaturas al guardar).
