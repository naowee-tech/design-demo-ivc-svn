/* Superficie 8 · Portal de la persona. Modelo en modeling/desing-views/08-portal-persona.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  var U = window.SVN_UTIL, R = U.rel;
  var DOCS = ['CC', 'TI', 'CE', 'PA', 'PPT', 'PEP', 'RUMV'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var ICO = {
    atras: '<path d="M15 5l-7 7 7 7"/>', salir: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>', alerta: '<path d="M12 4 3 20h18z"/><path d="M12 10v4.5M12 17.2h.01"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', estado: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    ingreso: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.2 3-2.2s2.4.6 3 2.2M14 10h4M14 13h3"/>',
    vinculo: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    lugar: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    mas: '<path d="M6 9l6 6 6-6"/>', cerrar: '<path d="M6 6l12 12M18 6 6 18"/>', candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  function ico(n, t) { return '<svg width="' + (t || 22) + '" height="' + (t || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[n] + '</svg>'; }

  /* ---------- Cada persona ve solo lo suyo: el estado sale del resolver del IVC; aquí solo ingresos y vínculos de las personas fijas ---------- */

  var VINC = 'Documento y resultado de la validación';
  // Personas del SVN sin registro en el IVC: sus ingresos son del guion, con fechas relativas a hoy.
  function fija(k) {
    var f = {
      'CC|1036482117': { ingresos: [
        { id: 'b1', evento: 'Nacional vs. Medellín', fecha: R(0).largo + ' · 19:00', lugar: 'Estadio Atanasio Girardot', sitio: 'Oriental Baja', doc: 'CC •••• 2117', estado: 'usado', nota: 'Entraste hoy por la Puerta 4' },
        { id: 'b2', evento: 'América vs. Once Caldas', fecha: R(5).largo + ' · 16:00', lugar: 'Estadio Olímpico Pascual Guerrero', sitio: 'Occidental', doc: 'CC •••• 2117', estado: 'vigente', nota: 'Entras con tu documento' },
        { id: 'b3', evento: 'Real Cartagena vs. Unión Magdalena', fecha: R(5).largo + ' · 18:30', lugar: 'Estadio Jaime Morón', sitio: 'Oriental', doc: 'CC •••• 2117', estado: 'vigente', nota: 'Te lo asignó Santiago M. · CC •••• 4905' },
        { id: 'b4', evento: 'Millonarios vs. América', fecha: R(1).largo + ' · 20:00', lugar: 'Estadio El Campín', sitio: 'Norte', doc: 'CC •••• 4905', estado: 'transferido', nota: 'Cambiaste el titular a Santiago M. el ' + R(-1).corto }],
        vinculos: [{ id: 'v1', nombre: 'Graderío', desde: R(-67).largo, dato: VINC }, { id: 'v2', nombre: 'Taquilla oficial · Atanasio Girardot', desde: R(-230).largo, dato: VINC }] },
      'CC|1152708339': { ingresos: [
        { id: 'b1', evento: 'Millonarios vs. América', fecha: R(1).largo + ' · 20:00', lugar: 'Estadio El Campín', sitio: 'Occidental', doc: 'CC •••• 8339', estado: 'vigente', nota: 'Entras con tu documento' }],
        vinculos: [{ id: 'v1', nombre: 'Graderío', desde: R(-27).largo, dato: VINC }] }
    };
    return f[k] || { ingresos: [], vinculos: [] };
  }
  // Ventas autorizadas del bus a nombre de este documento: aparecen como ingresos y vinculan a la comercializadora.
  function deVentas(k, doc) {
    var vs = U.leer(function (x) { return x.tipo === 'venta' && x.clave === k && /autorizada/.test(x.detalle); });
    return { ingresos: vs.map(function (x, i) {
      return { id: 'bv' + i, evento: 'Nacional vs. Medellín', fecha: R(0).largo + ' · 19:00', lugar: 'Estadio Atanasio Girardot', sitio: (x.detalle.split(' · ')[1] || 'Oriental'), doc: doc, estado: 'vigente', nota: 'Entras con tu documento' };
    }), vinculos: vs.length ? [{ id: 'vv', nombre: 'Graderío', desde: R(0).largo, dato: VINC }] : [] };
  }
  function enmasc(tipo, num) { return tipo + ' •••• ' + String(num).slice(-4); }
  // Identifica a una persona por documento: el IVC y la demo primero, luego las fijas del SVN. `hoy` desplaza el día de lectura.
  function buscar(tipo, num, hoy) {
    var r = U.res(tipo, num, 'portal', hoy), k = U.clave(tipo, num), id = U.identidad(tipo, num);
    if (!id) { return null; }
    var f = fija(k), v = deVentas(k, enmasc(tipo, num));
    return { tipo: U.cod(tipo), num: digitos(num), clave: k, nombre: id.nombre, visible: r ? r.nombreVisible : id.nombre, doc: r ? r.docVisible : tipo + ' ' + num, menor: !!(r && r.esMenor), r: r,
      ingresos: f.ingresos.concat(v.ingresos), vinculos: f.vinculos.concat(v.vinculos) };
  }

  var CASOS = [
    { id: 'sin', n: 1, corto: 'Persona sin medidas', punto: 'verde', form: { tipo: 'CC', num: '1.036.482.117', nombre: 'Andrés Felipe Restrepo Gil' },
      ve: 'Andrés Felipe Restrepo Gil: Sin medidas vigentes, cuatro ingresos en distintos estados y dos comercializadoras vinculadas.' },
    { id: 'vigente', n: 2, corto: 'Con medida vigente', punto: 'rojo', form: { tipo: 'CC', num: '71.894.447', nombre: 'Julián Andrés Posada' },
      ve: 'Julián Andrés Posada: la medida con autoridad, acto, desde y hasta, y los días que faltan. Una medida cumplida aparte.' },
    { id: 'vencer', n: 3, corto: 'Medida por vencer', punto: 'ambar', form: { tipo: 'CC', num: '1.090.000.004', nombre: 'Liliana Patricia Arango Ruiz' },
      ve: 'Vence en pocos días, según el IVC. Con «Adelantar el reloj» el estado pasa solo a Sin medidas vigentes, sin trámite.' },
    { id: 'menor', n: 4, corto: 'Menor · representante legal', punto: 'rojo', form: { tipo: 'CC', num: '1.090.000.107', nombre: 'Marta Lucía Duarte Gil', menor: true, docMenor: '1.090.000.007' },
      ve: 'Entra la madre y ve solo el estado de su hijo, con un aviso de que consulta como representante.' },
    { id: 'compra', n: 5, corto: 'Desde un bloqueo de la compra', punto: 'rojo', directo: true, desde: { donde: 'Graderío', evento: 'Nacional vs. Medellín · ' + R(0).corto }, form: { tipo: 'CC', num: '71.894.447', nombre: 'Julián Andrés Posada' },
      ve: 'Llega del enlace «consulta tu estado en el portal» de la compra rechazada; ya viene identificado.' },
    { id: 'reg', n: 6, corto: 'Documento no vigente', punto: 'ambar', form: { tipo: 'CC', num: '1.000.000.017', nombre: 'Camilo Torres Díaz' },
      ve: 'El no no es una medida: el documento no aparece vigente en la Registraduría. Dice qué hacer.' },
    { id: 'nombre', n: 7, corto: 'El nombre no coincide', punto: 'ambar', form: { tipo: 'CC', num: '1.152.708.339', nombre: 'Mariana Ríos' },
      ve: 'Corrigiendo el nombre a «Mariana Cárdenas Ríos» la verificación pasa.' }
  ];
  function casoPorId(id) { return CASOS.filter(function (c) { return c.id === id; })[0] || CASOS[0]; }

  // Sobrevive al remontaje: el caso elegido.
  var guardado = { caso: 'sin' };

  window.PANTALLAS.portal = function (raiz, ctx) {
    var D = ctx.D;
    var disp, zoom = 1, timerToast = null, timerVerif = null, scr = 0;
    // Llegar desde «Consultar mi estado» de una compra entra directo al caso con la persona ya identificada.
    try { if (sessionStorage.getItem('svn.portal.desde')) { guardado.caso = 'compra'; } } catch (e) { /* sin almacenamiento */ }
    var st = nuevo(casoPorId(guardado.caso));

    function nuevo(c) {
      var s = { caso: c.id, pantalla: 'id', form: Object.assign({ menor: false, docMenor: '' }, c.form), error: null, verif: false, desde: c.desde || null,
        sujeto: null, rep: null, off: 0, abierto: {}, ingresos: [], vinculos: [], toast: null, otros: null };
      // Desde «Consultar mi estado» de una compra bloqueada llega ya identificada.
      var h = c.directo && llegada();
      if (h) { s.desde = h.desde; s.form = Object.assign(s.form, h.form); }
      if (c.directo) { var p = buscar(s.form.tipo, s.form.num); if (p) { entrar(s, p, null); } }
      return s;
    }
    function llegada() {
      try { var x = JSON.parse(sessionStorage.getItem('svn.portal.desde') || 'null'); sessionStorage.removeItem('svn.portal.desde'); return x && { desde: { donde: x.donde, evento: x.evento }, form: { tipo: x.tipo, num: x.num, nombre: x.nombre } }; } catch (e) { return null; }
    }
    // «Adelantar el reloj» solo desplaza el día de lectura que se le pasa al resolver; el IVC no se toca.
    function hoy() { return U.sumar(U.hoyIso(), st.off); }

    function entrar(s, sujeto, rep) {
      s.sujeto = sujeto; s.rep = rep; s.pantalla = 'estado'; s.error = null; s.verif = false;
      emitirConsulta(sujeto, rep);
      s.ingresos = (sujeto.ingresos || []).map(function (b) { return Object.assign({}, b); });
      s.vinculos = (sujeto.vinculos || []).map(function (v) { return Object.assign({}, v); });
    }

    /* ---------- Medidas: salen del resolver y de GI al día de lectura (hoy, o el simulado) ---------- */

    function medidasDe(p) {
      if (!p || !p.tipo) { return []; }
      return U.medidas(U.res(p.tipo, p.num, 'portal', hoy()), hoy());
    }
    // Cada consulta verificada queda en la auditoría del IVC; el origen 5 es «Portal de la persona».
    function emitirConsulta(p, rep) {
      U.emitir({ tipo: 'consulta', clave: p.clave, evento: U.EVENTO, puerta: 0, origen: 5, detalle: rep ? 'Consulta de estado como representante legal' : 'Consulta de estado en el portal', quien: 'Portal de la persona' });
    }

    /* ---------- Piezas ---------- */

    function kv(k, v) { return '<div class="pt-kv"><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>'; }
    // Formato único de tarjeta: ícono en círculo, línea de contexto, título grande y texto de apoyo.
    function bloque(o) {
      var h = o.h || 2, g = o.el === 'button' ? 'span' : 'h' + h, t = '<' + g + ' class="pt-estado__t' + (h === 1 ? ' pt-h1' : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + (h === 1 ? ' tabindex="-1"' : '') + '>' + o.t + '</' + g + '>';
      return '<' + (o.el || 'section') + ' class="pt-estado pt-estado--' + o.tono + '"' + (o.attrs || '') + '><div class="pt-estado__ic">' + ico(o.ic, 28) + '</div>' +
        (o.etq ? '<p class="pt-etq">' + o.etq + '</p>' : '') + t + (o.d ? '<p class="pt-estado__d">' + o.d + '</p>' : '') + (o.extra || '') + '</' + (o.el || 'section') + '>';
    }
    function aviso(tono, icono, titulo, cuerpo) {
      return bloque({ el: 'div', attrs: ' role="status"', tono: tono, ic: icono, t: esc(titulo), d: cuerpo ? esc(cuerpo) : '' });
    }
    function tag(tono, texto) { return '<span class="pt-tag pt-tag--' + tono + '">' + esc(texto) + '</span>'; }
    function boton(acc, texto, tipo) {
      return '<button type="button" class="pt-btn pt-btn--' + (tipo || 'pri') + '" data-acc="' + acc + '">' + texto + '</button>';
    }

    /* ---------- Pantallas ---------- */

    function pIdentificar() {
      var f = st.form, e = st.error;
      var msg = {
        reg: ['Tu documento no aparece vigente en la Registraduría', 'El no no viene de una medida correctiva. Revisa que el número esté bien escrito. Si lo está, acércate a la Registraduría para actualizar tu documento y vuelve a intentarlo.'],
        nombre: ['El nombre no coincide con el de tu documento', 'Escríbelo igual que en tu cédula, con los dos apellidos y las tildes. Si sigue sin coincidir, pide a la Registraduría corregir tu registro.'],
        rep: ['No encontramos esa representación', 'Revisa el documento del menor. Solo el representante legal registrado puede consultar por él.']
      }[e];
      var alerta = e ? bloque({ el: 'div', attrs: ' role="alert"', tono: 'rojo', ic: 'alerta', t: msg[0], d: msg[1], extra: '<button type="button" class="pt-enlace" data-acc="otros">Ver otros motivos de un no</button>' }) : '';
      var campo = function (et, ctl) { return '<label class="pt-campo"><span>' + et + '</span>' + ctl + '</label>'; };
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Consulta tu estado</h1>' +
        '<p class="pt-p">Identifícate para ver solo lo tuyo: tu estado, tus ingresos y las comercializadoras vinculadas.</p>' +
        '<form class="pt-form" data-form novalidate>' +
          '<label class="pt-check"><input type="checkbox" data-k="menor"' + (f.menor ? ' checked' : '') + '><span>Consulto por un menor de edad que represento</span></label>' +
          '<div class="pt-fila">' + campo(f.menor ? 'Tu documento' : 'Tipo', '<select data-k="tipo">' + DOCS.map(function (d) { return '<option' + (d === f.tipo ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>') +
            campo('Número', '<input data-k="num" inputmode="numeric" autocomplete="off" value="' + esc(f.num) + '">') + '</div>' +
          campo(f.menor ? 'Tu nombre completo' : 'Nombre completo, como en tu documento', '<input data-k="nombre" autocomplete="off" value="' + esc(f.nombre) + '">') +
          (f.menor ? campo('Documento del menor (TI o registro civil)', '<input data-k="docMenor" inputmode="numeric" autocomplete="off" value="' + esc(f.docMenor) + '">') : '') +
          alerta +
          '<button type="submit" class="pt-btn pt-btn--pri" data-acc="verificar"' + (st.verif ? ' disabled' : '') + '>' + (st.verif ? '<span class="pt-giro" aria-hidden="true"></span>Verificando con la Registraduría' : 'Verificar mi identidad') + '</button>' +
        '</form>' +
        '<p class="pt-nota">' + ico('candado', 18) + '<span>Verificamos con la Registraduría Nacional. Esta consulta queda registrada en la auditoría.</span></p></div>';
    }

    function bannerEntrada() {
      var s = st;
      if (s.desde) {
        return aviso('azul', 'info', 'Llegaste desde tu compra en ' + s.desde.donde, s.desde.donde + ' solo supo que la compra no era posible. El motivo lo ves solo tú, aquí.');
      }
      if (s.rep) { return aviso('azul', 'info', 'Consultas como representante legal', 'Estás viendo el estado de ' + s.sujeto.visible + ', a quien representas. Tu consulta queda auditada.'); }
      return '';
    }

    function pEstado() {
      var p = st.sujeto, ms = medidasDe(p), h = hoy();
      var vig = ms.filter(function (m) { return m.vigente; });
      var cum = ms.filter(function (m) { return !m.vigente; });
      var m = vig[0];
      var quien = p.menor ? p.visible : p.nombre.split(' ')[0];
      var cab, medida = '';
      if (m) {
        var porVencer = m.dias <= 30;
        var tono = porVencer ? 'ambar' : 'rojo';
        var avance = Math.max(0, Math.min(100, Math.round((m.total - m.dias) / m.total * 100)));
        cab = bloque({ tono: tono, ic: porVencer ? 'reloj' : 'alerta', etq: (p.menor ? 'Estado de ' + esc(quien) : 'Tu estado') + ' al ' + U.fechaIso(h), h: 1, id: 'pt-h1',
          t: porVencer ? 'Tu medida vence pronto' : (p.menor ? 'Tiene' : 'Tienes') + ' una medida vigente',
          d: '<b class="pt-num">' + m.dias + (m.dias === 1 ? ' día' : ' días') + '</b> restantes' + (porVencer ? ': cuando termine, vuelves a Sin medidas vigentes sin hacer ningún trámite.' : '.') });
        medida = bloque({ tono: tono, ic: 'alerta', etq: 'Vigente', t: esc(m.conductas.join(' · ')), attrs: ' aria-label="La medida"', extra:
          '<dl class="pt-kvs">' + kv('Autoridad que la emitió', m.autoridad) + kv('Acto administrativo', m.acto) + kv('Desde', U.fechaIso(m.desde)) + kv('Hasta', U.fechaIso(m.fin)) + '</dl>' +
          '<div class="pt-prog" role="progressbar" aria-label="Avance de la medida" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + avance + '"><i style="width:' + avance + '%"></i></div>' +
          '<p class="pt-sub">Han pasado ' + avance + ' % del tiempo. Mientras esté vigente no se puede comprar ni entrar a eventos deportivos en el país.</p>' +
          '<button type="button" class="pt-mas" data-acc="hechos" aria-expanded="' + !!st.abierto.hechos + '">Ver los hechos' + ico('mas', 20) + '</button>' +
          (st.abierto.hechos ? '<dl class="pt-kvs pt-kvs--hechos">' + kv('Evento', m.evento) + kv('Fecha de los hechos', U.fechaIso(m.hechos)) + kv('Qué pasó', m.descripcion || 'Hechos descritos en el informe de la autoridad.') + '</dl>' : '') }) +
          boton('controvertir', 'Cómo controvertirla', 'sec');
      } else {
        cab = bloque({ tono: 'verde', ic: 'check', etq: (p.menor ? 'Estado de ' + esc(quien) : 'Tu estado') + ' al ' + U.fechaIso(h), h: 1, id: 'pt-h1', t: 'Sin medidas vigentes',
          d: cum.length && st.off > 0 ? 'La medida se cumplió y tu estado cambió solo, sin trámite.' : 'No hay ninguna medida correctiva que te impida comprar o entrar a un evento.' });
      }
      var cumplidas = cum.length ? bloque({ tono: 'gris', ic: 'check', t: 'Medidas cumplidas', attrs: ' aria-label="Medidas cumplidas"', extra: cum.map(function (c) {
        return '<div class="pt-fila-c"><b>' + esc(c.conductas.join(' · ')) + '</b><span class="pt-sub">' + esc(c.acto) + ' · ' + esc(c.autoridad) + '</span><span class="pt-sub">Cumplida el ' + U.fechaIso(U.sumar(c.fin, 1)) + '</span></div>';
      }).join('') + '<p class="pt-sub">Una medida cumplida ya no bloquea nada.</p>' }) : '';
      var ayuda = bloque({ el: 'button', attrs: ' type="button" data-acc="otros"', tono: 'azul', ic: 'info', t: '¿Te dijeron que no y no tienes una medida?' });
      return '<div class="pt-body" data-sc="cuerpo">' + bannerEntrada() + cab + medida + cumplidas + ayuda +
        '<p class="pt-nota">' + ico('candado', 18) + '<span>Esta consulta quedó registrada en la auditoría, como cualquier otra.</span></p></div>';
    }

    function pControvertir() {
      var m = medidasDe(st.sujeto).filter(function (x) { return x.vigente; })[0];
      var aut = m ? m.autoridad : 'la autoridad competente que la emitió';
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Cómo controvertirla</h1>' + tag('azul', 'Exploratorio') +
        '<p class="pt-p">Este portal solo muestra lo que la autoridad registró: no puede modificar ni levantar una medida. Quien puede revisarla es la autoridad que la emitió.</p>' +
        bloque({ tono: 'gris', ic: 'lugar', t: 'A quién acudir', extra: '<dl class="pt-kvs">' + kv('Autoridad competente', aut) + kv('Acto que debes citar', m ? m.acto : '—') +
          kv('Dirección', 'Carrera 52 # 71-33, Medellín') + kv('Horario', 'Lunes a viernes · 8:00 a 16:00') + kv('Teléfono', '(604) 555 0114') + '</dl>' +
          '<ol class="pt-pasos"><li>Reúne tu documento y el acto administrativo.</li><li>Presenta tu solicitud por escrito ante la autoridad.</li><li>Si la autoridad la modifica, el registro se actualiza solo y aquí verás el cambio.</li></ol>' }) +
        aviso('azul', 'info', 'Aún sin confirmar', 'Los documentos no definen si la apelación la recibe el IVC o la autoridad competente. Datos de contacto ficticios.') +
        '<a class="pt-btn pt-btn--sec" href="tel:+576045550114">' + ico('tel', 20) + 'Llamar a la autoridad</a></div>';
    }

    function pOtros() {
      var items = [
        ['reg', 'Tu documento no aparece vigente en la Registraduría', 'La Registraduría no lo reconoce como vigente. Revisa el número y, si es correcto, acércate a una sede para actualizarlo. No tiene que ver con medidas correctivas.'],
        ['nombre', 'El nombre no coincide', 'El nombre que diste no es igual al de tu documento. Escríbelo con los dos apellidos y las tildes; si el registro tiene un error, la Registraduría debe corregirlo.'],
        ['limite', 'Llegaste al límite de ingresos del partido', 'Cada persona puede comprar hasta 5 ingresos por partido, sumando todas las comercializadoras. No es una medida correctiva.']
      ];
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Otros motivos de un no</h1>' +
        '<p class="pt-p">Un no no siempre es una medida correctiva. Estos son los otros casos y qué hacer en cada uno.</p>' +
        items.map(function (i) {
          var ab = !!(st.otros === i[0]);
          return bloque({ tono: 'ambar', ic: 'info', t: '<button type="button" class="pt-mas" data-acc="otro" data-id="' + i[0] + '" aria-expanded="' + ab + '"><span>' + esc(i[1]) + '</span>' + ico('mas', 20) + '</button>', d: ab ? esc(i[2]) : '' });
        }).join('') + '</div>';
    }

    var ESTADO_B = { usado: ['gris', 'Ya ingresaste'], vigente: ['verde', 'Vigente'], transferido: ['gris', 'Cambiaste el titular'] };
    function pIngresos() {
      var p = st.sujeto, bs = st.ingresos, vig = medidasDe(p).some(function (m) { return m.vigente; });
      var cuerpo = bs.length ? bs.map(function (b) {
        var e = ESTADO_B[b.estado];
        return bloque({ el: 'article', tono: e[0], ic: 'ingreso', etq: e[1], t: 'Tu ingreso a ' + esc(b.evento), d: '<span class="pt-sub">' + ico('cal', 16) + esc(b.fecha) + '</span><span class="pt-sub">' + ico('lugar', 16) + esc(b.lugar) + ' · ' + esc(b.sitio) + '</span><span class="pt-sub">' + ico('estado', 16) + 'Con el documento ' + esc(b.doc) + '</span><b class="pt-bl">' + esc(b.nota) + '</b>' });
      }).join('') : bloque({ tono: 'gris', ic: 'ingreso', t: vig ? 'Sin ingresos por ahora' : 'No tienes ingresos',
        d: vig ? 'Con una medida vigente no puedes comprar ni que te asignen un ingreso.' : 'Cuando compres o te asignen un ingreso, aparecerá aquí con tu documento.' });
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Mis ingresos</h1><p class="pt-p">A qué partidos tienes derecho a entrar y con qué documento. Puedes cambiar el titular desde la comercializadora hasta el inicio del partido.</p>' + (st.rep ? aviso('azul', 'info', 'Ingresos de ' + p.visible, 'Ves solo los que están con su documento.') : '') + cuerpo + '</div>';
    }

    function pVinculos() {
      var vs = st.vinculos, p = st.sujeto;
      var lista = vs.length ? vs.map(function (v) {
        return bloque({ el: 'article', tono: 'verde', ic: 'vinculo', etq: 'Vinculada', t: esc(v.nombre), d: 'Desde ' + esc(v.desde) + '. Comparte: ' + esc(v.dato.toLowerCase()) + '.' + (v.porRep ? ' La vinculó su representante legal.' : '') });
      }).join('') : bloque({ tono: 'gris', ic: 'vinculo', t: 'Sin comercializadoras vinculadas', d: 'Cuando compres en una, podrás verla aquí.' });
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Consentimientos y vínculos</h1><h2 class="pt-h2 pt-h2--s">Comercializadoras</h2>' + lista + '</div>';
    }

    /* ---------- Marco ---------- */

    function top() {
      var atras = st.pantalla === 'controvertir' || (st.pantalla === 'otros');
      var atrasBtn = atras ? '<button type="button" class="pt-ib" data-acc="atras" aria-label="Volver">' + ico('atras', 24) + '</button>' : '';
      var salirBtn = st.sujeto ? '<button type="button" class="pt-ib pt-ib--salir" data-acc="salir-portal" aria-label="Salir del portal">' + ico('salir', 22) + '</button>' : '';
      var centro = atras ? '<span class="pt-top__t">Portal de la persona</span>' :
        '<img class="pt-top__logo" src="assets/mindeporte.svg" alt="Ministerio del Deporte"><span class="pt-top__t">Portal de la persona</span>';
      return '<header class="pt-top">' + atrasBtn + '<div class="pt-top__centro">' + centro + '</div>' + salirBtn + '</header>';
    }
    function nav() {
      if (!st.sujeto || st.pantalla === 'id') { return ''; }
      var cur = (st.pantalla === 'controvertir' || st.pantalla === 'otros') ? 'estado' : st.pantalla;
      var it = function (id, ic, t) { return '<button type="button" class="pt-tab" data-acc="tab" data-id="' + id + '"' + (cur === id ? ' aria-current="page"' : '') + '>' + ico(ic, 24) + '<span>' + t + '</span></button>'; };
      return '<nav class="pt-nav" aria-label="Secciones">' + it('estado', 'estado', 'Mi estado') + it('ingresos', 'ingreso', 'Ingresos') + it('vinculos', 'vinculo', 'Vínculos') + '</nav>';
    }
    function toastHtml() {
      return st.toast ? '<nwt-toast class="pp-toast pt-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }
    function contenido() {
      var cuerpo = { id: pIdentificar, estado: pEstado, controvertir: pControvertir, otros: pOtros, ingresos: pIngresos, vinculos: pVinculos }[st.pantalla]();
      return '<div class="pt-app">' + top() + cuerpo + nav() + toastHtml() + '</div>';
    }

    /* ---------- Panel del demo y equipo ---------- */

    function tarjeta(titulo, cuerpo, id) { return '<nwt-card class="pp-panel__card"' + (id ? ' id="' + id + '"' : '') + ' nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    function itemCaso(c) {
      var mapa = { verde: ['positive', 'positive'], rojo: ['negative', 'negative'], ambar: ['caution', 'warning'] }[c.punto];
      return '<nwt-detail-item actionable class="pt-caso" icon="' + mapa[0] + '" nwt-theme="' + mapa[1] + '" data-caso="' + c.id + '">' + c.n + ' · ' + esc(c.corto) + '</nwt-detail-item>';
    }
    function guion() {
      return '<aside class="pp-panel" aria-label="Controles del demo"><button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Probar', '<div class="pp-panel__lista">' + CASOS.map(itemCaso).join('') + '</div>') +
        tarjeta('Este caso', '<div id="pt-info" class="pt-info"></div>') +
        tarjeta('Condiciones', '<div class="pp-panel__lista" id="pt-reloj"></div>', 'pt-cond') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p></aside>';
    }
    function pintarPanel() {
      var c = casoPorId(guardado.caso);
      var i = raiz.querySelector('#pt-info'); if (i) { i.innerHTML = '<p>' + esc(c.ve) + '</p>'; }
      raiz.querySelectorAll('.pt-caso').forEach(function (n) { n.classList.toggle('pt-caso--activo', n.dataset.caso === c.id); });
      var r = raiz.querySelector('#pt-reloj');
      if (r) {
        var m = st.sujeto && medidasDe(st.sujeto).filter(function (x) { return x.vigente; })[0];
        var pasa = st.off > 0 && !m;
        r.innerHTML = m || pasa ? '<nwt-detail-item actionable icon="calendar" nwt-theme="informative" data-acc="reloj">' + (pasa ? 'Volver a hoy · ' + R(0).largo : 'Adelantar el reloj hasta que venza') + '</nwt-detail-item>' : '';
        // Sin interruptores ni reloj, la tarjeta quedaría vacía.
        var cd = raiz.querySelector('#pt-cond'); if (cd) { cd.style.display = r.innerHTML ? '' : 'none'; }
      }
    }
    function estadoBarra() { return '<div class="pp-estado" aria-hidden="true"><span>10:14</span><span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>'; }

    function clave(el) { var d = el.dataset || {}; return d.k ? 'k:' + d.k : d.acc ? 'a:' + d.acc + ':' + (d.id || '') : null; }
    function pintar(cambio) {
      var activo = document.activeElement, kf = activo && disp.contains(activo) ? clave(activo) : null, sel = null;
      try { if (kf && activo.selectionStart != null) { sel = [activo.selectionStart, activo.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      var c = disp.querySelector('[data-sc]'); if (c && !cambio) { scr = c.scrollTop; }
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--celular"><div class="pp-pantalla">' + estadoBarra() + contenido() + '</div></div></div>';
      c = disp.querySelector('[data-sc]'); if (c) { c.scrollTop = cambio ? 0 : scr; }
      if (cambio) { var h = disp.querySelector('h1'); if (h) { h.focus({ preventScroll: true }); } }
      else if (kf) {
        var els = disp.querySelectorAll('[data-k],[data-acc]');
        for (var i = 0; i < els.length; i++) {
          if (clave(els[i]) === kf && !els[i].disabled) { els[i].focus({ preventScroll: true }); try { if (sel) { els[i].setSelectionRange(sel[0], sel[1]); } } catch (e) { /* sin selección */ } break; }
        }
      }
      pintarPanel();
      escalar();
    }
    function escalar() {
      SPLASH.ver(disp);
      var e = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!e || !m) { return; }
      var k = Math.min((e.clientWidth - 48) / m.offsetWidth, (e.clientHeight - 88) / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }
    function avisar(t, m, th, i) {
      st.toast = { t: t, m: m, th: th || 'positive', i: i || 'positive' };
      pintar(false);
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; var n = disp.querySelector('.pt-toast'); if (n) { n.remove(); } }, 3200);
    }

    /* ---------- Acciones ---------- */

    function verificar() {
      var f = st.form, d = digitos(f.num), p = f.menor ? null : buscar(f.tipo, f.num, hoy()), hijo = f.menor ? buscar('TI', f.docMenor) : null;
      st.error = null; st.verif = true; pintar(false);
      clearTimeout(timerVerif);
      timerVerif = setTimeout(function () {
        st.verif = false;
        if (f.menor) {
          // El menor solo lo consulta su representante legal registrado en el IVC.
          var rp = hijo && hijo.menor && U.representante(hijo.r);
          if (!rp || rp.num !== d || rp.tipo !== U.cod(f.tipo)) { st.error = 'rep'; }
          else if (norm(f.nombre) !== norm(rp.nombre)) { st.error = 'nombre'; }
          else { entrar(st, hijo, { nombre: rp.nombre }); }
        } else if (!p) { st.error = 'reg'; }
        else if (norm(f.nombre) !== norm(p.nombre)) { st.error = 'nombre'; }
        else { entrar(st, p, null); }
        pintar(!!st.sujeto);
      }, 1000);
    }

    function elegirCaso(id) {
      clearTimeout(timerVerif);
      guardado.caso = id;
      st = nuevo(casoPorId(id));
      pintar(true);
    }

    function onClick(ev) {
      // El check del menor queda marcado: un clic en la etiqueta solo lo marca; desmarcar es solo clic directo en el check (DC-378).
      var lab = ev.target.closest('label.pt-check'), chk = lab && lab.querySelector('input[data-k="menor"]');
      if (chk && ev.target !== chk) { ev.preventDefault(); if (!chk.checked) { chk.checked = true; chk.dispatchEvent(new Event('change', { bubbles: true })); } return; }
      var cas = ev.target.closest('[data-caso]');
      if (cas) { elegirCaso(cas.dataset.caso); return; }
      var z = ev.target.closest('[data-zoom]');
      if (z) { zoom = z.dataset.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      var el = ev.target.closest('[data-acc]');
      if (!el || el.disabled || el.type === 'checkbox') { return; }
      var d = el.dataset;
      switch (d.acc) {
        case 'salir': ctx.salir(); return;
        case 'cerrar-toast': st.toast = null; break;
        case 'verificar': ev.preventDefault(); verificar(); return;
        case 'tab': st.pantalla = d.id; pintar(true); return;
        case 'atras': st.pantalla = st.sujeto ? 'estado' : 'id'; pintar(true); return;
        case 'controvertir': st.pantalla = 'controvertir'; pintar(true); return;
        case 'otros': st.pantalla = 'otros'; st.otros = st.error || st.otros; pintar(true); return;
        case 'otro': st.otros = st.otros === d.id ? null : d.id; break;
        case 'hechos': st.abierto.hechos = !st.abierto.hechos; break;
        case 'salir-portal': var formPrevio = st.form; st = nuevo(casoPorId(guardado.caso)); st.form = formPrevio; st.sujeto = null; st.pantalla = 'id'; st.desde = null; pintar(true); return;
        case 'reloj': st.off = st.off > 0 ? 0 : (function () { var m = medidasDe(st.sujeto).filter(function (x) { return x.vigente; })[0]; return m ? m.dias + 1 : 0; })(); pintar(false); return;
      }
      pintar(false);
    }
    function onSubmit(ev) { if (ev.target.matches('[data-form]')) { ev.preventDefault(); verificar(); } }
    function onInput(ev) {
      var el = ev.target;
      if (el.dataset && el.dataset.k && el.type !== 'checkbox' && el.tagName !== 'SELECT') { st.form[el.dataset.k] = el.value; }
    }
    function onCambio(ev) {
      var el = ev.target, d = el.dataset || {};
      if (!d.k) { return; }
      st.form[d.k] = el.type === 'checkbox' ? el.checked : el.value;
      st.error = null;
      if (d.k === 'menor') {
        st.form.num = el.checked ? '1.090.000.107' : '1.036.482.117'; st.form.nombre = el.checked ? 'Marta Lucía Duarte Gil' : 'Andrés Felipe Restrepo Gil'; st.form.tipo = 'CC'; st.form.docMenor = el.checked ? '1.090.000.007' : '';
      }
      pintar(false);
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + window.SVN_TOOLBAR({ titulo: 'Portal de la persona', subtitulo: 'Superficie 8 · Web móvil · Persona y representante legal', acciones: [{ texto: 'Cambiar de perfil', acc: 'salir' }] }) +
      '<div class="pp-demo__cuerpo">' + guion() + '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles"><div class="pp-zoom">' +
        '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
      '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('portal');
    disp = raiz.querySelector('#dispositivo');

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('submit', onSubmit);
    raiz.addEventListener('input', onInput);
    raiz.addEventListener('change', onCambio);
    window.addEventListener('resize', escalar);
    pintar(true);
    requestAnimationFrame(escalar);

    return function () {
      clearTimeout(timerToast); clearTimeout(timerVerif);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('submit', onSubmit);
      raiz.removeEventListener('input', onInput);
      raiz.removeEventListener('change', onCambio);
      window.removeEventListener('resize', escalar);
    };
  };
})();
