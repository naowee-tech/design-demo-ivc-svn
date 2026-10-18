/* Fase 0 del demo del IVC. API: window.Fase0.montar(contenedor, { alTerminar }) */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  // Fases en ms: 1 fuentes, 1.5 base, 2 plataforma, 3 despacho, 4 cierre. Cada etapa agrupa fases.
  var FASES = [[1, 0], [1.5, 2800], [2, 6600], [3, 12400], [4, 18200]];
  function tFase(f) { for (var i = 0; i < FASES.length; i++) if (FASES[i][0] === f) return FASES[i][1]; return 0; }
  var T_FIN = 18200;

  var ETAPAS = [
    { n: 'Integrar las fuentes',
      sub: 'Autoridad de seguridad, Registraduría e informes de clubes suman sus datos a una base central del IVC.' },
    { n: 'El IVC construye su plataforma',
      sub: 'Sobre esa base nace la plataforma: gestión de sanciones con historial y búsqueda cruzada, centralización de eventos e ingresos y auditoría.' },
    { n: 'Lista para conectarse con los demás',
      sub: 'La base queda lista: la API de validación del SVN la expone y, a través de ella, se conectan los demás.' }
  ];
  var TITULO_FINAL = 'Base central lista para conectarse';
  var SUB_FINAL = 'Fuentes integradas, plataforma construida y API de validación para quien se conecte.';

  var FUENTES = [
    { icono: 'escudo', t: ['Autoridad de seguridad'], s: ['Medidas correctivas', 'en firme'],
      tc: ['Autoridad', 'de seguridad'], sc: ['Medidas en firme'] },
    { icono: 'cedula', t: ['Registraduría Nacional'], s: ['Verificación de identidad'],
      tc: ['Registraduría', 'Nacional'], sc: ['Identidad'] },
    { icono: 'informe', t: ['Informes de clubes'], s: ['Entidades deportivas:', 'incidentes de sus eventos'],
      tc: ['Informes', 'de clubes'], sc: ['Incidentes'] }
  ];

  // Los módulos de la plataforma, en el orden en que se construyen (DC-029): la búsqueda cruzada vive dentro de la gestión.
  var MODULOS = [
    { icono: 'historial', t: ['Gestión de sanciones'], s: ['Historial y búsqueda', 'de cada medida'],
      tc: ['Gestión de sanciones'], sc: ['Historial y búsqueda de cada medida'] },
    { icono: 'bandeja', t: ['Centralización de', 'eventos e ingresos'], s: ['Escenarios y boletería'],
      tc: ['Centralización de', 'eventos e ingresos'], sc: ['Escenarios y boletería'] },
    { icono: 'auditoria', t: ['Auditoría'], s: ['Trazabilidad de cada', 'acción y de quién la hizo'],
      tc: ['Auditoría'], sc: ['Trazabilidad de cada acción'] }
  ];

  // Quienes se conectan (DC-028): la base alimenta la API de validación (`clave`, puerta de entrada) y de ella salen sus cuatro hijas (DC-145).
  var CONSUMIDORES = [
    { icono: 'puerta', clave: true, t: ['API de validación'], s: ['Responde al instante', 'a las puertas del SVN'],
      tc: ['API de validación del SVN'], sc: ['Puertas del SVN: responde al instante'] },
    { icono: 'boleta', t: ['Comercializadoras'], s: ['Consulta ciega: sí o no', 'y código de motivo'],
      tc: ['Comercializadoras'], sc: ['Consulta ciega: sí o no y código de motivo'] },
    { icono: 'monitor', t: ['Autoridad de seguridad'], s: ['Monitor PMU: alertas', 'rojas en vivo'],
      tc: ['Autoridad de seguridad · PMU'], sc: ['Alertas rojas con la puerta y la hora'] },
    { icono: 'estadio', t: ['Entidades deportivas'], s: ['Medidas vigentes y', 'estado de reportes'],
      tc: ['Entidades deportivas'], sc: ['Medidas vigentes y estado de sus reportes'] },
    { icono: 'acceso', t: ['Control de ingreso'], s: ['Acceso al estadio con o', 'sin conexión'],
      tc: ['Control de ingreso'], sc: ['Acceso al estadio con o sin conexión'] }
  ];

  var DESCRIPCION = 'Diagrama en tres etapas: la autoridad de seguridad, la Registraduría Nacional y los informes de clubes ' +
    'se integran en la base central del IVC; sobre ella nacen la gestión de sanciones con historial y búsqueda cruzada, la centralización de eventos e ingresos y la auditoría; ' +
    'y de los módulos se desprende la API de validación del SVN, las puertas del SVN, de la que salen comercializadoras, la autoridad de seguridad, las entidades deportivas y el control de ingreso al estadio, con o sin conexión.';

  // Iconos de 24x24 con trazo; se escalan al tamaño de la insignia.
  var ICONOS = {
    escudo: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    cedula: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.7 2-2.5 3-2.5s2.5.8 3 2.5M14 10h4M14 13h4"/>',
    informe: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    boleta: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 6v2M10 11v2M10 16v2"/>',
    puerta: '<path d="M6 21V4h12v17M4 21h16"/><circle cx="15" cy="13" r=".8"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 7.5v4M12 13.5v.01"/>',
    acceso: '<path d="M5 21h14M12 21v-9"/><circle cx="12" cy="9.5" r="1.5"/><path d="M12 8V3M10.7 10.3L6 13M13.3 10.3L18 13"/>',
    estadio: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
    auditoria: '<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 12h5"/><circle cx="11.5" cy="16" r="2"/><path d="M13 17.5l2 2"/>',
    historial: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    bandeja: '<path d="M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5"/>',
    base: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>'
  };

  // Controles del recorrido: iconos de 24x24 que el CSS pinta con currentColor.
  function svgCtl(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>'; }
  var IC_ANT = svgCtl('<path d="M15 6l-6 6 6 6"/>');
  var IC_SIG = svgCtl('<path d="M9 6l6 6-6 6"/>');
  var IC_PAUSA = svgCtl('<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>');
  var IC_PLIEGA = svgCtl('<path d="M6 9l6 6 6-6"/>');
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

  // estilo: 'grande' (ancha), 'fila' (consumidor en la rama de abajo), 'fuente' (columna) o 'compacta' (apilada).
  function tarjeta(capa, d, caja, estilo, cl, desde, hasta, retraso, flota) {
    var x = caja.x, y = caja.y, w = caja.w, h = caja.h;
    var wrap = el('g', {}, 'f0-tarjeta-g' + (flota ? ' f0-flota' : ''));
    if (flota) {
      wrap.style.setProperty('--fx', flota[0] + 'px'); wrap.style.setProperty('--fy', flota[1] + 'px');
      wrap.style.setProperty('--fd', flota[2] + 's'); wrap.style.setProperty('--sc', flota[3]); wrap.style.setProperty('--ox', flota[4] + 'px'); wrap.style.setProperty('--oy', flota[5] + 'px');
    }
    var g = el('g', {}, 'f0-aparece');
    g.setAttribute('data-desde', desde); g.setAttribute('data-hasta', hasta);
    g.style.setProperty('--d', retraso + 's');
    g.appendChild(el('rect', { x: x, y: y, width: w, height: h, rx: 12 }, 'f0-tarjeta' + (d.clave ? ' f0-tarjeta--clave' : '')));
    var cy = y + h / 2;
    if (estilo === 'grande') {
      g.appendChild(el('circle', { cx: x + 36, cy: cy, r: 22 }, 'f0-insignia-' + cl));
      icono(g, d.icono, x + 36, cy, 24, 'f0-ico--' + cl);
      texto(g, x + 70, cy, d.t, d.s, 15.5, 13);
    } else if (estilo === 'fila') {
      g.appendChild(el('circle', { cx: x + 32, cy: cy, r: 19 }, 'f0-insignia-' + cl));
      icono(g, d.icono, x + 32, cy, 22, 'f0-ico--' + cl);
      texto(g, x + 62, cy, d.t, d.s, 14.5, 12.5);
    } else if (estilo === 'fuente') {
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

  // Geometría: fuentes a la izquierda, base al centro, módulos a la derecha; a la derecha de los módulos, la API de validación y, más allá, sus tres consumidores en columna.
  function geometria(ancho) {
    var G = { ancho: ancho, fuentes: [], mods: [], consum: [], entra: [], mod: [], sale: [], api: [], hub: null };
    var i;
    if (ancho) {
      var hub = { cx: 500, cy: 240, r: 84 }; G.hub = hub;
      // Encuadre por fase: solo lo que ya se ve, con el mismo margen a ambos lados; en la 3 entra todo.
      var y0 = hub.cy - 189, alto = 378;
      // DC-148: la etapa 1 usa la escala de la 2, así las fuentes no se ven más grandes al iniciar.
      // Con la base (1.5) el mismo ancho se centra en fuentes + disco (x 20 a 584).
      G.cuadros = { 1: [-20, y0, 1040, alto], 1.5: [-218, y0, 1040, alto], 2: [-20, y0, 1040, alto], 3: [0, y0, 1660, alto] };
      var cys = [120, 240, 360];
      for (i = 0; i < 3; i++) {
        G.fuentes.push({ x: 20, y: cys[i] - 46, w: 262, h: 92 });
        var th = Math.PI + (1 - i) * 0.5;
        var px = hub.cx + hub.r * Math.cos(th), py = hub.cy + hub.r * Math.sin(th);
        var dx = (px - 282) / 2;
        G.entra.push('M282,' + cys[i] + ' C' + r1(282 + dx) + ',' + cys[i] + ' ' + r1(px - dx) + ',' + r1(py) + ' ' + r1(px) + ',' + r1(py));
        G.mods.push({ x: 718, y: cys[i] - 46, w: 262, h: 92 });
        var t2 = (i - 1) * 0.5;
        var qx = hub.cx + hub.r * Math.cos(t2), qy = hub.cy + hub.r * Math.sin(t2);
        var dd = (718 - qx) / 2;
        G.mod.push('M' + r1(qx) + ',' + r1(qy) + ' C' + r1(qx + dd) + ',' + r1(qy) + ' ' + r1(718 - dd) + ',' + cys[i] + ' 718,' + cys[i]);
      }
      // De los tres módulos se desprende la API (enlaces a su izquierda) y sus hijas salen a la derecha, en columna.
      G.api = [];
      G.consum.push({ x: 1060, y: 202, w: 240, h: 76 }); // DC-097: caja más corta; DC-113: ancho del texto
      for (i = 0; i < 3; i++) {
        var ay = 240 + (i - 1) * 14, da = 40;
        G.api.push('M980,' + cys[i] + ' C' + (980 + da) + ',' + cys[i] + ' ' + (1060 - da) + ',' + ay + ' 1060,' + ay);
      }
      // DC-145: cuatro hijas con paso de 90 y alto 76, simétricas respecto a la API (cy 240).
      for (i = 0; i < 4; i++) {
        var ch = 240 + (i - 1.5) * 90;
        G.consum.push({ x: 1380, y: ch - 38, w: 260, h: 76 });
        G.sale.push('M1300,240 C1340,240 1340,' + ch + ' 1380,' + ch);
      }
    } else {
      var g = 28, hb = { cx: 200, cy: 16 + 108 + g + 64, r: 64 }; G.hub = hb;
      var xs = [15, 141, 267];
      for (i = 0; i < 3; i++) {
        G.fuentes.push({ x: xs[i], y: 16, w: 118, h: 108 });
        var cx2 = xs[i] + 59, a2 = -Math.PI / 2 + (i - 1) * 0.55;
        var ex2 = hb.cx + hb.r * Math.cos(a2), ey2 = hb.cy + hb.r * Math.sin(a2);
        var my2 = (124 + ey2) / 2;
        G.entra.push('M' + cx2 + ',124 C' + cx2 + ',' + r1(my2) + ' ' + r1(ex2) + ',' + r1(my2) + ' ' + r1(ex2) + ',' + r1(ey2));
      }
      // Módulos con el riel a la izquierda y consumidores con el riel a la derecha: dos ramas desde la misma base.
      var base = hb.cy + hb.r, y0 = base + g, rail = Math.min(18, g / 2), y1 = y0 + 3 * 64 + g - 8;
      for (i = 0; i < 3; i++) {
        var ym = y0 + i * 64;
        G.mods.push({ x: 52, y: ym, w: 300, h: 56 });
        G.mod.push(redondeada([[200, base], [200, base + rail], [28, base + rail], [28, ym + 28], [52, ym + 28]], 12));
      }
      // Puertas del SVN recibe de la base por el riel derecho; las hermanas salen de ella por un riel a su izquierda.
      for (i = 0; i < 5; i++) {
        var yc = y1 + i * 64;
        G.consum.push({ x: i ? 92 : 52, y: yc, w: i ? 260 : 300, h: 56 });
        G.sale.push(i ? redondeada([[72, y1 + 56], [72, yc + 28], [92, yc + 28]], 10)
          : redondeada([[200, base], [200, base + rail], [376, base + rail], [376, yc + 28], [352, yc + 28]], 12));
      }
      var vbB = [0, 0, 400, y1 + 5 * 64 - 8 + 16];
      G.cuadros = { 1: vbB, 1.5: vbB, 2: vbB, 3: vbB };
    }
    // La escena toma el alto que pide el encuadre más alto: no salta entre etapas y el SVG centra cada cuadro dentro.
    G.aspecto = Math.max(G.cuadros[1][3] / G.cuadros[1][2], G.cuadros[2][3] / G.cuadros[2][2], G.cuadros[3][3] / G.cuadros[3][2]);
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
      return '<li class="f0-etapa"><button type="button" class="f0-etapa-b" data-i="' + i + '" aria-label="Ir a la etapa ' + (i + 1) + ': ' + e.n + '">' +
        '<span class="f0-etapa-n" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="f0-etapa-t"><span class="f0-etapa-k">Etapa ' + (i + 1) + '</span>' + e.n + '</span></button></li>';
    }).join('');
    var molde = ETAPAS.map(function (e) { return '<div class="f0-molde-v"><p class="f0-sub">' + e.sub + '</p></div>'; }).join('') +
      '<div class="f0-molde-v"><p class="f0-titulo">' + TITULO_FINAL + '</p><p class="f0-sub">' + SUB_FINAL + '</p></div>';
    raiz.innerHTML =
      '<div class="f0-barra" role="progressbar" aria-label="Avance de las etapas" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><i></i></div>' +
      '<div class="f0-escena"></div>' +
      // El texto va en su propia región viva: la cinta y los controles no se anuncian en cada paso.
      // El molde invisible apila todos los textos en la misma celda: la zona toma el alto del más largo y el diagrama no salta entre etapas.
      '<div class="f0-pie"><div class="f0-texto-zona"><div class="f0-molde" aria-hidden="true">' + molde + '</div>' +
      '<div class="f0-texto" aria-live="polite" aria-atomic="true"><h2 class="f0-titulo" hidden></h2><p class="f0-sub"></p></div></div>' +
      '<div class="f0-cinta"><div class="f0-cinta__etapas"><ol class="f0-etapas">' + lis + '</ol>' +
      '<button type="button" class="f0-cinta__pliega" aria-expanded="true" aria-controls="f0-controles" aria-label="Ocultar los controles">' + IC_PLIEGA + '</button></div>' +
      '<span class="nwt-divider nwt-divider--horizontal f0-cinta__sep" aria-hidden="true"></span>' +
      '<div class="f0-fila"><div class="f0-controles" id="f0-controles" role="group" aria-label="Control del recorrido">' +
      '<button type="button" class="f0-ctl f0-ctl--ant" aria-keyshortcuts="ArrowLeft" title="Atajo: ←">' + IC_ANT + '<span>Anterior</span></button>' +
      '<button type="button" class="f0-ctl f0-ctl--pausa" aria-keyshortcuts="Space" title="Atajo: Espacio"></button>' +
      '<button type="button" class="f0-ctl f0-ctl--sig" aria-keyshortcuts="ArrowRight" title="Atajo: →"><span>Siguiente</span>' + IC_SIG + '</button>' +
      '<button type="button" class="f0-ctl f0-ctl--omitir" aria-keyshortcuts="Escape" title="Atajo: Esc"><span>Omitir</span><kbd aria-hidden="true">Esc</kbd></button>' +
      '<span class="f0-sr" role="status"></span></div>' +
      '<span class="f0-cinta__logo" aria-hidden="true"><nwt-logo-naowee></nwt-logo-naowee></span>' +
      '</div></div></div>';
    contenedor.appendChild(raiz);

    var q = function (s) { return raiz.querySelector(s); };
    var barra = q('.f0-barra'), relleno = q('.f0-barra > i'), items = raiz.querySelectorAll('.f0-etapa');
    var escena = q('.f0-escena'), pie = q('.f0-pie'), titulo = q('.f0-texto .f0-titulo');
    var sub = q('.f0-texto .f0-sub'), omitir = q('.f0-ctl--omitir');
    var pliega = q('.f0-cinta__pliega'), controles = q('.f0-controles'), cinta = q('.f0-cinta');
    var ant = q('.f0-ctl--ant'), pausa = q('.f0-ctl--pausa'), sig = q('.f0-ctl--sig'), estado = q('.f0-sr');

    var t = 0, fase = 0, pasoEst = 1, raf = 0, ultimo = 0, avisado = false, activo = true, pausado = false;
    var svg = null, geo = null, flujos = [], disposicion = '', ro = null, textoPrevio = '';
    var cam = null, camRaf = 0;

    function ajustarAlto(w, h) {
      if (!geo) return;
      var util = w - (parseFloat(getComputedStyle(escena).paddingLeft) || 0) - (parseFloat(getComputedStyle(escena).paddingRight) || 0);
      escena.style.height = Math.floor(Math.min(h, util * geo.aspecto)) + 'px';
    }

    function cuadroDe(f) { return geo.cuadros[f >= 3 ? 3 : f >= 2 ? 2 : f >= 1.5 ? 1.5 : 1]; }
    function ponerCam(c) { cam = c; if (svg) svg.setAttribute('viewBox', c.map(r1).join(' ')); }

    // La cámara viaja al cuadro de la fase; sin movimiento, o al reconstruir, salta directo.
    function encuadrar(directo) {
      if (!geo) return;
      var dest = cuadroDe(fase), ini = cam, t0 = 0;
      cancelAnimationFrame(camRaf); camRaf = 0;
      if (directo || estatico || !ini || !svg) { ponerCam(dest.slice()); return; }
      if (ini.every(function (v, i) { return v === dest[i]; })) return;
      function paso(ts) {
        if (!t0) t0 = ts;
        var u = Math.min(1, (ts - t0) / 850), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        ponerCam(ini.map(function (v, i) { return v + (dest[i] - v) * e; }));
        if (u < 1) camRaf = requestAnimationFrame(paso);
      }
      camRaf = requestAnimationFrame(paso);
    }

    function construir() {
      // El espacio útil es el de la raíz menos barra, pie y reserva de la cinta: la escena se ajusta a él y el conjunto se centra.
      var w = escena.clientWidth, h = raiz.clientHeight - barra.offsetHeight - pie.offsetHeight - (parseFloat(getComputedStyle(raiz).paddingBottom) || 0);
      if (!w || h <= 0) return;
      var ancho = w / h >= 1.15;
      var clave = ancho ? 'a' : 'b';
      if (clave === disposicion) { ajustarAlto(w, h); return; }
      disposicion = clave;
      var G = geometria(ancho);
      geo = G; ajustarAlto(w, h);
      escena.textContent = '';
      svg = el('svg', { preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': DESCRIPCION }, 'f0-svg');
      encuadrar(true);
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
      G.mod.forEach(function (d, i) { enlace(d, 'mod', 2, 99, 0.25 * i, false); });
      G.api.forEach(function (d, i) { enlace(d, 'out', 3, 99, 0.15 * i, false); });
      G.sale.forEach(function (d, i) { enlace(d, 'out', 3, 99, 0.5 + 0.2 * i, true); });

      // Suspendidas y apenas separadas hasta que entra la base (DC-030); en la fila estrecha casi solo en vertical.
      var FLOTA = G.ancho ? [[-14, -8, -0.4], [10, 4, -1.7], [-6, 8, -3]] : [[-2, -9, -0.4], [0, 7, -1.7], [2, -5, -3]];
      // Antes de la base las fuentes van al centro del cuadro de la etapa 1, a escala 1 y con el paso
      // natural de la columna (DC-148).
      var fx = FLOTA.map(function (v) { return v[0]; }), c1 = G.cuadros[1];
      var cx0 = c1[0] + c1[2] / 2 - (Math.min.apply(null, fx) + Math.max.apply(null, fx)) / 2, cy0 = c1[1] + c1[3] / 2;
      FUENTES.forEach(function (f, i) {
        var c = G.fuentes[i], fl = FLOTA[i].slice(), ox = c.x + c.w / 2, oy = c.y + c.h / 2;
        fl[0] += G.ancho ? cx0 - ox : 0; fl[1] += G.ancho ? cy0 + (i - 1) * 120 - oy : 70;
        fl.push(1, ox, oy);
        tarjeta(capaN, f, c, G.ancho ? 'grande' : 'fuente', 'in', 1, 99, 0.5 * i, fl);
      });
      MODULOS.forEach(function (m, i) { tarjeta(capaN, m, G.mods[i], G.ancho ? 'grande' : 'compacta', 'in', 2, 99, 0.5 + 0.25 * i); });
      CONSUMIDORES.forEach(function (c, i) { tarjeta(capaN, c, G.consum[i], G.ancho ? (i ? 'fila' : 'grande') : 'compacta', 'out', 3, 99, 0.45 + 0.22 * i); });

      var H = G.hub, hub = el('g', {}, 'f0-hub f0-aparece');
      // Retraso: las fuentes salen del centro antes de que el disco aparezca encima.
      hub.setAttribute('data-desde', 1.5); hub.setAttribute('data-hasta', 99); hub.style.setProperty('--d', '.45s');
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
      [[big ? 'Medidas correctivas' : 'Medidas', 1.5, 2], [big ? 'Plataforma del IVC' : 'Plataforma', 2, 3]].forEach(function (x) {
        var ss = el('text', { x: H.cx, y: H.cy + (big ? 56 : 49), 'text-anchor': 'middle', 'font-size': big ? 12.5 : 11.5 }, 'f0-hub-s f0-fade');
        ss.setAttribute('data-desde', x[1]); ss.setAttribute('data-hasta', x[2]); ss.textContent = x[0]; hub.appendChild(ss);
      });
      capaN.appendChild(hub);
      escena.appendChild(svg);
      marcar();
      if (!estatico) mover(); // con la pausa puesta nadie más repone las partículas del SVG nuevo
    }

    function marcar() {
      raiz.classList.toggle('f0-unidas', fase >= 1.5);
      var nodos = raiz.querySelectorAll('[data-desde]');
      for (var i = 0; i < nodos.length; i++) {
        var d = Number(nodos[i].getAttribute('data-desde')), h = Number(nodos[i].getAttribute('data-hasta'));
        nodos[i].classList.toggle('f0-on', fase >= d && fase < h);
      }
    }

    function etapaDe(f) { return f >= 4 ? 4 : Math.max(1, Math.floor(f)); }

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
      var e = etapaDe(f), final = f >= 4 || (estatico && pasoEst >= 3);
      fase = f; marcar(); encuadrar(false);
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('f0-hecha', i + 1 < e || f >= 4);
        items[i].classList.toggle('f0-actual', i + 1 === e && f < 4);
        if (i + 1 === e && f < 4) items[i].setAttribute('aria-current', 'step'); else items[i].removeAttribute('aria-current');
      }
      barra.setAttribute('aria-valuenow', String(f >= 4 ? 3 : e));
      var txt = f >= 4 ? SUB_FINAL : ETAPAS[Math.min(e, 3) - 1].sub;
      if (txt !== textoPrevio) {
        textoPrevio = txt; sub.textContent = txt;
        titulo.hidden = f < 4; titulo.textContent = f >= 4 ? TITULO_FINAL : '';
        [sub, titulo].forEach(function (n2) { n2.classList.remove('f0-cambia'); void n2.offsetWidth; n2.classList.add('f0-cambia'); });
      }
      // En el resumen ya no hay a dónde omitir; si tenía el foco, pasa a Anterior.
      if (final && !omitir.hidden && document.activeElement === omitir) ant.focus();
      omitir.hidden = final;
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
      disposicion = ''; construir();
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
    if (window.ResizeObserver) { ro = new ResizeObserver(construir); ro.observe(raiz); ro.observe(pie); }
    else window.addEventListener('resize', construir);

    arrancar();

    // Tocar una etapa devuelve el recorrido a ella, también desde el resumen.
    q('.f0-etapas').addEventListener('click', function (e) {
      var b = e.target.closest('.f0-etapa-b');
      if (b) irA(Number(b.getAttribute('data-i')));
    });
    ant.addEventListener('click', function () { irA(paradaActual() - 1); });
    sig.addEventListener('click', function () { irA(paradaActual() + 1); });
    pausa.addEventListener('click', function () { ponerPausa(!pausado); });
    omitir.addEventListener('click', finalizar);
    // DC-156: plegada deja solo las etapas; la cinta se achica y el logo pasa al canvas.
    pliega.addEventListener('click', function () {
      var ocultar = !cinta.classList.contains('f0-cinta--plegada');
      cinta.classList.toggle('f0-cinta--plegada', ocultar);
      pliega.setAttribute('aria-expanded', String(!ocultar));
      pliega.setAttribute('aria-label', ocultar ? 'Mostrar los controles' : 'Ocultar los controles');
      if (ocultar && controles.contains(document.activeElement)) pliega.focus();
    });

    return {
      saltar: finalizar,
      pausar: function () { ponerPausa(true); },
      reanudar: function () { ponerPausa(false); },
      reiniciar: function () { if (activo) arrancar(); },
      destruir: function () {
        activo = false; cancelAnimationFrame(raf); cancelAnimationFrame(camRaf);
        document.removeEventListener('keydown', alTeclear);
        if (mq.removeEventListener) mq.removeEventListener('change', alCambiarMovimiento);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', construir);
        if (raiz.parentNode) raiz.parentNode.removeChild(raiz);
      }
    };
  }

  window.Fase0 = { montar: montar };
})();
