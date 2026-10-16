/* Barrido de relleno: una línea baja y cada campo completado aparece al cruzarla.
   Se toma snap() antes de rellenar y play() después; solo anima lo que cambió entre las dos. */
(function (w) {
  'use strict';
  var UNITS = '.gi-f, .pb-campo, .exs-sec-fila, .doc-upload-card';
  var VH_POR_S = 0.25;
  var run = null;

  function firma(u) {
    var v = [].map.call(u.querySelectorAll('input, select, textarea'), function (c) { return c.type === 'checkbox' || c.type === 'radio' ? (c.checked ? '1' : '0') : c.value; });
    var t = [].map.call(u.querySelectorAll('.gs-pick__btn, .doc-upload-card__meta'), function (c) { return c.textContent.trim(); });
    return v.join('|') + '#' + t.join('|') + '#' + (u.classList.contains('is-uploaded') ? 'u' : '');
  }
  function units(root) { return [].slice.call(root.querySelectorAll(UNITS)).filter(function (u) { return !u.parentElement.closest(UNITS); }); }
  function snap(root) { return units(root).map(firma); }

  function limpiar() {
    if (!run) return;
    cancelAnimationFrame(run.raf);
    run.items.forEach(function (it) { it.u.classList.remove('lf-wait', 'lf-lit', 'lf-rev'); });
    if (run.line.parentNode) run.line.parentNode.removeChild(run.line);
    document.removeEventListener('pointerdown', limpiar, true);
    document.removeEventListener('keydown', limpiar, true);
    run = null;
  }

  function play(root, antes, opt) {
    if (opt && opt.defer) { queueMicrotask(function () { play(root, antes); }); return; }
    limpiar();
    var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var all = units(root), sc = document.querySelector('.main-scroll');
    var items = all.filter(function (u, i) { return antes[i] !== undefined && antes[i] !== firma(u) && u.offsetHeight > 0; }).map(function (u) { return { u: u }; });
    if (!items.length || reduce || !sc) return;
    if (getComputedStyle(sc).position === 'static') sc.style.position = 'relative';

    var line = document.createElement('div');
    line.className = 'lf-line'; line.setAttribute('aria-hidden', 'true');
    sc.appendChild(line); sc.style.scrollBehavior = 'auto';
    items.forEach(function (it) { it.u.classList.add('lf-wait'); });
    run = { items: items, line: line, raf: 0 };

    function medir() {
      var base = sc.getBoundingClientRect(), x0 = 1e9, x1 = 0;
      items.forEach(function (it) {
        var r = it.u.getBoundingClientRect();
        it.top = r.top - base.top + sc.scrollTop; it.bot = it.top + r.height;
        x0 = Math.min(x0, r.left - base.left); x1 = Math.max(x1, r.right - base.left);
      });
      line.style.left = x0 + 'px'; line.style.width = (x1 - x0) + 'px';
    }
    medir();
    var y = items[0].top - 12, fin = items[items.length - 1].bot + 12, last = performance.now();
    document.addEventListener('pointerdown', limpiar, true);
    document.addEventListener('keydown', limpiar, true);

    (function tick(now) {
      if (!run) return;
      var dt = Math.min(0.05, (now - last) / 1000); y += dt * w.innerHeight * VH_POR_S; last = now;
      line.style.top = y + 'px';
      items.forEach(function (it) {
        if (!it.on && y >= it.top + (it.bot - it.top) * 0.5) { it.on = true; it.u.classList.remove('lf-wait'); it.u.classList.add('lf-rev', 'lf-lit'); }
        if (it.on && !it.off && y > it.bot) { it.off = true; it.u.classList.remove('lf-lit'); }
      });
      // Sigue a la línea con inercia: se acerca al punto donde la deja a ~45 % de la altura, sin saltos.
      var h = sc.clientHeight, vy = y - sc.scrollTop;
      if (vy > h * 0.55 || vy < h * 0.15) sc.scrollTop += (Math.max(0, y - h * 0.45) - sc.scrollTop) * Math.min(1, dt * 5);
      if (y > fin) { items.forEach(function (it) { it.u.classList.remove('lf-rev'); }); limpiar(); return; }
      run.raf = requestAnimationFrame(tick);
    })(last);
  }

  w.LaserFill = { snap: snap, play: play, stop: limpiar };
})(window);
