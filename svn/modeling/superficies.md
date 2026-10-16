# Superficies · Sistema de Validación Nacional (SVN)

Quién usa qué, desde dónde, en qué momento y con qué datos. Complementa a [`dominio.md`](dominio.md).

> **Parte 1 · lo que pide el IVC (Fuente 2, 30-sep-2026).** Es la **gestión de infractores**
> (HU-26.3): registrar, validar y dar seguimiento a las medidas correctivas en el SUID. Es el módulo 1
> y la superficie 1. **Hasta ahí pide el IVC y ahí está su interés.** Todo lo demás (compra, boletería,
> puerta, PMU, homologación, portal de la persona) es la **Parte 2**: sale de la Fuente 1 (demo SVN) y
> de nuestras decisiones de producto, y todavía no tiene una HU del IVC detrás.
>
> Estado: **v2.5** (16-oct-2026), rehecha a partir del demo SVN (`content-supplies/demo-svn`, ver
> [`fuentes.md`](fuentes.md)). Cada superficie dice si **ya existe en el demo**, si es **nueva** o si
> es una *(decisión de producto)*.
>
> **Cambio del 16-oct-2026** *(decisión de producto)*: la puerta revisa el **documento** (su derecho de
> ingreso), no la boleta; no hay rostro y la **biometría** vuelve solo como **huella modular** *(exploratorio)*;
> el operador ve **dos colores** y los antecedentes van
> como **aviso silencioso al PMU**. Se actualizaron las superficies 3 y 5 y se retiró la validación con
> foto de la 7. En la **fase 4** las superficies de **Compra, Entidades, Portal, Integración y Soporte**
> (2, 6, 7, 8, 9) pasaron al mismo modelo: *derecho de ingreso* en lugar de boleta, y la API en v2
> *(exploratorio)*.

---

## Principio

El SVN es infraestructura del Estado: **valida, registra y audita**. No vende boletas ni ingresos: eso es de la comercializadora.

- **La base de medidas es del SVN.** El IVC las radica (superficie 1); ni la compra ni la puerta lo consultan
  en cada validación *(decisión de producto, 1-oct-2026)*.

- **Lo que ve el hincha lo pone la comercializadora.** Ella envía el documento y el nombre que
  capturó, y recibe sí o no con un código de motivo. Es una **consulta ciega**: nunca ve el expediente.
- **Nosotros construimos y operamos todas las superficies** del SVN, incluido el portal de integración
  de las comercializadoras.
- **Los derechos de la persona** (ver su estado) van en un portal propio, porque la comercializadora
  no conoce el motivo de un no.

---

## Mapa de superficies

Agrupadas por quién las opera. **Origen:** *Del demo* son las que trajo Mindeporte en su demo, y
nosotros las ampliamos; *Nuestra* son las que identificamos nosotros. Todas las construimos y operamos nosotros.

| # | Superficie | Quién la usa | Dispositivo | Cuándo | Origen |
|---|---|---|---|---|---|
| **Estado · Mindeporte** |||||
| 1 | **Registro de medidas correctivas** · *Parte 1* | Profesional del IVC | Web de escritorio | Continuo, con cada oficio de entrada | **Del demo** · *Panel Mindeporte*; sumamos el registro completo, historial y reserva de menores |
| 2 | **Entidades deportivas y comercializadoras** | Clubes y entidades (reportan); Mindeporte (homologa) | Web de escritorio | Cada semestre, y después de cada evento | **Del demo** · *Panel Mindeporte*, segunda tabla; sumamos la vista de la entidad y sus reportes de incidentes |
| 3 | **Monitor PMU y auditoría** | Policía Nacional, Mindeporte, supervisor del evento | Pantallas del PMU y escritorio | El día del evento, y consulta posterior | **Del demo** · *Monitor en vivo*; sumamos filtros y vistas por rol |
| **Operación del evento** |||||
| 4 | **Backoffice de eventos** | Club u organizador, administrador del escenario | Web de escritorio | Semanas y días antes | **Nuestra** · en el demo los partidos vienen sembrados |
| 5 | **Acceso en puerta** | Operador de puerta; Policía con vista ampliada | Celular o tablet (web móvil); consola de escritorio en el torniquete | Horas antes y durante el evento | **Del demo** · *Control de acceso* y *SVN Móvil*; sumamos sin conexión, vista policial y aviso al PMU |
| **Integración** |||||
| 6 | **API del SVN y portal de integración** | Comercializadoras (equipos técnicos) | Sus sistemas; portal web | Al homologarse, y en cada venta | **Del demo** la API; **nuestro** el portal de integración y el ambiente de pruebas |
| 7 | **Componentes embebibles** | El hincha, dentro del canal de la comercializadora | Su web o app | Al registrarse, al comprar y al asignar titulares | **Nuestra** · *(decisión de producto)* |
| **Persona y soporte** |||||
| 8 | **Portal de la persona** | La persona | Web móvil | Cuando recibe un no | **Nuestra** |
| 9 | **Consola de soporte** | Soporte | Web de escritorio | Continuo, con pico antes del inicio de cada partido | **Nuestra** · *(decisión de producto)* |

