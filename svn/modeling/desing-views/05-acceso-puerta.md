# 5 · Acceso en puerta

## La superficie

| | |
|---|---|
| **Quién** | Operador de puerta; la Policía con vista ampliada |
| **Dispositivo** | Celular o tablet (web móvil), a la intemperie, con una mano; consola de escritorio en el torniquete |
| **Cuándo** | Horas antes y durante el evento |
| **Módulos** | 5 · Control de acceso; 2 · Identidad; 1 · Medidas (solo el resultado) |
| **Pregunta que responde** | ¿Este documento tiene derecho de ingreso a este partido, por esta puerta, ahora? |

Es la cuarta validación del dominio (*¿Puede entrar?*) y la superficie que más se usa: una lectura
cada pocos segundos, con fila y ruido.

**La puerta revisa el documento, no la boleta** *(decisión de producto, 16-oct-2026)*: cruza el
documento con su **derecho de ingreso** (documento + evento + sector). La boleta de la comercializadora
es el comprobante de la compra y no se lee aquí. La identidad es documento + ANI, y el operador
compara la foto impresa del documento con la persona. **No hay rostro**; lo único biométrico es la
**huella, como módulo opcional** por evento *(exploratorio, 16-oct-2026)*: la huella confirma quién es, nunca decide si puede entrar.

**Prototipo:** [prototipo](../../README.md), rutas `#/puerta` y `#/policia`.
**Paso del flujo:** 3

Supuestos que toma: el rojo por medida no muestra el nombre al operador; el verde sí, para cotejarlo con
el documento; los tiempos de la capa oculta (7 pasos con *Huella*, que dice *No aplica* con el módulo apagado; ~1,8 s en total) son ilustrativos, no un compromiso de rendimiento.

## Pantallas

| Pantalla | Rol | Para qué | Contenido clave |
|---|---|---|---|
| **Lectura** | Operador | Leer sin tocar nada | Cámara siempre abierta a pantalla completa con la guía *Escanee el documento*; encabezado fijo *Puerta · Partido · Conexión*; *Digitar documento* como plan B; linterna y zoom |
| **Digitar documento** (hoja sobre la lectura) | Operador | Validar cuando la cédula no se puede escanear *(decisión de producto, 16-oct-2026)* | Tipo de documento (selector); teclado numérico; borrar; longitud mínima (*Validar* apagado hasta cumplirla); si el ANI no lo halla, *No encontramos ese documento* y se corrige sin salir de la hoja |
| **Resultado** (capa sobre la cámara) | Operador | Saber de un vistazo | **Solo dos colores.** Verde *Entra* + *Continuar* (con o sin aviso al PMU: el operador no lo ve) · Rojo operativo *No entra* + causa (*Sin ingreso a este partido*, *Ya ingresó*, *Puerta equivocada* con *Diríjase a la Puerta X*, *Posible cédula prestada*) + *Siguiente* / *Llamar a la Policía* · Rojo por medida *No entra · remitir a Policía* (lo cierra el operador). En el verde, *No es la persona* si la foto del documento no coincide con quien está delante |
| **Turno** | Operador | Saber cómo va | Ingresos, rojos, llamados a la Policía, última sincronización. Los avisos al PMU no se cuentan aquí: el operador no los ve |
| **Eventos** | Policía (otra sesión) | Elegir qué evento seguir | Cards por fecha: en vivo, próximos y pasados, con escenario, ciudad, estado del momento (*puertas abiertas*, *en juego*, *sin hinchada visitante*, *finalizado*) y alertas nuevas; el en vivo abre el tablero, el pasado la auditoría *(decisión de producto, 29-sep-2026)* |
| **Tablero del evento** | Policía (otra sesión) | Ver cómo va el ingreso antes de abrir un perfil | Partido y cuenta al inicio; ingresados, por minuto, avisos y rojos; flujo por puerta; **panel de alertas fijo a la derecha**: nueva → en atención → cerrada, con cada paso (quién la generó, la tomó y la cerró, y con qué resultado); debajo, la **cola de avisos** (ver `03-monitor-pmu.md`). *Ver perfil* abre la vista policial *(decisión de producto, 28-sep-2026)* |
| **Vista policial** | Policía (otra sesión) | Atender un rojo o revisar un aviso | Medidas vigentes y cumplidas con sus conductas, reincidencia y **datos cruzados**: club afín con su certeza, tribuna habitual, frecuencia, viajes de visitante, si va con personas con medida vigente, intentos fallidos. Cada señal explicable y **sin puntaje único de peligrosidad** |
| **Configuración del dispositivo** | Supervisor | Asignar la puerta y el partido | Solo si el backoffice (4) no lo dejó listo; pide supervisor |
| **Configuración · Huella** *(exploratorio)* | Prototipo / backoffice del evento (4) | Fijar el modo de huella | En el prototipo es un solo switch *Lector de huella* (hay o no hay; la obligatoriedad va por sector). Modelo: selector de tres modos: **Apagada · Opcional · Obligatoria**, con un aviso breve que explica cada uno; en *Condiciones*, el interruptor *Lector de huella*. En producción el modo lo fija el evento (el organizador *Opcional*; Mindeporte *Obligatoria*, con el campo *Norma que lo habilita*) y no cada puerta |
| **Lectura de huella** *(exploratorio, transitoria)* | Operador | Confirmar quién es, tras un verde candidato del documento | Pantalla *Ponga el dedo en el lector*, fondo oscuro como *Validando*, con el contador *Intento n de 3* y la leyenda *Lectura simulada* en el prototipo; sin imagen de huella ni porcentaje; *Leer otra vez* hasta 3 intentos |
| **Verificar con huella** *(exploratorio, hoja)* | Operador | Salir de la duda de *No es la persona* en modo *Opcional* | Dos salidas: *Leer huella* y *No entra sin verificar* |
| **Ingreso sin huella** *(exploratorio, hoja)* | Operador | Registrar la excepción *No puede dar huella* | Motivo de opción única (*Discapacidad o lesión*, *Huella ilegible*, *Otro*); nota *Compare la foto del documento*; Enter no confirma |

