# Base técnica · fase 1

Cómo construir la fase 1 en `ivc-ms`, `public-gateway` y `suite-web-ivc` para que cumpla lo que dicen las otras pestañas.

Documento: https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#arquitectura · Fuente: `docs/model/arquitectura.json`.

## Alcance de la fase 1

Registrar, editar, validar o devolver, guardar en la base de datos y consultar.

**Entra**

- Registrar (HU-01, HU-02).
- Carga masiva (HU-03).
- Validar o devolver (HU-05).
- Corregir (HU-06).
- Buscar y ver la ficha (HU-07).
- Vigencia automática (HU-08).
- Bitácora de cambios visible en la ficha.

**No entra**

- Calidad y auditoría (HU-09).
- Integración con Policía y otras entidades (HU-04).
- Solicitudes y Eventos.
- La puerta y todo lo offline: SQLite, cifrado, hash y CDN.

## Cómo se construye

Lo que decide la construcción es dónde viven el formulario de 55 campos y sus reglas.

**A · Modelo propio y formulario hecho a mano (elegido).** `ivc-ms` guarda el registro en columnas reales (dirección por partes, representante) y valida con **una sola clase de reglas** que usan crear, editar y la carga masiva; la integración de una fase siguiente podrá reusarla. `suite-web-ivc` arma un formulario reactivo por bloque (B a F) con componentes `ns-*`: el navegador avisa lo básico y el servidor tiene la última palabra, con el error en su campo. La carga masiva lee el Excel en el navegador y manda filas JSON a un endpoint que valida con las mismas reglas. Cuesta más código de front y repite reglas básicas en el navegador.

**B · Extender el motor de formularios** (`commons/form-engine` + YAML). Habría que agregar edición y valores iniciales, modo no asistente, condiciones por fecha y edad, comparaciones entre bloques, dirección con departamento y municipio, y desacoplar el motor del trámite, en los dos repos y sobre un motor que hoy usan trámites en producción. Formularios futuros saldrían en YAML, pero es lo más caro de arrancar y arriesga la radicación.

**Híbrido** (modelo propio en el back, motor solo para dibujar): descartado. Hereda los huecos del motor, sobre todo la edición, sin ganar nada.

> **Abierto a desarrollo.** La elección de A queda **abierta a decisión de desarrollo**. Si desarrollo prefiere B, siguen valiendo igual el modelo de datos, las reglas en un solo lugar del servidor, el contrato de errores por campo, los estados, los permisos y los endpoints. Cambia solo cómo se dibuja el formulario en el front.

### Decisiones tomadas

1. **Alcance:** solo fase 1. La puerta y todo lo offline se diseñan después.
2. **Base única nacional:** sin filtro por área ni por asignación. Quien tiene el permiso ve todos los registros. El campo 53 (Profesional responsable) es solo un dato.
3. **Editar un registro Validado:** solo el coordinador, con motivo obligatorio y efecto inmediato. Recibido y Por subsanar los editan profesional y coordinador, sin motivo.
4. **Autovalidación:** por ahora sin restricción: quien puede registrar, editar y validar, lo hace. Se guarda quién creó y quién editó por última vez para aplicar la regla si el IVC la pide.
5. **Calidad y auditoría sale de la fase 1:** queda para integraciones futuras menos estrictas (Policía y otros, posiblemente por API). Apagada en la demo.
6. **Carga masiva síncrona**, con tope de filas.
7. **Búsqueda por número de documento**, con el tipo como filtro opcional. Una persona = un número de documento (la TI pasa a CC con el mismo NUIP). La ficha agrupa por número.
8. **Integración (HU-04):** queda como modelo propuesto, fuera de la construcción.

## Las piezas

Tres repos y una base de datos, sin servicios nuevos. Las extensiones de PostgreSQL de la búsqueda se ven en Datos.

**suite-web-ivc** (Angular 18 · formulario, listas, carga masiva) → **public-gateway** (Go · sesión, permiso, errores tal cual) → **ivc-ms** (Kotlin · reglas, estados, bitácora) → **PostgreSQL** (sanction_records, bitácora y catálogos)

- Conexiones: `/public-gateway/ivc/v1/…` → `/ivc-ms/v1/… + X-User-*` → `Hibernate Reactive`.
- Departamentos y municipios: catalog-ms (ya existe).

