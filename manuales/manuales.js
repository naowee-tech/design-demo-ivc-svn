/* Manuales: menú lateral, capturas con marcas y tabla de cédulas.
   Sin fetch: los datos llegan como .js que asignan a window, así funciona igual con file:// y http. */
(function (w, d) {
  'use strict';

  /* Un solo arreglo para las 4 páginas; las secciones salen de los h2 de cada página. */
  var NAV = [
    { href: 'index.html', t: 'Inicio' },
    { href: 'ivc.html', t: 'IVC, pantalla por pantalla' },
    { href: 'svn.html', t: 'SVN, paso a paso' },
    { href: 'cedulas.html', t: 'Cédulas de prueba' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function paginaActual() {
    var f = (location.pathname.split('/').pop() || 'index.html');
    return /\.html$/.test(f) ? f : 'index.html';
  }

  /* ── Navegación ── */
  function secciones() {
    return [].slice.call(d.querySelectorAll('.mn-main .mn-sec[id] > h2')).map(function (h) {
      var c = h.cloneNode(true), n = c.querySelector('.mn-num');
      if (n) { n.remove(); }
      return { id: h.parentNode.id, t: h.getAttribute('data-corto') || c.textContent.trim() };
    });
  }
  function pintarNav() {
    var nav = d.querySelector('.mn-nav');
    if (!nav) { return; }
    var aqui = paginaActual(), secs = secciones();
    nav.innerHTML = '<ul>' + NAV.map(function (p) {
      var es = p.href === aqui;
      return '<li><a class="mn-nav__pag" href="' + p.href + '"' + (es ? ' aria-current="page"' : '') + '>' + esc(p.t) + '</a>' +
        (es && secs.length ? '<ul class="mn-nav__secs">' + secs.map(function (s) {
          return '<li><a href="#' + esc(s.id) + '" data-sec="' + esc(s.id) + '">' + esc(s.t) + '</a></li>';
        }).join('') + '</ul>' : '') + '</li>';
    }).join('') + '</ul>';
    /* En la barra de celular, la página actual queda a la vista. */
    var cur = nav.querySelector('[aria-current="page"]');
    if (cur && w.matchMedia('(max-width: 900px)').matches) { cur.parentNode.parentNode.scrollLeft = cur.offsetLeft - 16; }
    seguirSecciones(nav);
  }
  function seguirSecciones(nav) {
    var links = nav.querySelectorAll('[data-sec]');
    if (!links.length || !('IntersectionObserver' in w)) { return; }
    var visibles = {};
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { visibles[e.target.id] = e.isIntersecting; });
      var primera = [].filter.call(links, function (a) { return visibles[a.getAttribute('data-sec')]; })[0];
      if (!primera) { return; }
      [].forEach.call(links, function (a) { a.classList.toggle('is-on', a === primera); });
    }, { rootMargin: '-80px 0px -55% 0px' });
    [].forEach.call(links, function (a) { var s = d.getElementById(a.getAttribute('data-sec')); if (s) { io.observe(s); } });
  }

  /* ── Capturas con marcas ── */
  function pintarCapturas() {
    var datos = w.MANUALES_CAPTURAS || {};
    [].forEach.call(d.querySelectorAll('figure.mn-cap[data-cap]'), function (f) {
      var id = f.getAttribute('data-cap'), c = datos[id];
      if (!c) { f.classList.add('mn-cap--hueco'); f.textContent = id; f.setAttribute('aria-label', 'Captura pendiente: ' + id); return; }
      var paso = f.closest('.mn-paso'), h = paso && paso.querySelector('h3');
      var alt = f.getAttribute('data-alt') || (h ? h.textContent.trim() : id);
      var foco = f.getAttribute('data-foco'), flecha = f.getAttribute('data-flecha');
      var html = '<img src="' + esc(c.src) + '" width="' + (+c.w || '') + '" height="' + (+c.h || '') + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">';
      (c.marcas || []).forEach(function (m) {
        var cls = 'mn-marca' + (String(m.n) === foco ? ' mn-marca--foco' : '') + (m.x < 3 || m.y < 4 ? ' mn-marca--dentro' : '');
        var fl = m.flecha || (flecha && String(m.n) === '1' ? flecha : '');
        html += '<span class="' + cls + '" data-n="' + esc(m.n) + '"' + (fl ? ' data-flecha="' + esc(fl) + '"' : '') +
          ' style="left:' + m.x + '%;top:' + m.y + '%;width:' + m.w + '%;height:' + m.h + '%" aria-hidden="true"></span>';
      });
      f.innerHTML = html;
      /* Un recorte chico no se estira al ancho de la columna: se muestra a su tamaño en pantalla. */
      if (+c.w) { f.style.maxWidth = Math.round(c.w / (+c.dpr || 1)) + 'px'; }
    });
    /* Pasar por un ítem de la leyenda resalta su marca en la captura de arriba. */
    d.addEventListener('mouseover', function (e) { resaltar(e, true); });
    d.addEventListener('mouseout', function (e) { resaltar(e, false); });
  }
  function resaltar(e, on) {
    var li = e.target.closest && e.target.closest('.mn-marcas > li');
    if (!li) { return; }
    var ol = li.parentNode, f = ol.previousElementSibling;
    while (f && !(f.matches && f.matches('figure.mn-cap'))) { f = f.previousElementSibling; }
    if (!f) { return; }
    var n = [].indexOf.call(ol.children, li) + 1, m = f.querySelector('.mn-marca[data-n="' + n + '"]');
    if (m) { m.classList.toggle('is-on', on); }
  }

  /* ── Tabla de cédulas, leída de los mismos datos que usa la demo ── */
  function sigla(t) { var m = /\(([A-Z]+)\)/.exec(t || ''); return m ? m[1] : 'CC'; }
  function estadoInicial(p) {
    if (p.oculta) { return { t: 'Sin registro todavía', c: 'gris', bloquea: false }; }
    var s = p.sanciones || [], vig = null, rec = false, cum = false;
    s.forEach(function (x) {
      if (x.estadoRegistro !== 'Validado') { rec = true; return; }
      var resta = Math.round(x.meses * 30.44) - x.diasEjecutoria;
      if (resta > 0) { vig = vig == null ? resta : Math.min(vig, resta); } else { cum = true; }
    });
    if (vig != null) { return vig <= 30 ? { t: 'Por vencer', c: 'rojo', bloquea: true } : { t: 'Sanción vigente', c: 'rojo', bloquea: true }; }
    if (rec) { return { t: 'Recibida · no bloquea', c: 'ambar', bloquea: false }; }
    if (cum) { return { t: 'Cumplida', c: 'gris', bloquea: false }; }
    return { t: 'Sin sanción', c: 'verde', bloquea: false };
  }
  function comoSeActiva(p) {
    if (!p.oculta) { return ''; }
    return p.solicitud ? 'Aparece al llevar a sanción la solicitud de ' + p.solicitud.origen + '.' : 'Fije su estado en el «Panel de casos de prueba».';
  }
  function celdaDoc(p) {
    return '<td data-th="Documento"><span class="mn-doc">' + sigla(p.tipoId) + ' ' + esc(p.numId) + '</span>' +
      '<button type="button" class="mn-copiar" data-copiar="' + esc(p.numId) + '" aria-label="Copiar ' + esc(p.numId) + '">Copiar</button></td>';
  }
  function pintarCedulas() {
    var el = d.getElementById('mn-cedulas'), libres = d.getElementById('mn-libres'), D = w.DEMO_CASOS;
    if (!D) { if (el) { el.textContent = 'No se pudieron leer los datos de la demo.'; } return; }
    if (el) {
      el.innerHTML = '<div class="mn-tabla-w"><table class="mn-tabla"><thead><tr><th>Documento</th><th>Persona</th><th>Para qué sirve</th><th>Al empezar</th><th>¿Bloquea?</th></tr></thead><tbody>' +
        D.personas.map(function (p) {
          var e = estadoInicial(p), extra = comoSeActiva(p);
          return '<tr>' + celdaDoc(p) +
            '<td data-th="Persona">' + esc(p.nombres + ' ' + p.apellidos) + '</td>' +
            '<td data-th="Para qué sirve">' + esc(p.etiqueta) + (extra ? '<small>' + esc(extra) + '</small>' : '') + '</td>' +
            '<td data-th="Al empezar"><span class="mn-chip mn-chip--' + e.c + '">' + esc(e.t) + '</span></td>' +
            '<td data-th="¿Bloquea?">' + (e.bloquea ? 'Sí' : 'No') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    if (libres) {
      libres.innerHTML = '<div class="mn-tabla-w"><table class="mn-tabla"><thead><tr><th>Documento</th><th>Persona</th><th>Ciudad</th></tr></thead><tbody>' +
        (D.libres || []).map(function (p) {
          return '<tr>' + celdaDoc(p) + '<td data-th="Persona">' + esc(p.nombres + ' ' + p.apellidos) + '</td><td data-th="Ciudad">' + esc(p.ciudad) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
  }
  /* Copia con aviso breve; si el portapapeles no responde (file:// en algunos navegadores), no se marca. */
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copiar]');
    if (!b) { return; }
    var v = b.getAttribute('data-copiar');
    function ok() { b.setAttribute('data-ok', ''); b.textContent = 'Copiada'; setTimeout(function () { b.removeAttribute('data-ok'); b.textContent = 'Copiar'; }, 1200); }
    try { navigator.clipboard.writeText(v).then(ok, function () {}); } catch (er) { /* sin portapapeles */ }
  });

  /* Toolbar del SVN, por JS: con HTML estático el SDK no reubica sus slots. El alto real alimenta --mn-barra. */
  function pintarBarra() {
    var b = d.getElementById('barra');
    if (!b || !w.SVN_TOOLBAR) { return; }
    b.innerHTML = '<div></div>';
    b.firstChild.innerHTML = w.SVN_TOOLBAR({ marca: w.NAOWEE && w.NAOWEE.deporteSvn, titulo: 'Manuales', subtitulo: 'Cómo usar la demo', acciones: [{ texto: 'Volver a la demo', id: 'volver' }] });
    b.addEventListener('click', function (e) { if (e.target.closest('#volver')) { location.href = '../index.html'; } });
    function medir() { d.documentElement.style.setProperty('--mn-barra', b.getBoundingClientRect().height + 'px'); }
    if (w.ResizeObserver) { new ResizeObserver(medir).observe(b); }
    medir();
  }

  function arrancar() { pintarBarra(); pintarCapturas(); pintarCedulas(); pintarNav(); }
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', arrancar); } else { arrancar(); }
})(window, document);