> El **simulador de tiquetera** del demo (web y móvil) no es una superficie nuestra: representa el
> canal de venta de la comercializadora. Sirve para ver qué nos envía ella: evento, documento, nombre
> y localidad.

---

## 1 · Registro de medidas correctivas

**Parte 1 · lo que pide el IVC (HU-26.3).** Es la única superficie con una HU detrás; las otras ocho
son la Parte 2.

**Quién:** profesional del IVC (Mindeporte con permisos para registrar, revisar, modificar o consultar).
**En el demo:** tabla *Base centralizada de medidas correctivas* y el formulario *Radicar nueva medida
correctiva (oficio ER)*.

**Qué hace:**
- **Recibir los reportes de las entidades deportivas** y seguirlos hasta que deriven en medida o se archiven.
- **Radicar** una medida a partir del oficio de entrada, con los campos del registro oficial:
  infractor, representante legal si es menor, hechos y conductas del catálogo, sanción y radicados de GESDOC.
- **Consultar y buscar** por documento, nombre, ciudad o conducta.
- **Validar el registro** (Fuente 2): el profesional lo pasa de **Recibido** a **Validado**, o lo
  devuelve **Por subsanar** a la inspección de policía. Al validarse, la restricción pasa a **Activa**.
- **Ver los dos estados**: el del registro y el de la restricción (Inactiva, Activa, Cumplida), con los
  días que le quedan a la activa. Solo el primero lo mueve el profesional; el segundo se calcula.
- **Cargar en masa** con la plantilla, con reporte de inconsistencias, además del formulario individual.
- **Ficha única de la persona**, con todas sus restricciones y su historial, y control de duplicados.

**Lo que falta frente al demo:**
- El formulario del demo pide menos campos que el registro oficial: pasa de 41 a **55 campos** (Fuente
  2), con nombres y apellidos separados, dirección estructurada, equipos local y visitante, fecha del
  acto y el estado de registro. Faltan también representante legal completo, agravantes y los
  radicados de contabilidad y jurídica.
- **Historial** de cada medida y **correcciones** *(exploratorio)*.
- Los datos de menores con **reserva reforzada**: la tabla del demo los muestra igual que los de un adulto.

**Endpoints:** `GET/POST /api/sanciones`.

---

## 2 · Entidades deportivas y comercializadoras

**Quién:** los clubes y entidades deportivas reportan, y Mindeporte homologa. **En el demo:** tabla *Reporte semestral de
clubes e integración de tiqueteras*.

**Qué hace:**
- Cada club **carga en el SVN, por semestre,** qué comercializadora vende para su estadio.
- Mindeporte **condiciona la aprobación** a que esa comercializadora tenga la **certificación de
  interoperabilidad** activa con el SVN: pendiente → en pruebas → homologada.
- Al homologar, se emite la **llave de API** de producción.
- **Reportar incidentes** de sus eventos *(decisión de producto)*: persona, conductas del catálogo,
  descripción y evidencia. El reporte llega a la autoridad de policía y al IVC, y la entidad sigue
  su estado hasta que deriva en medida o se archiva. No bloquea por sí solo.

