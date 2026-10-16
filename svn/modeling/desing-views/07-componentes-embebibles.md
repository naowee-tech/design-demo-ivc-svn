# 7 · Componentes embebibles *(decisión de producto)*

## La superficie

| | |
|---|---|
| **Quién** | El hincha, dentro del canal de la comercializadora |
| **Dispositivo** | La web o la app de la comercializadora |
| **Cuándo** | Al registrarse, al comprar y al asignar los titulares |
| **Módulos** | 2 · Identidad (cuenta, @usuario, consentimiento); 4 · Boletería y asignación (titulares de la compra) |
| **Pregunta que responde** | ¿Soy yo, y puedo comprar este ingreso para esta persona? |

Es lo único nuestro que el hincha ve dentro de un canal ajeno. Lo demás (la página, el pago, el
diseño) es de la comercializadora.

**Paso del flujo:** 2 (comprar y asignar ingresos, en diseño; prototipo `#/compra` reservado).

**En la compra el SVN se consulta tres veces** *(decisiones D1-D6 del modelo de compra)*:
1. **Consulta 1 · al identificarse:** ¿puede comprar?
2. **Consulta 2 · por titular:** al asignar cada ingreso, ¿puede recibirlo? Sin aceptación del titular.
3. **Consulta 3 · al pagar:** revalida al comprador y a todos los titulares; emite un token por ingreso.

El hincha nunca ve el motivo de un no. Después de pagar, ve «Tu ingreso a [partido]» a su nombre y puede cambiar el titular hasta el inicio del partido.

## Componentes

| Componente | Para qué | Contenido clave |
|---|---|---|
| **Ingresar con [plataforma]** | Identificarse una vez para todas las comercializadoras | Registro o inicio de sesión con el @usuario; consentimiento para vincular esa comercializadora |
| **Titulares de la compra** | Asignar cada ingreso a su titular antes de pagar | Una tarjeta por ingreso con tipo, número de documento y nombre; «Yo también voy»; reloj de la reserva; *Continuar al pago* deshabilitado hasta validar todas, con la razón |
| **Resultado de la validación** | Lo que ve el hincha cuando el SVN dice que no | *"No es posible continuar. Consulta tu estado en [portal]"*, con el enlace al portal de la persona (8). Nunca el motivo |
| **Validación de documento** | Confirmar al titular por su documento, sin foto ni prueba de vida | Tipo y número de documento y nombre, cotejados con el ANI; el widget no captura rostro ni huella: la huella solo se verifica en la puerta (`dominio.md` · *Identidad: documento y, opcionalmente, huella*) |

## Estados

- **Titular de un ingreso** (durante la compra): vacío → validando → ok · denegado. Después de pagar
  no hay estados «invitada» ni «sin titular».
- **Vínculo con la comercializadora**: activo → revocación solicitada → revocado (sin cortar
  operaciones en curso).

## Reglas que hace cumplir

- **La elegibilidad se valida al asignar cada titular (consulta 2) y otra vez al pagar (consulta 3).**
- **No se paga con un ingreso sin titular validado.**
- **El hincha nunca ve el motivo del no** dentro del canal de la comercializadora.
- **Vincular requiere consentimiento**, y revocar es un trámite sin cortes a mitad de camino.

---

## Auditoría del demo

No existen. Lo más cercano es el **resultado de compra del simulador** (`app.js:395-442`,
`mobile.html:1463-1523`), que muestra lo que vería el hincha:

**Qué conservar:** la boleta emitida en el móvil del demo original, con el nombre grande, filas claras y el QR como
protagonista.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **El rechazo le cuenta al hincha el motivo legal** (*"medida restrictiva vigente… prohibición legal de emitir boletas a ciudadanos con restricción activa"*), delante de quien mire la pantalla. | `app.js:431-439`, `mobile.html:1513-1522` |
| Alto | El rechazo no deja salida: no dice a dónde ir ni cómo consultar su estado. | `app.js:431-439` |
| Medio | El QR de la boleta se genera en un servicio externo con el código en la URL. | `mobile.html:1467` |

- *(decisión de producto, 1-oct-2026)* Por ahora la asignación de cada ingreso adicional es solo por documento; el @usuario queda para una siguiente versión.

- *(decisión de producto, 1-oct-2026)* La comercializadora no nombra al SVN al usuario final; la consulta se presenta como consulta a base de datos.

## Preguntas abiertas

- ¿Las comercializadoras aceptan embeber un componente nuestro, o prefieren implementar la
  experiencia con la API y una guía de contenido?
- Si se muestra en el demo, que sea dentro de una tiquetera ficticia neutra, sin imitar marcas reales.
