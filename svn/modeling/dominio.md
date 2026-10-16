# Modelo de dominio · Sistema de Validación Nacional (SVN)

Control de acceso nacional a eventos deportivos, principalmente fútbol profesional, bajo el
**Decreto 1622 de 2022**. Es un módulo transaccional del **SUID**, en el IVC del Ministerio del
Deporte. Gestiona el flujo ingreso-persona completo: desde antes de la compra hasta el ingreso al
estadio. Funciona como producto digital y como API.

> **Parte 1 · lo que pide el IVC (Fuente 2, 30-sep-2026).** Es la **gestión de infractores**
> (HU-26.3): registrar, validar y dar seguimiento a las medidas correctivas en el SUID. Es el módulo 1
> y la superficie 1. **Hasta ahí pide el IVC y ahí está su interés.** Todo lo demás (compra, boletería,
> puerta, PMU, homologación, portal de la persona) es la **Parte 2**: sale de la Fuente 1 (demo SVN) y
> de nuestras decisiones de producto, y todavía no tiene una HU del IVC detrás.
>
> Estado: **v1.1** (30-sep-2026). Las fuentes de verdad están en [`fuentes.md`](fuentes.md): donde
> contradicen este modelo, ganan ellas. Lo que no cubren va marcado *(decisión de producto)*, y lo
> que todavía no es decisión, *(exploratorio)*.

---

## La pregunta central

**¿Esta persona puede estar en este evento, en este lugar?**

Todo el sistema existe para responder esa pregunta o para cumplir su respuesta. Se hace en cuatro
puntos de validación:

| # | Validación | A quién se valida |
|---|---|---|
| 1 | ¿Puede comprar? | Al comprador: identidad, sanción vigente y límite de ingresos |
| 2 | ¿Puede recibir este ingreso? | Al titular: identidad, sanción vigente, un ingreso por evento, afinidad y sector |
| 3 | ¿Puede transferir? | A quien entrega y a quien recibe |
| 4 | ¿Puede entrar? | Al titular, en la puerta y con el estado de ese momento |

Para la comercializadora es una **consulta ciega**: solo recibe **sí o no** y un código de motivo
genérico, nunca el expediente ni los hechos.

---

## Módulos

| # | Módulo | De qué se encarga |
|---|---|---|
| 1 | **Medidas correctivas** · *Parte 1* | La base nacional de personas con prohibición de ingreso, en el SUID-IVC |
| 2 | **Identidad y elegibilidad** (el core) | Personas, verificación con la Registraduría, afinidad y la decisión de sí o no |
| 3 | **Escenarios y eventos** | Escenario, sectores, puertas, puestos, competencia, evento, partido y su configuración |
| 4 | **Boletería y asignación** | Comercializadoras homologadas, cupos, órdenes, derechos de ingreso, titulares y transferencias |
| 5 | **Control de acceso** | Dispositivos, validación en la puerta con semáforo, ingresos y operación sin conexión |

---

## 1 · Medidas correctivas · Parte 1

> **Este módulo es todo lo que pide el IVC** (HU-26.3). Lo que sigue (módulos 2 a 5) es la Parte 2.

### Hasta dónde llega la Parte 1

| Está en la Parte 1 | Queda fuera (lo dice la HU) |
|---|---|
| Registrar decisiones en firme: individual, masivo o por integración | Imponer comparendos o medidas, audiencias y recursos |
| Validar la completitud formal, sin reabrir la decisión de la autoridad | El Formulario Único de Comparendo |
| Dos estados separados: el del registro y el de la restricción | Cobro, recaudo o contabilidad de las multas |
| Ficha única por persona, con historial; sin duplicados | Vender, emitir o transferir boletería |
| Vencimiento automático y auditoría de cada cambio | Validar el ingreso físico al estadio |

**Lo que la Parte 1 no resuelve y la Parte 2 sí:** el **reporte de la entidad deportiva** (abajo), la
consulta ciega, el token, la puerta y el semáforo. La HU dice que el sistema "valida el acceso", pero
esa validación no es parte de ella.

### Quién emite y quién registra

| Actor | Papel |
|---|---|
| **Autoridades de policía** (inspecciones de policía, alcaldías) | **Emiten** la medida correctiva mediante un acto administrativo, en audiencia |
| **IVC del SUID (Mindeporte)** | **Registra** la medida a partir del oficio de entrada (radicado en GESDOC) y la mantiene |
| **Policía Nacional** | **Consulta**: recibe las alertas rojas de la puerta en el PMU y ve el detalle en la vista policial |
| **Entidades deportivas** (clubes y entidades formales) | **Reportan** a la autoridad de policía y al IVC los incidentes de sus eventos *(decisión de producto)* |

Hay **una sola base** de medidas correctivas, en el SUID-IVC, y **solo una medida correctiva
bloquea**. Las entidades deportivas no tienen una base propia: su camino es reportar y alinearse
con lo que decidan la autoridad de policía y el IVC.

### Reporte de entidad deportiva *(decisión de producto)*

Los documentos no lo cubren, pero dejar fuera a las entidades deportivas sería un error: son las
que ven los incidentes en sus estadios, a través de su logística.

