# Modelo de datos · Gestión de infractores (IVC SVN, fase 1)

Qué se guarda de cada registro, con qué reglas, y qué se espera recibir si un registro entra por integración.
Fuente: hoja «Diccionario de Datos» de la base de sancionatorios del IVC (adjunta en PROD-45) y el formulario de la demo.

## Resumen

- **55 campos** en 6 bloques (A a F); dirección y representante se despliegan en subcampos (91 filas).
- **Una sola entidad lógica:** el registro de sanción. Infractor y representante viven dentro del registro.
- **Nombres de datos en inglés** (snake_case, como el contrato del back); textos para el usuario en español.
- **Obligatoriedad:** Obligatorio, Opcional, Condicional (obligatorio solo si otro campo lo activa) y Automático (lo calcula el sistema).

## A · Control

Lo pone el sistema al crear el registro.

| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |
|---|---|---|---|---|---|
| 1 | Fecha de Registro | `registration_date` | Fecha | Automático | Al crear un nuevo registro, el campo de fecha debe diligenciarse automáticamente con la fecha actual del sistema, utilizando el formato DD/MM/AAAA. No se debe requerir ingreso manual por parte del usuario. |

## B · Infractor

Identificación, datos personales y dirección.

| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |
|---|---|---|---|---|---|
| 2 | Tipo de Identificación | `person.document_type` | Lista / resultado controlado | Obligatorio | Seleccionar de lista desplegable Decreto 079 de 2012, artículo 7: exige la identificación del infractor. Decreto 1622 de 2022, artículo 2.17.4, numeral 3: define los documentos válidos de identificación. |
| 3 | Número de Identificación | `person.document_number` | Número | Obligatorio | En el caso de cédula de ciudadanía, cedula de extranjería y tarjeta de identidad permitir solo datos numéricos, en caso diferente habilitar para alfanumérico. Decreto 079 de 2012, artículo 7: exige la identificación del infractor. Decreto 1622 de 2022, artículo 2.17.3, numeral 3: define los documentos válidos de identificación. |
| 4 | Nombre(s) | `person.first_names` | Texto | Obligatorio | Campo abierto Decreto 079 de 2012, artículo 7: la decisión debe contener el nombre del infractor. |
| 5 | Apellido(s) | `person.last_names` | Texto | Obligatorio | Campo abierto Decreto 079 de 2012, artículo 7: la decisión debe contener el nombre del infractor. |
| 6 | País de Residencia | `person.residence_country` | Lista / resultado controlado | Obligatorio | Configurar el campo "País" para que cargue por defecto la opción "Colombia" al abrir el formulario. No obstante, la lista desplegable debe contener el catálogo completo de países a nivel mundial, permitiendo al usuario seleccionar un país diferente cuando sea necesario. |
| 7 | Departamento de Residencia | `person.residence_department` | Lista / resultado controlado | Obligatorio | El campo debe mostrar el listado oficial de departamentos de Colombia cuando el país seleccionado sea Colombia. Si se selecciona un país diferente, el campo Departamento deberá bloquearse automáticamente (inhabilitado) y no permitirá la selección o edición de información. |
| 8 | Ciudad o Municipio de Residencia | `person.residence_city` | Lista / resultado controlado | Obligatorio | El campo debe mostrar el listado oficial de la Ciudad y/o Municipios de Colombia dependiendo de la selección del Departamento. Si se selecciona un país diferente, el campo Ciudad y/o Municipio deberá bloquearse automáticamente (inhabilitado) y no permitirá la selección o edición de información. |
| 9.1 | ¿Es zona rural? | `person.is_rural` | Caja de Selección | Obligatorio | Se solicita implementar una caja de selección (check list) obligatoria para validar la respuesta a la pregunta correspondiente. Cuando el país seleccionado sea diferente a Colombia, este campo no deberá visualizarse ni requerirse para el registro. |
| 9.2 | Tipo de Vía | `person.rural_road_type` | Lista / resultado controlado | Condicional | Este campo deberá habilitarse únicamente cuando la respuesta al campo “¿Es zona rural?” sea “Sí”. La selección se realizará desde una lista desplegable previamente parametrizada y su diligenciamiento será obligatorio para continuar con el registro. |
| 9.3 | Información Adicional | `person.rural_additional_info` | Texto | Opcional | Campo abierto para el registro de información complementaria. |
| 10 | Dirección de Residencia | `person.residence_address` | Texto | Obligatorio | Campo de consolidación de dirección bloqueado: La información deberá consolidarse automáticamente según el país seleccionado. Si el país es diferente a Colombia, se habilitará una caja de texto libre para el ingreso de la dirección. En caso contrario, el sistema deberá generar y consolidar automáticamente la dirección con base en la información diligenciada entre los numerales 9.1 al 9.10. Adicionalmente debe consolidarse con las abreviaturas según del tipo de vía. |
| 10.1 | Vía Principal | `person.main_road` | Lista / resultado controlado | Condicional | Este campo deberá habilitarse únicamente cuando la respuesta al campo “¿Es zona rural?” sea “No”. La selección se realizará desde una lista desplegable previamente parametrizada y su diligenciamiento será obligatorio para continuar con el registro. |
| 10.2 | Número | `person.main_road_number` | Número entero | Obligatorio | Campo abierto de diligenciamiento numérico, que permitirá únicamente el ingreso de valores numéricos con un máximo de tres (3) dígitos. El sistema deberá validar que no se registren caracteres alfabéticos, especiales ni una longitud superior a la permitida. |
| 10.3 | Letra | `person.main_road_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.4 | Bis | `person.main_road_bis` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.5 | Letra | `person.main_road_bis_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.6 | Sentido | `person.main_road_direction` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.7 | # | `person.hash_separator` | — | Opcional | Campo bloqueado, configurado con el carácter especial numeral (#) de forma predeterminada, sin permitir su edición por parte del usuario. Este campo tendrá como finalidad realizar la separación de los componentes de la dirección y garantizar la estandarización y normalización de la información al momento de consolidar automáticamente la dirección. |
| 10.8 | Número | `person.cross_road_number` | Número entero | Obligatorio | Campo abierto de diligenciamiento numérico, que permitirá únicamente el ingreso de valores numéricos con un máximo de tres (3) dígitos. El sistema deberá validar que no se registren caracteres alfabéticos, especiales ni una longitud superior a la permitida. |
| 10.9 | Letra | `person.cross_road_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.10 | Bis | `person.cross_road_bis` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.11 | Letra | `person.cross_road_bis_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 10.12 | - | `person.dash_separator` | — | Opcional | Campo bloqueado, configurado con el carácter especial guion (-) de forma predeterminada, sin permitir su edición por parte del usuario. Este campo tendrá como finalidad realizar la separación de los componentes de la dirección y garantizar la estandarización y normalización de la información al momento de consolidar automáticamente la dirección. |
| 10.13 | Número | `person.plate_number` | Número entero | Obligatorio | Campo abierto de diligenciamiento numérico, que permitirá únicamente el ingreso de valores numéricos con un máximo de tres (3) dígitos. El sistema deberá validar que no se registren caracteres alfabéticos, especiales ni una longitud superior a la permitida. |
| 10.14 | Sentido | `person.plate_direction` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria.  Por último al momento de guardar debe realizarse con la abreviatura correspondiente. |
| 10.15 | Información Adicional | `person.additional_info` | Lista / resultado controlado | Opcional | Este campo deberá permanecer bloqueado e inhabilitado por defecto y únicamente se activará cuando exista información registrada en el numeral 9.11. Adicionalmente, se deberá disponer de una opción “Adicionar” que permita agregar hasta cinco (5) registros adicionales, según sea necesario. Cada registro agregado deberá conservar las mismas validaciones y obligatoriedad definidas para el campo principal. Si el numeral 9.11 no se encuentra diligenciado, el campo y la opción de adición deberán permanecer bloqueados. Dejar el campo habilitado unicamente y bloquedos los campos del 10.1 al 10.15 cuando la selección sea diferente a Colombia. |
| 10.16 | Indicación | `person.additional_indication` | Texto | Opcional | Su habilitación y comportamiento estarán condicionados a la opción seleccionada en el campo precedente. Una vez activado, permitirá el ingreso de información complementaria asociada al valor seleccionado. Si el campo anterior no ha sido diligenciado o la opción seleccionada no requiere información adicional, este campo deberá permanecer bloqueado e inhabilitado para edición. |
| 11 | Indicativo País | `person.phone_country_code` | Texto | Opcional | Configurar automaticamente de acuerdo con el país seleccionado. |
| 12 | Número de Teléfono | `person.phone_number` | Número | Opcional | Con un máximo 10 caracteres. |
| 13 | Correo Electrónico | `person.email` | Texto | Opcional | Validaciones lógicas para el correo establecidas en el registro de usuarios |
| 14 | Fecha de Nacimiento | `person.birth_date` | Fecha | Obligatorio | El campo debe permitir la selección de la fecha mediante calendario o el ingreso manual utilizando el formato DD/MM/AAAA. |
| 15 | Edad | `person.age` | Edad | Automático | Campo calculado automáticamente por el sistema a partir de la fecha registrada en el campo "Fecha de Nacimiento del Infractor". En consecuencia, este campo no deberá permitir la edición manual por parte del usuario y deberá permanecer bloqueado de forma automática. La edad se actualizará dinámicamente en años cumplidos, conforme a la fecha de nacimiento ingresada. |
| 16 | Sexo | `person.sex` | Lista / resultado controlado | Obligatorio | Seleccionar de lista desplegable. |
| 17 | ¿Es menor de edad? | `person.is_minor` | Lista / resultado controlado | Automático | La identificación se realiza de conformidad con el cálculo automático, correspondiente a la fecha correspondiente con los hechos. |

