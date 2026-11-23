# Responsive · Control de acceso (fase 1)

Auditoría del 18-nov-2026 a 375 / 768 / 1280 px. Fuente: `docs/model/responsive.json`; capturas en `docs/img/responsive/`.

## Criterios

- **Desborde:** La página no se puede correr de lado: nada se sale del ancho de la pantalla.
- **Recorte:** Ningún dato queda cortado por un contenedor o por puntos suspensivos cuando es información clave.
- **Scroll propio:** Un bloque con scroll horizontal (tabla, tira de pasos) se acepta solo si se nota y no esconde columnas clave.
- **Zona táctil:** Lo que se toca mide al menos 44 px de lado (WCAG 2.5.5).
- **Texto:** Nada por debajo de 12 px.
- **Navegación:** Desde cualquier vista se puede llegar a las otras secciones del módulo.

## Se rompe

Se corrige en el lugar, sin cambiar el diseño.

### R-01 · Sin menú por debajo de 900 px

- **Dónde:** Todo el módulo (375 / 768 px)
- **Qué pasa:** suid/app.css oculta la barra lateral bajo 900 px y no pone nada en su lugar: en celular y tablet no hay cómo pasar de Gestión a Búsqueda o a Calidad.
- **Solución:** Botón ☰ en el encabezado que abre la barra como cajón (se cierra al navegar, con Esc o tocando fuera). En tablet queda el riel de íconos del shell.
- **Archivo:** `suid/gi-responsive.js`
- **Estado:** resuelto

### R-02 · El estado de la restricción se corta con «…»

- **Dónde:** Panel del expediente, Panel de la persona (375 px)
- **Qué pasa:** «Sanción activa · bloquea en tod…» y «Medida vigente · bloquea en to…»: se pierde justo el alcance de la medida, que es lo que la persona vino a ver.
- **Solución:** El titular y la línea de vigencia parten en dos renglones en vez de cortarse.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### R-03 · El campo de observación y de motivo no ocupa el ancho

- **Dónde:** Validar registro, Devolver por subsanar (375 / 768 / 1280 px)
- **Qué pasa:** El área de texto queda en unos 160 px dentro de la ventana; en celular parece un recuadro suelto y el motivo de devolución, que es obligatorio, se escribe a ciegas.
- **Solución:** El campo ocupa todo el ancho de la ventana, con alto de 4 renglones.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### R-04 · Etiquetas de campo cortadas

- **Dónde:** Editar registro, Registrar infractor (375 px)
- **Qué pasa:** «Ciudad o municipio de reside…»: la etiqueta de un campo obligatorio no se lee completa.
- **Solución:** Las etiquetas parten en dos renglones; ya no llevan puntos suspensivos.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### R-05 · Filtros de ancho desigual

- **Dónde:** Gestión · Registros de infractores, Búsqueda avanzada (375 px)
- **Qué pasa:** Los selectores (Registro, Restricción, Estado, Tipo, Ciudad) quedan cada uno de su ancho, sin llenar la fila; el botón de reiniciar flota aparte.
- **Solución:** En celular cada filtro ocupa su renglón y reiniciar acompaña al último; en tablet se reparten el ancho.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### R-06 · La tabla de Registros se corta también en escritorio

- **Dónde:** Gestión · Registros de infractores, Panel del expediente (1280 px)
- **Qué pasa:** A 1280 px la columna Restricción queda a medias y no hay scroll lateral: la tabla mide 1.420 px dentro de un contenedor que recorta.
- **Solución:** Entre 900 y 1500 px la tabla cede aire, los encabezados parten en dos renglones y el ojo se oculta (la fila ya abre el panel); «Expediente» queda a la vista.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

## Necesita variante

La versión de escritorio no cabe; en celular cambia de forma (tabla → tarjetas, panel → hoja).

### V-01 · Registros de infractores: tabla → tarjetas

- **Dónde:** Gestión · Registros de infractores, Panel del expediente (375 / 768 px)
- **Qué pasa:** En 375 solo se ven Registro, Infractor y la mitad de Origen; en 768 se corta Fin de vigencia, que es la columna que más se consulta.
- **Solución:** Bajo 900 px cada registro es una tarjeta: nombre y documento arriba, restricción y fin de vigencia, estado del registro y radicado, origen y acto. Tocarla abre el mismo panel.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### V-02 · Resultados de búsqueda: tabla → tarjeta por persona

- **Dónde:** Búsqueda avanzada (375 px)
- **Qué pasa:** La columna Estado se corta («Faltan 26 días · hasta 10/11/202…»): es la respuesta a la pregunta de la vista.
- **Solución:** Una tarjeta por persona con el estado y los días arriba; nombre, documento y medidas debajo.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### V-03 · Calidad: hallazgos en tarjetas

- **Dónde:** Calidad y auditoría · Calidad (375 px)
- **Qué pasa:** La columna Detalle queda cortada a una palabra por línea; los tres contadores se apilan a media pantalla.
- **Solución:** Los tres contadores en una fila y cada hallazgo como tarjeta: registro, tipo y el detalle completo.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### V-04 · Trazabilidad: tabla → línea de tiempo

- **Dónde:** Calidad y auditoría · Trazabilidad (375 / 768 px)
- **Qué pasa:** En 375 solo caben Fecha, Registro y Usuario; en 768 la Nota queda cortada. Cada fila mide menos de 44 px de alto para tocarla.
- **Solución:** Bajo 900 px es una línea de tiempo: el cambio de estado como titular, fecha y hora, registro y usuario, y la nota completa.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### V-05 · Ficha: acciones en una barra fija abajo

