# Gestión de infractores · IVC SVN (fase 1) · Empezar aquí

Esta guía es la puerta de entrada al módulo. Explica qué es, en qué orden leerlo, qué tarea de Jira cubre cada parte y dónde se ve en la demo.

## Qué es, en una línea

Es un módulo nuevo del SUID que vive dentro del IVC. Sirve para saber con certeza, el día del partido, quién no puede entrar. Se registran las sanciones en firme, se validan, se consultan y su vigencia se lleva sola.

En el menú del IVC aparece como **Control de acceso**, con dos entradas:

| Entrada | Qué hace |
|---|---|
| Gestión de sanciones | Registrar, cargar en masa, revisar y validar o devolver |
| Búsqueda avanzada | Saber si una persona tiene una restricción vigente |

Calidad y auditoría (HU-09) quedó fuera de la fase 1: queda para integraciones futuras.

- **Del SUID** toma el login, los roles y la firma de cada operación.
- **Del IVC** toma el menú. Ninguna pantalla actual del IVC cambia.

## Por dónde empezar (30 minutos)

1. **Para qué existe** (5 min): el trabajo de fondo y los 6 trabajos que el módulo debe hacer bien.
2. **Roles** (5 min): profesional, coordinador y director, y qué puede hacer cada uno.
3. **Demo** (10 min): entrar con un rol y recorrer registrar → validar → consultar.
4. **Historias** (5 min): las 9 historias de usuario con sus criterios de aceptación.
5. **Superficie, Flujos y Datos**: consulta según lo que necesites construir.

## Mapa: documento ↔ tarea ↔ demo