- **Qué reporta:** la persona (tipo y número de documento), el evento, la fecha, las **conductas del
  catálogo** de la Ley 1453, la descripción y la **evidencia** (informe de logística, video, fotos).
- **A quién llega:** a la **autoridad de policía** competente, que decide si abre el procedimiento,
  y al **IVC**, que sigue el caso.
- **No bloquea por sí solo.** Un reporte nunca niega una compra ni un ingreso: solo lo hace la
  medida correctiva que resulte del procedimiento.
- **Estados:** enviado → recibido → en trámite → **derivó en medida** (queda enlazado a la medida
  que la autoridad emitió) o **archivado** (con su motivo).
- **La entidad ve** el estado de sus propios reportes, y si derivaron en medida. No ve expedientes ajenos.
- **Se alinea:** en sus estadios aplica las medidas vigentes de la base nacional, igual que todos.

### La medida correctiva

Es una **prohibición de ingreso a escenarios deportivos**, por las conductas de la Ley 1445 de 2011
(arts. 14 y 15), modificada por la Ley 1453 de 2011 (arts. 97 y 98).

- **Vigencia:** empieza el día siguiente a la **fecha de constancia de ejecutoria** y dura los
  **meses de sanción**. El fin de vigencia se calcula, no se digita.
- **Alcance: nacional.** Rige en todos los escenarios del país donde haya espectáculos deportivos
  profesionales con público (Decreto 079 de 2012, art. 6, par. 4).
- **Dos estados separados** (HU-26.3):
  - **Registro y seguimiento** (lo maneja el profesional del IVC): **Recibido** (radicado y recibido)
    → **Validado** (cumple los requisitos) o **Por subsanar** (no cumple y se devuelve a la
    inspección de policía).
  - **Restricción** (lo que bloquea): **Inactiva** mientras el registro está Recibido o Por subsanar;
    **Activa** en cuanto queda Validado; **Cumplida** un día después del fin de vigencia, en automático.
- **Solo la restricción Activa bloquea.** Una medida Recibida o Por subsanar todavía no produce efectos.
- Al cumplirse, la persona queda habilitada sola, sin trámite. **Nada se elimina**: la cumplida queda
  inactiva, con su soporte y su historial.
- Puede llevar **multa** (valor de la sanción, en pesos). Su cobro no es parte del SVN.

### Reglas del registro (Fuente 2)

- **Mínimo 6 meses**, dentro del rango de la conducta: art. 97 (conductas 1 a 6), 6–36; agresión
  física, 36–60; agresión verbal, sin restricción la primera vez y 12–36 si reincide; daño, 24–48; con
  agravante, 12–72.
- **Fecha de los hechos:** ni actual ni futura, y anterior a la del acto administrativo.
- **Menor de edad:** se calcula a la **fecha de los hechos**.
- **Duplicados:** no se acepta otro registro equivalente (misma persona, mismo acto y mismo periodo);
  una persona puede tener varias restricciones distintas.
- **Origen de la obligación:** obligatorio, uno o varios. **Agravantes:** opcionales.
- **Competición y equipos:** el listado de local y visitante depende de la competición (36 clubes de
  DIMAYOR); "Otro" deja registrar clubes extranjeros a mano.
- **Carga masiva:** valida estructura, obligatoriedad y consistencia, y devuelve un reporte de inconsistencias.

### Entidades

- **Medida correctiva**, con los grupos de campos del registro oficial (detalle en `fuentes.md`):
  - **Infractor:** tipo y número de identificación, nombre, residencia, contacto, fecha de nacimiento,
    edad y si es menor (calculados), sexo.
  - **Representante legal:** obligatorio si el infractor es menor de edad (Ley 1098 de 2006).
  - **Hechos:** fecha, evento, competición, ciudad, **conductas** (catálogo, selección múltiple),
    **agravantes** y descripción breve.
  - **Sanción:** fecha y número del acto administrativo, fecha de ejecutoria, meses, fin de vigencia,
    valor, estado de la restricción.
  - **Gestión interna:** fecha y radicado de entrada, respuesta, radicados de contabilidad y jurídica
    (todos de GESDOC), profesional responsable del IVC, **estado de registro y seguimiento** y observaciones.
  - Son **55 campos** en 6 bloques (Fuente 2); la dirección es estructurada, urbana o rural.
- **Catálogo de conductas:** art. 97 (6 conductas), art. 98 (3) y agravantes (3).
- **Historial:** cada registro y cada cambio queda con quién, cuándo, hora, **estado anterior y estado
  nuevo**, y con qué soporte. No se edita. La persona tiene una **ficha única** con todo su historial.
- **Reporte de entidad deportiva:** persona, evento, conductas, descripción, evidencia, estado y, si
  derivó en medida, el enlace a ella.

### Menores de edad

Un menor **puede ser sancionado**. Su registro exige el representante legal y tiene **reserva
reforzada**: sus datos solo los ven los roles que los necesitan, y cada consulta queda auditada.

### Estados sugeridos *(decisión de producto)*