**Lo que falta frente al demo:**
- La **vista de la entidad deportiva**, para cargar su comercializadora y sus reportes de incidentes:
  en el demo solo existe la vista de Mindeporte.
- La **vigencia semestral**: qué pasa con una comercializadora cuando termina el semestre sin renovar.
- La **revocación** de una llave.

**Endpoints:** `GET /api/clubes`, `POST /api/clubes/homologar`.

El inventario y el reporte de ventas se expresan en **derechos de ingreso por sector**, no en boletas *(exploratorio, 16-oct-2026)*.

---

## 3 · Monitor PMU y auditoría

**Quién:** Policía Nacional en el PMU, Mindeporte y el supervisor del evento. **En el demo:** *Monitor
en tiempo real de transacciones*.

**Qué hace:**
- **Registro inmutable** de cada intento de compra o de ingreso: fecha, origen, endpoint, documento,
  resultado y detalle. Según el demo, es para la **Superintendencia de Industria y Comercio (SIC)**,
  Mindeporte y la Policía Nacional.
- **Alertas rojas**: cada intento de ingreso con medida vigente llega al PMU con la puerta y la hora.
- **Cola de avisos** *(decisión de producto, 16-oct-2026)*: quien entra con un antecedente (medida recién
  levantada, sanción cumplida, antecedente por agresión, posible riesgo) genera un aviso silencioso, con
  causa, puerta y hora, que la autoridad de seguridad marca como revisado. No es una alerta, no bloquea y
  el operador no lo ve (detalle en `desing-views/03-monitor-pmu.md`).
- **Indicadores**: medidas en la base, derechos de ingreso, validaciones aprobadas y bloqueos en puerta.

**Lo que falta frente al demo:**
- **Filtrar por evento, puerta y color**, y ver solo los rojos.
- **Separar las vistas por rol**: la Policía necesita las alertas y el supervisor, el flujo por puerta.
- La **vista del club**: la auditoría integral de sus propios eventos.

**Decisiones de producto, 29-sep-2026** *(decisión de producto)*:
- **Monitor PMU y Auditoría son dos apps separadas**, cada una con su lista de eventos y su vista interna
  (tablero / registros); no hay selector que las una. Se entra a cada una desde el gate.
- **La Policía no toma la alerta: la asigna.** Desde la alerta se abre un modal con la información de la
  puerta (flujo, ingresados, avisos, rojos) y los agentes ordenados por cercanía; a los elegidos les llega la
  notificación y la alerta deja de sonar en el PMU. Sigue *Nueva* hasta que un agente la toma; ahí pasa a
  *En atención*. Si un agente la toma antes de que se asigne, pasa directo a *En atención* y el modal avisa.
- **La auditoría usa términos de lo que pasó**, no de colores: *Entró*, *Entró con aviso*, *No entró · sin
  derecho de ingreso*, *No entró · medida* (y las demás causas del rojo operativo).

**Endpoints:** `GET /api/transacciones`, `GET /api/info`.

---

## 4 · Backoffice de eventos *(nueva)*

**Quién:** el club u organizador y el administrador del escenario. **En el demo:** no existe; los
cuatro partidos vienen sembrados en la base.

**Qué hace:**
- Escenario, sectores (tribunas), puertas y puestos.
- Crear el evento y el partido, dentro de su competencia.
- **Configurar el evento**: sectores habilitados o cerrados, sector visitante, sillas bloqueadas,
  plazo de asignación y partido sin hinchada visitante.
- **Asignar cada torniquete a un partido**: en el demo se elige a mano en la puerta.
- Repartir el cupo entre comercializadoras homologadas.

---

## 5 · Acceso en puerta

**Quién:** el operador de puerta. **En el demo:** *Consola de control de acceso* (escritorio) y la
pestaña *Control de acceso* de *SVN Móvil*.