**Por dispositivo:** celular = una columna, resultado como capa; tablet = cámara a la izquierda y
resultado con historial del turno a la derecha; consola de escritorio = lector USB con el foco
siempre en la lectura.

## Casos de la puerta *(decisión de producto, 16-oct-2026)*

| Resultado | Caso | Qué ve el operador |
|---|---|---|
| **Verde** | Escaneando cédulas | *Entra* con el documento leído y la ubicación |
| **Verde** | Solo con cédula (documento digitado) | Igual, tras los controles de la hoja *Digitar documento* |
| **Rojo operativo** | Sin ingreso a este partido | *No entra* + causa |
| **Rojo operativo** | Ya ingresó | *No entra* + causa |
| **Rojo operativo** | Puerta equivocada | *No entra* + *Diríjase a la Puerta X*; sin llamado a la Policía |
| **Rojo operativo** | Posible cédula prestada (*No es la persona*) | *No entra* + causa; la Policía es opcional |
| **Rojo por medida** | Medida correctiva vigente | *No entra · remitir a Policía*; alerta al PMU |

### Casos con huella *(exploratorio, 16-oct-2026)*

Son 8 casos del módulo de huella (el último solo existe si se adopta el enrolamiento propio, hipótesis B). En los verdes la huella aparece como una etiqueta; en los rojos **no se muestra nada de huella**. El panel del prototipo los agrupa en su propio grupo *Con huella*.

| Caso | Color y por qué | Qué ve el operador | Auditoría / PMU |
|---|---|---|---|
| **Huella coincide** | Verde: el documento ya era verde candidato y la huella confirma | *Entra* · *Identidad verificada* · etiqueta «Huella coincide» | `Entró · huella coincide`; sin aviso |
| **No puede dar huella** | Verde con excepción (discapacidad o lesión, huella ilegible, otro) | Hoja *Ingreso sin huella* con motivo; luego *Entra · Sin huella · motivo* y *Compare la foto del documento con la persona*; Enter no confirma | `Entró · sin huella · motivo`; **aviso silencioso al PMU solo en *Obligatoria*** |
| **Sin huella de referencia** | Verde con excepción automática: el documento no está en la base biométrica (CE, PPT, pasaporte, PEP; quizá TI) | *Entra* · *Documento sin huella de referencia* · compare la foto; no hay lectura | `Entró · sin referencia biométrica`; aviso solo en *Obligatoria* |
| **Lector sin servicio** | No cambia el color: falla del equipo | Chip del lector en rojo. *Opcional*: la verificación sigue con el documento. *Obligatoria*: ningún verde hasta que el supervisor active la contingencia; luego *Sin huella · contingencia* | **Un solo aviso por puerta** al PMU; cada ingreso queda con `contingencia` |
| **Huella no coincide** | Rojo operativo: problema de identidad en esta puerta, no una medida | Durante la lectura *No coincide · intento 2 de 3 · pruebe con otro dedo*; al final *No entra · Posible cédula prestada*; la Policía es opcional | `No entró · huella no coincide (3 lecturas legibles)`; sin alerta al PMU; suma a *Intentos fallidos en la puerta* |
| **Huella válida sin derecho de ingreso** | Rojo operativo: la identidad no da derecho | Igual a *Sin ingreso a este partido*, sin etiqueta de huella | `No entró · sin derecho de ingreso (huella coincide)` |
| **Huella válida con medida vigente** | Rojo por medida: la huella nunca abre lo que la medida cierra | Igual al rojo por medida, sin etiqueta de huella; *Remitir y siguiente* | Alerta al PMU con «Identidad verificada con huella» |
| **Primer ingreso: registrar huella** | Verde, **solo con enrolamiento propio (hipótesis B)**; si no se elige B, este caso no existe | Pantalla de autorización y captura | Autorización con hora y versión del texto |