La Fuente 2 ya definió los dos ejes de estado (arriba). Sugerimos sumar estos, y mientras no se
aprueben, solo la restricción **Activa** bloquea:

| Estado sugerido | ¿Bloquea? | Para qué | Qué haría falta |
|---|---|---|---|
| **Anotación** | No | Dejar una observación, como un reporte archivado | Nada: es interna del IVC |
| **Advertencia** | No, pero es antecedente | Llamado de atención previo; cuenta para la reincidencia | Definir quién la emite |
| **Reporte en trámite** | No | Reporte de una entidad deportiva que la autoridad aún no decide | Ya está en el modelo |
| **Levantada** | Levanta el bloqueo antes de tiempo | Recurso o revocatoria del acto | Un nuevo acto administrativo |
| **Veto sin fecha** | Sí, indefinido | Reincidencia grave | Soporte legal: hoy la ley fija meses |

### Correcciones y levantamiento anticipado *(exploratorio)*

Los documentos no cubren cómo se corrige un registro con error o se levanta una medida antes de su
fin de vigencia. Si hace falta, será un trámite formal del IVC con su soporte (un nuevo acto
administrativo), y queda en el historial.

---

## 2 · Identidad y elegibilidad (el core)

### Regla dura

**Un derecho de ingreso = una persona = un documento**, obligatorio y verificado, para cada evento. El documento
es **tipo más número**. Tipos válidos: cédula de ciudadanía (CC), cédula de extranjería (CE),
tarjeta de identidad (TI), pasaporte, PPT, PEP y RUMV (Decreto 1622 de 2022).

### Verificación con la Registraduría

Cada documento se verifica contra el **Archivo Nacional de Identificación (ANI)** de la Registraduría.
Es un **servicio paralelo y compartido**, tal como viene en el demo: lo consulta cualquier parte del
sistema que necesite validar un documento (la venta, la asignación, la puerta, la radicación de una
medida, el reporte de una entidad deportiva y el portal de la persona).

- **Existe y está vigente.** Una cédula **cancelada** (por muerte o por doble cedulación) se deniega.
- **Nombre oficial.** El nombre que envía la comercializadora se coteja con el del ANI. Un nombre
  distinto es posible suplantación y se deniega; uno incompleto (una sola palabra) se pide completo.

### Entidades

- **Persona**: tipo y número de documento, verificados con el ANI. Es la llave de todo el sistema.
- **Cuenta de usuario** *(decisión de producto)*: la persona dentro de la plataforma, con un
  **@usuario** único (ej. `@junattt`), para identificarse entre comercializadoras. La vinculación con
  una comercializadora requiere su consentimiento.
- **Nosotros no le enviamos identidad a la comercializadora.** Ella nos envía lo que ya tiene
  (el documento y el nombre que capturó, o el @usuario) y nosotros respondemos sí o no.
- **Revocar el vínculo es un trámite formal, sin cortes a mitad de camino** *(decisión de producto)*.
  Desde la solicitud no se inician operaciones nuevas; las que están en curso terminan normalmente,
  y la revocación se hace efectiva cuando se cierra la última.
- **Biometría: solo huella, modular** *(exploratorio, 16-oct-2026)*: el SVN **no guarda ni compara
  rostro**, y no hay confianza de identidad ni foto de referencia. La identidad se sostiene con el
  documento y el ANI; en la puerta, con la foto impresa del documento que el operador mira y,
  opcionalmente, con la **huella** contra la Registraduría en línea (el SVN no guarda plantillas; ver
  *Identidad: documento y, opcionalmente, huella*).
- **Historial de asistencia**: se construye con los ingresos reales (módulo 5).
- **Datos cruzados** *(decisión de producto)*: señales explicables que salen del historial de la
  persona. **El club afín es una de ellas**, no la única:
  - **Club afín**, con su certeza (por ejemplo, Club A, 86%). La persona no declara su club.
  - **Tribuna habitual** (por ejemplo, la de su barra).
  - **Frecuencia de asistencia** (partidos en los últimos meses).
  - **Viajes de visitante.**
  - **Con quién va:** si compra o ingresa junto a personas que tienen una medida vigente.
  - **Intentos fallidos en la puerta.**
  Solo el **club afín** alimenta una regla de acceso (partidos sin hinchada visitante). Las demás
  informan a la vista policial y al PMU.
- **Regla de elegibilidad**: sanción vigente, documento vigente, límite de ingresos, un ingreso por
  persona por evento, sector visitante, partido sin hinchada visitante.
- **Decisión de elegibilidad**: quién preguntó, sobre quién, para qué evento y en qué punto de
  validación, con el resultado, el **código de motivo** y el detalle interno. Cada decisión queda auditada.

### Códigos de motivo

La comercializadora recibe el resultado y un código de motivo genérico, sin el expediente:

| Resultado | Código de motivo | Cuándo |
|---|---|---|
| Autorizado | — | Pasa todas las reglas; se emite un token del SVN |
| Denegado | Límite de venta excedido | Pide más de 5 ingresos por el canal normal |
| Denegado | Medida restrictiva vigente | Tiene una medida correctiva vigente |
| Denegado | Documento no válido | No existe en el ANI o está cancelado *(nombre del código por definir)* |
| Denegado | Identidad no coincide | El nombre no corresponde al documento *(nombre del código por definir)* |