## Datos en ivc-ms

Propuesta. Una tabla principal, tres de bitácora y una de catálogos.

| Tabla | Qué guarda |
|---|---|
| `sanction_records` | Una fila por sanción registrada: los 55 campos en columnas, más estado y control. |
| `sanction_record_status_history` | `record_code`, `from_status` (nulo al crear), `to_status`, `notes` (motivo de devolución u observación de validación), `changed_by_code`, `changed_by_name`, `changed_by_role`, `created_at`. |
| `sanction_record_changes` | Una fila por edición guardada: `record_code`, `record_status` al editar, `reason` (obligatorio si estaba Validado), `changes` JSONB `[{field, before, after}]`, quién (código, nombre, rol) y cuándo. |
| `sanction_record_minor_access` | Una fila por apertura de datos de un menor: `record_code`, `reasons` TEXT[], quién (código, nombre, rol) y cuándo. |
| `sanction_catalog_items` | Los 13 catálogos de la hoja «Catálogos» y los países: `catalog`, `code`, `label`, `abbreviation`, `parent_code`, `sort_order`, `active`. |

### Columnas de sanction_records

| Grupo | Columnas |
|---|---|
| Identidad | `id` BIGSERIAL PK, `code` UUID único, `record_number` único (`INF-AAAA-NNNN`, consecutivo por año, asignado con `pg_advisory_xact_lock` como `AllocateReferenceNumberStep`), `organization_code` NOT NULL, `entry_channel` (`FORM` \| `BULK`) |
| A · Control | `registration_date` (fecha del servidor en `America/Bogota`) |
| B · Infractor | `person_document_type`, `person_document_number`, `person_document_number_norm` (sin espacios, puntos ni guiones, en mayúsculas: se usa para buscar y deduplicar), `person_first_names`, `person_last_names`, `person_birth_date`, `person_sex`, `person_is_minor` (calculado al guardar: menor a la fecha de los hechos), `person_phone_country_code`, `person_phone_number`, `person_email`, dirección |
| C · Representante | Las mismas columnas con prefijo `guardian_`, nulas salvo si `person_is_minor` |
| Dirección (×2) | `*_residence_country`, `*_residence_department_code` + `_name`, `*_residence_city_code` + `_name`, `*_is_rural`, `*_rural_road_type`, `*_rural_additional_info`, las partes 10.1 a 10.14 (`main_road`, `main_road_number`, `main_road_letter`, `main_road_bis`, `main_road_bis_letter`, `main_road_direction`, `cross_road_number`, `cross_road_letter`, `cross_road_bis`, `cross_road_bis_letter`, `plate_number`, `plate_direction`), `*_address_extras` JSONB (pares información adicional + indicación, hasta 5 adicionales) y `*_residence_address` (texto consolidado que arma el servidor con abreviaturas; texto libre si el país no es Colombia). Los separadores `#` y `-` no se guardan |
| D · Hechos | `incident_date`, `competition_code`, `competition_other_code`, `competition_other_text`, `home_team_code`, `home_team_other_text`, `away_team_code`, `away_team_other_text`, `incident_city_code` + `_name`, `obligation_origin_codes` TEXT[] (al menos uno), `aggravating_factor_codes` TEXT[], `conduct_description` |
| E · Sanción | `resolution_date`, `resolution_number` (≤ 20), `enforceability_date`, `sanction_months`, `restriction_start_date` (ejecutoria + 1 día), `restriction_end_date` (inicio + meses), `fine_amount` NUMERIC(15,2) |
| F · Registro interno | `intake_filing_date`, `intake_filing_number`, `filing_response`, `accounting_filing`, `legal_filing`, `responsible_officer` (texto), `procedure_notes` |
| Estado y control | `record_status` (`RECEIVED` \| `TO_CORRECT` \| `VALIDATED`, con CHECK), `version` (bloqueo optimista), `created_by_code` + `_name`, `created_at`, `last_edited_by_code` + `_name`, `updated_at` |

