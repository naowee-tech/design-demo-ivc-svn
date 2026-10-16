# 9 · Consola de soporte *(decisión de producto)*

## La superficie

| | |
|---|---|
| **Quién** | Soporte |
| **Dispositivo** | Web de escritorio |
| **Cuándo** | Continuo, con pico antes del inicio de cada partido (cierre de transferencias) |
| **Módulos** | 4 · Control de acceso y comercialización (derechos de ingreso, transferencias); *Auditoría* |
| **Pregunta que responde** | ¿Qué le pasó al derecho de ingreso de este documento y cómo se resuelve la reclamación? |

**Prototipo:** `apps/soporte.js` (ruta `#/soporte`, escritorio): cola de reclamaciones, traza del derecho de ingreso y acciones según el estado, con panel de 10 casos.

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Reclamaciones** | Atender lo que llega | Bandeja con estado, persona, evento y el inicio del partido, que cierra las transferencias. Tipos *(exploratorio)*: documento sin derecho de ingreso en la puerta, ya ingresó, puerta equivocada, cédula prestada reportada, derechos congelados, compra rechazada por medida, identidad y límite |
| **Traza del derecho de ingreso** | Reconstruir su vida | Consultas de la compra, derecho registrado (documento, evento y sector), lecturas en la puerta, transferencias e ingreso, en una línea de tiempo |
| **Transferir la titularidad** | Resolver el caso previsto por el dominio | Derechos de ingreso congelados por una medida nueva del comprador; transferir la titularidad a otro documento elegible (se valida a los dos lados) y el derecho queda vigente para ese documento *(exploratorio)* |

## Estados

- **Derecho de ingreso** *(exploratorio)*: vigente → usado · anulado · **congelado**. Nace al pagar, por
  documento + evento + sector; antes de pagar es solo una línea de la reserva con su titular validado.
  La silla es dato de la comercializadora y no hace parte del derecho.
- **Reclamación** *(decisión de producto)*: abierta → en gestión → resuelta · rechazada.

## Qué ve cada rol

Soporte ve la traza de los derechos de ingreso y el resultado de las validaciones, **no el expediente**
de una medida. Tampoco ve rostro ni foto de referencia: el SVN no los guarda.

## Reglas que hace cumplir

- **Efecto individual de una medida nueva**: se anula el derecho del documento sancionado y se congelan
  los derechos no usados que compró, que el comprador ya no puede transferir; los de otros documentos
  siguen válidos hasta que soporte transfiera su titularidad.
- **Una transferencia de titularidad valida a los dos lados.**
- **Después del inicio del encuentro no se transfiere nada.**

---

## Auditoría del demo

No existe. Lo más cercano es la tabla *Boletas emitidas* de la consola de puerta
(`index.html:343-366`), que muestra código, titular, token y estado, pero sin historial ni acciones.

## Preguntas abiertas

- ¿Soporte es de Naowee, de Mindeporte o de cada comercializadora? Define qué datos puede ver.
