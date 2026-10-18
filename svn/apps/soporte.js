/* Superficie 9 · Consola de soporte. Modelo en modeling/desing-views/09-consola-soporte.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function mask(doc) { var d = digitos(doc); return String(doc).split(' ')[0] + ' •••• ' + d.slice(-4); }

  var ICO = {
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 0 8 0v4"/>', buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', hielo: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
    ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', no: '<path d="M6 6l12 12M18 6 6 18"/>', info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    salir: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>', alerta: '<path d="M12 4 3 20h18z"/><path d="M12 10v4.5M12 17.2h.01"/>'
  };
  function ico(n, t) { return '<svg width="' + (t || 18) + '" height="' + (t || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[n] + '</svg>'; }

  /* ---------- Datos ficticios. Todo es relativo a hoy; la consola abre a las 18:44, con Nacional vs. Medellín por empezar ---------- */

  var U = window.SVN_UTIL, R = U.rel;
  function dia(off) { return R(off).corto; }
  function T(off, h, m) { var d = U.parse(R(off).iso); d.setHours(h, m, 0, 0); return d.getTime(); }
  var AHORA = T(0, 18, 44);
  var EV = {
    mil: { nombre: 'Millonarios vs. América', lugar: 'Estadio El Campín', cuando: dia(1) + ' · 20:00', inicio: T(1, 20, 0) },
    nal: { nombre: 'Nacional vs. Medellín', lugar: 'Estadio Atanasio Girardot', cuando: 'hoy · 19:00', inicio: T(0, 19, 0) },
    ant: { nombre: 'Medellín vs. Junior', lugar: 'Estadio Atanasio Girardot', cuando: dia(-1) + ' · 17:00', inicio: T(-1, 17, 0) },
    car: { nombre: 'Real Cartagena vs. Unión Magdalena', lugar: 'Estadio Jaime Morón', cuando: dia(5) + ' · 18:30', inicio: T(5, 18, 30) },
    ame: { nombre: 'América vs. Once Caldas', lugar: 'Estadio Olímpico Pascual Guerrero', cuando: dia(5) + ' · 16:00', inicio: T(5, 16, 0) }
  };
  var INICIO_HOY = EV.mil.inicio;

  var MOTIVOS_RECHAZO = [
    'La medida solo la revisa la autoridad que la emitió',
    'Después del inicio del encuentro no se puede hacer nada',
    'El derecho de ingreso es de otro documento',
    'Reclamación duplicada',
    'No se pudo verificar a quien reclama'
  ];
  var RES = {
    congelados: ['Titularidad transferida a otro documento elegible'],
    sinderecho: ['Se confirmó que el derecho está en otro documento y se orientó a cambiar el titular desde la comercializadora', 'Se confirmó que el derecho existe y se orientó a la puerta de su sector'],
    medida: ['Se orientó a consultar su estado en el portal de la persona'],
    identidad: ['Se orientó a corregir el nombre con la Registraduría'],
    usada: ['Se confirmó el ingreso previo: el derecho no se reemite'],
    puerta: ['Se confirmó el sector del derecho y se indicó la puerta que le corresponde'],
    prestada: ['Se registró el reporte de cédula prestada y quedó en la auditoría', 'Se orientó a la persona sobre su derecho de ingreso y su documento'],
    limite: ['Se orientó sobre el límite de ingresos por persona']
  };
  var TIPOS = { congelados: 'Derechos de ingreso congelados', sinderecho: 'Documento sin derecho en la puerta', medida: 'Compra rechazada por medida', identidad: 'Identidad no coincide', usada: 'Ya ingresó', puerta: 'Puerta equivocada', prestada: 'Cédula prestada reportada', limite: 'Límite de ingresos' };

  // Pasos de traza que se repiten: la compra del derecho y su registro (nace al pagar, por documento).
  function compra(d, h, doc, sector, yo) {
    return [[d + ' · ' + h, 'Consulta 1 · ¿Puede comprar?', 'ok', 'Autorizado · Graderío'], [d + ' · ' + h, 'Consulta 2 · ¿Puede recibir?', 'ok', 'Titular ' + doc + ' · Autorizado'],
      [d + ' · ' + h, 'Consulta 3 · Revalida al pagar', 'ok', 'Comprador y todos los titulares · Autorizado'], [d + ' · ' + h, 'Derecho de ingreso registrado', 'info', doc + ' · ' + sector + (yo ? ' · «Yo también voy»' : '')]];
  }

  function nuevosCasos() {
    return [
      { id: 'R-2026-0187', tipo: 'congelados', estado: 'abierta', quien: { n: 'Daniela Gómez Arias', doc: 'CC 1.017.889.214' }, ev: EV.mil, recibida: 'Hoy · 09:48',
        dice: 'Mi pareja compró 4 ingresos para el partido de mañana y le dijeron que no puede seguir. Dos eran para mí y mi familia. ¿Pueden pasarlos a mi documento?',
        derechos: [
          { cod: 'DI-MIL-0412', est: 'congelado', tit: 'CC •••• 3301', prop: 'Comprador CC •••• 7120', sector: 'Occidental',
            traza: compra(dia(-2), '16:41', 'CC •••• 3301', 'Occidental').concat([[dia(0) + ' · 08:02', 'Medida nueva del comprador', 'no', 'El derecho se congeló: solo soporte puede transferir su titularidad']]) },
          { cod: 'DI-MIL-0413', est: 'congelado', tit: 'CC •••• 3302', prop: 'Comprador CC •••• 7120', sector: 'Occidental',
            traza: compra(dia(-2), '16:41', 'CC •••• 3302', 'Occidental').concat([[dia(0) + ' · 08:02', 'Medida nueva del comprador', 'no', 'El derecho se congeló: solo soporte puede transferir su titularidad']]) },
          { cod: 'DI-MIL-0411', est: 'anulado', tit: 'CC •••• 7120', prop: 'Comprador CC •••• 7120', sector: 'Occidental',
            traza: compra(dia(-2), '16:41', 'CC •••• 7120', 'Occidental', true).concat([[dia(0) + ' · 08:02', 'Medida nueva del comprador', 'no', 'El derecho del documento sancionado se anuló']]) },
          { cod: 'DI-MIL-0414', est: 'vigente', tit: 'CC •••• 3380', prop: 'Comprador CC •••• 7120', sector: 'Occidental',
            traza: compra(dia(-2), '16:41', 'CC •••• 3380', 'Occidental').concat([[dia(0) + ' · 08:02', 'Medida nueva del comprador', 'ok', 'No lo afecta: sigue vigente']]) }
        ],
        historial: [{ t: 'Hoy · 09:48', x: 'Reclamación recibida por el canal web', q: 'Daniela Gómez Arias' }] },
      { id: 'R-2026-0184', tipo: 'sinderecho', estado: 'en gestión', quien: { n: 'Sebastián Cardona Ruiz', doc: 'CC 1.152.708.664' }, ev: EV.mil, recibida: 'Hoy · 09:21',
        dice: 'Compré en Graderío y ya me cobraron, pero en la puerta me dijeron que mi documento no tiene derecho de ingreso a este partido.',
        derechos: [{ cod: 'DI-MIL-0377', est: 'vigente', tit: 'CC •••• 8646', prop: 'Comprador CC •••• 8664', sector: 'Occidental',
          traza: compra(dia(-8), '18:02', 'CC •••• 8646', 'Occidental', false).concat([[dia(0) + ' · 09:10', 'Lectura en puerta · CC •••• 8664', 'no', 'Rojo operativo · sin derecho de ingreso a este partido'], [dia(0) + ' · 09:21', 'Reclamación abierta', 'info', 'El derecho existe, pero está en el documento CC •••• 8646']]) }],
        historial: [{ t: 'Hoy · 09:21', x: 'Reclamación recibida por el canal web', q: 'Sebastián Cardona Ruiz' }, { t: 'Hoy · 09:40', x: 'Caso tomado', q: 'Marcela Duque' }] },
      { id: 'R-2026-0181', tipo: 'medida', estado: 'abierta', quien: { n: 'Julián Andrés Posada', doc: 'CC 71.894.447' }, ev: EV.car, recibida: 'Ayer · 16:30',
        dice: 'No me dejaron comprar el ingreso y yo nunca he tenido problemas. Quiero saber por qué.',
        derechos: [{ cod: 'Intento de compra · ' + dia(-1), est: 'sin derecho', tit: '—', prop: 'CC •••• 4447', sector: 'Oriental',
          traza: [[dia(-1) + ' · 15:08', 'Consulta 1 · ¿Puede comprar?', 'no', 'Denegado'], [dia(-1) + ' · 15:08', 'Código de motivo', 'no', 'Medida restrictiva vigente'], [dia(-1) + ' · 15:08', 'Qué vio la comercializadora', 'info', 'Solo «no es posible continuar» y el enlace al portal']] }],
        historial: [{ t: 'Ayer · 16:30', x: 'Reclamación recibida por el canal web', q: 'Julián Andrés Posada' }] },
      { id: 'R-2026-0178', tipo: 'identidad', estado: 'abierta', quien: { n: 'Camilo Torres Díaz', doc: 'CC 1.000.000.017' }, ev: EV.car, recibida: 'Ayer · 11:05',
        dice: 'Mi cédula está bien y me dicen que mi nombre no coincide.',
        derechos: [{ cod: 'Intento de compra · ' + dia(-1), est: 'sin derecho', tit: '—', prop: 'CC •••• 0017', sector: 'Norte',
          traza: [[dia(-1) + ' · 10:51', 'Consulta 1 · ¿Puede comprar?', 'no', 'Denegado'], [dia(-1) + ' · 10:51', 'Registraduría', 'no', 'Identidad no coincide'], [dia(-1) + ' · 10:52', 'Segundo intento', 'no', 'Identidad no coincide']] }],
        historial: [{ t: 'Ayer · 11:05', x: 'Reclamación recibida por el canal web', q: 'Camilo Torres Díaz' }] },
      { id: 'R-2026-0173', tipo: 'usada', estado: 'en gestión', quien: { n: 'Mateo Giraldo Paz', doc: 'CC 1.001.246.583' }, ev: EV.nal, recibida: 'Hoy · 18:41',
        dice: 'En la puerta me dijeron que mi documento ya había ingresado. Yo no había entrado.',
        derechos: [{ cod: 'DI-NAL-1180', est: 'usado', tit: 'CC •••• 6583', prop: 'Comprador CC •••• 6583', sector: 'Oriental Baja',
          traza: compra(dia(-9), '12:08', 'CC •••• 6583', 'Oriental Baja', true).concat([[dia(0) + ' · 17:58', 'Lectura en puerta', 'ok', 'Entró · Puerta 2 · Norte · documento escaneado'], [dia(0) + ' · 18:40', 'Lectura en puerta', 'no', 'Rojo operativo · ya ingresó · Puerta 4']]) }],
        historial: [{ t: 'Hoy · 18:41', x: 'Reclamación recibida por el canal web', q: 'Mateo Giraldo Paz' }, { t: 'Hoy · 18:43', x: 'Caso tomado', q: 'Marcela Duque' }] },
      { id: 'R-2026-0191', tipo: 'prestada', estado: 'abierta', quien: { n: 'Andrés Zuluaga Mejía', doc: 'CC 1.017.335.902' }, ev: EV.nal, recibida: 'Hoy · 18:42',
        dice: 'Alguien intentó entrar con mi cédula y el operador marcó «posible cédula prestada». Yo no presté mi cédula y no pude entrar.',
        derechos: [{ cod: 'DI-NAL-1176', est: 'vigente', tit: 'CC •••• 5902', prop: 'Comprador CC •••• 5902', sector: 'Oriental Baja',
          traza: compra(dia(-9), '11:30', 'CC •••• 5902', 'Oriental Baja', true).concat([[dia(0) + ' · 18:38', 'Lectura en puerta · Puerta 6 · Sur', 'no', 'Rojo operativo · posible cédula prestada · la foto del documento no coincide con la persona'], [dia(0) + ' · 18:40', 'Decisión del operador', 'info', 'Llamó a la autoridad'], [dia(0) + ' · 18:42', 'Reclamación abierta', 'info', 'La persona reporta que su cédula fue usada por otra persona']]) }],
        historial: [{ t: 'Hoy · 18:42', x: 'Reclamación recibida por el canal web', q: 'Andrés Zuluaga Mejía' }] },
      { id: 'R-2026-0165', tipo: 'puerta', estado: 'abierta', quien: { n: 'Camilo Andrés Vélez Soto', doc: 'CC 1.020.553.771' }, ev: EV.nal, recibida: 'Hoy · 17:20',
        dice: 'En la puerta me dijeron que no era la mía y me mandaron a otra. Quiero saber cuál me corresponde.',
        derechos: [{ cod: 'DI-NAL-1202', est: 'vigente', tit: 'CC •••• 3771', prop: 'Comprador CC •••• 3771', sector: 'Sur',
          traza: compra(dia(-4), '14:02', 'CC •••• 3771', 'Sur').concat([[dia(0) + ' · 17:12', 'Lectura en puerta · Puerta 4 · Oriental', 'no', 'Rojo operativo · puerta equivocada · se indicó la Puerta 6 · Sur'], [dia(0) + ' · 17:20', 'Reclamación abierta', 'info', 'La persona pide confirmar su puerta']]) }],
        historial: [{ t: 'Hoy · 17:20', x: 'Reclamación recibida por el canal web', q: 'Camilo Andrés Vélez Soto' }] },
      { id: 'R-2026-0160', tipo: 'limite', estado: 'en gestión', quien: { n: 'Cristian Muñoz Henao', doc: 'CC 1.128.403.552' }, ev: EV.ame, recibida: dia(-2) + ' · 13:44',
        dice: 'Quise comprar 2 ingresos más y no me dejó. Dice que llegué al límite.',
        derechos: [{ cod: 'Intento de compra · ' + dia(-2), est: 'sin derecho', tit: '—', prop: 'CC •••• 3552', sector: 'Occidental',
          traza: [[dia(-2) + ' · 13:30', 'Consulta 1 · ¿Puede comprar?', 'no', 'Denegado'], [dia(-2) + ' · 13:30', 'Código de motivo', 'no', 'Límite de venta excedido'], [dia(-2) + ' · 13:31', 'Ingresos que ya tiene', 'info', '4 de 5 para este partido']] }],
        historial: [{ t: dia(-2) + ' · 13:44', x: 'Reclamación recibida por el canal web', q: 'Cristian Muñoz Henao' }, { t: dia(-2) + ' · 15:10', x: 'Caso tomado', q: 'Marcela Duque' }] },
      { id: 'R-2026-0152', tipo: 'congelados', estado: 'resuelta', quien: { n: 'Paula Andrea Henao Restrepo', doc: 'CC 1.040.221.908' }, ev: EV.nal, recibida: dia(-3) + ' · 10:02',
        dice: 'A mi hermano le congelaron un ingreso por una medida y necesito que pase a mi documento.',
        derechos: [{ cod: 'DI-NAL-0990', est: 'vigente', tit: 'CC •••• 1908', prop: 'Comprador CC •••• 2240', sector: 'Sur',
          traza: compra(dia(-5), '09:11', 'CC •••• 2240', 'Sur').concat([[dia(-3) + ' · 07:30', 'Medida nueva del comprador', 'no', 'El derecho se congeló'], [dia(-3) + ' · 14:20', 'Titularidad transferida por soporte', 'ok', 'A CC •••• 1908 · validada a los dos lados']]) }],
        historial: [{ t: dia(-3) + ' · 10:02', x: 'Reclamación recibida por el canal web', q: 'Paula Andrea Henao Restrepo' }, { t: dia(-3) + ' · 13:55', x: 'Caso tomado', q: 'Marcela Duque' }, { t: dia(-3) + ' · 14:20', x: 'Titularidad transferida · 1 ingreso', q: 'Marcela Duque' }, { t: dia(-3) + ' · 14:21', x: 'Resuelta · titularidad transferida a otro documento elegible', q: 'Marcela Duque' }] },
      { id: 'R-2026-0149', tipo: 'congelados', estado: 'rechazada', quien: { n: 'Daniela Restrepo Gil', doc: 'CE 4.518.227' }, ev: EV.ant, recibida: 'Ayer · 17:20',
        dice: 'Quiero que pasen a mi documento los ingresos congelados de un familiar. El partido ya empezó.',
        derechos: [{ cod: 'DI-NAL-1244', est: 'congelado', tit: 'CC •••• 4402', prop: 'Comprador CC •••• 9027', sector: 'Norte',
          traza: compra(dia(-3), '17:58', 'CC •••• 4402', 'Norte').concat([[dia(-2) + ' · 08:15', 'Medida nueva del comprador', 'no', 'El derecho se congeló: solo soporte puede transferir su titularidad'], [dia(-1) + ' · 17:00', 'Inicio del encuentro', 'info', 'Desde aquí no se transfiere nada']]) }],
        historial: [{ t: 'Ayer · 17:20', x: 'Reclamación recibida por el canal web', q: 'Daniela Restrepo Gil' }, { t: 'Ayer · 17:35', x: 'Caso tomado', q: 'Marcela Duque' }, { t: 'Ayer · 17:41', x: 'Rechazada · después del inicio del encuentro no se puede hacer nada', q: 'Marcela Duque' }] }
    ];
  }

  // Quien recibe se valida como en la compra: documento conocido, sin medida en el IVC y un derecho por documento y por evento.
  var YA_TIENEN = { 'CC|1152708339': true };
  function destino(tipo, num) {
    var id = U.identidad(tipo, num), r = U.res(tipo, num, 'soporte'), k = U.clave(tipo, num);
    if (!id) { return { n: '', ok: false, cod: 'Documento no válido' }; }
    var n = r ? r.nombreVisible : id.nombre;
    if (r && r.bloquea) { return { n: n, ok: false, cod: 'Medida restrictiva vigente' }; }
    if (YA_TIENEN[k] || U.leer(function (x) { return x.tipo === 'venta' && x.clave === k && /autorizada/.test(x.detalle); }).length) { return { n: n, ok: false, cod: 'Ya tiene derecho de ingreso a este partido' }; }
    return { n: n, ok: true };
  }

  var FILTROS = [['todas', 'Todas'], ['abierta', 'Abiertas'], ['en gestión', 'En gestión'], ['resuelta', 'Resueltas'], ['rechazada', 'Rechazadas']];
  var TAG = { 'abierta': 'azul', 'en gestión': 'ambar', 'resuelta': 'verde', 'rechazada': 'gris' };
  var BOL = { congelado: ['azul', 'Congelado'], anulado: ['rojo', 'Anulado'], vigente: ['verde', 'Vigente'], usado: ['gris', 'Usado'], 'sin derecho': ['gris', 'Sin derecho'] };

  window.PANTALLAS.soporte = function (raiz, ctx) {
    var disp, zoom = 1, timerToast = null, timerVal = null, scr = {};
    var casos = nuevosCasos();
    var st = { sel: 'R-2026-0187', filtro: 'todas', q: '', bol: 0, acc: null, inicio: false, toast: null,
      tr: { sel: {}, tipo: 'CC', doc: '1.017.889.214', fase: 'idle', res: null }, rs: { opc: '', nota: '' }, rc: { opc: '', nota: '' } };

    function ahora() { return st.inicio ? INICIO_HOY + 5 * 60000 : AHORA; }
    function caso() { return casos.filter(function (c) { return c.id === st.sel; })[0]; }
    function iniciado(c) { return ahora() >= c.ev.inicio; }
    function restante(ms) {
      if (ms <= 0) { return null; }
      var m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
      return d ? d + ' d ' + h + ' h' : h ? h + ' h ' + (m % 60) + ' min' : m + ' min';
    }
    // El inicio del partido cierra las transferencias; el color avisa cuando faltan menos de 12 horas.
    function plazo(c) {
      if (c.estado === 'resuelta' || c.estado === 'rechazada') { return { tono: 'gris', t: 'Cerrada' }; }
      if (iniciado(c)) { return { tono: 'rojo', t: 'Encuentro iniciado' }; }
      var r = c.ev.inicio - ahora();
      return { tono: r < 12 * 3600000 ? 'ambar' : 'gris', t: 'Inicia en ' + restante(r) };
    }

    // Quien reclama se ve como en el IVC: la persona menor, solo con iniciales y documento enmascarado.
    function quienDe(c) {
      var m = /^(\S+)\s(.+)$/.exec(c.quien.doc), r = m && U.res(m[1], m[2], 'soporte');
      return { n: r ? r.nombreVisible : c.quien.n, doc: r && r.esMenor ? r.docVisible : mask(c.quien.doc), r: r };
    }
    // Estado vivo de la persona en el IVC (solo el resultado de la validación, nunca el expediente).
    function estadoIvc(c) {
      var r = quienDe(c).r;
      if (!r) { return 'Sin registro en el IVC'; }
      var t = { vigente: 'Medida vigente', porVencer: 'Medida vigente · por vencer', enTramite: 'Registro en trámite · no bloquea', cumplida: 'Medida cumplida · antecedente', libre: 'Sin medida', oculta: 'Sin medida' }[r.estado] || r.estado;
      return t + (r.bloquea && r.diasRestantes != null ? ' · ' + (r.diasRestantes > 0 ? r.diasRestantes + (r.diasRestantes === 1 ? ' día' : ' días') : 'último día') : '');
    }
    function tag(tono, t) { return '<span class="sp-tag sp-tag--' + tono + '">' + esc(t) + '</span>'; }
    function nota(c, texto, quien) { c.historial.push({ t: (st.inicio ? 'Mañana · 20:05' : 'Hoy · 18:44'), x: texto, q: quien || 'Marcela Duque' }); }

    /* ---------- Cola ---------- */

    function visibles() {
      var q = st.q.trim().toLowerCase(), d = digitos(q);
      return casos.filter(function (c) {
        if (st.filtro !== 'todas' && c.estado !== st.filtro) { return false; }
        if (!q) { return true; }
        return c.id.toLowerCase().indexOf(q) >= 0 || c.quien.n.toLowerCase().indexOf(q) >= 0 || (d.length >= 3 && digitos(c.quien.doc).indexOf(d) >= 0);
      }).sort(function (a, b) {
        var va = a.estado === 'resuelta' || a.estado === 'rechazada', vb = b.estado === 'resuelta' || b.estado === 'rechazada';
        return va !== vb ? (va ? 1 : -1) : a.ev.inicio - b.ev.inicio;
      });
    }
    function cola() {
      var vs = visibles();
      var chips = FILTROS.map(function (f) {
        var n = casos.filter(function (c) { return f[0] === 'todas' || c.estado === f[0]; }).length;
        return '<button type="button" class="sp-chip" aria-pressed="' + (st.filtro === f[0]) + '" data-acc="filtro" data-id="' + f[0] + '">' + f[1] + '<span class="sp-chip__n">' + n + '</span></button>';
      }).join('');
      var filas = vs.length ? vs.map(function (c) {
        var p = plazo(c);
        return '<button type="button" class="sp-fila" aria-pressed="' + (c.id === st.sel) + '" data-acc="sel" data-id="' + c.id + '">' +
          '<span class="sp-fila__l"><span class="sp-fila__id">' + c.id + '</span>' + tag(TAG[c.estado], c.estado) + '</span>' +
          '<b class="sp-fila__t">' + esc(TIPOS[c.tipo]) + '</b>' +
          '<span class="sp-sub">' + esc(quienDe(c).n) + ' · ' + esc(quienDe(c).doc) + '</span>' +
          '<span class="sp-fila__p"><span class="sp-sub">' + esc(c.ev.nombre) + '</span><span class="sp-plazo sp-plazo--' + p.tono + '">' + ico('reloj', 14) + esc(p.t) + '</span></span></button>';
      }).join('') : '<div class="sp-vacio"><b>Sin reclamaciones</b><span class="sp-sub">Cambie el filtro o la búsqueda.</span></div>';
      return '<section class="sp-cola" aria-label="Reclamaciones"><div class="sp-cola__cab"><h1 class="sp-h1">Reclamaciones</h1>' +
        '<label class="sp-busq"><span class="sp-vh">Buscar por caso, nombre o documento</span>' + ico('buscar', 18) + '<input type="search" data-k="q" autocomplete="off" placeholder="Caso, nombre o documento" value="' + esc(st.q) + '"></label>' +
        '<div class="sp-chips" role="group" aria-label="Filtrar por estado">' + chips + '</div></div>' +
        '<div class="sp-lista" data-sc="lista">' + filas + '</div></section>';
    }

    /* ---------- Detalle ---------- */

    function traza(b) {
      return '<ol class="sp-traza">' + b.traza.map(function (p) {
        return '<li class="sp-paso sp-paso--' + p[2] + '"><span class="sp-paso__pt">' + (p[2] === 'ok' ? ico('ok', 14) : p[2] === 'no' ? ico('no', 14) : '') + '</span>' +
          '<span class="sp-paso__c"><span class="sp-sub sp-num">' + esc(p[0]) + '</span><b>' + esc(p[1]) + '</b><span>' + esc(p[3]) + '</span></span></li>';
      }).join('') + '</ol>';
    }
    function kv(k, v) { return '<div class="sp-kv"><dt>' + esc(k) + '</dt><dd>' + v + '</dd></div>'; }

    function detalle() {
      var c = caso();
      if (!c) { return '<section class="sp-det sp-det--vacio"><p class="sp-sub">Elija una reclamación de la cola.</p></section>'; }
      var p = plazo(c), b = c.derechos[Math.min(st.bol, c.derechos.length - 1)], e = BOL[b.est];
      var selector = c.derechos.length > 1 ? '<div class="sp-sel" role="group" aria-label="Derechos de ingreso del caso">' + c.derechos.map(function (x, i) {
        return '<button type="button" class="sp-chip sp-chip--b" aria-pressed="' + (i === st.bol) + '" data-acc="bol" data-id="' + i + '">' + esc(x.cod.replace('DI-', '')) + ' · ' + BOL[x.est][1] + '</button>';
      }).join('') + '</div>' : '';
      var hist = '<ol class="sp-hist">' + c.historial.slice().reverse().map(function (h) {
        return '<li><span class="sp-sub sp-num">' + esc(h.t) + '</span><span>' + esc(h.x) + '</span><span class="sp-sub">' + esc(h.q) + '</span></li>';
      }).join('') + '</ol>';
      return '<section class="sp-det" aria-label="Detalle de la reclamación">' +
        '<header class="sp-det__cab"><div class="sp-det__top"><span class="sp-fila__id">' + c.id + '</span>' + tag(TAG[c.estado], c.estado) + '<span class="sp-plazo sp-plazo--' + p.tono + '">' + ico('reloj', 14) + esc(p.t) + '</span></div>' +
          '<h2 class="sp-h1">' + esc(TIPOS[c.tipo]) + '</h2><p class="sp-sub sp-num">' + esc(quienDe(c).n) + ' · ' + esc(quienDe(c).doc) + ' · ' + esc(c.ev.nombre) + ' · ' + esc(c.ev.cuando) + ' · recibida ' + esc(c.recibida.toLowerCase()) + '</p></header>' +
        '<div class="sp-det__cuerpo" data-sc="det"><div class="sp-cols"><div class="sp-col">' +
          '<section class="sp-card"><h3 class="sp-h3">Lo que dice la persona</h3><p class="sp-cita">«' + esc(c.dice) + '»</p></section>' +
          '<section class="sp-card"><h3 class="sp-h3">Derecho de ingreso</h3>' + selector + '<dl class="sp-kvs">' + kv('Referencia', '<span class="sp-num">' + esc(b.cod) + '</span>') + kv('Estado', tag(e[0], e[1])) + kv('Documento', esc(b.tit)) + kv('Comprador', esc(b.prop.replace('Comprador ', ''))) + kv('Evento', esc(c.ev.nombre + ' · ' + c.ev.lugar)) + kv('Sector', esc(b.sector)) + kv('Estado hoy en el IVC', tag(/Medida vigente/.test(estadoIvc(c)) ? 'rojo' : 'gris', estadoIvc(c))) + '</dl></section>' +
          '<section class="sp-card"><h3 class="sp-h3">Historial de la reclamación</h3>' + hist + '</section>' +
        '</div><div class="sp-col">' +
          '<section class="sp-card"><h3 class="sp-h3">Traza del derecho de ingreso</h3>' + traza(b) + '</section>' +
          '<section class="sp-card sp-card--reserva"><h3 class="sp-h3">' + ico('candado', 16) + 'Lo que soporte no ve</h3><p class="sp-sub">El expediente de una medida (hechos, conducta, acto) no está disponible aquí: solo el resultado de la validación y su código de motivo. Cada consulta de este caso queda en la auditoría.</p></section>' +
        '</div></div></div>' + acciones(c) + '</section>';
    }

    /* ---------- Acciones permitidas según el estado y el modelo ---------- */

    function btn(acc, texto, tipo, off, motivo) {
      return '<div class="sp-acc"><button type="button" class="sp-btn sp-btn--' + tipo + '" data-acc="' + acc + '"' + (off ? ' disabled' : '') + '>' + texto + '</button>' + (off && motivo ? '<span class="sp-sub">' + esc(motivo) + '</span>' : '') + '</div>';
    }
    function acciones(c) {
      if (c.estado === 'resuelta' || c.estado === 'rechazada') {
        return '<footer class="sp-pie"><p class="sp-cerrado">' + ico(c.estado === 'resuelta' ? 'ok' : 'no', 18) + '<span>Reclamación ' + (c.estado === 'resuelta' ? 'resuelta' : 'rechazada') + ': ' + esc(c.historial[c.historial.length - 1].x.replace(/^(Resuelta|Rechazada) · /, '')) + '. Un caso cerrado no se edita.</span></p></footer>';
      }
      if (c.estado === 'abierta') {
        return '<footer class="sp-pie"><div class="sp-pie__f">' + btn('tomar', 'Tomar el caso', 'pri') + '<p class="sp-sub">Tomarlo lo pasa a «en gestión» y queda a su nombre. Antes de eso no se puede resolver.</p></div></footer>';
      }
      var panel = st.acc ? panelAcc(c) : '';
      var cong = c.derechos.filter(function (x) { return x.est === 'congelado'; }).length;
      var ini = iniciado(c);
      return '<footer class="sp-pie">' + panel + '<div class="sp-pie__f">' +
        btn('abrir-tr', 'Transferir titularidad', st.acc === 'tr' ? 'sec' : 'pri', !cong || ini, !cong ? 'Este caso no tiene derechos congelados.' : 'Después del inicio del encuentro no se transfiere nada.') +
        btn('abrir-rs', 'Resolver', 'sec') +
        btn('abrir-rc', 'Rechazar', 'sec') + '</div></footer>';
    }

    function opciones(lista, val, vacio) {
      return '<option value="">' + vacio + '</option>' + lista.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
    }
    function panelAcc(c) {
      var cierra = '<button type="button" class="sp-x" data-acc="cerrar-acc" aria-label="Cerrar">' + ico('no', 18) + '</button>';
      if (st.acc === 'tr') {
        var t = st.tr, cong = c.derechos.filter(function (x) { return x.est === 'congelado'; });
        var res = '';
        if (t.fase === 'validando') { res = '<p class="sp-valid" role="status"><span class="sp-giro" aria-hidden="true"></span>Validando a quien entrega y a quien recibe…</p>'; }
        else if (t.res) {
          res = '<ul class="sp-valid sp-valid--' + (t.res.ok ? 'ok' : 'no') + '" role="status"><li>' + ico('ok', 16) + 'Entrega · comprador CC •••• 7120: soporte puede ceder sus derechos congelados</li><li>' + ico(t.res.ok ? 'ok' : 'no', 16) + 'Recibe · ' + esc(t.res.n || 'documento') + ': ' + (t.res.ok ? 'elegible' : esc(t.res.cod)) + '</li></ul>';
        }
        return '<div class="sp-accion" role="group" aria-label="Transferir titularidad">' + cierra + '<h3 class="sp-h3">Transferir la titularidad de los derechos de ingreso congelados</h3>' +
          '<div class="sp-tr"><fieldset class="sp-fs"><legend class="sp-sub">Derechos a transferir</legend>' + cong.map(function (x) {
            return '<label class="sp-check"><input type="checkbox" data-k="trsel" data-id="' + x.cod + '"' + (t.sel[x.cod] !== false ? ' checked' : '') + '><span class="sp-num">' + esc(x.cod) + '</span></label>';
          }).join('') + '</fieldset>' +
          '<div class="sp-tr__d"><label class="sp-campo"><span>Documento de quien recibe</span><span class="sp-doc"><select data-k="trtipo"><option' + (t.tipo === 'CC' ? ' selected' : '') + '>CC</option><option' + (t.tipo === 'CE' ? ' selected' : '') + '>CE</option><option>TI</option></select><input data-k="trdoc" inputmode="numeric" autocomplete="off" value="' + esc(t.doc) + '"></span></label>' +
          '<button type="button" class="sp-btn sp-btn--pri" data-acc="transferir"' + (t.fase === 'validando' ? ' disabled' : '') + '>Validar y transferir</button></div></div>' + res +
          '<p class="sp-sub">Se valida a los dos lados. Los derechos pasan al documento de quien recibe, que entra con él; antes del inicio del partido.</p></div>';
      }
      var rs = st.acc === 'rs', o = rs ? st.rs : st.rc;
      var lista = rs ? RES[c.tipo] : MOTIVOS_RECHAZO;
      return '<div class="sp-accion" role="group" aria-label="' + (rs ? 'Resolver' : 'Rechazar') + ' la reclamación">' + cierra + '<h3 class="sp-h3">' + (rs ? 'Resolver la reclamación' : 'Rechazar la reclamación') + '</h3>' +
        '<div class="sp-rs"><label class="sp-campo"><span>' + (rs ? 'Resolución' : 'Motivo del rechazo') + '</span><select data-k="' + (rs ? 'rsopc' : 'rcopc') + '">' + opciones(lista, o.opc, 'Elija una opción') + '</select></label>' +
        '<label class="sp-campo"><span>Nota para la persona (opcional)</span><input data-k="' + (rs ? 'rsnota' : 'rcnota') + '" autocomplete="off" value="' + esc(o.nota) + '"></label>' +
        '<button type="button" class="sp-btn sp-btn--' + (rs ? 'pri' : 'neg') + '" data-acc="' + (rs ? 'resolver' : 'rechazar') + '"' + (o.opc ? '' : ' disabled') + '>' + (rs ? 'Resolver' : 'Rechazar') + '</button></div></div>';
    }

    /* ---------- Marco ---------- */

    function barra() {
      return '<header class="sp-barra"><span class="sp-barra__marca">' + window.NAOWEE.logo + '</span><span class="sp-barra__sep" aria-hidden="true"></span><span class="sp-barra__ttl">Consola de soporte</span>' +
        '<span class="sp-barra__r"><span class="sp-num sp-sub">' + (st.inicio ? 'Mañana · 20:05' : 'Hoy · 18:44') + '</span><span><b>Marcela Duque Arias</b><span class="sp-sub"> · Soporte</span></span></span></header>';
    }
    function toastHtml() {
      return st.toast ? '<nwt-toast class="pp-toast sp-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }
    function contenido() { return '<div class="sp-app">' + barra() + '<div class="sp-cuerpo">' + cola() + detalle() + '</div>' + toastHtml() + '</div>'; }

    function tarjeta(titulo, cuerpo) { return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    var PROBAR = [
      ['R-2026-0187', 'positive', 'positive', '1 · Derechos congelados (urgente)'], ['R-2026-0184', 'positive', 'informative', '2 · Documento sin derecho en la puerta'], ['R-2026-0181', 'negative', 'negative', '3 · Compra rechazada por medida'],
      ['R-2026-0178', 'caution', 'warning', '4 · Identidad no coincide'], ['R-2026-0173', 'negative', 'negative', '5 · Ya ingresó'], ['R-2026-0165', 'caution', 'warning', '6 · Puerta equivocada'],
      ['R-2026-0160', 'caution', 'warning', '7 · Límite de ingresos'], ['R-2026-0152', 'positive', 'positive', '8 · Resuelta con transferencia'], ['R-2026-0149', 'negative', 'negative', '9 · Rechazada: pidió tras el inicio'], ['R-2026-0191', 'negative', 'negative', '10 · Cédula prestada reportada']
    ];
    function guion() {
      return '<aside class="pp-panel" aria-label="Controles del demo"><button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Probar', '<div class="pp-panel__lista">' + PROBAR.map(function (p) {
          return '<nwt-detail-item actionable icon="' + p[1] + '" nwt-theme="' + p[2] + '" data-acc="g-caso" data-id="' + p[0] + '">' + esc(p[3]) + '</nwt-detail-item>';
        }).join('') + '</div>') +
        tarjeta('Transferir titularidad', '<div class="pp-panel__lista"><nwt-detail-item actionable icon="negative" nwt-theme="negative" data-acc="g-dest" data-id="71894447">Destino con medida vigente</nwt-detail-item>' +
          '<nwt-detail-item actionable icon="caution" nwt-theme="warning" data-acc="g-dest" data-id="1152708339">Destino con derecho para el partido</nwt-detail-item></div>') +
        tarjeta('Condiciones', '<div class="pp-panel__lista" id="sp-reloj"></div>') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p></aside>';
    }
    function pintarPanel() {
      var r = raiz.querySelector('#sp-reloj');
      if (r) { r.innerHTML = '<nwt-detail-item actionable icon="calendar" nwt-theme="informative" data-acc="reloj">' + (st.inicio ? 'Volver a las 18:44 · antes del encuentro' : 'Pasar el inicio del encuentro de mañana (20:00)') + '</nwt-detail-item>'; }
    }

    function clave(el) { var d = el.dataset || {}; return d.k ? 'k:' + d.k + ':' + (d.id || '') : d.acc ? 'a:' + d.acc + ':' + (d.id || '') : null; }
    function pintar(cambio) {
      var activo = document.activeElement, kf = activo && disp.contains(activo) ? clave(activo) : null, sel = null;
      try { if (kf && activo.selectionStart != null) { sel = [activo.selectionStart, activo.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      disp.querySelectorAll('[data-sc]').forEach(function (el) { scr[el.dataset.sc] = el.scrollTop; });
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--consola"><div class="pp-pantalla">' + contenido() + '</div></div><div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div></div>';
      disp.querySelectorAll('[data-sc]').forEach(function (el) { el.scrollTop = cambio === 'det' && el.dataset.sc === 'det' ? 0 : (scr[el.dataset.sc] || 0); });
      if (kf) {
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
      pintar();
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; var n = disp.querySelector('.sp-toast'); if (n) { n.remove(); } }, 3200);
    }

    /* ---------- Acciones ---------- */

    // Abrir una reclamación consulta a la persona: queda en la auditoría del IVC (origen 6, «Consola de soporte»).
    function consultar(id) {
      var c = casos.filter(function (x) { return x.id === id; })[0], m = c && /^(\S+)\s(.+)$/.exec(c.quien.doc);
      if (m && U.res(m[1], m[2], 'soporte')) { U.emitir({ tipo: 'consulta', clave: U.clave(m[1], m[2]), evento: U.EVENTO, puerta: 0, origen: 6, detalle: 'Consultó el estado desde la reclamación ' + id, quien: 'Soporte · M. Duque' }); }
    }
    function elegir(id) {
      consultar(id);
      st.sel = id; st.bol = 0; st.acc = null; st.tr.res = null; st.tr.fase = 'idle'; st.tr.sel = {}; st.rs = { opc: '', nota: '' }; st.rc = { opc: '', nota: '' };
    }
    function transferir() {
      var c = caso(), t = st.tr, d = digitos(t.doc);
      var marcadas = c.derechos.filter(function (x) { return x.est === 'congelado' && t.sel[x.cod] !== false; });
      if (!marcadas.length) { avisar('Elija al menos un derecho', 'Marque los derechos congelados que se transfieren.', 'negative', 'negative'); return; }
      t.fase = 'validando'; t.res = null; pintar();
      clearTimeout(timerVal);
      timerVal = setTimeout(function () {
        var dst = destino(t.tipo, d);
        t.fase = 'fin'; t.res = { ok: dst.ok, n: dst.n, cod: dst.cod };
        if (dst.ok) {
          marcadas.forEach(function (b) {
            b.est = 'vigente'; b.tit = mask(t.tipo + ' ' + t.doc);
            b.traza.push([st.inicio ? dia(1) + ' · 20:05' : dia(0) + ' · 18:44', 'Titularidad transferida por soporte', 'ok', 'A ' + mask(t.tipo + ' ' + t.doc) + ' · validada a los dos lados']);
          });
          nota(c, 'Titularidad transferida · ' + marcadas.length + (marcadas.length === 1 ? ' ingreso' : ' ingresos') + ' a ' + mask(t.tipo + ' ' + t.doc));
          c.estado = 'resuelta'; nota(c, 'Resuelta · titularidad transferida a otro documento elegible');
          st.acc = null; st.tr.res = null; st.tr.fase = 'idle';
          avisar('Titularidad transferida', dst.n + ' ya entra con ' + (marcadas.length === 1 ? 'el ingreso' : 'los ' + marcadas.length + ' ingresos') + ' con su documento.', 'positive', 'positive');
        } else { pintar(); }
      }, 1100);
    }

    function onClick(ev) {
      var z = ev.target.closest('[data-zoom]');
      if (z) { zoom = z.dataset.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      var el = ev.target.closest('[data-acc]');
      if (!el || el.disabled) { return; }
      var d = el.dataset, c = caso();
      switch (d.acc) {
        case 'salir': ctx.salir(); return;
        case 'cerrar-toast': st.toast = null; break;
        case 'filtro': st.filtro = d.id; scr.lista = 0; break;
        case 'sel': elegir(d.id); pintar('det'); return;
        case 'bol': st.bol = +d.id; break;
        case 'tomar': c.estado = 'en gestión'; nota(c, 'Caso tomado'); avisar('Caso tomado', c.id + ' pasó a en gestión.', 'positive', 'positive'); return;
        case 'abrir-tr': st.acc = st.acc === 'tr' ? null : 'tr'; break;
        case 'abrir-rs': st.acc = st.acc === 'rs' ? null : 'rs'; break;
        case 'abrir-rc': st.acc = st.acc === 'rc' ? null : 'rc'; break;
        case 'cerrar-acc': st.acc = null; break;
        case 'transferir': transferir(); return;
        case 'resolver': c.estado = 'resuelta'; nota(c, 'Resuelta · ' + st.rs.opc.charAt(0).toLowerCase() + st.rs.opc.slice(1) + (st.rs.nota ? ' · «' + st.rs.nota + '»' : '')); st.acc = null; avisar('Reclamación resuelta', c.id + ' quedó cerrada.', 'positive', 'positive'); return;
        case 'rechazar': c.estado = 'rechazada'; nota(c, 'Rechazada · ' + st.rc.opc.charAt(0).toLowerCase() + st.rc.opc.slice(1) + (st.rc.nota ? ' · «' + st.rc.nota + '»' : '')); st.acc = null; avisar('Reclamación rechazada', c.id + ' quedó cerrada con su motivo.', 'informative', 'info'); return;
        case 'reloj': st.inicio = !st.inicio; break;
        case 'g-caso': st.filtro = 'todas'; st.q = ''; elegir(d.id); pintar('det'); return;
        case 'g-dest':
          if (casos.filter(function (x) { return x.id === 'R-2026-0187'; })[0].estado === 'abierta') { casos[0].estado = 'en gestión'; nota(casos[0], 'Caso tomado'); }
          st.filtro = 'todas'; st.q = ''; elegir('R-2026-0187'); st.acc = 'tr'; st.tr.doc = d.id.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); st.tr.tipo = 'CC'; pintar('det'); return;
      }
      pintar();
    }
    function onInput(ev) {
      var el = ev.target, k = el.dataset && el.dataset.k;
      if (!k) { return; }
      if (k === 'q') { st.q = el.value; scr.lista = 0; pintar(); }
      else if (k === 'trdoc') { st.tr.doc = el.value; st.tr.res = null; }
      else if (k === 'rsnota') { st.rs.nota = el.value; }
      else if (k === 'rcnota') { st.rc.nota = el.value; }
    }
    function onCambio(ev) {
      var el = ev.target, d = el.dataset || {};
      if (d.k === 'trtipo') { st.tr.tipo = el.value; st.tr.res = null; }
      else if (d.k === 'trsel') { st.tr.sel[d.id] = el.checked; }
      else if (d.k === 'rsopc') { st.rs.opc = el.value; pintar(); }
      else if (d.k === 'rcopc') { st.rc.opc = el.value; pintar(); }
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + window.SVN_TOOLBAR({ titulo: 'Consola de soporte', subtitulo: 'Superficie 9 · Escritorio · Soporte', acciones: [{ texto: 'Cambiar de perfil', acc: 'salir' }] }) +
      '<div class="pp-demo__cuerpo">' + guion() + '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles"><div class="pp-zoom">' +
        '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
      '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('soporte');
    disp = raiz.querySelector('#dispositivo');

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('input', onInput);
    raiz.addEventListener('change', onCambio);
    window.addEventListener('resize', escalar);
    pintar();
    requestAnimationFrame(escalar);

    return function () {
      clearTimeout(timerToast); clearTimeout(timerVal);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('input', onInput);
      raiz.removeEventListener('change', onCambio);
      window.removeEventListener('resize', escalar);
    };
  };
})();
