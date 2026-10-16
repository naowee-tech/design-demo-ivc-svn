/* Control de acceso · Eventos › Escenarios: el catálogo de lugares y las restricciones de cada sector.
   Lo pinta la vista de Eventos (ruta …/eventos/escenarios[/id]); Configuración y Cupos de cada evento leen de aquí. */
(function (w) {
  var B = w.EV_DATOS.backoffice, ESC = B.escenarios;
  var LISTA = '#/control-acceso/eventos/escenarios';
  var ORDEN = ['norte', 'occ', 'ori', 'sur'];
  var NOMBRE = { norte: 'Norte', occ: 'Occidental', ori: 'Oriental', sur: 'Sur' };
  var TIPO = { norte: 'Aforo libre', occ: 'Numerado', ori: 'Numerado', sur: 'Aforo libre' };
  var BASE = { norte: 8500, occ: 9200, ori: 11800, sur: 8500 };
  var PUERTAS = { norte: [1, 2], occ: [3, 8], ori: [4, 5], sur: [6, 7] };
  var ESTADOS = [['habilitado', 'Habilitado'], ['limitado', 'Limitado'], ['sancionado', 'Sancionado']];
  // Estado de la vista: filtro de la lista, pestaña y sector elegido del detalle.
  var vs = { q: '', tab: 'sectores', sector: null };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function miles(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function porId(id) { return ESC.filter(function (e) { return e.id === id; })[0]; }
  function porNombre(n) { return ESC.filter(function (e) { return e.nombre === n; })[0]; }
  function restr(e, sector) { return e.restricciones.filter(function (r) { return r.sector === sector; })[0]; }
  function siglas(n) { return String(n).replace(/^Estadio\s+/i, '').split(/\s+/).map(function (x) { return x[0]; }).join('').slice(0, 3).toUpperCase(); }

  // Los escenarios que no son el Atanasio escalan sus sectores al aforo propio.
  function sectores(e) {
    var f = (Number(String(e.aforo).replace(/\D/g, '')) || 38000) / 38000;
    return ORDEN.map(function (id) { return { id: id, nombre: NOMBRE[id], tipo: TIPO[id], base: Math.round(BASE[id] * f / 100) * 100 }; });
  }

  // Lo consumen Configuración y Cupos: restricciones del escenario del evento, por id de sector.
  function mapa(nombre) {
    var e = porNombre(nombre), o = {};
    (e ? e.restricciones : []).forEach(function (r) { o[r.sector] = r; });
    return o;
  }

  function badge(estado, texto) {
    return '<span class="pb-badge pb-badge--' + (estado === 'sancionado' ? 'error' : estado === 'limitado' ? 'alerta' : 'ok') + '">' + esc(texto) + '</span>';
  }
  function resumen(e) {
    var s = e.restricciones.filter(function (r) { return r.estado === 'sancionado'; }).length, l = e.restricciones.length - s;
    if (s) { return badge('sancionado', s === 1 ? 'Sector sancionado' : s + ' sectores sancionados'); }
    return l ? badge('limitado', l === 1 ? 'Sector limitado' : l + ' sectores limitados') : badge('ok', 'Sin restricciones');
  }
  function dicho(e) {
    if (!e.restricciones.length) { return 'Sin restricciones vigentes'; }
    return e.restricciones.map(function (r) { return NOMBRE[r.sector] + (r.estado === 'sancionado' ? ' sancionado' : ' limitado'); }).join(' · ');
  }
  function usos(e, ctx) { return ctx.st.eventos.filter(function (x) { return x.escenario === e.nombre; }); }

  function ico(ctx, n) { return ctx.ico(n); }
  function volver(ctx, href, texto) { return '<a class="gi-back" href="' + href + '">' + ico(ctx, 'arrow-left') + esc(texto) + '</a>'; }

  /* ---------- Lista ---------- */

  function tarjeta(e, ctx, elegido) {
    var n = e.restricciones.length, foto = e.foto ? '<img class="ev-card__foto" src="' + esc(e.foto) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '';
    var dato = function (v, t, c) { return '<span class="ev-dato' + (c ? ' ' + c : '') + '"><b>' + v + '</b><span>' + t + '</span></span>'; };
    var nu = usos(e, ctx).length;
    var abre = elegido == null ? '<a class="ev-card" href="' + LISTA + '/' + e.id + '" data-acc="ex-abrir" data-id="' + e.id + '">'
      : '<button type="button" class="ev-card exs-opcion" aria-pressed="' + elegido + '" data-acc="as-esc" data-id="' + e.id + '">';
    return abre +
      '<span class="ev-card__media"><span class="ev-card__sigla" aria-hidden="true">' + esc(siglas(e.nombre)) + '</span>' + foto +
      '<span class="ev-card__top">' + resumen(e) + '<span class="ev-cuando">' + nu + (nu === 1 ? ' evento' : ' eventos') + '</span></span>' +
      '<span class="ev-card__titulo"><span class="ev-card__nom">' + esc(e.nombre) + '</span><span class="ev-card__comp">' + esc(e.ciudad) + '</span></span></span>' +
      '<span class="ev-card__cuerpo"><span class="ev-card__meta"><span>' + ico(ctx, 'pin') + 'Norte · Occidental · Oriental · Sur</span><span>' + esc(dicho(e)) + '</span></span>' +
      '<span class="ev-datos">' + dato(esc(e.aforo), 'Aforo') + dato(4, 'Sectores') + dato(n, 'Restricción', n ? 'ev-dato--alerta' : '') + '</span></span>' + (elegido == null ? '</a>' : '</button>');
  }

  function lista(ctx) {
    var q = vs.q.trim().toLowerCase();
    var xs = ESC.filter(function (e) { return !q || (e.nombre + ' ' + e.ciudad).toLowerCase().indexOf(q) >= 0; });
    return volver(ctx, '#/control-acceso/eventos', 'Volver a Eventos') +
      '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">Escenarios</h1>' +
      '<p class="page-subtitle">Los lugares donde ocurren los eventos. Cada escenario se registra una vez y cada evento lo hereda, con sus sectores, puertas y restricciones.</p></div>' +
      '<div class="gi-head__actions"><button type="button" class="naowee-btn naowee-btn--loud" data-acc="ex-nuevo">' + ico(ctx, 'add') + 'Agregar escenario</button></div></header>' +
      '<div class="pb-app ev-lista"><div class="pb-evl__herr"><div class="pb-q pb-evl__buscar">' + ico(ctx, 'search') +
      '<input type="search" class="pb-input" data-s="exs" data-k="q" aria-label="Buscar escenario" placeholder="Buscar por escenario o ciudad" value="' + esc(vs.q) + '"></div></div>' +
      (xs.length ? '<section class="ev-grupo" aria-label="Escenarios"><h2 class="ev-grupo__tit">Escenarios<span>' + xs.length + '</span></h2><div class="ev-grid">' + xs.map(function (e) { return tarjeta(e, ctx); }).join('') + '</div></section>'
        : '<div class="pb-vacio" style="min-height:160px"><b>Ningún escenario coincide</b><span>Cambie la búsqueda.</span></div>') + '</div>';
  }

  /* ---------- Detalle ---------- */

  function estadoDe(e, id) { var r = restr(e, id); return r ? r.estado : 'habilitado'; }

  function mapaDe(e) {
    var sec = {}, red = {};
    sectores(e).forEach(function (s) {
      var r = restr(e, s.id);
      sec[s.id] = r ? (r.estado === 'sancionado' ? 'cerrado' : 'reducido') : 'habilitado';
      if (r && r.tope) { red[s.id] = r.tope; }
    });
    return w.BACKOFFICE.mapaSectores(sectores(e), sec, red).replace('>Cerrado<', '>Sancionado<');
  }

  function panelSector(e, s, ctx) {
    var r = restr(e, s.id), est = r ? r.estado : 'habilitado';
    var ops = ESTADOS.map(function (o) { return '<button type="button" class="pb-seg" aria-pressed="' + (est === o[0]) + '" data-acc="ex-estado" data-id="' + s.id + '.' + o[0] + '">' + o[1] + '</button>'; }).join('');
    var campos = r
      ? '<div class="pb-esc-form exs-form"><label class="pb-campo">Motivo<input type="text" data-acc="ex-campo" data-k="motivo" data-id="' + s.id + '" value="' + esc(r.motivo) + '"></label>' +
        '<label class="pb-campo">Vigente hasta<input type="text" data-acc="ex-campo" data-k="hasta" data-id="' + s.id + '" value="' + esc(r.hasta) + '"></label>' +
        (r.estado === 'limitado' ? '<label class="pb-campo pb-campo--num">Aforo permitido<input type="number" min="0" max="' + s.base + '" data-acc="ex-campo" data-k="tope" data-id="' + s.id + '" value="' + r.tope + '"></label>' : '<span></span>') + '</div>'
      : '';
    var aviso = !r ? '' : '<div class="pb-puestos">' + ctx.ico('caution') + '<span><b>' + (r.estado === 'sancionado' ? 'Sector sancionado:' : 'Sector limitado:') + '</b> ' +
      (r.estado === 'sancionado' ? 'no se venden boletas y sus puertas no abren en ningún evento hasta levantar la sanción.' : 'ningún evento puede vender más de ' + miles(r.tope) + ' puestos aquí.') + '</span></div>';
    var puertas = PUERTAS[s.id].map(function (n) {
      var cerr = est === 'sancionado';
      return '<div class="pb-puerta"><b class="pb-puerta-n' + (cerr ? ' exs-pn--mal' : '') + '">' + n + '</b><span>Puerta ' + n + '<span class="pb-sub">Solo sector ' + esc(s.nombre) + '</span></span>' +
        '<span>' + (cerr ? badge('sancionado', 'Bloqueada') : badge('ok', 'Abre en cada evento')) + '</span></div>';
    }).join('');
    return '<div class="pb-esc-form"><div class="pb-campo"><span>Nombre del sector</span><div class="exs-fijo">' + esc(s.nombre) + ' · ' + esc(s.tipo) + ' · ' + miles(s.base) + '</div></div>' +
      '<div class="pb-campo"><span id="ex-est-l">Estado del sector</span><div class="pb-segmento" role="group" aria-labelledby="ex-est-l">' + ops + '</div></div><span></span></div>' +
      campos + aviso +
      '<div class="pb-sec"><div class="pb-puertas-cab"><h3 class="pb-h3">Puertas de ' + esc(s.nombre) + '</h3><span class="pb-sub" style="font-size:12px">Cada puerta pertenece a un solo sector</span></div>' + puertas + '</div>';
  }

  function sectoresVista(e, ctx) {
    var ss = sectores(e);
    if (!vs.sector || !ss.some(function (s) { return s.id === vs.sector; })) { vs.sector = (e.restricciones[0] || {}).sector || 'norte'; }
    var s = ss.filter(function (x) { return x.id === vs.sector; })[0];
    var botones = ss.map(function (x) {
      var r = restr(e, x.id), t = r ? (r.estado === 'sancionado' ? 'Sancionado' : 'Limitado') : 'Habilitado';
      return '<button type="button" class="pb-sector' + (r ? ' exs-sector--' + r.estado : '') + '" aria-pressed="' + (x.id === vs.sector) + '" data-acc="ex-sector" data-id="' + x.id + '">' + esc(x.nombre) + '<span>' + t + ' · ' + miles(x.base) + '</span></button>';
    }).join('');
    return '<div class="pb-ctx"><b>' + esc(e.nombre) + '</b><span>' + esc(e.ciudad) + '</span><span class="pb-ctx__d" aria-hidden="true">·</span><span>Aforo ' + esc(e.aforo) + '</span><span class="pb-ctx__d" aria-hidden="true">·</span><span>4 sectores · 8 puertas</span>' +
      '<span class="pb-sub" style="margin-left:auto">Los cambios se heredan en los eventos de este escenario</span></div>' +
      '<div class="pb-esc"><section class="pb-card pb-mapa exs-mapa" aria-label="Mapa del escenario"><div class="pb-card__cab" style="padding:0"><h2 class="pb-h2">Mapa del escenario</h2><span class="pb-sub" style="margin-left:auto;font-size:12px">Esquemático, sin escala</span></div>' + mapaDe(e) + '</section>' +
      '<section class="pb-card" aria-label="Sector"><div class="pb-card__cuerpo" style="padding-top:20px"><div class="pb-sectores" role="group" aria-label="Elegir sector">' + botones + '</div>' + panelSector(e, s, ctx) + '</div></section></div>';
  }

  function eventosVista(e, ctx) {
    var xs = usos(e, ctx);
    if (!xs.length) { return '<div class="pb-vacio" style="min-height:160px"><b>Ningún evento usa este escenario</b><span>Cuando se cree uno aparecerá aquí.</span></div>'; }
    return '<section class="pb-card"><div class="pb-card__cuerpo" style="padding-top:16px">' + xs.map(function (x) {
      return '<a class="pb-puerta" style="text-decoration:none;color:inherit" href="#/control-acceso/eventos/' + x.id + '"><b class="pb-puerta-n">' + esc((x.nombre || 'E').charAt(0)) + '</b><span>' + esc(x.nombre || 'Evento sin nombre') +
        '<span class="pb-sub">' + esc(x.codigo) + ' · ' + esc(x.competencia) + '</span></span><span>' + esc(ctx.estados[x.estado]) + '</span></a>';
    }).join('') + '</div></section>';
  }

  function detalle(ctx, id) {
    var e = porId(id);
    if (!e) { return lista(ctx); }
    var n = e.restricciones.length, nu = usos(e, ctx).length;
    var tabs = [['sectores', 'Sectores y puertas'], ['eventos', 'Eventos que lo usan (' + nu + ')']].map(function (t) {
      return '<button type="button" role="tab" class="gi-tab" data-acc="ex-tab" data-id="' + t[0] + '" aria-selected="' + (vs.tab === t[0]) + '">' + t[1] + '</button>';
    }).join('');
    return volver(ctx, LISTA, 'Volver a Escenarios') +
      '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">' + esc(e.nombre) + '</h1><p class="page-subtitle pb-evsub">' + resumen(e) +
      '<span>' + esc(e.ciudad) + '</span><span>Aforo ' + esc(e.aforo) + '</span>' + (n ? '<span>' + esc(dicho(e)) + '</span>' : '') + '</p></div></header>' +
      '<div class="gi-tabs ev-tabs" role="tablist" aria-label="Secciones del escenario">' + tabs + '</div>' +
      '<div class="pb-app"><div class="pb-vista" role="tabpanel">' + (vs.tab === 'eventos' ? eventosVista(e, ctx) : sectoresVista(e, ctx)) + '</div></div>';
  }

  /* ---------- Paso 1 del asistente: elegir el escenario y ver cómo está ---------- */

  function consecuencia(r, s) {
    if (!r) { return 'Disponible para el evento.'; }
    return (r.estado === 'sancionado' ? 'No se vende ni se abren sus puertas' : 'Hasta ' + miles(r.tope) + ' puestos') + ' · ' + r.motivo + ' · ' + r.hasta.toLowerCase().replace(/^hasta /, 'hasta ');
  }

  function filas(sel) {
    return sectores(sel).map(function (s) {
      var r = restr(sel, s.id), est = r ? r.estado : 'habilitado';
      return '<div class="pb-puerta"><b class="pb-puerta-n' + (est === 'sancionado' ? ' exs-pn--mal' : '') + '">' + esc(s.nombre.charAt(0)) + '</b><span>' + esc(s.nombre) + '<span class="pb-sub">' + esc(consecuencia(r, s)) + '</span></span>' +
        '<span>' + badge(est, est === 'habilitado' ? 'Habilitado' : est === 'limitado' ? 'Limitado' : 'Sancionado') + '</span></div>';
    }).join('');
  }

  // Pasos 3 y 4 de un evento sin configuración sembrada: lo que hereda del escenario, sin mandar al usuario a otro evento.
  function heredado(ev, texto) {
    var sel = porNombre(ev.escenario) || ESC[0];
    return '<p class="pb-sub" style="margin:0 0 16px">' + esc(texto) + '</p><div class="pb-sec" style="margin-top:0">' + filas(sel) + '</div>' +
      '<div class="pb-aviso">' + '<span>Maqueta: el detalle de esta etapa solo está cargado para Nacional vs. Medellín (EV-2026-0412).</span></div>';
  }

  function elegir(ctx, ev) {
    var sel = porNombre(ev.escenario) || ESC[0];
    return '<p class="pb-sub" style="margin:0 0 16px">El escenario define los sectores y las puertas del evento. Si algún sector tiene restricciones, el evento las hereda.</p>' +
      '<div class="ev-grid exs-pick" role="group" aria-label="Elegir escenario">' + ESC.map(function (e) { return tarjeta(e, ctx, e.id === sel.id); }).join('') + '</div>' +
      '<section class="pb-card exs-estado" aria-label="Estado del escenario"><div class="pb-card__cuerpo" style="padding-top:20px"><div class="exs-estado__cab"><h3 class="pb-h3">Estado de ' + esc(sel.nombre) + '</h3>' + resumen(sel) +
      '<a class="pb-btn pb-btn--enlace" href="' + LISTA + '/' + sel.id + '">Ver el escenario</a></div>' +
      '<div class="pb-esc"><div class="pb-mapa exs-mapa">' + mapaDe(sel) + '</div><div class="pb-sec" style="margin-top:0">' + filas(sel) + '</div></div></div></section>';
  }

  function resumenTexto(e) { return e.restricciones.length ? dicho(e).toLowerCase() : 'sin restricciones vigentes'; }

  /* ---------- Acciones ---------- */

  function poner(e, sector, estado) {
    var s = sectores(e).filter(function (x) { return x.id === sector; })[0], r = restr(e, sector);
    e.restricciones = e.restricciones.filter(function (x) { return x.sector !== sector; });
    if (estado === 'habilitado') { return; }
    e.restricciones.push({ sector: sector, estado: estado, motivo: r ? r.motivo : (estado === 'sancionado' ? 'Sanción del IVC' : 'Obras en las graderías'),
      hasta: r ? r.hasta : (estado === 'sancionado' ? 'Hasta nueva orden' : '30 nov 2026'), tope: estado === 'limitado' ? Math.round(s.base * 0.6 / 10) * 10 : undefined });
  }

  function click(el, ctx, id) {
    var ds = el.dataset, e = porId(id);
    switch (ds.acc) {
      case 'ex-abrir': return false;
      case 'ex-nuevo': ctx.toast('Agregar escenario', 'Se habilita cuando el catálogo se conecte al registro de escenarios.', 'informative'); return false;
      case 'ex-tab': vs.tab = ds.id; return;
      case 'ex-sector': vs.sector = ds.id; return;
      case 'ex-estado':
        if (!e) { return false; }
        var p = ds.id.split('.');
        poner(e, p[0], p[1]);
        ctx.toast(NOMBRE[p[0]] + ': ' + (p[1] === 'habilitado' ? 'habilitado' : p[1]), p[1] === 'habilitado' ? 'Los eventos de este escenario ya pueden usarlo.' : 'Los eventos de este escenario lo heredan en Configuración y Cupos.', p[1] === 'habilitado' ? 'informative' : 'negative');
        return;
    }
    return false;
  }

  // El texto se guarda al escribir y no repinta: así no se pierde el foco ni la posición del cursor.
  function entrada(ev, id) {
    var el = ev.target, ds = el.dataset, e = porId(id);
    if (ds.s === 'exs') { vs.q = el.value; return true; }
    if (!e || ds.acc !== 'ex-campo') { return false; }
    var r = restr(e, ds.id);
    if (r) { r[ds.k] = ds.k === 'tope' ? Number(el.value) || 0 : el.value; }
    return false;
  }

  w.EV_ESCENARIOS = { mapa: mapa, lista: lista, detalle: detalle, click: click, entrada: entrada, porId: porId, elegir: elegir, heredado: heredado, resumenTexto: resumenTexto };
})(window);