- **Migraciones:** Flyway, nuevas a partir de `V1.4.0`, idempotentes como las existentes. Todas las tablas con `organization_code` NOT NULL y `code` UUID. Las tres de bitácora son inmutables (`updatable=false`, como `tramite_submission_status_history`).
- **Índices:** `person_document_number_norm`; `record_status`; `restriction_end_date`; trigramas (`pg_trgm`) sobre nombres y apellidos sin tildes. `unaccent` no es inmutable: el índice necesita una función envoltorio `IMMUTABLE`. Crear las extensiones `pg_trgm` y `unaccent` requiere un rol con privilegio en RDS: confirmarlo antes de la migración.
- **Duplicado exacto** (misma persona, mismo acto, misma vigencia): índice único sobre `organization_code`, `person_document_number_norm`, `upper(resolution_number)`, `restriction_start_date` y `restriction_end_date`. El servicio lo revisa antes de insertar para responder con el registro que ya existe; el índice cubre las carreras.
- **Organización:** `organization_code` se copia de la fila `user_roles` de quien registra, como `ValidateDirectorRoleStep`.
- **Rol con el que se actuó (propuesta):** el rol IVC del usuario (`user_roles`) que le da el permiso de la acción. Si tiene varios, el más alto (director > coordinador > profesional). Es lo que la firma muestra como «cargo».

## Reglas: una sola clase

`SanctionRecordRules` (Kotlin) recibe el registro completo y devuelve la lista de errores por campo. La usan crear, editar, validar carga e importar; ninguna regla vive en otro lugar del servidor. El front repite solo las básicas, para avisar antes de enviar.

| Regla | Detalle |
|---|---|
| Obligatoriedad | La de la pestaña Datos (Obligatorio y Condicional). Los automáticos los calcula el servidor e ignora lo que llegue |
| Documento | Solo dígitos para CC, CE y TI; alfanumérico para los demás tipos |
| País | Por defecto Colombia. Si no es Colombia: departamento, municipio, zona rural y partes de la dirección no aplican, y la dirección es texto libre obligatorio |
| Dirección | Rural: tipo de vía obligatorio. Urbana: vía principal y los tres números obligatorios, cada número de máximo 3 dígitos. Información adicional: hasta 5 adicionales. El servidor consolida `residence_address` con las abreviaturas del catálogo |
| Contacto | Teléfono: máximo 10 dígitos. Correo: formato válido |
| Fechas | Hechos < hoy y hechos < acto; acto < ejecutoria < radicado de entrada; nacimiento no futuro. «Hoy» es la fecha en `America/Bogota` |
| Menor | Edad a la fecha de los hechos < 18 → `person_is_minor` y bloque C obligatorio. El representante debe ser mayor de edad a la fecha de registro (propuesta) |
| Sanción | Meses: entero ≥ 6. Valor: ≥ 0 (propuesta). Número de acto: ≤ 20, alfanumérico |
| Hechos | Al menos un origen de la obligación; agravantes opcionales. Competición «Otro» habilita Libertadores, Sudamericana u Otro (texto). Equipo «Otro» habilita texto |
| Catálogos | Todo código debe existir en su catálogo (ver Catálogos) |
| Calculados | `restriction_start_date` = ejecutoria + 1 día; `restriction_end_date` = inicio + meses (si el día no existe en el mes destino, último día del mes, como `LocalDate.plusMonths`); `person_is_minor`; `residence_address`; `registration_date` |
| Duplicado | Misma persona, mismo acto y misma vigencia: ver Datos en ivc-ms |

## Estados y vigencia

**Estado del registro** (se guarda): `RECEIVED` → `VALIDATED`; `RECEIVED` → `TO_CORRECT` → `VALIDATED`. Devolver también se permite desde `TO_CORRECT` (nuevo motivo). Editar no cambia el estado. Las transiciones se validan en el servicio con una sola función; una transición inválida responde 409 `INVALID_STATE_TRANSITION`.

| Estado de la restricción | Cuándo |
|---|---|
| `INACTIVE` | El registro no está Validado, o hoy < inicio |
| `ACTIVE` | Validado e inicio ≤ hoy ≤ fin |
| `FULFILLED` | Validado y hoy > fin |

- **Estado de la restricción** (no se guarda, se calcula al leer; propuesta): una función Kotlin y un fragmento SQL equivalente para filtrar. Una prueba verifica que coinciden.
- **Sin job programado:** HU-08 se cumple porque el estado se calcula cada vez. Al validar un registro con la vigencia ya vencida, queda directamente Cumplida.
- La demo (`suid/gi-data.js`, `finVigencia` y `estadoRestriccion`) ya sigue esta regla.

