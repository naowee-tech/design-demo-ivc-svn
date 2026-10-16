# 8 · Portal de la persona *(nueva)*

## La superficie

| | |
|---|---|
| **Quién** | La persona (y el representante legal de un menor) |
| **Dispositivo** | Web móvil |
| **Cuándo** | Cuando recibe un no, o cuando quiere revisar sus ingresos y vínculos |
| **Módulos** | 1 · Medidas (la suya); 2 · Identidad (cuenta, consentimientos); 4 · Control de acceso y comercialización (sus derechos de ingreso) |
| **Pregunta que responde** | ¿Por qué me dijeron que no, hasta cuándo, y qué puedo hacer? |

Existe porque la comercializadora no conoce el motivo de un no (`superficies.md` · *Principio*). Es
donde se cumplen los derechos de la persona sobre sus datos.

**Prototipo:** `apps/portal.js` (ruta `#/portal`, celular): identificarse, Mi estado, cómo controvertirla, otros motivos, ingresos y vínculos, con panel de 7 casos.

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Identificarse** | Que solo la persona vea lo suyo | Documento y verificación (con el ANI o la cuenta); el representante legal entra por el menor. Un menor con solo registro civil se agrega con su representante *(exploratorio)* |
| **Mi estado** | Responder el no | *Sin medidas vigentes*, o la medida: autoridad que la emitió, acto, desde y hasta cuándo, días restantes |
| **Cómo controvertirla** | Saber a quién acudir | Autoridad competente y datos de contacto *(exploratorio: los documentos no cubren la apelación)* |
| **Otros motivos** | Cuando el no no es una medida | *Tu documento no aparece vigente en la Registraduría* · *El nombre no coincide*; qué hacer en cada caso |
| **Mis ingresos** *(exploratorio)* | Ver a qué partidos tiene derecho a entrar | Un derecho de ingreso por partido: evento, sector, documento con el que entra (enmascarado) y estado (*Vigente*, *Ya ingresaste*, *Cambiaste el titular*). Aviso de que el titular se cambia desde la comercializadora hasta el inicio del partido. Se dice «tu ingreso a [partido]», nunca «entrada» ni «boleta». **Dónde se verificó** *(exploratorio)*: en cada ingreso usado, si se verificó con huella y el resultado (*Huella verificada*, *Sin huella · motivo*, *Contingencia*), sin imagen ni puntaje. La ficha del evento dice si un sector pide huella, para saberlo antes de comprar |
| **Consentimientos y vínculos** | Administrar sus datos | Comercializadoras vinculadas, *Revocar*. Sin foto de referencia ni verificación facial: el SVN no guarda rostro *(decisión de producto, 16-oct-2026)*. **Huella registrada** *(exploratorio)*: solo si hubo **enrolamiento propio** (hipótesis B, que no es el diseño base: con la Registraduría en línea el SVN no guarda plantillas y no hay nada que revocar), la persona la ve y puede **revocarla**; se aplica desde el siguiente paquete del evento y no impide entrar (pasa a *No puede dar huella*). Autorización y plazos de retención: **a verificar con jurídica** |

## Qué ve cada rol

La persona ve **solo lo suyo**: su medida con sus hechos y sus derechos de ingreso. El representante
legal ve los del menor que representa. No hay confianza de identidad: el documento es la llave, y la huella (si el evento la usa) solo confirma quién es en la puerta. La persona puede **apelar** un *no coincide* por soporte *(exploratorio)*.

## Reglas que hace cumplir

- **La medida se cumple sola**: al vencer, *Mi estado* pasa a *Sin medidas vigentes* sin trámite.
- **Revocar un vínculo no corta operaciones en curso.**
- **Cada consulta queda auditada**, como cualquier otra.

---

## Auditoría del demo

No existe. El demo termina en la caja roja del rechazo de compra (ver `07`), sin salida para la persona.

## Preguntas abiertas

- ¿Con qué se identifica la persona sin cuenta: una consulta al ANI con preguntas de seguridad, o la
  cuenta de la plataforma?
- ¿La apelación la recibe el IVC o la autoridad de policía que emitió el acto?
