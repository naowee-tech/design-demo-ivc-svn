# IVC · Control de acceso (demo)

Demo navegable del módulo **Control de acceso** del IVC (Inspección, Vigilancia y Control · Ministerio del Deporte), Parte 1: gestión de infractores según la HU-26.3.

**Ver la demo:** https://naowee-tech.github.io/design-demo-ivc-svn/

Abre en el login del SUID. Es un login de demostración: entra con cualquier dato, incluso vacío.

## Qué tiene

Dentro del panel del IVC, la sección **Control de acceso** tiene cuatro pantallas:

| Pantalla | Qué hace |
|---|---|
| Búsqueda | Consulta si una persona tiene una medida vigente y hasta cuándo. Los menores solo por documento completo |
| Gestión | Bandeja, ficha con historial, registro de infractor (55 campos), edición y carga masiva |
| Solicitudes | Reportes de entidades deportivas e inspecciones; se enlazan a una medida de Gestión |
| Eventos | Backoffice del organizador (superficie 4 del SVN): escenario, evento y partidos, configuración, cupos y listo para abrir |

El resto del menú (Bandeja, Aprobación de actos, etc.) es el del IVC real y no tiene contenido en esta demo.

## Casos de prueba ocultos

Con **Ctrl/⌘ + Shift + L** (en el IVC y en el SVN) se abre un panel con 20 personas ficticias: 10 con caso (libres de antecedentes, vigente, por vencer, cumplida, registro recibido, menor, reincidente, extranjero) y 10 cédulas libres que nunca han estado en el sistema. Tocar una fila copia la cédula; el chevron fuerza su estado; el selector de arriba salta a otra vista de la demo; ↺ reinicia todo.

- Los datos viven en `shared/demo-casos.data.js` (JSON) y la lógica en `shared/demo-casos.js`. Las sanciones se guardan en el mismo almacén de Gestión, así que IVC, comercializadora y reportes ven lo mismo.
- Al escribir una de esas cédulas en el alta de sanciones (o en «Reportar incidente» de Entidades) el formulario se completa solo.
- Un reporte enviado desde Entidades llega a Solicitudes; de ahí se tramita hasta la sanción, que bloquea la compra en la comercializadora.
- Cada persona trae un historial fijo (devoluciones, validación y, si aplica, antecedentes ya cumplidos).
- La puerta aún no lee este estado.

## Datos

Todos los datos son **ficticios** y se guardan en el `localStorage` del navegador. Nada sale de tu equipo. El botón "Restablecer datos de la demo" (pie de la bandeja de Gestión) los devuelve al estado inicial; los casos de prueba se reponen solos.

## Estructura

- `index.html`: login.
- `suid/`: la demo (shell, vistas y datos). Detalle en [`suid/README.md`](suid/README.md).
- `shared/`, `profesional/`, `coordinador/`, `director/`, `usuario-externo/`, `selector-perfiles-ivc.html`: copia del repositorio interno de diseño, usada como base de estilos y componentes.

HTML, CSS y JS planos, sin build. Se puede abrir con doble clic en `index.html` o servir con cualquier servidor estático.