Documento completo: https://naowee-tech.github.io/design-demo-ivc-svn/entrega/
Épica: [PROD-45 · IVC Sistema Validación Nacional](https://naowee.atlassian.net/browse/PROD-45)

| # | Pestaña | Qué responde | Spec (md) | Tarea Jira | En la demo |
|---|---|---|---|---|---|
| 01 | [Para qué existe](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#trabajos) | Qué debe lograr el módulo | — | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) | — |
| 02 | [Historias](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#hu) | Quién hace qué y cómo se acepta | [historias.md](historias.md) | [PROD-73](https://naowee.atlassian.net/browse/PROD-73) | Enlaces dentro de cada historia |
| 03 | [Roles](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#roles) | Qué puede y ve cada rol | [roles.md](roles.md) | [PROD-72](https://naowee.atlassian.net/browse/PROD-72) | Una entrada por rol (ver abajo) |
| 04 | [Superficie](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#superficie) | Las 14 vistas de la fase 1, paneles y modales (Calidad y auditoría queda fuera de la fase 1 e Indicadores no disponible hasta la siguiente etapa; quedan como referencia) | [superficie.md](superficie.md) · [indicadores.md](indicadores.md) | [PROD-74](https://naowee.atlassian.net/browse/PROD-74) | Todas |
| 05 | [Flujos](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#flujos) | Paso a paso de cada recorrido | [flujos.md](flujos.md) | [PROD-71](https://naowee.atlassian.net/browse/PROD-71) | — |
| 06 | [Datos](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#datos) | Los 55 campos, catálogos, estados e integración | [modelo-datos.md](modelo-datos.md) | [PROD-71](https://naowee.atlassian.net/browse/PROD-71) | Formulario «Registrar infractor» |
| 07 | [Base técnica](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#arquitectura) | Cómo construir la fase 1 en ivc-ms, public-gateway y suite-web-ivc | [arquitectura.md](arquitectura.md) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) | [Recorrido animado](https://naowee-tech.github.io/design-demo-ivc-svn/docs/recorrido-ingreso.html) |
| 09 | [Responsive](https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#responsive) | Cómo se ve cada vista en celular, tablet y escritorio, y qué cambia de forma | [responsive.md](responsive.md) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) | Todas, a 375 / 768 / 1280 px |

La entrega de la demo como tal es [PROD-70 · Entrega de demo IVC SVN](https://naowee.atlassian.net/browse/PROD-70).

## Tareas de la épica

| Tarea | Qué cubre | Estado |
|---|---|---|
| [PROD-45](https://naowee.atlassian.net/browse/PROD-45) | Épica. Tiene adjuntos la HU-26.3 (.docx), el Excel de sancionatorios y el prototipo de formulario | UX DESIGN |
| [PROD-70](https://naowee.atlassian.net/browse/PROD-70) | Entrega de la demo | UX DESIGN |
| [PROD-71](https://naowee.atlassian.net/browse/PROD-71) | Flujos y modelo de datos | PENDING APPROVAL |
| [PROD-72](https://naowee.atlassian.net/browse/PROD-72) | Roles | PENDING APPROVAL |
| [PROD-73](https://naowee.atlassian.net/browse/PROD-73) | Historias de usuario | PENDING APPROVAL |
| [PROD-74](https://naowee.atlassian.net/browse/PROD-74) | Superficie: vistas del módulo | PENDING APPROVAL |

## La demo

Base: https://naowee-tech.github.io/design-demo-ivc-svn/

Abre en el login del SUID. Es de demostración: entra con cualquier dato, incluso vacío. Los datos son ficticios y viven en el navegador.

**Entrar con un rol**

- [Profesional](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html?rol=profesional#/control-acceso/infractores): registra, corrige y carga en masa. No cierra registros.
- [Coordinador](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html?rol=coordinador#/control-acceso/infractores): todo lo del profesional, más validar o devolver. Edita registros validados, con motivo.
- [Director](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html?rol=director#/control-acceso/infractores): valida o devuelve y consulta. No digita.

**Pantallas directas**

| Pantalla | Enlace |
|---|---|
| Gestión de sanciones (bandeja) | [#/control-acceso/infractores](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html#/control-acceso/infractores) |
| Registrar infractor | [#/control-acceso/infractores/nuevo](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html#/control-acceso/infractores/nuevo) |
| Carga masiva | [#/control-acceso/infractores/carga-masiva](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html#/control-acceso/infractores/carga-masiva) |
| Búsqueda avanzada | [#/control-acceso/consulta](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html#/control-acceso/consulta) |

**Atajos**

- **Panel demo** (Ctrl/⌘ + Shift + L): cambia de rol, carga personas ficticias con distintos casos y reinicia los datos.
- **Ruta oculta a la documentación**: [`#/entrega`](https://naowee-tech.github.io/design-demo-ivc-svn/suid/app.html#/entrega) lleva desde la demo a este documento.

## Conceptos clave

- **Registro:** una sanción en firme cargada a la base. Pasa por *Recibido* → *Por subsanar* (si se devuelve) → *Validado*.
- **Restricción:** lo que impide entrar. Se activa sola cuando el registro está validado y en vigencia, y pasa a *Cumplida* sola al terminar. Nunca se borra.
- **Menores:** solo se encuentran por documento completo, con la misma reserva para todos los roles. Exigen registrar al representante.
- **Origen de los campos:** la hoja «Diccionario de Datos» del Excel del IVC (`BASE DE DATOS SANCIONATORIOS_30092026_VF.xlsx`, adjunto en PROD-45).

## Anexos

Cada archivo está en dos lados: **Jira** descarga el adjunto de la tarea (pide sesión en Atlassian) y **Repo** abre la copia en `docs/spec/`.

**Insumos del IVC** (fuente original, versión del 30-sep-2026)

| Archivo | Qué es | Archivo | Tarea |
|---|---|---|---|
| HU-26.3 · Gestión de infractores (.docx) | La historia de usuario aprobada (v04) | [Jira](https://naowee.atlassian.net/secure/attachment/36607/HU-26.3-GESTI%C3%93N%20DE%20INFRACTORES_30092026_VF.docx) · [Repo](insumos/HU-26.3-GESTI%C3%93N%20DE%20INFRACTORES_30092026_VF.docx) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) |
| Base de datos sancionatorios (.xlsx) | Diccionario de datos: origen de los 55 campos | [Jira](https://naowee.atlassian.net/secure/attachment/36606/BASE%20DE%20DATOS%20SANCIONATORIOS_30092026_VF.xlsx) · [Repo](insumos/BASE%20DE%20DATOS%20SANCIONATORIOS_30092026_VF.xlsx) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) |
| Prototipo de formulario SVN (.xlsx) | Boceto del formulario entregado por el IVC | [Jira](https://naowee.atlassian.net/secure/attachment/36608/Prototipo_Formulario_SVN_30092026_VF.xlsx) · [Repo](insumos/Prototipo_Formulario_SVN_30092026_VF.xlsx) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) |

**Documentación de la entrega** (markdown, el mismo contenido de cada pestaña)

| Archivo | Pestaña | Archivo | Tarea |
|---|---|---|---|
| index.md | Esta guía | [En el repo](index.md) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) |
| historias.md | Historias | [Jira](https://naowee.atlassian.net/secure/attachment/36623/historias.md) · [Repo](historias.md) | [PROD-73](https://naowee.atlassian.net/browse/PROD-73) |
| roles.md | Roles | [Jira](https://naowee.atlassian.net/secure/attachment/36618/roles.md) · [Repo](roles.md) | [PROD-72](https://naowee.atlassian.net/browse/PROD-72) |
| superficie.md | Superficie | [Jira](https://naowee.atlassian.net/secure/attachment/36620/superficie.md) · [Repo](superficie.md) | [PROD-74](https://naowee.atlassian.net/browse/PROD-74) |
| indicadores.md | Superficie (sección «Cómo se calculan los indicadores») | [Repo](indicadores.md) | [PROD-74](https://naowee.atlassian.net/browse/PROD-74) |
| flujos.md | Flujos | [Jira](https://naowee.atlassian.net/secure/attachment/36617/flujos.md) · [Repo](flujos.md) | [PROD-71](https://naowee.atlassian.net/browse/PROD-71) |
| modelo-datos.md | Datos | [Jira](https://naowee.atlassian.net/secure/attachment/36627/modelo-datos.md) · [Repo](modelo-datos.md) | [PROD-71](https://naowee.atlassian.net/browse/PROD-71) |
| arquitectura.md | Base técnica | [Repo](arquitectura.md) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) |
| responsive.md | Responsive | [Repo](responsive.md) | [PROD-45](https://naowee.atlassian.net/browse/PROD-45) |

**Enlaces**

| Qué | Enlace |
|---|---|
| Documento de la entrega (9 pestañas) | https://naowee-tech.github.io/design-demo-ivc-svn/entrega/ |
| Demo | https://naowee-tech.github.io/design-demo-ivc-svn/ |
| Repositorio | https://github.com/naowee-tech/design-demo-ivc-svn |
| Épica en Jira | https://naowee.atlassian.net/browse/PROD-45 |

## Cómo se mantiene esta documentación

Cada pestaña se genera con un script en `docs/model/` desde un JSON. Para cambiar el contenido se edita el JSON y se corre el script, no el HTML ni el md.

| Pestaña | Fuente | Script |
|---|---|---|
| Para qué existe | `jtbd.json` | `gen-jtbd.py` |
| Historias | `historias.json` | `gen-historias.py` |
| Roles | `roles.tpl.html` (+ `suid/roles.js`) | `gen-roles.py` |
| Superficie | `superficie.json` + `indicadores.json` (cálculo de los indicadores, también escribe `indicadores.md`) | `gen-superficie.py` |
| Flujos | `flujos.json` | `gen-flujos-superficie.py` |
| Datos | `hu-26-3.html` + `campos-en.json` + `obligatoriedad.json` + `suid/gi-catalogos.js` | `gen-modelo-datos.py` |
| Base técnica | `arquitectura.json` | `gen-arquitectura.py` |
| Responsive | `responsive.json` + `responsive-medicion.json` (la escribe `medir-responsive.mjs`, con capturas en `docs/img/responsive/`) | `gen-responsive.py` |