Los dos últimos rojos con huella válida (sin derecho y medida) solo ocurren con **lectura simultánea de dedo y documento** (torniquete); en celular o tablet el documento corta antes de pedir la huella. Sin la hipótesis B, el panel muestra 7 casos.

**Convivencia con *No es la persona*:**
- **Apagada:** el flujo actual, sin cambios.
- **Opcional:** *No es la persona* abre la hoja **Verificar con huella**, con dos salidas: *Leer huella* (si coincide, entra con *Identidad verificada*; si no, rojo) y *No entra sin verificar* (el rojo de hoy). No se agrega un botón al verde.
- **Obligatoria:** con huella que coincide, *No es la persona* desaparece; con excepción o contingencia se queda, porque la foto impresa vuelve a ser la única verificación.

### Panel de casos del prototipo (acordeón de 4 grupos)

El panel *Leer una persona* del prototipo agrupa los casos en un **acordeón de 4 grupos, en orden fijo**: **Entra** (2 casos; abierto por defecto) · **No entra en la puerta** (4) · **No entra por medida** (1) · **Con huella** (8, o 7 sin enrolamiento). Dentro de cada grupo van primero los verdes y cada fila conserva su punto de color. Se agrupa la huella aparte y no por resultado porque el módulo se demuestra como un conjunto y se puede apagar entero. El grupo del caso activo se abre solo al leerlo, incluso el que se dispara al digitar. Elegir un caso de huella con el modo en *Apagada* sube el modo al mínimo del caso y avisa con un aviso breve. Es una herramienta de demo: no existe en producción.

## Estados

- **Semáforo** (`dominio.md` §5): **dos colores para el operador**. Verde (entra) · rojo operativo (problema del documento en esta puerta; Policía opcional) · rojo por medida (alerta al PMU).
- **Aviso al PMU** *(decisión de producto, 16-oct-2026)*: reemplaza al amarillo. Si la persona tiene un antecedente (medida recién levantada, sanción cumplida, antecedente por agresión, posible riesgo), entra con verde y el PMU recibe un aviso silencioso (causa, puerta, hora). El operador no lo ve ni decide nada.
- **Decisión del operador** en un rojo operativo: si llamó o no a la Policía, con operador, puerta y hora.
- **Derecho de ingreso**: vigente → usado.
- **Dispositivo**: en línea · sin conexión (validando con el paquete del evento) · sincronizando.
- **Modo de huella del evento** *(exploratorio)*: Apagada · Opcional · Obligatoria (con excepción por sector).
- **Lector de huella** *(exploratorio)*: en servicio · sin servicio · en contingencia (la activa el supervisor para esa puerta).
- **Lectura de huella** *(exploratorio, transitoria)*: esperando · leyendo · intento *n* de 3 · coincide · no coincide · ilegible · exceptuada. No es un color: el semáforo sigue en dos.

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Operador | El semáforo de dos colores, la causa del rojo operativo y el documento que leyó. Nunca hechos, expediente ni avisos al PMU. Con huella *(exploratorio)*: la lectura transitoria y el resultado en el momento, nunca guardado a su vista |
| Policía | El expediente de la persona del rojo y los avisos al PMU, en la vista policial; con huella, «Identidad verificada con huella» en la alerta por medida |
| Comercializadora | Nunca ve nada de huella *(exploratorio)* |

