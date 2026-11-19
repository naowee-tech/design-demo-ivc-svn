/* Calidad y auditoría (HU-26.3): hallazgos sobre los registros y bitácora de cambios de estado. Solo lectura. */
(function (w, d) {
  'use strict';
  var GI = w.GI, U = GI.util, D = GI.derive, esc = SUID.esc, BASE = '#/control-acceso/infractores';
  var st = { tab: 'cal', tipo: '', q: '' };

  /* Campos obligatorios del diccionario (xlsx); el representante solo si el infractor es menor. */
  var OBLIG = [['tipoId', 'Tipo de identificación'], ['numId', 'Número de identificación'], ['nombres', 'Nombre(s)'], ['apellidos', 'Apellido(s)'],
    ['fechaNac', 'Fecha de nacimiento'], ['sexo', 'Sexo'], ['fechaHechos', 'Fecha de los hechos'], ['competicion', 'Competición'], ['local', 'Equipo local'],
    ['visitante', 'Equipo visitante'], ['ciudadHechos', 'Ciudad de los hechos'], ['descripcion', 'Descripción de la conducta'], ['fechaActo', 'Fecha del acto'],
    ['numActo', 'Número del acto'], ['fechaEjecutoria', 'Fecha de ejecutoria'], ['meses', 'Tiempo de sanción'], ['fechaRadicado', 'Fecha de radicado'],
    ['radEntrada', 'Radicado de entrada'], ['profesional', 'Profesional responsable']];

  function hallazgos() {
    var regs = GI.all(), out = [], vistos = {};
    regs.forEach(function (r) {
      var falta = OBLIG.filter(function (c) { return !r[c[0]]; }).map(function (c) { return c[1]; });
      if (!(r.origen && r.origen.length)) falta.push('Origen de la obligación');
      if (D.esMenor(r) && !r.rep) falta.push('Representante legal o tutor');
      if (falta.length) out.push({ id: r.id, tipo: 'Incompleto', det: 'Falta: ' + falta.join(', ') + '.' });
      var llave = [r.tipoId, r.numId, r.numActo, r.fechaEjecutoria].join('|');
      if (vistos[llave]) out.push({ id: r.id, tipo: 'Duplicado', det: 'Misma persona, acto y ejecutoria que ' + vistos[llave] + '.' });
      else vistos[llave] = r.id;
      var f = [];
      if (r.fechaHechos && r.fechaHechos >= U.today()) f.push('la fecha de los hechos es actual o futura');
      if (r.fechaHechos && r.fechaActo && r.fechaHechos >= r.fechaActo) f.push('los hechos no son anteriores al acto');
      if (r.fechaActo && r.fechaEjecutoria && r.fechaEjecutoria <= r.fechaActo) f.push('la ejecutoria no es posterior al acto');
      if (r.fechaEjecutoria && r.fechaRadicado && r.fechaRadicado <= r.fechaEjecutoria) f.push('el radicado no es posterior a la ejecutoria');
      if (r.fechaEjecutoria && r.fechaEjecutoria > U.today()) f.push('la ejecutoria es futura');
      if (r.meses && +r.meses < 6) f.push('la sanción es menor a 6 meses');
      if (f.length) out.push({ id: r.id, tipo: 'Fechas incoherentes', det: f[0].charAt(0).toUpperCase() + f[0].slice(1) + (f.length > 1 ? '; ' + f.slice(1).join('; ') : '') + '.' });
    });
    return out;
  }

  function bitacora() {
    var out = [];
    GI.all().forEach(function (r) {
      (r.historial || []).forEach(function (h) { out.push({ id: r.id, fecha: h.fecha, hora: h.hora, usuario: h.usuario, de: h.de, a: h.a, nota: h.nota }); });
    });
    return out.sort(function (a, b) { return (a.fecha + a.hora) < (b.fecha + b.hora) ? 1 : -1; });
  }

  function badge(t) {
    var v = { Incompleto: 'caution', Duplicado: 'negative', 'Fechas incoherentes': 'informative' }[t] || 'neutral';
    return '<span class="naowee-badge naowee-badge--' + v + ' naowee-badge--quiet">' + esc(t) + '</span>';
  }
  function link(id) { return '<a class="gi-mono" href="' + BASE + '/' + esc(id) + '">' + esc(id) + '</a>'; }

  function tablaCal(hs) {
    if (!hs.length) return '<p class="gq-vacio">Ningún registro con hallazgos de calidad.</p>';
    return '<div class="gt-wrap"><table class="gt-table gq-hall"><thead><tr><th>Registro</th><th>Hallazgo</th><th>Detalle</th></tr></thead><tbody>' +
      hs.map(function (h) { return '<tr><td>' + link(h.id) + '</td><td>' + badge(h.tipo) + '</td><td>' + esc(h.det) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function tablaAud(bs) {
    return '<div class="gt-wrap"><table class="gt-table gq-aud"><thead><tr><th>Fecha y hora</th><th>Registro</th><th>Usuario</th><th>Estado anterior</th><th>Estado nuevo</th><th>Nota</th></tr></thead><tbody>' +
      bs.map(function (b) {
        return '<tr><td>' + esc(U.fmt(b.fecha)) + '<small>' + esc(b.hora) + '</small></td><td>' + link(b.id) + '</td><td>' + esc(b.usuario) + '</td><td' + (b.de ? '' : ' class="is-vacio"') + '>' + esc(b.de || '—') + '</td><td>' + esc(b.a) + '</td><td>' + esc(b.nota || '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function paint(view) {
    var hs = hallazgos(), bs = bitacora(), n = GI.all().length;
    var cuenta = function (t) { return hs.filter(function (h) { return h.tipo === t; }).length; };
    var q = st.q.trim().toLowerCase();
    var vh = hs.filter(function (h) { return (!st.tipo || h.tipo === st.tipo) && (!q || (h.id + h.det).toLowerCase().indexOf(q) >= 0); });
    var vb = bs.filter(function (b) { return !q || (b.id + b.usuario + b.a + (b.nota || '')).toLowerCase().indexOf(q) >= 0; });
    var tiles = ['Incompleto', 'Duplicado', 'Fechas incoherentes'].map(function (t) {
      return '<button type="button" class="gq-tile' + (st.tipo === t ? ' is-on' : '') + '" data-tipo="' + t + '" aria-pressed="' + (st.tipo === t) + '"><strong>' + cuenta(t) + '</strong><span>' + t + '</span></button>';
    }).join('');
    view.innerHTML = '<div class="page-inner gi-page"><header class="gi-head"><div class="page-title-block"><h1 class="page-title">Calidad y auditoría</h1>' +
      '<p class="page-subtitle">Hallazgos sobre los ' + n + ' registros y bitácora de cada cambio de estado. Acceso restringido al IVC.</p></div></header>' +
      '<div class="gi-tabs" role="tablist" aria-label="Vista de calidad y auditoría">' +
      '<button type="button" role="tab" class="gi-tab" data-tab="cal" aria-selected="' + (st.tab === 'cal') + '">Calidad <span class="gt-count">' + hs.length + '</span></button>' +
      '<button type="button" role="tab" class="gi-tab" data-tab="aud" aria-selected="' + (st.tab === 'aud') + '">Trazabilidad <span class="gt-count">' + bs.length + '</span></button></div>' +
      (st.tab === 'cal' ? '<div class="gq-tiles">' + tiles + '</div>' : '') +
      '<div class="gt-toolbar"><div class="gc-field"><input type="text" id="gqQ" aria-label="Buscar" placeholder="Buscar" value="' + esc(st.q) + '"></div></div>' +
      '<div id="gqCuerpo">' + (st.tab === 'cal' ? tablaCal(vh) : tablaAud(vb)) + '</div></div>';
    view.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { st.tab = b.getAttribute('data-tab'); paint(view); }); });
    view.querySelectorAll('[data-tipo]').forEach(function (b) { b.addEventListener('click', function () { var t = b.getAttribute('data-tipo'); st.tipo = st.tipo === t ? '' : t; paint(view); }); });
    var q = view.querySelector('#gqQ');
    q.addEventListener('input', function () {
      st.q = q.value;
      view.querySelector('#gqCuerpo').innerHTML = st.tab === 'cal'
        ? tablaCal(hallazgos().filter(function (h) { return (!st.tipo || h.tipo === st.tipo) && (!st.q || (h.id + h.det).toLowerCase().indexOf(st.q.toLowerCase()) >= 0); }))
        : tablaAud(bitacora().filter(function (b) { return !st.q || (b.id + b.usuario + b.a + (b.nota || '')).toLowerCase().indexOf(st.q.toLowerCase()) >= 0; }));
    });
  }

  SUID.views['control-acceso/calidad'] = function (view, ctx) {
    ctx.crumbs = [{ label: 'Inicio', href: '#/' }, { label: 'Control de acceso' }, { label: 'Calidad y auditoría' }];
    paint(view);
  };
})(window, document);
