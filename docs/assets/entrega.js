/* Arma la estructura común de cada vista: portada, secciones numeradas, tipos de información e índice. */
(function () {
  var J = 'https://naowee.atlassian.net/browse/';
  var VISTAS = {
    'trabajos.html': { n: '01', t: 'Para qué existe', meta: [['Épica en Jira', J + 'PROD-45', 'PROD-45']] },
    'historias.html': { n: '02', t: 'Historias de usuario', meta: [['Tarea en Jira', J + 'PROD-73', 'PROD-73']] },
    'hu-26-3.html': { n: '02', t: 'Historia de usuario', meta: [] },
    'flujos.html': { n: '05', t: 'Flujos', meta: [['Tarea en Jira', J + 'PROD-71', 'PROD-71']] },
    'roles.html': { n: '03', t: 'Roles', meta: [['Tarea en Jira', J + 'PROD-72', 'PROD-72']] },
    'modelo-datos.html': { n: '06', t: 'Modelo de datos', meta: [['Épica en Jira', J + 'PROD-45', 'PROD-45']] },
    'superficie.html': { n: '04', t: 'Superficie', meta: [['Tarea en Jira', J + 'PROD-74', 'PROD-74']] },
    'anexos.html': { n: '07', t: 'Anexos', meta: [['Épica en Jira', J + 'PROD-45', 'PROD-45']] },
    'responsive.html': { n: '08', t: 'Responsive', meta: [['Épica en Jira', J + 'PROD-45', 'PROD-45']] }
  };
  var main = document.querySelector('main');
  if (!main) return;
  var v = VISTAS[location.pathname.split('/').pop()] || null;
  function el(tag, cls, html) { var x = document.createElement(tag); if (cls) x.className = cls; if (html != null) x.innerHTML = html; return x; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Portada: el header existente, o lo que va antes de la primera sección (HU).
  var hero = main.querySelector(':scope > header');
  if (!hero) {
    hero = el('header');
    var h1 = main.querySelector(':scope > h1');
    if (h1) {
      var n = main.firstElementChild;
      while (n && n !== h1) { var nx = n.nextElementSibling; hero.appendChild(n); n = nx; }
      hero.appendChild(h1);
      while ((n = main.firstElementChild) && /^(P|NAV)$/.test(n.tagName) && /\b(lead|sub|toc)\b/.test(n.className)) hero.appendChild(n);
      main.insertBefore(hero, main.firstChild);
    }
  }
  hero.classList.add('hero');
  if (v) {
    hero.insertBefore(el('p', 'eyebrow', '<b>' + v.n + '</b>' + esc(v.t)), hero.firstChild);
    if (v.meta.length) hero.appendChild(el('div', 'meta', v.meta.map(function (m) {
      return '<a href="' + m[1] + '" target="_blank" rel="noopener"><i>' + esc(m[0]) + '</i>' + esc(m[2]) + ' ↗</a>';
    }).join('')));
  }

  // Secciones: las <section> que ya existen, y cada h2 suelto con lo que le sigue.
  Array.prototype.slice.call(main.children).forEach(function (c) {
    if (c.tagName !== 'H2') return;
    var s = el('section');
    main.insertBefore(s, c);
    var n = c;
    while (n && !(n !== c && (n.tagName === 'H2' || n.tagName === 'SECTION' || n.tagName === 'SCRIPT'))) { var nx = n.nextElementSibling; s.appendChild(n); n = nx; }
  });
  var secs = Array.prototype.slice.call(main.querySelectorAll(':scope > section'));
  secs.forEach(function (s) {
    s.classList.add('sec');
    var h2 = s.querySelector(':scope > h2');
    if (!h2) return;
    if (!s.id) s.id = h2.id && h2.id.slice(-2) !== '-t' ? h2.id : h2.textContent.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var hd = el('div', 'sec-h');
    s.insertBefore(hd, h2);
    hd.appendChild(h2);
    var p = hd.nextElementSibling;
    if (p && p.tagName === 'P' && /\b(sub|lead)\b/.test(p.className)) hd.appendChild(p);
    var tx = h2.textContent.trim();
    if (/^Por (confirmar|decidir)/.test(tx)) s.classList.add('sec--confirm');
    if (h2.querySelector('.prop')) s.classList.add('sec--prop');
  });

  // Por confirmar / por decidir dentro de una sección: subtítulo + su lista en un aviso.
  Array.prototype.slice.call(main.querySelectorAll('section.sec h3')).forEach(function (h) {
    if (!/^Por (confirmar|decidir)/.test(h.textContent.trim())) return;
    var box = el('div', 'call call--confirm'), nx = h.nextElementSibling;
    h.parentNode.insertBefore(box, h);
    box.appendChild(el('span', 'call-l', esc(h.textContent.trim())));
    h.remove();
    if (nx && /^(UL|P|OL)$/.test(nx.tagName)) box.appendChild(nx);
  });
  Array.prototype.slice.call(main.querySelectorAll('[data-call]')).forEach(function (c) {
    c.classList.add('call', 'call--' + c.getAttribute('data-call'));
    var l = c.getAttribute('data-call-l');
    if (l) c.insertBefore(el('span', 'call-l', esc(l)), c.firstChild);
  });

  // Índice lateral con la sección en curso.
  var vis = secs.filter(function (s) { return !s.hidden && s.style.display !== 'none' && s.querySelector('h2'); });
  if (vis.length >= 3) {
    var rail = el('nav', 'rail', '<p>En esta vista</p><ol>' + vis.map(function (s, i) {
      var h = s.querySelector('h2').cloneNode(true);
      Array.prototype.slice.call(h.querySelectorAll('.prop')).forEach(function (x) { x.remove(); });
      return '<li><a href="#' + s.id + '"><span>' + (i < 9 ? '0' : '') + (i + 1) + '</span>' + esc(h.textContent.trim()) + '</a></li>';
    }).join('') + '</ol>');
    rail.setAttribute('aria-label', 'Secciones de la vista');
    main.insertBefore(rail, hero.nextSibling);
    main.classList.add('has-rail');
    Array.prototype.slice.call(main.querySelectorAll(':scope > nav[aria-label=Secciones]')).forEach(function (x) { x.style.display = 'none'; });
    var links = rail.querySelectorAll('a');
    function marca() {
      var cur = 0;
      vis.forEach(function (s, i) { if (s.getBoundingClientRect().top < 140) cur = i; });
      for (var i = 0; i < links.length; i++) links[i].setAttribute('aria-current', i === cur ? 'true' : 'false');
    }
    addEventListener('scroll', marca, { passive: true }); marca();
  }

  if (location.hash.length > 1) {
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView();
  }
})();