**Qué hace** *(decisión de producto, 16-oct-2026: la puerta revisa el documento, no la boleta)*:
- **Configurar el torniquete** para un partido, o dejar la detección automática.
- **Leer el documento**, con la cámara (guía *Escanee el documento*, linterna y zoom): la cédula digital
  (QR o MRZ) o la tradicional (PDF417 o reverso); o **digitarlo**, con tipo de documento, borrar, longitud
  mínima y el mensaje *No encontramos ese documento*. La boleta no se lee.
- **Cruzar el documento con su derecho de ingreso** (documento + evento + sector): partido de ese
  torniquete, sin medida vigente, sin ingreso previo y puerta de su sector.
- **Comparar la foto impresa del documento** con la persona. Si no coincide, *No es la persona*: rojo
  operativo *Posible cédula prestada*. No hay rostro.
- **Huella, como módulo** *(exploratorio, 16-oct-2026)*: según el modo del evento (Apagada · Opcional ·
  Obligatoria), tras un verde candidato del documento se lee la huella contra la Registraduría en línea.
  Confirma quién es, nunca decide si puede entrar; en *Obligatoria* hay siempre la salida *No puede dar
  huella*. Sin red no hay huella (contingencia). Detalle en `desing-views/05-acceso-puerta.md`.
- **Responder con dos colores**: verde entra; rojo operativo (*sin derecho de ingreso a este partido*,
  *ya ingresó*, *puerta equivocada* con *Diríjase a la Puerta X*, *posible cédula prestada*) no entra y
  **el operador elige si llama a la Policía**; rojo por medida no entra y **alerta al PMU**.
- **Los antecedentes no son un color**: la persona entra con verde y el PMU recibe un **aviso silencioso**.
- Mostrar el estado de conexión (*en línea*).

**Lo que falta frente al demo:**
- El **modo sin conexión** con el paquete del evento *(decisión de producto)*: el demo solo muestra "en línea".
- La **vista policial** *(decisión de producto)*: el demo dice "remitir al PMU", pero no da a la
  Policía una vista con el detalle. Mostraría medidas vigentes y cumplidas con sus conductas,
  reincidencia, afinidad y alertas de la validación, **sin un puntaje único de peligrosidad**.
- **El aviso al PMU** *(decisión de producto, 16-oct-2026)*: reemplaza al amarillo. La persona entra y el
  sistema avisa al PMU y a la vista policial, con la causa, la puerta y la hora. Se registra en la
  auditoría. En el demo el amarillo bloqueaba con un mensaje.
- El **contrato del gateway** para torniquetes de terceros *(decisión de producto)*: primero la app
  web móvil; el contrato se publica desde el día uno.

**Endpoints:** `POST /api/v1/estadio/validar-ingreso`, `POST /api/v1/estadio/escanear-documento`.

---

## 6 · API del SVN y portal de integración

**Quién:** los equipos técnicos de las comercializadoras. **En el demo:** la API existe, y la *Auditoría
de interoperabilidad (consulta ciega)* del simulador muestra la traza de cada consulta.

**Qué hace:**
- **Validar al aficionado** antes de vender: documento, nombre, evento y cantidad. Responde autorizado
  con **token del SVN**, o denegado con código de motivo.
- **Registrar el ingreso** con su token: documento del titular, evento y sector. La silla no viaja, es de la comercializadora.
- **Versión v2** con los nombres nuevos (`/ingresos`, `YA_TIENE_INGRESO`); la **v1 queda en desuso y se mantiene como alias** *(exploratorio)*.

**Lo que falta frente al demo** *(nueva)*:
- Un **portal de integración**, que construimos y operamos nosotros, con la documentación, el **ambiente de pruebas** (el estado *en pruebas*
  de la homologación lo necesita), la gestión de llaves y la **traza de sus propias consultas**.
- Los endpoints de validación por titular (consulta 2), revalidación al pagar (consulta 3) y transferencia *(decisión de producto)*.

**Endpoints:** `POST /api/v1/svn/validar-aficionado`, `POST /api/tiquetera/comprar`.

---

## 7 · Componentes embebibles *(decisión de producto)*

**Quién:** el hincha, dentro del canal de la comercializadora. **En el demo:** no existen.

