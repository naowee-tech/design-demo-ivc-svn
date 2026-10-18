/* Casos de prueba ocultos: personas del JSON + estado en el almacén del IVC (suid.gi.v3), común a IVC, comercializadora y puerta.
   Panel con Ctrl/⌘ + Shift + L. Requiere gi-catalogos.js y gi-data.js cargados antes. */
(function (w) {
  'use strict';
  var KEY = 'demo.estado.v1';
  /* Las vistas se resuelven desde la raíz del sitio, así el panel sirve igual desde index.html, suid/ y svn/. */
  var RAIZ = new URL('../', (document.currentScript || {}).src || location.href).href;
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
    return c === 'PA' || c === 'PASAPORTE' ? 'P' : c;
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
    gi().reload();
    var st = leer();
    DATA.personas.forEach(function (p) {
      if (p.oculta || st[p.id] || registrosDe(p).length) { return; }
      sembrar(p, p.sanciones);
    });
  }

  /* ───────── consulta: lo que leen todas las superficies ───────── */
  function calcular(tipo, num, hoy) {
    var k = clave(tipo, num), regs = gi().all().filter(function (r) { return deRegistro(r) === k; }), D = gi().derive;
    var act = [], cum = [], ina = [];
    regs.forEach(function (r) {
      var fin = D.finVigencia(r), e = r.estadoRegistro !== 'Validado' ? 'Inactiva' : (fin && hoy > fin ? 'Cumplida' : 'Activa');
      (e === 'Activa' ? act : e === 'Cumplida' ? cum : ina).push(r);
    });
    var dias = act.length ? Math.min.apply(null, act.map(function (r) { return Math.round((U().parse(D.finVigencia(r)) - U().parse(hoy)) / 86400000); })) : null;
    return { persona: baseDoc(tipo, num), registros: regs, vigentes: act, cumplidas: cum, enTramite: ina, bloqueado: act.length > 0, antecedente: !act.length && cum.length > 0, diasRestantes: dias };
  }
  function estado(tipo, num) { return calcular(tipo, num, U().today()); }
  function bloqueado(tipo, num) { return !!gi() && estado(tipo, num).bloqueado; }

  /* ───────── privacidad: qué se ve de la persona según la vista ───────── */
  function nombreDe(p) { return (String(p.nombres || '') + ' ' + String(p.apellidos || '')).replace(/\s+/g, ' ').trim(); }
  function inicialesDe(p) { return nombreDe(p).split(' ').filter(Boolean).map(function (x) { return x.charAt(0).toUpperCase() + '.'; }).join(' '); }
  function ult4(num) { return String(num == null ? '' : num).replace(/[^A-Za-z0-9]/g, '').slice(-4); }
  function mascara(tipo, num) { return codigo(tipo) + ' •••• ' + ult4(num); }
  function completo(tipo, num) { return docPuntos(tipo, num); }
  /* 'puerta-rojo' lo arma el resolver cuando la puerta bloquea por medida: ni nombre ni documento completo. */
  function privacidad(persona, vista) {
    var p = persona || {}, menor = !!p.esMenor, nom = nombreDe(p), ini = inicialesDe(p), v = vista || 'ivc', r;
    if (v === 'ivc') { r = { nombreVisible: nom, docVisible: completo(p.tipoId, p.numId) }; }
    else if (v === 'puerta-rojo') { r = { nombreVisible: '', docVisible: mascara(p.tipoId, p.numId) }; }
    else if (v === 'pmu' || v === 'auditoria') { r = { nombreVisible: menor ? '' : nom, docVisible: mascara(p.tipoId, p.numId) }; }
    else if (menor) { r = { nombreVisible: ini, docVisible: mascara(p.tipoId, p.numId) }; }
    else { r = { nombreVisible: nom, docVisible: completo(p.tipoId, p.numId) }; }
    r.iniciales = ini; r.esMenor = menor;
    return r;
  }

  /* Identidad: la persona de la demo, o la del registro más reciente del IVC para cualquier otro documento. */
  function masReciente(regs) {
    return regs.reduce(function (a, r) { return !a || String(r.fechaRegistro || '') > String(a.fechaRegistro || '') ? r : a; }, null);
  }
  function resolver(tipo, num, opts) {
    if (!gi() || !String(num == null ? '' : num).replace(/[^A-Za-z0-9]/g, '')) { return null; }
    opts = opts || {};
    var hoy = opts.hoy || U().today(), e = calcular(tipo, num, hoy), b = e.persona, ult = masReciente(e.registros), fuente = b ? 'demo' : 'gi', per;
    if (!b && !ult) { return null; }
    var ident = b || ult;
    per = { id: b ? b.id : null, tipoId: ident.tipoId, numId: ident.numId, nombres: ident.nombres, apellidos: ident.apellidos, fechaNac: ident.fechaNac, sexo: ident.sexo, ciudad: ident.ciudad, depto: ident.depto };
    per.esMenor = !!(ident.fechaNac && U().ageAt(ident.fechaNac, hoy) < 18) || (!!ult && gi().derive.esMenor(ult) === true);
    var est = e.bloqueado ? (e.diasRestantes != null && e.diasRestantes <= 30 ? 'porVencer' : 'vigente') : e.enTramite.length ? 'enTramite' : e.cumplidas.length ? 'cumplida' : (!e.registros.length && b && b.oculta ? 'oculta' : 'libre');
    var vista = opts.vista || 'ivc';
    if (vista === 'puerta' && e.bloqueado) { vista = 'puerta-rojo'; }
    var pv = privacidad(per, vista);
    return {
      clave: clave(tipo, num), tipo: ident.tipoId, num: ident.numId, fuente: fuente, persona: per, esMenor: per.esMenor, estado: est,
      bloquea: e.bloqueado, antecedente: e.antecedente, diasRestantes: e.diasRestantes, registros: e.registros,
      nombreVisible: pv.nombreVisible, docVisible: pv.docVisible, iniciales: pv.iniciales
    };
  }
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
    gi() && gi().reload();
    var r = nuevaSolicitud(Object.assign({}, o, { hechosIso: o.hechosIso || isoDeLarga(o.hechos) || U().today() })), l = guardadas();
    l.unshift(r);
    try { localStorage.setItem(SOL, JSON.stringify(l)); } catch (e) { /* sin almacenamiento */ }
    return r;
  }

  /* ───────── forzar estado (popover del panel) ───────── */
  var ESTADOS = [['libre', 'Libre'], ['recibida', 'Recibida · no bloquea'], ['vigente', 'Vigente'], ['porVencer', 'Por vencer'], ['cumplida', 'Cumplida'], ['reiniciar', 'Restablecer al inicio']];
  function forzar(clave, id) {
    var p = base(id), u = U(); if (!p) { return; }
    gi().reload();
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
  var LLAVES = ['demo.estado.v1', SOL, 'suid.gs.v5', 'demo.bus.v1', 'ivc.ev.escenarios-revision'];
  /* Siembra antes de avisar: las otras pestañas se recargan sobre un almacén ya completo. */
  function reiniciarTodo() {
    try { LLAVES.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { /* sin almacenamiento */ }
    if (gi()) { gi().reset(); init(); }
    try { sessionStorage.setItem(PANEL, '1'); localStorage.setItem('demo.reset', String(Date.now())); } catch (e) { /* sin almacenamiento */ }
    w.location.reload();
  }

  /* Sincronización entre pestañas: el almacén de GI cambia afuera y esta pestaña relee y avisa. */
  function avisarCambio() { try { w.dispatchEvent(new w.CustomEvent('demo:cambio')); } catch (e) { /* entorno sin eventos */ } }
  w.addEventListener('storage', function (ev) {
    if (ev.key === 'demo.reset') { w.location.reload(); return; }
    if (!ev.key || ev.key === 'suid.gi.v3') { if (gi()) { gi().reload(); } avisarCambio(); }
  });

  /* ───────── panel ───────── */
  var reloj = null, PAG = 1, POR = 8, vistaEmbebida = '';
  /* Una vista embebida carga esta misma demo: el panel no debe abrirse dentro del iframe. */
  function dentro() { try { return w.top !== w; } catch (e) { return true; } }
  /* Vistas de la demo; las rutas son relativas a suid/ y svn/, que están al mismo nivel. */
  var VISTAS = [
    ['Acceso', [['Inicio de sesión', 'index.html']]],
    ['IVC', [['Gestión de sanciones', 'suid/app.html#/control-acceso/infractores'], ['Búsqueda avanzada', 'suid/app.html#/control-acceso/consulta'], ['Solicitudes', 'suid/app.html#/control-acceso/solicitudes'], ['Eventos', 'suid/app.html#/control-acceso/eventos']]],
    ['SVN', [['Inicio del SVN', 'svn/index.html#/'], ['Comprar y asignar ingresos', 'svn/index.html#/compra'], ['Acceso en puerta', 'svn/index.html#/puerta'], ['Monitor PMU', 'svn/index.html#/policia'], ['Portal de la persona', 'svn/index.html#/portal'], ['Consola de soporte', 'svn/index.html#/soporte'], ['Entidades y comercializadoras', 'svn/index.html#/entidades'], ['API y portal de integración', 'svn/index.html#/integracion']]]
  ];

  /* ───────── ¿Qué estoy viendo? ───────── */
  /* Vista nueva: DEMO_CONTEXTO.registrar(prueba, fn) desde su archivo; prueba es regex o texto sobre ruta + hash, o función, y fn() devuelve
     { donde, pasa } en español llano leyendo solo lo visible. Si carga antes que este archivo, deja [prueba, fn] en un arreglo window.DEMO_CONTEXTO.
     Gana lo que registra la vista sobre lo de fábrica; sin coincidencia, el respaldo arma el texto con título, migas y encabezado. */
  var CTX = [], ctxN = 0, ctxUlt = '', ctxT = null, ctxObs = null;
  function limpia(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function enPanel(e) { var x = e && e.nodeType === 1 ? e : e && e.parentElement; return !!(x && x.closest && x.closest('#dcPanel')); }
  function visible(e) { return !!e && !enPanel(e) && e.getClientRects().length > 0; }
  function todos(sel, raiz) { return [].slice.call((raiz || document).querySelectorAll(sel)).filter(visible); }
  function uno(sel, raiz) { return todos(sel, raiz)[0] || null; }
  function texto(sel, raiz) { var e = typeof sel === 'string' ? uno(sel, raiz) : sel; return e ? limpia(e.innerText || e.textContent) : ''; }
  /* Solo el texto propio del nodo: deja fuera insignias y contadores anidados («Menor de edad», «67»). */
  function propio(e) { return e ? limpia([].filter.call(e.childNodes, function (n) { return n.nodeType === 3; }).map(function (n) { return n.nodeValue; }).join(' ')) : ''; }
  function comillas(s) { return '«' + s + '»'; }
  function enumera(xs) { xs = xs.filter(Boolean); return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]; }
  function frase(s) { s = limpia(s); return !s ? '' : /[.!?…]$/.test(s) ? s : s + '.'; }
  function frases(xs) { return xs.filter(Boolean).map(frase).join(' '); }
  function rutaActual() { return location.pathname + location.hash; }
  function relativa() { return location.pathname.replace(new URL(RAIZ).pathname, ''); }
  function hashRuta() { return decodeURIComponent((location.hash || '').replace(/^#\/?/, '').split('?')[0]); }
  function pestana(raiz) { return todos('[role=tab][aria-selected=true]', raiz).filter(function (e) { return !e.closest('.pp-panel'); }).map(function (e) { return propio(e) || texto(e); })[0] || ''; }
  function etiquetaVista(r) { var t = ''; VISTAS.forEach(function (g) { g[1].forEach(function (v) { if (v[1] === r) { t = v[0]; } }); }); return t; }

  function registrar(prueba, fn, prioridad) { CTX.push({ prueba: prueba, fn: fn, prio: prioridad == null ? 10 : prioridad, n: ctxN++ }); programar(); }
  function coincide(p) { var r = rutaActual(); return typeof p === 'function' ? !!p(r) : p instanceof RegExp ? p.test(r) : r.indexOf(String(p)) >= 0; }
  function describir() {
    var orden = CTX.slice().sort(function (a, b) { return b.prio - a.prio || b.n - a.n; }), i, r;
    for (i = 0; i < orden.length; i++) {
      try { r = coincide(orden[i].prueba) && orden[i].fn(); } catch (e) { r = null; }
      if (r && (r.donde || r.pasa)) { return { donde: frase(r.donde), pasa: frase(r.pasa) }; }
    }
    return respaldo();
  }
  function sistema() {
    var r = relativa();
    return /^suid\//.test(r) ? 'el IVC' : /^svn\/slide\//.test(r) ? 'una presentación' : /^svn\//.test(r) ? 'el SVN' : /^fase0\//.test(r) ? 'el recorrido de integración de bases de datos' : /^manuales\//.test(r) ? 'los manuales de la demo' : /^IVC\b/.test(document.title) ? 'el IVC' : /^SVN\b/.test(document.title) ? 'el SVN' : 'la demo';
  }
  /* De «IVC · Prototipo interactivo · ivc-v1.1.1» queda «Prototipo interactivo»: fuera marcas, versiones y emojis. */
  function nombrePagina(s) {
    return limpia(String(s || '').split(/\s+[·|—-]\s+/).map(function (x) { return limpia(x.replace(/^[^\wÀ-ÿ¿¡«]+/, '')); })
      .filter(function (x) { return x && !/^(IVC|SVN|SUID|Naowee( IVC| Suite)?|Demo)$/i.test(x) && !/\bv?\d+\.\d+/.test(x); })[0] || '');
  }
  function respaldo() {
    var pant = etiquetaVista(actual()) || texto('.suid-bc .is-current') || texto('[aria-current=page]') || nombrePagina(document.title);
    var h1 = nombrePagina(texto('h1')), tab = pestana();
    return { donde: frase('Está en ' + sistema() + (pant ? ', en ' + comillas(pant) : '')),
      pasa: frases([h1 && h1 !== pant ? 'El título de la pantalla es ' + comillas(h1) : '', tab ? 'Tiene abierta la pestaña ' + comillas(tab) : '']) };
  }

  /* ───────── descriptores de fábrica (prioridad 0) ───────── */
  function fabrica(p, fn) { registrar(p, fn, 0); }
  var esIVC = function () { return relativa() === 'suid/app.html'; };
  function ivc(pant, pasa) { return { donde: 'Está en el IVC, en ' + pant, pasa: frases(pasa) }; }
  function filasVisibles() { return todos('.gt-table tbody tr').length; }

  fabrica(function () { return relativa() === '' || relativa() === 'index.html'; }, function () {
    var b = document.getElementById('kc-login'), t = b ? limpia(b.value || b.textContent) : '', ps = DATA.personas.concat(DATA.libres || []), vig;
    vig = gi() ? ps.filter(function (p) { return estado(p.tipoId, p.numId).bloqueado; }).length : null;
    return { donde: 'Está en el inicio de sesión del Sistema Único de Información del Deporte, la entrada al IVC',
      pasa: frases([b && b.disabled ? 'Está entrando al IVC' : t ? 'Los datos ya vienen llenos: al pulsar ' + comillas(t) + ' entra al IVC' : '',
        vig != null ? 'El panel tiene ' + ps.length + ' personas de prueba; ' + (vig === 1 ? 'una tiene' : vig + ' tienen') + ' sanción vigente' : '']) };
  });
  /* El IVC: respaldo propio con migas, subtítulo y pestaña; las rutas conocidas lo afinan abajo. */
  fabrica(esIVC, function () {
    var cur = texto('.suid-bc .is-current');
    return ivc(cur && hashRuta() ? comillas(cur) : 'la pantalla de inicio', [hashRuta() ? texto('.page-subtitle') : 'Desde el menú de la izquierda se entra a Gestión de sanciones, Búsqueda avanzada, Solicitudes y Eventos',
      pestana() && 'Tiene abierta la pestaña ' + comillas(pestana()), filasVisibles() && 'La tabla muestra ' + filasVisibles() + ' filas']);
  });
  fabrica(function () { return esIVC() && hashRuta() === 'control-acceso/infractores'; }, function () {
    var tabs = todos('.gi-tab').map(function (e) { return { t: propio(e) || texto(e), n: texto('.gt-count', e), on: e.getAttribute('aria-selected') === 'true' }; });
    var act = tabs.filter(function (t) { return t.on; })[0], D = gi() && gi().derive, activas = null;
    if (D && D.estadoRestriccion) { activas = gi().all().filter(function (r) { return D.estadoRestriccion(r) === 'Activa'; }).length; }
    return ivc('Gestión de sanciones', [act && 'Tiene abierta la pestaña ' + comillas(act.t),
      enumera(tabs.filter(function (t) { return t.n; }).map(function (t) { return t.n + ' ' + t.t.toLowerCase(); })).replace(/^./, function (c) { return 'Hay ' + c; }),
      activas == null ? '' : activas === 0 ? 'Ningún registro tiene la sanción activa' : activas === 1 ? 'Un registro tiene la sanción activa y bloquea el ingreso en todo el país' : activas + ' registros tienen la sanción activa y bloquean el ingreso en todo el país',
      act && act.t !== 'Indicadores' && filasVisibles() ? 'En pantalla se ven ' + filasVisibles() + ' filas' : '']);
  });
  fabrica(function () { return esIVC() && /^control-acceso\/infractores\/(nuevo|carga-masiva|[^/]+\/editar)$/.test(hashRuta()); }, function () {
    var pct = texto('#gfPct') || limpia((document.getElementById('gfPct') || {}).textContent);
    return ivc('Gestión de sanciones, en ' + comillas(texto('.suid-bc .is-current') || 'el formulario'), [pct && 'El formulario va ' + pct + ' completo', !pct && texto('.page-subtitle')]);
  });
  fabrica(function () { return esIVC() && /^control-acceso\/infractores\/[^/]+$/.test(hashRuta()) && !/\/(nuevo|carga-masiva)$/.test(hashRuta()); }, function () {
    var h = uno('h1.page-title'), nom = propio(h), menor = !!h && /menor de edad/i.test(h.textContent), est = texto('.gx-estado__t');
    return ivc('Gestión de sanciones, en el expediente ' + hashRuta().split('/')[2], [nom && 'Es el registro de ' + nom + (menor ? ', menor de edad' : ''), est && 'Estado: ' + est]);
  });
  fabrica(function () { return esIVC() && hashRuta() === 'control-acceso/solicitudes'; }, function () {
    var tot = texto('#gsTN'), f = filasVisibles();
    return ivc('Solicitudes, los reportes que llegan de las entidades y las inspecciones', [tot && 'Hay ' + tot + ' solicitudes' + (f ? '; en pantalla se ven ' + f : '')]);
  });
  fabrica(function () { return esIVC() && /^control-acceso\/solicitudes\/[^/]+$/.test(hashRuta()); }, function () {
    var h = uno('h1.page-title'), nom = propio(h), est = h ? limpia(h.textContent.replace(nom, '')) : '';
    return ivc('Solicitudes, en el reporte ' + hashRuta().split('/')[2], [nom && 'Es el reporte sobre ' + nom, est && 'Estado: ' + est]);
  });
  fabrica(function () { return esIVC() && hashRuta() === 'control-acceso/eventos'; }, function () {
    var g = todos('.ev-grupo__tit').map(function (e) { var t = propio(e), k = limpia(e.textContent.replace(t, '')); return k && t ? k + ' ' + t.toLowerCase() : ''; });
    var f = uno('.ev-herr [aria-pressed=true], .ev-herr [aria-selected=true], .ev-herr [aria-checked=true]'), ft = f ? propio(f) || texto(f) : '';
    return ivc('Eventos', [g.length && 'Eventos en pantalla: ' + enumera(g), ft && !/^todos/i.test(ft) && 'Está filtrando por ' + comillas(ft)]);
  });
  fabrica(function () { return esIVC() && /^control-acceso\/eventos\/escenarios/.test(hashRuta()); }, function () {
    var cur = texto('.suid-bc .is-current');
    return ivc(cur && cur !== 'Escenarios' ? 'el escenario ' + comillas(cur) : 'el catálogo de escenarios de Eventos', [texto('.page-subtitle')]);
  });
  fabrica(function () { return esIVC() && /^control-acceso\/eventos\/[^/]+$/.test(hashRuta()) && !/escenarios$/.test(hashRuta()); }, function () {
    var b = texto('.gi-head .pb-badge') || texto('.pb-badge');
    return { donde: 'Está en el IVC, dentro del evento ' + comillas(texto('.suid-bc .is-current') || 'elegido'),
      pasa: frases([b && 'Estado del evento: ' + b, pestana() && 'Tiene abierta la pestaña ' + comillas(pestana())]) };
  });
  fabrica(function () { return esIVC() && /^en-construccion\//.test(hashRuta()); }, function () {
    return ivc('una bandeja que queda fuera de la demo', ['El trabajo de la demo está en Control de acceso']);
  });

  /* SVN: la app sale del toolbar y el caso del cuadro «Este caso»; el panel lateral se lee aunque esté plegado. */
  var esSVN = function () { return relativa() === 'svn/index.html' || relativa() === 'svn/'; };
  function svnCaso() {
    var c = document.querySelector('#pp-caso-info'), t, res = '', act = document.querySelector('.pp-panel [class*="caso--activo"] .nwt-detail-item__label');
    /* Sin el cuadro de la puerta se nombra solo la etiqueta del caso: la descripción del portal abre con el nombre de la persona. */
    if (!c) { t = act ? limpia(act.textContent).replace(/^\d+\s*·\s*/, '') : ''; return t ? 'Caso elegido: ' + comillas(t) : ''; }
    t = limpia((c.querySelector('.pp-caso-info__t') || {}).textContent);
    if (!t) { return c.querySelector('.pp-caso-info__n') ? 'Aún no hay un caso elegido en la lista de casos' : limpia(c.textContent).split('. ')[0]; }
    [].forEach.call(c.querySelectorAll('p'), function (p) { var x = limpia(p.textContent); if (/^Resultado:/.test(x)) { res = x.replace(/^Resultado:\s*/, ''); } });
    return 'Caso elegido: ' + comillas(t) + (res ? '; resultado esperado: ' + res.replace(/\.$/, '') : '');
  }
  function svnPantalla() { return todos('h1').filter(function (e) { return !e.closest('.pp-toolbar, .pp-panel'); }).map(function (e) { return propio(e) || texto(e); })[0] || ''; }
  function svn(pasa) {
    var app = texto('.pp-toolbar .nwt-title__description'), sub = texto('.pp-toolbar .nwt-title__subtitle');
    return { donde: app ? 'Está en el SVN, en ' + comillas(app) + (sub ? ' — ' + sub : '') : 'Está en el SVN', pasa: frases(pasa.concat([svnCaso()])) };
  }
  function enApp(h) { return function () { return esSVN() && location.hash === h; }; }
  fabrica(esSVN, function () { var p = svnPantalla(); return svn([p && 'En pantalla: ' + comillas(p)]); });
  fabrica(function () { return esSVN() && (!location.hash || location.hash === '#/' || location.hash === '#'); }, function () {
    var t = pestana();
    return { donde: 'Está en el inicio del SVN, donde se elige con qué aplicación entrar', pasa: frases([t && 'La lista agrupa las entradas ' + t.toLowerCase()]) };
  });
  fabrica(enApp('#/puerta'), function () {
    var pal = texto('.pp-r__palabra'), puerta = texto('.pp-barra__puerta'), ayuda = texto('.pp-camara__ayuda');
    pal = pal ? pal.charAt(0) + pal.slice(1).toLowerCase() : '';
    return svn([pal ? 'La puerta acaba de responder ' + comillas(pal) : uno('.pp-c__punto--activo') ? 'La validación del documento está en curso' : ayuda ? 'El lector espera que escanee un documento' + (puerta ? ' en la ' + puerta : '') : '']);
  });
  fabrica(enApp('#/compra'), function () {
    var ev = propio(uno('.pc-app h1')) || texto('.pc-app h1'), paso = texto('.pc-app h2');
    return svn([ev && 'La persona está comprando ingresos para ' + comillas(ev) + (paso ? ', en el paso ' + comillas(paso) : '')]);
  });
  fabrica(enApp('#/portal'), function () { var h = texto('.pt-app h1'); return svn([h && 'La persona ve la pantalla ' + comillas(h)]); });
  fabrica(enApp('#/soporte'), function () {
    var r = texto('.sp-det__cab h2, .sp-det__cab h1'), c = uno('.sp-chip[aria-pressed=true]'), n = c ? texto('.sp-chip__n', c) : '';
    return svn([r && 'Tiene abierta la reclamación ' + comillas(r), c && 'La bandeja muestra ' + comillas(propio(c)) + (n ? ': ' + n + (n === '1' ? ' reclamación' : ' reclamaciones') : '')]);
  });
  fabrica(enApp('#/policia'), function () {
    var h = svnPantalla(), f = texto('.pp-t__filtro[aria-selected=true]');
    return svn([h && 'Está viendo ' + comillas(h) + (f ? ' con el filtro ' + comillas(f) : '')]);
  });
  fabrica(enApp('#/entidades'), function () {
    var como = limpia((document.querySelector('.pp-panel [role=tab][aria-selected=true]') || {}).textContent), h = texto('.en-app h1');
    return svn([(como ? 'Lo ve como ' + comillas(como) : '') + (h ? (como ? ', en ' : 'Está en ') + comillas(h) : '')]);
  });
  fabrica(enApp('#/integracion'), function () { var h = texto('.ig-h1'); return svn([h && 'Está en la sección ' + comillas(h)]); });

  fabrica(function () { return /^fase0\//.test(relativa()); }, function () {
    var bs = todos('.f0-etapa-b'), cur = uno('.f0-etapa[aria-current] .f0-etapa-b, .f0-etapa-b[aria-current]'), barra = uno('.f0-barra');
    var sub = todos('.f0-sub').filter(function (e) { return !e.closest('.f0-molde-v'); }).map(texto)[0] || '', fin = !!barra && +barra.getAttribute('aria-valuenow') >= 3;
    var i = cur ? bs.indexOf(cur) : -1, nom = cur ? limpia((cur.getAttribute('aria-label') || '').split(': ').slice(1).join(': ')) : '';
    return { donde: 'Está en el recorrido ' + comillas(limpia(document.title.split(' · ')[0])) + ' del IVC',
      pasa: frases([i >= 0 ? 'Va en la etapa ' + (i + 1) + ' de ' + bs.length + (nom ? ': ' + nom : '') : fin ? 'El recorrido llegó al resumen final' : '', sub]) };
  });
  fabrica(function () { return /^manuales\//.test(relativa()); }, function () {
    var pag = texto('[aria-current=page]'), hs = todos('main h2, article h2, h2').map(function (e) { return propio(e) || texto(e); }).filter(Boolean), f = todos('table tbody tr').length;
    hs = hs.filter(function (h, k) { return hs.indexOf(h) === k; });
    return { donde: 'Está en los manuales de la demo, en ' + comillas(pag && pag !== 'Inicio' ? pag : limpia(document.title.split(' · ')[0]) === 'Manuales' ? 'Cómo usar la demo' : limpia(document.title.split(' · ')[0])),
      pasa: frases([f && /cedulas/.test(relativa()) ? 'La tabla muestra ' + f + ' cédulas de prueba' : hs.length ? 'Secciones de la página: ' + enumera(hs.slice(0, 4)) + (hs.length > 4 ? ', entre otras' : '') : '']) };
  });
  fabrica(function () { return /^svn\/slide\//.test(relativa()); }, function () {
    var m = /(\d+)\s*\/\s*(\d+)/.exec(texto('[data-counter], .dk-counter')), s = uno('.dk-slide:not([hidden])'), t = s ? texto('h1, h2', s) : '';
    return { donde: 'Está en la presentación ' + comillas(limpia(document.title)),
      pasa: frases([m ? 'Va en la diapositiva ' + m[1] + ' de ' + m[2] + (t ? ': ' + comillas(t) : '') : t && 'En pantalla: ' + comillas(t)]) };
  });
  /* Una vista que cargue antes que este archivo pudo dejar sus descriptores en espera. */
  if (Array.isArray(w.DEMO_CONTEXTO)) { w.DEMO_CONTEXTO.forEach(function (a) { registrar(a[0], a[1], a[2]); }); }

  function refrescar() {
    var box = document.querySelector('#dcPanel .dcp__ctx-t'), d = describir(), extra, h;
    if (!box) { return d; }
    extra = vistaEmbebida ? 'En el panel tiene abierta la vista ' + comillas(etiquetaVista(vistaEmbebida) || 'elegida') + '.' : '';
    h = '<p class="dcp__ctx-d">' + esc(d.donde) + '</p>' + (d.pasa || extra ? '<p class="dcp__ctx-p">' + esc(limpia(d.pasa + ' ' + extra)) + '</p>' : '');
    /* Solo se escribe si cambió: la región viva no repite el anuncio ni dispara al observador. */
    if (h !== ctxUlt) { box.innerHTML = h; ctxUlt = h; }
    return d;
  }
  function programar() { if (ctxT || !document.getElementById('dcPanel')) { return; } ctxT = setTimeout(function () { ctxT = null; refrescar(); }, 500); }
  /* Mira la página, no el panel: el panel se repinta cada segundo y entraría en bucle consigo mismo. */
  function vigilar(on) {
    ['hashchange', 'popstate', 'demo:cambio'].forEach(function (ev) { w.removeEventListener(ev, programar); if (on) { w.addEventListener(ev, programar); } });
    if (ctxObs) { ctxObs.disconnect(); ctxObs = null; }
    clearTimeout(ctxT); ctxT = null;
    if (!on) { ctxUlt = ''; return; }
    ctxObs = new MutationObserver(function (rs) { for (var i = 0; i < rs.length; i++) { if (!enPanel(rs[i].target)) { programar(); return; } } });
    ctxObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'aria-selected', 'aria-pressed', 'aria-valuenow', 'hidden', 'class', 'disabled'] });
  }
  w.DEMO_CONTEXTO = { registrar: registrar, describir: describir, refrescar: refrescar };

  var CSS = 'html.dcp-prep{position:relative;left:0;transition:left .3s cubic-bezier(.2,.8,.2,1)}html.dcp-abierto{left:calc(-1 * var(--dcp-w,360px))}' +
    '.dcp{position:fixed;top:0;right:0;bottom:0;width:var(--dcp-w,360px);max-width:100vw;z-index:2147483000;background:#14161c;color:#e8eaf0;font:13px/1.4 system-ui,sans-serif;box-shadow:-8px 0 32px rgba(0,0,0,.35);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1)}.dcp--on{transform:none}' +
    '@media (prefers-reduced-motion:reduce){html.dcp-prep,.dcp{transition:none}}' +
    '.dcp *{box-sizing:border-box}.dcp__h{padding:8px 10px;border-bottom:1px solid #2a2e38;display:flex;align-items:center;gap:8px}.dcp__h b{font-size:14px;flex:1;white-space:nowrap}' +
    /* Una sola columna con scroll: las vistas empujan la tabla hacia abajo (DC-120). */
    '.dcp__cuerpo{flex:1;min-height:0;overflow:auto}' +
    '.dcp__sec{padding:10px 10px 8px}.dcp__sec+.dcp__sec{border-top:1px solid #2a2e38}' +
    '.dcp__sec-h{margin:0 0 6px;font:600 11px/1.2 system-ui,sans-serif;color:#8d93a3;text-transform:uppercase;letter-spacing:.04em}' +
    /* min-height: el SVN le da 36 px a todo h3 y el título se despegaba de su texto; solo aquí, el resto del panel queda igual. */
    '.dcp__ctx .dcp__sec-h{min-height:0}#dcPanel .dcp__ctx .dcp__sec-h button{all:unset;box-sizing:border-box;display:flex;width:100%;align-items:center;justify-content:space-between;cursor:pointer;text-transform:inherit;letter-spacing:inherit;font:inherit;color:inherit;background:none;border:0;padding:0;min-height:0}.dcp__ctx .dcp__sec-h button:focus-visible{outline:2px solid #8fb4ff;outline-offset:2px;border-radius:4px}.dcp__ctx .dcp__sec-h i{width:7px;height:7px;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg);margin:-3px 2px 0 0;transition:transform .2s}.dcp__ctx .dcp__sec-h button[aria-expanded=true] i{transform:rotate(-135deg);margin:3px 2px 0 0}.dcp__ctx-t{margin-top:6px}.dcp__ctx-t p{margin:0;overflow-wrap:anywhere}.dcp__ctx-d{font-weight:600;line-height:1.35}.dcp__ctx-p{margin-top:4px!important;color:#b9bfce;font-size:12.5px;line-height:1.45}' +
    '.dcp__tb{width:100%;border-collapse:collapse;font-size:12px}.dcp__tb th{text-align:left;color:#8d93a3;font-weight:500;padding:6px 6px;border-bottom:1px solid #2a2e38}' +
    '.dcp__tb td{padding:4px 6px;border-bottom:1px solid #23262f;vertical-align:middle}' +
    '.dcp__cp{cursor:pointer;border-radius:4px}.dcp__cp:hover,.dcp__cp:focus-visible{outline:none;text-decoration:underline}.dcp__cp[data-ok]{color:var(--naotech-primary-color-normal,#8fb4ff)}' +
    /* Va pegado a la última fila de la tabla (DC-119): sin borde ni hueco propio. */
    '.dcp__pg{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-items:center;padding:4px 0 0}' +
    '.dcp__vi{display:flex;flex-direction:column;gap:1px}.dcp__grp{margin:6px 0 2px;padding:0 8px;font-size:11px;color:#8d93a3}.dcp__grp:first-child{margin-top:0}' +
    /* El botón del sistema trae justify-content:center: text-align no alcanza (DC-147). */
    '#dcPanel .dcp__vi button{width:100%;text-align:left;justify-content:flex-start;background:none;border:0;border-radius:6px;padding:4px 8px}' +
    '#dcPanel .dcp__vi button:hover:not(:disabled){background:#262a35}' +
    '.dcp__vi button[aria-current=true]{color:#8fb4ff;font-weight:600}' +
    '.dcp__acc{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.dcp__logo{margin-left:auto;height:18px;width:auto;filter:brightness(0) invert(1);opacity:.85}' +
    '#dcPanel .dcp__pg button{min-width:28px;padding:3px 6px;font-variant-numeric:tabular-nums}#dcPanel .dcp__pg button[aria-current=page]{color:#8fb4ff;font-weight:600;border-color:#4a74d4}' +
    '.dcp__emb{margin-top:8px;border:1px solid #2a2e38;border-radius:9px;overflow:hidden}.dcp__emb[hidden]{display:none}.dcp__emb-h{display:flex;gap:6px;justify-content:flex-end;padding:6px;background:#1c1f27}' +
    '.dcp__emb iframe{display:block;width:100%;height:300px;border:0;background:#fff}' +
    '.dcp__nm{font-weight:600;font-size:12.5px;line-height:1.25}.dcp__num{font-variant-numeric:tabular-nums;color:#8d93a3;font-size:11.5px;line-height:1.25}.dcp__st{white-space:nowrap;color:#b9bfce;text-align:right;width:1%}.dcp__ch{width:1%;padding-left:0!important}#dcPanel .dcp__ch button{width:26px;height:22px;padding:0;line-height:20px;font-size:15px}' +
    '.dcp__pop{position:fixed;z-index:2147483001;min-width:190px;background:#1c1f27;border:1px solid #3a4050;border-radius:10px;padding:4px;box-shadow:0 10px 28px rgba(0,0,0,.5);color:#e8eaf0;font:13px system-ui}' +
    '.dcp__pop h5{margin:4px 8px 2px;color:#8d93a3;font:500 11px system-ui;text-transform:uppercase;letter-spacing:.04em}#dcPanel .dcp__pop button{display:flex;justify-content:space-between;gap:12px;width:100%;text-align:left;background:none;border:0;border-radius:6px;padding:6px 8px}.dcp__pop button[aria-checked=true]{color:#8fb4ff;font-weight:600}' +
    '.dcp__sep{height:1px;background:#2a2e38;margin:4px 0}' +
    '.dcp__dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px}.dcp__dot--rojo{background:#ff6b78}.dcp__dot--verde{background:#4fd18b}.dcp__dot--ambar{background:#f2b84b}.dcp__dot--gris{background:#7b8294}' +
    /* Manuales es un <a> que navega la pestaña entera: el reinicio de #dcPanel button no lo alcanza. */
    '#dcPanel .dcp__man{color:#8fb4ff;font-size:12px;text-decoration:none;white-space:nowrap}#dcPanel .dcp__man:hover,#dcPanel .dcp__man:focus-visible{text-decoration:underline}' +
    '#dcPanel button{box-sizing:border-box;min-width:0;min-height:0;width:auto;height:auto;margin:0;font:inherit;line-height:1.3;color:#e8eaf0;background:#262a35;border:1px solid #363b49;border-radius:7px;padding:3px 8px;cursor:pointer;box-shadow:none;text-transform:none;letter-spacing:normal}#dcPanel button:hover:not(:disabled){background:#313645}#dcPanel button:disabled{opacity:.35;cursor:default}';

  function corta(e, p, n) {
    if (e.bloqueado) { return 'Vigente'; }
    if (!n && p.oculta) { return 'Oculta'; }
    if (e.enTramite.length) { return 'Recibida'; }
    return e.cumplidas.length ? 'Cumplida' : 'Libre';
  }
  /* Nombre y cédula copian cada uno su valor; el estado no copia nada. */
  function fila(p) {
    var e = estado(p.tipoId, p.numId), et = etiqueta(e, p);
    return '<tr><td><div class="dcp__nm dcp__cp" data-copia data-valor="' + esc(nombreDe(p)) + '" role="button" tabindex="0" title="Copiar nombre">' + esc(nombreDe(p)) + '</div>' +
      '<div class="dcp__num dcp__cp" data-copia data-valor="' + esc(p.numId) + '" role="button" tabindex="0" title="Copiar cédula">' + esc(p.numId) + '</div></td>' +
      '<td class="dcp__st"><i class="dcp__dot dcp__dot--' + et.c + '"></i>' + esc(corta(e, p, e.registros.length)) + '</td>' +
      '<td class="dcp__ch"><button type="button" data-pop="' + p.id + '" aria-haspopup="menu" aria-label="Cambiar estado de ' + esc(p.nombres) + '">⌄</button></td></tr>';
  }
  function actual() {
    var aqui = location.pathname + (location.hash.split('?')[0] || ''), hit = '';
    VISTAS.forEach(function (g) { g[1].forEach(function (v) { var u = new URL(v[1], RAIZ); if (u.pathname + u.hash === aqui || (!u.hash && u.pathname === location.pathname)) { hit = v[1]; } }); });
    return hit;
  }
  /* Lista visible en el panel, no el desplegable nativo: cada vista es un botón con aria-current (DC-120). */
  function selector() {
    var cur = vistaEmbebida || actual();
    return '<div class="dcp__vi">' + VISTAS.map(function (g) {
      return '<p class="dcp__grp">' + esc(g[0]) + '</p>' + g[1].map(function (v) {
        return '<button type="button" data-ruta="' + esc(v[1]) + '"' + (v[1] === cur ? ' aria-current="true"' : '') + '>' + esc(v[0]) + '</button>';
      }).join('');
    }).join('') + '</div>';
  }
  /* 8 filas por página: tope pedido en DC-115. La página se acota si la lista se achica (otra pestaña, reinicio). */
  function pintar(el) {
    document.documentElement.style.setProperty('--dcp-w', '320px');
    /* Sin el almacén del IVC (manuales, fase0, presentaciones) no hay personas que listar: se oculta la sección. */
    if (!gi()) { el.querySelector('.dcp__l').parentNode.hidden = true; return; }
    var todas = DATA.personas.concat(DATA.libres || []), total = Math.max(1, Math.ceil(todas.length / POR)), de;
    PAG = Math.min(PAG, total); de = (PAG - 1) * POR;
    /* El paginador va dentro del mismo bloque que la tabla: así queda pegado a su última fila. */
    el.querySelector('.dcp__l').innerHTML = '<table class="dcp__tb"><tbody>' + todas.slice(de, de + POR).map(fila).join('') + '</tbody></table>' +
      (total < 2 ? '' : '<div class="dcp__pg">' + paginacion(total) + '</div>');
  }
  function paginacion(total) {
    var h = '<button type="button" data-pg="' + (PAG - 1) + '"' + (PAG === 1 ? ' disabled' : '') + ' aria-label="Página anterior">‹</button>';
    for (var i = 1; i <= total; i++) {
      h += '<button type="button" data-pg="' + i + '"' + (i === PAG ? ' aria-current="page"' : '') + ' aria-label="Página ' + i + '">' + i + '</button>';
    }
    return h + '<button type="button" data-pg="' + (PAG + 1) + '"' + (PAG === total ? ' disabled' : '') + ' aria-label="Página siguiente">›</button>';
  }
  function cerrar() {
    var el = document.getElementById('dcPanel'), h = document.documentElement;
    h.classList.remove('dcp-abierto'); clearInterval(reloj); vigilar(false);
    if (el) { el.classList.remove('dcp--on'); }
    setTimeout(function () { if (!h.classList.contains('dcp-abierto')) { h.classList.remove('dcp-prep'); h.style.removeProperty('--dcp-w'); if (el) { el.remove(); } } }, 320);
    try { sessionStorage.removeItem(PANEL); } catch (e) { /* sin almacenamiento */ }
  }
  function abrir() {
    if (document.getElementById('dcPanel')) { return; }
    var st = document.createElement('style'); st.textContent = CSS;
    var el = document.createElement('aside'); el.id = 'dcPanel'; el.className = 'dcp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Casos de prueba');
    PAG = 1; vistaEmbebida = '';
    el.innerHTML = '<div class="dcp__h"><b>Casos de prueba</b><a class="dcp__man" href="' + esc(new URL('manuales/index.html', RAIZ).href) + '">Manuales</a><button type="button" data-x aria-label="Cerrar">✕</button></div>' +
      '<div class="dcp__cuerpo">' +
      '<section class="dcp__sec dcp__ctx" aria-label="¿Qué estoy viendo?"><h3 class="dcp__sec-h"><button type="button" data-ctx aria-expanded="false" aria-controls="dcpCtx">¿Qué estoy viendo?<i aria-hidden="true"></i></button></h3><div class="dcp__ctx-t" id="dcpCtx" hidden aria-live="polite" aria-atomic="true"></div></section>' +
      '<section class="dcp__sec" aria-label="Vistas"><h3 class="dcp__sec-h">Vistas</h3><div class="dcp__selw">' + selector() + '</div>' +
      '<div class="dcp__emb" hidden><div class="dcp__emb-h"><button type="button" data-completa>Abrir completa</button><button type="button" data-cerrar-vista>Cerrar vista</button></div><iframe title="Vista embebida" data-vista></iframe></div></section>' +
      '<section class="dcp__sec" aria-label="Personas"><h3 class="dcp__sec-h">Personas</h3><div class="dcp__l"></div></section>' +
      '<section class="dcp__sec" aria-label="Acciones"><h3 class="dcp__sec-h">Acciones</h3><div class="dcp__acc"><button type="button" data-all title="Reiniciar todo">Reiniciar todo</button><img class="dcp__logo" src="' + esc(new URL('shared/logos/naowee.svg', RAIZ).href) + '" alt="Naowee"></div></section>' +
      '</div>';
    var ultimoSel = selector();
    el.appendChild(st);
    /* Se copia en el acto y el destello se apaga a los 0.8 s; si el portapapeles falla, se quita de inmediato. */
    function copiar(c) {
      var v = c.getAttribute('data-valor');
      c.setAttribute('data-ok', '1');
      setTimeout(function () { c.removeAttribute('data-ok'); }, 800);
      try { navigator.clipboard.writeText(v).then(null, function () { c.removeAttribute('data-ok'); }); } catch (er) { c.removeAttribute('data-ok'); }
    }
    /* La vista se muestra dentro del panel, no como navegación: el iframe empuja la lista hacia abajo. */
    function mostrar(ruta) {
      var box = el.querySelector('.dcp__emb'), fr = el.querySelector('[data-vista]');
      if (!ruta) { vistaEmbebida = ''; box.hidden = true; fr.removeAttribute('src'); return; }
      vistaEmbebida = ruta; fr.src = new URL(ruta, RAIZ).href; box.hidden = false;
    }
    function mostrarYContar(ruta) { mostrar(ruta); refrescar(); }
    el.addEventListener('keydown', function (e) { var c = e.target.closest && e.target.closest('[data-copia]'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); copiar(c); } });
    /* Marca la vista abierta sin repintar la lista: el botón pulsado conserva el foco. */
    function marcarVista() {
      var cur = vistaEmbebida || actual();
      el.querySelectorAll('[data-ruta]').forEach(function (b) { if (b.getAttribute('data-ruta') === cur) { b.setAttribute('aria-current', 'true'); } else { b.removeAttribute('aria-current'); } });
    }
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
      var cx = e.target.closest('[data-ctx]');
      if (cx) { var ab = cx.getAttribute('aria-expanded') !== 'true'; cx.setAttribute('aria-expanded', String(ab)); el.querySelector('.dcp__ctx-t').hidden = !ab; return; }
      var ruta = e.target.closest('[data-ruta]');
      if (ruta) { mostrarYContar(ruta.getAttribute('data-ruta')); marcarVista(); return; }
      var st = e.target.closest('[data-st]');
      if (st) {
        try { sessionStorage.setItem(PANEL, '1'); } catch (er) { /* sin almacenamiento */ }
        forzar(st.getAttribute('data-st'), st.parentNode.getAttribute('data-id')); w.location.reload(); return;
      }
      var ch = e.target.closest('[data-pop]'); if (ch) { abrirPop(ch); return; }
      if (!e.target.closest('.dcp__pop')) { cerrarPop(); }
      var pg = e.target.closest('[data-pg]'); if (pg) { PAG = +pg.getAttribute('data-pg'); pintar(el); return; }
      var cp = e.target.closest('[data-copia]'); if (cp) { copiar(cp); return; }
      var t = e.target.closest('button');
      if (!t) { return; }
      if (t.hasAttribute('data-x')) { cerrar(); }
      else if (t.hasAttribute('data-all')) { if (w.confirm('¿Reiniciar todas las personas y los datos de la demo?')) { reiniciarTodo(); } }
      else if (t.hasAttribute('data-cerrar-vista')) { mostrarYContar(''); marcarVista(); }
      else if (t.hasAttribute('data-completa')) {
        try { sessionStorage.setItem(PANEL, '1'); } catch (er) { /* sin almacenamiento */ }
        w.location.href = new URL(vistaEmbebida, RAIZ).href;
      }
    });
    document.body.appendChild(el);
    pintar(el);
    refrescar(); vigilar(true);
    /* El estado cambia al operar las apps: se relee cada segundo (misma pestaña) y al cambiar el almacén (otra pestaña). */
    /* No se repinta con el foco dentro de la lista o la paginación: el botón enfocado se perdería cada segundo. */
    reloj = setInterval(function () {
      /* Se compara con lo último pintado, no con innerHTML (el navegador normaliza atributos) y sin repintar con foco dentro. */
      var box = el.querySelector('.dcp__selw'), sel = selector();
      if (!box.contains(document.activeElement) && sel !== ultimoSel) { box.innerHTML = sel; ultimoSel = sel; }
      var foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('.dcp__l, .dcp__pg');
      if (!el.querySelector('[data-ok]') && !foco) { pintar(el); }
    }, 1000);
    w.addEventListener('demo:cambio', function onC() { if (!document.getElementById('dcPanel')) { w.removeEventListener('demo:cambio', onC); return; } pintar(el); });
    var h = document.documentElement;
    h.classList.add('dcp-prep');
    void el.offsetWidth;
    requestAnimationFrame(function () { h.classList.add('dcp-abierto'); el.classList.add('dcp--on'); });
  }

  document.addEventListener('keydown', function (e) {
    if (dentro()) { return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && String(e.key).toLowerCase() === 'l') {
      e.preventDefault();
      if (document.getElementById('dcPanel')) { cerrar(); } else { abrir(); }
    } else if (e.key === 'Escape' && document.getElementById('dcPanel')) { cerrar(); }
  });

  function arrancar() {
    init();
    try { if (!dentro() && sessionStorage.getItem(PANEL) === '1') { abrir(); } } catch (e) { /* sin almacenamiento */ }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }

  w.DemoCasos = { personas: DATA.personas, estado: estado, bloqueado: bloqueado, autocompletar: autocompletar, buscar: buscar, resolver: resolver, privacidad: privacidad, solicitudes: solicitudes, siguienteId: siguienteId, registrarSolicitud: registrarSolicitud, abrir: abrir, cerrar: cerrar, reiniciarTodo: reiniciarTodo };
})(window);
