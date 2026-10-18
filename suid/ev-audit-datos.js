/* Auditoría de eventos en vivo y pasados: registros ficticios, generados por evento y siempre iguales.
   Los casos con historia vienen del SVN (Monitor PMU); el volumen se arma con una semilla por evento. */
window.EV_AUDIT = (function (w) {
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var TIPOS = [
    { id: 'verde', label: 'Entró' },
    { id: 'amarillo', label: 'Entró con aviso' },
    { id: 'operativo', label: 'No entró · boleta' },
    { id: 'medida', label: 'No entró · medida' },
    { id: 'policia', label: 'Registro de seguridad' },
    { id: 'consulta', label: 'Consulta de perfil' },
    { id: 'venta', label: 'Venta' }
  ];
  var ORIGENES = ['Lectura en puerta', 'Vista de seguridad', 'Comercializadora A', 'Comercializadora B', 'Taquilla oficial', 'Portal de la persona', 'Consola de soporte', 'API de integración'];
  var OPERADOR = { 1: 'Op. A. Rueda', 2: 'Op. J. Ríos', 3: 'Op. P. Gil', 4: 'Op. L. Mejía', 5: 'Op. S. León', 6: 'Op. D. Salazar', 7: 'Op. C. Mora', 8: 'Op. M. Cano' };
  var AGENTE = { 1: 'Pt. A. Duarte', 2: 'Pt. M. Castaño', 3: 'Pt. S. Ramírez', 4: 'Pt. J. Herrera', 5: 'Pt. J. Herrera', 6: 'Pt. F. Ospina', 7: 'Pt. H. Londoño', 8: 'Sub. C. Pérez' };
  var PMU = 'Pt. R. Gómez';
  var CIERRES = ['Conducido', 'No encontrado', 'Retirado del escenario', 'Conducido'];
  var BOLETA_MAL = ['Boleta ya usada · no llamó a la autoridad', 'Boleta de otro partido · no llamó a la autoridad', 'Titular no coincide · no llamó a la autoridad', 'Boleta falsa · llamó a la autoridad'];
  var FILAS = 'ABCDEFGHJKLMNPRST';

  // Casos del SVN, en minutos respecto al pitazo (19:00 allá). doc: número completo; el registro solo muestra los últimos 4.
  var CASOS = [
    { m: -17, t: 'consulta', p: 4, doc: '71894447', o: 1, d: 'Abrió el perfil desde la alerta', q: PMU },
    { m: -17, t: 'policia', p: 4, doc: '71894447', o: 1, d: 'Alerta asignada a Pt. J. Herrera', q: PMU },
    { m: -18, t: 'medida', p: 4, doc: '71894447', o: 0, d: 'No entró · alerta al PMU', q: 'Op. L. Mejía' },
    { m: -19, t: 'verde', p: 1, doc: '71302117', o: 0, d: 'Entró · Norte, aforo libre', q: 'Op. A. Rueda' },
    { m: -20, t: 'operativo', p: 6, doc: '1017239013', o: 0, d: 'Boleta de otro partido · no llamó a la autoridad', q: 'Op. D. Salazar' },
    { m: -21, t: 'amarillo', p: 5, doc: '1152446583', o: 0, d: 'Entró con aviso · veto levantado', q: 'Op. S. León' },
    { m: -23, t: 'operativo', p: 2, doc: '80297702', o: 0, d: 'Boleta ya usada · no llamó a la autoridad', q: 'Op. J. Ríos' },
    { m: -25, t: 'policia', p: 2, doc: '1036612208', o: 1, d: 'En la puerta con la persona', q: 'Pt. M. Castaño' },
    { m: -28, t: 'consulta', p: 2, doc: '1036612208', o: 1, d: 'Abrió el perfil desde la alerta', q: PMU },
    { m: -28, t: 'policia', p: 2, doc: '1036612208', o: 1, d: 'Alerta tomada', q: 'Pt. M. Castaño' },
    { m: -29, t: 'policia', p: 2, doc: '1036612208', o: 1, d: 'Alerta asignada a Pt. M. Castaño', q: PMU },
    { m: -29, t: 'medida', p: 2, doc: '1036612208', o: 0, d: 'No entró · alerta al PMU', q: 'Op. J. Ríos' },
    { m: -46, t: 'policia', p: 1, doc: '98567730', o: 1, d: 'Alerta cerrada · Conducido', q: 'Pt. A. Duarte' },
    { m: -54, t: 'policia', p: 1, doc: '98567730', o: 1, d: 'Alerta tomada', q: 'Pt. A. Duarte' },
    { m: -55, t: 'policia', p: 1, doc: '98567730', o: 1, d: 'Alerta asignada a Pt. A. Duarte', q: PMU },
    { m: -55, t: 'medida', p: 1, doc: '98567730', o: 0, d: 'No entró · alerta al PMU', q: 'Op. A. Rueda' },
    { m: -63, t: 'policia', p: 8, doc: '43115561', o: 1, d: 'Alerta cerrada · No encontrado', q: 'Sub. C. Pérez' },
    { m: -71, t: 'policia', p: 8, doc: '43115561', o: 1, d: 'Alerta tomada', q: 'Sub. C. Pérez' },
    { m: -71, t: 'policia', p: 8, doc: '43115561', o: 1, d: 'Alerta asignada a Sub. C. Pérez', q: PMU },
    { m: -72, t: 'operativo', p: 8, doc: '43115561', o: 0, d: 'Boleta falsa · llamó a la autoridad', q: 'Op. M. Cano' },
    { m: -158, t: 'venta', p: 0, doc: '1152446583', o: 2, d: 'Venta autorizada · con aviso', q: 'Canal web' },
    { m: -232, t: 'venta', p: 0, doc: '71894447', o: 3, d: 'Venta bloqueada · medida vigente', q: 'Canal web' },
    { m: -249, t: 'venta', p: 0, doc: '71302117', o: 2, d: 'Venta autorizada', q: 'Canal web' },
    { m: -390, t: 'venta', p: 0, doc: '71894447', o: 2, d: 'Venta bloqueada · medida vigente', q: 'Taquilla oficial' }
  ];
  // Personas de los casos con alerta, en el orden en que entran si la meta del evento es corta.
  var ALERTAS_CASOS = ['71894447', '1036612208', '98567730', '43115561'];
  // En un evento pasado esas alertas ya se cerraron.
  var CIERRES_CASOS = [
    { m: -14, t: 'policia', p: 4, doc: '71894447', o: 1, d: 'Alerta tomada', q: 'Pt. J. Herrera' },
    { m: -6, t: 'policia', p: 4, doc: '71894447', o: 1, d: 'Alerta cerrada · Conducido', q: 'Pt. J. Herrera' },
    { m: -12, t: 'policia', p: 2, doc: '1036612208', o: 1, d: 'Alerta cerrada · Retirado del escenario', q: 'Pt. M. Castaño' }
  ];

  // PRNG con semilla (mulberry32): mismo evento, mismos registros en cada carga.
  function semilla(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function prng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function min(h) { var p = String(h || '').split(':'); return p.length === 2 ? (+p[0]) * 60 + (+p[1]) : null; }
  function hhmm(m) { var d = ((m % 1440) + 1440) % 1440; return ('0' + Math.floor(d / 60)).slice(-2) + ':' + ('0' + d % 60).slice(-2); }
  function entero(v) { return Number(String(v).replace(/\D/g, '')) || 0; }
  function dia(iso, mas) { var p = iso.split('-'), f = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + (mas || 0))); return f.getUTCDate() + ' ' + MES[f.getUTCMonth()] + ' ' + f.getUTCFullYear(); }
  function diasDesdePub(e) {
    var m = /(\d{1,2}) (\w{3}) (\d{4})/.exec(e.pub || ''), p = String(e.fecha).split('-');
    if (!m || p.length !== 3) { return 14; }
    var a = Date.UTC(+m[3], MES.indexOf(m[2]), +m[1]), b = Date.UTC(+p[0], +p[1] - 1, +p[2]);
    return Math.max(2, Math.min(40, Math.round((b - a) / 864e5)));
  }

  var cache = {};

  // con: boletas con titular (las mismas de Boletería). Las cuotas de cada tipo escalan con el aforo.
  function generar(e, con) {
    var B = w.EV_DATOS.backoffice, E = B.escenario, r = prng(semilla(String(e.codigo || e.id)));
    var ko = min((e.partidos && e.partidos[0] || {}).hora), ap = min(e.apertura);
    if (ko == null) { ko = ap != null ? ap + 180 : 19 * 60; }
    if (ap == null) { ap = ko - 180; }
    var vivo = e.estado === 'curso';
    // Reloj fijo del demo en vivo: 16 min antes del pitazo, como el Monitor PMU (18:44 para las 19:00).
    var corte = vivo ? ko - 16 : ko + 125;
    var finIngreso = vivo ? corte : ko + 40;
    var sectores = E.sectores, puertasDe = {};
    E.puertas.forEach(function (p) { (puertasDe[p.sector] = puertasDe[p.sector] || []).push(p.n); });
    var secDe = {}; E.puertas.forEach(function (p) { secDe[p.n] = p.sector; });
    var pesos = sectores.map(function (s) { return s.aforo; }), totalP = pesos.reduce(function (a, b) { return a + b; }, 0);
    function sectorAzar() { var x = r() * totalP; for (var i = 0; i < sectores.length; i++) { x -= pesos[i]; if (x < 0) { return sectores[i]; } } return sectores[0]; }
    function puertaAzar(s) { var ps = puertasDe[s.id] || [1]; return ps[Math.floor(r() * ps.length)]; }

    var personas = [], filas = [];
    function persona(doc) { personas.push(doc); return personas.length - 1; }
    function docAzar() { return String(r() < 0.2 ? 1000000000 + Math.floor(r() * 99999999) : 10000000 + Math.floor(r() * 89999999)); }
    function fila(m, t, p, k, d, q, o) { filas.push({ m: m, t: t, p: p, k: k, d: d, q: q, o: o }); }

    // Metas del evento cuando las trae ev-datos (las mismas cifras de la lista); si no, salen del aforo.
    var meta = vivo ? (e.vivo || {}) : (e.cierre || {});
    var nV = meta.entraron || meta.dentro || Math.round(con * (vivo ? 0.46 : 0.88));
    var nAl = (vivo ? meta.novedades : meta.acciones);
    if (nAl == null) { nAl = Math.max(4, Math.round(nV * 0.0004)); }
    var nNo = meta.noEntraron || Math.max(6, Math.round(nV * 0.012));
    var diasVenta = diasDesdePub(e), desde = -diasVenta * 1440 + 9 * 60, hasta = ko - 60;

    // Los casos del SVN, movidos al pitazo de este evento; las alertas entran hasta donde alcance la meta.
    var porDoc = {}, casosAl = 0, casosNo = 0, casosMed = 0, casosV = 0, fuera = {};
    ALERTAS_CASOS.forEach(function (doc) { if (casosAl < nAl) { casosAl++; } else { fuera[doc] = true; } });
    CASOS.concat(vivo ? [] : CIERRES_CASOS).forEach(function (x) {
      var m = ko + x.m; if (m > corte || fuera[x.doc]) { return; }
      var k = porDoc[x.doc] != null ? porDoc[x.doc] : (porDoc[x.doc] = persona(x.doc));
      fila(m, x.t, x.p, k, x.d, x.q, x.o);
      if (x.t === 'operativo' || x.t === 'medida') { casosNo++; }
      if (x.t === 'medida') { casosMed++; }
      if (x.t === 'verde' || x.t === 'amarillo') { casosV++; }
    });
    var gAl = Math.max(0, nAl - casosAl), gMed = Math.min(gAl, Math.max(0, Math.round(nAl * 0.6) - casosMed)), gFalsa = gAl - gMed;
    var gBoleta = Math.max(0, nNo - casosNo - gMed - gFalsa), validas = Math.max(0, nV - casosV), amarillos = Math.round(validas * 0.008);
    if (con < validas) { con = validas; }

    // Ventas de las boletas con titular; las primeras personas son las que después pasan por la puerta.
    var base = personas.length;
    for (var i = 0; i < con; i++) {
      var k = persona(docAzar()), cm = r();
      var o = cm < 0.55 ? 2 : cm < 0.97 ? 3 : 4;
      fila(Math.round(desde + (hasta - desde) * Math.pow(r(), 0.6)), 'venta', 0, k, 'Venta autorizada', o === 4 ? 'Taquilla oficial' : r() < 0.82 ? 'Canal web' : 'Punto de venta', o);
    }
    // Ingresos: suben hasta media hora antes del pitazo y caen después; en vivo se cortan en el reloj del demo.
    function llegada() {
      var pico = ko - 20, m = r() < 0.86 ? ap + (pico - ap) * Math.sqrt(r()) : pico + 60 * Math.pow(r(), 2);
      if (m > finIngreso) { m = ap + (finIngreso - ap) * Math.sqrt(r()); }
      return Math.round(m);
    }
    for (var j = 0; j < validas; j++) {
      var s = sectorAzar(), p = puertaAzar(s), aviso = j < amarillos;
      var d = s.tipo === 'num' ? s.nombre + ', fila ' + FILAS.charAt(Math.floor(r() * FILAS.length)) : s.nombre + ', aforo libre';
      var mm = llegada();
      if (aviso) { fila(mm, 'amarillo', p, base + j, 'Entró con aviso · ' + (r() < 0.5 ? 'veto levantado' : 'medida cumplida'), OPERADOR[p], 0); }
      else { fila(mm, 'verde', p, base + j, 'Entró · ' + d, OPERADOR[p], 0); }
    }
    // Cada alerta: el PMU la asigna y abre el perfil; el agente la toma y la cierra (en vivo, las recientes siguen abiertas).
    function alerta(m0, p, k, abierta) {
      fila(m0 + 1, 'policia', p, k, 'Alerta asignada a ' + AGENTE[p], PMU, 1);
      fila(m0 + 1, 'consulta', p, k, 'Abrió el perfil desde la alerta', PMU, 1);
      if (abierta) { return; }
      var tomada = m0 + 2 + Math.floor(r() * 4);
      fila(tomada, 'policia', p, k, 'Alerta tomada', AGENTE[p], 1);
      if (r() < 0.35) { fila(tomada + 1, 'consulta', p, k, 'Abrió el perfil en la puerta', AGENTE[p], 1); }
      var cierre = tomada + 4 + Math.floor(r() * 12);
      if (cierre < corte) { fila(cierre, 'policia', p, k, 'Alerta cerrada · ' + CIERRES[Math.floor(r() * CIERRES.length)], AGENTE[p], 1); }
    }
    function momento() { return Math.round(ap + (finIngreso - ap - 3) * Math.sqrt(r())); }
    for (var b = 0; b < gBoleta + gFalsa; b++) {
      var sb = sectorAzar(), pb = puertaAzar(sb), kb = persona(docAzar()), mb = momento(), pol = b >= gBoleta;
      fila(mb, 'operativo', pb, kb, pol ? 'Boleta falsa · llamó a la autoridad' : BOLETA_MAL[Math.floor(r() * 3)], OPERADOR[pb], 0);
      if (pol) { alerta(mb, pb, kb, vivo && mb > corte - 6); }
    }
    // Rojos por medida: la venta ya se había bloqueado; en la puerta se repite el intento y sale la alerta.
    for (var c = 0; c < gMed; c++) {
      var sc = sectorAzar(), pc = puertaAzar(sc), kc = persona(docAzar()), mc = momento();
      fila(Math.round(desde + (hasta - desde) * r()), 'venta', 0, kc, 'Venta bloqueada · medida vigente', r() < 0.7 ? 'Canal web' : 'Taquilla oficial', r() < 0.5 ? 2 : 3);
      fila(mc, 'medida', pc, kc, 'No entró · alerta al PMU', OPERADOR[pc], 0);
      alerta(mc, pc, kc, vivo && mc > corte - 6);
    }

    filas.sort(function (a, b) { return a.m - b.m; });
    var pre = String(e.fecha).slice(5).replace('-', '');
    filas.forEach(function (f, i) { f.id = 'A-' + pre + '-' + ('000000' + (i + 1)).slice(-6); });
    filas.reverse();

    var cuenta = {}; TIPOS.forEach(function (t) { cuenta[t.id] = 0; });
    filas.forEach(function (f) { cuenta[f.t]++; });
    return {
      evento: e.id, filas: filas, personas: personas, cuenta: cuenta, vivo: vivo,
      apertura: ap, pitazo: ko, corte: corte, fecha: e.fecha,
      entraron: cuenta.verde + cuenta.amarillo, caso: porDoc['71894447'],
      secDe: secDe, sectores: sectores
    };
  }

  // Tipo de documento de cada persona: el de los casos del SVN y el azar son CC; el bus trae el real en su clave.
  function tipoDe(A, k) { return (A.tipos && A.tipos[k]) || 'CC'; }
  function enmascarado(A, k) {
    var n = A.personas[k] || '', t = tipoDe(A, k), D = w.DemoCasos;
    if (D && D.privacidad) { return D.privacidad({ tipoId: t, numId: n }, 'auditoria').docVisible; }
    return t + ' •••• ' + n.slice(-4);
  }

  // Suma lo que las apps del SVN dejaron en el bus. No toca el PRNG: trabaja sobre una copia del registro memorizado.
  var cacheBus = {};
  function conBus(A, e) {
    var B = w.DemoBus;
    if (!A || !B || !e) { return A; }
    var evs = B.leer(function (x) { return x.evento === e.codigo || x.evento === e.id; });
    if (!evs.length) { return A; }
    var firma = e.id + '|' + A.filas.length + '|' + evs.length + '|' + evs[evs.length - 1].ts;
    if (cacheBus[firma]) { return cacheBus[firma]; }
    var personas = A.personas.slice(), tipos = (A.tipos || A.personas.map(function () { return 'CC'; })).slice(), filas = A.filas.slice(), corte = A.corte;
    var pre = String(A.fecha).slice(5).replace('-', ''), nuevas = [];
    evs.forEach(function (x, i) {
      var p = String(x.clave || '').split('|'), t = p[0] || 'CC', n = p[1] || '', k = -1, m = min(x.horaEscena);
      for (var j = 0; j < personas.length; j++) { if (personas[j] === n && tipos[j] === t) { k = j; break; } }
      if (k < 0) { personas.push(n); tipos.push(t); k = personas.length - 1; }
      if (m == null) { m = corte; }
      if (A.vivo && m > corte) { corte = m; }
      nuevas.push({ m: m, t: x.tipo, p: +x.puerta || 0, k: k, d: x.detalle, q: x.quien, o: +x.origen || 0, id: 'B-' + pre + '-' + ('000000' + (i + 1)).slice(-6), ts: x.ts });
    });
    // Más recientes primero; ante la misma hora, lo del bus va antes que lo generado.
    nuevas.sort(function (a, b) { return b.m - a.m || b.ts - a.ts; });
    nuevas.forEach(function (f) {
      var i = 0; while (i < filas.length && filas[i].m > f.m) { i++; }
      filas.splice(i, 0, f);
    });
    var cuenta = {}; TIPOS.forEach(function (t) { cuenta[t.id] = 0; });
    filas.forEach(function (f) { if (cuenta[f.t] != null) { cuenta[f.t]++; } });
    var R = { evento: A.evento, filas: filas, personas: personas, tipos: tipos, cuenta: cuenta, vivo: A.vivo, apertura: A.apertura, pitazo: A.pitazo, corte: corte, fecha: A.fecha,
      entraron: cuenta.verde + cuenta.amarillo, caso: A.caso, secDe: A.secDe, sectores: A.sectores };
    cacheBus = {}; cacheBus[firma] = R;
    return R;
  }

  return {
    TIPOS: TIPOS, ORIGENES: ORIGENES, hhmm: hhmm, entero: entero, conBus: conBus,
    // Registros del evento (memorizados); con: boletas con titular según Boletería.
    de: function (e, con) {
      var k = e.id + '|' + e.estado + '|' + con;
      return cache[k] || (cache[k] = generar(e, con));
    },
    // Fecha legible de un registro: los minutos negativos son días antes del evento.
    fechaDe: function (A, m) { var dd = Math.floor(m / 1440); return dia(A.fecha, dd) + ' · ' + hhmm(m); },
    doc: function (A, k) { return enmascarado(A, k); },
    docCompleto: function (A, k) { var n = A.personas[k] || ''; return tipoDe(A, k) + ' ' + n.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  };
})(window);