### Salvaguardas de la afinidad *(decisión de producto)*

Negar un acceso a partir de un perfil inferido es perfilamiento automático. Por eso:

- La afinidad tiene tres resultados: **afín**, **no afín** o **no concluyente**. Si no es concluyente, se deja pasar.
- El motivo queda en la auditoría y la persona puede apelar.
- La comercializadora sigue viendo solo sí o no.

### Identidad: documento y, opcionalmente, huella *(exploratorio, 16-oct-2026)*

El 16-oct-2026 se retiró la **confianza de identidad** y el módulo biométrico completo. **Vuelve solo
la huella**, como módulo modular y desacoplable. La puerta no pide más o menos verificación según un
porcentaje: **el documento sigue siendo la llave**, y la huella es un refuerzo configurable por evento.

- **Quién es:** lo dice el ANI al verificar el documento.
- **Si la persona es la del documento:** lo juzga el operador con la **foto impresa del documento**.
  Si no coincide, toca *No es la persona* y sale un rojo operativo (*Posible cédula prestada*), o, con
  el módulo en *Opcional*, puede salir de la duda leyendo la huella.
- **Qué sigue descartado:** el **rostro**, la **confianza de identidad** (ni porcentaje por persona), el
  estado azul «Verificar» y la **foto de referencia** de la compra. La foto impresa sigue siendo la
  primera verificación y la vía alternativa en todos los modos.

**Modos** *(el modo se configura por evento, con excepción por sector; nunca por puerta, salvo la
contingencia «lector sin servicio» que activa el supervisor)*:

| Modo | Quién lo enciende | Efecto |
|---|---|---|
| **Apagada** | Es el valor de todo evento sin lectores declarados por el administrador del escenario | Flujo de documento + foto impresa, sin cambios |
| **Opcional** | El **organizador**, solo si el administrador del escenario declaró lectores en el sector | La huella solo aclara una duda (*No es la persona*) o se ofrece; no cambia el semáforo |
| **Obligatoria** | **Mindeporte (IVC)**, a pedido del organizador, con el campo **«Norma que lo habilita»** *(a verificar con jurídica)*; el organizador solo no puede | El verde exige huella o una excepción documentada; no hay color nuevo |

**Valor por defecto: *Opcional* en eventos con lectores y *Apagada* en el resto.** *Obligatoria* nunca
es el defecto: la Ley 1581 y el Decreto 1377 de 2013 prohíben condicionar una actividad a la entrega de
datos sensibles salvo que una ley lo exija *(artículos exactos y si el Decreto 1622 de 2022 o la Ley
1270 de 2009 la habilitan: **a verificar con jurídica**)*.

**Contra qué se compara** *(hipótesis)*: la **Registraduría en línea** como referencia. El SVN envía la
plantilla capturada en el momento, recibe *coincide / no coincide* y la **descarta** en el equipo. **Qué
se guarda:** solo el resultado (coincide, no coincide, ilegible, exceptuada con motivo, sin referencia o
contingencia), los intentos, el lector y la transacción. **Qué nunca se guarda:** imagen, plantilla ni
puntaje. El enrolamiento propio (guardar la plantilla en el primer ingreso) queda como hipótesis para
un modo *Obligatoria* sin conexión y **no está en el diseño base**: obligaría al SVN a custodiar una
base biométrica. El enrolamiento en la compra queda descartado: la comercializadora nunca toca
biometría.

**Límite de lecturas: 3.** La 2.ª y la 3.ª piden otro dedo. La calidad y la coincidencia se cuentan por
separado: una lectura *ilegible* no cuenta como «no coincide»; tres ilegibles llevan a la excepción
*No puede dar huella*, nunca al rojo. Solo tres lecturas **legibles que no coinciden** dan el rojo
operativo.

**Salvaguardas de la huella** *(exploratorio)*:

1. **Nunca puntúa:** el resultado es coincide, no coincide o ilegible, sin porcentaje a la vista ni guardado.
2. **Nunca niega por sí sola**, salvo en modo *Obligatoria* con su norma declarada, y aun ahí con la vía alternativa.
3. **Nunca abre** lo que cierra una medida o la falta de derecho de ingreso.
4. **Todo queda auditado:** modo, resultado, intentos, lector, operador y motivo de la excepción.
5. **La persona puede apelar** un *no coincide* (vía soporte); la apelación revisa la auditoría, no una imagen, porque no hay imagen.

Medida correctiva (¿puede entrar?) y datos cruzados (¿qué dicen sus datos?) siguen siendo dos ejes
separados.

---

## 3 · Escenarios y eventos

```
Escenario
 └─ Sector (tribuna; numerado o de aforo libre)
     ├─ Puerta   (pertenece a un solo sector)
     └─ Puesto   (fila + silla) o cupo de aforo libre

Competencia → Evento → Partido
```

