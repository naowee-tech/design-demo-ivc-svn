/* Control de acceso · Eventos: backoffice del organizador (superficie 4), traído del SVN al IVC.
   Contrato: BACKOFFICE.registrar(id, { label, orden, render(ctx) -> html, accion?: {label, acc, icono?, disabled?} | fn(ctx), onClick?(el, ev, ctx),
   onInput?(ev, ctx), onChange?(ev, ctx), alMontar?(ctx) }). Los handlers repintan al volver, salvo que devuelvan false. */
window.BACKOFFICE = window.BACKOFFICE || { vistas: {} };
window.BACKOFFICE.vistas = window.BACKOFFICE.vistas || {};
// registrar(id, def): ids fijos escenario, evento, config, cupos, listo. Acciones con prefijo: esc-, evp-, cfg-, cup-, listo-.
window.BACKOFFICE.registrar = function (id, def) { this.vistas[id] = def; };

(function (w, d) {
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var ESTADOS = { borrador: 'Borrador', publicado: 'Publicado', curso: 'En curso', cerrado: 'Cerrado' };
  // Pestañas conocidas: existen aunque la vista aún no se haya registrado.
  var CONOCIDAS = { escenario: ['Escenario', 1], evento: ['Evento y partidos', 2], config: ['Configuración', 3], cupos: ['Cupos', 4], listo: ['Listo para abrir', 5] };
  // Sin los íconos del SDK en el IVC: los mismos nombres, dibujados en línea.
  var ICONOS = {
    add: '<path d="M12 5v14M5 12h14"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    caution: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    'padlock-close': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    smartphone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'check-doc': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(n) { return '<svg class="pb-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONOS[n] || '') + '</svg>'; }
  function fecha(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? (+p[2]) + ' ' + MES[+p[1] - 1] + ' ' + p[0] : 'Sin fecha'; }
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  var TIPOS = [['deportivo', 'Deportivo'], ['cultural', 'Cultural / concierto'], ['otro', 'Otro']];
  // Sin `tipo` el evento es deportivo: el caso del SVN.
  function tipoDe(e) { return e.tipo || 'deportivo'; }
  function tipoTxt(e) { return TIPOS.filter(function (t) { return t[0] === tipoDe(e); })[0][1]; }
  function copiar(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Momentos de la lista: un evento está por venir, en vivo o ya pasó (y se audita) ---------- */
  var MOMENTOS = [['vivo', 'En vivo'], ['proximos', 'Próximos'], ['pasados', 'Pasados']];
  function momento(e) { return e.estado === 'curso' ? 'vivo' : e.estado === 'cerrado' ? 'pasados' : 'proximos'; }
  function claveOrden(e) { return String(e.fecha || '9999') + ' ' + ((e.partidos[0] || {}).hora || e.apertura || '99:99'); }
  // Lo próximo se lee de lo más cercano a lo más lejano; lo pasado, de lo más reciente hacia atrás.
  function ordenar(xs, m) { return xs.slice().sort(function (a, b) { var r = claveOrden(a) < claveOrden(b) ? -1 : claveOrden(a) > claveOrden(b) ? 1 : 0; return m === 'pasados' ? -r : r; }); }
  function num(s) { return Number(String(s || '').replace(/\D/g, '')) || 0; }
  function siglas(n) { var p = String(n || '').split(/\s+/).filter(Boolean); return (p.length > 1 ? p.map(function (x) { return x[0]; }).join('') : String(n || '?').slice(0, 3)).slice(0, 3).toUpperCase(); }
  function escenarioDe(e) { return (w.EV_DATOS.backoffice.escenarios || []).filter(function (x) { return x.nombre === e.escenario; })[0]; }
  function equipo(n) { return (w.EV_DATOS.backoffice.equipos || {})[n]; }
  function cuando(iso) {
    var dias = Math.round((Date.parse(iso) - Date.parse(w.EV_DATOS.backoffice.hoy)) / 864e5);
    return isNaN(dias) ? 'Sin fecha' : dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : dias > 1 ? 'En ' + dias + ' días' : fecha(iso);
  }

  var D = { backoffice: w.EV_DATOS.backoffice }, B = D.backoffice;
  // El estado vive en el módulo: salir a otra sección y volver deja el evento como estaba.
  var st = { vista: 'evento', evento: 'e1', eventos: copiar(B.eventos), visto: '' };
  // Un evento publicado se abre en su Resumen, como los de en vivo y pasado.
  function entrada(e) { return e && e.estado === 'publicado' ? 'preparacion' : 'evento'; }

  function evActual() { return st.eventos.filter(function (e) { return e.id === st.evento; })[0] || st.eventos[0]; }

  /* ---------- Registro de vistas ---------- */

  function listaVistas() {
    var reg = w.BACKOFFICE.vistas, ids = Object.keys(CONOCIDAS);
    Object.keys(reg).forEach(function (id) { if (ids.indexOf(id) < 0) { ids.push(id); } });
    var todas = ids.map(function (id) {
      var def = reg[id], c = CONOCIDAS[id] || [id, 99];
      return { id: id, def: def || null, label: (def && def.label) || c[0], orden: def && def.orden != null ? def.orden : c[1] };
    }).sort(function (a, b) { return a.orden - b.orden; });
    // En vivo y pasado el evento se lee, no se prepara: pestañas y orden propios (las vistas viven en ev-auditoria.js).
    var orden = POR_ESTADO[evActual().estado];
    if (orden) { return orden.map(function (id) { return todas.filter(function (v) { return v.id === id; })[0]; }).filter(Boolean); }
    return todas.filter(function (v) { return SOLO_LECTURA.indexOf(v.id) < 0; });
  }
  var POR_ESTADO = { curso: ['resumen', 'puertas', 'registros', 'boleteria'], cerrado: ['resumen', 'registros', 'boleteria', 'config'] };
  var SOLO_LECTURA = ['resumen', 'puertas', 'registros'];
  // Si la pestaña guardada no existe en este estado, se entra por la primera.
  function activa() {
    var l = listaVistas(), v = l.filter(function (x) { return x.id === st.vista; })[0];
    if (!v && l.length) { v = l[0]; st.vista = v.id; }
    return v;
  }

  var LISTA = '#/control-acceso/eventos';

  SUID.views['control-acceso/eventos'] = function (view, route) {
    // Sin id se presentan los eventos; con id (…/eventos/e1) se entra a uno. Un id que ya no existe vuelve a la lista.
    var idRuta = (route.rest || [])[0], detalle = !!idRuta && st.eventos.some(function (e) { return e.id === idRuta; });
    if (detalle) { st.evento = idRuta; if (st.visto !== idRuta) { st.visto = idRuta; st.vista = entrada(evActual()); } }
    // …/eventos/escenarios[/id]: el catálogo de escenarios, aparte del selector de momentos de la lista.
    var modoEsc = idRuta === 'escenarios', escId = (route.rest || [])[1], escActual = modoEsc && escId ? w.EV_ESCENARIOS.porId(escId) : null;
    route.crumbs = [{ label: 'Inicio', href: '#/' }, { label: 'Control de acceso' }, detalle || modoEsc ? { label: 'Eventos', href: LISTA } : { label: 'Eventos' }];
    if (detalle) { route.crumbs.push({ label: evActual().nombre || 'Evento sin nombre' }); }
    if (modoEsc) { route.crumbs.push(escActual ? { label: 'Escenarios', href: LISTA + '/escenarios' } : { label: 'Escenarios' }); }
    if (escActual) { route.crumbs.push({ label: escActual.nombre }); }
    if (modoEsc && escId === 'nuevo') { route.crumbs.splice(-1, 1, { label: 'Escenarios', href: LISTA + '/escenarios' }, { label: 'Nuevo escenario' }); }
    // Deep link: …/eventos?momento=pasados elige el filtro (lo usa la app Auditoría del SVN).
    var pedido = ((route.route || {}).query || {}).momento;
    if (!detalle && pedido) { evpEst().filtro = MOMENTOS.some(function (m) { return m[0] === pedido; }) ? pedido : null; }
    var raiz = d.createElement('div'), montada = null, scr = {};
    raiz.className = 'page-inner gi-page ev-page';
    view.innerHTML = '';
    view.appendChild(raiz);

    var ctx = {
      D: D, st: st, raiz: raiz, esc: esc, ico: ico, fecha: fecha, estados: ESTADOS, ev: evActual,
      repintar: function () { if (raiz.isConnected) { pintar(); } },
      toast: function (titulo, mensaje, tema) { mostrarToast(titulo, mensaje, tema); },
      ir: function (id) { irVista(id); },
      abrir: function (id) { entrar(id, st.vista); }
    };

    /* ---------- Lista de eventos: presenta y deja elegir; crear es solo el botón de arriba ---------- */

    // Tabs arriba; debajo, una barra con filtros o buscador a la izquierda y crear a la derecha (DC-012, DC-013).
    function cabeceraLista(activo, izq, der) {
      var tabs = [['eventos', 'Eventos', LISTA], ['escenarios', 'Escenarios', LISTA + '/escenarios']].map(function (t) {
        return '<a role="tab" class="gi-tab" href="' + t[2] + '" aria-selected="' + (t[0] === activo) + '">' + t[1] + '</a>';
      }).join('');
      return '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">Eventos</h1>' +
        '<p class="page-subtitle">Los eventos del organizador, los escenarios donde ocurren y el estado de cada uno.</p></div></header>' +
        '<div class="ev-cab"><div class="gi-tabs ev-tabs" role="tablist" aria-label="Eventos y escenarios">' + tabs + '</div>' +
        '</div><div class="ev-herr"><div class="ev-herr__izq">' + izq + '</div><div class="ev-cab__acc">' + der + '</div></div>';
    }
    ctx.cabeceraLista = cabeceraLista;

    function lista() {
      var es = evpEst(), evs = st.eventos, q = es.q.trim().toLowerCase(), filtro = es.filtro || 'todos';
      var coinciden = evs.filter(function (x) {
        if (!q) { return true; }
        var txt = (x.nombre + ' ' + x.escenario + ' ' + x.ciudad + ' ' + x.partidos.map(function (p) { return p.local + ' ' + p.visita; }).join(' ')).toLowerCase();
        return txt.indexOf(q) >= 0;
      });
      var de = function (m) { return ordenar(coinciden.filter(function (x) { return momento(x) === m; }), m); };
      // El conteo sigue a la búsqueda: cada pestaña dice cuántos verá al elegirla.
      var seg = function (id, texto, n) {
        return '<button type="button" class="pb-seg ev-seg" aria-pressed="' + (filtro === id) + '" data-acc="lst-filtro" data-id="' + id + '">' +
          (id === 'vivo' ? '<i class="ev-pulso" aria-hidden="true"></i>' : '') + esc(texto) + '<span class="ev-seg__n">' + n + '</span></button>';
      };
      var segs = seg('todos', 'Todos', coinciden.length) + MOMENTOS.map(function (m) { return seg(m[0], m[1], de(m[0]).length); }).join('');
      var grupos = MOMENTOS.filter(function (m) { return filtro === 'todos' || filtro === m[0]; }).map(function (m) {
        var xs = de(m[0]);
        if (!xs.length) { return ''; }
        return '<section class="ev-grupo" aria-label="' + esc(m[1]) + '">' + (filtro === 'todos' ? '<h2 class="ev-grupo__tit">' + esc(m[1]) + '<span>' + xs.length + '</span></h2>' : '') +
          '<div class="ev-grid">' + xs.map(tarjeta).join('') + '</div></section>';
      }).join('');
      var herr = '<div class="pb-evl__herr"><div class="pb-segmento ev-segmento" role="group" aria-label="Filtrar por momento">' + segs + '</div></div>';
      var buscador = '<div class="pb-q ev-cab__q">' + ico('search') +
        '<input type="search" class="pb-input" data-s="lst" data-k="q" aria-label="Buscar evento" placeholder="Buscar por equipo, escenario o ciudad" value="' + esc(es.q) + '"></div>';
      var crear = '<button type="button" class="naowee-btn naowee-btn--loud" data-acc="lst-crear">' + ico('add') + 'Crear evento</button>';
      return cabeceraLista('eventos', herr, buscador + crear) + '<div class="pb-app ev-lista">' + (grupos ||
        '<div class="pb-vacio" style="min-height:160px"><b>Ningún evento coincide</b><span>Cambie la búsqueda o elija otro momento.</span></div>') + '</div>';
    }

    function tarjeta(x) {
      var m = momento(x), p = x.partidos[0] || {}, hora = p.hora || 'Sin hora', esc0 = escenarioDe(x);
      var foto = esc0 && esc0.foto ? '<img class="ev-card__foto" src="' + esc(esc0.foto) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '';
      var color = (equipo(p.local) || {}).color || '';
      var chip = m === 'vivo' ? '<span class="ev-estado ev-estado--vivo"><i class="ev-pulso" aria-hidden="true"></i>En vivo</span>'
        : m === 'pasados' ? '<span class="ev-estado">Finalizado</span>'
        : '<span class="ev-estado ev-estado--' + x.estado + '">' + ESTADOS[x.estado] + '</span>';
      var lado = m === 'pasados' ? '<span class="ev-auditable">' + ico('check-doc') + 'Auditable</span>'
        : m === 'proximos' ? '<span class="ev-cuando">' + cuando(x.fecha) + '</span>' : '';
      var escudos = p.local || p.visita ? '<span class="ev-card__equipos">' + escudo(p.local) + '<span class="ev-card__vs">vs.</span>' + escudo(p.visita) + '</span>' : '';
      return '<a class="ev-card ev-card--' + m + '" href="' + LISTA + '/' + x.id + '" data-acc="lst-abrir" data-id="' + x.id + '">' +
        '<span class="ev-card__media" style="--ev-eq:' + esc(color) + '"><span class="ev-card__sigla" aria-hidden="true">' + esc(siglas(x.escenario.replace(/^Estadio\s+/i, ''))) + '</span>' + foto +
        '<span class="ev-card__top">' + chip + lado + '</span>' +
        '<span class="ev-card__titulo">' + escudos + '<span class="ev-card__nom">' + esc(x.nombre || 'Evento sin nombre') + '</span>' +
        '<span class="ev-card__comp">' + esc(x.competencia) + '</span></span></span>' +
        '<span class="ev-card__cuerpo"><span class="ev-card__meta">' +
        '<span>' + ico('pin') + esc(x.escenario) + ', ' + esc(x.ciudad) + '</span>' +
        '<span>' + ico('calendar') + fecha(x.fecha) + ' · ' + esc(hora) + '</span></span>' +
        cifras(x, m) +
        (tipoDe(x) === 'deportivo' && x.partidos.some(function (z) { return z.sinVis; }) ? '<span class="pb-etiqueta ev-card__etq">Sin hinchada visitante</span>' : '') +
        '</span></a>';
    }

    // Lo que importa de cada momento: preparar (boletas), operar (adentro y novedades) o auditar (cierre).
    function cifras(x, m) {
      var aforo = num(x.aforo), dato = function (v, t, cls) { return '<span class="ev-dato' + (cls ? ' ' + cls : '') + '"><b>' + v + '</b><span>' + t + '</span></span>'; };
      var barra = function (n, t) { var pc = aforo ? Math.min(100, Math.round(n / aforo * 100)) : 0; return '<span class="ev-barra" role="img" aria-label="' + t + ': ' + pc + ' %"><i style="width:' + pc + '%"></i></span>'; };
      if (m === 'vivo') {
        var v = x.vivo || { dentro: 0, novedades: 0 };
        return '<span class="ev-datos">' + dato(miles(v.dentro), 'Entradas ahora') + dato(v.novedades, v.novedades === 1 ? 'Novedad' : 'Novedades', v.novedades ? 'ev-dato--alerta' : '') + dato(esc(x.aforo), 'Aforo') + '</span>' +
          barra(v.dentro, 'Ocupación del aforo');
      }
      if (m === 'pasados') {
        var c = x.cierre || { entraron: 0, noEntraron: 0, acciones: 0 };
        return '<span class="ev-datos">' + dato(miles(c.entraron), 'Entraron') + dato(miles(c.noEntraron), 'No entraron') + dato(c.acciones, 'Acciones de seguridad', c.acciones ? 'ev-dato--policia' : '') + '</span>';
      }
      var b = x.boletas || { generadas: 0, cupos: aforo };
      // En borrador aún no hay boletas: una barra vacía y un guion se leían como error.
      if (x.estado === 'borrador' && !b.generadas) {
        return '<span class="ev-datos ev-datos--dos">' + dato(esc(x.aforo), 'Aforo') + '<span class="ev-dato ev-nota">Boletas: se generan al publicar</span></span>';
      }
      return '<span class="ev-datos">' + dato(esc(x.aforo), 'Aforo') + dato(b.generadas ? miles(b.generadas) : '—', 'Boletas generadas') + dato(miles(Math.max(0, (b.cupos || aforo) - b.generadas)), 'Cupos libres') + '</span>' +
        barra(b.generadas, 'Boletas generadas sobre el aforo');
    }

    function escudo(n) {
      if (!n) { return '<span class="ev-escudo ev-escudo--vacio" aria-hidden="true">?</span>'; }
      var e = equipo(n) || {};
      return '<span class="ev-escudo" style="--ev-eq:' + esc(e.color || '') + '" title="' + esc(n) + '"><b aria-hidden="true">' + esc(e.sigla || siglas(n)) + '</b>' +
        (e.escudo ? '<img src="' + esc(e.escudo) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</span>';
    }

    /* ---------- Detalle del evento: volver, identidad y pestañas del IVC ---------- */

    function cabecera(v) {
      var a = v.def && v.def.accion, e = evActual();
      if (typeof a === 'function') { a = a(ctx); }
      var btn = a ? '<button type="button" class="naowee-btn naowee-btn--loud" data-acc="' + esc(a.acc) + '"' + (a.disabled ? ' disabled' : '') + '>' + (a.icono ? ico(a.icono) : '') + esc(a.label) + '</button>' : '';
      var tabs = listaVistas().map(function (t) {
        return '<button type="button" role="tab" class="gi-tab" data-acc="pb-tab" data-id="' + t.id + '" aria-selected="' + (t.id === st.vista) + '">' + esc(t.label) + '</button>';
      }).join('');
      return '<a class="gi-back" href="' + LISTA + '" aria-label="Volver a Eventos" title="Volver a Eventos">' + ico('arrow-left') + '</a>' +
        '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">' + esc(e.nombre || 'Evento sin nombre') + '</h1>' +
        '<p class="page-subtitle pb-evsub">' + (e.estado === 'cerrado' ? '<span class="pb-badge pb-badge--cerrado">Finalizado</span><span class="pb-badge ev-aud-auditable">Auditable</span>' : '<span class="pb-badge pb-badge--' + e.estado + '">' + ESTADOS[e.estado] + '</span>') + '<span class="pb-num">' + esc(e.codigo) + '</span>' +
        '<span>' + esc(e.escenario) + ', ' + esc(e.ciudad) + '</span><span>' + fecha(e.fecha) + '</span><span>Aforo ' + esc(e.aforo) + '</span></p></div>' +
        '<div class="gi-head__actions">' + btn + '</div></header>' +
        '<div class="gi-tabs ev-tabs" role="tablist" aria-label="Secciones del evento">' + tabs + '</div>';
    }

    function preparacion(v) {
      return '<div class="pb-vacio">' + ico('settings') + '<b>En preparación</b><span>' + esc(v.label) + ' se está armando y aparece en esta pestaña.</span></div>';
    }

    /* ---------- Asistente: un borrador se arma paso a paso, como el alta de una sanción ---------- */

    var PASOS = [['escenario', 'Escenario', 'Elija el lugar y revise su estado', null], ['evento', 'Evento y partidos', 'Partido, fecha y hora', 'evento'],
      ['config', 'Configuración', 'Sectores, puertas y horarios', 'config'], ['cupos', 'Cupos', 'Reparto entre comercializadoras', 'cupos'],
      ['revisar', 'Revisar y publicar', 'Lo que falta antes de abrirlo a la venta', 'evento']];
    function pasoDe(e) { st.asist = st.asist || {}; return st.asist[e.id] || (st.asist[e.id] = { i: 0, max: 0 }); }
    function faltaHora(e) { return e.partidos.some(function (p) { return !p.hora; }); }

    function revisar(e) {
      var cf = st.cfg, cu = st.cupos, r = w.EV_ESCENARIOS.mapa(e.escenario), nr = Object.keys(r).length;
      var fila = function (t, d, tag, tipo) { return '<div class="pb-puerta"><span class="exs-chk exs-chk--' + tipo + '" aria-hidden="true"></span><span><b>' + esc(t) + '</b><span class="pb-sub">' + esc(d) + '</span></span>' +
        '<span><span class="pb-badge pb-badge--' + tipo + '">' + tag + '</span></span></div>'; };
      var x = w.EV_ESCENARIOS.resumenEvento(e), sembrado = e.id === 'e1';
      var partidos = e.partidos.map(function (p) { return (p.local || 'Local') + ' vs. ' + (p.visita || 'Visitante') + ' · ' + (p.hora || 'sin hora'); }).join(' | ');
      var cfgTxt = sembrado ? 'Sectores, puertas y horarios del evento' : x.on.length + ' de ' + x.n + ' sectores habilitados' + (x.on.length ? ': ' + x.on.join(', ') : '');
      var cupTxt = sembrado ? 'Reparto entre comercializadoras homologadas' : x.on.length ? 'Total ' + x.miles(x.total) + ' · ' + x.cupos.join(' · ') : 'Sin sectores habilitados';
      var cfgTag = sembrado ? (cf && cf.sucio ? ['Sin guardar', 'alerta'] : ['Lista', 'ok']) : x.on.length ? ['Lista', 'ok'] : ['Sin sectores', 'error'];
      var cupTag = sembrado ? (cu && cu.guardado ? ['Repartidos', 'ok'] : ['Sin repartir', 'alerta']) : x.total > 0 ? ['Con cupos', 'ok'] : ['Sin cupos', 'alerta'];
      return '<div class="pb-sec">' +
        fila('Escenario', e.escenario + ', ' + e.ciudad + ' · aforo ' + e.aforo, nr ? nr + (nr === 1 ? ' restricción' : ' restricciones') : 'Sin restricciones', nr ? 'alerta' : 'ok') +
        fila('Evento y partidos', (e.nombre || 'Evento nuevo') + ' · ' + fecha(e.fecha) + ' · ' + partidos, faltaHora(e) ? 'Falta la hora' : 'Completo', faltaHora(e) ? 'error' : 'ok') +
        fila('Configuración', cfgTxt, cfgTag[0], cfgTag[1]) +
        fila('Cupos', cupTxt, cupTag[0], cupTag[1]) + '</div>';
    }

    // Armazón común de los asistentes (crear evento, agregar escenario): barra de pasos, tarjeta del paso y barra inferior.
    function armar(o) {
      var n = o.pasos.length, p = o.pasos[o.i], last = o.i === n - 1, pct = Math.round(o.i / (n - 1) * 100);
      var lista = o.pasos.map(function (x, k) {
        var cls = k === o.i ? 'is-on' : k < o.i ? 'is-done' : k <= o.max ? '' : 'is-locked';
        return '<a role="button" tabindex="' + (k > o.max ? -1 : 0) + '" class="gi-step ' + cls + '" data-acc="' + o.pref + 'paso" data-id="' + k + '"' + (k === o.i ? ' aria-current="step"' : '') + (k > o.max ? ' aria-disabled="true"' : '') + '><span>' + (k + 1) + '</span><div><b>' + x[1] + '</b><small class="pb-sub">' + x[2] + '</small></div>' +
          '<svg class="gf-ck" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>';
      }).join('');
      var fin = last ? '<button type="button" class="naowee-btn naowee-btn--loud" data-acc="' + o.fin.acc + '"' + (o.fin.disabled ? ' disabled' : '') + '>' + o.fin.label + '</button>'
        : '<button type="button" class="naowee-btn naowee-btn--loud" data-acc="' + o.pref + 'sig"' + (o.bloqueo ? ' disabled' : '') + '>Siguiente ' + ico('arrow-right') + '</button>';
      return '<a class="gi-back" href="' + o.volver[0] + '" aria-label="' + esc(o.volver[1]) + '" title="' + esc(o.volver[1]) + '">' + ico('arrow-left') + '</a>' +
        '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">' + esc(o.titulo) + '</h1><p class="page-subtitle pb-evsub">' + o.sub + '</p></div></header>' +
        '<div class="gi-layout"><nav class="gi-steps" aria-label="' + esc(o.aria) + '"><div class="gf-total"><div class="gf-total__pct"><strong>Paso ' + (o.i + 1) + '</strong><span>de ' + n + '</span></div>' +
        '<div class="gf-bar" role="progressbar" aria-label="Avance" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div><small>' + esc(p[1]) + '</small></div>' + lista + '</nav>' +
        '<div class="gi-formcol"><section class="gi-sec"><header class="gi-sec__head"><span class="gi-sec__tag">' + (o.i + 1) + '</span><div class="gf-sec__txt"><p class="gf-kicker">Paso ' + (o.i + 1) + ' de ' + n + '</p><h2 tabindex="-1">' + esc(p[1]) + '</h2></div>' +
        '<div class="gf-sec__st">' + (o.guardar || '') + '</div></header><div class="pb-app"><div class="pb-vista" data-sc="v-as" role="tabpanel" aria-label="' + esc(p[1]) + '">' + o.cuerpo + '</div></div></section></div></div>' +
        '<div class="gi-bar"><div class="gi-bar__inner"><span class="gi-bar__hint">' + esc(o.hint) + '</span><div><a class="naowee-btn naowee-btn--mute" href="' + o.cancelar + '">Cancelar</a>' +
        (o.i ? '<button type="button" class="naowee-btn naowee-btn--mute" data-acc="' + o.pref + 'atras">' + ico('arrow-left') + ' Atrás</button>' : '') + fin + '</div></div></div>';
    }
    ctx.armar = armar;

    function asistente() {
      var e = evActual(), a = pasoDe(e), p = PASOS[a.i], last = a.i === PASOS.length - 1;
      st.vista = p[3] || 'evento';
      var v = activa(), sembrado = e.id === 'e1', cuerpo = a.i === 0 ? w.EV_ESCENARIOS.elegir(ctx, e) : last ? revisar(e) : (v.def ? v.def.render(ctx) : preparacion(v));
      // Configuración y Cupos solo traen datos para el evento sembrado; con otro se muestra lo heredado del escenario.
      if (!sembrado && (p[0] === 'config' || p[0] === 'cupos')) { cuerpo = w.EV_ESCENARIOS.heredado(e, p[0] === 'config' ? 'Los sectores y las puertas parten del escenario. Aquí se ajustan los horarios, las sillas bloqueadas y el estado de cada sector para este evento.' : 'El reparto entre comercializadoras no puede pasar de lo que deja cada sector del escenario.', p[0]); }
      var acc = sembrado && v.def && v.def.accion; if (typeof acc === 'function') { acc = acc(ctx); }
      var guardar = acc && !last && a.i > 0 ? '<button type="button" class="naowee-btn naowee-btn--mute" data-acc="' + esc(acc.acc) + '"' + (acc.disabled ? ' disabled' : '') + '>' + esc(acc.label) + '</button>' : '';
      return armar({ pref: 'as-', pasos: PASOS, i: a.i, max: a.max, cuerpo: cuerpo, guardar: guardar, volver: [LISTA, 'Volver a Eventos'], titulo: e.nombre || 'Evento nuevo', aria: 'Pasos para crear el evento',
        sub: '<span class="pb-badge pb-badge--borrador">Borrador</span><span class="pb-num">' + esc(e.codigo) + '</span><span>' + esc(e.escenario) + ', ' + esc(e.ciudad) + '</span><span>Aforo ' + esc(e.aforo) + '</span>',
        cancelar: LISTA, hint: 'Se guarda como borrador al avanzar.', fin: { acc: 'evp-publicar', label: 'Publicar evento', disabled: faltaHora(e) } });
    }

    function asistenteClick(ds) {
      var e = evActual(), a = pasoDe(e), m = d.querySelector('.main-scroll');
      if (ds.acc === 'as-sig') { a.i = Math.min(PASOS.length - 1, a.i + 1); a.max = Math.max(a.max, a.i); }
      else if (ds.acc === 'as-atras') { a.i = Math.max(0, a.i - 1); }
      else if (ds.acc === 'as-paso') { if (+ds.id <= a.max) { a.i = +ds.id; } }
      else if (ds.acc === 'as-hab') { w.EV_ESCENARIOS.habilitar(e, ds.id); pintar(); return; }
      else if (ds.acc === 'as-esc') {
        var x = w.EV_ESCENARIOS.porId(ds.id);
        e.escenario = x.nombre; e.ciudad = x.ciudad; e.aforo = x.aforo;
        mostrarToast('Escenario elegido', x.nombre + ': ' + w.EV_ESCENARIOS.resumenTexto(x) + '.', 'informative');
        pintar(); return;
      }
      if (m) { m.scrollTop = 0; }
      pintar();
    }

    function contenido() {
      raiz.classList.remove('gi-form', 'ev-asist');
      if (detalle && !modoEsc && evActual().estado === 'borrador') { raiz.classList.add('gi-form', 'ev-asist'); return asistente(); }
      if (modoEsc && escId === 'nuevo') { raiz.classList.add('gi-form', 'ev-asist'); return w.EV_ESCENARIOS.nuevo(ctx); }
      if (modoEsc) { return escId ? w.EV_ESCENARIOS.detalle(ctx, escId) : w.EV_ESCENARIOS.lista(ctx); }
      if (!detalle) { return lista(); }
      var v = activa(), html = '';
      if (v.def) {
        try { html = v.def.render(ctx); } catch (err) { html = '<div class="pb-vacio">' + ico('caution') + '<b>No se pudo pintar la vista</b><span>' + esc(err.message) + '</span></div>'; if (w.console) { console.warn('eventos:', v.id, err); } }
      } else { html = preparacion(v); }
      return cabecera(v) + '<div class="pb-app">' +
        '<div class="pb-vista" data-sc="v-' + v.id + '" role="tabpanel" aria-label="' + esc(v.label) + '">' + html + '</div></div>';
    }

    /* ---------- Pintado: conserva foco y scroll al repintar ---------- */

    function clave(el) {
      var ds = el.dataset || {};
      if (ds.k) { return 'k:' + (ds.s || '') + ':' + ds.k + ':' + (ds.id || ds.n || ''); }
      if (ds.acc) { return 'a:' + ds.acc + ':' + (ds.id || ds.n || ''); }
      return el.id ? 'i:' + el.id : null;
    }

    function pintar() {
      var act = d.activeElement, kf = act && raiz.contains(act) ? clave(act) : null, sel = null;
      try { if (kf && act.selectionStart != null) { sel = [act.selectionStart, act.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      raiz.querySelectorAll('[data-sc]').forEach(function (el) { scr[el.dataset.sc] = el.scrollTop; });
      raiz.innerHTML = contenido();
      raiz.querySelectorAll('[data-sc]').forEach(function (el) { el.scrollTop = scr[el.dataset.sc] || 0; });
      if (kf) {
        var els = raiz.querySelectorAll('[data-k],[data-acc],[id]');
        for (var i = 0; i < els.length; i++) {
          if (clave(els[i]) === kf && !els[i].disabled) {
            els[i].focus({ preventScroll: true });
            try { if (sel) { els[i].setSelectionRange(sel[0], sel[1]); } } catch (e) { /* tipo sin selección */ }
            break;
          }
        }
      }
      if (detalle && montada !== st.vista) {
        montada = st.vista;
        var v = activa();
        if (v && v.def && v.def.alMontar) { v.def.alMontar(ctx); }
      }
    }

    // Avisos con el toast del IVC; el informativo va en azul.
    function mostrarToast(t, m, th) {
      var tipo = th === 'informative' ? 'info' : th === 'negative' ? 'warn' : 'ok';
      w.GIUI.toast(m ? t + '. ' + m : t, tipo);
    }

    function irVista(id) { st.vista = id; pintar(); }

    // Cambiar de evento cambia la URL; solo se repinta en el sitio si ya es el evento de la ruta.
    function entrar(id, vista) {
      st.evento = id; st.vista = vista;
      if (detalle && id === idRuta) { pintar(); } else { location.hash = LISTA + '/' + id; }
    }

    function crear() {
      var es = evpEst();
      var nuevo = { id: 'n' + st.eventos.length, codigo: siguienteCodigo(st.eventos), nombre: 'Evento nuevo', tipo: 'deportivo', competencia: B.competencias[0], escenario: B.escenarios[0].nombre, ciudad: B.escenarios[0].ciudad,
        fecha: '2026-10-10', apertura: '', estado: 'borrador', aforo: B.escenarios[0].aforo, pub: '', partidos: [{ local: '', visita: '', hora: '', sinVis: false }] };
      st.eventos.unshift(nuevo); es.filtro = null; es.q = '';
      mostrarToast('Borrador creado', 'Complete los datos y la hora de cada partido para publicarlo.', 'informative');
      entrar(nuevo.id, 'evento');
    }

    /* ---------- Eventos del DOM: se delegan a la vista activa ---------- */

    function onClick(ev) {
      var el = ev.target.closest('[data-acc]');
      if (!el) { return; }
      var ds = el.dataset;
      if (el.disabled) { return; }
      switch (ds.acc) {
        case 'pb-tab': irVista(ds.id); return;
        case 'lst-abrir': st.visto = ''; return; // el enlace navega solo; se entra por el evento, no por la última pestaña
        case 'lst-filtro': evpEst().filtro = ds.id === 'todos' ? null : ds.id; marcarFiltro(); pintar(); return;
        case 'lst-crear': crear(); return;
        case 'lst-escenarios': location.hash = LISTA + '/escenarios'; return;
      }
      if (modoEsc) { if (w.EV_ESCENARIOS.click(el, ctx, escId) !== false) { pintar(); } return; }
      if (ds.acc.indexOf('as-') === 0) { asistenteClick(ds); return; }
      var v = activa(), antes = detalle && evActual().estado;
      if (!detalle || (v && v.def && v.def.onClick && v.def.onClick(el, ev, ctx) === false)) {
        // Publicar un borrador cambia su vista: sale del asistente y entra por Configuración.
        if (antes === 'borrador' && evActual().estado !== 'borrador') { st.vista = 'config'; pintar(); }
        return;
      }
      pintar();
    }

    var TEXTO = /^(text|search|number|tel|email|)$/;
    function delegar(ev, nombre) {
      var el = ev.target;
      if (!el.closest || !el.closest('.pb-vista')) { return; }
      var v = activa();
      if (!v || !v.def || !v.def[nombre]) { return; }
      if (v.def[nombre](ev, ctx) !== false) { pintar(); }
    }
    // El texto avisa en `input`; selects, casillas, fechas y horas confirman con `change`.
    function onInput(ev) {
      var el = ev.target, texto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type));
      if (modoEsc && texto) { if (w.EV_ESCENARIOS.entrada(ev, escId)) { pintar(); } return; }
      if (texto && el.dataset.s === 'hered') { w.EV_ESCENARIOS.cupo(evActual(), el.dataset.id, el.value); pintar(); return; }
      if (texto && el.dataset.s === 'lst') { evpEst().q = el.value; pintar(); return; }
      if (texto) { delegar(ev, 'onInput'); }
    }
    function onCambio(ev) {
      var el = ev.target, texto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type));
      if (!texto) { delegar(ev, 'onChange'); }
    }

    // Estado por vista (creado bajo demanda, para crearlo solo al entrar a la vista).
    function escenarioEst() { return st.esc || (st.esc = iniciarEsc(B)); }
    function evpEst() { return st.evp || (st.evp = { filtro: null, q: '' }); }
    // El filtro viaja en el hash sin recargar: replaceState no agrega pasos al atrás ni dispara hashchange.
    function marcarFiltro() {
      var f = evpEst().filtro, h = LISTA + (f ? '?momento=' + f : '');
      if (!detalle && !modoEsc && location.hash !== h && w.history.replaceState) { w.history.replaceState(w.history.state, '', h); }
    }

    /* ---------- Montaje: los oyentes van en `raiz`, que se crea en cada entrada ---------- */

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('change', onCambio);
    raiz.addEventListener('input', onInput);
    montada = null;
    marcarFiltro();
    pintar();
  };

  /* =====================================================================
     Vista 1 · Escenario (esc-)
     ===================================================================== */

  function iniciarEsc(B) {
    var s = { sel: 'occ', filtro: 'sector', sec: {}, disp: copiar(B.escenario.dispositivos) };
    B.escenario.sectores.forEach(function (x) { s.sec[x.id] = { nombre: x.nombre, tipo: x.tipo, aforo: x.aforo }; });
    return s;
  }

  var MAPA = {
    norte: { x: 112, y: 22, w: 296, h: 80, tx: 260, ty: 68, giro: 0 },
    sur: { x: 112, y: 462, w: 296, h: 80, tx: 260, ty: 508, giro: 0 },
    occ: { x: 22, y: 112, w: 80, h: 340, tx: 62, ty: 287, giro: -90 },
    ori: { x: 418, y: 112, w: 80, h: 340, tx: 458, ty: 287, giro: 90 }
  };
  var PUERTA_XY = { 1: [190, 22], 2: [330, 22], 3: [22, 190], 8: [22, 374], 4: [498, 190], 5: [498, 374], 6: [190, 542], 7: [330, 542] };
  var ESTADO_DISP = {
    linea: ['ok', 'En línea'], sinred: ['error', 'Sin conexión'], paquete: ['alerta', 'Sin paquete'], libre: ['neutro', 'Sin asignar']
  };
  var CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  var CAMPO_PUESTOS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M3 11h18v5H3z"/><path d="M6 16v4M18 16v4"/></svg>';

  function vistaEscenario(c) {
    var B = c.D.backoffice, E = B.escenario, st = c.st, esc = c.esc;
    var s = st.esc || (st.esc = iniciarEsc(B));
    var sec = s.sec, sel = s.sel, num = sec[sel].tipo === 'num';
    var ids = B.escenario.sectores.map(function (x) { return x.id; });
    var total = ids.reduce(function (a, id) { return a + (Number(sec[id].aforo) || 0); }, 0);
    var nombre = function (id) { return sec[id].nombre || 'Sin nombre'; };
    var sectorDe = function (n) { return (E.puertas.filter(function (p) { return p.n === n; })[0] || {}).sector; };
    var puertaTxt = function (n) { return n ? 'Puerta ' + n + ' · ' + nombre(sectorDe(n)) : 'Sin puerta'; };
    var doorsSel = E.puertas.filter(function (p) { return p.sector === sel; });

    // Mapa: el sector elegido se marca con trazo azul grueso; libre va punteado y numerado en azul suave.
    var rects = ids.map(function (id) {
      var m = MAPA[id], on = id === sel, n = sec[id].tipo === 'num';
      var fill = n ? 'color-mix(in srgb, var(--naotech-color-blue-900) 10%, var(--naotech-app-background))' : 'var(--naotech-app-color-100)';
      var stroke = on ? 'var(--naotech-color-blue-900)' : n ? 'var(--naotech-color-blue-600)' : 'var(--naotech-app-color-600)';
      var rot = m.giro ? ' transform="rotate(' + m.giro + ' ' + m.tx + ' 282)"' : '';
      return '<g data-acc="esc-sector" data-id="' + id + '"><rect x="' + m.x + '" y="' + m.y + '" width="' + m.w + '" height="' + m.h + '" rx="14" style="fill:' + fill + ';stroke:' + stroke + ';stroke-width:' + (on ? 4 : 1.5) + ';stroke-dasharray:' + (n ? 'none' : '6 5') + '"/>' +
        '<text x="' + m.tx + '" y="' + m.ty + '" text-anchor="middle"' + rot + ' style="font-size:15px;font-weight:700;fill:var(--naotech-app-color-900)">' + esc(nombre(id)) + '</text></g>';
    }).join('');
    var campo = 'style="fill:none;stroke:var(--naotech-color-green-300);stroke-width:1.5"';
    var puertasMapa = E.puertas.map(function (p) {
      var xy = PUERTA_XY[p.n], on = p.sector === sel;
      return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="15" style="fill:' + (on ? 'var(--naotech-color-blue-900)' : 'var(--naotech-app-color-900)') + ';stroke:var(--naotech-app-background);stroke-width:3"/>' +
        '<text x="' + xy[0] + '" y="' + (xy[1] + 5) + '" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--naotech-color-white-alpha-100)">' + p.n + '</text>';
    }).join('');
    var mapa = '<section class="pb-card pb-mapa" aria-label="Mapa del escenario"><div class="pb-card__cab" style="padding:0"><h2 class="pb-h2">Mapa del escenario</h2><span class="pb-sub" style="margin-left:auto;font-size:12px">Esquemático, sin escala</span></div>' +
      '<svg viewBox="0 0 520 564" aria-hidden="true"><rect x="122" y="112" width="276" height="340" rx="6" style="fill:var(--naotech-color-green-050);stroke:var(--naotech-color-green-300);stroke-width:1.5"/>' +
      '<line x1="122" y1="282" x2="398" y2="282" ' + campo + '/><circle cx="260" cy="282" r="38" ' + campo + '/><rect x="200" y="112" width="120" height="44" ' + campo + '/><rect x="200" y="408" width="120" height="44" ' + campo + '/>' +
      rects + puertasMapa + '</svg>' +
      '<div class="pb-leyenda"><span><i class="pb-muestra"></i>Numerado (fila y silla)</span><span><i class="pb-muestra pb-muestra--libre"></i>Aforo libre</span><span><b class="pb-puerta-n pb-puerta-n--s">1</b>Puerta</span></div></section>';

    var sectores = '<div class="pb-sectores" role="group" aria-label="Elegir sector">' + ids.map(function (id) {
      return '<button type="button" class="pb-sector" aria-pressed="' + (id === sel) + '" data-acc="esc-sector" data-id="' + id + '">' + esc(nombre(id)) +
        '<span>' + (sec[id].tipo === 'num' ? 'Numerado' : 'Aforo libre') + ' · ' + miles(Number(sec[id].aforo) || 0) + '</span></button>';
    }).join('') + '</div>';

    var vacio = !sec[sel].nombre.trim();
    var form = '<div class="pb-esc-form">' +
      '<label class="pb-campo">Nombre del sector' + GIClip.wrap('<input type="text" data-s="esc" data-k="nombre" value="' + esc(sec[sel].nombre) + '"' + (vacio ? ' aria-invalid="true" aria-describedby="esc-err"' : '') + '>', sec[sel].nombre) + '</label>' +
      '<div class="pb-campo"><span id="esc-tipo-l">Tipo de puesto</span><div class="pb-segmento" role="group" aria-labelledby="esc-tipo-l">' +
        '<button type="button" class="pb-seg" aria-pressed="' + num + '" data-acc="esc-tipo" data-id="num">Numerado</button>' +
        '<button type="button" class="pb-seg" aria-pressed="' + !num + '" data-acc="esc-tipo" data-id="libre">Aforo libre</button></div></div>' +
      '<label class="pb-campo pb-campo--num">Aforo del sector<input type="number" min="0" step="100" data-s="esc" data-k="aforo" value="' + esc(sec[sel].aforo) + '"></label></div>' +
      (vacio ? '<p class="pb-error" id="esc-err">' + c.ico('caution') + 'El sector necesita un nombre.</p>' : '');

    var filas = B.escenario.sectores.filter(function (x) { return x.id === sel; })[0].filas || 'Filas por definir';
    var puestos = '<div class="pb-puestos">' + CAMPO_PUESTOS + (num
      ? '<span><b>Puestos numerados:</b> ' + esc(filas) + ' · ' + miles(Number(sec[sel].aforo) || 0) + ' sillas. Cada boleta lleva fila y silla.</span>'
      : '<span><b>Aforo libre:</b> ' + miles(Number(sec[sel].aforo) || 0) + ' cupos sin silla. La boleta lleva el sector, no la fila.</span>') +
      '<button type="button" class="pb-btn" data-acc="esc-puestos">' + (num ? 'Editar filas y sillas' : 'Editar cupo') + '</button></div>';

    var puertas = '<div class="pb-sec"><div class="pb-puertas-cab"><h3 class="pb-h3">Puertas de ' + esc(nombre(sel)) + '</h3><span class="pb-sub" style="font-size:12px">Cada puerta pertenece a un solo sector</span>' +
      '<button type="button" class="pb-btn pb-btn--enlace" data-acc="esc-puerta-nueva">' + c.ico('add') + 'Agregar puerta</button></div>' +
      doorsSel.map(function (p) {
        var ds = s.disp.filter(function (d) { return d.puerta === p.n; });
        return '<div class="pb-puerta"><b class="pb-puerta-n">' + p.n + '</b><span>Puerta ' + p.n + '<span class="pb-sub">Solo sector ' + esc(nombre(sel)) + '</span></span>' +
          '<span>' + (ds.length ? ds.length + (ds.length === 1 ? ' dispositivo · ' : ' dispositivos · ') + ds.map(function (d) { return d.id; }).join(', ') : 'Sin dispositivo asignado') + '</span>' +
          '<button type="button" class="pb-btn" data-acc="esc-puerta-editar" data-id="' + p.n + '">Editar<span class="pb-vh"> puerta ' + p.n + '</span></button></div>';
      }).join('') + '</div>';

    var sectorCard = '<section class="pb-card" aria-label="Sector"><div class="pb-card__cuerpo" style="padding-top:20px">' + sectores + form + puestos + puertas + '</div></section>';

    // Dispositivos: la búsqueda y los filtros van dentro de la tabla.
    var nSec = s.disp.filter(function (d) { return sectorDe(d.puerta) === sel; }).length;
    var chip = function (id, texto, n) { return '<button type="button" class="pb-chip" aria-pressed="' + (s.filtro === id) + '" data-acc="esc-filtro" data-id="' + id + '">' + esc(texto) + '<span class="pb-chip__n">' + n + '</span></button>'; };
    var lista = s.disp.filter(function (d) { return s.filtro === 'todos' || sectorDe(d.puerta) === sel; });
    var filasD = lista.map(function (d) {
      var e = ESTADO_DISP[d.estado];
      return '<div class="pb-fila"><b class="pb-num">' + d.id + '</b><span>' + esc(d.tipo) + '</span><span class="pb-cortar"' + (d.puerta ? '' : ' style="color:var(--naotech-app-color-700)"') + '>' + esc(puertaTxt(d.puerta)) + '</span>' +
        '<span><span class="pb-badge pb-badge--' + e[0] + '">' + e[1] + '</span></span><span class="pb-sub pb-num" style="font-size:13px">Hoy ' + d.senal + '</span></div>';
    }).join('');
    var dispCard = '<section class="pb-tabla" aria-label="Dispositivos" style="--pb-cols:100px minmax(0,1.2fr) minmax(0,1fr) 128px 84px"><div class="pb-herr"><h2 class="pb-h2">Dispositivos</h2>' +
      '<div class="pb-chips" role="group" aria-label="Filtrar dispositivos">' + chip('sector', 'De ' + nombre(sel), nSec) + chip('todos', 'Todos', s.disp.length) + '</div>' +
      '<button type="button" class="pb-btn" data-acc="esc-disp-nuevo">' + c.ico('smartphone') + 'Registrar dispositivo</button></div>' +
      '<div class="pb-cols"><span>Código</span><span>Tipo</span><span>Puerta</span><span>Estado</span><span>Señal</span></div>' + (filasD || '<div class="pb-fila pb-sub">Este sector no tiene dispositivos.</div>') + '</section>';

    var nPuertas = E.puertas.length, sep = '<span class="pb-ctx__d" aria-hidden="true">·</span>';
    var ctxLinea = '<div class="pb-ctx"><b>' + esc(E.nombre) + '</b><span>' + esc(E.ciudad) + '</span>' + sep + '<span>Aforo ' + miles(total) + '</span>' + sep +
      '<span>' + ids.length + ' sectores · ' + nPuertas + ' puertas · ' + s.disp.length + ' dispositivos</span><span class="pb-sub" style="margin-left:auto">Última modificación: ' + esc(E.modificado) + '</span></div>';

    return ctxLinea + '<div class="pb-esc">' + mapa + '<div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + sectorCard + dispCard + '</div></div>';
  }

  window.BACKOFFICE.registrar('escenario', {
    label: 'Escenario', orden: 1,
    accion: { label: 'Agregar sector', acc: 'esc-sector-nuevo', icono: 'add' },
    render: vistaEscenario,
    onClick: function (el, ev, c) {
      var d = el.dataset, s = c.st.esc, info = 'En el prototipo este formulario no se abre.';
      switch (d.acc) {
        case 'esc-sector': s.sel = d.id; return;
        case 'esc-tipo': s.sec[s.sel].tipo = d.id; return;
        case 'esc-filtro': s.filtro = d.id; return;
        case 'esc-sector-nuevo': c.toast('Agregar sector', 'El mapa del prototipo tiene sus 4 sectores fijos. ' + info, 'informative'); return false;
        case 'esc-disp-nuevo': c.toast('Registrar dispositivo', info, 'informative'); return false;
        case 'esc-puerta-nueva': c.toast('Agregar puerta', info, 'informative'); return false;
        case 'esc-puerta-editar': c.toast('Editar puerta ' + d.id, info, 'informative'); return false;
        case 'esc-puestos': c.toast(s.sec[s.sel].tipo === 'num' ? 'Editar filas y sillas' : 'Editar cupo', info, 'informative'); return false;
      }
      return false;
    },
    onInput: function (ev, c) {
      var d = ev.target.dataset, s = c.st.esc;
      if (d.s !== 'esc') { return false; }
      if (d.k === 'nombre') { s.sec[s.sel].nombre = ev.target.value; }
      if (d.k === 'aforo') { s.sec[s.sel].aforo = ev.target.value === '' ? '' : Math.max(0, Number(ev.target.value) || 0); }
    }
  });

  /* =====================================================================
     Vista 2 · Evento y partidos (evp-)
     ===================================================================== */

  var ORDEN = ['borrador', 'publicado', 'curso', 'cerrado'];
  var PIES = {
    borrador: function () { return 'Un borrador no es visible para las comercializadoras.'; },
    publicado: function (e) { return e.pub || 'Publicado'; },
    curso: function (e) { return 'Puertas abiertas desde las ' + e.apertura + '.'; },
    cerrado: function () { return 'Evento cerrado. Queda la auditoría.'; }
  };

  function vistaEvento(c) {
    var esc = c.esc, B = c.D.backoffice;
    var e = c.ev(), bloq = e.estado === 'curso' || e.estado === 'cerrado';
    var faltaHora = e.partidos.some(function (p) { return !p.hora; });

    // La lista de eventos vive en la entrada (marco); acá solo queda el evento elegido.
    var idx = ORDEN.indexOf(e.estado);
    var pasos = ORDEN.map(function (k, j) {
      return '<li class="pb-paso' + (j < idx ? ' pb-paso--hecho' : j === idx ? ' pb-paso--actual' : '') + '"' + (j === idx ? ' aria-current="step"' : '') + '><span>' + (j < idx ? CHECK : '') + c.estados[k] + '</span></li>';
    }).join('');
    var dis = bloq ? ' disabled' : '';
    var opts = function (lista, val) { return lista.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); };
    var datos = '<section class="pb-sec"><h3 class="pb-h3">Datos del evento</h3><div class="pb-form2">' +
      '<label class="pb-campo">Tipo de evento<select data-s="evp" data-k="tipo"' + dis + '>' + TIPOS.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === tipoDe(e) ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="pb-campo">Competencia<select data-s="evp" data-k="competencia"' + dis + '>' + opts(B.competencias, e.competencia) + '</select></label>' +
      '<label class="pb-campo">Nombre del evento' + GIClip.wrap('<input type="text" data-s="evp" data-k="nombre" value="' + esc(e.nombre) + '"' + dis + '>', e.nombre) + '</label>' +
      '<label class="pb-campo">Escenario<select data-s="evp" data-k="escenario"' + dis + '>' + opts(B.escenarios.map(function (x) { return x.nombre; }), e.escenario) + '</select></label>' +
      '<div class="pb-form2__par"><label class="pb-campo">Fecha<input type="date" data-s="evp" data-k="fecha" value="' + esc(e.fecha) + '"' + dis + '></label>' +
      '<label class="pb-campo">Apertura de puertas<input type="time" data-s="evp" data-k="apertura" value="' + esc(e.apertura) + '"' + dis + '></label></div></div>' +
      '<p class="pb-sub" style="font-size:13px">Aforo del escenario: ' + esc(e.aforo) + '. Sectores, puertas y cupos se ajustan en Configuración y Cupos.</p></section>';

    var dep = tipoDe(e) === 'deportivo';
    var partidos = '<section class="pb-sec"><div class="pb-puertas-cab"><h3 class="pb-h3">Partidos del evento · ' + e.partidos.length + '</h3>' +
      '<button type="button" class="pb-btn pb-btn--enlace" data-acc="evp-partido-nuevo"' + dis + '>' + c.ico('add') + 'Agregar partido</button></div>' +
      '<div class="pb-partidos-cab"><span>Local</span><span></span><span>Visitante</span><span>Inicio</span>' + (dep ? '<span>Hinchada visitante</span>' : '') + '</div>' +
      e.partidos.map(function (p, k) {
        return '<div class="pb-partido"><input type="text" class="pb-input" aria-label="Equipo local" data-s="evp" data-k="local" data-n="' + k + '" value="' + esc(p.local) + '"' + dis + '>' +
          '<span class="pb-partido__vs">vs.</span><input type="text" class="pb-input" aria-label="Equipo visitante" data-s="evp" data-k="visita" data-n="' + k + '" value="' + esc(p.visita) + '"' + dis + '>' +
          '<input type="time" class="pb-input" aria-label="Hora de inicio" data-s="evp" data-k="hora" data-n="' + k + '" value="' + esc(p.hora) + '"' + dis + (p.hora ? '' : ' aria-invalid="true"') + '>' +
          (dep ? '<button type="button" role="switch" class="pb-partido__vis pbe-sw" aria-checked="' + !!p.sinVis + '" data-acc="evp-sinvis" data-n="' + k + '"' + dis + '><span class="pbe-sw__t2">Sin hinchada visitante</span><span class="pbe-sw__pista"><span class="pbe-sw__bola"></span></span></button>' : '') + '</div>';
      }).join('') +
      (faltaHora && !bloq ? '<p class="pb-error">' + c.ico('caution') + 'Cada partido necesita su hora de inicio para publicar el evento.</p>' : '') + '</section>';

    var aviso = bloq ? '<div class="pb-aviso">' + c.ico('padlock-close') + '<span>' + (e.estado === 'curso' ? 'Evento en curso: la programación ya no se puede cambiar.' : 'Evento cerrado: solo lectura.') + '</span></div>' : '';

    var accion = '';
    if (e.estado === 'borrador') { accion = '<button type="button" class="pb-btn pb-btn--pri" data-acc="evp-publicar"' + (faltaHora ? ' disabled' : '') + '>Publicar evento</button>'; }
    if (e.estado === 'publicado') { accion = '<button type="button" class="pb-btn pb-btn--pri" data-acc="evp-config">Configurar el evento' + c.ico('arrow-right') + '</button>'; }
    if (e.estado === 'curso') { accion = '<button type="button" class="pb-btn pb-btn--pri" data-acc="evp-puertas">Ver estado de las puertas</button>'; }
    if (e.estado === 'cerrado') { accion = '<button type="button" class="pb-btn" data-acc="evp-auditoria">Ver auditoría del evento</button>'; }
    var guardar = bloq ? '' : '<button type="button" class="pb-btn" data-acc="evp-guardar">Guardar cambios</button>';

    var det = '<section class="pb-card pb-evp__det" aria-label="Detalle del evento"><div class="pb-evp__cab"><ol class="pb-pasos" aria-label="Estado del evento">' + pasos + '</ol></div>' +
      '<div class="pb-evp__cuerpo" data-sc="evp-det">' + aviso + datos + partidos + '</div>' +
      '<div class="pb-evp__pie"><span>' + esc(PIES[e.estado](e)) + '</span>' + guardar + accion + '</div></section>';

    return '<div class="pb-evp pb-llena">' + det + '</div>';
  }

  function siguienteCodigo(evs) {
    var mayor = evs.reduce(function (m, x) { return Math.max(m, parseInt(String(x.codigo).split('-')[2], 10) || 0); }, 0);
    return 'EV-2026-' + ('0000' + (mayor + 1)).slice(-4);
  }

  window.BACKOFFICE.registrar('evento', {
    label: 'Evento y partidos', orden: 2,
    render: vistaEvento,
    onClick: function (el, ev, c) {
      var d = el.dataset, st = c.st, e = c.ev(), B = c.D.backoffice;
      switch (d.acc) {
        case 'evp-sinvis': e.partidos[+d.n].sinVis = !e.partidos[+d.n].sinVis; if (st.cfg) { st.cfg.sucio = true; } return;
        case 'evp-partido-nuevo': e.partidos.push({ local: '', visita: '', hora: '', sinVis: false }); return;
        case 'evp-guardar': c.toast('Cambios guardados', e.nombre + ' quedó actualizado.'); return false;
        case 'evp-publicar':
          if (e.partidos.some(function (p) { return !p.hora; })) { return; }
          e.estado = 'publicado'; e.pub = 'Publicado el ' + c.fecha(B.hoy);
          c.toast('Evento publicado', 'Las comercializadoras homologadas ya lo ven.');
          return false;
        case 'evp-config': c.ir('config'); return false;
        case 'evp-puertas': c.ir('listo'); return false;
        case 'evp-auditoria': c.toast('Auditoría del evento', 'Es otra aplicación: se abre desde el gate, Por aplicación.', 'informative'); return false;
      }
      return false;
    },
    onInput: function (ev, c) {
      var t = ev.target, d = t.dataset, e = c.ev();
      if (d.s !== 'evp') { return false; }
      if (d.k === 'nombre') { e.nombre = t.value; }
      if (d.k === 'local' || d.k === 'visita') { e.partidos[+d.n][d.k] = t.value; }
    },
    onChange: function (ev, c) {
      var t = ev.target, d = t.dataset, e = c.ev(), B = c.D.backoffice;
      if (d.s !== 'evp') { return false; }
      if (d.k === 'hora') { e.partidos[+d.n].hora = t.value; }
      if (d.k === 'tipo') { e.tipo = t.value; }
      if (d.k === 'competencia' || d.k === 'fecha' || d.k === 'apertura') { e[d.k] = t.value; }
      if (d.k === 'escenario') {
        var x = B.escenarios.filter(function (s) { return s.nombre === t.value; })[0];
        e.escenario = t.value; if (x) { e.ciudad = x.ciudad; e.aforo = x.aforo; }
      }
    }
  });
})(window, document);
