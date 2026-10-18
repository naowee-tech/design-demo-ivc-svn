/* Datos del prototipo. Todo ficticio: ningún nombre ni documento sale de los insumos. */
/* Fechas relativas a hoy y adaptador al resolver del IVC (shared/demo-casos.js): las apps nunca leen GI directo. */
window.SVN_UTIL = (function () {
  var M3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var MM = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIA = 86400000;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dia(off, base) { var d = base ? new Date(base + 'T12:00:00') : new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + (off || 0)); return d; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  // `off` días desde hoy (o desde `base`, ISO): { iso, corto: '29 sep', largo: '29 sep 2026', dia: 'martes', num, mes }.
  function rel(off, base) {
    var d = dia(off, base), c = d.getDate() + ' ' + M3[d.getMonth()];
    return { iso: iso(d), corto: c, largo: c + ' ' + d.getFullYear(), dia: DS[d.getDay()], num: d.getDate(), mes: MM[d.getMonth()] };
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  // «Hoy · lunes 28 de septiembre», «Mañana · …», «Ayer · …» o «Sábado 3 de octubre».
  function etiquetaDia(off) {
    var r = rel(off), b = r.dia + ' ' + r.num + ' de ' + r.mes;
    return off === 0 ? 'Hoy · ' + b : off === 1 ? 'Mañana · ' + b : off === -1 ? 'Ayer · ' + b : cap(b);
  }
  function fechaIso(t) { var d = parse(t); return d.getDate() + ' ' + M3[d.getMonth()] + ' ' + d.getFullYear(); }
  function hoyIso() { return iso(dia(0)); }
  function diasEntre(a, b) { return Math.round((parse(b) - parse(a)) / DIA); }
  function sumar(isoF, n) { return iso(dia(n, isoF)); }

  /* ---------- Resolver, bus y claves ---------- */
  function cod(t) {
    var m = /\(([A-Z]+)\)/.exec(String(t || '')), c = (m ? m[1] : String(t || '')).trim().toUpperCase();
    return c === 'PA' || c === 'PASAPORTE' ? 'P' : c;
  }
  function limpio(n) { return String(n == null ? '' : n).replace(/[^A-Za-z0-9]/g, ''); }
  function clave(t, n) { return cod(t) + '|' + limpio(n).toUpperCase(); }
  function deClave(k) { var p = String(k || '').split('|'); return { tipo: p[0] || 'CC', num: p[1] || '' }; }
  // null si el resolver no está o el documento no existe en el IVC ni en la demo.
  function res(tipo, num, vista, hoy) {
    var d = window.DemoCasos;
    if (!d || !d.resolver || !limpio(num)) { return null; }
    try { return d.resolver(cod(tipo), limpio(num), { vista: vista, hoy: hoy }); } catch (e) { return null; }
  }
  function emitir(o) { return window.DemoBus ? window.DemoBus.emitir(o) : null; }
  function leerBus(f) { return window.DemoBus ? window.DemoBus.leer(f) : []; }
  function suscribir(fn) { return window.DemoBus ? window.DemoBus.suscribir(fn) : function () {}; }

  /* ---------- Medidas desde los registros de GI ---------- */
  // «Pretender ingresar o ingerir bebidas alcohólicas… (art. 97, 6)» a partir del catálogo del IVC.
  function conducta(i) {
    var t = (window.GI_CAT && window.GI_CAT.origen[i]) || '', m = /^(\w)[.)]\s+Art\. (\d+) - (.*?)\.?$/.exec(t);
    return m ? m[3] + ' (art. ' + m[2] + ', ' + m[1] + ')' : t.replace(/^\w[.)]\s+/, '').replace(/\.$/, '');
  }
  // Una medida por registro validado: fin y estado salen de GI.derive, `hoy` solo desplaza el día de lectura.
  function medidas(r, hoy) {
    var D = window.GI && window.GI.derive, h = hoy || hoyIso();
    return (r ? r.registros : []).filter(function (x) { return x.estadoRegistro === 'Validado'; }).map(function (x) {
      var fin = D.finVigencia(x), vig = h <= fin, desde = sumar(x.fechaEjecutoria, 1);
      return { id: x.id, reg: x, conductas: (x.origen || []).map(conducta), acto: x.numActo, autoridad: 'Inspección municipal de ' + (x.ciudadHechos || x.ciudad || 'la jurisdicción'),
        ejecutoria: x.fechaEjecutoria, desde: desde, fin: fin, vigente: vig, dias: diasEntre(h, fin), total: diasEntre(desde, fin) + 1, hechos: x.fechaHechos,
        evento: [x.local, x.visitante].filter(Boolean).join(' vs. '), descripcion: x.descripcion };
    }).sort(function (a, b) { return a.fin < b.fin ? 1 : -1; });
  }
  function representante(r) {
    var p = r && r.fuente === 'demo' && window.DemoCasos && window.DemoCasos.personas.filter(function (x) { return x.id === r.persona.id; })[0];
    var rep = (p && p.rep) || (r && r.registros.map(function (x) { return x.rep; }).filter(Boolean)[0]) || null;
    return rep ? { tipo: cod(rep.tipoId), num: limpio(rep.numId), nombre: (rep.nombres + ' ' + rep.apellidos).trim() } : null;
  }
  // Personas del SVN que no están en el IVC: sin registro, el resolver devuelve null y la identidad sale de aquí.
  var FIJOS = {
    'CC|1036482117': 'Andrés Felipe Restrepo Gil', 'CC|1152708339': 'Mariana Cárdenas Ríos', 'CC|1017889214': 'Daniela Gómez Arias', 'CC|1037664905': 'Santiago Mejía Correa'
  };
  function identidad(t, n) {
    var r = res(t, n, 'ivc');
    if (r) { return { nombre: (r.persona.nombres + ' ' + r.persona.apellidos).trim(), fuente: r.fuente, r: r }; }
    var k = clave(t, n);
    return FIJOS[k] ? { nombre: FIJOS[k], fuente: 'svn', r: null } : null;
  }
  return { rel: rel, etiquetaDia: etiquetaDia, fechaIso: fechaIso, hoyIso: hoyIso, diasEntre: diasEntre, sumar: sumar, parse: parse, cod: cod, clave: clave, limpioNum: limpio, deClave: deClave, res: res,
    emitir: emitir, leer: leerBus, suscribir: suscribir, conducta: conducta, medidas: medidas, representante: representante, identidad: identidad, FIJOS: FIJOS, EVENTO: 'EV-2026-0412' };
})();
(function () {
var U = window.SVN_UTIL, R = U.rel;
window.SVN_DATOS = {
  entidad: { nombre: 'Ministerio del Deporte', sigla: 'Mindeporte', monograma: 'MD', sistema: 'Sistema de Validación Nacional' },

  // Las 9 superficies de modeling/superficies.md, con sus grupos.
  grupos: [
    { id: 'estado', nombre: 'Estado · Mindeporte' },
    { id: 'evento', nombre: 'Operación del evento' },
    { id: 'integracion', nombre: 'Integración' },
    { id: 'persona', nombre: 'Persona y soporte' }
  ],
  apps: [
    // Orden y `paso` del gate: secuencia consecutiva 1 a 9, sin saltos (DC-423).
    // `oculta` solo las saca del gate por aplicación: portal y soporte siguen con su ruta y sus roles. `n` = superficie del modelo.
    // `quien` es solo la etiqueta de la card (DC-402 a DC-408); `roles` manda en la sesión y en la pestaña por rol.
    { paso: 1, n: 1, id: 'fase0', grupo: 'estado', nombre: 'Integración de actores', quien: 'IVC', disp: 'Animación', icono: 'categories', roles: ['ivc'], ruta: '../fase0/index.html' },
    { paso: 2, n: 1, id: 'registro', grupo: 'estado', nombre: 'Registro de medidas', quien: 'IVC', disp: 'Escritorio', icono: 'file', roles: ['ivc'], ruta: '../index.html' },
    { paso: 3, n: 6, id: 'integracion', grupo: 'integracion', nombre: 'API y portal de integración', quien: 'Entidades', disp: 'Portal web', icono: 'link', roles: ['comercializadora'], ruta: '#/integracion' },
    { paso: 4, n: 2, id: 'entidades', grupo: 'estado', nombre: 'Entidades y comercializadoras', disp: 'Escritorio', icono: 'official-stores', roles: ['club', 'comercializadora'], ruta: '#/entidades' },
    { paso: 5, n: 4, id: 'backoffice', grupo: 'evento', nombre: 'Backoffice de eventos', quien: 'IVC', disp: 'Escritorio', icono: 'calendar', roles: ['organizador'], ruta: '../suid/app.html#/control-acceso/eventos' },
    { paso: 6, n: '6 y 7', id: 'compra', grupo: 'integracion', nombre: 'Comprar y asignar ingresos', quien: 'Comercializadora > Persona', disp: 'Celular · escritorio', icono: 'payment', roles: ['persona', 'comercializadora'], ruta: '#/compra' },
    { paso: 7, n: 5, id: 'puerta', grupo: 'evento', nombre: 'Acceso en puerta', disp: 'Celular · tablet · consola', icono: 'qr-code', roles: ['operador', 'policia'], ruta: '#/puerta' },
    { paso: 8, n: 3, id: 'pmu', grupo: 'estado', nombre: 'Monitor PMU', disp: 'Tablet · escritorio', icono: 'view-grid', roles: ['policia', 'supervisor'], ruta: '#/policia' },
    // Autoridad primero (roles[0]). Auditoría vive en el IVC: Eventos > Pasados > Registros; apps/auditoria.js queda de respaldo.
    { paso: 9, n: 3, id: 'auditoria', grupo: 'estado', nombre: 'Auditoría', quien: 'IVC', disp: 'Escritorio', icono: 'history', roles: ['policia', 'mindeporte'], ruta: '../suid/app.html#/control-acceso/eventos?momento=pasados' },
    { oculta: true, n: 8, id: 'portal', grupo: 'persona', nombre: 'Portal de la persona', disp: 'Web móvil', icono: 'user', roles: ['persona'], ruta: '#/portal' },
    { oculta: true, n: 9, id: 'soporte', grupo: 'persona', nombre: 'Consola de soporte', disp: 'Escritorio', icono: 'helper', roles: ['soporte'], ruta: '#/soporte' }
  ],

  // Roles de dominio.md. `ruta` solo en los que ya tienen pantalla.
  roles: [
    // En el orden del flujo de la demo; los que no tienen `ruta` bajan a chips en ese mismo orden.
    { id: 'organizador', rol: 'Organizador', ini: 'OR', color: 'pink', desc: 'Configura escenario, evento y puertas.', app: 'backoffice', ruta: '../suid/app.html#/control-acceso/eventos' },
    { id: 'comercializadora', rol: 'Comercializadora', ini: 'CO', color: 'cyan', desc: 'Se integra y consulta en cada venta.', app: 'integracion', ruta: '#/integracion' },
    { id: 'persona', rol: 'Persona', ini: 'PE', color: 'orange', desc: 'Consulta su estado y sus ingresos.', app: 'portal', ruta: '#/portal' },
    { id: 'operador', rol: 'Operador de puerta', ini: 'OP', color: 'orange', desc: 'Lee documentos; en un rojo decide si llama a la autoridad.', app: 'puerta', ruta: '#/puerta' },
    { id: 'policia', rol: 'Autoridad de seguridad', ini: 'AS', color: 'blue', desc: 'Sigue el evento en vivo, atiende los rojos y consulta la auditoría.', app: 'pmu', ruta: '#/policia' },
    { id: 'ivc', rol: 'Profesional del IVC', ini: 'IV', color: 'purple', desc: 'Radica las medidas desde el oficio.', app: 'registro', ruta: '../index.html' },
    { id: 'mindeporte', rol: 'Mindeporte', ini: 'MD', color: 'amber', desc: 'Consulta la auditoría; homologa comercializadoras.', app: 'auditoria', ruta: '../suid/app.html#/control-acceso/eventos?momento=pasados' },
    { id: 'supervisor', rol: 'Supervisor del evento', ini: 'SE', color: 'teal', desc: 'Sigue ingresos y alertas en vivo.', app: 'pmu' },
    { id: 'club', rol: 'Club o entidad', ini: 'CL', color: 'green', desc: 'Reporta su comercializadora e incidentes.', app: 'entidades', ruta: '#/entidades' },
    { id: 'soporte', rol: 'Soporte', ini: 'SO', color: 'blue', desc: 'Resuelve reclamaciones de ingreso.', app: 'soporte', ruta: '#/soporte' }
  ],

  // Huella modular (hipótesis 16-oct-2026): apagada de salida; la excepción por sector solo rige con el módulo encendido.
  evento: { puerta: 'Puerta 4 · Oriental', partido: 'Nacional vs. Medellín', hora: '19:00', escenario: 'Estadio Atanasio Girardot', huella: { modo: 'apagada', sectores: { 'Oriental Alta': 'obligatoria' } } },

  // Casos de la puerta. La puerta revisa el documento (derecho de ingreso), no la boleta. Rojo por medida: sin nombre y con alerta al PMU.
  // Rojo operativo: con nombre y Autoridad opcional. Los antecedentes entran como verde y solo generan un aviso al PMU (policia.tablero.avisosPuerta).
  casos: [
    { id: 'verde', foto: 'assets/fotos/verde.webp', punto: 'verde', etiqueta: 'Entra escaneando cédulas', color: 'verde', nombre: 'Andrés Felipe Restrepo Gil', doc: 'CC 1.036.482.117', detalle: 'Oriental Baja · Fila E · Silla 18' },
    { id: 'solocc', foto: 'assets/fotos/verde-cc.webp', punto: 'verde', etiqueta: 'Entra solo con cédula', color: 'verde', digitado: true, nombre: 'Felipe Osorio Marín', doc: 'CC 1.037.615.208', detalle: 'Oriental Baja · Fila H · Silla 12', registro: 'Entró · documento digitado · Oriental Baja' },
    { id: 'medida', foto: 'assets/fotos/rabioso.webp', punto: 'rojo', etiqueta: 'Medida vigente', color: 'rojo', doc: 'CC •••• 4447', clave: 'CC|71894447' },
    { id: 'sin', foto: 'assets/fotos/amarillo.webp', punto: 'rojo', etiqueta: 'Sin ingreso a este partido', color: 'rojo', operativo: true, causa: 'Sin ingreso a este partido', nombre: 'Sebastián Cardona Ruiz', doc: 'CC 1.152.708.664' },
    { id: 'usada', foto: 'assets/fotos/sospechoso-sin.webp', punto: 'rojo', etiqueta: 'Ya ingresó', color: 'rojo', operativo: true, causa: 'Ya ingresó', nombre: 'Mateo Giraldo Paz', doc: 'CC 1.001.246.583' },
    { id: 'puerta', foto: 'assets/fotos/verde-cc.webp', punto: 'rojo', etiqueta: 'Puerta equivocada', color: 'rojo', operativo: true, sinPolicia: true, causa: 'Puerta equivocada', dato: 'Diríjase a la Puerta 6 · Sur', nombre: 'Camilo Andrés Vélez Soto', doc: 'CC 1.020.553.771' },
    { id: 'prestada', foto: 'assets/fotos/sospechoso-otro.webp', punto: 'rojo', etiqueta: 'Posible cédula prestada', color: 'rojo', operativo: true, prestada: true, causa: 'Posible cédula prestada', dato: 'La foto del documento no coincide con la persona', nombre: 'Andrés Zuluaga Mejía', doc: 'CC 1.017.335.902' },
    // Con huella: el verde es candidato y la lectura simulada (`huella`) fija el resultado. `modo` es el mínimo con el que el caso tiene sentido.
    { id: 'huella-ok', foto: 'assets/fotos/verde.webp', punto: 'verde', etiqueta: 'Huella coincide', color: 'verde', huella: 'coincide', modo: 'opcional', que: 'La huella coincide: entra como identidad verificada', nombre: 'Laura Camila Ortiz Pérez', doc: 'CC 1.020.714.390', detalle: 'Oriental Baja · Fila C · Silla 9' },
    { id: 'huella-excepcion', foto: 'assets/fotos/verde-cc.webp', punto: 'verde', etiqueta: 'No puede dar huella', color: 'verde', huella: 'ilegible', modo: 'opcional', que: 'Tres lecturas ilegibles: pasa a ingreso sin huella con motivo', nombre: 'Jairo Alberto Mena Cruz', doc: 'CC 1.037.902.455', detalle: 'Oriental Baja · Fila K · Silla 3' },
    { id: 'huella-sinref', foto: 'assets/fotos/amarillo.webp', punto: 'verde', etiqueta: 'Sin huella de referencia', color: 'verde', huella: 'sinref', modo: 'opcional', que: 'El documento no tiene huella de referencia: no hay lectura', nombre: 'Yusmary Josefina Rojas Colmenares', doc: 'CE 884.201', detalle: 'Oriental Alta · Fila A · Silla 14' },
    { id: 'huella-lector', foto: 'assets/fotos/verde.webp', punto: 'verde', etiqueta: 'Lector de huella sin servicio', color: 'verde', huella: 'lector', modo: 'opcional', que: 'Apaga el lector: sin huella hasta que el supervisor active la contingencia', nombre: 'Mónica Patricia Ariza Lozano', doc: 'CC 1.098.331.760', detalle: 'Oriental Baja · Fila F · Silla 21' },
    { id: 'huella-no', foto: 'assets/fotos/sospechoso-otro.webp', punto: 'rojo', etiqueta: 'Huella no coincide', color: 'verde', huella: 'no', modo: 'opcional', que: 'Tiene derecho de ingreso, pero la huella no coincide con el documento: tres lecturas legibles y rojo', nombre: 'Esteban Cardona Arias', doc: 'CC 1.001.774.218', detalle: 'Oriental Baja · Fila D · Silla 7' },
    { id: 'huella-sinderecho', foto: 'assets/fotos/sospechoso-sin.webp', punto: 'rojo', etiqueta: 'Huella válida, sin derecho de ingreso', color: 'rojo', operativo: true, base: 'sin', huella: 'coincide', modo: 'opcional', que: 'La huella coincide, pero el documento no tiene derecho de ingreso', causa: 'Sin ingreso a este partido', registro: 'No entró · sin derecho de ingreso (huella coincide)', nombre: 'Hernán Darío Quintero Salas', doc: 'CC 1.044.205.836' },
    { id: 'huella-medida', foto: 'assets/fotos/rabioso.webp', punto: 'rojo', etiqueta: 'Huella válida con medida vigente', color: 'rojo', base: 'medida', huella: 'coincide', modo: 'opcional', que: 'La huella coincide, pero la medida vigente cierra el paso: alerta al PMU', doc: 'CC •••• 0004', clave: 'CC|1090000004' }
  ],

  // El operador no ve los antecedentes: se guardan en `aviso` y la auditoría del turno los recoge.
  historial: [
    { color: 'verde', texto: 'Entró · Oriental Baja', hora: '18:39', lectura: true },
    { color: 'verde', texto: 'Entró · Oriental Baja', hora: '18:37', lectura: true, aviso: 'Medida levantada' },
    { color: 'verde', texto: 'Entró · Oriental Alta', hora: '18:36', lectura: true },
    { color: 'verde', texto: 'Entró · Oriental Baja', hora: '18:35', lectura: true }
  ],
  turno: { ingresos: 312, rojos: 1 },

  // Vista de seguridad: señales explicables, sin puntaje. Solo el club afín decide un acceso.
  policia: {
    // Eventos de la jurisdicción: la primera pantalla de la autoridad de seguridad. `tablero: true` abre el tablero armado.
    eventos: [
      { id: 'e1', estado: 'vivo', fecha: R(0).iso, dia: U.etiquetaDia(0), hora: '19:00', partido: 'Nacional vs. Medellín', competicion: 'Liga profesional · fecha 12', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', foto: 'atanasio', nota: 'Puertas abiertas', dato: { principal: '4.812', total: '38.000', etiqueta: 'ingresados' }, alertas: 2, tablero: true },
      { id: 'e2', estado: 'vivo', fecha: R(0).iso, dia: U.etiquetaDia(0), hora: '18:00', partido: 'Junior vs. Santa Fe', competicion: 'Liga profesional · fecha 12', escenario: 'Estadio Metropolitano', ciudad: 'Barranquilla', foto: 'metropolitano', nota: 'En juego · 2.º tiempo', dato: { principal: '41.230', total: '46.000', etiqueta: 'ingresados' }, alertas: 0, estados: { nueva: 0, atencion: 1, cerrada: 3 } },
      { id: 'e3', estado: 'proximo', fecha: R(1).iso, dia: U.etiquetaDia(1), hora: '20:00', partido: 'Millonarios vs. América', competicion: 'Liga profesional · fecha 12', escenario: 'Estadio El Campín', ciudad: 'Bogotá', foto: 'campin', nota: 'Puertas abren 17:30', dato: { principal: '28.400', total: '36.000', etiqueta: 'con derecho de ingreso', resto: '12 ventas bloqueadas' } },
      { id: 'e4', estado: 'proximo', fecha: R(5).iso, dia: U.etiquetaDia(5), hora: '16:00', partido: 'América vs. Once Caldas', competicion: 'Liga profesional · fecha 13', escenario: 'Estadio Olímpico Pascual Guerrero', ciudad: 'Cali', foto: 'pascual-guerrero', nota: 'Sin hinchada visitante', dato: { principal: '14.020', total: '36.000', etiqueta: 'con derecho de ingreso', resto: '3 ventas bloqueadas' } },
      { id: 'e5', estado: 'proximo', fecha: R(5).iso, dia: U.etiquetaDia(5), hora: '18:30', partido: 'Real Cartagena vs. Unión Magdalena', competicion: 'Torneo de ascenso · fecha 9', escenario: 'Estadio Jaime Morón', ciudad: 'Cartagena', foto: 'jaime-moron', nota: 'Venta abierta', dato: { principal: '9.310', total: '16.000', etiqueta: 'con derecho de ingreso', resto: '1 venta bloqueada' } },
      { id: 'e6', estado: 'pasado', fecha: R(-1).iso, dia: U.etiquetaDia(-1), hora: '17:00', partido: 'Medellín vs. Junior', competicion: 'Liga profesional · fecha 11', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', foto: 'atanasio', nota: 'Finalizado', dato: { principal: '35.102', total: '38.000', etiqueta: 'asistentes', resto: '3 rojos · alertas cerradas' } },
      { id: 'e7', estado: 'pasado', fecha: R(-2).iso, dia: U.etiquetaDia(-2), hora: '19:30', partido: 'Santa Fe vs. Nacional', competicion: 'Liga profesional · fecha 11', escenario: 'Estadio El Campín', ciudad: 'Bogotá', foto: 'campin', nota: 'Finalizado', dato: { principal: '29.880', total: '36.000', etiqueta: 'asistentes', resto: '5 rojos · alertas cerradas' } }
    ],
    // Tablero del evento: la primera pantalla de la autoridad de seguridad, antes del perfil.
    tablero: {
      aforo: 38000, ingresados: 4812, porMinuto: 186, pico: '190 a las 18:30', avisos: 23,
      flujo: [6, 9, 12, 18, 26, 35, 47, 60, 76, 94, 112, 131, 148, 163, 175, 183, 188, 190, 186, 186],
      puertas: [
        { nombre: 'Puerta 1 · Norte', flujo: 34, ing: 812, avisos: 4, rojos: 1 },
        { nombre: 'Puerta 2 · Norte', flujo: 22, ing: 640, avisos: 3, rojos: 1 },
        { nombre: 'Puerta 3 · Occidental', flujo: 20, ing: 588, avisos: 2, rojos: 0 },
        { nombre: 'Puerta 4 · Oriental', flujo: 28, ing: 701, avisos: 5, rojos: 1, lector: 'ok' },
        { nombre: 'Puerta 5 · Oriental', flujo: 26, ing: 624, avisos: 3, rojos: 0 },
        { nombre: 'Puerta 6 · Sur', flujo: 19, ing: 512, avisos: 2, rojos: 1, lector: 'revisar' },
        { nombre: 'Puerta 7 · Sur', flujo: 0, ing: 455, avisos: 1, rojos: 0, off: true },
        { nombre: 'Puerta 8 · Occidental', flujo: 37, ing: 480, avisos: 3, rojos: 1 }
      ],
      alertas: [
        { id: 'a1', estado: 'nueva', puerta: 'Puerta 4 · Oriental', hora: '18:42', doc: 'CC •••• 4447', clave: 'CC|71894447', causa: 'Medida vigente', origen: 'Lectura en puerta',
          pasos: [{ hora: '18:42', texto: 'Generada en la puerta', quien: 'Op. L. Mejía' }] },
        { id: 'a2', estado: 'nueva', puerta: 'Puerta 6 · Sur', hora: '18:40', doc: 'CC •••• 9013', causa: 'Posible cédula prestada', origen: 'Llamado del operador',
          pasos: [{ hora: '18:40', texto: 'El operador llamó a la autoridad', quien: 'Op. D. Salazar' }] },
        { id: 'a3', estado: 'atencion', puerta: 'Puerta 2 · Norte', hora: '18:31', doc: 'CC •••• 2208', causa: 'Medida vigente', origen: 'Lectura en puerta',
          pasos: [{ hora: '18:31', texto: 'Generada en la puerta', quien: 'Op. J. Ríos' }, { hora: '18:31', texto: 'Asignada a Pt. M. Castaño', quien: 'Pt. R. Gómez' }, { hora: '18:32', texto: 'Tomada', quien: 'Pt. M. Castaño' }, { hora: '18:35', texto: 'En la puerta con la persona', quien: 'Pt. M. Castaño' }] },
        { id: 'a4', estado: 'cerrada', puerta: 'Puerta 1 · Norte', hora: '18:05', doc: 'CC •••• 7730', causa: 'Medida vigente', origen: 'Lectura en puerta', resultado: 'Conducido',
          pasos: [{ hora: '18:05', texto: 'Generada en la puerta', quien: 'Op. A. Rueda' }, { hora: '18:05', texto: 'Asignada a Pt. A. Duarte', quien: 'Pt. R. Gómez' }, { hora: '18:06', texto: 'Tomada', quien: 'Pt. A. Duarte' }, { hora: '18:14', texto: 'Cerrada · Conducido', quien: 'Pt. A. Duarte' }] },
        { id: 'a5', estado: 'cerrada', puerta: 'Puerta 8 · Occidental', hora: '17:48', doc: 'CC •••• 5561', causa: 'Sin ingreso a este partido', origen: 'Llamado del operador', resultado: 'No encontrado',
          pasos: [{ hora: '17:48', texto: 'El operador llamó a la autoridad', quien: 'Op. M. Cano' }, { hora: '17:49', texto: 'Tomada', quien: 'Sub. C. Pérez' }, { hora: '17:57', texto: 'Cerrada · No encontrado', quien: 'Sub. C. Pérez' }] }
      ],
      // Avisos silenciosos de la puerta (no son alertas): la persona entró como verde y el PMU recibe causa, puerta y hora.
      avisosPuerta: [
        { id: 'v1', tipo: 'veto', etiqueta: 'Medida levantada', puerta: 'Puerta 5 · Oriental', hora: '18:39', doc: 'CC •••• 6583', causa: 'Medida recién levantada', detalle: 'Medida levantada el ' + R(-3).corto + ' · Res. 0198', quien: 'Op. S. León' },
        { id: 'v2', tipo: 'cumplida', etiqueta: 'Sanción cumplida', puerta: 'Puerta 3 · Occidental', hora: '18:36', doc: 'CC •••• 2188', causa: 'Antecedente: sanción cumplida', detalle: 'Bebidas alcohólicas · cumplida el ' + R(-410).largo, quien: 'Op. D. Salazar' },
        { id: 'v3', tipo: 'agresion', etiqueta: 'Antecedente por agresión', puerta: 'Puerta 1 · Norte', hora: '18:29', doc: 'CC •••• 3250', causa: 'Antecedente: sanción cumplida', detalle: 'Agresión verbal · cumplida el ' + R(-108).largo, quien: 'Op. A. Rueda' },
        { id: 'v4', tipo: 'riesgo', etiqueta: 'Posible riesgo', puerta: 'Puerta 8 · Occidental', hora: '18:24', doc: 'CC •••• 0310', causa: 'Posible riesgo en este partido', detalle: 'Posible hincha de equipo rival · señal, no certeza', quien: 'Op. M. Cano' },
        // Huella: la excepción (solo en modo obligatorio) y la contingencia del lector, que es un solo aviso por puerta y no de una persona.
        { id: 'v5', tipo: 'sin-huella', etiqueta: 'Sin huella', puerta: 'Puerta 3 · Occidental', hora: '18:19', doc: 'CC •••• 5502', causa: 'Ingreso sin huella · discapacidad o lesión', detalle: 'Modo obligatorio · entró con excepción documentada · señal, no certeza', quien: 'Op. D. Salazar' },
        { id: 'v6', tipo: 'contingencia-huella', etiqueta: 'Contingencia de huella', puerta: 'Puerta 6 · Sur', hora: '18:12', doc: 'Toda la puerta', causa: 'Lector sin servicio · contingencia activa', detalle: 'Activada por el supervisor · cada ingreso queda marcado «contingencia»', origen: 'Supervisor de puerta', quien: 'Sup. M. Lozano' }
      ]
    },
    // Agentes de la jurisdicción para asignar una alerta: el puesto dice qué tan cerca está de la puerta.
    agentes: [
      { id: 'g1', foto: 'assets/agentes/g1.webp', nombre: 'Pt. J. Marín', puesto: 'Puerta 4 · Oriental' },
      { id: 'g2', foto: 'assets/agentes/g2.webp', nombre: 'Pt. L. Vargas', puesto: 'Puerta 5 · Oriental' },
      { id: 'g3', foto: 'assets/agentes/g3.webp', nombre: 'Sub. E. Molina', puesto: 'Puerta 6 · Sur' },
      { id: 'g4', foto: 'assets/agentes/g4.webp', nombre: 'Pt. D. Rincón', puesto: 'Puerta 3 · Occidental' },
      { id: 'g5', foto: 'assets/agentes/g5.webp', nombre: 'Pt. A. Duarte', puesto: 'Puerta 1 · Norte' },
      { id: 'g6', foto: 'assets/agentes/g6.webp', nombre: 'Sub. C. Pérez', puesto: 'Puerta 8 · Occidental' },
      { id: 'g7', nombre: 'Pt. M. Castaño', puesto: 'Puerta 2 · Norte', ocupado: 'Atendiendo la alerta de Puerta 2 · Norte' },
      { id: 'g8', nombre: 'Pt. H. Londoño', puesto: 'Puerta 7 · Sur' },
      { id: 'g9', nombre: 'Pt. S. Ramírez', puesto: 'Puerta 3 · Occidental' }
    ],
    // Auditoría (superficie 3): mismos hechos que las alertas del tablero, más ventas, lecturas y consultas.
    auditoria: {
      total: 5117, porPagina: 25, fecha: R(0).largo, evento: 'Nacional vs. Medellín · ' + R(0).corto,
      registros: [
        { hora: '18:43', tipo: 'consulta', puerta: 'Puerta 4 · Oriental', doc: 'CC •••• 4447', origen: 'Vista de seguridad', detalle: 'Abrió el perfil desde la alerta', quien: 'Pt. R. Gómez' },
        { hora: '18:42', tipo: 'medida', puerta: 'Puerta 4 · Oriental', doc: 'CC •••• 4447', origen: 'Lectura en puerta', detalle: 'No entró · alerta al PMU', quien: 'Op. L. Mejía' },
        { hora: '18:41', tipo: 'verde', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 2117', origen: 'Lectura en puerta', detalle: 'Entró · Oriental Baja, fila E', quien: 'Op. A. Rueda' },
        { hora: '18:41', tipo: 'verde', puerta: 'Puerta 4 · Oriental', doc: 'CC •••• 0390', origen: 'Lectura en puerta', detalle: 'Entró · huella coincide · Oriental Baja, fila C', quien: 'Op. L. Mejía' },
        { hora: '18:40', tipo: 'operativo', puerta: 'Puerta 6 · Sur', doc: 'CC •••• 9013', origen: 'Lectura en puerta', detalle: 'Posible cédula prestada · llamó a la autoridad', quien: 'Op. D. Salazar' },
        { hora: '18:39', tipo: 'amarillo', puerta: 'Puerta 5 · Oriental', doc: 'CC •••• 6583', origen: 'Lectura en puerta', detalle: 'Entró · aviso al PMU · medida levantada', quien: 'Op. S. León' },
        { hora: '18:38', tipo: 'amarillo', puerta: 'Puerta 3 · Occidental', doc: 'CC •••• 5502', origen: 'Lectura en puerta', detalle: 'Entró · aviso al PMU · sin huella · discapacidad o lesión', quien: 'Op. D. Salazar' },
        { hora: '18:37', tipo: 'operativo', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 7702', origen: 'Lectura en puerta', detalle: 'Ya ingresó · no llamó a la autoridad', quien: 'Op. J. Ríos' },
        { hora: '18:36', tipo: 'operativo', puerta: 'Puerta 4 · Oriental', doc: 'CC •••• 4218', origen: 'Lectura en puerta', detalle: 'Posible cédula prestada · la huella no coincide (3 lecturas legibles)', quien: 'Op. L. Mejía' },
        { hora: '18:35', tipo: 'policia', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista de seguridad', detalle: 'En la puerta con la persona', quien: 'Pt. M. Castaño' },
        { hora: '18:32', tipo: 'consulta', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista de seguridad', detalle: 'Abrió el perfil desde la alerta', quien: 'Pt. R. Gómez' },
        { hora: '18:32', tipo: 'policia', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista de seguridad', detalle: 'Alerta tomada', quien: 'Pt. M. Castaño' },
        { hora: '18:31', tipo: 'policia', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista de seguridad', detalle: 'Alerta asignada a Pt. M. Castaño', quien: 'Pt. R. Gómez' },
        { hora: '18:31', tipo: 'medida', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Lectura en puerta', detalle: 'No entró · alerta al PMU', quien: 'Op. J. Ríos' },
        { hora: '18:14', tipo: 'policia', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Vista de seguridad', detalle: 'Alerta cerrada · Conducido', quien: 'Pt. A. Duarte' },
        { hora: '18:06', tipo: 'policia', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Vista de seguridad', detalle: 'Alerta tomada', quien: 'Pt. A. Duarte' },
        { hora: '18:05', tipo: 'policia', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Vista de seguridad', detalle: 'Alerta asignada a Pt. A. Duarte', quien: 'Pt. R. Gómez' },
        { hora: '18:05', tipo: 'medida', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Lectura en puerta', detalle: 'No entró · alerta al PMU', quien: 'Op. A. Rueda' },
        { hora: '17:57', tipo: 'policia', puerta: 'Puerta 8 · Occidental', doc: 'CC •••• 5561', origen: 'Vista de seguridad', detalle: 'Alerta cerrada · No encontrado', quien: 'Sub. C. Pérez' },
        { hora: '17:49', tipo: 'policia', puerta: 'Puerta 8 · Occidental', doc: 'CC •••• 5561', origen: 'Vista de seguridad', detalle: 'Alerta tomada', quien: 'Sub. C. Pérez' },
        { hora: '17:48', tipo: 'operativo', puerta: 'Puerta 8 · Occidental', doc: 'CC •••• 5561', origen: 'Lectura en puerta', detalle: 'Sin ingreso a este partido · llamó a la autoridad', quien: 'Op. M. Cano' },
        { hora: '16:22', tipo: 'venta', puerta: '—', doc: 'CC •••• 6583', origen: 'Comercializadora A', detalle: 'Venta autorizada · con aviso', quien: 'Canal web' },
        { hora: '15:08', tipo: 'venta', puerta: '—', doc: 'CC •••• 4447', origen: 'Comercializadora B', detalle: 'Venta bloqueada · medida vigente', quien: 'Canal web' },
        { hora: '14:51', tipo: 'venta', puerta: '—', doc: 'CC •••• 2117', origen: 'Comercializadora A', detalle: 'Venta autorizada', quien: 'Canal web' },
        { hora: '12:30', tipo: 'venta', puerta: '—', doc: 'CC •••• 4447', origen: 'Comercializadora A', detalle: 'Venta bloqueada · medida vigente', quien: 'Taquilla oficial' }
      ]
    },
    senales: [
      { l: 'Club afín', v: 'Atlético Nacional · 86 %', por: '14 de 16 partidos en tribuna local.', decide: true },
      { l: 'Tribuna habitual', v: 'Sur', por: '11 de 16 ingresos por la tribuna Sur.' },
      { l: 'Frecuencia', v: '16 partidos en 6 meses', por: 'Ingresos reales registrados en la puerta.' },
      { l: 'Viajes de visitante', v: '3', por: 'Ingresos en escenarios de otras ciudades.' },
      { l: 'Con quién va', v: '2 personas que han tenido medidas', por: 'Compraron juntos o entran juntos.' },
      { l: 'Intentos fallidos', v: '1 hoy', por: 'Puerta 4 · Oriental, 18:42.' }
    ]
  },

  // Superficie 1 · Registro de medidas. Las medidas viven en el IVC (GI); aquí solo los reportes de las entidades, con fechas relativas a hoy.
  ivc: {
    usuario: { nombre: 'Carolina Vélez Ortiz', cargo: 'Profesional del IVC · Mindeporte' },
    reportes: [
      { id: 'R-2026-0431', iso: R(0).iso, fecha: R(0).corto + ' · 08:12', estado: 'enviado', entidad: 'Atlético Nacional', nombre: 'Mateo Giraldo Uribe', doc: 'CC 1.040.338.912',
        evento: 'Nacional vs. Santa Fe · ' + R(-1).largo + ' · Estadio Atanasio Girardot', corto: 'Nacional vs. Santa Fe · ' + R(-1).corto, hechos: R(-1).largo, autoridad: 'Inspección municipal 14 de Medellín',
        conductas: ['Invadir el terreno de juego (art. 97, 4)'], evid: { vid: true, fot: 3 }, descripcion: 'Saltó la malla de la tribuna Sur al minuto 88 y corrió hacia el arco. La logística lo retuvo en la pista atlética.',
        historial: [{ fecha: R(0).largo, texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }] },
      { id: 'R-2026-0430', iso: R(0).iso, fecha: R(0).corto + ' · 07:40', estado: 'enviado', entidad: 'Independiente Medellín', nombre: 'Juan Esteban Toro Mesa', doc: 'CC 1.128.450.667',
        evento: 'Nacional vs. Santa Fe · ' + R(-1).largo + ' · Estadio Atanasio Girardot', corto: 'Nacional vs. Santa Fe · ' + R(-1).corto, hechos: R(-1).largo, autoridad: 'Inspección municipal 14 de Medellín',
        conductas: ['Ingresar bebidas alcohólicas (art. 97, 6)', 'Desatender a la logística (art. 97, 5)'], evid: { fot: 2 }, descripcion: 'Ingresó licor en la Puerta 5 · Oriental y se negó a ubicarse en su sector cuando la logística se lo pidió.',
        historial: [{ fecha: R(0).largo, texto: 'Enviado por la entidad', quien: 'Independiente Medellín · Seguridad', punto: 'azul' }] },
      { id: 'R-2026-0418', iso: R(-7).iso, fecha: R(-7).corto + ' · 16:05', estado: 'recibido', entidad: 'Atlético Nacional', nombre: 'Cristian Camilo Bedoya Arias', doc: 'CC 1.001.225.390',
        evento: 'Nacional vs. Junior · ' + R(-9).largo + ' · Estadio Atanasio Girardot', corto: 'Nacional vs. Junior · ' + R(-9).corto, hechos: R(-9).largo, autoridad: 'Inspección municipal 14 de Medellín',
        conductas: ['Agresión verbal (art. 98, b)'], evid: { fot: 1 }, descripcion: 'Insultos reiterados a un integrante de la logística en la Puerta 2 · Norte.',
        historial: [{ fecha: R(-7).largo, texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }, { fecha: R(-6).largo, texto: 'Recibido por el IVC', quien: 'Jaime Pardo Ruiz', punto: 'gris' }] },
      { id: 'R-2026-0412', iso: R(-55).iso, fecha: R(-55).corto + ' · 11:30', estado: 'tramite', entidad: 'Independiente Medellín', nombre: 'Andrés Felipe Cardona Ruiz', doc: 'CC 1.017.225.804',
        evento: 'Medellín vs. Millonarios · ' + R(-57).largo + ' · Estadio Atanasio Girardot', corto: 'Medellín vs. Millonarios · ' + R(-57).corto, hechos: R(-57).largo, autoridad: 'Inspección municipal 14 de Medellín',
        conductas: ['Violencia contra la fuerza pública (art. 97, 3)'], evid: { vid: true, fot: 4 }, candidatas: ['MC-2026-0877'], descripcion: 'Empujó y golpeó a un patrullero en la salida de la tribuna Occidental. Según la logística, estaba bajo efectos de alcohol.',
        historial: [{ fecha: R(-55).largo, texto: 'Enviado por la entidad', quien: 'Independiente Medellín · Seguridad', punto: 'azul' }, { fecha: R(-54).largo, texto: 'Recibido por el IVC', quien: 'Carolina Vélez Ortiz', punto: 'gris' }, { fecha: R(-48).largo, texto: 'La autoridad abrió procedimiento · oficio 2026-E-031778', quien: 'Carolina Vélez Ortiz', punto: 'amarillo' }] },
      { id: 'R-2026-0405', iso: R(-49).iso, fecha: R(-49).corto + ' · 09:18', estado: 'tramite', entidad: 'Atlético Nacional', nombre: 'Yeison Darío Montoya Cano', doc: 'CC 1.036.901.558',
        evento: 'Nacional vs. Pereira · ' + R(-50).largo + ' · Estadio Atanasio Girardot', corto: 'Nacional vs. Pereira · ' + R(-50).corto, hechos: R(-50).largo, autoridad: 'Inspección municipal 14 de Medellín',
        conductas: ['Armas u objetos peligrosos (art. 97, 1)'], evid: { fot: 2 }, descripcion: 'En la requisa de la Puerta 6 · Sur se le encontró un arma cortopunzante.',
        historial: [{ fecha: R(-49).largo, texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }, { fecha: R(-49).largo, texto: 'Recibido por el IVC', quien: 'Jaime Pardo Ruiz', punto: 'gris' }, { fecha: R(-41).largo, texto: 'La autoridad abrió procedimiento · oficio 2026-E-032410', quien: 'Jaime Pardo Ruiz', punto: 'amarillo' }] },
      { id: 'R-2025-0288', iso: R(-344).iso, fecha: R(-344).largo, estado: 'derivo', medida: 'MC-2025-0831', entidad: 'Atlético Nacional', nombre: 'Julián Andrés Posada', doc: 'CC 71.894.447',
        evento: 'Nacional vs. Medellín · ' + R(-345).largo + ' · Estadio Atanasio Girardot', corto: 'Nacional vs. Medellín · ' + R(-345).largo, hechos: R(-345).largo, autoridad: 'Inspección municipal 14 de Medellín',
        conductas: ['Agresión física (art. 98, a)'], evid: { vid: true, fot: 2 }, descripcion: 'Agredió a otro aficionado en la tribuna Oriental Baja durante el segundo tiempo.',
        historial: [{ fecha: R(-344).largo, texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }, { fecha: R(-343).largo, texto: 'Recibido por el IVC', quien: 'Carolina Vélez Ortiz', punto: 'gris' }, { fecha: R(-336).largo, texto: 'La autoridad abrió procedimiento', quien: 'Carolina Vélez Ortiz', punto: 'amarillo' }, { fecha: R(-300).largo, texto: 'Derivó en la medida MC-2025-0831', quien: 'Carolina Vélez Ortiz', punto: 'rojo' }] },
      { id: 'R-2026-0379', iso: R(-64).iso, fecha: R(-64).corto + ' · 14:52', estado: 'archivado', motivoArchivo: 'La autoridad no abrió procedimiento', notaArchivo: 'Oficio de la Inspección municipal 9 de Bogotá, radicado 2026-E-029904.', entidad: 'Millonarios', nombre: 'Óscar Iván Rincón Pulido', doc: 'CC 80.556.214',
        evento: 'Millonarios vs. Nacional · ' + R(-65).largo + ' · Estadio El Campín', corto: 'Millonarios vs. Nacional · ' + R(-65).corto, hechos: R(-65).largo, autoridad: 'Inspección municipal 9 de Bogotá',
        conductas: ['Agresión física (art. 98, a)'], evid: { fot: 0 }, descripcion: 'Riña en la tribuna Norte; el informe no identifica quién inició la agresión.',
        historial: [{ fecha: R(-64).largo, texto: 'Enviado por la entidad', quien: 'Millonarios · Seguridad', punto: 'azul' }, { fecha: R(-63).largo, texto: 'Recibido por el IVC', quien: 'Natalia Suárez Pineda', punto: 'gris' }, { fecha: R(-27).largo, texto: 'Archivado · la autoridad no abrió procedimiento', quien: 'Natalia Suárez Pineda', punto: 'gris' }] }
    ]
  }
};
// Una sola fuente para la card, el zoom y el splash (DC-399): `quien` rotula; sin él, los roles de la app.
window.SVN_DATOS.quienDe = function (a) {
  return a.quien || a.roles.map(function (id) { return window.SVN_DATOS.roles.filter(function (r) { return r.id === id; })[0].rol; }).join(' · ');
};
})();
