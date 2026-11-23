# Indicadores · Gestión de infractores (IVC SVN, fase 1)

No disponible hasta la siguiente etapa: la pestaña Gestión · Indicadores está oculta en la demo y este cálculo queda como referencia. Los seis indicadores de la pestaña Gestión · Indicadores se calculan al abrir la vista, a partir de los registros y de su historial. Ninguno se guarda.

- **Vista:** Gestión · Indicadores (`#/control-acceso/infractores`), descrita en [superficie.md](superficie.md).
- **Fuente:** Lo que hoy calcula la demo: `suid/gi-data.js`, función `insights`. Los textos y umbrales de la etiqueta están en `suid/gi.js`, función `insightsHtml`.
- **Revisado:** 19-nov-2026

## Resumen

| Indicador | Qué responde | Ventana |
|---|---|---|
| Vencen en 30 días | ¿Cuántas restricciones están por terminar? | Próximos 30 días |
| Corren sin bloquear | ¿Cuántas sanciones ya consumen vigencia y todavía no impiden el ingreso? | Al día de hoy |
| Revisión media | ¿Cuánto tarda el Ministerio en decidir sobre un registro? | Últimos 90 días, contra los 90 anteriores |
| Devueltos a inspección | ¿Con qué frecuencia los oficios llegan incompletos? | Últimos 90 días, contra los 90 anteriores |
| Reincidencia a 3 años | ¿Qué parte de las personas sancionadas repite? | Últimos 36 meses |
| Conducta frecuente | ¿Qué conducta aparece más en lo que está llegando? | Últimos 90 días, contra los 90 anteriores |

## Definiciones

| Término | Qué significa |
|---|---|
| Hoy | La fecha del día en que se abre la vista. |
| Inicio de la vigencia | El día siguiente a la fecha de ejecutoria. |
| Fin de la vigencia | Inicio de la vigencia más los meses de la medida. |
| Restricción activa | Registro en estado Validado cuyo fin de vigencia no ha pasado. |
| Últimos 90 días | Desde hace 90 días (sin incluir ese día) hasta hoy. |
| 90 días anteriores | Desde hace 180 días (sin incluirlo) hasta hace 90 días. Es el periodo contra el que se compara la tendencia. |
| Decisión | El primer cambio de estado que saca al registro de Recibido: queda Validado o Por subsanar. |
| Devolución | Cada paso de un registro a Por subsanar. Un mismo registro puede sumar varias. |
| Persona | Se identifica por tipo y número de documento. |

## Vencen en 30 días

¿Cuántas restricciones están por terminar?

- **Cifra:** Número de restricciones activas a las que les quedan 30 días o menos, junto al total de activas («3 de 30»).
- **Fórmula:** `contar(restricción activa y días restantes ≤ 30) · total = contar(restricción activa)`
- **Ventana:** Próximos 30 días
- **En el ⓘ:** Porcentaje sobre las activas y la fecha de la que termina primero.
- **Datos que usa:** Estado del registro, fecha de ejecutoria, meses de la medida.
- **Por confirmar:** El plazo de 30 días.

| Etiqueta | Cuándo |
|---|---|
| Por vencer | Hay al menos una. |
| Sin salidas | No hay ninguna. |

## Corren sin bloquear

¿Cuántas sanciones ya consumen vigencia y todavía no impiden el ingreso?

- **Cifra:** Número de registros que no están Validados y tienen fecha de ejecutoria y meses de medida.
- **Fórmula:** `contar(estado del registro ≠ Validado y tiene fin de vigencia)`
- **Ventana:** Al día de hoy
- **En el ⓘ:** Promedio de días de vigencia ya consumidos (de inicio de la vigencia a hoy) y el registro que más lleva.
- **Datos que usa:** Estado del registro, fecha de ejecutoria, meses de la medida.
- **Por confirmar:** Si deben contarse también los registros cuya vigencia ya terminó sin haberse validado; hoy se cuentan.

| Etiqueta | Cuándo |
|---|---|
| Sin bloquear | Hay al menos uno. |
| Al día | No hay ninguno. |

## Revisión media

¿Cuánto tarda el Ministerio en decidir sobre un registro?

- **Cifra:** Promedio de días entre el recibido y la decisión, con un decimal, de los registros decididos en los últimos 90 días.
- **Fórmula:** `promedio(fecha de decisión − fecha de recibido), con decisión en los últimos 90 días`
- **Ventana:** Últimos 90 días, contra los 90 anteriores
- **En el ⓘ:** El promedio anterior y los días que lleva el registro en Recibido más viejo.
- **Datos que usa:** Historial de estados del registro (fecha de cada cambio).
- **Por confirmar:** Días calendario o hábiles (hoy son calendario), la ventana de 90 días y el margen de 0,2 días.

