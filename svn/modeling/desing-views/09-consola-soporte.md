# 9 · Consola de soporte *(decisión de producto)*

## La superficie

| | |
|---|---|
| **Quién** | Soporte |
| **Dispositivo** | Web de escritorio |
| **Cuándo** | Continuo, con pico antes del inicio de cada partido (cierre de transferencias) |
| **Módulos** | 4 · Boletería (boletas, transferencias); *Auditoría* |
| **Pregunta que responde** | ¿Qué le pasó a esta boleta y cómo se resuelve la reclamación? |

**Prototipo:** `apps/soporte.js` (ruta `#/soporte`, escritorio): cola de reclamaciones, traza de la boleta y acciones según el estado, con panel de 9 casos.

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Reclamaciones** | Atender lo que llega | Bandeja con estado, persona, evento y el inicio del partido, que cierra las transferencias |
| **Traza de una boleta** | Reconstruir su vida | Consultas de la compra, titular validado, token, transferencias e ingreso, en una línea de tiempo |
| **Transferir boletas congeladas** | Resolver el caso previsto por el dominio | Boletas de un propietario que quedó con medida; transferir la propiedad a otra persona elegible (se valida) |

## Estados

- **Boleta**: asignada (emitida, con token) → usada · anulada · **congelada**. Antes de pagar no es
  boleta todavía: es una línea de la reserva, con su titular validado.
- **Reclamación** *(decisión de producto)*: abierta → en gestión → resuelta · rechazada.

## Qué ve cada rol

Soporte ve la traza de boletas y el resultado de las validaciones, **no el expediente** de una medida.

## Reglas que hace cumplir

- **Efecto individual de una medida nueva**: se anula la boleta del sancionado y se congelan sus
  boletas no usadas, que no pueden transferirse; las de otros titulares siguen válidas.
- **Una transferencia valida a los dos lados.**
- **Después del inicio del encuentro no se transfiere nada.**

---

## Auditoría del demo

No existe. Lo más cercano es la tabla *Boletas emitidas* de la consola de puerta
(`index.html:343-366`), que muestra código, titular, token y estado, pero sin historial ni acciones.

## Preguntas abiertas

- ¿Soporte es de Naowee, de Mindeporte o de cada comercializadora? Define qué datos puede ver.