## API

Doce endpoints nuevos en `ivc-ms`, expuestos por el gateway.

| Método y ruta | Permiso | Qué hace |
|---|---|---|
| `POST /sanction-records` | `sanction_record:create` | Crea; queda `RECEIVED`. 201 con `code`, `record_number` y `record_status` |
| `GET /sanction-records` | `sanction_record:read` | Lista de Gestión: filtros `record_status`, `restriction_status`, `page`, `size`; orden por fecha de registro descendente; contadores por estado |
| `GET /sanction-records/{code}` | `sanction_record:read` | Ficha, con restricción calculada, edad y resumen de otras sanciones de la misma persona. Si es menor, bloques B y C enmascarados |
| `POST /sanction-records/{code}/minor-access` | `sanction_record:read` | Abre los datos de un menor con `reasons[]`; guarda la apertura y devuelve la ficha completa |
| `PUT /sanction-records/{code}` | `sanction_record:update`; si está `VALIDATED`, además `sanction_record:update_validated` y `reason` | Edita con las mismas reglas; envía `version`; guarda el antes y después por campo |
| `POST /sanction-records/{code}/validate` | `sanction_record:validate` | `notes` opcional |
| `POST /sanction-records/{code}/return` | `sanction_record:return` | `reason` obligatorio (10 a 2000 caracteres, como el rechazo de actas) |
| `GET /sanction-records/{code}/history` | `sanction_record:read` | Estados, ediciones y aperturas de menor, en orden |
| `POST /sanction-persons/search` | `sanction_record:read` | Búsqueda avanzada; resultados agrupados por persona. POST para que los números de documento no queden en URLs ni en logs |
| `POST /sanction-records/bulk/validate` | `sanction_record:create` | Hasta 500 filas; devuelve el resultado por fila sin guardar nada |
| `POST /sanction-records/bulk` | `sanction_record:create` | Importa las filas enviadas en una sola transacción |
| `GET /sanction-catalogs` | `sanction_record:read` | Todos los catálogos del módulo de una vez |

- Rutas de `ivc-ms` bajo `/ivc-ms/v1`; el gateway las expone bajo `/public-gateway/ivc/v1`, en el grupo `ivcProtected` de `server/routing_ivc.go`. Cada una lleva su archivo Bruno en los dos repos.
- Los GET no escriben nada. Por eso abrir los datos de un menor es un POST.
- **Cuerpo de crear y editar (propuesta):** agrupado por bloque, como el ejemplo de integración de la pestaña Datos: `person`, `guardian`, `incident`, `sanction` e `internal`. Las rutas de error usan esa forma (`person.document_number`, `incident.incident_date`) y el formulario del front tiene el mismo árbol: cada error cae en su campo sin traducción.

## Errores

Un contrato de errores por campo, igual para el formulario y la carga masiva.

| Caso | Respuesta |
|---|---|
| Reglas | 422 `VALIDATION_FAILED` con `field_errors: [{field, code, message}]` |
| Duplicado | 409 `DUPLICATE_RECORD` con `existing_record_code` y `existing_record_number` |
| Edición sobre una versión vieja | 409 `STALE_RECORD` |
| Transición inválida | 409 `INVALID_STATE_TRANSITION` |
| Motivo faltante | 422 `REASON_REQUIRED` |
| Cambio en un campo bloqueado (bloque E de un Validado, provisional: Por confirmar, punto 7) | 422 `FIELD_LOCKED` con `field_errors` |
| Sin permiso | 403 `forbidden` |
| No existe | 404 `SANCTION_RECORD_NOT_FOUND` |

- `message` va en español, listo para mostrar; `code` permite traducirlo en el front.
- **Gateway:** hoy `handleError` del cliente de `ivc-ms` (`internal/clients/ivc-ms/client.go:829`) rehace el error como `{code, messages}` y **descarta** `field_errors` y `existing_record_*`. Las rutas de este módulo devuelven el cuerpo tal cual con `PassthroughError` (`internal/common/errors/passthrough.go`), como ya hace la carga masiva de usuarios.

## Permisos y roles

Seis permisos nuevos. «Editar» un Validado necesita uno propio.

