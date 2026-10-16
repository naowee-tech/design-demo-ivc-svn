# 3 · Monitor PMU y auditoría

## La superficie

| | |
|---|---|
| **Quién** | Policía Nacional en el PMU, Mindeporte, supervisor del evento; el club ve la de sus eventos |
| **Dispositivo** | Pantallas del PMU (pared) y escritorio |
| **Cuándo** | El día del evento, y consulta posterior |
| **Módulos** | 5 · Control de acceso; *Auditoría* transversal |
| **Preguntas que responde** | En vivo: ¿hay un rojo, dónde y a qué hora? ¿Hay un aviso por revisar? · Después: ¿qué pasó con esta persona, esta puerta o este evento? |

**Prototipo:** [prototipo](../../README.md), ruta `#/auditoria` (el en vivo es `#/policia`).

**Paso del flujo:** 4 (Monitor PMU, `#/policia`) y 6 (Auditoría, `#/auditoria`)

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **En vivo · alertas** (modo pared) | Que ningún rojo se pierda | Cola de rojos arriba: puerta, hora, partido; *Asignar* (modal con la info de la puerta y los agentes a notificar) → el agente la toma → *Cerrar* con resultado. Suena y no se va hasta que se asigna |
| **En vivo · avisos** *(decisión de producto, 16-oct-2026)* | Que la autoridad de seguridad tenga presente a quien entró con un antecedente | **Cola propia, distinta de las alertas rojas** (ver *Cola de avisos* abajo): silenciosa, sin sonido ni asignación; cada aviso con su causa, puerta y hora, y *Marcar revisado* |
| **En vivo · flujo por puerta** | Que el supervisor vea la operación | Ingresos por minuto, avisos al PMU, rojos y llamados a la Policía en rojos operativos, puertas sin conexión. Con huella *(exploratorio)*: estado del **lector** por puerta y el **patrón de fallos**: si un lector supera, por ejemplo, el 15 % de lecturas ilegibles en 10 minutos, se marca *Lector P4: revisar* para el supervisor; y si un mismo documento acumula *no coincide* en dos puertas, sale un **aviso** (no una alerta) y suma a *Intentos fallidos en la puerta*. Umbrales por definir |
| **Auditoría** | Reconstruir lo que pasó | Filtros por evento, puerta, color, origen, documento y fecha; paginada y exportable |
| **Indicadores** | Resumen del evento o del periodo | Medidas vigentes, derechos de ingreso, ingresos, avisos al PMU, rojos operativos y rojos por medida |

## Estados

- **Validación**: verde (entra; con o sin aviso al PMU) · rojo operativo (con o sin llamado a la Policía; no avisa al PMU) · rojo por medida (notificado al PMU). Es la misma lectura de dos colores que ve el operador.
- **Alerta roja** *(decisión de producto, 29-sep-2026)*: nueva → asignada (los agentes reciben la notificación; sigue *Nueva*) → tomada por un agente → cerrada, con resultado. Si un agente la toma antes de que se asigne, pasa directo a tomada.
- **Aviso al PMU** *(decisión de producto, 16-oct-2026)*: nuevo → revisado (con quién y cuándo). No hay *asignado*, *en atención* ni *cerrado con resultado*: un aviso informa, no exige una acción.

## Cola de avisos *(decisión de producto, 16-oct-2026)*

Reemplaza al amarillo de la puerta. La persona **entra** y el PMU recibe un aviso silencioso; el
operador de puerta no lo ve ni decide nada.