- **Escenario**, **sector**, **puerta** (cada puerta pertenece a un solo sector) y **puesto**.
- **Competencia**: por ejemplo, la Liga BetPlay Dimayor o la Copa Libertadores.
- **Evento**: lo que abre puertas y tiene aforo. Es a lo que da acceso un derecho de ingreso.
- **Partido**: la contienda deportiva dentro de un evento. Un evento puede tener varios partidos.
- **Configuración del evento**: toma la base del escenario y la ajusta para ese evento:
  - Por sector: habilitado, visitante, cerrado o con aforo reducido.
  - Por puerta: abierta o cerrada, su horario y **el partido para el que está configurado su torniquete**.
  - Por silla: bloqueada, con motivo (prensa, seguridad, dañada o reservada).
  - El plazo límite para asignar y transferir ingresos (módulo 4).
  - Si el partido es sin hinchada visitante (activa la regla de afinidad).

> **Nombres:** en Naowee Suite `venue` ya significa dos cosas (el escenario en venue-ms y la sede en
> catalog), y `zone` significa urbano o rural. No reutilizar ninguno de los dos para sector o puerta.

---

## 4 · Boletería y asignación

### Comercializadoras homologadas

- Cada **club** carga en el SVN, **por semestre**, qué comercializadora vende para su estadio.
- Mindeporte **homologa** esa comercializadora: **pendiente → en pruebas → homologada**. En pruebas
  trabaja contra un ambiente de pruebas; homologada recibe su **llave de API** de producción.
- Mindeporte **condiciona la aprobación** del reporte del club a que su comercializadora tenga la
  certificación de interoperabilidad activa.
- Solo una comercializadora homologada consulta el SVN en producción.

### Qué hace la comercializadora y qué hacemos nosotros

- **La comercializadora** vende por su canal: su página, su pasarela, el pago y su **comprobante de
  compra** son suyos. La **silla**, si el escenario es numerado, también es dato suyo: el SVN no la
  recibe ni la valida. Consulta el SVN en tiempo real antes de vender, asignar o transferir.
- **Nosotros** respondemos sí o no, registramos el **derecho de ingreso** y le entregamos el estado del
  escenario en vivo: disponibilidad por sector y avance de la venta *(decisión de producto)*.

### Derecho de ingreso *(decisión de producto, 16-oct-2026)*

Es lo que el SVN vende, registra y valida. **Nace al pagar** y se compone de **documento + evento +
sector**. No es la boleta: la boleta o comprobante es de la comercializadora y la puerta no la lee.
Al hincha se le dice *«Tu ingreso a [partido]»*; el modelo evita «entrada» y «boleta» como objeto
que valida el SVN.

### Límite de ingresos por aficionado

- **Máximo 5 por aficionado** (Decreto 1622 de 2022, art. 2.17.16, num. 7). El decreto habla de
  boletas; el SVN lo cuenta en derechos de ingreso comprados.
- **No hay compra de más de 5.** El SVN la deniega, y no se abre un canal especial.
- **Cada ingreso se asocia a una persona**: se compran hasta 5 y cada uno queda a nombre de un titular.
  Una misma persona no tiene dos derechos de ingreso al mismo evento.

### Propietario y titular *(decisión de producto)*

- **Propietario**: quien compró el ingreso y lo controla.
- **Titular**: la persona cuyo documento tiene el derecho, es decir, quien entra al estadio.

Se compran hasta 5 (un propietario, N ingresos), pero **cada ingreso tiene un solo titular**. El titular
se puede cambiar tras pagar, **hasta el inicio del partido**, y no hay paso de «Activar boletas»
*(exploratorio)*.

### Entidades

- **Comercializadora** y su **homologación** (club, estadio, semestre, estado, llave de API).
- **Cupo**: la parte del inventario del evento que tiene cada comercializadora, **en derechos de
  ingreso por sector** *(exploratorio)*.
- **Reserva**: bloquea el inventario mientras se paga y vence sola.
- **Orden**: la hace el comprador, que tiene que ser elegible, con el pago ya confirmado por la comercializadora.
- **Derecho de ingreso**: documento, evento, sector, titular y **token del SVN** que prueba que la
  venta pasó por la validación. Estado: vigente → usado | anulado | congelado.
- **Titular del ingreso** *(decisión de producto)*: la persona que lo va a usar, con tipo, número de documento y nombre. Se valida antes de pagar. Solo por documento por ahora; el @usuario queda para después.
- **Asignación**: el derecho ligado a su titular.
- **Transferencia**: un cambio de propietario o de titular, con su historial.

### Asignar es firme *(decisión de producto, D1-D3)*

Asignar es parte de la compra, **antes de pagar**. No hay aceptación del titular, ni «No voy», ni
estado «invitado» ni «sin titular» después de pagar.

1. El comprador se identifica (consulta 1) y elige la cantidad, de 1 a 5.
2. Asigna cada ingreso con tipo, número de documento y nombre del titular. **Se valida a cada titular**
   (consulta 2) al guardarlo.
