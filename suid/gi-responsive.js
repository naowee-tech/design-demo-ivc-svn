/* Menú en celular: ☰ en el encabezado abre la barra lateral como cajón (el estilo ya vive en shared/shell.css). */
(function (w, d) {
  var sb = d.getElementById('sidebar'), hd = d.getElementById('topHeader');
  if (!sb || !hd) return;
  var ICO = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  function abrir(si) {
    sb.classList.toggle('is-mobile-open', si);
    d.body.classList.toggle('has-mobile-drawer-open', si);
    var b = hd.querySelector('.suid-burger');
    if (b) b.setAttribute('aria-expanded', String(si));
    if (si) { var a = sb.querySelector('.nav-row.is-active, .nav-row[href]'); if (a) a.focus(); } else if (b && d.activeElement && sb.contains(d.activeElement)) b.focus();
  }
  var abierto = function () { return sb.classList.contains('is-mobile-open'); };

  // El encabezado se repinta en cada ruta: el botón se repone cuando falta.
  function pon() {
    if (hd.querySelector('.suid-burger')) return;
    var b = d.createElement('button');
    b.type = 'button'; b.className = 'suid-burger'; b.innerHTML = ICO;
    b.setAttribute('aria-label', 'Abrir el menú'); b.setAttribute('aria-controls', 'sidebar'); b.setAttribute('aria-expanded', String(abierto()));
    b.addEventListener('click', function () { abrir(!abierto()); });
    hd.insertBefore(b, hd.firstChild);
  }
  new MutationObserver(pon).observe(hd, { childList: true });
  pon();

  w.addEventListener('hashchange', function () { abrir(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && abierto()) abrir(false); });
  // El velo es body::after: un clic fuera de la barra cae en body.
  d.addEventListener('click', function (e) { if (abierto() && e.target === d.body) abrir(false); });
  if (w.matchMedia) w.matchMedia('(min-width: 768px)').addEventListener('change', function (m) { if (m.matches) abrir(false); });
})(window, document);