| Aspecto | Diseño |
|---|---|
| **Dónde** | Cola propia del tablero, debajo de las alertas rojas y visualmente distinta: sin color rojo, sin sonido, sin modal de asignación. Nunca se mezcla con las alertas |
| **Qué dispara un aviso** | Medida recién levantada · sanción cumplida · antecedente por agresión · **posible riesgo** (señal inferida por afinidad y datos cruzados) · y, con el módulo de huella *(exploratorio)*, tres avisos nuevos: **`sin-huella`** (la excepción *No puede dar huella*, **solo en modo *Obligatoria***; en *Opcional* no hay aviso porque nada se exigía), **`sin-referencia`** (documento sin huella de referencia, también solo en *Obligatoria*) y **`contingencia-huella`** (**un solo aviso por puerta**, p. ej. *Contingencia de huella · Puerta 4 · 18:52*, no uno por persona) |
| **Qué muestra cada aviso** | Causa en lenguaje de funcionario · puerta · hora · persona (documento enmascarado, con *Ver perfil* hacia la vista policial) · estado |
| **Redacción** | Hecho cierto en indicativo (*Medida levantada el 3-oct*); señal inferida **siempre en condicional** (*Posible riesgo para este partido*), con el motivo explicable. Sin puntaje único de peligrosidad |
| **Estados** | **Nuevo** → **Revisado**, con quién lo revisó y cuándo. Un contador de *nuevos* en el encabezado de la cola; los revisados quedan en la lista, atenuados |
| **Qué nunca hace** | Bloquear el ingreso, pedirle una decisión al operador, sonar, asignarse a un agente o escalar a alerta roja. Si hay una medida vigente, ya no es un aviso: es el rojo por medida |
| **Salvaguardas de la afinidad** | El aviso por afinidad nunca niega el acceso; queda en la auditoría con su motivo y la persona puede apelar (`dominio.md` · *Salvaguardas de la afinidad*). Si la afinidad es *no concluyente*, no hay aviso |
| **Auditoría** | Cada aviso y cada revisión (quién, cuándo) son transacciones del registro inmutable |
| **Sin conexión** | Los avisos se guardan en la puerta y llegan al PMU al volver la red, con la hora original |

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Policía | Todo, con las alertas rojas como protagonistas y la cola de avisos debajo; es quien los marca *revisado* |
| Mindeporte | Todo, incluidos los avisos (solo lectura) |
| Supervisor del evento | El flujo de su evento y sus puertas, y el conteo de avisos; no abre el perfil ni revisa avisos |
| Operador de puerta | Nada de esta superficie: no ve avisos ni su estado |
| Club | La auditoría integral de sus eventos |
| Comercializadora | Solo sus consultas, en el portal de integración (6) |

## Reglas que hace cumplir

- **Registro inmutable**: fecha y hora, origen, documento, resultado y detalle (`dominio.md` · *Auditoría*).
- **El aviso y el rojo no se confunden**: el aviso informa y la persona ya entró; el rojo no deja pasar. Son colas distintas, con estados distintos.
- **Un aviso inferido se redacta en condicional** y no decide nada (salvaguardas de la afinidad).
- **Cada consulta a datos protegidos también queda registrada.**
- **La huella no genera alertas rojas** *(exploratorio, 16-oct-2026)*: una huella que no coincide es un rojo operativo (no avisa al PMU) y los fallos de un lector son una señal **del equipo**, no de una persona. Todo lo de huella que llega al PMU es un aviso o una marca de flujo, nunca una alerta. El PMU no recibe resultados biométricos por persona salvo la etiqueta «Identidad verificada con huella» en la alerta por medida.

---

## Auditoría del demo

**Vista:** *Monitor en vivo (auditoría PMU)* (`index.html:372-401`; `app.js:591-623`).

**Qué conservar:** un registro por intento, de venta y de ingreso; el detalle en lenguaje de negocio
(*Boleta ya utilizada*, *Alerta policial: intento de ingreso con sanción activa*); se actualiza solo.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **Amarillo y rojo iguales**: *boleta ya utilizada*, *sin boleta* y *alerta policial* salen como `RECHAZADO` con la misma etiqueta roja. | `app.js:601-607` |
| **Crítico** | **El rojo no avisa**: es una fila más entre 15, sin sonido ni estado de *atendida*. | `app.js:591-623` |
| Alto | No dice en qué puerta pasó: *Origen* es `MOLINETE_PUERTA` para todas. | `app.js:612` |
| Alto | Sin filtros y solo las últimas 15 filas: no sirve para auditoría posterior. | `server.py` `/api/transacciones` |
| Alto | La columna *Endpoint* ocupa el ancho de la puerta y no le dice nada al PMU. | `index.html:389` |
| Medio | Cuatro palabras para dos resultados (*Autorizado*, *Admitido*, *Denegado*, *Rechazado*). | `app.js:601-605` |
| Medio | Solo se actualiza con la pestaña abierta; *Streaming activo* es fijo. | `app.js:140-144` |
| Medio | Sin modo pared: tabla de 13 px en tarjeta blanca. | `styles.css:235-257` |

## Preguntas abiertas

- ¿Quién cierra una alerta roja y con qué resultados (conducido, no encontrado, falsa alarma)?
- ¿El club ve el monitor en vivo de su evento o solo la auditoría después?
- ¿Cuánto tiempo sin revisar un aviso antes de resaltarlo? ¿Se exige una nota al marcarlo revisado?
- ¿El supervisor del evento ve las causas de los avisos o solo el conteo? (Lo asumido: solo el conteo.)