- **"Ingresar con [plataforma]"**: registro e inicio de sesión con el @usuario compartido entre comercializadoras.
- ~~Validación con foto~~: **retirada el 16-oct-2026** (el rostro no vuelve). La **huella no se captura en la compra**: la comercializadora nunca toca biometría ni hay lector en la compra web; la huella solo se verifica en la puerta (ver `dominio.md`, *Identidad: documento y, opcionalmente, huella*).

- **Titulares de la compra** y **Validación de documento**: el hincha asigna cada ingreso por documento y nombre, y el widget coteja el documento sin foto ni huella. Después de pagar ve *Tu ingreso a [partido]* y puede cambiar el titular hasta el inicio del partido.

---

## 8 · Portal de la persona *(nueva)*

**Quién:** la persona. **En el demo:** no existe.

- Ver su estado: si tiene una medida vigente y hasta cuándo.
- Saber ante qué autoridad controvertirla *(exploratorio: los documentos no cubren la apelación)*.
- Administrar sus consentimientos y sus vínculos con comercializadoras *(decisión de producto)*.

Cuando la comercializadora recibe un no, solo le muestra un enlace al hincha:
*"No es posible continuar. Consultá tu estado en [portal]"*.

- Ver sus ingresos, con el nombre *Tu ingreso a [partido]* (no «entrada» ni «boleta»): el documento y el sector con que entra.
- **Mi ingreso: cómo se verificó** *(exploratorio)*: en qué eventos se verificó con huella y el resultado (sin imagen ni puntaje). Solo si hubo **enrolamiento propio** (hipótesis B, no es el diseño base) la persona ve su huella registrada y puede **revocarla**; la revocación se aplica desde el siguiente paquete del evento y no impide entrar (pasa a *No puede dar huella*). La ficha del evento publica si un sector pide huella, para saberlo **antes** de comprar. Autorización expresa y plazos de retención: **a verificar con jurídica**.

---

## 9 · Consola de soporte *(decisión de producto)*

**Quién:** soporte. **En el demo:** no existe.

- Atender reclamaciones y transferir el titular de los ingresos congelados.
- Consultar la traza de un ingreso: validación, token, asignación e ingreso.

---

## Quién ve qué

| Dato | IVC | Policía (PMU, vista policial) | Club / organizador | Comercializadora | Operador de puerta | Persona |
|---|---|---|---|---|---|---|
| Expediente de la medida (hechos, conducta, acto) | Sí | Sí | No | **No** | No | La suya |
| Reportes de incidentes | Todos | Todos | Los suyos, con su estado | No | No | No |
| Datos de menores | Con reserva reforzada | Con reserva reforzada | No | No | No | Su representante legal |
| Resultado sí o no y código de motivo | Sí | Sí | No | Sí | Semáforo | La suya |
| Documento de la persona | Sí | Sí | No | El que ella envió | El que lee | El suyo |
| Afinidad *(decisión de producto)* | Sí | Sí | No | No | No | No |
| Aviso al PMU *(decisión de producto, 16-oct-2026)* | No | Sí, y lo marca revisado | Conteo de sus eventos | No | **No** | No |
| Auditoría de transacciones | Integral | Integral | Integral de sus eventos | Sus consultas | Sus decisiones | No |

Cada consulta a un expediente o a datos de menores queda auditada.

---

## Recorridos por rol

| Rol | Recorrido |
|---|---|
| **Profesional del IVC** | Recibe el oficio (GESDOC) → registra la medida (1) → la valida o la devuelve por subsanar → al validarla queda activa y se cumple sola |
| **Entidad deportiva** | Carga su comercializadora cada semestre (2) → configura escenario, partido y torniquetes (4) → reporta los incidentes de su evento (2) → sigue si derivaron en medida |
| **Mindeporte** | Revisa el reporte → certifica la comercializadora en pruebas (6) → la homologa y entrega la llave (2) |
| **Comercializadora** | Se integra en pruebas (6) → homologada, consulta el SVN en cada venta (6) → registra el ingreso con token |
| **Hincha** | Compra en la comercializadora → si recibe un no, consulta su estado (8) → presenta su documento en la puerta (5) |
| **Operador de puerta** | Configura el torniquete para su partido (5) → lee o digita el documento → verde entra; ante un rojo operativo decide si llama a la Policía |
| **Policía** | Sigue el monitor en el PMU (3) → recibe cada rojo con la puerta y la hora → revisa la cola de avisos → atiende en la puerta |

