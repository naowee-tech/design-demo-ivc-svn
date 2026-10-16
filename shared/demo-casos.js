/* Casos de prueba ocultos: personas del JSON + estado en el almacén del IVC (suid.gi.v3), común a IVC, comercializadora y puerta.
   Panel con Ctrl/⌘ + Shift + L. Requiere gi-catalogos.js y gi-data.js cargados antes. */
(function (w) {
  'use strict';
  var KEY = 'demo.estado.v1';
  var PANEL = 'demo.panel';
  var DATA = w.DEMO_CASOS || { personas: [] };
  var PLANTILLA = { meses: 12, origen: [3], competicion: 'Liga', local: 'JUNIOR F.C.', visitante: 'MILLONARIOS F.C.', ciudadHechos: 'Barranquilla', descripcion: 'Invadió el terreno de juego al finalizar el partido.' };

  function gi() { return w.GI; }
  function U() { return w.GI.util; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ───────── estado propio: solo qué personas se tocaron a mano ───────── */
  function leer() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function guardar(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sin almacenamiento */ } }

  /* ───────── documento ───────── */
  function codigo(tipo) {
    var t = String(tipo || ''), m = /\(([A-Z]+)\)/.exec(t), c = (m ? m[1] : t).trim().toUpperCase();
    return c === 'PA' ? 'P' : c;
  }
  function clave(tipo, num) { return codigo(tipo) + '|' + String(num == null ? '' : num).replace(/[^A-Za-z0-9]/g, '').toUpperCase(); }
  function deRegistro(r) { return clave(r.tipoId, r.numId); }
  function base(id) { return DATA.personas.concat(DATA.libres || []).filter(function (p) { return p.id === id; })[0] || null; }
  function baseDoc(tipo, num) { var k = clave(tipo, num); return DATA.personas.concat(DATA.libres || []).filter(function (p) { return clave(p.tipoId, p.numId) === k; })[0] || null; }

  /* ───────── registros de Gestión ───────── */
  function registro(p, s, i) {
    var u = U(), hoy = u.today(), ej = u.addDays(hoy, -s.diasEjecutoria), rad = u.addDays(ej, 3), y, n = 700 + i;
    if (rad > hoy) { rad = hoy; }
    y = rad.slice(0, 4);
    var h = function (f, hr, de, a, nota) { return { fecha: f > hoy ? hoy : f, hora: hr, usuario: gi().USER, de: de, a: a, nota: nota || '' }; };
    var val = s.estadoRegistro === 'Validado', g = p.guion || {}, fin = gi().derive.finVigencia({ fechaEjecutoria: ej, meses: s.meses });
    var hist = [h(rad, '09:15', '', 'Recibido', g.radicado || 'Expediente radicado y recibido.')];
    if (val && g.devolucion && !s.previa) {
      hist.push(h(u.addDays(rad, 3), '11:20', 'Recibido', 'Por Subsanar', g.devolucion), h(u.addDays(rad, 6), '15:05', 'Por Subsanar', 'Validado', g.validacion));
    } else if (val) { hist.push(h(u.addDays(rad, 2), '14:30', 'Recibido', 'Validado', g.validacion)); }
    if (val && hoy > fin) { hist.push(h(u.addDays(fin, 1), '00:05', 'Validado', 'Validado', 'La restricción pasó a Cumplida al terminar su vigencia (automático).')); }
    return {
      demo: p.id, fechaRegistro: rad, tipoId: p.tipoId, numId: p.numId, nombres: p.nombres, apellidos: p.apellidos, fechaNac: p.fechaNac, sexo: p.sexo,
      pais: 'Colombia', rural: false, indicativo: '+57', profesional: 'Marcela Ortiz', respuesta: '', observaciones: '', otraCompeticion: '', agravantes: [], infoAdic: '',
      depto: p.depto, ciudad: p.ciudad, dir: p.dir, telefono: p.telefono, correo: p.correo || '',
      fechaHechos: u.addDays(ej, -30), competicion: s.competicion, local: s.local, visitante: s.visitante, ciudadHechos: s.ciudadHechos, origen: s.origen.slice(), descripcion: s.descripcion,
      fechaActo: u.addDays(ej, -7), numActo: 'RES-' + (500 + n) + '-' + y, fechaEjecutoria: ej, meses: s.meses, valor: s.meses * 150000,
      fechaRadicado: rad, radEntrada: 'GESDOC-' + y + '-' + (90000 + n * 13), radContab: val ? 'GESDOC-' + y + '-' + (90400 + n * 13) : '', radJuridica: val ? 'GESDOC-' + y + '-' + (90800 + n * 13) : '',
      estadoRegistro: s.estadoRegistro, historial: hist, rep: p.rep ? Object.assign({ pais: 'Colombia', indicativo: '+57' }, p.rep) : null
    };
  }
  function plantilla(p, extra) {
    var b = p.borrador || {}, o = {};
    Object.keys(PLANTILLA).forEach(function (k) { o[k] = b[k] != null ? b[k] : PLANTILLA[k]; });
    o.ciudadHechos = b.ciudadHechos || p.ciudad;
    return Object.assign(o, { diasEjecutoria: 5, estadoRegistro: 'Validado' }, extra || {});
  }
  function insertar(p, s) { return gi().insertRaw(registro(p, s, gi().all().length)); }
  /* Antecedentes fijos de la persona (ya cumplidos) y luego las sanciones pedidas. */
  function sembrar(p, sanciones) {
    ((p.guion && p.guion.previas) || []).forEach(function (x) { insertar(p, Object.assign({ previa: true }, x)); });
    sanciones.forEach(function (x) { insertar(p, x); });
  }
  function delPersona(p) { var k = clave(p.tipoId, p.numId); gi().removeWhere(function (r) { return deRegistro(r) === k; }); }
  function registrosDe(p) { var k = clave(p.tipoId, p.numId); return gi().all().filter(function (r) { return deRegistro(r) === k; }); }

  /* Siembra solo lo que falta y no se tocó a mano; así «Restablecer datos» del IVC no deja a nadie sin su caso. */
  function init() {
    if (!gi()) { return; }
    var st = leer();
    DATA.personas.forEach(function (p) {
      if (p.oculta || st[p.id] || registrosDe(p).length) { return; }
      sembrar(p, p.sanciones);
    });
  }

  /* ───────── consulta: lo que leen las tres superficies ───────── */
  function estado(tipo, num) {
    var k = clave(tipo, num), regs = gi().all().filter(function (r) { return deRegistro(r) === k; }), D = gi().derive;
    var act = [], cum = [], ina = [];
    regs.forEach(function (r) { var e = D.estadoRestriccion(r); (e === 'Activa' ? act : e === 'Cumplida' ? cum : ina).push(r); });
    var dias = act.length ? Math.min.apply(null, act.map(function (r) { return D.diasRestantes(r); })) : null;
    return { persona: baseDoc(tipo, num), registros: regs, vigentes: act, cumplidas: cum, enTramite: ina, bloqueado: act.length > 0, antecedente: !act.length && cum.length > 0, diasRestantes: dias };
  }
  function bloqueado(tipo, num) { return !!gi() && estado(tipo, num).bloqueado; }
  function etiqueta(e, p) {
    if (e.bloqueado) { return { t: 'Sancionada vigente · ' + (e.diasRestantes > 0 ? e.diasRestantes + ' días' : 'último día'), c: 'rojo' }; }
    if (!e.registros.length && p && p.oculta) { return { t: 'Oculta · aún no aparece', c: 'gris' }; }
    if (e.enTramite.length) { return { t: 'Registro recibido · no bloquea', c: 'ambar' }; }
    if (e.cumplidas.length) { return { t: 'Cumplida · antecedente', c: 'gris' }; }
    return { t: 'Sin sanción', c: 'verde' };
  }

  /* ───────── autocompletar por cédula (alta del IVC) ───────── */
  var DIR = /^([A-Z]{2})\s+(\d+)([A-Z]?)\s*#\s*(\d+)([A-Z]?)\s*-\s*(\d+)(?:\s+([A-Z]{2})\s+(.+))?$/;
  function direccion(dir) {
    var C = gi().cat, m = DIR.exec(dir || ''), a = { via: '', n1: '', l1: '', b1: '', l2: '', s1: '', n2: '', l3: '', b2: '', l4: '', n3: '', s2: '', adicOn: false, adic: '', indic: '' };
    if (!m) { return a; }
    var via = C.viaUrbana.filter(function (x) { return x[1] === m[1]; })[0];
    if (!via) { return a; }
    a.via = via[0]; a.n1 = m[2]; a.l1 = m[3]; a.n2 = m[4]; a.l3 = m[5]; a.n3 = m[6];
    var ad = m[7] && C.infoAdicional.filter(function (x) { return x[1] === m[7]; })[0];
    if (ad) { a.adicOn = true; a.adic = ad[0]; a.indic = m[8]; }
    return a;
  }
  function aForm(p) {
    return { tipoId: p.tipoId, numId: p.numId, nombres: p.nombres, apellidos: p.apellidos, pais: p.pais || 'Colombia', depto: p.depto, ciudad: p.ciudad, rural: p.rural === true ? 'Sí' : 'No',
      a: direccion(p.dir), dirPrev: p.dir || '', indicativo: p.indicativo || '+57', telefono: p.telefono || '', correo: p.correo || '', fechaNac: p.fechaNac, sexo: p.sexo };
  }
  /* Hechos de ejemplo por si la persona no trae un borrador propio; rotan por el último dígito de la cédula. */
  var CASOS = [
    { origen: [5], descripcion: 'Ingresó bebidas alcohólicas en el estadio.', meses: 6 },
    { origen: [7], descripcion: 'Agresión verbal reiterada contra el cuerpo arbitral.', meses: 12 },
    { origen: [3], descripcion: 'Invadió el terreno de juego al finalizar el partido.', meses: 12 },
    { origen: [0], descripcion: 'Intentó ingresar al escenario con un objeto cortopunzante.', meses: 24 },
    { origen: [6], descripcion: 'Agredió a otro asistente en la tribuna al terminar el partido.', meses: 18 }
  ];
  var EQUIPOS = { 'Medellín': ['ATLÉTICO NACIONAL', 'DEPORTIVO CALI'], 'Bogotá D.C.': ['MILLONARIOS F.C.', 'INDEPENDIENTE SANTA FE'], 'Barranquilla': ['JUNIOR F.C.', 'MILLONARIOS F.C.'], 'Cali': ['AMÉRICA DE CALI', 'DEPORTES TOLIMA'],
    'Cartagena de Indias': ['REAL CARTAGENA', 'DEPORTIVO PASTO'], 'Bucaramanga': ['ATLÉTICO BUCARAMANGA', 'ENVIGADO F.C.'], 'Pereira': ['DEPORTIVO PEREIRA', 'REAL CARTAGENA'] };
  function borrador(b) {
    if (b.borrador) { return b.borrador; }
    var s = b.sanciones && b.sanciones[0], d = +String(b.numId).slice(-1) % CASOS.length;
    if (s) { return Object.assign({ diasHechos: 45 }, s); }
    var eq = EQUIPOS[b.ciudad] || ['JUNIOR F.C.', 'MILLONARIOS F.C.'];
    return Object.assign({ diasHechos: 40 + d * 3, competicion: 'Liga', local: eq[0], visitante: eq[1], ciudadHechos: b.ciudad }, CASOS[d]);
  }
  function autocompletar(tipo, num) {
    var b = baseDoc(tipo, num), fuente = b, u = U();
    if (!fuente) { fuente = gi().all().filter(function (r) { return deRegistro(r) === clave(tipo, num); })[0] || null; }
    if (!fuente) { return null; }
    var out = { persona: aForm(fuente), rep: fuente.rep ? aForm(Object.assign({ tipoId: fuente.rep.tipoId }, fuente.rep)) : null, hechos: null };
    if (b) {
      var bor = borrador(b), s = plantilla({ borrador: bor, ciudad: b.ciudad }), hoy = u.today(), hechos = u.addDays(hoy, -(bor.diasHechos || 45)), acto = u.addDays(hechos, 15), ej = u.addDays(acto, 7);
      out.hechos = {
        fechaHechos: hechos, competicion: s.competicion, local: s.local, visitante: s.visitante, ciudadHechos: s.ciudadHechos, origen: s.origen.slice(), descripcion: s.descripcion,
        fechaActo: acto, numActo: 'RES-' + (600 + DATA.personas.concat(DATA.libres || []).indexOf(b)) + '-' + hoy.slice(0, 4), fechaEjecutoria: ej > hoy ? hoy : ej, meses: String(s.meses), valor: (s.meses * 150000).toLocaleString('es-CO')
      };
    }
    return out;
  }
  /* Para el reporte de una entidad: quién es (como lo devolvería el ANI) y qué conducta sugerir. */
  function buscar(tipo, num) {
    var b = baseDoc(tipo, num); if (!b) { return null; }
    var bor = borrador(b), menor = U().ageAt(b.fechaNac) < 18;
    return { nombre: b.nombres + ' ' + b.apellidos, menor: menor, origen: bor.origen.slice(), descripcion: bor.descripcion };
  }

  /* ───────── solicitudes (reportes de entidades al IVC) ───────── */
  var SOL = 'demo.solicitudes.v1';
  var CONDUCTAS = ['Armas u objetos peligrosos (art. 97, 1)', 'Estupefacientes (art. 97, 2)', 'Violencia contra la fuerza pública (art. 97, 3)', 'Invasión del terreno de juego (art. 97, 4)',
    'Desatender a la logística en ubicación y tránsito (art. 97, 5)', 'Ingresar bebidas alcohólicas (art. 97, 6)', 'Agresión física (art. 98, a)', 'Agresión verbal (art. 98, b)', 'Daño a infraestructura (art. 98, c)'];
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function larga(iso) { var p = iso.split('-'); return +p[2] + ' ' + MES[+p[1] - 1] + ' ' + p[0]; }
  function isoDeLarga(t) { var m = /(\d{1,2})\s+([a-z]{3})\s+(\d{4})/i.exec(t || ''), k = m ? MES.indexOf(m[2].toLowerCase()) : -1; return k < 0 ? '' : m[3] + '-' + String(k + 1).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0'); }
  function docPuntos(tipo, num) { var c = codigo(tipo), d = String(num).replace(/\D/g, ''); return c + ' ' + (c === 'P' ? num : d.replace(/\B(?=(\d{3})+(?!\d))/g, '.')); }
  function guardadas() { try { return JSON.parse(localStorage.getItem(SOL) || '[]') || []; } catch (e) { return []; } }
  function deBase(p, i) {
    var x = p.solicitud, u = U(), hoy = u.today();
    return nuevaSolicitud({ id: 'R-2026-' + String(480 + i).padStart(4, '0'), tipo: x.tipo, origen: x.origen, nombre: p.nombres + ' ' + p.apellidos, doc: docPuntos(p.tipoId, p.numId),
      evento: x.evento + ' · ' + larga(u.addDays(hoy, -x.diasHechos)) + ' · ' + x.estadio, hechosIso: u.addDays(hoy, -x.diasHechos), autoridad: x.autoridad, conductas: x.conductas.map(function (k) { return CONDUCTAS[k]; }), descripcion: x.descripcion, evid: '1 foto' });
  }
  function nuevaSolicitud(o) {
    var u = U(), n = u.now(), pie = o.tipo === 'Club de fútbol' ? 'Seguridad' : 'Inspección';
    return { id: o.id, estado: 'enviado', tipo: o.tipo, origen: o.origen, iso: n.fecha, fecha: larga(n.fecha) + ' · ' + n.hora, menor: !!o.menor, nombre: o.menor ? '' : o.nombre, iniciales: o.iniciales || '', doc: o.doc,
      evento: o.evento, hechos: larga(o.hechosIso), autoridad: o.autoridad, conductas: o.conductas, evid: o.evid || 'Sin evidencia adjunta', descripcion: o.descripcion,
      hist: [{ fecha: larga(n.fecha), texto: 'Enviado por la entidad', quien: o.origen + ' · ' + pie, punto: 'azul' }] };
  }
  /* Las lee gi-solicitudes.js al cargar: las de base (personas con `solicitud`) y las que se envían desde Entidades. */
  function solicitudes() {
    var base = [];
    DATA.personas.forEach(function (p, i) { if (p.solicitud) { base.push(deBase(p, i)); } });
    return guardadas().concat(base);
  }
  function siguienteId() { return 'R-2026-' + String(460 + guardadas().length).padStart(4, '0'); }
  function registrarSolicitud(o) {
    var r = nuevaSolicitud(Object.assign({}, o, { hechosIso: o.hechosIso || isoDeLarga(o.hechos) || U().today() })), l = guardadas();
    l.unshift(r);
    try { localStorage.setItem(SOL, JSON.stringify(l)); } catch (e) { /* sin almacenamiento */ }
    return r;
  }

  /* ───────── forzar estado (popover del panel) ───────── */
  var ESTADOS = [['libre', 'Libre'], ['recibida', 'Recibida · no bloquea'], ['vigente', 'Vigente'], ['porVencer', 'Por vencer'], ['cumplida', 'Cumplida'], ['reiniciar', 'Restablecer al inicio']];
  function forzar(clave, id) {
    var p = base(id), u = U(); if (!p) { return; }
    function nueva(extra) { sembrar(p, [plantilla(p, extra)]); }
    function dias(iso) { return Math.round((u.parse(u.today()) - u.parse(iso)) / 86400000); }
    var meses = plantilla(p).meses;
    if (clave === 'reiniciar') {
      delPersona(p); var st = leer(); delete st[p.id]; guardar(st);
      if (!p.oculta) { sembrar(p, p.sanciones || []); }
      return;
    }
    delPersona(p);
    if (clave === 'recibida') { nueva({ estadoRegistro: 'Recibido', diasEjecutoria: 10 }); }
    else if (clave === 'vigente') { nueva({ diasEjecutoria: 5 }); }
    else if (clave === 'porVencer') { nueva({ diasEjecutoria: dias(u.addDays(u.addMonths(u.addDays(u.today(), 5), -meses), -1)) }); }
    else if (clave === 'cumplida') { nueva({ diasEjecutoria: meses * 31 + 40 }); }
    var m = leer(); m[p.id] = { tocada: true }; guardar(m);
  }
  function claveEstado(e, p) {
    if (e.bloqueado) { return e.diasRestantes != null && e.diasRestantes <= 30 ? 'porVencer' : 'vigente'; }
    if (e.enTramite.length) { return 'recibida'; }
    return e.cumplidas.length ? 'cumplida' : 'libre';
  }

  /* ───────── reinicio ───────── */
  function reiniciarTodo() {
    guardar({});
    try { localStorage.removeItem(SOL); localStorage.removeItem('suid.gs.v5'); } catch (e) { /* sin almacenamiento */ }
    gi().reset();
    try { sessionStorage.setItem(PANEL, '1'); } catch (e) { /* sin almacenamiento */ }
    w.location.reload();
  }

  /* ───────── panel ───────── */
  var reloj = null;
  /* Vistas de la demo; las rutas son relativas a suid/ y svn/, que están al mismo nivel. */
  var VISTAS = [
    ['IVC', [['Gestión de sanciones', '../suid/app.html#/control-acceso/infractores'], ['Búsqueda avanzada', '../suid/app.html#/control-acceso/consulta'], ['Solicitudes', '../suid/app.html#/control-acceso/solicitudes'], ['Eventos', '../suid/app.html#/control-acceso/eventos']]],
    ['SVN', [['Inicio del SVN', '../svn/index.html#/'], ['Comprar y asignar ingresos', '../svn/index.html#/compra'], ['Acceso en puerta', '../svn/index.html#/puerta'], ['Monitor PMU', '../svn/index.html#/policia'], ['Portal de la persona', '../svn/index.html#/portal'], ['Consola de soporte', '../svn/index.html#/soporte'], ['Entidades y comercializadoras', '../svn/index.html#/entidades'], ['API y portal de integración', '../svn/index.html#/integracion']]]
  ];

  var CSS = 'html.dcp-prep{position:relative;left:0;transition:left .3s cubic-bezier(.2,.8,.2,1)}html.dcp-abierto{left:calc(-1 * var(--dcp-w,360px))}' +
    '.dcp{position:fixed;top:0;right:0;bottom:0;width:var(--dcp-w,360px);max-width:100vw;z-index:2147483000;background:#14161c;color:#e8eaf0;font:13px/1.4 system-ui,sans-serif;box-shadow:-8px 0 32px rgba(0,0,0,.35);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1)}.dcp--on{transform:none}' +
    '@media (prefers-reduced-motion:reduce){html.dcp-prep,.dcp{transition:none}}' +
    '.dcp *{box-sizing:border-box}.dcp__h{padding:8px 10px;border-bottom:1px solid #2a2e38;display:flex;align-items:center;gap:8px}.dcp__h b{font-size:14px;flex:1;white-space:nowrap}' +
    '.dcp__l{flex:1;overflow:auto;padding:0 6px 8px}' +
    '.dcp__tb{width:100%;border-collapse:collapse;font-size:12px}.dcp__tb th{position:sticky;top:0;background:#14161c;text-align:left;color:#8d93a3;font-weight:500;padding:6px 6px;border-bottom:1px solid #2a2e38}' +
    '.dcp__tb td{padding:4px 6px;border-bottom:1px solid #23262f;vertical-align:middle}.dcp__tb tr[data-copy]{cursor:pointer}.dcp__tb tr[data-copy]:hover,.dcp__tb tr[data-copy]:focus{background:#262a35;outline:none}' +
    '.dcp__nm{font-weight:600;font-size:12.5px;line-height:1.25}.dcp__num{font-variant-numeric:tabular-nums;color:#8d93a3;font-size:11.5px;line-height:1.25}.dcp__st{white-space:nowrap;color:#b9bfce;text-align:right;width:1%}.dcp__ch{width:1%;padding-left:0!important}.dcp .dcp__ch button{padding:0 6px;line-height:20px;font-size:15px}' +
    '.dcp__pop{position:fixed;z-index:2147483001;min-width:190px;background:#1c1f27;border:1px solid #3a4050;border-radius:10px;padding:4px;box-shadow:0 10px 28px rgba(0,0,0,.5);color:#e8eaf0;font:13px system-ui}' +
    '.dcp__pop h5{margin:4px 8px 2px;color:#8d93a3;font:500 11px system-ui;text-transform:uppercase;letter-spacing:.04em}.dcp .dcp__pop button{display:flex;justify-content:space-between;gap:12px;width:100%;text-align:left;background:none;border:0;border-radius:6px;padding:6px 8px}.dcp__pop button[aria-checked=true]{color:#8fb4ff;font-weight:600}' +
    '.dcp__sep{height:1px;background:#2a2e38;margin:4px 0}' +
    '.dcp__dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px}.dcp__dot--rojo{background:#ff6b78}.dcp__dot--verde{background:#4fd18b}.dcp__dot--ambar{background:#f2b84b}.dcp__dot--gris{background:#7b8294}' +
    '.dcp button{font:inherit;color:#e8eaf0;background:#262a35;border:1px solid #363b49;border-radius:7px;padding:3px 8px;cursor:pointer}.dcp button:hover:not(:disabled){background:#313645}.dcp button:disabled{opacity:.35;cursor:default}' +
    '.dcp__v{padding:8px 10px;border-bottom:1px solid #2a2e38}.dcp .dcp__ir{width:100%;height:38px;font:600 13px system-ui;color:#fff;background:#2b4a8f;border:1px solid #4a74d4;border-radius:9px;padding:0 10px;cursor:pointer}.dcp .dcp__ir:hover{background:#335aaa}.dcp__ir option,.dcp__ir optgroup{color:#111;background:#fff}';

  function corta(e, p, n) {
    if (e.bloqueado) { return 'Vigente'; }
    if (!n && p.oculta) { return 'Oculta'; }
    if (e.enTramite.length) { return 'Recibida'; }
    return e.cumplidas.length ? 'Cumplida' : 'Libre';
  }
  /* Una sola tabla: nombre y cédula a la izquierda, estado a la derecha; tocar la fila copia la cédula. */
  function fila(p) {
    var e = estado(p.tipoId, p.numId), et = etiqueta(e, p);
    return '<tr data-copy="' + esc(p.numId) + '" tabindex="0"><td><div class="dcp__nm">' + esc(p.nombres + ' ' + p.apellidos) + '</div><div class="dcp__num">' + esc(p.numId) + '</div></td>' +
      '<td class="dcp__st"><i class="dcp__dot dcp__dot--' + et.c + '"></i>' + esc(corta(e, p, e.registros.length)) + '</td>' +
      '<td class="dcp__ch"><button type="button" data-pop="' + p.id + '" aria-haspopup="menu" aria-label="Cambiar estado de ' + esc(p.nombres) + '">⌄</button></td></tr>';
  }
  function actual() {
    var aqui = location.pathname + location.hash.split('?')[0], hit = '';
    VISTAS.forEach(function (g) { g[1].forEach(function (v) { var u = new URL(v[1], location.href); if (u.pathname + u.hash === aqui) { hit = v[1]; } }); });
    return hit;
  }
  function selector() {
    var cur = actual();
    return '<select class="dcp__ir" data-ir aria-label="Cambiar de vista"><option value=""' + (cur ? '' : ' selected') + '>Cambiar de vista…</option>' + VISTAS.map(function (g) {
      return '<optgroup label="' + g[0] + '">' + g[1].map(function (v) { return '<option value="' + v[1] + '"' + (v[1] === cur ? ' selected' : '') + '>' + esc(v[0]) + '</option>'; }).join('') + '</optgroup>';
    }).join('') + '</select>';
  }
  function pintar(el) {
    document.documentElement.style.setProperty('--dcp-w', '320px');
    el.querySelector('.dcp__l').innerHTML = '<table class="dcp__tb"><tbody>' + DATA.personas.concat(DATA.libres || []).map(fila).join('') + '</tbody></table>';
  }
  function cerrar() {
    var el = document.getElementById('dcPanel'), h = document.documentElement;
    h.classList.remove('dcp-abierto'); clearInterval(reloj);
    if (el) { el.classList.remove('dcp--on'); }
    setTimeout(function () { if (!h.classList.contains('dcp-abierto')) { h.classList.remove('dcp-prep'); h.style.removeProperty('--dcp-w'); if (el) { el.remove(); } } }, 320);
    try { sessionStorage.removeItem(PANEL); } catch (e) { /* sin almacenamiento */ }
  }
  function abrir() {
    if (!gi() || document.getElementById('dcPanel')) { return; }
    var st = document.createElement('style'); st.textContent = CSS;
    var el = document.createElement('aside'); el.id = 'dcPanel'; el.className = 'dcp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Casos de prueba');
    el.innerHTML = '<div class="dcp__h"><b>Casos de prueba</b><button type="button" data-all title="Reiniciar todo" aria-label="Reiniciar todo">↺</button><button type="button" data-x aria-label="Cerrar">✕</button></div><div class="dcp__v">' + selector() + '</div><div class="dcp__l"></div>';
    el.appendChild(st);
    function copiar(tr) {
      var c = tr.querySelector('.dcp__num'), v = tr.getAttribute('data-copy');
      try { navigator.clipboard.writeText(v); } catch (er) { return; }
      c.textContent = 'Copiada ✓'; c.setAttribute('data-ok', '1'); setTimeout(function () { c.textContent = v; c.removeAttribute('data-ok'); }, 900);
    }
    el.addEventListener('keydown', function (e) { var tr = e.target.closest && e.target.closest('tr[data-copy]'); if (tr && e.target === tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); copiar(tr); } });
    el.addEventListener('change', function (e) {
      var t = e.target; if (!t.hasAttribute('data-ir') || !t.value) { return; }
      try { sessionStorage.setItem(PANEL, '1'); } catch (er) { /* sin almacenamiento */ }
      w.location.href = t.value;
    });
    function cerrarPop() { var q = el.querySelector('.dcp__pop'); if (q) { q.remove(); } }
    function abrirPop(btn) {
      var id = btn.getAttribute('data-pop'), p = base(id), e = estado(p.tipoId, p.numId), act = claveEstado(e, p), r = btn.getBoundingClientRect();
      var abierto = el.querySelector('.dcp__pop'); cerrarPop(); if (abierto && abierto.getAttribute('data-id') === id) { return; }
      var q = document.createElement('div'); q.className = 'dcp__pop'; q.setAttribute('role', 'menu'); q.setAttribute('data-id', id);
      q.innerHTML = '<h5>Forzar estado</h5>' + ESTADOS.map(function (x, i) {
        return (i === ESTADOS.length - 1 ? '<div class="dcp__sep"></div>' : '') + '<button type="button" role="menuitemradio" aria-checked="' + (x[0] === act) + '" data-st="' + x[0] + '"><span>' + x[1] + '</span>' + (x[0] === act ? '<span>✓</span>' : '') + '</button>';
      }).join('');
      el.appendChild(q);
      q.style.top = Math.max(8, Math.min(r.bottom + 4, w.innerHeight - q.offsetHeight - 8)) + 'px'; q.style.right = (w.innerWidth - r.right) + 'px';
    }
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.querySelector('.dcp__pop')) { e.stopPropagation(); cerrarPop(); } }, true);
    el.addEventListener('click', function (e) {
      var st = e.target.closest('[data-st]');
      if (st) {
        try { sessionStorage.setItem(PANEL, '1'); } catch (er) { /* sin almacenamiento */ }
        forzar(st.getAttribute('data-st'), st.parentNode.getAttribute('data-id')); w.location.reload(); return;
      }
      var ch = e.target.closest('[data-pop]'); if (ch) { abrirPop(ch); return; }
      if (!e.target.closest('.dcp__pop')) { cerrarPop(); }
      var t = e.target.closest('button');
      if (!t) { var tr = e.target.closest('tr[data-copy]'); if (tr) { copiar(tr); } return; }
      if (t.hasAttribute('data-x')) { cerrar(); }
      else if (t.hasAttribute('data-all')) { if (w.confirm('¿Reiniciar todas las personas y los datos de la demo?')) { reiniciarTodo(); } }
    });
    document.body.appendChild(el);
    pintar(el);
    /* El estado cambia al operar las apps: se relee cada segundo (misma pestaña) y al cambiar el almacén (otra pestaña). */
    reloj = setInterval(function () {
      var v = el.querySelector('.dcp__v');
      if (document.activeElement !== v.firstChild) { var sel = selector(); if (v.innerHTML !== sel) { v.innerHTML = sel; } }
      if (!el.querySelector('.dcp__num[data-ok]')) { pintar(el); }
    }, 1000);
    w.addEventListener('storage', function onS(ev) { if (!document.getElementById('dcPanel')) { w.removeEventListener('storage', onS); return; } if (!ev.key || ev.key === 'suid.gi.v3') { gi().reload(); pintar(el); } });
    var h = document.documentElement;
    h.classList.add('dcp-prep');
    void el.offsetWidth;
    requestAnimationFrame(function () { h.classList.add('dcp-abierto'); el.classList.add('dcp--on'); });
  }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && String(e.key).toLowerCase() === 'l') {
      e.preventDefault();
      if (document.getElementById('dcPanel')) { cerrar(); } else { abrir(); }
    } else if (e.key === 'Escape' && document.getElementById('dcPanel')) { cerrar(); }
  });

  function arrancar() {
    init();
    try { if (sessionStorage.getItem(PANEL) === '1') { abrir(); } } catch (e) { /* sin almacenamiento */ }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }

  w.DemoCasos = { personas: DATA.personas, estado: estado, bloqueado: bloqueado, autocompletar: autocompletar, buscar: buscar, solicitudes: solicitudes, siguienteId: siguienteId, registrarSolicitud: registrarSolicitud, abrir: abrir, cerrar: cerrar, reiniciarTodo: reiniciarTodo };
})(window);