3. **No se paga con un ingreso sin titular validado**: Pagar queda deshabilitado, con la razón.
4. Al pagar, la consulta 3 revalida al comprador y a todos los titulares, y emite un token por ingreso.
5. El nombre lo envía la comercializadora; el SVN nunca devuelve un nombre. Un no nunca trae su motivo.

Si el comprador también entra, ocupa un ingreso con su propio documento, ya validado («Yo también
voy»). Un mismo documento no se repite en la orden.

### Asignación a cargo (titular sin cuenta) *(exploratorio)*

Para quien no va a validar nada por su cuenta: un hijo, un adulto mayor, alguien sin celular.

- **El propietario asigna por documento y nombre**, declarando la relación. Queda como
  **responsable** de esa asignación.
- **La elegibilidad se valida igual**, contra el documento del titular.
- **Menores de edad:** el responsable tiene que ser su representante legal.
- **Flexibilidad por edad:** para menores de 14 años y adultos mayores (umbral configurable, entre 70
  y 80 años) se afloja **solo la verificación de identidad**. Las medidas correctivas aplican igual:
  un menor sancionado no entra.

### Reserva y plazo *(decisión de producto, D6)*

- **La reserva (9:42) empieza al pasar la consulta 1**, al entrar a cantidad y titulares, no en el
  pago. El reloj corre también en titulares; si vence, vuelve al evento con aviso.
- **Lo que no se paga vuelve al inventario**: no hay ingresos perdidos, porque no hay ingresos sin pagar.

### Transferencias y cierre *(decisión de producto, D4)*

Es **configurable por evento**, con un máximo: el inicio del encuentro.

- **Cambiar titular después de pagar es una transferencia**: se valida a los dos lados, hasta el
  inicio del partido. **Quien entrega y quien recibe** tienen que pasar la validación.
- **Cuando empieza el encuentro ya no se puede transferir nada.** Solo se puede entrar, incluso
  tarde, con un derecho de ingreso vigente.

### Estados del derecho de ingreso

Antes de pagar no hay derecho: hay una línea de la reserva con su titular validado. Con el pago nace
el derecho, **vigente** y con su token. Los documentos definen **emitida → ingresada**, o **anulada**.
El modelo los detalla así:

```
vigente (con titular y token) → usado (ingresó por la puerta)
        │
        ├──→ anulado    (su titular quedó con una medida)
        └──→ congelado  (su propietario quedó restringido)
```

### Si aparece una medida correctiva después de comprar

El efecto es **individual**:

| Situación | Resultado |
|---|---|
| Ingreso asignado a otra persona elegible | Sigue vigente |
| Ingreso asignado a la persona sancionada | Se anula |
| Ingresos no usados de un propietario sancionado | Se congelan: ya no puede transferirlos |
| Reclamación | **Soporte** puede transferir el titular de los ingresos congelados a otra persona elegible |

---

## 5 · Control de acceso

### Qué lee la puerta *(decisión de producto, 16-oct-2026: se revisa el documento, no la boleta)*

| Documento | Cómo se lee |
|---|---|
| Cédula digital | QR y zona de lectura mecánica (MRZ) |
| Cédula tradicional (amarilla) | Código PDF417 y OCR del reverso |
| Cualquiera | Número digitado a mano, con tipo de documento |

La boleta de la comercializadora **no se lee en la puerta**. Es el comprobante de la compra; lo que la
puerta consulta es el **derecho de ingreso**: documento + evento + sector, que nace al pagar.

### Validación en la puerta

Se valida **siempre contra el documento**:

1. Se lee el documento, escaneado o digitado.
2. Se busca su **derecho de ingreso** para **el partido configurado en ese torniquete**.
3. Se revisa que no tenga una medida correctiva vigente, que no haya ingresado ya y que la puerta sea
   de su sector.
4. El operador compara la foto impresa del documento con la persona; si no coincide, toca *No es la persona*.
   Si el evento tiene el módulo de huella *(exploratorio)*: en modo *Opcional* ese botón abre
   **«Verificar con huella»**; en modo *Obligatoria*, tras un verde candidato del documento aparece la
   lectura transitoria **«Ponga el dedo en el lector»**. **La huella se pide solo cuando el documento
   ya dio un verde candidato** (minimización del dato): primero documento, derecho y medida; después,
   quién es.
5. El resultado sale en **semáforo** (entra o no entra), y todo queda registrado.

La **huella confirma quién es; nunca decide si puede entrar**. No abre lo que cierra una medida o la
falta de derecho, y solo en modo *Obligatoria* puede detener un ingreso, siempre con la salida **«No
puede dar huella»**. La lectura es un **estado transitorio** (como *Validando*), no un tercer color.

### El semáforo

El operador solo ve **dos colores**. Los antecedentes que antes eran amarillos no se le muestran:
la persona entra y el **PMU** recibe un aviso.

