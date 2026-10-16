/* Eventos en vivo y pasados: Resumen, Puertas y Registros (la auditoría del SVN en el formato del IVC).
   Las tres vistas leen los mismos registros (EV_AUDIT); se registran en window.BACKOFFICE. */
(function (w) {
  var B = w.BACKOFFICE = w.BACKOFFICE || { vistas: {} };
  if (!B.vistas) { B.vistas = {}; }
  if (!B.registrar) { B.registrar = function (id, def) { B.vistas[id] = def; }; }
  var X = w.EV_AUDIT, TIPO = {};
  X.TIPOS.forEach(function (t) { TIPO[t.id] = t; });
  var POR_PAGINA = 25;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pct(x, t) { return t ? (Math.round(x / t * 1000) / 10).toString().replace('.', ',') + ' %' : '0 %'; }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function svg(d, t) { return '<svg width="' + (t || 18) + '" height="' + (t || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ev-aud-ico">' + d + '</svg>'; }
  var I = {
    bajar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    girar: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    izq: '<path d="m15 6-6 6 6 6"/>',
    der: '<path d="m9 6 6 6-6 6"/>',
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    vivo: '<circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>'
  };

  /* ---------- Datos y estado por evento ---------- */

  function aud(ctx) {
    var e = ctx.ev(), V = B.boletas ? B.boletas(ctx) : null;
    return X.de(e, V ? V.con : Math.round(X.entero(e.aforo) * 0.93));
  }
  // Filtros y selección por evento: los de un evento no se cuelan en otro.
  function est(ctx, A) {
    var st = ctx.st, id = ctx.ev().id;
    st.aud = st.aud || {};
    if (!st.aud[id]) {
      var caso = A.filas.filter(function (f) { return f.t === 'medida' && f.k === A.caso; })[0] || A.filas[0];
      st.aud[id] = { tipo: '', puerta: '', origen: '', doc: '', pag: 1, sel: caso && caso.id, exp: false };
    }
    return st.aud[id];
  }
  function nombreSector(A, id) { return (A.sectores.filter(function (s) { return s.id === id; })[0] || {}).nombre || ''; }
  function puertaTxt(A, p) { return p ? 'Puerta ' + p + ' · ' + nombreSector(A, A.secDe[p]) : '—'; }
  function origenTxt(o) { return X.ORIGENES[o] || ''; }
  // Índices perezosos sobre el registro: por persona y por puerta.
  function porPersona(A) {
    if (!A._pp) { A._pp = {}; A.filas.forEach(function (f) { (A._pp[f.k] = A._pp[f.k] || []).push(f); }); }
    return A._pp;
  }
  function porPuerta(A) {
    if (!A._pu) {
      A._pu = {};
      A.filas.forEach(function (f) {
        if (!f.p) { return; }
        var c = A._pu[f.p] || (A._pu[f.p] = { entraron: 0, boleta: 0, medida: 0, abiertas: {}, ultima: 0 });
        if (f.t === 'verde' || f.t === 'amarillo') { c.entraron++; c.ultima = Math.max(c.ultima, f.m); }
        if (f.t === 'operativo') { c.boleta++; }
        if (f.t === 'medida') { c.medida++; }
      });
    }
    return A._pu;
  }
  function alertas(A) {
    if (!A._al) {
      var abiertas = {}, n = 0, cerradas = 0;
      A.filas.slice().reverse().forEach(function (f) {
        if (f.t !== 'policia') { return; }
        if (f.d.indexOf('Alerta asignada') === 0) { n++; abiertas[f.k] = f; }
        if (f.d.indexOf('Alerta cerrada') === 0) { cerradas++; delete abiertas[f.k]; }
      });
      A._al = { n: n, cerradas: cerradas, abiertas: Object.keys(abiertas).map(function (k) { return abiertas[k]; }) };
    }
    return A._al;
  }
  function filtrar(A, s) {
    var clave = s.puerta + '|' + s.origen + '|' + s.doc;
    if (A._fk !== clave) {
      var d = digitos(s.doc), full = d.length >= 5;
      A._fk = clave;
      A._fb = A.filas.filter(function (f) {
        return (!s.puerta || f.p === +s.puerta) && (s.origen === '' || f.o === +s.origen) && (!full || A.personas[f.k] === d);
      });
    }
    return A._fb;
  }
  function elegido(A, s) {
    for (var i = 0; i < A.filas.length; i++) { if (A.filas[i].id === s.sel) { return A.filas[i]; } }
    return A.filas[0];
  }
  function tag(t) { return '<span class="ev-aud-tag ev-aud-tag--' + t + '">' + esc(TIPO[t].label) + '</span>'; }
  function horaCelda(A, f) {
    var dd = Math.floor(f.m / 1440);
    return '<span class="ev-aud-hora pb-num">' + (dd ? '<span>' + esc(X.fechaDe(A, f.m).split(' · ')[0].replace(/ \d{4}$/, '')) + '</span>' : '') + X.hhmm(f.m) + '</span>';
  }

  /* ---------- Registros ---------- */

  function hero(A, s, e) {
    var desde = A.filas[A.filas.length - 1], meta = [
      '<span><b class="pb-num">' + fmt(A.filas.length) + '</b> registros</span>',
      '<span>Desde ' + esc(X.fechaDe(A, desde.m)) + '</span>',
      A.vivo ? '<span class="ev-aud-vivo">' + svg(I.vivo, 16) + 'En vivo · corte ' + X.hhmm(A.corte) + '</span>' : '<span>Cerrado ' + esc(X.fechaDe(A, A.corte)) + '</span>'
    ].join('');
    var exp = s.exp;
    return '<section class="pb-card ev-aud-hero" aria-label="Registro de auditoría">' +
      '<div class="ev-aud-hero__c"><div class="ev-aud-hero__t"><h2 class="pb-h2">Registro de auditoría</h2>' +
        '<p class="pb-sub">Cada venta, ingreso, alerta y consulta de ' + esc(e.nombre) + '. No se edita ni se borra.</p><p class="ev-aud-meta">' + meta + '</p></div>' +
        '<button type="button" class="pb-btn" data-acc="aud-exportar"' + (exp ? ' disabled aria-busy="true"' : '') + '>' + svg(exp ? I.girar : I.bajar) + (exp ? 'Preparando CSV' : 'Exportar CSV') + '</button></div>' +
      filtros(A, s) + '</section>';
  }

  function filtros(A, s) {
    var op = function (v, t, act) { return '<option value="' + esc(v) + '"' + (String(v) === String(act) ? ' selected' : '') + '>' + esc(t) + '</option>'; };
    var puertas = Object.keys(A.secDe).map(Number).sort(function (a, b) { return a - b; });
    var d = digitos(s.doc), docMal = d.length > 0 && d.length < 5, activos = s.puerta || s.origen !== '' || s.doc || s.tipo;
    return '<div class="ev-aud-filtros">' +
      '<label class="pb-campo">Puerta<select data-s="aud" data-k="puerta">' + op('', 'Todas', s.puerta) + puertas.map(function (p) { return op(p, puertaTxt(A, p), s.puerta); }).join('') + '</select></label>' +
      '<label class="pb-campo">Origen<select data-s="aud" data-k="origen">' + op('', 'Todos', s.origen) + X.ORIGENES.map(function (o, i) { return op(i, o, s.origen); }).join('') + '</select></label>' +
      '<label class="pb-campo">Documento<input type="text" inputmode="numeric" autocomplete="off" data-s="aud" data-k="doc" placeholder="Número completo" value="' + esc(s.doc) + '"' + (docMal ? ' aria-invalid="true" aria-describedby="ev-aud-doc"' : '') + '>' +
        (docMal ? '<span class="ev-aud-ayuda" id="ev-aud-doc">Escriba el número completo</span>' : '') + '</label>' +
      '<button type="button" class="pb-btn pb-btn--enlace ev-aud-limpiar" data-acc="aud-limpiar"' + (activos ? '' : ' disabled') + '>Limpiar filtros</button></div>';
  }

  function chips(A, s, base) {
    var n = {}; X.TIPOS.forEach(function (t) { n[t.id] = 0; });
    base.forEach(function (f) { n[f.t]++; });
    var todos = [{ id: '', label: 'Todos', n: base.length }].concat(X.TIPOS.map(function (t) { return { id: t.id, label: t.label, n: n[t.id] }; }));
    return '<div class="pb-chips ev-aud-chips" role="group" aria-label="Filtrar por resultado">' + todos.map(function (c) {
      return '<button type="button" class="pb-chip" aria-pressed="' + (s.tipo === c.id) + '" data-acc="aud-tipo" data-id="' + c.id + '"><span class="ev-aud-pt ev-aud-pt--' + (c.id || 'todos') + '"></span>' + esc(c.label) + '<span class="pb-chip__n">' + fmt(c.n) + '</span></button>';
    }).join('') + '</div>';
  }

  function tabla(A, s, filas) {
    var paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
    if (s.pag > paginas) { s.pag = paginas; }
    var ini = (s.pag - 1) * POR_PAGINA, pag = filas.slice(ini, ini + POR_PAGINA);
    var cuerpo = pag.length ? pag.map(function (f) {
      return '<button type="button" class="ev-aud-fila" aria-pressed="' + (f.id === s.sel) + '" data-acc="aud-fila" data-id="' + f.id + '">' +
        horaCelda(A, f) + '<span class="ev-aud-fila__tag">' + tag(f.t) + '</span>' +
        '<span class="ev-aud-fila__pu pb-cortar">' + esc(puertaTxt(A, f.p)) + '</span>' +
        '<span class="ev-aud-fila__doc pb-num">' + esc(X.doc(A, f.k)) + '</span>' +
        '<span class="ev-aud-fila__det"><span class="pb-cortar">' + esc(f.d) + '</span><span class="pb-sub pb-cortar">' + esc(f.q) + ' · ' + esc(origenTxt(f.o)) + '</span></span></button>';
    }).join('') : '<div class="pb-vacio ev-aud-vacio"><b>Ningún registro con estos filtros</b><span>Cambie la puerta, el origen o el documento.</span></div>';
    return '<section class="pb-tabla ev-aud-tabla" aria-label="Registros">' +
      '<div class="ev-aud-cols" aria-hidden="true"><span>Hora</span><span>Resultado</span><span>Puerta</span><span>Documento</span><span>Detalle · quién · origen</span></div>' +
      '<div class="ev-aud-lista">' + cuerpo + '</div>' +
      '<div class="ev-aud-pie"><span>' + (filas.length ? 'Mostrando ' + fmt(ini + 1) + '–' + fmt(ini + pag.length) + ' de ' + fmt(filas.length) : 'Sin registros') + '</span>' +
        '<span class="ev-aud-pie__pag">Página ' + fmt(s.pag) + ' de ' + fmt(paginas) + '</span>' +
        '<button type="button" class="pb-icon-btn" aria-label="Página anterior" data-acc="aud-pag" data-id="-1"' + (s.pag <= 1 ? ' disabled' : '') + '>' + svg(I.izq, 20) + '</button>' +
        '<button type="button" class="pb-icon-btn" aria-label="Página siguiente" data-acc="aud-pag" data-id="1"' + (s.pag >= paginas ? ' disabled' : '') + '>' + svg(I.der, 20) + '</button></div></section>';
  }

  function panel(A, s, ctx) {
    var f = elegido(A, s);
    if (!f) { return ''; }
    var mias = porPersona(A)[f.k] || [], hist = mias.slice(0, 12).reverse();
    var historia = hist.map(function (r) {
      var yo = r.id === f.id;
      return '<li class="ev-aud-hist' + (yo ? ' is-sel' : '') + '"' + (yo ? ' aria-current="true"' : '') + '><span class="ev-aud-pt ev-aud-pt--' + r.t + '"></span>' +
        '<span class="ev-aud-hist__h pb-num">' + X.hhmm(r.m) + '</span><span class="ev-aud-hist__t"><span>' + esc(r.d) + '</span><span class="pb-sub">' + esc(origenTxt(r.o)) + ' · ' + esc(r.q) + '</span></span></li>';
    }).join('');
    // Abrir el detalle también es consultar datos protegidos: queda en el registro con quien lo abre.
    var usuario = (ctx.D.backoffice.usuario || {}).nombre || 'Usted';
    var consultas = mias.filter(function (r) { return r.t === 'consulta' && r.id !== f.id; }).map(function (r) { return { q: r.q + ' · ' + r.d.toLowerCase(), c: X.hhmm(r.m) }; })
      .concat([{ q: usuario + ' (usted) · este detalle', c: 'ahora' }]);
    var dato = function (l, v) { return '<div class="pb-kv"><span class="pb-kv__k">' + l + '</span><span class="ev-aud-dato">' + esc(v) + '</span></div>'; };
    var titulo = f.d.split(' · '), t = titulo.length > 1 && TIPO[f.t].label.indexOf(titulo[0]) === 0 ? titulo.slice(1).join(' · ') : f.d;
    return '<aside class="pb-card ev-aud-det" aria-label="Detalle del registro" aria-live="polite" data-sc="aud-det">' +
      '<div class="ev-aud-det__cab"><div class="ev-aud-det__top">' + tag(f.t) + '<span class="pb-sub pb-num">Registro ' + esc(f.id) + '</span></div>' +
        '<h3 class="ev-aud-det__h">' + esc(t.charAt(0).toUpperCase() + t.slice(1)) + '</h3><p class="pb-sub pb-num">' + esc(X.doc(A, f.k)) + '</p>' +
        '<div class="pb-kvs">' + dato('Fecha y hora', X.fechaDe(A, f.m)) + dato('Puerta', puertaTxt(A, f.p)) + dato('Origen', origenTxt(f.o)) + dato('Quién', f.q) + '</div></div>' +
      '<div class="ev-aud-det__cuerpo"><section class="pb-sec"><h4 class="pb-h3">Historia del documento en el evento</h4><ol class="ev-aud-historia">' + historia + '</ol>' +
        (mias.length > 12 ? '<p class="pb-sub ev-aud-nota">Se muestran los 12 más recientes de ' + mias.length + '.</p>' : '') + '</section>' +
        '<section class="pb-sec"><h4 class="pb-h3">Quién consultó este registro</h4><ul class="ev-aud-consultas">' + consultas.map(function (q) {
          return '<li><span>' + esc(q.q) + '</span><span class="pb-sub pb-num">' + esc(q.c) + '</span></li>';
        }).join('') + '</ul></section></div>' +
      '<p class="ev-aud-det__pie">' + svg(I.candado, 16) + 'Registro inmutable. Esta consulta también queda registrada, con su usuario y la hora.</p></aside>';
  }

  function casos(A) {
    var c = function (acc, t) { return '<button type="button" class="ev-demo__op" data-acc="' + acc + '">' + esc(t) + '</button>'; };
    return '<p class="ev-aud-casos"><span>Para revisar:</span>' + c('aud-caso-medida', 'Historia de CC 71.894.447') + c('aud-caso-alerta', 'Alertas de seguridad') + c('aud-caso-venta', 'Ventas bloqueadas') + '</p>';
  }

  function renderRegistros(ctx) {
    var A = aud(ctx), s = est(ctx, A), base = filtrar(A, s);
    var filas = s.tipo ? base.filter(function (f) { return f.t === s.tipo; }) : base;
    return '<div class="ev-aud">' + hero(A, s, ctx.ev()) + chips(A, s, base) +
      '<div class="ev-aud-cuerpo">' + tabla(A, s, filas) + panel(A, s, ctx) + '</div>' + casos(A) + '</div>';
  }

  function clickRegistros(el, ev, ctx) {
    var A = aud(ctx), s = est(ctx, A), d = el.dataset;
    switch (d.acc) {
      case 'aud-tipo': s.tipo = d.id; s.pag = 1; return;
      case 'aud-pag': s.pag += +d.id; return;
      case 'aud-limpiar': s.tipo = ''; s.puerta = ''; s.origen = ''; s.doc = ''; s.pag = 1; return;
      case 'aud-fila':
        s.sel = d.id; ctx.repintar();
        // En pantallas angostas el detalle queda debajo de la tabla: se lleva a la vista.
        if (w.matchMedia && w.matchMedia('(max-width: 900px)').matches) { var p = ctx.raiz.querySelector('.ev-aud-det'); if (p) { p.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }
        return false;
      case 'aud-exportar':
        if (s.exp) { return false; }
        var n = (s.tipo ? filtrar(A, s).filter(function (f) { return f.t === s.tipo; }) : filtrar(A, s)).length;
        s.exp = true; ctx.repintar();
        // Simulado: no baja ningún archivo; en el producto la exportación la arma el servidor.
        setTimeout(function () { s.exp = false; ctx.repintar(); ctx.toast('CSV exportado', fmt(n) + ' registros. La exportación también queda en la auditoría'); }, 1200);
        return false;
      case 'aud-caso-medida': s.tipo = ''; s.puerta = ''; s.origen = ''; s.doc = A.personas[A.caso] || ''; s.pag = 1; s.sel = ((porPersona(A)[A.caso] || [])[0] || {}).id || s.sel; return;
      case 'aud-caso-alerta': s.tipo = 'policia'; s.puerta = ''; s.origen = ''; s.doc = ''; s.pag = 1; s.sel = (A.filas.filter(function (f) { return f.d.indexOf('Alerta cerrada') === 0; })[0] || {}).id || s.sel; return;
      case 'aud-caso-venta': s.tipo = 'venta'; s.puerta = ''; s.origen = ''; s.doc = ''; s.pag = 1; s.sel = (A.filas.filter(function (f) { return f.d.indexOf('Venta bloqueada') === 0; })[0] || {}).id || s.sel; return;
    }
    return false;
  }
  function campoRegistros(ev, ctx) {
    var t = ev.target, d = t.dataset;
    if (d.s !== 'aud') { return false; }
    var s = est(ctx, aud(ctx));
    s[d.k] = t.value; s.pag = 1;
  }

  /* ---------- Resumen ---------- */

  function renderResumen(ctx) {
    var A = aud(ctx), e = ctx.ev(), V = B.boletas ? B.boletas(ctx) : { con: 0 }, al = alertas(A), c = A.cuenta;
    var kpi = function (tipo, t, n, ayuda) {
      return '<button type="button" class="pb-card pbe-card ev-aud-kpi" data-acc="res-ir" data-id="' + tipo + '"><span class="pbe-card__s"><span class="ev-aud-pt ev-aud-pt--' + tipo + '"></span>' + t + '</span>' +
        '<span class="pbe-kpi"><b>' + fmt(n) + '</b></span><span class="pbe-ayuda">' + ayuda + '</span></button>';
    };
    var kpis = '<div class="ev-aud-kpis">' +
      kpi('verde', 'Entraron', A.entraron, pct(A.entraron, V.con) + ' de las boletas con titular' + (c.amarillo ? ' · ' + fmt(c.amarillo) + ' con aviso' : '')) +
      kpi('operativo', 'No entraron por boleta', c.operativo, 'Usada, falsa, de otro partido o de otro titular') +
      kpi('medida', 'No entraron por medida', c.medida, 'Medida vigente: alerta al PMU') +
      kpi('policia', 'Acciones de seguridad', al.n, 'Alertas atendidas, ' + (al.abiertas.length ? fmt(al.abiertas.length) + ' abiertas' : 'todas cerradas') + ' · ' + fmt(c.policia) + ' registros') +
      kpi('consulta', 'Consultas de perfil', c.consulta, 'Cada apertura de datos protegidos') + '</div>';

    // Ingresos por cada 15 minutos, de la apertura al último ingreso.
    var ini = A.apertura, fin = A.vivo ? A.corte : A.pitazo + 45, n = Math.max(1, Math.ceil((fin - ini) / 15)), cub = [];
    for (var i = 0; i < n; i++) { cub.push(0); }
    A.filas.forEach(function (f) { if ((f.t === 'verde' || f.t === 'amarillo') && f.m >= ini && f.m < fin) { cub[Math.floor((f.m - ini) / 15)]++; } });
    var max = Math.max.apply(null, cub) || 1, pico = cub.indexOf(max), kPit = Math.floor((A.pitazo - ini) / 15);
    var barras = cub.map(function (v, j) {
      return '<span class="ev-aud-barra' + (j === pico ? ' is-pico' : '') + (j === kPit ? ' is-pitazo' : '') + '" style="height:' + Math.max(2, Math.round(v / max * 100)) + '%" title="' + X.hhmm(ini + j * 15) + ' · ' + fmt(v) + ' ingresos"></span>';
    }).join('');
    var grafica = '<section class="pb-card ev-aud-graf" aria-label="Ingresos por cada 15 minutos"><div class="pb-card__cab"><h2 class="pb-h2">Ingresos por cada 15 minutos</h2>' +
      '<span class="pb-sub ev-aud-graf__n">Pico ' + X.hhmm(ini + pico * 15) + '–' + X.hhmm(ini + pico * 15 + 15) + ' · ' + fmt(max) + ' ingresos</span></div>' +
      '<div class="pb-card__cuerpo"><div class="ev-aud-barras" role="img" aria-label="Ingresos de ' + X.hhmm(ini) + ' a ' + X.hhmm(fin) + ', con el pico a las ' + X.hhmm(ini + pico * 15) + '">' + barras + '</div>' +
      '<div class="ev-aud-eje"><span>' + X.hhmm(ini) + ' · apertura</span><span>' + X.hhmm(A.pitazo) + ' · pitazo</span><span>' + X.hhmm(fin) + '</span></div></div></section>';

    var primera = A.filas[A.filas.length - 1], rojo = A.filas.filter(function (f) { return f.t === 'medida'; }).slice(-1)[0];
    var hitos = [
      ['venta', X.fechaDe(A, primera.m).replace(/ \d{4} · /, ', '), 'Primera venta registrada', e.pub || '', primera.m],
      ['verde', X.hhmm(A.apertura), 'Apertura de puertas', fmt(Object.keys(A.secDe).length) + ' puertas', A.apertura],
      rojo ? ['medida', X.hhmm(rojo.m), 'Primer rojo por medida', puertaTxt(A, rojo.p), rojo.m] : null,
      ['amarillo', X.hhmm(ini + pico * 15), 'Pico de ingreso', fmt(max) + ' ingresos en 15 minutos', ini + pico * 15],
      A.pitazo <= A.corte ? ['policia', X.hhmm(A.pitazo), 'Pitazo inicial', (e.partidos && e.partidos[0] ? e.partidos[0].local + ' vs. ' + e.partidos[0].visita : e.nombre), A.pitazo] : null,
      A.vivo ? ['consulta', X.hhmm(A.corte), 'Corte en vivo', al.abiertas.length ? fmt(al.abiertas.length) + ' alertas siguen abiertas' : 'Sin alertas abiertas', A.corte]
        : ['consulta', X.hhmm(A.corte), 'Cierre del registro', 'Desde aquí el evento solo se consulta', A.corte]
    ].filter(Boolean).sort(function (a, b) { return a[4] - b[4]; });
    var linea = '<section class="pb-card ev-aud-linea" aria-label="Línea de tiempo"><div class="pb-card__cab"><h2 class="pb-h2">Línea de tiempo</h2></div><ol class="ev-aud-hitos">' + hitos.map(function (h) {
      return '<li><span class="ev-aud-pt ev-aud-pt--' + h[0] + '"></span><span class="ev-aud-hitos__h pb-num">' + esc(h[1]) + '</span><span class="ev-aud-hitos__t"><b>' + esc(h[2]) + '</b><span class="pb-sub">' + esc(h[3]) + '</span></span></li>';
    }).join('') + '</ol></section>';

    var aviso = A.vivo
      ? '<div class="pb-aviso pb-aviso--alerta">' + svg(I.vivo) + '<span>Evento en curso: las cifras van al corte de las ' + X.hhmm(A.corte) + ' y salen del mismo registro de la pestaña Registros.</span></div>'
      : '<div class="pb-aviso">' + svg(I.candado) + '<span>Evento finalizado: solo lectura. Las cifras salen del registro de auditoría, que no se edita ni se borra.</span></div>';
    return '<div class="ev-aud">' + aviso + kpis + '<div class="ev-aud-dos">' + grafica + linea + '</div></div>';
  }

  /* ---------- Puertas (en vivo) ---------- */

  var DISP = { linea: ['ok', 'En línea'], sinred: ['alerta', 'Sin conexión'], paquete: ['alerta', 'Paquete incompleto'], libre: ['neutro', 'Sin asignar'] };
  function renderPuertas(ctx) {
    var A = aud(ctx), E = ctx.D.backoffice.escenario, pu = porPuerta(A), al = alertas(A);
    // Las señales de la maqueta van a las 16:08; acá se corren al corte del evento.
    var ref = 16 * 60 + 8, senal = function (h) { var p = h.split(':'); return X.hhmm(A.corte - (ref - (+p[0] * 60 + +p[1]))); };
    var abiertasDe = function (n) { return al.abiertas.filter(function (f) { return f.p === n; }).length; };
    var malas = 0, libres = E.dispositivos.filter(function (d) { return !d.puerta; }).map(function (d) { return { id: d.id, tipo: d.tipo, estado: 'linea', senal: d.senal }; });
    var tot = { ent: 0, no: 0, ab: 0 };
    var filas = E.puertas.slice().sort(function (a, b) { return a.n - b.n; }).map(function (p) {
      var ds = E.dispositivos.filter(function (d) { return d.puerta === p.n; }), c = pu[p.n] || { entraron: 0, boleta: 0, medida: 0 };
      // Una puerta sin equipo en el escenario base opera con el de reserva, como se resolvió en Listo para abrir.
      if (!ds.length && libres.length) { ds = [libres.shift()]; }
      var peor = ds.filter(function (d) { return d.estado === 'sinred'; })[0] || ds.filter(function (d) { return d.estado === 'paquete'; })[0];
      var chip = !ds.length ? ['neutro', 'Sin dispositivo'] : peor ? DISP[peor.estado] : DISP.linea;
      if (chip[0] !== 'ok') { malas++; }
      var ab = abiertasDe(p.n), no = c.boleta + c.medida;
      tot.ent += c.entraron; tot.no += no; tot.ab += ab;
      var equipos = ds.length ? ds.map(function (d) { return esc(d.id) + (d.estado === 'linea' ? '' : ' · ' + DISP[d.estado][1].toLowerCase()); }).join(' · ') + ' · señal ' + senal(ds[0].senal) : 'Sin dispositivo asignado';
      return '<div class="pb-fila ev-aud-pfila' + (chip[0] === 'alerta' ? ' ev-aud-pfila--w' : '') + '">' +
        '<span class="pbe-pu__id"><span class="pbe-pu__c">' + p.n + '</span><span class="pbe-pu__t"><b>Puerta ' + p.n + '</b><span>' + esc(nombreSector(A, p.sector)) + '</span></span></span>' +
        '<b class="pb-num">' + fmt(c.entraron) + '</b>' +
        '<span class="pb-num">' + fmt(no) + (c.medida ? '<span class="pb-sub"> · ' + c.medida + ' por medida</span>' : '') + '</span>' +
        '<span class="' + (ab ? 'is-mal' : 'pb-sub') + '">' + (ab ? ab + (ab === 1 ? ' abierta' : ' abiertas') : 'Ninguna') + '</span>' +
        '<span class="ev-aud-pequipo"><span class="pb-badge pb-badge--' + chip[0] + '">' + chip[1] + '</span><span class="pb-sub">' + equipos + '</span></span>' +
        '<button type="button" class="pb-btn pb-btn--enlace" data-acc="pue-ver" data-id="' + p.n + '">Ver registros</button></div>';
    }).join('');
    var kpi = function (t, v, ayuda, mal) { return '<div class="pb-card pbe-card' + (mal ? ' is-mal' : '') + '"><span class="pbe-card__s' + (mal ? ' is-mal' : '') + '">' + t + '</span><span class="pbe-kpi' + (mal ? ' is-mal' : '') + '"><b>' + v + '</b></span><span class="pbe-ayuda' + (mal ? ' is-mal' : '') + '">' + ayuda + '</span></div>'; };
    var top = '<div class="pb-aviso" role="status">' + svg(I.vivo) + '<span>' + E.puertas.length + ' puertas abiertas desde las ' + X.hhmm(A.apertura) + ' · corte ' + X.hhmm(A.corte) + '. Solo lectura: la operación se sigue desde el PMU.</span></div>';
    var kpis = '<div class="pbe-kpis">' + kpi('Entraron', fmt(tot.ent), 'Entre todas las puertas') + kpi('No entraron', fmt(tot.no), 'Sin boleta válida o por medida') +
      kpi('Alertas abiertas', fmt(tot.ab), tot.ab ? 'Se atienden desde el PMU' : 'Ninguna por atender', !!tot.ab) + kpi('Puertas con novedad', malas + ' de ' + E.puertas.length, malas ? 'Equipo sin conexión o paquete incompleto' : 'Todas en línea') + '</div>';
    var tabla = '<section class="pb-tabla ev-aud-ptabla" aria-label="Puertas" style="--pb-cols:minmax(0,1.1fr) 110px minmax(0,1.2fr) 120px minmax(0,2fr) 130px">' +
      '<div class="pb-cols"><span>Puerta</span><span>Entraron</span><span>No entraron</span><span>Alertas</span><span>Equipos</span><span></span></div>' + filas + '</section>';
    return '<div class="ev-aud pbe">' + top + kpis + tabla + '</div>';
  }

  /* ---------- Registro de vistas ---------- */

  function irRegistros(ctx, cambios) {
    var A = aud(ctx), s = est(ctx, A);
    s.tipo = ''; s.puerta = ''; s.origen = ''; s.doc = ''; s.pag = 1;
    Object.keys(cambios).forEach(function (k) { s[k] = cambios[k]; });
    ctx.ir('registros');
  }
  B.registrar('resumen', {
    label: 'Resumen', orden: 0.1, render: renderResumen,
    onClick: function (el, ev, ctx) { if (el.dataset.acc === 'res-ir') { irRegistros(ctx, { tipo: el.dataset.id }); } return false; }
  });
  B.registrar('puertas', {
    label: 'Puertas', orden: 0.2, render: renderPuertas,
    onClick: function (el, ev, ctx) { if (el.dataset.acc === 'pue-ver') { irRegistros(ctx, { puerta: el.dataset.id }); } return false; }
  });
  B.registrar('registros', {
    label: 'Registros', orden: 0.3, render: renderRegistros,
    onClick: clickRegistros, onInput: campoRegistros, onChange: campoRegistros
  });
})(window);