| Permiso | Profesional | Coordinador | Director |
|---|---|---|---|
| `sanction_record:read` | sí | sí | sí |
| `sanction_record:create` | sí | sí | — |
| `sanction_record:update` | sí | sí | — |
| `sanction_record:update_validated` | — | sí | — |
| `sanction_record:validate` | — | sí | sí |
| `sanction_record:return` | — | sí | sí |

- Seis permisos nuevos, sembrados con el patrón de `V1.3.x` (`INSERT … ON CONFLICT DO NOTHING` y `role_permissions`).
- Agregarlos a `IvcPermissions.kt`, a `docs/03-permisos-endpoints.md` y a `erd-original.md`.
- Los usuarios deben **volver a iniciar sesión** para recibirlos: el gateway los pide al login.
- **Qué roles los reciben:** provisional (Por confirmar, punto 9). Las columnas Profesional y Coordinador son los roles nuevos `IVC_SVN_PROFESSIONAL` e `IVC_SVN_COORDINATOR`; Director es `IVC_DIRECTOR`. `IVC_ADMIN` queda sin permisos del módulo.

## Menores de edad

- Reserva igual para todos los roles.
- En listas, ficha y búsqueda, un registro con `person_is_minor` sale con bloques B y C enmascarados (propuesta): nombres y fecha de nacimiento nulos; documento como `••••` más los 2 últimos dígitos; `masked: true`.
- Búsqueda por nombre: los excluye. Búsqueda por documento: solo coincidencia exacta del número completo.
- Ver los datos exige «Abrir con motivo» (`minor-access`), que guarda la apertura.
- Editar un registro de menor pasa primero por esa apertura (propuesta): toda vista sin máscara queda registrada.

## Búsqueda

- **Por documento:** coincidencia exacta del número normalizado, de mínimo 6 caracteres. El tipo es un filtro opcional.
- **Por nombre:** al menos 3 letras, sin tildes ni mayúsculas, con trigramas. Solo adultos.
- **Filtros:** estado de la medida, tipo de documento, ciudad, rango de edad, origen de la obligación, fecha del acto, fecha de fin y «solo las que bloquean hoy».
- **«Entidad que impuso la medida»** no existe en los 55 campos: sale del filtro en la fase 1 (propuesta).
- **Resultados:** una fila por persona, con su medida más urgente. Primero las que bloquean hoy, luego las pendientes (Recibido o Por subsanar) y luego las cumplidas; dentro de cada grupo, por fecha de fin. Paginados.
- **«Recientes» (propuesta):** los últimos registros creados o editados, pedidos al servidor. No se guardan datos personales en el navegador.

## Catálogos

- **Los 13 catálogos de la hoja «Catálogos»** se siembran por Flyway en `sanction_catalog_items` y se sirven con `GET /sanction-catalogs`. Así el servidor los valida sin depender de otro servicio (propuesta).
- **Países:** catálogo `country` sembrado en la misma tabla, con indicativo (alimenta el campo 11).
- **Departamentos y municipios:** los existentes `GET /v1/catalog/departments` y `/v1/catalog/departments/:code/municipalities`. `ivc-ms` guarda código y nombre.
- **Validación de departamento y municipio:** desarrollo decide si `ivc-ms` valida ese código contra catalog-ms (cliente nuevo) o solo su formato DIVIPOLA.

## Carga masiva

Síncrona, con tope de **500 filas** por envío.

1. **Plantilla:** la del IVC (`BASE DE DATOS SANCIONATORIOS`, hoja «Registro», encabezados en las filas 3 y 4, 91 columnas), servida como archivo estático del front.
2. **Lectura en el navegador:** SheetJS 0.20.3 desde `cdn.sheetjs.com`, como `suite-mf-events-lite`. No usar el paquete `xlsx` 0.18.5 de npm, que tiene vulnerabilidades conocidas. Desarrollo decide la librería final.
3. **Mapeo:** columna → campo y etiqueta de catálogo → código, en un solo archivo del front. Si un valor no está en el catálogo, se envía tal cual y el servidor responde el error en ese campo.
4. **Validar:** `POST /sanction-records/bulk/validate` con máximo **500 filas** (propuesta: cabe en el límite de 2 MB del gateway). Responde por fila `VALID` o `ERROR`, con `field_errors` y duplicados dentro del archivo o contra la base.
5. **Corregir o excluir** en pantalla, y volver a validar solo las filas corregidas.
6. **Importar:** `POST /sanction-records/bulk` revalida todo. Si una fila falla en ese momento (por ejemplo, un duplicado que entró mientras tanto), **no se importa nada** y vuelve el detalle (propuesta). Las filas entran `RECEIVED`, con `entry_channel = BULK`.
7. **Reporte descargable:** lo arma el front con la misma librería: filas excluidas más una columna con el error.