- **Dónde:** Ficha del infractor (375 px)
- **Qué pasa:** Editar, Devolver y Validar se apilan arriba con anchos distintos, antes del contenido; al bajar a revisar los datos se pierden.
- **Solución:** Barra fija abajo: Validar a todo el ancho, con Editar y Devolver encima.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### V-06 · Formulario: la tira de bloques se esconde en celular

- **Dónde:** Editar registro, Registrar infractor (375 px)
- **Qué pasa:** La tira de bloques (B Infractor, C Tutor…) queda con scroll horizontal y cortada al lado del porcentaje.
- **Solución:** Bajo 1000 px el avance va a todo el ancho y los bloques en una fila que cabe entera (letra, nombre y barra); en celular solo la letra, porque el nombre ya está en el título del paso.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

## Ajuste menor

Funciona, pero se ve apretado o queda bajo el criterio.

### A-01 · Pestañas recortadas

- **Dónde:** Gestión · Indicadores, Gestión · Registros de infractores (375 px)
- **Qué pasa:** «Registros de infract…» o «…es»: las dos pestañas no caben y queda una a medias.
- **Solución:** Las pestañas se compactan y caben las dos sin desplazar.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### A-02 · Zonas táctiles de 40 px

- **Dónde:** Gestión · Indicadores, Gestión · Registros de infractores, Editar registro, Calidad y auditoría · Calidad (375 / 768 px)
- **Qué pasa:** Los botones del sistema de diseño miden 40 px de alto, y los íconos ⓘ y los chips de filtro aún menos.
- **Solución:** Botones, filtros, paginador y cierre de ventanas suben a 44 px bajo 900 px, en una capa de la demo. El botón de origen (repo de diseño) sigue en 40 px.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### A-03 · Texto de 10-11 px

- **Dónde:** Gestión · Indicadores (375 / 768 / 1280 px)
- **Qué pasa:** Las etiquetas de tendencia (Por vencer, Estable…), los ejes de la gráfica y el pie del login.
- **Solución:** Ejes de la gráfica y marcas de tendencia a 12 px.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### A-04 · Título del encabezado cortado

- **Dónde:** Todo el módulo (375 px)
- **Qué pasa:** «Gestión de sancion…», «Editar INF-2026-00…»: el encabezado repite lo que el título de la vista ya dice.
- **Solución:** Bajo 900 px el encabezado muestra solo la vista actual; en celular se oculta la campana (no tiene función en la demo) y el título cabe completo.
- **Archivo:** `suid/gi-responsive.css`
- **Estado:** resuelto

### A-05 · Login: campos de 39 px y textos de 11 px

- **Dónde:** Inicio de sesión (375 / 768 / 1280 px)
- **Qué pasa:** Los campos y el botón miden 37–39 px de alto y la ayuda del pie usa 11 px.
- **Pendiente:** No se toca aquí: el login es copia del tema real del SUID (suid/login/css). Se lleva al equipo dueño de ese tema.
- **Archivo:** `suid/login/css/components-v2.css`
- **Estado:** origen

## Veredicto por vista

| Vista | Veredicto | Nota |
|---|---|---|
| En todo el módulo | Bien | R-01 Sin menú por debajo de 900 px, A-04 Título del encabezado cortado |
| Inicio de sesión | Ajuste menor | Funciona en los tres anchos; quedan dos ajustes que son del tema del SUID. |
| Gestión · Indicadores | Bien | No disponible hasta la siguiente etapa. Cuando se midió: los indicadores se apilan, la gráfica escala y las dos pestañas caben. |
| Gestión · Registros de infractores | Bien | Tarjetas en celular y tablet; en escritorio la tabla ya no se recorta. |
| Panel del expediente | Bien | Pantalla completa en celular, con el estado de la medida completo. |
| Registrar infractor | Bien | Los bloques se apilan y el pie con Cancelar / Comenzar queda a mano. |
| Carga masiva | Bien | Los pasos 1 a 4 funcionan en celular: la validación ya muestra una tarjeta por fila con error. El paso 5 (confirmar) se revisa a mano. |
| ¿Salir de la carga masiva? | Bien | La ventana sale como hoja inferior. |
| Ficha del infractor | Bien | Las acciones quedan en una barra fija abajo. |
| Validar registro | Bien | Hoja inferior con el campo de observación a todo el ancho. |
| Devolver por subsanar | Bien | Hoja inferior con el campo de motivo a todo el ancho. |
| Editar registro | Bien | Avance y bloques en una fila que cabe; las etiquetas se leen completas. |
| Búsqueda avanzada | Bien | Filtros a todo el ancho y el resultado como tarjeta con el estado arriba. |
| Panel de la persona | Bien | Pantalla completa en celular, con el estado de la medida completo. |
| Abrir datos de un menor | Bien | La ventana del motivo funciona bien en los tres anchos. |
| Calidad y auditoría · Calidad | Bien | Contadores en una fila y hallazgos en tarjetas. |
| Calidad y auditoría · Trazabilidad | Bien | Línea de tiempo en celular y tablet. |
| Avisos breves | Revisión manual | Aviso breve de 3 s; se revisa a mano al validar o devolver. |

## Por decidir

- Botones de 44 px: la demo ya los sube en una capa propia. ¿Se lleva el cambio al botón del sistema de diseño (shared/components.css es copia)?
- Login (A-05): es el tema real del SUID. ¿Se reporta al equipo dueño o se deja como está?
- Carga masiva, paso 5 (confirmar la importación): no se pudo abrir de forma automática. Se revisa a mano.
