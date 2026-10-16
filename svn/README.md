# Prototipo · SVN

HTML plano sobre `sdk-frontend-foundations` y los custom elements de `sdk-stencil-components`, con look
and feel de Naowee. Modelo de cada superficie en [`modeling/desing-views/`](modeling/desing-views/README.md).

## Publicación

GitHub Pages sirve `main` en la raíz: https://naowee-tech.github.io/design-demo-control-acceso/

- **IVC embebido:** `ivc/` es un submódulo de [`naowee-tech/design-demo-ivc-svn`](https://github.com/naowee-tech/design-demo-ivc-svn). Los cambios del IVC se hacen allá; para traerlos acá:
  `git submodule update --remote ivc && git commit -am "IVC al día" && git push`.
- **Versiones congeladas:** igual que las demás demos (`design-naowee-demo-template`): `gh release create vX.Y.Z --target main` congela `versions/vX.Y.Z/`, IVC incluido, y regenera `versions/index.html`.

## Abrirlo

Clonar con `git clone --recurse-submodules` (sin el submódulo, las rutas a `ivc/` no abren). Doble clic en `index.html`. Funciona sin servidor.

- `#/`: gate **¿Quién puede entrar al evento hoy?**, por aplicación (abre primero, numerado por `paso` en `datos.js`: 1 a 9 consecutivos, DC-423; Portal de la persona y Consola de soporte no salen ahí pero siguen en `#/portal` y `#/soporte`, 8-oct-2026) o por rol (ordenado por el mismo flujo) (mismo patrón que `uaesp-rutas-alta`).

Rutas en el orden del flujo de la demo (30-sep-2026); el gate las numera distinto desde el 8-oct (ver `datos.js`):

1. Backoffice de eventos (superficie 4), organizador: vive en el IVC como **Control de acceso · Eventos**
  (`ivc/suid/app.html#/control-acceso/eventos`, desde el 8-oct-2026). La card del gate y el viejo `#/backoffice` abren ahí.

2. `#/compra`: **Vender la boleta** (paso 6 del gate; superficies 6 y 7), solo en celular, sobre una comercializadora ficticia (*graderío*).
  Flujo: **Evento y boletas** → **Identificarse** (consulta 1: ¿puede comprar?, valida al comprador) → **Cantidad** (1 a 5) → **Titulares** (cada boleta
  se asigna con tipo, número de documento y nombre; cada una se valida con la consulta 2: ¿puede recibir?; «Yo también voy» ocupa la boleta 1 con el propio comprador) →
  **Pago** (consulta 3: revalida al comprador y a todos los titulares, y emite un token por boleta) → **Compra aprobada** (2 s, verde, todo el equipo) → **Tus boletas**.
  La reserva (9:42) empieza al pasar la consulta 1, no en Pago; el reloj también corre en Titulares y, si vence, vuelve al evento con aviso.
  Asignar es firme: no hay aceptación ni «No voy», y la boleta no queda «sin titular» después de pagar. Pagar está deshabilitado mientras haya una boleta sin titular validado.
  Cada consulta corre en la franja de la capa (a la persona se le presenta como consulta a DB):
  en *Slow motion* 1 s por paso; en *Tiempo real* la consulta completa dura 1,8 s y la franja no se muestra. Si una consulta corta, sale el
  componente «Resultado de la validación» sin motivo (salvo el límite, que sí se explica) y el flujo se detiene. El motivo de un no nunca se muestra al titular.
  El panel **Ver como** alterna entre *Quien compra* (casos de `C1-Casos`: elegir uno reinicia el flujo con ese destino). La asignación es solo por documento y nombre; el sistema nunca devuelve un nombre. Las tipografías de graderío
  (Bricolage Grotesque y Figtree) vienen de Google Fonts; sin conexión cae a `system-ui`.

  | # | Caso | Corta en |
  |---|---|---|
  | 1 | Compra sin problemas | no corta |
  | 2 | Bloqueo por medida | consulta 1 · Medidas (SVN) |
  | 3 | Límite al identificarse (tiene 4, pide 2; con 1 sí pasa) | consulta 1 · Límite |
  | 4 | Límite al pagar | consulta 3 · Límite |
  | 5 | Nombre no coincide (3 intentos; corrigiendo los datos pasa) | consulta 1 · Registraduría |
  | 6 | Cédula no válida | consulta 1 · Registraduría |
  | 7 | Medida durante el pago | consulta 3 · Medidas (SVN) |
  | 8 | Asignado tiene medida | consulta 2, en Titulares (antes de pagar) |
  | 9 | Invitado es hincha visitante (cierra Sur) | consulta 2, en Titulares |
  | 10 | Invitado ya tiene boleta (`YA_TIENE_BOLETA`) | consulta 2, en Titulares |
  | 11 | Afinidad dudosa: pasa | no corta |
  | 12 | Compro para otros | Titulares; «Yo también voy» apagado |
  | 13 | Documento repetido | error en el campo, sin consulta («Este documento ya está en la boleta k») |
  | 14 | Titular con medida al pagar | consulta 3 falla en ese titular: no se cobra, la reserva se mantiene y vuelve a Titulares con esa boleta marcada |

  Los casos 8 a 10 fallan en Titulares, antes de pagar. Los 2 casos de «Quien recibe» (aceptación) se eliminan o se rehacen como casos de transferencia de titular, que pasan por «Cambiar titular» en Tus boletas.
  Menor con TI: se valida igual, con la nota «Si es menor, debe entrar con su representante» (exploratorio).
  Fuera de alcance: carga masiva (máx 5), devolución de dinero y el backoffice de eventos.

3. `#/puerta`: operador de puerta (superficie 5) en celular, tablet y consola.

4. `#/policia`: Monitor PMU (superficie 3), en tablet y escritorio. Primero **Eventos**: cards por fecha en franjas
  (en vivo verde tenue, próximos azul claro, pasados sin fondo); el evento en vivo abre el tablero y los pasados avisan
  con su resumen. Fotos de estadios en `assets/estadios/`: referencias para el demo, no para producción. Después el **tablero
  del evento** (partido, ingreso en vivo, puertas y el panel de alertas a la derecha). La autoridad de seguridad **asigna** la alerta: un
  modal con la info de la puerta y los agentes a notificar; el agente la toma (el demo lo simula a los 7 s) y ahí pasa a
  *En atención*. También pasa que un agente la toma antes (a los 20 s en la Puerta 6, o con el botón del panel del demo).
  *Ver perfil* o *Cerrar con resultado* abre el perfil de esa alerta, y *Tablero del evento* vuelve.

5. `ivc/`: registro de medidas correctivas (superficie 1), profesional del IVC. Es el demo del IVC (submódulo `ivc` → `naowee-tech/design-demo-ivc-svn`,
  publicado en `/ivc/`); la app del gate abre su login. Reemplazó a la pantalla `#/medidas` del SVN.

6. `#/auditoria`: **Auditoría vive ahora en el IVC, en Eventos > Pasados > Registros** (`ivc/suid/app.html#/control-acceso/eventos?momento=pasados`);
  la card, el rol de Mindeporte y `#/auditoria` llevan allá. `apps/auditoria.*` queda de respaldo, sin entrada. Lo que sigue es ese respaldo: auditoría (superficie 3), en escritorio y tablet, app aparte del Monitor. Arranca en la misma lista de
  eventos (`apps/eventos.js`); al entrar, una cabecera con la foto del escenario, el tiempo del operativo y del partido,
  los equipos, los filtros y el exportar (simulado, no baja archivo); chips por lo que pasó en la puerta, tabla de
  registros y el registro elegido a la derecha con la foto de la persona, su historia y quién lo consultó.
  La usan la autoridad de seguridad y Mindeporte (se cambia en el panel del demo).

7. `#/portal`: **Portal de la persona** (superficie 8), solo en celular (web móvil), persona y representante legal. **Identificarse** con documento y nombre
  (verificación simulada contra la Registraduría; el representante legal entra por el menor) → **Mi estado** (*Sin medidas vigentes*, o la medida con autoridad, acto,
  desde, hasta, días restantes y los hechos) con **Cómo controvertirla** (exploratorio) y **Otros motivos de un no**; **Boletas** (asignadas por quien compró) y
  **Vínculos** (revocar una comercializadora sin cortar lo que está en curso; foto de referencia y su permiso solo con el módulo biométrico encendido). Nunca muestra
  datos de otra persona ni la palabra SVN. Casos del panel: sin medidas, medida vigente, por vencer, menor con representante, entrada desde un bloqueo de la compra,
  documento no vigente y nombre que no coincide; «Adelantar el reloj» hace que la medida venza sola.

8. `#/soporte`: **Consola de soporte** (superficie 9), en escritorio. Cola de reclamaciones (filtro por estado, búsqueda por caso, nombre o documento, plazo de asignación
  que vence) y el detalle: lo que dice la persona, la boleta con su estado, su traza (validación, token, asignación, ingreso) y el historial. Acciones según el estado:
  *Tomar el caso* → *Transferir boletas congeladas* (valida a quien entrega y a quien recibe), *Resolver* o *Rechazar* con motivo; un caso cerrado no se edita. No ve el expediente de
  una medida. «Pasar el inicio del encuentro» bloquea la transferencia (después del inicio no se transfiere nada).

9. `#/entidades`: **Entidades y comercializadoras** (superficie 2), en escritorio. «Ver como» alterna **Club** (Atlético Nacional) y **Graderío** (comercializadora); Mindeporte no tiene cara en esta app. La barra lleva Naowee y la alianza Mindeporte + IVC a la izquierda.
  Club: **Reporte semestral** (elige su comercializadora y ve la respuesta a «¿puede vender este semestre?»), **Reportes de incidentes** (los del club en la bandeja del IVC, con su estado y sin
  ver la medida) y **Reportar incidente** (persona verificada con el ANI, un menor queda reservado, conductas de los art. 97 y 98, evidencia; no bloquea, llega a la autoridad y al IVC) y **Mis eventos** (cifras agregadas).
  Graderío: **Certificación** (de solo lectura; abre por defecto y muestra también el estado de conexión con el API: *Conectada* o *Por conectar*), **Reportar** (incidentes y ventas hacia Mindeporte) y **Mis reportes** (con observaciones para corregir y reenviar).

10. `#/integracion`: **API y portal de integración** (superficie 6), en escritorio, para el equipo técnico de Graderío. **Llaves y entornos** (pruebas y producción; la llave se ve una sola vez y después queda enmascarada; rotar con 24 h de gracia y revocar;
  la de producción solo existe si está homologada), **Documentación** (los 3 puntos de validación más registrar boleta y estado del escenario, con solicitud, respuestas y códigos de motivo; nunca motivo ni expediente),
  **Homologación** (4 casos de prueba, la *cumplida* sale autorizada; solicitar la homologación), **Registro de llamadas** (con el documento enmascarado y solo códigos) y **Estado del servicio** (con un caso degradado).

En *Por aplicación*, cada card entra por la ruta de su app con la sesión de su primer rol. La card muestra nombre y una línea de «quién» (`quien` en `datos.js`, solo etiqueta; sin `quien` une los `roles`); ya no pinta el dispositivo.

Los demás perfiles responden *Disponible próximamente*: ninguna card queda muda.

## Qué muestra la puerta

| Caso | Qué hace |
|---|---|
| Verde | *Entra*, vuelve solo a la lectura a los 3,5 s |
| Verde solo con CC | La persona presenta solo la cédula: la capa consulta la boleta asignada a ese documento para el partido (la boleta es nominativa) y da verde con la ubicación. Distinto del rojo *sin boleta*, donde el documento no tiene ninguna asignada |
| Amarillo (otro partido, sin boleta, ya usada) | *Revisar* → *Dejar entrar* / *No entra* → motivo → decisión registrada |
| Rojo | *No entra · remitir a la autoridad*, alerta al PMU; solo lo cierra el operador |
| Rojos operativos (otro partido, ya usada, sin boleta) | Solo *NO ENTRA*, la causa en una línea y el documento; sin notas explicativas |
| Antecedentes (*Sanción cumplida*, *Antecedente por agresión*) | Amarillo *ENTRA* con el rótulo *Antecedente* y la sanción ya cumplida. En la vista de seguridad quedan como **Avisos de antecedentes** (datos `policia.tablero.antecedentes`), debajo de las alertas rojas: no se atienden, se tienen presentes |
| Sin conexión | Valida con el paquete del evento y cuenta lo pendiente por sincronizar; el rojo queda en cola |
| Condiciones | Cada switch (Sin conexión, Módulo biométrico, Torniquete) baja un toast breve y mueve su punto sobre la cámara: Conexión, Biométrico, Torniquete |
| Capa oculta | En cada validación el equipo se achica y aparece debajo una franja sin fondo: los 6 pasos en una línea (lectura, ANI · Registraduría, boleta, autoridad, medidas del SVN y decisión: 2 consultas externas y 4 del SVN; el IVC solo radica las medidas, no se consulta), el sistema que responde y su label, el tag del resultado, y al final el reloj con play/pausa. En Slow motion dura 1 s por paso (6 s) y representa 1,5 s reales. En cada paso baja un dato del equipo a la línea y sube la respuesta, de a uno, con el color de lo que dio. Al definirse el resultado, todos los pasos toman ese color, y 2 s después la franja se va. Solo en Slow motion: en Tiempo real no aparece y el equipo conserva su tamaño |
| Solo la boleta | Amarillo *ESCANEE*: la boleta es nominativa y sola no abre; **Escanear documento** vuelve a la lectura |
| Posible cédula prestada | *VERIFICAR* con la **foto de referencia** (la de la compra) contra la huella o el rostro; *No coincide* → rojo «Posible cédula prestada» |
| Biometría | Panel «Biometría»: **Huella** (lector táctil, estable hoy en Colombia) o **Rostro** (la apuesta a futuro). El verde con el módulo encendido muestra la referencia y «Huella/Rostro coincide» |
| Digitar | Teclado numérico con los 7 tipos de documento. Un número que termine en `4447` da rojo |

El panel izquierdo es **del demo, no del producto**: dispara lo que llegaría por la cámara o el lector.
Está hecho solo con componentes del SDK (`nwt-toolbar`, `nwt-title`, `nwt-alert`, `nwt-card`, `nwt-tabs`,
`nwt-detail-item`, `nwt-switch`, `nwt-icon-label`, `nwt-divider`).

Todo va en **modo claro**. Los equipos se simulan como la app del conductor de `uaesp-rutas-alta`:
marco con bisel, barra de estado y fila de marca en celular y tablet, monitor con pie en la consola,
y, arriba a la derecha, el zoom del escenario (alejar, acercar); en la puerta, en la misma línea, la velocidad (Slow motion | Tiempo real).

## Estructura

```
index.html     la página: carga vendor, estilos y scripts
app.js         sesión ficticia por rol, router por hash, aviso de "próximamente"
gate.js        el gate por rol o aplicación, con el zoom de entrada
datos.js       roles, las 9 superficies, casos de la puerta, vista de seguridad y auditoría (todo ficticio)
marca.js       el logo de Naowee (copiado de uaesp-rutas-alta) para nwt-logo-naowee
svn.css        gate y transición (prefijo sv-)
apps/puerta.*  superficie 5: operador y vista de seguridad (prefijo pp-)
apps/auditoria.*  superficie 3: auditoría (prefijo pa-); reusa el marco del demo y del equipo de pp-
apps/compra.*  paso 6 del gate (superficies 6 y 7, prefijo pc-): estado, casos, consultas, Evento/Identificarse/Pago/Listo; reusa el marco del demo y del equipo de pp-
apps/compra-asignar.*  paso 6: pantalla Titulares (lista de tarjetas y vista inmersiva por boleta, prefijo pca-); se registra en `COMPRA`
apps/portal.*  superficie 8: portal de la persona (prefijo pt-); reusa el marco del demo y del equipo de pp-
apps/soporte.*  superficie 9: consola de soporte (prefijo sp-); reusa el marco del demo y del monitor de pp-
apps/entidades.*  superficie 2: entidades y comercializadoras (prefijo en-); reusa el marco del demo y del equipo de pp-
apps/integracion.*  superficie 6: API y portal de integración (prefijo ig-); reusa el marco del demo y del equipo de pp-
apps/capa.js   capa oculta de la validación: `correr` (puerta, 6 pasos) y `correrDef` (compra, pasos y tag propios)
vendor/        foundations 3.1.0 + nwt.js. NO SE EDITA
```

## Contrato de la compra (`apps/compra.js`)

`COMPRA.registrar(id, { render(ctx), onClick?(el, ev, ctx), onInput?(ev, ctx), alMontar?(ctx) })`. `ctx = { D, st, repintar, toast, esc, ir, consultar, reiniciar, raiz }`.
`TIPOS_DOC` es la única constante de tipos de documento (CC, CE, TI, Pasaporte, PPT, PEP, RUMV) y se expone en `COMPRA`; el formato lo valida cada campo.
`st` es el estado del flujo: `pantalla` (`identificar`, `cantidad`, `titulares`, `pago`, `aprobada`, `boletas`), `caso`, `persona` (propietario), `localidad {id, nombre}`,
`cantidad` (1 a 5), `yoVoy` (interruptor «Yo también voy»), `reservaFin`, `cupos[N]{n, titular {tipo, num, nombre, doc} | null, estado: vacio | validando | ok | denegado, codigo?, esPropietario}` y `boletas[N]`, que se crean al pagar desde los cupos, cada una con su titular y su token.
`consultar(n, alTerminar, extra?)` elige la definición por caso y llama `alTerminar({ ok, corte, codigo })`. Consultas: 1 «¿puede comprar?» (comprador); 2 «¿puede recibir?» (una por boleta, con documento y nombre en `extra.cupo`); 3 «revalida al pagar» (comprador y todos los titulares; devuelve un token por boleta).
Ayudas: `COMPRA.marco`, `resultado`, `ico`, `qr`, `dinero`. Acciones `data-acc`: `cmp-` (flujo de compra) y `asg-` (titulares). La aceptación del acompañante (`ace-`) no existe más.

## Actualizar el SDK

```bash
F=~/Naowee/sdk-frontend-foundations
cp $F/dist/styles.css vendor/foundations.css
cp $F/dist/components.css vendor/
sed "s#@naowee-tech/sdk-frontend-foundations/fonts/#./#g" $F/dist/icons.css > vendor/icons.css
```

`vendor/nwt.js` es un bundle IIFE de los custom elements que se usan, porque el loader lazy de
Stencil no carga desde `file://`. Para regenerarlo: `npm run build:core` en `sdk-stencil-components`
y empaquetar con esbuild los `dist/components/nwt-<nombre>.js` que se usan (hoy: button, icon-button,
icon, badge, tag, spinner, logo-naowee, stat-card, text-field, toast, switch, tabs, card, avatar,
avatar-icon, toolbar, title, detail-item, alert, divider, icon-label, stepper).