## Front: suite-web-ivc

| Pieza | Dónde |
|---|---|
| Rutas | `ROUTES`: `/control-acceso/infractores`, `/nuevo`, `/:code`, `/:code/editar`, `/carga-masiva`, `/control-acceso/consulta`. Archivo `features/interno/control-acceso/control-acceso.routes.ts` y su entrada en `app.routes.ts` |
| Acceso | Entradas nuevas en `IVC_ACCESS` (`core/access/access.config.ts`) por permiso; `ROLE_PERMISSIONS` si aplica |
| Menú | Sección «Control de acceso» en `MENU` (`core/layouts/main-layout/main-layout.component.ts`) con dos ítems: Gestión de sanciones y Búsqueda avanzada |
| Inicio | Agregar `/control-acceso/infractores` a `HOME_CANDIDATES`. Si no, quien solo tiene estos permisos rebota en un bucle hacia `/coordinador/bandeja` |
| Datos | `commons/data/sanction-records/{endpoints,models,repositories,tokens,providers}`, como `coordinador`: interfaces `Api*` en snake_case mapeadas a modelos |

### Pantallas

- **Formulario de registrar y editar:** un componente con el `FormGroup` agrupado como el cuerpo de la API (`person`, `guardian`, `incident`, `sanction`, `internal`); pasos «Antes de empezar», B, C (solo si es menor), D, E y F, con avance; un componente de dirección reusable, usado dos veces; vista previa de edad, menor, fin de vigencia y dirección consolidada.
- **Errores del servidor:** un helper aplica `field_errors` con `setErrors` sobre la ruta del control. Hoy la app no lo hace en ninguna parte.
- **Editar:** mismo componente con valores iniciales. Si el registro está Validado, pide motivo (solo coordinador). Envía `version` y, ante un 409 `STALE_RECORD`, pide recargar.
- **Ficha:** página con ruta propia (no modal); historial con `ivc-timeline`; modales de validar (observación opcional) y devolver (motivo obligatorio), con el patrón de `features/interno/coordinador/pages/actos`; modal «Abrir datos de un menor».
- **Listas:** `ns-table-new`, paginación de servidor con `ns-pagination` (`meta.last_page`), estados vacíos con i18n.
- **Carga masiva:** asistente de 6 pasos. Guardia `canDeactivate` para «¿Salir de la carga masiva?», y lo mismo en el formulario con cambios sin guardar.
- **Textos y estilo:** textos nuevos en `assets/i18n/{es,en}.json`; las etiquetas del menú siguen literales, como las demás. Antes de construir la interfaz, consultar `modern-web-guidance` (formularios, tablas responsivas, modales).
- **Desarrollo local:** las rutas nuevas son internas (necesitan los headers de sesión que pone el gateway), así que van por el gateway de dev, no directo a `ivc-ms`.

## Pruebas mínimas

| Repo | Qué se prueba |
|---|---|
| `ivc-ms` | **Reglas:** una prueba por regla con sus bordes (6 meses, fechas iguales, cumpleaños 18 el mismo día de los hechos, fin de mes y 29 de febrero). **Vigencia:** Kotlin y SQL dan lo mismo. **Endpoints:** transiciones, 403 por permiso, duplicado 409, versión vieja 409, máscara de menor, apertura registrada, edición de Validado solo con permiso y motivo, carga de 500 filas y de 501 filas. **Migraciones:** idempotentes. |
| `public-gateway` | Handlers, `server/testdata/routes_snapshot.txt` y que el cuerpo de 422 y 409 llega completo. |
| `suite-web-ivc` | Mapeo de repositorios, aplicación de `field_errors`, condicionales del formulario y mapeo del Excel. |

## Por confirmar con el IVC

Lo que depende del IVC. Las consultas se enviaron el 2026-11-17; las que traen «Mientras tanto» tienen un valor provisional, elegido para que desarrollo arranque y cambiarlo después cueste poco.

