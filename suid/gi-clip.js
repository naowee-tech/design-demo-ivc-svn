/* Campo de texto con icono: pegar cuando está vacío, borrar (×) cuando tiene algo. Marcado por cadena: sirve en formularios que se repintan. */
(function (w, d) {
  'use strict';
  var PEGAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>';
  var BORRAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function boton(lleno) {
    return '<button type="button" class="gi-clip' + (lleno ? ' is-clear' : '') + '" data-clip tabindex="-1" aria-label="' + (lleno ? 'Borrar el campo' : 'Pegar desde el portapapeles') + '">' + (lleno ? BORRAR : PEGAR) + '</button>';
  }
  function wrap(input, valor) { return '<span class="gi-clipw">' + input + boton(!!String(valor == null ? '' : valor).length) + '</span>'; }
  function one(wr) {
    var i = wr.querySelector('input'), b = wr.querySelector('[data-clip]'), lleno = !!(i && i.value);
    if (!i || !b || b.classList.contains('is-clear') === lleno) return;
    b.classList.toggle('is-clear', lleno);
    b.setAttribute('aria-label', lleno ? 'Borrar el campo' : 'Pegar desde el portapapeles');
    b.innerHTML = lleno ? BORRAR : PEGAR;
  }
  function refresh(root) { [].forEach.call((root || d).querySelectorAll('.gi-clipw'), one); }
  /* Lo escuchan los formularios por delegación: igual que si la persona hubiera escrito. */
  function emitir(i) { i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }

  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-clip]'); if (!b) return;
    var i = b.parentNode.querySelector('input'); if (!i || i.disabled || i.readOnly) return;
    if (b.classList.contains('is-clear')) { i.value = ''; emitir(i); i.focus(); return; }
    var p = w.navigator.clipboard && w.navigator.clipboard.readText ? w.navigator.clipboard.readText() : Promise.reject();
    p.then(function (t) { i.value = t.trim().slice(0, i.maxLength > 0 ? i.maxLength : 200); emitir(i); i.focus(); }, function () { i.focus(); });
  });
  d.addEventListener('input', function (e) { var wr = e.target.closest && e.target.closest('.gi-clipw'); if (wr) one(wr); }, true);

  w.GIClip = { wrap: wrap, refresh: refresh };
})(window, document);
