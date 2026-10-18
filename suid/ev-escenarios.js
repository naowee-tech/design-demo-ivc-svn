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
  var vs = { q: '', tab: 'sectores', sector: null, enviado: '' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function miles(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function porId(id) { return ESC.filter(function (e) { return e.id === id; })[0]; }
  function porNombre(n) { return ESC.filter(function (e) { return e.nombre === n; })[0]; }
  function restr(e, sector) { return e.restricciones.filter(function (r) { return r.sector === sector; })[0]; }
  function siglas(n) { return String(n).replace(/^Estadio\s+/i, '').split(/\s+/).map(function (x) { return x[0]; }).join('').slice(0, 3).toUpperCase(); }

  // Los escenarios que no son el Atanasio escalan sus sectores al aforo propio.
  function sectores(e) {
    if (e.sectores) { return e.sectores; }
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
  function volver(ctx, href, texto) { return '<a class="gi-back" href="' + href + '" aria-label="' + esc(texto) + '" title="' + esc(texto) + '">' + ico(ctx, 'arrow-left') + '</a>'; }

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

  function estadoEsc(e) { return e.estado === 'revision' ? badge('limitado', 'En revisión') : badge('habilitado', 'Activo'); }

  // DC-008: el catálogo se lee como tabla densa (una fila por lugar), no como las tarjetas de eventos.
  function filaEsc(e, ctx) {
    var rev = e.estado === 'revision', nu = usos(e, ctx).length;
    var th = e.foto ? '<img src="' + esc(e.foto) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '';
    return '<a class="pb-fila exs-fila" href="' + LISTA + '/' + e.id + '" data-acc="ex-abrir" data-id="' + e.id + '">' +
      '<span class="exs-fila__nom"><span class="exs-th" aria-hidden="true"><b>' + esc(siglas(e.nombre)) + '</b>' + th + '</span><b class="pb-cortar">' + esc(e.nombre) + '</b></span>' +
      '<span class="pb-cortar">' + esc(e.ciudad) + '</span><span class="pb-num">' + esc(e.aforo) + '</span><span class="pb-num">' + sectores(e).length + '</span><span class="pb-num">' + nu + '</span>' +
      '<span>' + (rev ? '<span class="pb-sub">Pendiente de revisión</span>' : resumen(e)) + '</span><span>' + estadoEsc(e) + '</span></a>';
  }

  function lista(ctx) {
    nu = null;
    var q = vs.q.trim().toLowerCase();
    var xs = ESC.filter(function (e) { return !q || (e.nombre + ' ' + e.ciudad).toLowerCase().indexOf(q) >= 0; });
    var buscador = '<div class="pb-q ev-cab__q">' + ico(ctx, 'search') +
      '<input type="search" class="pb-input" data-s="exs" data-k="q" aria-label="Buscar escenario" placeholder="Buscar por escenario o ciudad" value="' + esc(vs.q) + '"></div>';
    var boton = '<button type="button" class="naowee-btn naowee-btn--loud" data-acc="ex-nuevo">' + ico(ctx, 'add') + 'Agregar escenario</button>';
    var enviado = vs.enviado ? '<div class="pb-aviso exs-enviado" role="status">' + ico(ctx, 'check-doc') + '<span><b>' + esc(vs.enviado) + ' se envió a revisión.</b> El IVC validará los documentos y certificaciones; mientras tanto el escenario aparece «En revisión» y todavía no se puede elegir para crear eventos. No tiene que hacer nada más.</span></div>' : '';
    return ctx.cabeceraLista('escenarios', buscador, boton) + '<div class="pb-app ev-lista">' + enviado +
      (xs.length ? '<div class="exs-scroll"><section class="pb-tabla exs-tabla" aria-label="Escenarios" style="--pb-cols:minmax(0,2.4fr) minmax(0,1fr) 84px 80px 72px minmax(0,1.5fr) 132px">' +
        '<div class="pb-cols"><span>Escenario</span><span>Ciudad</span><span>Aforo</span><span>Sectores</span><span>Eventos</span><span>Restricción</span><span>Estado</span></div>' + xs.map(function (e) { return filaEsc(e, ctx); }).join('') + '</section></div>'
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
      '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">' + esc(e.nombre) + '</h1><p class="page-subtitle pb-evsub">' + (e.estado === 'revision' ? estadoEsc(e) : resumen(e)) +
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
  /* Lo que el evento habilita del escenario: sector (tribuna y puertas) y su cupo, hasta lo que deja el escenario. */
  function lugar(ev, sel, s) {
    var h = ev.hered || (ev.hered = {}), r = restr(sel, s.id), mal = !!r && r.estado === 'sancionado', tope = r && r.estado === 'limitado' ? Math.min(r.tope, s.base) : s.base;
    if (!h[s.id]) { h[s.id] = { on: !mal, cupo: mal ? 0 : tope }; }
    return { h: h[s.id], mal: mal, tope: mal ? 0 : tope, r: r };
  }
  function habilitar(ev, id) {
    var sel = porNombre(ev.escenario) || ESC[0], s = sectores(sel).filter(function (x) { return x.id === id; })[0], l = s && lugar(ev, sel, s);
    if (l && !l.mal) { l.h.on = !l.h.on; if (l.h.on && !l.h.cupo) { l.h.cupo = l.tope; } }
  }
  function cupo(ev, id, v) {
    var sel = porNombre(ev.escenario) || ESC[0], s = sectores(sel).filter(function (x) { return x.id === id; })[0], l = s && lugar(ev, sel, s);
    if (l && l.h.on) { l.h.cupo = Math.min(l.tope, entero(v)); }
  }
  /* Resumen de lo elegido en Configuración y Cupos, para el último paso del asistente. */
  function resumenEvento(ev) {
    var sel = porNombre(ev.escenario) || ESC[0], ss = sectores(sel), on = [], cupos = [], total = 0;
    ss.forEach(function (s) { var l = lugar(ev, sel, s); if (l.h.on) { on.push(s.nombre); cupos.push(s.nombre + ' ' + miles(l.h.cupo)); total += l.h.cupo; } });
    return { n: ss.length, on: on, cupos: cupos, total: total, miles: miles };
  }
  function heredado(ev, texto, paso) {
    var sel = porNombre(ev.escenario) || ESC[0], total = 0;
    var filasEv = sectores(sel).map(function (s) {
      var l = lugar(ev, sel, s), est = l.mal ? 'sancionado' : l.r ? 'limitado' : 'habilitado', ctl;
      if (paso === 'cupos') {
        total += l.h.on ? l.h.cupo : 0;
        ctl = l.h.on ? '<label class="pb-campo pb-campo--num exs-cupo">Cupo<input type="text" inputmode="numeric" autocomplete="off" data-s="hered" data-k="cupo" data-id="' + s.id + '" value="' + miles(l.h.cupo) + '" aria-label="Cupo de ' + esc(s.nombre) + '"></label>'
          : '<span class="pb-sub">No habilitado en Configuración</span>';
      } else {
        ctl = '<button type="button" role="switch" class="pbe-sw pbe-sw--sm" aria-checked="' + l.h.on + '" data-acc="as-hab" data-id="' + s.id + '"' + (l.mal ? ' disabled' : '') + '><span class="pbe-sw__t2">' + (l.mal ? 'No se puede habilitar' : 'Habilitar tribuna y puertas') + '</span><span class="pbe-sw__pista"><span class="pbe-sw__bola"></span></span></button>';
      }
      return '<div class="pb-puerta exs-hered"><b class="pb-puerta-n' + (l.mal ? ' exs-pn--mal' : '') + '">' + esc(s.nombre.charAt(0)) + '</b><span>' + esc(s.nombre) + '<span class="pb-sub">' + esc(consecuencia(l.r, s)) +
        (paso === 'cupos' && !l.mal ? ' · disponible ' + miles(l.tope) : '') + '</span></span><span>' + badge(est, est === 'habilitado' ? 'Habilitado' : est === 'limitado' ? 'Limitado' : 'Sancionado') + '</span><span class="exs-hered__ctl">' + ctl + '</span></div>';
    }).join('');
    return '<p class="pb-sub" style="margin:0 0 16px">' + esc(texto) + '</p><div class="pb-sec" style="margin-top:0">' + filasEv + '</div>' +
      (paso === 'cupos' ? '<p class="pb-sub exs-hered__tot">Total de cupos del evento: <b>' + miles(total) + '</b></p>' : '') +
      '<div class="pb-aviso">' + '<span>Maqueta: el detalle fino de esta etapa solo está cargado para Nacional vs. Medellín (EV-2026-0412).</span></div>';
  }

  function elegir(ctx, ev) {
    var sel = porNombre(ev.escenario) || ESC[0];
    return '<p class="pb-sub" style="margin:0 0 16px">El escenario define los sectores y las puertas del evento. Si algún sector tiene restricciones, el evento las hereda.</p>' +
      '<div class="ev-grid exs-pick" role="group" aria-label="Elegir escenario">' + ESC.filter(function (e) { return e.estado !== 'revision'; }).map(function (e) { return tarjeta(e, ctx, e.id === sel.id); }).join('') + '</div>' +
      '<section class="pb-card exs-estado" aria-label="Estado del escenario"><div class="pb-card__cuerpo" style="padding-top:20px"><div class="exs-estado__cab"><h3 class="pb-h3">Estado de ' + esc(sel.nombre) + '</h3>' + resumen(sel) +
      '<a class="pb-btn pb-btn--enlace" href="' + LISTA + '/' + sel.id + '">Ver el escenario</a></div>' +
      '<div class="pb-esc"><div class="pb-mapa exs-mapa">' + mapaDe(sel) + '</div><div class="pb-sec" style="margin-top:0">' + filas(sel) + '</div></div></div></section>';
  }

  function resumenTexto(e) { return e.restricciones.length ? dicho(e).toLowerCase() : 'sin restricciones vigentes'; }

  /* ---------- Agregar escenario: asistente de 4 pasos; al final se envía a revisión, no se crea ---------- */

  var PASOS_N = [['lugar', 'Datos del lugar', 'Nombre, ciudad y aforo'], ['sectores', 'Sectores y puertas', 'Cómo se reparte el aforo'],
    ['documentos', 'Documentos y certificaciones', 'Soportes del lugar'], ['revisar', 'Revisar y enviar', 'Se envía a revisión']];
  var DOCS = B.documentosEscenario || [];
  var nu = null;
  function nuevoEst() { return nu || (nu = { i: 0, max: 0, nombre: '', ciudad: '', aforo: '', manual: false, docs: {}, tipo: { norte: 'libre', occ: 'num', ori: 'num', sur: 'libre' }, af: { norte: '', occ: '', ori: '', sur: '' } }); }
  function entero(v) { return Number(String(v == null ? '' : v).replace(/\D/g, '')) || 0; }
  function suma(n) { return ORDEN.reduce(function (a, id) { return a + entero(n.af[id]); }, 0); }
  function docsFalta(n) { return DOCS.filter(function (d) { return d.obligatorio && !n.docs[d.id]; }); }

  // Mientras no se edite un sector a mano, el aforo total se reparte como en el Atanasio y Sur absorbe el resto.
  function repartir(n) {
    var t = entero(n.aforo), f = t / 38000, rest = t;
    ORDEN.forEach(function (id, k) {
      var v = k === ORDEN.length - 1 ? Math.max(0, rest) : Math.round(BASE[id] * f / 100) * 100;
      n.af[id] = t ? String(v) : ''; rest -= v;
    });
  }

  function faltasPaso(n, i) {
    var o = [];
    if (i === 0) {
      if (!n.nombre.trim()) { o.push('escriba el nombre del escenario'); }
      else if (porNombre(n.nombre.trim())) { o.push('ya existe un escenario con ese nombre'); }
      if (!n.ciudad.trim()) { o.push('escriba la ciudad'); }
      if (!entero(n.aforo)) { o.push('escriba el aforo total'); }
    }
    if (i === 1 && suma(n) !== entero(n.aforo)) { o.push('los sectores suman ' + miles(suma(n)) + ' y el aforo es ' + miles(entero(n.aforo))); }
    if (i === 2 && docsFalta(n).length) { o.push('faltan ' + docsFalta(n).length + ' documentos obligatorios'); }
    return o;
  }
  function faltas(n) { return faltasPaso(n, n.i); }
  function pendiente(n) { return [0, 1, 2].filter(function (i) { return faltasPaso(n, i).length; })[0]; }

  // DC-009: «Siguiente» siempre activo; con el paso incompleto lo llena con datos de ejemplo y el siguiente toque avanza.
  function completar(n) {
    if (n.i === 0) {
      var ej = (B.escenariosEjemplo || []).filter(function (x) { return !porNombre(x.nombre); })[0] || { nombre: 'Estadio Nuevo ' + (ESC.length + 1), ciudad: 'Bogotá', aforo: '25.000' };
      if (!n.nombre.trim() || porNombre(n.nombre.trim())) { n.nombre = ej.nombre; }
      if (!n.ciudad.trim()) { n.ciudad = ej.ciudad; }
      if (!entero(n.aforo)) { n.aforo = ej.aforo; }
      n.manual = false; repartir(n);
    } else if (n.i === 1) { n.manual = false; repartir(n); }
    else if (n.i === 2) { DOCS.forEach(function (d) { if (d.obligatorio) { n.docs[d.id] = true; } }); }
  }

  function sectoresNuevos(n) {
    return ORDEN.map(function (id) { return { id: id, nombre: NOMBRE[id], tipo: n.tipo[id] === 'num' ? 'Numerado' : 'Aforo libre', base: entero(n.af[id]) }; });
  }
  function mapaNuevo(n) {
    var sec = {}; ORDEN.forEach(function (id) { sec[id] = 'habilitado'; });
    return w.BACKOFFICE.mapaSectores(sectoresNuevos(n), sec, {});
  }

  function tarjetaDoc(d, n) {
    var ok = !!n.docs[d.id];
    return '<div class="doc-upload-card exs-doc' + (ok ? ' is-uploaded' : '') + '"><span class="doc-upload-card__check" aria-hidden="true">' + (ok ? '✓' : '') + '</span>' +
      '<div class="doc-upload-card__content"><h3 class="doc-upload-card__title">' + esc(d.nombre) + (d.obligatorio ? '' : '<span class="doc-upload-card__optional">Opcional</span>') + '</h3>' +
      '<p class="doc-upload-card__legal">' + esc(d.detalle) + '</p>' +
      '<p class="doc-upload-card__meta">' + (ok ? esc(d.archivo) + ' · ' + esc(d.peso) + ' · carga simulada' : 'PDF, hasta 10 MB') + '</p></div>' +
      '<button type="button" class="pb-btn" data-acc="ne-doc" data-id="' + d.id + '">' + (ok ? 'Quitar' : 'Adjuntar archivo') + '<span class="pb-vh"> ' + esc(d.nombre) + '</span></button></div>';
  }

  function cuerpoNuevo(n) {
    var ver = faltas(n), aviso = ver.length ? '<div class="pb-aviso pb-aviso--alerta" role="status"><span>Pendiente en este paso: ' + esc(ver.join(' · ')) + '. Toque «Siguiente» y se completa con datos de ejemplo.</span></div>' : '';
    if (n.i === 0) {
      return '<p class="pb-sub" style="margin:0 0 16px">El escenario se registra una vez y cada evento lo hereda. Después puede marcar un sector como limitado o sancionado.</p>' +
        '<div class="pb-esc-form"><label class="pb-campo">Nombre del escenario' + GIClip.wrap('<input type="text" data-acc="ne-campo" data-k="nombre" value="' + esc(n.nombre) + '" placeholder="Estadio …">', n.nombre) + '</label>' +
        '<label class="pb-campo">Ciudad' + GIClip.wrap('<input type="text" data-acc="ne-campo" data-k="ciudad" value="' + esc(n.ciudad) + '">', n.ciudad) + '</label>' +
        '<label class="pb-campo pb-campo--num">Aforo total<input type="text" inputmode="numeric" autocomplete="off" data-acc="ne-campo" data-k="aforo" value="' + esc(n.aforo) + '"></label></div>' + aviso;
    }
    if (n.i === 1) {
      var filas = ORDEN.map(function (id) {
        var ops = [['num', 'Numerado'], ['libre', 'Aforo libre']].map(function (o) { return '<button type="button" class="pb-seg" aria-pressed="' + (n.tipo[id] === o[0]) + '" data-acc="ne-tipo" data-id="' + id + '.' + o[0] + '">' + o[1] + '</button>'; }).join('');
        return '<div class="exs-sec-fila"><b class="pb-puerta-n">' + NOMBRE[id].charAt(0) + '</b><div class="exs-sec-fila__t"><span><b>' + NOMBRE[id] + '</b> <span class="pb-sub">Puertas ' + PUERTAS[id][0] + ' y ' + PUERTAS[id][1] + '</span></span>' +
          '<div class="pb-segmento" role="group" aria-label="Tipo de puesto de ' + NOMBRE[id] + '">' + ops + '</div></div>' +
          '<input type="text" inputmode="numeric" autocomplete="off" class="pb-input" aria-label="Aforo de ' + NOMBRE[id] + '" data-acc="ne-campo" data-k="af" data-id="' + id + '" value="' + esc(n.af[id]) + '"></div>';
      }).join('');
      var dif = entero(n.aforo) - suma(n);
      return '<div class="pb-esc"><div class="pb-card pb-mapa exs-mapa"><div class="pb-card__cab" style="padding:0"><h2 class="pb-h2">Mapa del escenario</h2><span class="pb-sub" style="margin-left:auto;font-size:12px">Esquemático, sin escala</span></div>' + mapaNuevo(n) + '</div>' +
        '<div class="pb-sec" style="margin-top:0">' + filas + '<div class="pb-aviso' + (dif ? ' pb-aviso--alerta' : '') + '" role="status"><span>Repartido ' + miles(suma(n)) + ' de ' + miles(entero(n.aforo)) + (dif ? ' · ' + (dif > 0 ? 'faltan ' + miles(dif) : 'sobran ' + miles(-dif)) : ' · completo') +
        '. Cada sector lleva dos puertas.</span></div></div></div>';
    }
    if (n.i === 2) {
      var obl = DOCS.filter(function (d) { return d.obligatorio; }), ok = obl.length - docsFalta(n).length;
      return '<p class="pb-sub" style="margin:0 0 16px">Un escenario es un lugar complejo y a veces lo administra una empresa: el IVC revisa estos soportes antes de habilitarlo. En el prototipo no se sube ningún archivo real.</p>' +
        '<p class="exs-docs__n" role="status"><b>' + ok + ' de ' + obl.length + '</b> documentos obligatorios adjuntos</p>' +
        '<div class="exs-docs">' + DOCS.map(function (d) { return tarjetaDoc(d, n); }).join('') + '</div>' + aviso;
    }
    var fila = function (t, d) { return '<div class="exs-sec-fila exs-sec-fila--res"><span class="exs-chk" aria-hidden="true"></span><span class="exs-sec-fila__t"><b>' + esc(t) + '</b><span class="pb-sub">' + esc(d) + '</span></span></div>'; };
    var adj = DOCS.filter(function (d) { return n.docs[d.id]; }), falta = pendiente(n);
    return '<div class="pb-esc"><div class="pb-card pb-mapa exs-mapa">' + mapaNuevo(n) + '</div><div class="pb-sec" style="margin-top:0">' +
      fila(n.nombre.trim(), n.ciudad.trim() + ' · aforo ' + miles(entero(n.aforo))) +
      sectoresNuevos(n).map(function (s) { return fila(s.nombre, s.tipo + ' · ' + miles(s.base) + ' puestos · puertas ' + PUERTAS[s.id][0] + ' y ' + PUERTAS[s.id][1]); }).join('') +
      fila('Documentos y certificaciones', adj.length + (adj.length === 1 ? ' archivo adjunto' : ' archivos adjuntos') + ' (simulado)') +
      (falta != null ? '<div class="pb-aviso pb-aviso--alerta" role="status"><span>Falta completar «' + esc(PASOS_N[falta][1]) + '» para poder enviarlo.</span></div>' : '') +
      '<div class="pb-aviso"><span>Al enviarlo no se crea el escenario: queda «En revisión» hasta que el IVC valide los documentos. Mientras tanto no se puede elegir para un evento.</span></div></div></div>';
  }

  function nuevo(ctx) {
    var n = nuevoEst(), ult = n.i === PASOS_N.length - 1;
    var hint = ult ? 'El escenario no se crea al enviarlo: queda en revisión.' : faltas(n).length ? 'Toque Siguiente para completar con datos de ejemplo' : 'Paso completo. Toque Siguiente para continuar.';
    return ctx.armar({ pref: 'ne-', pasos: PASOS_N, i: n.i, max: n.max, cuerpo: cuerpoNuevo(n), volver: [LISTA, 'Volver a Escenarios'], titulo: n.nombre.trim() || 'Escenario nuevo',
      aria: 'Pasos para agregar el escenario', sub: '<span class="pb-badge pb-badge--borrador">Sin enviar</span>' + (n.ciudad.trim() ? '<span>' + esc(n.ciudad.trim()) + '</span>' : ''),
      cancelar: LISTA, hint: hint, fin: { acc: 'ne-guardar', label: 'Enviar a revisión', disabled: pendiente(n) != null } });
  }

  function clickNuevo(el, ctx) {
    var n = nuevoEst(), ds = el.dataset, m = document.querySelector('.main-scroll');
    if (ds.acc === 'ne-sig') {
      if (faltas(n).length) {
        var raiz = document.querySelector('.main-scroll'), foto = w.LaserFill && raiz ? w.LaserFill.snap(raiz) : null;
        completar(n);
        if (foto) w.LaserFill.play(raiz, foto, { defer: true });
        ctx.toast('Datos de ejemplo', 'Completamos este paso. Revíselo y toque Siguiente de nuevo para continuar.', 'informative'); return; }
      n.i = Math.min(PASOS_N.length - 1, n.i + 1); n.max = Math.max(n.max, n.i);
    }
    else if (ds.acc === 'ne-atras') { n.i = Math.max(0, n.i - 1); }
    else if (ds.acc === 'ne-paso') { if (+ds.id <= n.max && (+ds.id < n.i || !faltas(n).length)) { n.i = +ds.id; } }
    else if (ds.acc === 'ne-tipo') { var p = ds.id.split('.'); n.tipo[p[0]] = p[1]; return; }
    else if (ds.acc === 'ne-doc') { n.docs[ds.id] = !n.docs[ds.id]; return; }
    else if (ds.acc === 'ne-guardar') {
      if (pendiente(n) != null) { return; }
      var base = n.nombre.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/^estadio\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'escenario', id = base, k = 2;
      while (porId(id)) { id = base + '-' + k++; }
      var nuevoEsc = { id: id, nombre: n.nombre.trim(), ciudad: n.ciudad.trim(), aforo: miles(entero(n.aforo)), eventos: 0, estado: 'revision', restricciones: [], sectores: sectoresNuevos(n),
        documentos: DOCS.filter(function (d) { return n.docs[d.id]; }).map(function (d) { return d.id; }) };
      ESC.push(nuevoEsc); guardarRevision();
      vs.enviado = nuevoEsc.nombre; vs.q = '';
      ctx.toast('Enviado a revisión', nuevoEsc.nombre + ' quedó «En revisión». El IVC validará los documentos antes de habilitarlo.');
      nu = null; location.hash = LISTA; return false;
    }
    if (m) { m.scrollTop = 0; }
  }

  // Los escenarios en revisión sobreviven al recargue de la demo.
  var LLAVE = 'ivc.ev.escenarios-revision';
  function guardarRevision() {
    try { localStorage.setItem(LLAVE, JSON.stringify(ESC.filter(function (e) { return e.estado === 'revision'; }))); } catch (err) { /* sin almacenamiento */ }
  }
  (function () {
    try { (JSON.parse(localStorage.getItem(LLAVE) || '[]') || []).forEach(function (e) { if (e && e.id && !porId(e.id)) { ESC.push(e); } }); } catch (err) { /* sin almacenamiento */ }
  })();

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
    if (ds.acc.indexOf('ne-') === 0) { return clickNuevo(el, ctx); }
    switch (ds.acc) {
      case 'ex-abrir': return false;
      case 'ex-nuevo': nu = null; vs.enviado = ''; location.hash = LISTA + '/nuevo'; return false;
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
    if (ds.s === 'exs') { vs.q = el.value; vs.enviado = ''; return true; }
    if (ds.acc === 'ne-campo') {
      var n = nuevoEst();
      if (ds.k === 'af') { n.af[ds.id] = el.value; n.manual = true; }
      else { n[ds.k] = el.value; if (ds.k === 'aforo' && !n.manual) { repartir(n); } }
      return true;
    }
    if (!e || ds.acc !== 'ex-campo') { return false; }
    var r = restr(e, ds.id);
    if (r) { r[ds.k] = ds.k === 'tope' ? Number(el.value) || 0 : el.value; }
    return false;
  }

  w.EV_ESCENARIOS = { mapa: mapa, lista: lista, detalle: detalle, click: click, entrada: entrada, porId: porId, elegir: elegir, nuevo: nuevo, heredado: heredado, resumenEvento: resumenEvento, habilitar: habilitar, cupo: cupo, resumenTexto: resumenTexto };
})(window);