| Etiqueta | Cuándo |
|---|---|
| Al alza | Sube más de 0,2 días frente al periodo anterior. |
| A la baja | Baja más de 0,2 días. |
| Estable | La diferencia no pasa de 0,2 días. |
| Sin dato | Falta alguno de los dos periodos. |

## Devueltos a inspección

¿Con qué frecuencia los oficios llegan incompletos?

- **Cifra:** Número de devoluciones hechas en los últimos 90 días.
- **Fórmula:** `contar(pasos a Por subsanar con fecha en los últimos 90 días)`
- **Ventana:** Últimos 90 días, contra los 90 anteriores
- **En el ⓘ:** La cifra anterior y el porcentaje sobre lo recibido: devoluciones del periodo entre registros radicados en el mismo periodo.
- **Datos que usa:** Historial de estados del registro, fecha de registro.
- **Por confirmar:** Si se cuentan devoluciones o registros devueltos (hoy un registro devuelto dos veces suma dos) y la ventana de 90 días.

| Etiqueta | Cuándo |
|---|---|
| Al alza | Hay más devoluciones que en el periodo anterior. |
| A la baja | Hay menos. |
| Estable | Son las mismas. |

## Reincidencia a 3 años

¿Qué parte de las personas sancionadas repite?

- **Cifra:** Porcentaje, sin decimales, de personas con dos o más medidas sobre las personas con al menos una, contando las medidas con ejecutoria en los últimos 36 meses.
- **Fórmula:** `personas con ≥ 2 medidas ÷ personas con ≥ 1 medida × 100, con ejecutoria en los últimos 36 meses`
- **Ventana:** Últimos 36 meses
- **En el ⓘ:** Cuántas personas repiten sobre cuántas hay, y «una de cada N».
- **Datos que usa:** Tipo y número de documento, fecha de ejecutoria.
- **Por confirmar:** La ventana de 36 meses, los cortes de 10 % y 25 %, y si deben contarse solo los registros validados (hoy cuentan todos, en cualquier estado).

| Etiqueta | Cuándo |
|---|---|
| Baja | Hasta 10 %. |
| Moderada | Más de 10 % y hasta 25 %. |
| Alta | Más de 25 %. |

## Conducta frecuente

¿Qué conducta aparece más en lo que está llegando?

- **Cifra:** Porcentaje, sin decimales, de los registros de los últimos 90 días que incluyen la conducta más repetida. Si dos empatan, gana la primera del catálogo.
- **Fórmula:** `registros con la conducta más repetida ÷ registros radicados × 100, en los últimos 90 días`
- **Ventana:** Últimos 90 días, contra los 90 anteriores
- **En el ⓘ:** El nombre de la conducta, cuántos registros la tienen y el porcentaje anterior.
- **Datos que usa:** Origen de la obligación (catálogo de conductas), fecha de registro.
- **Por confirmar:** La ventana de 90 días. Un registro puede tener varias conductas y cuenta para cada una, así que los porcentajes de todas las conductas pueden sumar más de 100.

| Etiqueta | Cuándo |
|---|---|
| Al alza | El porcentaje de esa misma conducta sube frente al periodo anterior. |
| A la baja | Baja. |
| Estable | Es el mismo. |

## Casos sin dato

- Sin registros en el periodo, el indicador de conducta no se muestra.
- Sin decisiones en alguno de los dos periodos, Revisión media muestra «—» o la etiqueta «Sin dato» y el texto «Aún no hay comparación.».
- Sin restricciones por vencer, el texto es «Ninguna medida vigente termina este mes.».
- La tendencia nunca depende solo del color: siempre lleva un símbolo y una palabra.

## Por decidir

- Los plazos, ventanas y cortes vienen de la demo. La HU-26.3 no los fija: los debe confirmar el IVC.
- En la demo el cálculo ocurre en el navegador con datos ficticios. En el producto lo debe entregar el servicio, con la misma definición.

## Criterios de aceptación

- [ ] Cada indicador da la misma cifra que su fórmula sobre los mismos registros.
- [ ] La etiqueta cambia en los cortes indicados y siempre lleva símbolo y palabra.
- [ ] El ⓘ de cada indicador muestra el contexto descrito.
- [ ] Los plazos y cortes quedan confirmados por el IVC.
