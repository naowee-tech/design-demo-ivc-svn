/* Fase 0 del demo del IVC. API: window.Fase0.montar(contenedor, { alTerminar }) */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var contador = 0;
  // Fases en ms: 1 fuentes, 1.5 base, 2 plataforma, 3 despacho, 4 cierre. Cada etapa agrupa fases.
  var FASES = [[1, 0], [1.5, 2800], [2, 6600], [3, 12400], [4, 18200]];
  function tFase(f) { for (var i = 0; i < FASES.length; i++) if (FASES[i][0] === f) return FASES[i][1]; return 0; }
  var T_FIN = 18200;

  var ETAPAS = [
    { n: 'Integrar las fuentes',
      sub: 'Policía Nacional, Registraduría e informes de clubes suman sus datos a una base central del IVC.' },
    { n: 'El IVC construye su plataforma',
      sub: 'Sobre esa base nace la plataforma: búsqueda, gestión con historial y solicitudes de entidades.' },
    { n: 'Lista para conectarse con los demás',
      sub: 'El IVC queda como API y portal, y despacha a quien lo necesita.' }
  ];
  var TITULO_FINAL = 'Base central lista para conectarse';
  var SUB_FINAL = 'Fuentes integradas, plataforma construida y API disponible para quien la necesita.';

  var FUENTES = [
    { icono: 'escudo', t: ['Policía Nacional'], s: ['Medidas correctivas', 'en firme'],
      tc: ['Policía', 'Nacional'], sc: ['Medidas en firme'] },
    { icono: 'cedula', t: ['Registraduría', 'Nacional'], s: ['Verificación de identidad'],
      tc: ['Registraduría', 'Nacional'], sc: ['Identidad'] },
    { icono: 'informe', t: ['Informes de clubes'], s: ['Entidades deportivas:', 'incidentes de sus eventos'],
      tc: ['Informes', 'de clubes'], sc: ['Incidentes'] }
  ];

  // Los módulos que ya existen en el demo del IVC (menú del SUID).
  var MODULOS = [
    { icono: 'buscar', t: ['Búsqueda y', 'nuevos casos'], s: ['Consulta y registro', 'de medidas'],
      tc: ['Búsqueda y nuevos casos'], sc: ['Consulta y registro de medidas'] },
    { icono: 'historial', t: ['Gestión de sanciones'], s: ['Seguimiento de cada medida', 'con su historial'],
      tc: ['Gestión de sanciones'], sc: ['Seguimiento de cada medida, con historial'] },
    { icono: 'bandeja', t: ['Solicitudes'], s: ['Reportes y solicitudes', 'de las entidades'],
      tc: ['Solicitudes de entidades'], sc: ['Reportes y solicitudes de clubes'] }
  ];

  var CONSUMIDORES = [
    { icono: 'boleta', t: ['Comercializadoras'], s: ['Consulta ciega: sí o no', 'y código de motivo'],
      tc: ['Comercializadoras'], sc: ['Consulta ciega: sí o no y código de motivo'] },
    { icono: 'puerta', t: ['Puertas del SVN'], s: ['Semáforo de acceso con', 'el estado del momento'],
      tc: ['Puertas del SVN'], sc: ['Semáforo de acceso con el estado actual'] },
    { icono: 'monitor', t: ['Policía Nacional'], s: ['Monitor PMU: alertas rojas', 'con la puerta y la hora'],
      tc: ['Policía Nacional · PMU'], sc: ['Alertas rojas con la puerta y la hora'] },
    { icono: 'estadio', t: ['Entidades deportivas'], s: ['Medidas vigentes y estado', 'de sus reportes'],
      tc: ['Entidades deportivas'], sc: ['Medidas vigentes y estado de sus reportes'] }
  ];

  var DESCRIPCION = 'Diagrama en tres etapas: la Policía Nacional, la Registraduría Nacional y los informes de clubes ' +
    'se integran en la base central del IVC; sobre ella nacen la búsqueda, la gestión con historial y las solicitudes; ' +
    'y el IVC despacha a comercializadoras, puertas del SVN, la Policía Nacional y las entidades deportivas.';

  // Iconos de 24x24 con trazo; se escalan al tamaño de la insignia.
  var ICONOS = {
    escudo: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    cedula: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.7 2-2.5 3-2.5s2.5.8 3 2.5M14 10h4M14 13h4"/>',
    informe: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    boleta: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 6v2M10 11v2M10 16v2"/>',
    puerta: '<path d="M6 21V4h12v17M4 21h16"/><circle cx="15" cy="13" r=".8"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 7.5v4M12 13.5v.01"/>',
    estadio: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
    buscar: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    historial: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    bandeja: '<path d="M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5"/>',
    base: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>'
  };

  // Controles del recorrido: iconos de 24x24 que el CSS pinta con currentColor.
  function svgCtl(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>'; }
  var IC_ANT = svgCtl('<path d="M15 6l-6 6 6 6"/>');
  var IC_SIG = svgCtl('<path d="M9 6l6 6-6 6"/>');
  var IC_PAUSA = svgCtl('<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>');
  var IC_PLAY = svgCtl('<path d="M8 5.5v13l10.5-6.5z"/>');
  // Instante en que la escena ya muestra completa cada parada: etapa 1 (con la base), 2, 3 y el resumen.
  var PARADAS = [tFase(1.5), tFase(2), tFase(3), T_FIN];

  function el(tag, attrs, clase) {
    var n = document.createElementNS(NS, tag);
    if (clase) n.setAttribute('class', clase);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function r1(n) { return Math.round(n * 10) / 10; }

  // Polilínea con esquinas redondeadas: el bus de salida en vertical.
  function redondeada(pts, rad) {
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      var a = pts[i - 1], b = pts[i], c = pts[i + 1];
      var l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
      var r = Math.min(rad, l1 / 2, l2 / 2);
      var p1 = [b[0] - (b[0] - a[0]) / l1 * r, b[1] - (b[1] - a[1]) / l1 * r];
      var p2 = [b[0] + (c[0] - b[0]) / l2 * r, b[1] + (c[1] - b[1]) / l2 * r];
      d += ' L' + r1(p1[0]) + ',' + r1(p1[1]) + ' Q' + b[0] + ',' + b[1] + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
    }
    var u = pts[pts.length - 1];
    return d + ' L' + u[0] + ',' + u[1];
  }

  // Texto con varias líneas centrado en vertical alrededor de cy.
  function texto(g, x, cy, titulo, sub, tT, tS) {
    var lhT = tT * 1.2, lhS = tS * 1.35;
    var total = titulo.length * lhT + 4 + sub.length * lhS;
    var y = cy - total / 2;
    var t = el('text', { x: x, y: r1(y + lhT * 0.8), 'font-size': tT }, 'f0-t');
    titulo.forEach(function (l, i) {
      var s = el('tspan', { x: x, dy: i ? lhT : 0 }); s.textContent = l; t.appendChild(s);
    });
    g.appendChild(t);
    var s2 = el('text', { x: x, y: r1(y + titulo.length * lhT + 4 + lhS * 0.8), 'font-size': tS }, 'f0-s');
    sub.forEach(function (l, i) {
      var s = el('tspan', { x: x, dy: i ? lhS : 0 }); s.textContent = l; s2.appendChild(s);
    });
    g.appendChild(s2);
  }

  function icono(g, nombre, cx, cy, tam, clase) {
    var k = tam / 24;
    var i = el('g', { transform: 'translate(' + r1(cx - tam / 2) + ',' + r1(cy - tam / 2) + ') scale(' + r1(k * 100) / 100 + ')' }, 'f0-ico ' + clase);
    i.innerHTML = ICONOS[nombre];
    g.appendChild(i);
  }

  function tarjeta(capa, d, caja, ancho, entrada, desde, hasta, retraso) {
    var x = caja.x, y = caja.y, w = caja.w, h = caja.h;
    var wrap = el('g', {}, 'f0-tarjeta-g');
    var g = el('g', {}, 'f0-aparece');
    g.setAttribute('data-desde', desde); g.setAttribute('data-hasta', hasta);
    g.style.setProperty('--d', retraso + 's');
    g.appendChild(el('rect', { x: x, y: y, width: w, height: h, rx: 12 }, 'f0-tarjeta'));
    var cy = y + h / 2, cl = entrada ? 'in' : 'out';
    if (ancho) {
      g.appendChild(el('circle', { cx: x + 36, cy: cy, r: 22 }, 'f0-insignia-' + cl));
      icono(g, d.icono, x + 36, cy, 24, 'f0-ico--' + cl);
      texto(g, x + 70, cy, d.t, d.s, 15.5, 13);
    } else if (entrada === 'fuente') {
      g.appendChild(el('circle', { cx: x + w / 2, cy: y + 28, r: 19 }, 'f0-insignia-in'));
      icono(g, d.icono, x + w / 2, y + 28, 22, 'f0-ico--in');
      var tg = el('g', { 'text-anchor': 'middle' });
      texto(tg, x + w / 2, y + 79, d.tc, d.sc, 13, 11.5);
      g.appendChild(tg);
    } else {
      g.appendChild(el('circle', { cx: x + 28, cy: cy, r: 17 }, 'f0-insignia-' + cl));
      icono(g, d.icono, x + 28, cy, 20, 'f0-ico--' + cl);
      texto(g, x + 56, cy, d.tc, d.sc, 14, 12);
    }
    wrap.appendChild(g);
    capa.appendChild(wrap);
  }

  // Geometría de las dos disposiciones: ancha (3 | base | 4) y alta (3 / base / 4).
  function geometria(ancho, altoVB) {
    var G = { ancho: ancho, fuentes: [], consum: [], entra: [], sale: [], hub: null };
    var i;
    if (ancho) {
      G.vb = [1000, 480];
      var hub = { cx: 500, cy: 240, r: 84 }; G.hub = hub;
      var cys = [120, 240, 360];
      for (i = 0; i < 3; i++) {
        G.fuentes.push({ x: 20, y: cys[i] - 46, w: 262, h: 92 });
        var th = Math.PI + (1 - i) * 0.5;
        var px = hub.cx + hub.r * Math.cos(th), py = hub.cy + hub.r * Math.sin(th);
        var dx = (px - 282) / 2;
        G.entra.push('M282,' + cys[i] + ' C' + r1(282 + dx) + ',' + cys[i] + ' ' + r1(px - dx) + ',' + r1(py) + ' ' + r1(px) + ',' + r1(py));
      }
      for (i = 0; i < 4; i++) {
        var cy = 75 + i * 110;
        G.consum.push({ x: 718, y: cy - 46, w: 262, h: 92 });
        var t2 = (i - 1.5) * 0.42;
        var qx = hub.cx + hub.r * Math.cos(t2), qy = hub.cy + hub.r * Math.sin(t2);
        var dd = (718 - qx) / 2;
        G.sale.push('M' + r1(qx) + ',' + r1(qy) + ' C' + r1(qx + dd) + ',' + r1(qy) + ' ' + r1(718 - dd) + ',' + cy + ' 718,' + cy);
      }
    } else {
      var H = altoVB; G.vb = [400, H];
      var g = (H - 32 - 484) / 2;
      var hubTop = 16 + 108 + g;
      var hb = { cx: 200, cy: hubTop + 64, r: 64 }; G.hub = hb;
      var xs = [15, 141, 267];
      for (i = 0; i < 3; i++) {
        G.fuentes.push({ x: xs[i], y: 16, w: 118, h: 108 });
        var cx = xs[i] + 59, a = -Math.PI / 2 + (i - 1) * 0.55;
        var ex = hb.cx + hb.r * Math.cos(a), ey = hb.cy + hb.r * Math.sin(a);
        var my = (124 + ey) / 2;
        G.entra.push('M' + cx + ',124 C' + cx + ',' + r1(my) + ' ' + r1(ex) + ',' + r1(my) + ' ' + r1(ex) + ',' + r1(ey));
      }
      var base = hb.cy + hb.r, y0 = base + g, rail = Math.min(18, g / 2);
      for (i = 0; i < 4; i++) {
        var yc = y0 + i * 64;
        G.consum.push({ x: 52, y: yc, w: 336, h: 56 });
        G.sale.push(redondeada([[200, base], [200, base + rail], [28, base + rail], [28, yc + 28], [52, yc + 28]], 12));
      }
    }
    return G;
  }

  function montar(contenedor, opciones) {
    opciones = opciones || {};
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var estatico = mq.matches;

    var raiz = document.createElement('div');
    raiz.className = 'f0-root';
    raiz.setAttribute('role', 'region');
    raiz.setAttribute('aria-label', 'Integración de bases de datos del IVC, en tres etapas');
    var lis = ETAPAS.map(function (e, i) {
      return '<li class="f0-etapa"><span class="f0-etapa-n" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="f0-etapa-t"><span class="f0-etapa-k">Etapa ' + (i + 1) + '</span>' + e.n + '</span></li>';
    }).join('');
    raiz.innerHTML =
      '<div class="f0-barra" role="progressbar" aria-label="Avance de las etapas" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><i></i></div>' +
      '<ol class="f0-etapas">' + lis + '</ol>' +
      '<div class="f0-escena"></div>' +
      '<div class="f0-pie" aria-live="polite" aria-atomic="true">' +
      '<p class="f0-etiqueta"></p><h2 class="f0-titulo" hidden></h2><p class="f0-sub"></p></div>' +
      // Los controles viven fuera de .f0-botones: aplicarAcciones lo vacía y se llevaría el foco.
      '<div class="f0-acciones"><div class="f0-controles" role="group" aria-label="Control del recorrido">' +
      '<button type="button" class="f0-ctl f0-ctl--ant" aria-keyshortcuts="ArrowLeft" title="Atajo: ←">' + IC_ANT + '<span>Anterior</span></button>' +
      '<button type="button" class="f0-ctl f0-ctl--pausa" aria-keyshortcuts="Space" title="Atajo: Espacio"></button>' +
      '<button type="button" class="f0-ctl f0-ctl--sig" aria-keyshortcuts="ArrowRight" title="Atajo: →"><span>Siguiente</span>' + IC_SIG + '</button>' +
      '<span class="f0-sr" role="status"></span></div><div class="f0-botones"></div></div>';
    contenedor.appendChild(raiz);

    var q = function (s) { return raiz.querySelector(s); };
    var barra = q('.f0-barra'), relleno = q('.f0-barra > i'), items = raiz.querySelectorAll('.f0-etapa');
    var escena = q('.f0-escena'), etiqueta = q('.f0-etiqueta'), titulo = q('.f0-titulo');
    var sub = q('.f0-sub'), acciones = q('.f0-acciones'), botones = q('.f0-botones');
    var ant = q('.f0-ctl--ant'), pausa = q('.f0-ctl--pausa'), sig = q('.f0-ctl--sig'), estado = q('.f0-sr');

    var t = 0, fase = 0, pasoEst = 1, raf = 0, ultimo = 0, avisado = false, activo = true, pausado = false;
    var svg = null, flujos = [], disposicion = '', ro = null, textoPrevio = '';

    function construir() {
      var w = escena.clientWidth, h = escena.clientHeight;
      if (!w || !h) return;
      var ancho = w / h >= 1.15;
      var altoVB = Math.max(604, Math.min(760, Math.round(400 * h / w / 8) * 8));
      var clave = ancho ? 'a' : 'b' + altoVB;
      if (clave === disposicion) return;
      disposicion = clave;
      var G = geometria(ancho, altoVB);
      escena.textContent = '';
      svg = el('svg', { viewBox: '0 0 ' + G.vb[0] + ' ' + G.vb[1], preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': DESCRIPCION }, 'f0-svg');
      var capaL = el('g', {}), capaP = el('g', { 'aria-hidden': 'true' }), capaN = el('g', {});
      svg.appendChild(capaL); svg.appendChild(capaN); svg.appendChild(capaP);
      flujos = [];

      function enlace(d, dir, desde, hasta, retraso, particulas) {
        var p = el('path', { d: d, pathLength: 1 }, 'f0-enlace f0-enlace--' + dir);
        p.setAttribute('data-desde', desde); p.setAttribute('data-hasta', hasta); p.style.setProperty('--d', retraso + 's');
        capaL.appendChild(p);
        var f = { p: p, desde: desde, ps: [], len: 0 };
        try {
          f.len = p.getTotalLength();
          var e = p.getPointAtLength(f.len), a = p.getPointAtLength(f.len - 4);
          var ang = Math.atan2(e.y - a.y, e.x - a.x) * 180 / Math.PI;
          var fl = el('path', { d: 'M0,0 L-10,-5.5 L-10,5.5 Z', transform: 'translate(' + r1(e.x) + ',' + r1(e.y) + ') rotate(' + r1(ang) + ')' }, 'f0-flecha f0-flecha--' + dir);
          fl.setAttribute('data-desde', desde); fl.setAttribute('data-hasta', hasta); fl.style.setProperty('--d', retraso + 's');
          capaL.appendChild(fl);
        } catch (x) { /* sin geometría todavía: se omite la flecha */ }
        for (var k = 0; k < (particulas ? 4 : 0); k++) {
          var c = el('circle', { r: 4, cx: -20, cy: -20 }, 'f0-particula--' + dir);
          capaP.appendChild(c); f.ps.push(c);
        }
        flujos.push(f);
      }
      G.entra.forEach(function (d, i) { enlace(d, 'in', 1.5, 99, 0.25 * i, true); });
      G.sale.slice(0, 3).forEach(function (d, i) { enlace(d, 'mod', 2, 3, 0.25 * i, false); });
      G.sale.forEach(function (d, i) { enlace(d, 'out', 3, 99, 0.2 * i, true); });

      FUENTES.forEach(function (f, i) { tarjeta(capaN, f, G.fuentes[i], G.ancho, 'fuente', 1, 99, 0.5 * i); });
      MODULOS.forEach(function (m, i) { tarjeta(capaN, m, G.consum[i], G.ancho, 'in', 2, 3, 0.5 + 0.25 * i); });
      CONSUMIDORES.forEach(function (c, i) { tarjeta(capaN, c, G.consum[i], G.ancho, false, 3, 99, 0.45 + 0.22 * i); });

      var H = G.hub, hub = el('g', {}, 'f0-hub f0-aparece');
      hub.setAttribute('data-desde', 1.5); hub.setAttribute('data-hasta', 99); hub.style.setProperty('--d', '0s');
      hub.appendChild(el('circle', { cx: H.cx, cy: H.cy, r: H.r }, 'f0-onda'));
      hub.appendChild(el('circle', { cx: H.cx, cy: H.cy, r: H.r }, 'f0-onda'));
      hub.appendChild(el('circle', { cx: H.cx, cy: H.cy, r: H.r }, 'f0-hub-disco'));
      var big = G.ancho;
      icono(hub, 'base', H.cx, H.cy - (big ? 34 : 29), big ? 40 : 30, 'f0-ico--hub');
      var tt = el('text', { x: H.cx, y: H.cy + (big ? 14 : 8), 'text-anchor': 'middle', 'font-size': big ? 18 : 14.5 }, 'f0-hub-t');
      ['Base central', 'del IVC'].forEach(function (l, i) {
        var s = el('tspan', { x: H.cx, dy: i ? (big ? 21 : 17) : 0 }); s.textContent = l; tt.appendChild(s);
      });
      hub.appendChild(tt);
      [[big ? 'Medidas correctivas' : 'Medidas', 1.5, 2], [big ? 'Plataforma del IVC' : 'Plataforma', 2, 3], ['API y portal', 3, 99]].forEach(function (x) {
        var ss = el('text', { x: H.cx, y: H.cy + (big ? 56 : 49), 'text-anchor': 'middle', 'font-size': big ? 12.5 : 11.5 }, 'f0-hub-s f0-fade');
        ss.setAttribute('data-desde', x[1]); ss.setAttribute('data-hasta', x[2]); ss.textContent = x[0]; hub.appendChild(ss);
      });
      capaN.appendChild(hub);
      escena.appendChild(svg);
      marcar();
      if (!estatico) mover(); // con la pausa puesta nadie más repone las partículas del SVG nuevo
    }

    function marcar() {
      var nodos = raiz.querySelectorAll('[data-desde]');
      for (var i = 0; i < nodos.length; i++) {
        var d = Number(nodos[i].getAttribute('data-desde')), h = Number(nodos[i].getAttribute('data-hasta'));
        nodos[i].classList.toggle('f0-on', fase >= d && fase < h);
      }
    }

    function etapaDe(f) { return f >= 4 ? 4 : Math.max(1, Math.floor(f)); }

    function boton(txt, clase, alClick, href) {
      var b = document.createElement(href ? 'a' : 'button');
      if (href) b.href = href; else b.type = 'button';
      b.className = 'f0-btn ' + clase; b.textContent = txt;
      if (alClick) b.addEventListener('click', alClick);
      return b;
    }

    function aplicarAcciones(final) {
      botones.textContent = '';
      if (final) {
        var lista = opciones.acciones && opciones.acciones.length ? opciones.acciones : [{ texto: 'Continuar', primario: true }];
        lista.forEach(function (a) {
          botones.appendChild(boton(a.texto, a.primario ? 'f0-btn--primario' : '', a.alClick, a.href));
        });
        return;
      }
      var om = boton('Omitir', 'f0-omitir', finalizar);
      om.setAttribute('aria-keyshortcuts', 'Escape');
      om.insertAdjacentHTML('beforeend', '<kbd aria-hidden="true">Esc</kbd>');
      botones.appendChild(om);
    }

    // Paradas navegables: etapas 1 a 3 y el resumen (en modo estático el resumen comparte la última).
    function paradaActual() { return estatico ? (fase >= 4 ? 2 : pasoEst - 1) : (fase >= 4 ? 3 : etapaDe(fase) - 1); }
    function totalParadas() { return estatico ? 3 : 4; }
    function nombreParada(i) { return i < 3 ? ETAPAS[i].n : 'resumen'; }

    function pintarControles() {
      var i = paradaActual(), n = totalParadas(), antes = document.activeElement;
      ant.disabled = i <= 0; sig.disabled = i >= n - 1;
      ant.setAttribute('aria-label', 'Etapa anterior' + (i > 0 ? ': ' + nombreParada(i - 1) : ''));
      sig.setAttribute('aria-label', 'Etapa siguiente' + (i < n - 1 ? ': ' + nombreParada(i + 1) : ''));
      pausa.hidden = estatico;
      pausa.setAttribute('aria-label', pausado ? 'Reanudar el avance automático' : 'Pausar el avance automático');
      pausa.innerHTML = (pausado ? IC_PLAY : IC_PAUSA) + '<span>' + (pausado ? 'Reanudar' : 'Pausar') + '</span>';
      raiz.classList.toggle('f0-manual', estatico);
      // Un botón deshabilitado con foco lo manda al body: se pasa a un vecino que siga activo.
      if ((antes === ant && ant.disabled) || (antes === sig && sig.disabled)) {
        (pausa.hidden ? (antes === ant ? sig : ant) : pausa).focus();
      }
    }

    // En modo estático la etapa 3 ya ofrece los botones finales: no hay cuarto paso.
    function aplicarFase(f) {
      var previa = fase, e = etapaDe(f), final = f >= 4 || (estatico && pasoEst >= 3);
      fase = f; marcar();
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('f0-hecha', i + 1 < e || f >= 4);
        items[i].classList.toggle('f0-actual', i + 1 === e && f < 4);
        if (i + 1 === e && f < 4) items[i].setAttribute('aria-current', 'step'); else items[i].removeAttribute('aria-current');
      }
      barra.setAttribute('aria-valuenow', String(f >= 4 ? 3 : e));
      var txt = f >= 4 ? SUB_FINAL : ETAPAS[Math.min(e, 3) - 1].sub;
      var etq = f >= 4 ? 'Resumen' : 'Etapa ' + e + ' de 3 · ' + ETAPAS[e - 1].n;
      if (txt !== textoPrevio) {
        textoPrevio = txt; sub.textContent = txt; etiqueta.textContent = etq;
        titulo.hidden = f < 4; titulo.textContent = f >= 4 ? TITULO_FINAL : '';
        [sub, titulo].forEach(function (n2) { n2.classList.remove('f0-cambia'); void n2.offsetWidth; n2.classList.add('f0-cambia'); });
      }
      if (previa < 0 || final !== (acciones.dataset.final === '1')) { acciones.dataset.final = final ? '1' : '0'; aplicarAcciones(final); }
      if (estatico) relleno.style.transform = 'scaleX(' + Math.min(1, e / 3) + ')';
      pintarControles();
    }

    function faseDeTiempo() {
      var f = 1;
      for (var i = 0; i < FASES.length; i++) if (t >= FASES[i][1]) f = FASES[i][0];
      return f;
    }

    function mover() {
      for (var i = 0; i < flujos.length; i++) {
        var f = flujos[i], ini = tFase(f.desde) + 900;
        for (var k = 0; k < f.ps.length; k++) {
          var c = f.ps[k];
          if (t < ini || !f.len) { c.setAttribute('opacity', 0); continue; }
          var u = (((t - ini) / 2400) + k / f.ps.length) % 1;
          var pt = f.p.getPointAtLength(u * f.len);
          c.setAttribute('cx', r1(pt.x)); c.setAttribute('cy', r1(pt.y));
          c.setAttribute('opacity', Math.min(1, u * 8, (1 - u) * 8).toFixed(2));
        }
      }
    }

    function avisar() {
      if (avisado) return;
      avisado = true;
      if (typeof opciones.alTerminar === 'function') opciones.alTerminar();
    }

    // Pinta el instante t: se usa en cada cuadro y tras un salto, también con la pausa puesta.
    function sincronizar() {
      var f = faseDeTiempo();
      if (f !== fase) { aplicarFase(f); if (f >= 4) avisar(); }
      relleno.style.transform = 'scaleX(' + Math.min(1, t / T_FIN).toFixed(4) + ')';
      mover();
    }

    function cuadro(ts) {
      if (!activo || pausado) return;
      raf = requestAnimationFrame(cuadro);
      var dt = ultimo ? Math.min(ts - ultimo, 100) : 0;
      ultimo = ts; t += dt;
      sincronizar();
    }

    // Va a una parada sin cambiar el estado de pausa; en modo estático no hay reloj que mover.
    function irA(i) {
      if (!activo) return;
      i = Math.max(0, Math.min(totalParadas() - 1, i));
      if (estatico) { pasoEst = i + 1; aplicarFase(pasoEst === 1 ? 1.5 : pasoEst === 2 ? 2 : 3); }
      else { t = PARADAS[i]; sincronizar(); }
      if (i === totalParadas() - 1) avisar();
    }

    // Reanudar rearma ultimo para que el primer cuadro no sume el tiempo detenido.
    function ponerPausa(v) {
      if (!activo || estatico || v === pausado) return;
      pausado = v;
      cancelAnimationFrame(raf); raf = 0;
      if (!v) { ultimo = 0; raf = requestAnimationFrame(cuadro); }
      raiz.classList.toggle('f0-pausada', v);
      estado.textContent = v ? 'Animación en pausa' : 'Animación en marcha';
      pintarControles();
    }

    function arrancar() {
      cancelAnimationFrame(raf); raf = 0; ultimo = 0; t = 0; fase = -1; pasoEst = 1; avisado = false; textoPrevio = '';
      pausado = false; raiz.classList.remove('f0-pausada'); estado.textContent = '';
      acciones.dataset.final = ''; disposicion = ''; construir();
      if (estatico) { aplicarFase(1.5); return; }
      aplicarFase(1); raf = requestAnimationFrame(cuadro);
    }

    // Omitir lleva al resumen sin parar el reloj: Anterior desde ahí tiene que poder seguir.
    function finalizar() {
      if (!activo) return;
      if (fase < 4) { t = T_FIN; pasoEst = 3; aplicarFase(4); relleno.style.transform = 'scaleX(1)'; if (!estatico) mover(); }
      avisar();
    }

    function alTeclear(e) {
      if (!activo) return;
      if (e.key === 'Escape') { e.preventDefault(); finalizar(); return; }
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      var obj = e.target, propio = obj && obj.closest && obj.closest('button, a, input, select, textarea, [contenteditable]');
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (obj && obj.closest && obj.closest('input, select, textarea, [contenteditable]')) return;
        e.preventDefault(); irA(paradaActual() + (e.key === 'ArrowRight' ? 1 : -1));
      } else if (e.key === ' ' && !propio && !estatico) {
        e.preventDefault(); ponerPausa(!pausado);
      }
    }
    function alCambiarMovimiento() { estatico = mq.matches; arrancar(); }

    document.addEventListener('keydown', alTeclear);
    if (mq.addEventListener) mq.addEventListener('change', alCambiarMovimiento);
    if (window.ResizeObserver) { ro = new ResizeObserver(construir); ro.observe(escena); }
    else window.addEventListener('resize', construir);

    arrancar();

    ant.addEventListener('click', function () { irA(paradaActual() - 1); });
    sig.addEventListener('click', function () { irA(paradaActual() + 1); });
    pausa.addEventListener('click', function () { ponerPausa(!pausado); });

    return {
      saltar: finalizar,
      pausar: function () { ponerPausa(true); },
      reanudar: function () { ponerPausa(false); },
      reiniciar: function () { if (activo) arrancar(); },
      destruir: function () {
        activo = false; cancelAnimationFrame(raf);
        document.removeEventListener('keydown', alTeclear);
        if (mq.removeEventListener) mq.removeEventListener('change', alCambiarMovimiento);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', construir);
        if (raiz.parentNode) raiz.parentNode.removeChild(raiz);
      }
    };
  }

  window.Fase0 = { montar: montar };
})();
