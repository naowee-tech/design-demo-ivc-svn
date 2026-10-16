/* Opciones del panel del demo (DC-414): una nwt-tabs con más de PESTANAS_MAX opciones pasa a lista vertical
   como la de «Probar». Solo marca `data-lista`; el trazo vive en svn.css y el cambio lo sigue haciendo la nwt-tabs. */
(function () {
  var PESTANAS_MAX = 3; // Umbral: con 3 se queda en pestañas, desde 4 es lista. Para «tres o más», poner 2.
  var raiz = document.getElementById('app');

  function ajustar() {
    raiz.querySelectorAll('.pp-panel nwt-tabs').forEach(function (t) {
      var lista = t.querySelector('.nwt-tabs__list');
      var enLista = !!lista && lista.querySelectorAll('.nwt-tabs__tab').length > PESTANAS_MAX;
      if (t.hasAttribute('data-lista') !== enLista) { t.toggleAttribute('data-lista', enLista); }
      if (!lista) { return; }
      // Es una columna: lo dice la semántica; las flechas mueven el foco, Enter/Espacio eligen (botón nativo).
      if (enLista) { lista.setAttribute('aria-orientation', 'vertical'); } else { lista.removeAttribute('aria-orientation'); }
    });
  }

  // Las apps arman el panel y asignan `items` cuando quieren (y entidades lo rehace al cambiar de cara): se observa el render.
  new MutationObserver(ajustar).observe(raiz, { childList: true, subtree: true });
  ajustar();

  raiz.addEventListener('keydown', function (e) {
    var fila = e.target.closest && e.target.closest('[data-lista] .nwt-tabs__tab');
    if (!fila || !/^(ArrowDown|ArrowUp|Home|End)$/.test(e.key)) { return; }
    var filas = [].slice.call(fila.parentNode.querySelectorAll('.nwt-tabs__tab')), i = filas.indexOf(fila);
    var j = e.key === 'Home' ? 0 : e.key === 'End' ? filas.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + filas.length) % filas.length;
    e.preventDefault();
    filas[j].focus();
  });
})();