## C · Representante

Solo cuando el infractor es menor de edad.

| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |
|---|---|---|---|---|---|
| 18 | Tipo de Identificación | `guardian.document_type` | Lista / resultado controlado | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Tipo de identificación del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del tipo de identificación sean consistentes. |
| 19 | Número de Identificación | `guardian.document_number` | Número | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Número de identificación del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del número de identificación sean consistentes. |
| 20 | Nombre(s) | `guardian.first_names` | Texto | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Nombre(s) del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del nombre(s) sean consistentes. |
| 21 | Apellido(s) | `guardian.last_names` | Texto | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Apellido(s) del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del apellido(s) sean consistentes. |
| 22 | País de Residencia | `guardian.residence_country` | Lista / resultado controlado | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "País de Residencia del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del país de residencia sean consistentes. |
| 23 | Departamento de Residencia | `guardian.residence_department` | Lista / resultado controlado | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Departamento de Residencia del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del departamento consistentes. |
| 24 | Ciudad o Municipio de Residencia | `guardian.residence_city` | Lista / resultado controlado | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Ciudad o Municipio de Residencia del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato de la ciudad o municipio consistentes. |
| 25 | ¿Es zona rural? | `guardian.is_rural` | Caja de Selección | Obligatorio | Se solicita implementar una caja de selección (check list) obligatoria para validar la respuesta a la pregunta correspondiente. Cuando el país seleccionado sea diferente a Colombia, este campo no deberá visualizarse ni requerirse para el registro. |
| 25.1 | Tipo de Vía | `guardian.rural_road_type` | Lista / resultado controlado | Condicional | Este campo deberá habilitarse únicamente cuando la respuesta al campo “¿Es zona rural?” sea “Sí”. La selección se realizará desde una lista desplegable previamente parametrizada y su diligenciamiento será obligatorio para continuar con el registro. |
| 25.2 | Información Adicional | `guardian.rural_additional_info` | Texto | Opcional | Campo abierto para el registro de información complementaria. |
| 26 | Dirección de Residencia | `guardian.residence_address` | Texto | Obligatorio | Campo de consolidación de dirección bloqueado: La información deberá consolidarse automáticamente según el país seleccionado. Si el país es diferente a Colombia, se habilitará una caja de texto libre para el ingreso de la dirección. En caso contrario, el sistema deberá generar y consolidar automáticamente la dirección con base en la información diligenciada entre los numerales 9.1 al 9.10. Adicionalmente debe consolidarse con las abreviaturas según del tipo de vía. |
| 26.1 | Vía Principal | `guardian.main_road` | Lista / resultado controlado | Condicional | Este campo deberá habilitarse únicamente cuando la respuesta al campo “¿Es zona rural?” sea “No”. La selección se realizará desde una lista desplegable previamente parametrizada y su diligenciamiento será obligatorio para continuar con el registro. |
| 26.2 | Número | `guardian.main_road_number` | Número entero | Obligatorio | Campo abierto de diligenciamiento numérico, que permitirá únicamente el ingreso de valores numéricos con un máximo de tres (3) dígitos. El sistema deberá validar que no se registren caracteres alfabéticos, especiales ni una longitud superior a la permitida. |
| 26.3 | Letra | `guardian.main_road_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.4 | Bis | `guardian.main_road_bis` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.5 | Letra | `guardian.main_road_bis_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.6 | Sentido | `guardian.main_road_direction` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.7 | # | `guardian.hash_separator` | — | Opcional | Campo bloqueado, configurado con el carácter especial numeral (#) de forma predeterminada, sin permitir su edición por parte del usuario. Este campo tendrá como finalidad realizar la separación de los componentes de la dirección y garantizar la estandarización y normalización de la información al momento de consolidar automáticamente la dirección. |
| 26.8 | Número | `guardian.cross_road_number` | Número entero | Obligatorio | Campo abierto de diligenciamiento numérico, que permitirá únicamente el ingreso de valores numéricos con un máximo de tres (3) dígitos. El sistema deberá validar que no se registren caracteres alfabéticos, especiales ni una longitud superior a la permitida. |
| 26.9 | Letra | `guardian.cross_road_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.10 | Bis | `guardian.cross_road_bis` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.11 | Letra | `guardian.cross_road_bis_letter` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.12 | - | `guardian.dash_separator` | — | Opcional | Campo bloqueado, configurado con el carácter especial guion (-) de forma predeterminada, sin permitir su edición por parte del usuario. Este campo tendrá como finalidad realizar la separación de los componentes de la dirección y garantizar la estandarización y normalización de la información al momento de consolidar automáticamente la dirección. |
| 26.13 | Número | `guardian.plate_number` | Número entero | Obligatorio | Campo abierto de diligenciamiento numérico, que permitirá únicamente el ingreso de valores numéricos con un máximo de tres (3) dígitos. El sistema deberá validar que no se registren caracteres alfabéticos, especiales ni una longitud superior a la permitida. |
| 26.14 | Sentido | `guardian.plate_direction` | Lista / resultado controlado | Opcional | El campo deberá permitir la selección de un valor previamente parametrizado desde una lista desplegable. Su diligenciamiento será opcional, por lo que el usuario podrá dejarlo sin seleccionar y continuar con el registro sin que se genere una validación obligatoria. |
| 26.15 | Información Adicional | `guardian.additional_info` | Lista / resultado controlado | Opcional | Este campo deberá permanecer bloqueado e inhabilitado por defecto y únicamente se activará cuando exista información registrada en el numeral 9.11. Adicionalmente, se deberá disponer de una opción “Adicionar” que permita agregar hasta cinco (5) registros adicionales, según sea necesario. Cada registro agregado deberá conservar las mismas validaciones y obligatoriedad definidas para el campo principal. Si el numeral 9.11 no se encuentra diligenciado, el campo y la opción de adición deberán permanecer bloqueados. Por último al momento de guardar debe realizarse con la abreviatura correspondiente. |
| 26.16 | Indicación | `guardian.additional_indication` | Texto | Opcional | Su habilitación y comportamiento estarán condicionados a la opción seleccionada en el campo precedente. Una vez activado, permitirá el ingreso de información complementaria asociada al valor seleccionado. Si el campo anterior no ha sido diligenciado o la opción seleccionada no requiere información adicional, este campo deberá permanecer bloqueado e inhabilitado para edición. Dejar el campo habilitado unicamente y bloquedos los campos del 26.1 al 26.15 cuando la selección sea diferente a Colombia. |
| 27 | Indicativo País | `guardian.phone_country_code` | Texto | Opcional | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Configurar automaticamente de acuerdo con el país selccionado. |
| 28 | Número de Teléfono | `guardian.phone_number` | Número | Opcional | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Número de teléfono del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del número de teléfono consistentes. |
| 29 | Correo Electrónico | `guardian.email` | Texto | Opcional | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Correo electrónico del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del correo eletrónico consistentes. |
| 30 | Fecha de Nacimiento | `guardian.birth_date` | Fecha | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Fecha de Nacimiento del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del correo eletrónico consistentes. |
| 31 | Edad | `guardian.age` | Edad | Automático | Campo calculado automáticamente por el sistema a partir de la fecha registrada en el campo "Fecha de Nacimiento del Infractor". En consecuencia, este campo no deberá permitir la edición manual por parte del usuario y deberá permanecer bloqueado de forma automática. La edad se actualizará dinámicamente en años cumplidos, conforme a la fecha de nacimiento ingresada. |
| 32 | Sexo | `guardian.sex` | Lista / resultado controlado | Obligatorio | Dato que se despliega si la respuesta del campo ¿Es menor de edad? corresponde a "SI". Así mismo, se deberá aplicar la regla de negocio y las validaciones definidas para el campo "Sexo del Infractor", garantizando que los valores permitidos, la obligatoriedad, la longitud y el formato del correo eletrónico consistentes. |

## D · Hechos

Qué pasó, dónde y con qué agravantes.

| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |
|---|---|---|---|---|---|
| 33 | Fecha de los Hechos | `incident_date` | Fecha | Obligatorio | El campo debe permitir la selección de la fecha mediante calendario o el ingreso manual utilizando el formato DD/MM/AAAA. Adicionalmente, se debe validar que no sea posible registrar fecha actual o futuras. Al momento de guardar el registro, la fecha ingresada deberá ser anterior a la fecha de expedición del acto administrativo asociado; por lo tanto, no podrá ser igual ni posterior a esta fecha. Decreto 079 de 2012, artículo 7: la decisión debe indicar las circunstancias de tiempo, modo y lugar en que ocurrieron los hechos. |
| 34 | Competición | `competition` | Lista / resultado controlado | Obligatorio | Selección de la lista desplegable. Al seleccionar la opción "Otro" habilite las opciones "Copa Libertadores", "Copa Sudamericana" y "Otro" (Al seleccionar esta última despliegue un campo en blanco en el que se pueda ingresar información manualmente. Decreto 079 de 2012, artículo 7: la decisión debe indicar las circunstancias de tiempo, modo y lugar en que ocurrieron los hechos. |
| 35 | Evento Deportivo (Equipo Local) | `home_team_event` | Lista / resultado controlado | Obligatorio | El campo debe permitir la selección del equipo que actuará como local. El listado de equipos deberá filtrarse de acuerdo con la competición previamente seleccionada. Permita seleccionar cualquiera de los 36 equipos afiliados a DIMAYOR independiente de la Competencia, y en caso de seleccionar la opción "Otro" en el campo 34, permita seleccionar una opción "Otro" y hacer el registro manual de dicho campo (Esto entendiendo que se puede presentar para estos clubes extranjeros). Decreto 079 de 2012, artículo 7: la decisión debe indicar las circunstancias de tiempo, modo y lugar en que ocurrieron los hechos. |
| 36 | Evento Deportivo (Equipo Visitante) | `away_team_event` | Lista / resultado controlado | Obligatorio | El campo debe permitir la selección del equipo que actuará como visitante. El listado de equipos deberá filtrarse de acuerdo con la competición previamente seleccionada. Adicionalmente, el sistema debe validar que el equipo elegido como visitante sea diferente al equipo seleccionado como local, por lo que este último no deberá aparecer como opción disponible en la lista de selección. Permita seleccionar cualquiera de los 36 equipos afiliados a DIMAYOR independiente de la Competencia, y en caso de seleccionar la opción "Otro" en el campo 34, permita seleccionar una opción "Otro" y hacer el registro manual de dicho campo (Esto entendiendo que se puede presentar para estos clubes extranjeros). Decreto 079 de 2012, artículo 7: la decisión debe indicar las circunstancias de tiempo, modo y lugar en que ocurrieron los hechos. |
| 37 | Ciudad de los Hechos | `incident_city` | Lista / resultado controlado | Obligatorio | Listado de ciudades y/o municipios Decreto 079 de 2012, artículo 7: la decisión debe indicar las circunstancias de tiempo, modo y lugar en que ocurrieron los hechos. |
| 38 | Origen De La Obligación (Ley 1453 De 2011) | `obligation_origin` | Lista / resultado controlado | Obligatorio | Lista desplegable que permita la selección de uno o varios registros. Adicionalmente, este campo deberá ser de carácter obligatorio, por lo que el sistema no permitirá guardar el formulario mientras no se haya seleccionado al menos una opción válida. Decreto 079 de 2012, artículo 7: la decisión debe expresar su fundamento. Ley 1445 de 2011, artículos 14 y 15, modificados por los artículos 97 y 98 de la Ley 1453 de 2011: establecen las conductas sancionables. Decreto 1007 de 2012, artículo 17: la información sobre aficionados excluidos debe indicar la causal. |
| 39 | Agravantes de las Conductas | `aggravating_factors` | Lista / resultado controlado | Opcional | Lista desplegable que permita la selección de uno o varios registros. Adicionalmente, este campo NO deberá ser de carácter obligatorio, por lo que el sistema permitirá guardar el formulario sin ninguna opción seleccionada. Decreto 079 de 2012, artículo 7: la decisión debe expresar su fundamento. Ley 1445 de 2011, artículos 14 y 15, modificados por los artículos 97 y 98 de la Ley 1453 de 2011: establecen las conductas sancionables. Decreto 1007 de 2012, artículo 17: la información sobre aficionados excluidos debe indicar la causal. |
| 40 | Descripción Breve de la Conducta | `conduct_description` | Texto | Obligatorio | campo abierto Decreto 079 de 2012, artículo 7: exige incluir la descripción de la conducta. Decreto 1007 de 2012, artículo 17: la información sobre aficionados excluidos debe indicar la causal. |

## E · Sanción

Acto administrativo, ejecutoria y vigencia.

| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |
|---|---|---|---|---|---|
| 41 | Fecha Acto Administrativo | `resolution_date` | Fecha | Obligatorio | El campo debe permitir la selección de la fecha mediante calendario o el ingreso manual utilizando el formato DD/MM/AAAA. Debe ser validado al momento de guardar la información porque debe ser inferior al campo "Fecha de constancia de ejecutoria". Decreto 079 de 2012, artículos 6 y 7: la medida se impone mediante una decisión motivada y, una vez en firme, se remite copia de la resolución. |
| 42 | No. Acto Administrativo | `resolution_number` | Texto | Obligatorio | Campo alfanumérico (Máximo 20 caracteres). Decreto 079 de 2012, artículos 6 y 7: la medida se impone mediante una decisión motivada y, una vez en firme, se remite copia de la resolución. |
| 43 | Fecha de Constancia de Ejecutoria | `enforceability_date` | Fecha | Obligatorio | El campo debe permitir la selección de la fecha mediante calendario o el ingreso manual utilizando el formato DD/MM/AAAA. Debe ser validado al momento de guardar la información porque debe ser superior al campo "Fecha Acto administrativo o resolucion". Decreto 079 de 2012, artículos 6 y 7: la medida se impone mediante una decisión motivada y, una vez en firme, se remite copia de la resolución. Decreto 079 de 2012, artículo 6, parágrafo 4: la prohibición empieza a contabilizarse al día siguiente de la ejecutoria. Además, solo después de quedar en firme se remite la resolución para registrar al infractor. |
| 44 | Tiempo de Sanción en Meses | `sanction_months` | Número entero | Obligatorio | Campo abierto para configurar en meses, de acuerdo con los rango sin embargo solo dejarlo validado para un minimo de tiempo de 6 meses. DECRETO 0079 DE 2012  Artículo 6°. Iniciación del Procedimiento. 6. Cumplimiento de la medida correctiva consistente en multa. Una vez ejecutoriada la medida correctiva consistente en multa, esta se cumplirá en un término máximo de cinco (5) días. Parágrafo 4°. Para el cumplimiento de la medida de prohibición de acudir a escenarios deportivos, el término comenzará a contabilizarse a partir del día siguiente a la ejecutoría de la misma y regirá en todos los escenarios deportivos del territorio nacional en los cuales se lleven a cabo espectáculos deportivos de carácter profesional, con asistencia de público. |
| 45 | Fin de Vigencia de la Prohibición de Ingreso | `restriction_end_date` | Fecha | Automático | Campo bloqueado y su resultado es el calculado a partir del día siguiente a la fecha de constancia de ejecutoría y según el tiempo de la sanción sumarlo para obtener el resultado. Tener en cuenta que el cálculo se debe realizar en meses. Ley 1445 de 2011, artículos 14 y 15, modificados por los artículos 97 y 98 de la Ley 1453 de 2011: fijan los periodos de prohibición según la conducta. |
| 46 | Valor de la Sanción | `fine_amount` | Moneda | Obligatorio | a diligenciar con separadores de miles Ley 1445 de 2011, artículos 14 y 15, modificados por los artículos 97 y 98 de la Ley 1453 de 2011: establecen los rangos de las multa |
| 47 | Estado de la Restricción | `restriction_status` | Lista / resultado controlado | Automático | El estado de la restricción se encuentra Inactiva, cuando el estado de registro y seguimiento corresponda a "Recibido" o "Por Subsanar". El estado de la restricción pasa a Activa, en el momento que el estado del registro sea Validado. El estado de la restricción pasa a Cumplida, un día posterior al vencimiento de la restricción correspondiente al campo "Fin de Vigencia de la Prohibición de Ingreso", configurarse para realizarse automaticamente. |

## F · Registro interno del IVC

Radicados, profesional y observaciones. Solo lo diligencia el IVC.

| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |
|---|---|---|---|---|---|
| 48 | Fecha de Radicado de Entrada | `intake_filing_date` | Fecha | Obligatorio | El campo debe permitir la selección de la fecha mediante calendario o el ingreso manual utilizando el formato DD/MM/AAAA. Debe ser validado al momento de guardar la información porque debe ser superior al campo "Fecha de constancia de ejecutoria". A futuro Según GesDoc |
| 49 | Radicado de Entrada en Mindeporte | `intake_filing_number` | Texto | Obligatorio | Según GESDOC |
| 50 | Respuesta al Radicado | `filing_response` | Texto | Opcional | Según GESDOC |
| 51 | Radicado Contabilidad | `accounting_filing` | Texto | Opcional | Según GESDOC |
| 52 | Radicado Jurídica | `legal_filing` | Texto | Opcional | Según GESDOC |
| 53 | Profesional Responsable IVC | `responsible_officer` | Texto | Obligatorio | Creación de lista a medida que se vaya diligenciando |
| 54 | Estado de Registro y Seguimiento | `record_status` | Lista / resultado controlado | Automático | Lista correspondiente al catálogo. |
| 55 | Observaciones del Procedimiento IVC | `procedure_notes` | Texto | Opcional | Campo abierto |

## Catálogos

Listas parametrizadas del formulario (hoja «Catálogos»).

| Catálogo | Valores |
|---|---|
| `tiposId` | 7 |
| `sexo` | 4 |
| `origen` | 10 |
| `rangoOrigen` | 10 |
| `agravantes` | 3 |
| `competicion` | 5 |
| `otraCompeticion` | 3 |
| `equipos` | 4 |
| `viaRural` | 15 |
| `viaUrbana` | 8 |
| `letra` | 26 |
| `sentido` | 4 |
| `infoAdicional` | 17 |

## Estados

**Del registro** (`record_status`): `received` (Recibido) → `validated` (Validado), o `received` → `to_correct` (Por subsanar) → `validated`. Un registro Por subsanar se corrige y luego se valida; no vuelve a Recibido.

**De la restricción** (`restriction_status`): `inactive` (Inactiva) → `active` (Activa) → `fulfilled` (Cumplida). Solo bloquea con el registro Validado y la fecha dentro de la vigencia; pasa a Cumplida sola al vencer y no se borra.

## Reglas entre campos

- Fecha del acto < ejecutoria < radicado de entrada.
- Fecha de los hechos anterior al acto, y nunca hoy ni futura.
- Representante obligatorio si el infractor era menor en la fecha de los hechos.
- Sin duplicados equivalentes: misma persona, mismo acto y misma vigencia.

## Integración (propuesta de diseño)

- **Qué llegaría:** bloques B a E (infractor, representante si es menor, hechos y sanción), más el identificador de la entidad que reporta y la referencia de su reporte.
- **Qué completa el IVC:** bloque A (fecha de registro, automática), bloque F (radicados, profesional responsable y observaciones) y el estado del registro, que entra como Recibido.
- **Al recibirlo:** se aplican las mismas reglas del formulario; si falla alguna, se rechaza con el detalle de cada campo; si pasa, sigue el flujo normal de validación del IVC.

### Ejemplo de mensaje

```json
{
  "source": {
    "entity": "<id de la entidad que reporta>",
    "reference": "<id del reporte en su sistema>"
  },
  "person": {
    "document_type": "CC",
    "document_number": "1090000001",
    "first_names": "…",
    "last_names": "…",
    "birth_date": "YYYY-MM-DD",
    "sex": "…",
    "residence_country": "Colombia",
    "residence_department": "…",
    "residence_city": "…",
    "is_rural": false,
    "residence_address": "…",
    "phone_number": "…",
    "email": "…"
  },
  "guardian": {
    "document_type": "CC",
    "document_number": "…",
    "first_names": "…",
    "last_names": "…"
  },
  "incident": {
    "incident_date": "YYYY-MM-DD",
    "competition": "…",
    "incident_city": "…",
    "obligation_origin": "1",
    "aggravating_factors": [],
    "conduct_description": "…"
  },
  "sanction": {
    "resolution_date": "YYYY-MM-DD",
    "resolution_number": "…",
    "enforceability_date": "YYYY-MM-DD",
    "sanction_months": 12
  }
}
```