---

## Línea de tiempo

| Momento | Qué pasa | Superficies |
|---|---|---|
| Cada semestre | El club carga su reporte; certificación y homologación de la comercializadora | 2, 6 |
| Continuo | Radicación de medidas correctivas; vencimiento automático | 1 |
| Semanas antes | Escenario, evento, torniquetes, cupos, plazo | 4 |
| Días antes | Venta con consultas al SVN (comprador, titulares y pago); transferencias; reclamaciones | 6, 7, 8, 9 |
| Horas antes | Cierran las transferencias al inicio del partido; cada puerta queda lista y configurada | 4, 5 |
| Durante el evento | Ingresos con semáforo de dos colores; rojos y avisos al PMU | 3, 5 |
| Después del evento | Auditoría; la entidad reporta incidentes; la autoridad decide y el IVC radica | 1, 2, 3 |

---

## Qué construir primero

El demo ya prueba el recorrido central. Para pasar de demo a producto, por orden:

1. **Registro de medidas (1)** con el registro oficial completo, historial y reserva de menores.
2. **API del SVN (6)** con llaves por comercializadora homologada y consulta ciega.
3. **Acceso en puerta (5)** con semáforo de dos colores, torniquete por partido y alertas al PMU.
4. **Monitor PMU (3)** con filtros, vistas por rol y la cola de avisos.
5. **Clubes y comercializadoras (2)**, con la vista del club, y el portal de integración (6).
6. **Backoffice de eventos (4)**, para dejar de sembrar partidos.
7. Después: portal de la persona (8), soporte (9) y componentes embebibles (7).

*Este orden es una propuesta para discutir.*

---

## Flujo de la demo (30-sep-2026)

Pedido del cliente: la demo se cuenta en este orden. Los números de superficie no cambian.

| Paso | Qué se muestra | Superficie del modelo | Ruta del prototipo |
|---|---|---|---|
| 1 | Organizar el evento | 4 · Backoffice de eventos | `#/backoffice` |
| 2 | Comprar y asignar ingresos *(en diseño)* | 6 y 7 · API y componentes embebibles | `#/compra` (reservada) |
| 3 | Control de acceso en puerta | 5 · Acceso en puerta | `#/puerta` |
| 4 | App de la Policía | 3 · Monitor PMU | `#/policia` |
| 5 | IVC | 1 · Registro de medidas | `#/medidas` |
| 6 | Auditoría (transversal, al final) | 3 · Auditoría | `#/auditoria` |

Fuera del flujo, como *próximamente*: 2 · Entidades y comercializadoras, 6 · portal de integración técnico,
8 · Portal de la persona y 9 · Consola de soporte.

---

## Decisiones de superficies (28-sep-2026)

- **El club carga su reporte semestral** en el SVN (superficie 2).
- **Las entidades deportivas reportan incidentes** a la autoridad de policía y al IVC y se alinean con lo que decidan; no tienen una base propia que bloquee.
- **La auditoría es integral** para quien la ve: Mindeporte y Policía, toda; el club, la de sus eventos.
- **El operador ve dos colores** *(16-oct-2026)*. Los antecedentes no bloquean: la persona entra y se avisa al PMU. **El rojo operativo** (problema del documento en esta puerta) no entra y el operador elige si llama a la Policía; **el rojo por medida** no se puede autorizar.
- **La puerta revisa el documento, no la boleta** *(16-oct-2026)*. **Biometría: solo huella, modular** *(exploratorio, 16-oct-2026)*: no hay rostro ni confianza de identidad; la huella es un módulo por evento (Apagada · Opcional · Obligatoria) que confirma quién es y nunca decide si puede entrar.
- **Nosotros construimos y operamos todo**, incluido el portal de integración.