## Reglas que hace cumplir

- **Siempre cruzando con el documento**: derecho de ingreso al partido de ese torniquete, sin medida vigente, sin ingreso previo, **puerta de su sector**. La boleta no se lee.
- **La puerta de otro sector es un rojo operativo, no un amarillo**: *Puerta equivocada*, con *Diríjase a la Puerta X* y sin llamar a la Policía *(decisión de producto, 16-oct-2026)*.
- **Digitar tiene controles de escritura**: tipo de documento, borrar, longitud mínima y el mensaje *No encontramos ese documento* si el ANI no lo halla.
- **La puerta no consulta al IVC**: el SVN valida contra su propia base de medidas; el IVC solo las radica *(decisión de producto, 1-oct-2026)*.
- **Partido sin hinchada visitante**: el club afín es el único dato cruzado que decide un acceso; los
  demás solo informan a la vista policial y al PMU.
- **Biometría: solo huella, modular** *(exploratorio, 16-oct-2026)*: no hay rostro, ni confianza de identidad, ni estado azul «Verificar», ni foto de referencia. El operador compara la foto impresa del documento con la persona y, si no coincide, toca *No es la persona*: rojo operativo *Posible cédula prestada* (con el módulo en *Opcional*, esa duda se aclara con la huella).
- **La huella confirma quién es, nunca decide si puede entrar** *(exploratorio)*: se pide solo cuando el documento ya dio un verde candidato; no abre lo que cierra una medida o la falta de derecho; solo en modo *Obligatoria* puede detener un ingreso, y siempre con la salida **«No puede dar huella»**. La foto impresa es la vía alternativa en todos los modos.
- **El modo se configura por evento, con excepción por sector, nunca por puerta** *(exploratorio)*. Apagada · Opcional · Obligatoria. *Obligatoria* la enciende Mindeporte con la **norma que la habilita** *(a verificar con jurídica)*; el organizador solo no puede. Por puerta solo existe la contingencia *lector sin servicio*, que activa el supervisor.
- **Límite de 3 lecturas** *(exploratorio)*: la 2.ª y la 3.ª piden otro dedo. Calidad y coincidencia se cuentan aparte: una lectura ilegible no cuenta como «no coincide»; tres ilegibles llevan a la excepción, nunca al rojo; tres legibles que no coinciden dan el rojo.
- **Qué guarda la huella** *(exploratorio)*: solo el resultado, los intentos, el lector y la transacción de la Registraduría. Nunca imagen, plantilla ni puntaje. En los rojos la pantalla no muestra nada de huella, para no mezclar señales.
- **La lectura de huella es un estado transitorio**, como *Validando*; el resultado final sigue siendo verde o rojo. **Enter no confirma** la excepción ni dispara *Leer huella*.
- **Sin red no hay huella** *(exploratorio)*: en *Opcional* sigue el documento; en *Obligatoria* la puerta pasa sola a contingencia.
- **El rojo por medida no se puede autorizar** y se notifica al PMU; el rojo operativo no avisa al PMU.
- **El rojo por medida muestra la foto del documento pero no el nombre** *(decisión de producto, 28-sep-2026)*: el operador necesita reconocer a la persona para remitirla; el nombre y el número completos quedan reservados a la Policía.
- **Ninguna pantalla de resultado se cierra sola**: el operador la cierra con *Continuar* (verde), *Siguiente* (rojo operativo) o *Remitir y siguiente* (rojo por medida) *(decisión de producto, 28-sep-2026)*.
- **Un antecedente no bloquea ni le pide nada al operador**: la persona entra y el aviso va al PMU. Lo único que decide el operador es llamar o no a la Policía en un rojo operativo.
- **Sin conexión**: valida con el paquete del evento; los rojos salen al PMU al volver la red.

---

## Auditoría del demo

**Vistas:** consola *Control de acceso* (`index.html:257-367`; `app.js:452-554`) y *SVN Móvil*
(`mobile.html:572-655`, `:914-1418`), revisadas a 1440, 820 y 390 px.

