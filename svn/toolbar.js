/* Constructor único del toolbar de las presentaciones; el CSS vive en toolbar.css. */
(function () {
  var base = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* opts: { marca (HTML), titulo, subtitulo, acciones: [{ texto, acc, id }] } */
  window.SVN_TOOLBAR = function (opts) {
    var N = window.NAOWEE || {};
    /* marca.js usa rutas relativas a svn/: se anclan al directorio de este script para que sirva desde fase0/. */
    var marca = (opts.marca || N.deporteSvn || '').replace(/src="assets\//g, 'src="' + base + 'assets/');
    var acciones = (opts.acciones || []).map(function (a) {
      return '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium"' +
        (a.id ? ' id="' + esc(a.id) + '"' : '') + (a.acc ? ' data-acc="' + esc(a.acc) + '"' : '') + '>' + esc(a.texto) + '</nwt-button>';
    }).join('');
    return '<nwt-toolbar class="pp-toolbar">' +
      '<span class="pp-toolbar__marca">' + marca + '</span>' +
      '<nwt-title class="pp-toolbar__titulo">' + esc(opts.titulo) + '<span slot="subtitle">' + esc(opts.subtitulo) + '</span></nwt-title>' +
      acciones + '</nwt-toolbar>';
  };
})();
