/* Pasos «titulares» (lista de ingresos) y «titular» (un ingreso a pantalla completa) con la consulta 2 «¿Puede recibir?».
 * Sirven a la compra y a «Cambiar titular» en Tus ingresos. Se registran en COMPRA; si aún no existe la crea, así el orden de carga no importa. */
(function () {
  var C = window.COMPRA = window.COMPRA || {};
  C.pantallas = C.pantallas || {};
  C.registrar = C.registrar || function (id, def) { C.pantallas[id] = def; };

  var EVENTO_FECHA = 'lun 28 sep, 7:00 p. m.';
  var ESTADO = {
    vacio: ['Sin titular', 'vacio'], validando: ['Validando…', 'pend'], ok: ['Validado', 'ok'], denegado: ['No es posible', 'no']
  };

  function cupoDe(st, n) { return st.cupos.filter(function (c) { return c.n === n; })[0]; }
  function ingresoDe(st, n) { return st.ingresos.filter(function (b) { return b.n === n; })[0]; }
  function parcial(ctx, sel, html) { var n = ctx.raiz.querySelector(sel); if (n) { n.innerHTML = html; } }

  // Abre el formulario del ingreso `n`; en «transfer» es un cambio de titular ya pagado.
  function abrirTitular(st, n, modo) {
    var c = modo === 'transfer' ? null : cupoDe(st, n);
    var p = modo === 'transfer' ? st.caso.transfer : (c && c.titular ? null : C.sugerido(st, n));
    st.edit = { n: n, modo: modo, tipo: p ? p.tipo : 'CC', doc: p ? p.num : '', nombre: p ? p.nombre : '', error: { doc: '', nombre: '' }, run: false };
    return st.edit;
  }
  C.abrirTitular = abrirTitular;

  /* ---------- Lista de ingresos ---------- */
  function chip(c) {
    var m = ESTADO[c.estado] || ESTADO.vacio;
    return '<span class="pc-estado pc-estado--' + m[1] + '">' + (c.estado === 'ok' ? C.ico('check', 14) : '') + m[0] + '</span>';
  }
  function tarjeta(st, c, e) {
    var t = c.titular;
    var cuerpo = t
      ? '<div class="pc-titular"><span class="pc-avatar">' + e(C.iniciales(t.nombre)) + '</span><span class="pc-titular__t"><b>' + e(t.nombre) + (c.esPropietario ? ' (tú)' : '') + '</b><span>' + e(C.enmascarar(t.doc)) + '</span></span></div>'
      : '<div class="pc-titular"><span class="pc-avatar pc-avatar--vacio">?</span><span class="pc-titular__t"><b>Sin titular</b><span>Asigna a la persona que entra con este ingreso.</span></span></div>';
    var acc = '';
    if (c.estado === 'denegado') { acc += C.aviso('No es posible asignar este ingreso a esta persona'); }
    if (!c.esPropietario) {
      var txt = c.estado === 'denegado' ? 'Asignar a otra persona' : c.estado === 'ok' ? 'Cambiar titular' : 'Asignar titular';
      acc += '<button type="button" class="pc-btn ' + (c.estado === 'ok' ? 'pc-btn--sec' : '') + '" data-acc="asg-abrir" data-n="' + c.n + '" aria-label="' + e(txt + ', ingreso ' + c.n) + '"' + (st.consultando ? ' disabled' : '') + '><span>' + e(txt) + '</span></button>';
    }
    return '<article class="pca-cupo pca-cupo--' + c.estado + '"><div class="pca-cupo__cab"><b>Ingreso ' + c.n + '</b><span>' + e(C.puesto(st, c.n)) + '</span>' + chip(c) + '</div>' +
      '<div class="pca-cupo__cuerpo">' + cuerpo + (acc ? '<div class="pca-cupo__acc">' + acc + '</div>' : '') + '</div></article>';
  }

  function renderTitulares(ctx) {
    var st = ctx.st, e = ctx.esc, ocupado = !!st.consultando;
    var controles = '<section class="pc-card pca-ctl"><div class="pca-ctl__fila"><div class="pc-cant__t"><h2 class="pc-h2">Ingresos</h2><span class="pc-sub">Hasta ' + st.disponibles + ' para este evento</span></div>' +
      '<div class="pc-stepper"><button type="button" class="pc-step" aria-label="Quitar un ingreso" data-acc="asg-menos"' + (ocupado || st.cantidad <= 1 ? ' disabled' : '') + '>' + C.ico('menos', 20) + '</button>' +
      '<span class="pc-step__n" aria-live="polite">' + st.cantidad + '</span>' +
      '<button type="button" class="pc-step" aria-label="Agregar un ingreso" data-acc="asg-mas"' + (ocupado || st.cantidad >= st.disponibles ? ' disabled' : '') + '>' + C.ico('mas', 20) + '</button></div></div>' +
      '<hr class="pc-sep"><div class="pca-ctl__fila"><div class="pc-cant__t"><b>Yo también voy</b><span class="pc-sub">' + (st.yoVoy ? 'Un ingreso queda con tu documento.' : 'Compro solo para otros.') + '</span></div>' +
      '<button type="button" role="switch" class="pca-sw" aria-checked="' + st.yoVoy + '" aria-label="Yo también voy" data-acc="asg-yo"' + (ocupado ? ' disabled' : '') + '><span class="pca-sw__p"></span></button></div></section>';
    var aviso = st.avisoPago
      ? C.aviso('El ingreso ' + st.avisoPago + ' no pasó la validación final', 'No se hizo ningún cobro y tu reserva sigue vigente. Asígnala a otra persona y vuelve a pagar.')
      : '';
    var ok = C.todosOk(st);
    var pie = ocupado ? C.botonCarga('Validando…')
      : '<button type="button" class="pc-btn" data-acc="asg-continuar"' + (ok ? '' : ' disabled aria-describedby="pca-razon"') + '><span>Continuar al pago</span>' + C.ico('flecha', 20) + '</button>' +
        (ok ? '' : '<p class="pc-sub pc-centro" id="pca-razon">' + e(C.faltante(st)) + '</p>');
    var cuerpo = '<div class="pc-fila-t"><h1 class="pc-h1 pc-tit" tabindex="-1">Titulares</h1>' + C.chipReloj(st) + '</div>' +
      '<p class="pc-sub">Cada ingreso es de una persona con su documento. Asigna a quien va a entrar; se valida a cada una.</p>' +
      aviso + controles + '<div class="pc-listas">' + st.cupos.map(function (c) { return tarjeta(st, c, e); }).join('') + '</div>';
    return C.marco({ paso: 'titulares', atras: 'cmp-atras', cuerpo: cuerpo, pie: pie });
  }

  function subirCantidad(ctx) {
    var st = ctx.st;
    if (st.consultando || st.cantidad >= st.disponibles) { return; }
    st.consultando = 1;
    ctx.repintar();
    // Subir la cantidad repite la consulta 1: el tope de quien compra se revisa con el nuevo total.
    ctx.consultar(1, function (r) {
      st.consultando = 0;
      if (r.ok) { C.ajustarCupos(st, st.cantidad + 1); } else { ctx.toast('No es posible agregar otro ingreso', 'Superaría el máximo de 5 por persona.'); }
      ctx.repintar();
    }, { reintentable: true, cantidad: st.cantidad + 1 });
  }

  C.registrar('titulares', {
    render: renderTitulares,
    onClick: function (el, ev, ctx) {
      var st = ctx.st, a = el.dataset.acc;
      if (st.consultando) { return; }
      if (a === 'asg-abrir') { abrirTitular(st, Number(el.dataset.n), 'cupo'); ctx.ir('titular'); return; }
      if (a === 'asg-menos') { C.ajustarCupos(st, st.cantidad - 1); ctx.repintar(); return; }
      if (a === 'asg-mas') { subirCantidad(ctx); return; }
      if (a === 'asg-yo') {
        var perdio = C.alternarYo(st);
        ctx.repintar();
        if (perdio) { ctx.toast('Quedó libre otro ingreso', perdio + ' perdió su lugar: vuelve a asignarla.'); }
        return;
      }
      if (a === 'asg-continuar' && C.todosOk(st)) { st.avisoPago = 0; ctx.ir('pago'); }
    }
  });

  /* ---------- Un ingreso a pantalla completa ---------- */
  function formHtml(st, ctx) {
    var ed = st.edit, e = ctx.esc, er = ed.error || {};
    var tipos = C.TIPOS_DOC.map(function (t) { return '<option' + (t.id === ed.tipo ? ' selected' : '') + ' title="' + e(t.nombre) + '">' + t.id + '</option>'; }).join('');
    var malDoc = er.doc ? ' pc-input--error" aria-invalid="true" aria-describedby="pca-err-doc' : '';
    var malNom = er.nombre ? ' pc-input--error" aria-invalid="true" aria-describedby="pca-err-nom' : '';
    var err = function (id, t) { return t ? '<p class="pc-error" id="' + id + '" role="alert">' + C.ico('info', 16) + '<span>' + e(t) + '</span></p>' : ''; };
    return '<div class="pc-fila"><label class="pc-campo">Tipo<select class="pc-input pc-input--sel" data-cmp="tipo">' + tipos + '</select></label>' +
      '<label class="pc-campo">Número de documento<input class="pc-input' + malDoc + '" data-cmp="doc" data-foco="doc" inputmode="' + (ed.tipo === 'Pasaporte' ? 'text' : 'numeric') + '" autocomplete="off" value="' + e(ed.doc) + '"></label></div>' +
      err('pca-err-doc', er.doc) +
      '<label class="pc-campo">Nombre completo, como en el documento<input class="pc-input' + malNom + '" data-cmp="nombre" data-foco="nombre" autocomplete="off" value="' + e(ed.nombre) + '"></label>' +
      err('pca-err-nom', er.nombre) +
      '<p class="pca-nota" data-pca="ti"' + (ed.tipo === 'TI' || ed.tipo === 'RC' ? '' : ' hidden') + '>' + C.ico('info', 16) + '<span>Si es menor, se agrega con su representante legal.</span></p>';
  }
  function pieEnviar(ed) {
    return ed.run ? C.botonCarga('Validando…') : '<button type="button" class="pc-btn" data-acc="asg-enviar"><span>' + (ed.modo === 'transfer' ? 'Validar y cambiar titular' : 'Validar y asignar') + '</span></button>';
  }

  function renderTitular(ctx) {
    var st = ctx.st, e = ctx.esc, ed = st.edit || abrirTitular(st, 1, 'cupo'), tr = ed.modo === 'transfer';
    var puesto = C.puesto(st, ed.n), l = C.localidad(st.localidad);
    var actual = tr && ingresoDe(st, ed.n) ? ingresoDe(st, ed.n).titular : null;
    var sub = tr ? 'Hoy es de ' + (actual ? actual.nombre : 'su titular') + '. Se valida a quien lo recibe y puedes cambiarlo hasta ' + EVENTO_FECHA + '.' : 'Escribe el documento y el nombre de la persona que entra con este ingreso.';
    return '<div class="pc-screen pca-imm">' +
      '<header class="pca-imm__top"><button type="button" class="pca-imm__volver" data-acc="asg-volver" aria-label="' + (tr ? 'Volver a Tus ingresos' : 'Volver a Titulares') + '">' + C.ico('atras', 22) + '<span>Volver</span></button>' +
      '<div class="pca-imm__ctx"><span>INGRESO ' + ed.n + ' DE ' + (tr ? st.ingresos.length : st.cupos.length) + '</span><b>' + e(l.n + ' · ' + puesto) + '</b></div></header>' +
      '<main class="pc-body pca-imm__main"><h1 class="pca-imm__h" tabindex="-1">' + (tr ? '¿A quién pasas este ingreso?' : '¿Quién entra con este ingreso?') + '</h1>' +
      '<p class="pc-sub">' + e(sub) + '</p>' +
      '<div class="pca-form" data-pca="form">' + formHtml(st, ctx) + '</div></main>' +
      '<footer class="pc-foot pca-imm__pie" data-pca="pie" aria-live="polite">' + pieEnviar(ed) + '</footer></div>';
  }

  function volver(ctx) {
    var st = ctx.st, tr = st.edit && st.edit.modo === 'transfer';
    st.edit = null;
    ctx.ir(tr ? 'listo' : 'titulares');
  }

  function enviar(ctx) {
    var st = ctx.st, ed = st.edit;
    if (!ed || ed.run) { return; }
    var nombre = ed.nombre.trim(), err = { doc: C.validarDoc(ed.tipo, ed.doc), nombre: '' };
    if (!err.doc) {
      var otro = C.ocupante(st, ed.tipo, ed.doc, ed.n);
      if (otro === -1) { err.doc = 'Ese es tu documento. Para ir tú, activa «Yo también voy».'; }
      else if (otro) { err.doc = 'Este documento ya está en el ingreso ' + otro + '.'; }
    }
    if (nombre.length < 3) { err.nombre = 'Escribe el nombre completo, como aparece en el documento.'; }
    ed.error = err;
    if (err.doc || err.nombre) {
      parcial(ctx, '[data-pca="form"]', formHtml(st, ctx));
      var f = ctx.raiz.querySelector('[data-foco="' + (err.doc ? 'doc' : 'nombre') + '"]');
      if (f) { f.focus(); }
      return;
    }
    var t = { tipo: ed.tipo, num: ed.doc.trim(), nombre: nombre, doc: ed.tipo + ' ' + ed.doc.trim() };
    var tr = ed.modo === 'transfer', cupo = tr ? null : cupoDe(st, ed.n);
    ed.run = true; st.consultando = 2;
    if (cupo) { cupo.estado = 'validando'; cupo.titular = t; cupo.codigo = null; }
    parcial(ctx, '[data-pca="pie"]', pieEnviar(ed));
    ctx.raiz.querySelectorAll('.pca-form input,.pca-form select').forEach(function (n) { n.disabled = true; });
    ctx.consultar(2, function (r) {
      if (st.edit !== ed) { return; }
      ed.run = false; st.consultando = 0; st.edit = null;
      if (tr) {
        var b = ingresoDe(st, ed.n);
        if (r.ok) {
          b.titular = t; b.esPropietario = false; b.noPosible = false;
          ctx.ir('listo', true);
          ctx.toast('Titular cambiado', C.primerNombre(t.nombre) + ' recibe el ingreso ' + ed.n + '.');
        } else { b.noPosible = true; ctx.ir('listo', true); }
        return;
      }
      if (r.ok) {
        cupo.estado = 'ok'; cupo.titular = t;
        ctx.ir('titulares', true);
        ctx.toast('Ingreso asignado', C.primerNombre(t.nombre) + ' entra con el ingreso ' + ed.n + '.');
      } else {
        cupo.estado = 'denegado'; cupo.titular = null; cupo.codigo = r.codigo; cupo.intentos += 1;
        ctx.ir('titulares', true);
      }
    }, { cupo: ed.n, titular: t, transferencia: tr });
  }

  C.registrar('titular', {
    render: renderTitular,
    onInput: function (ev, ctx) {
      var t = ev.target, ed = ctx.st.edit, k = t.dataset && t.dataset.cmp;
      if (!k || !ed) { return; }
      ed[k] = t.value;
      if (k === 'tipo') {
        var ti = ctx.raiz.querySelector('[data-pca="ti"]'), d = ctx.raiz.querySelector('[data-cmp="doc"]');
        if (ti) { ti.hidden = t.value !== 'TI' && t.value !== 'RC'; }
        if (d) { d.setAttribute('inputmode', t.value === 'Pasaporte' ? 'text' : 'numeric'); }
        return;
      }
      // Al corregir se limpia el aviso de ese campo sin repintar, para no perder el foco.
      var campo = k === 'doc' ? 'doc' : 'nombre';
      if (ed.error && ed.error[campo]) {
        ed.error[campo] = '';
        var er = ctx.raiz.querySelector(k === 'doc' ? '#pca-err-doc' : '#pca-err-nom'); if (er) { er.remove(); }
        t.classList.remove('pc-input--error'); t.removeAttribute('aria-invalid'); t.removeAttribute('aria-describedby');
      }
    },
    onClick: function (el, ev, ctx) {
      var a = el.dataset.acc, ed = ctx.st.edit;
      if (a === 'asg-enviar') { enviar(ctx); }
      else if (a === 'asg-volver' && !(ed && ed.run)) { volver(ctx); }
    }
  });
})();