### 1. Autovalidación

¿Quien registra o edita puede validar su propio registro? En la fase 1 no se restringe. Flujos y Roles ya lo marcan como por confirmar.

*Ref.: Flujos · Validación*

### 2. Editar un Validado

Solo coordinador, con motivo y efecto inmediato. Flujos y Roles ya reflejan esta decisión; antes decían «Profesional, Coordinador».

*Ref.: Flujos · Edición*

### 3. Fin de vigencia

Con el diccionario, el último día bloqueado es ejecutoria + 1 día + N meses (lo que hace la demo). ¿O es un día antes?

*Ref.: Datos · Sanción*

### 4. Equipos

La hoja «Catálogos» trae 4; el diccionario pide los 36 de DIMAYOR y el filtro por competición.

*Ref.: Datos · Catálogos*

### 5. Direcciones adicionales y abreviaturas

Confirmar «hasta 5 adicionales» y la tabla de abreviaturas por tipo de vía (pendiente que ya está en Datos).

*Ref.: Datos · Dirección*

### 6. Calidad y auditoría

Sale de la fase 1: informarlo, porque está en la HU-26.3.

*Ref.: Historias · HU-09*

### 7. ¿Qué se edita una vez Validado?

La HU-26.3 v04 dice «sin reabrir ni modificar la decisión de la autoridad» y «Vigencia de la Restricción y Monto, datos inmutables».

**Mientras tanto:** al validar, el bloque E (número y fecha del acto, ejecutoria, meses y valor) queda bloqueado y el coordinador edita el resto con motivo. El PUT responde 422 `FIELD_LOCKED` si llega un cambio en E. Desbloquear después cuesta menos que bloquear.

*Ref.: HU-26.3 v04 · Errores*

### 8. ¿Se puede anular un registro creado por error?

Hoy no hay un estado para un registro creado por error.

**Mientras tanto:** no se construye. El modelo lo admite con una migración: un valor más en el CHECK, una transición y un permiso. Si se confirma, Anulado no se borra, no bloquea y no cuenta como duplicado.

*Ref.: Estados y vigencia*

### 9. ¿Quién recibe los permisos?

Qué roles del IVC reciben los seis permisos del módulo.

**Mientras tanto:** dos roles nuevos y globales, `IVC_SVN_PROFESSIONAL` e `IVC_SVN_COORDINATOR`, más `IVC_DIRECTOR`. `IVC_ADMIN` sin permisos del módulo. Es dato sembrado: cambiarlo es una migración.

*Ref.: Permisos y roles*

### 10. ¿Gestión · Indicadores entra en la fase 1?

Está ligada a HU-09.

**Mientras tanto:** no se construye: no disponible hasta la siguiente etapa y la pestaña queda oculta en la demo. Si entra, hay que definir cada indicador en datos y agregar un endpoint de agregados.

*Ref.: Superficie · Indicadores*

### 11. ¿Hay sanciones vigentes que cargar al arrancar?

No bloquea el arranque.

**Mientras tanto:** si las hay, migración única aparte, con limpieza previa del IVC, fuera del flujo de carga masiva.

*Ref.: Carga masiva*


## Lo decide desarrollo

- Estructura Kotlin: pasos de `FlowEngine` o servicio directo; la dirección como `@Embeddable` con prefijos o como columnas sueltas.
- Mayúsculas o minúsculas de los valores de estado en el contrato.
- Librería de Excel final.
- Validar departamento y municipio contra catalog-ms o solo por formato.
- Componente de pasos (propio o `IvcWizardStepperComponent`, hoy sin uso).
- Diseño fino de índices y de la consulta de búsqueda.
- Numeración exacta de las migraciones.
- Herramientas de prueba.
- Si prefiere el enfoque B (ver Cómo se construye).

## Fuera de la fase 1

Quedan para las fases siguientes. El recorrido animado se conserva solo como contexto.

- La puerta y la base offline (SQLite, cifrado y hash, distribución por CDN, dispositivos).
- La integración con Policía y otras entidades (HU-04).
- Calidad y auditoría (HU-09).
- Solicitudes y Eventos.

Contexto de las fases siguientes: [recorrido animado](../recorrido-ingreso.html).