| Color | Qué significa | Qué pasa |
|---|---|---|
| **Verde** | Entra: documento con derecho de ingreso a este partido y por esta puerta, sin ingreso previo y sin medida. Con el módulo de huella *(exploratorio)*: además, huella que coincide, huella exceptuada, documento sin referencia o contingencia, o módulo apagado | Se marca el derecho como usado. Si la persona tiene un antecedente (medida recién levantada, sanción cumplida, indicativos cruzados o posible riesgo), **entra igual** y se genera un **aviso silencioso al PMU** *(decisión de producto, 16-oct-2026)*. La excepción de huella en modo *Obligatoria* también genera un aviso silencioso |
| **Rojo operativo** | Problema del documento en esta puerta: *sin derecho de ingreso a este partido*, *ya ingresó*, *puerta equivocada* (se le indica la correcta) o *posible cédula prestada* (la foto no coincide o, con huella, **tres lecturas legibles no coinciden**) | No entra. **La Policía es opcional**: el operador elige si la llama, y queda registrado. No hay alerta automática al PMU *(decisión de producto, 28-sep-2026)* |
| **Rojo por medida** | Medida correctiva vigente | No entra y **se notifica al PMU** de la Policía Nacional. Nadie en la puerta lo puede autorizar |

### Entidades

- **Dispositivo**: tiene un tipo, está en una puerta y se configura para un partido.
- **Validación**: la persona, el método (escaneo o digitado), la puerta, la hora, el color, el motivo y si se notificó al PMU. Con el módulo de huella *(exploratorio)* suma el **modo** vigente y el **resultado de huella** (coincide, no coincide, ilegible, exceptuada con motivo, sin referencia o contingencia), los intentos, el lector y el operador. **Nunca una imagen, una plantilla ni un puntaje.**
- **Riesgo por afinidad** *(decisión de producto, 16-oct-2026)*: si el perfil de afinidad marca a una persona en riesgo para el partido, **entra** y el PMU recibe un aviso; la autoridad de seguridad decide allá si actúa. Es una **señal inferida, no una certeza**: se redacta en condicional (*posible riesgo*), **nunca niega el acceso**, queda en la auditoría y la persona puede apelar (ver *Salvaguardas de la afinidad*).
- **Aviso al PMU**: reemplaza al amarillo de la puerta. Es informativo (no una alerta) y lleva la causa, la puerta y la hora; llega a la cola de avisos del PMU y a la vista policial.
- **Decisión del operador**: en un rojo operativo, si llamó o no a la Policía, con el operador, la puerta y la hora.
- **Ingreso**: impide el doble ingreso y alimenta el historial de asistencia.

### Sin conexión (contingencia) *(decisión de producto)*

- Antes del evento, cada puerta descarga su **paquete del evento**: los documentos con derecho de
  ingreso en su sector y la lista de documentos con medida vigente.
- Las validaciones se guardan localmente y se sincronizan al volver la red. Los conflictos quedan
  marcados para revisión, y las alertas rojas se envían al PMU en cuanto hay red.
- **Sin red no hay huella** *(exploratorio)*: la huella se compara en línea con la Registraduría y
  ninguna plantilla viaja en el paquete. En modo *Opcional* el flujo sigue con el documento; en
  *Obligatoria* la puerta pasa sola a **contingencia** (sin pedir al supervisor, porque cayó la red de
  toda la puerta) y el ingreso queda *Sin conexión · sin huella · se sincroniza al volver*.

---

## Auditoría

Toda consulta queda como una **transacción** en un registro **inmutable**: fecha y hora, **origen**
(comercializadora, torniquete, registro del IVC), endpoint, documento, resultado y detalle. Lo usan
la Superintendencia de Industria y Comercio (SIC), Mindeporte y la Policía Nacional, y es la base del
monitor del PMU y de los reportes.

---

## Roles

| Rol | Qué hace |
|---|---|
| **Autoridad de policía** (inspección, alcaldía) | Emite la medida correctiva por acto administrativo |
| **Profesional del IVC** (Mindeporte) | Radica la medida en el SUID desde el oficio de entrada y gestiona sus radicados |
| **Policía Nacional** | Recibe las alertas rojas en el PMU y consulta en la vista policial |
| **Club o entidad deportiva** | Carga cada semestre su comercializadora; configura sus eventos; **reporta incidentes** a la autoridad de policía y al IVC y sigue su estado; ve la auditoría integral de sus eventos |
| **Mindeporte** (homologación) | Homologa comercializadoras y entrega sus llaves de API |
| **Comercializadora** | Consulta el SVN antes de vender, asignar y transferir; vende y cobra por su canal |
| **Comprador o propietario** | Tiene que ser elegible para comprar; compra hasta 5; asigna cada ingreso a su titular y, hasta el inicio del partido, lo cambia o transfiere |
| **Titular** | Tiene que ser elegible (se valida al asignarlo, sin aceptación) y es quien entra |
| **Soporte** | Atiende reclamaciones y transfiere el titular de ingresos congelados |
| **Administrador del escenario** | Mantiene sectores, puertas, sillas y dispositivos |
| **Operador de puerta** | Opera la validación; en un rojo operativo decide si llama a la Policía, y queda registrado |
| **Supervisor del evento** | Sigue los ingresos y las alertas en vivo |
| **Administrador de la plataforma** | Gestiona actores, credenciales y configuración |
| **Persona** | Consulta su estado y apela |

---

## Flujo completo