**Qué conservar:**
- El resultado con el color a pantalla completa, icono y título grande: se lee de lejos.
- Sonidos distintos por color, y vibración distinta en el móvil: la señal más confiable con ruido.
- El lector USB que valida solo cuando entra una cadena larga.
- La cámara con linterna y zoom solo si el dispositivo los tiene, el marco de lectura y el consejo de distancia.
- Cinco intentos de lectura antes de pedir que se digite.
- El tema oscuro del móvil, que hace resaltar el color.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **El amarillo del demo bloquea con un mensaje**: en el modelo el amarillo entra con aviso. | `app.js:516-529`, `mobile.html:1380-1394` |
| **Crítico** | **El resultado no se limpia solo**: el verde o el rojo quedan hasta la siguiente lectura; con fila, el operador puede leer el de la persona anterior. | `app.js:503-546` |
| **Crítico** | **La cámara del móvil se cierra después de cada lectura**: hay que abrirla otra vez por cada persona. | `mobile.html:1123-1124` |
| **Crítico** | **`user-scalable=no`**: no se puede ampliar el texto (WCAG 1.4.4). | `mobile.html:5` |
| Alto | El partido se cambia con un desplegable a la vista, con *Todos los partidos (detección automática)*: cualquiera reconfigura la puerta. | `index.html:266-282`, `mobile.html:575-586` |
| Alto | El amarillo mezcla señales: fondo naranja con *"Habilitado (sin sanción policial)"* en verde dentro. | `app.js:524-528` |
| Alto | El rojo muestra un párrafo legal, el protocolo y una nota en cursiva de 12 px. | `app.js:534-545` |
| Alto | En el celular, con un resultado en pantalla, la lectura y los botones quedan bajo el pliegue (390 × 844). | Captura a 390 px |
| Alto | Muestras de cédula con nombre de archivo y casos de prueba en la barra del operador. | `mobile.html:638-653`, `index.html:324-338` |
| Alto | La vista policial no existe: el rojo solo dice *remitir al PMU*. | — |
| Medio | No valida que la puerta sea del sector de la boleta. | `server.py:898-1100` |
| Medio | La puerta está fija en el código (*Puerta 4 Oriental*). | `app.js:496`, `mobile.html:1352` |
| Medio | La consola no devuelve el foco a la lectura después de validar. | `app.js:467-554` |
| Medio | En la tablet, ~770 px de naranja casi vacío y los controles abajo del todo. | Captura a 820 px |
| Medio | Botones de 36 a 40 px y *chips* de 28 px. | `mobile.html:206-213`, `:265-277` |
| Medio | La tiquetera comparte la app con la puerta. | `mobile.html:560-567` |
| Medio | *En línea* es una etiqueta fija; no hay modo sin conexión. | `mobile.html:553-556` |
| Bajo | El nombre del motor de lectura (*IA Vision ML*, *ZXing HD*) aparece sobre la cámara. | `mobile.html:995`, `:1032` |

## Preguntas abiertas

- ~~Documento del partido correcto por la puerta de otro sector: ¿amarillo o rojo?~~ Resuelta el 16-oct-2026: rojo operativo *Puerta equivocada*.
- ¿Qué queda auditado cuando el operador toca *No es la persona*? (`dominio.md`, preguntas abiertas.) Con la huella *(exploratorio)*: modo, resultado, intentos, lector y operador; sin imagen ni plantilla.
- **La excepción «No puede dar huella»** *(exploratorio)*: en modo *Obligatoria* es la vía alternativa que exige la norma, pero abre la puerta a abusar del atajo. Se asume el **aviso silencioso al PMU** (solo en *Obligatoria*) para detectar el abuso; falta validar con Jorge y con jurídica si basta con el aviso o si el supervisor debe autorizarla. Los motivos (*Discapacidad o lesión*, *Huella ilegible*, *Otro*) y el tiempo extra por persona (2 a 6 s, a medir) están por confirmar en una fila real.
- **Base legal de la huella obligatoria** *(a verificar con jurídica)*: Ley 1581 y Decreto 1377 de 2013 contra el Decreto 1622 de 2022 o la Ley 1270 de 2009.
- **Lectores** *(exploratorio)*: el sensor del celular (Touch ID, BiometricPrompt) no sirve, porque solo autentica al dueño del equipo; hace falta lector externo certificado en celular y tablet, USB en consola e integrado en torniquete. Estándar y proveedor por definir.
- ¿El rojo muestra el nombre de la persona al operador? *Quién ve qué* solo le da el semáforo y el
  documento que leyó.
- ¿Cuánto tarda la vuelta automática a *Lectura* tras un verde? Hay que medirlo en una fila real.