1. **Cada semestre**: el club carga su comercializadora en el SVN y Mindeporte la homologa.
2. **Continuo · Parte 1**: las autoridades de policía emiten medidas correctivas; el IVC las recibe,
   las registra y las **valida** (o las devuelve por subsanar). Al validarse, la restricción queda
   Activa y vence sola al cumplir sus meses.
3. **Preparación del evento**: escenario, sectores, puertas y puestos; se configura el evento y los torniquetes, y se reparten los cupos.
4. **Consulta 1 · al identificarse el comprador**: la comercializadora consulta el SVN con el documento
   y el nombre del comprador. El SVN verifica con el ANI, revisa medidas vigentes y entrega su límite de
   ingresos; responde sí o no.
5. **Compra**: cantidad de 1 a 5 y reserva. Cada ingreso se asigna a su titular.
6. **Consulta 2 · por titular, y consulta 3 · al pagar**: cada titular se valida al asignarlo; al pagar se
   revalida a comprador y titulares, y la comercializadora cobra. Al pagar nace cada derecho de ingreso (documento + evento + sector), con su titular y su token.
7. **Transferencias**: se valida a los dos lados, hasta el inicio del partido.
8. **Revisión continua**: una medida nueva anula o congela solo los ingresos de esa persona.
9. **Inicio del encuentro**: se cierran las transferencias; solo se entra.
10. **Día del evento**: cada torniquete, configurado para su partido, valida contra el documento y
    responde entra o no entra. Quien entra con un antecedente genera un aviso silencioso al PMU; los rojos operativos los resuelve el operador (con la Policía opcional) y los rojos por medida van al PMU.
11. **Después del evento**: se sincroniza lo validado sin conexión y se actualiza el historial de
    asistencia. La entidad deportiva **reporta los incidentes**; la autoridad de policía decide si
    abre el procedimiento, y si emite una medida, el IVC la radica.

---

## Decisiones del kick-off (28-sep-2026)

- **Biometría: solo huella, modular** *(exploratorio, 16-oct-2026)*. Iba como módulo desacoplable con
  rostro; ese día se retiró todo y ese mismo día **vuelve únicamente la huella**, como módulo que se
  enciende por evento. **El rostro, la confianza de identidad y la foto de referencia no vuelven.**
- **Puerta por documento (16-oct-2026):** no se revisa la boleta sino el documento y su derecho de
  ingreso. La boleta queda como comprobante de la compra, fuera de la puerta.
- **Más de 5 ingresos: no.** Máximo 5 por aficionado (el decreto dice boletas), cada uno asociado a una persona.
- **Registraduría (ANI):** un servicio paralelo que consulta todo el que necesite validar un documento.

## Preguntas abiertas

- **Base legal del cambio de contrato de la API** *(exploratorio)*: la v2 renombra `/boletas` a
  `/ingresos` y `YA_TIENE_BOLETA` a `YA_TIENE_INGRESO`; la v1 sigue como alias en desuso. Falta definir
  hasta cuándo y con qué fundamento se les cambia el contrato a las comercializadoras en pruebas.
- **Derecho de ingreso y Decreto 1622** *(exploratorio)*: el decreto regula boletas; confirmar que el
  derecho de ingreso por documento, con la boleta como comprobante, lo cumple.
- **Base legal de la huella** *(exploratorio, a verificar con jurídica)*: la Ley 1581 y el Decreto 1377
  de 2013 prohíben condicionar una actividad a que la persona entregue datos sensibles, salvo que una
  ley lo exija. Falta confirmar los artículos aplicables (dato sensible, tratamiento, autorización
  expresa) y **si el Decreto 1622 de 2022 u otra norma (p. ej. la Ley 1270 de 2009) habilita la huella
  obligatoria** en un sector. Sin norma declarada, el modo *Obligatoria* no se enciende.
- **Lectores y servicio de huella** *(exploratorio)*: convenio con la Registraduría para la
  autenticación biométrica (el del ANI ya está pendiente), costo por consulta, cobertura de extranjeros
  (CE, PPT, pasaporte, PEP) y menores (TI), qué dedos acepta y qué lector externo certificado usan
  celular, tablet y consola.
- **Cédula prestada y *No es la persona*:** definir qué queda auditado cuando el operador toca *No es la
  persona* y se abre la verificación con huella (modo *Opcional*).
- **Estados sugeridos de la medida:** cuáles aprueba el IVC y con qué soporte.
- **Medida Recibida o Por subsanar (Parte 2):** la HU dice que no produce efectos. Confirmar que ni la
  compra ni la puerta la tratan como roja, ni siquiera como aviso al PMU.
- **Integración (Parte 1):** la HU nombra el registro "por integración" pero no dice con qué sistema
  (¿GESDOC, las inspecciones de policía?).
- **Documentos válidos:** el Excel cita el art. 2.17.3 y el art. 2.17.4 del Decreto 1622 para lo
  mismo; confirmar cuál.
- **Correcciones y levantamiento anticipado de una medida:** no están en los documentos.
- **Convenio con la Registraduría:** el demo simula el ANI. El modelo ya está decidido; falta el trámite del convenio.
