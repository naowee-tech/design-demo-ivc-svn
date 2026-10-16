/* Contrato con B: COMPRA.registrar(id, { render(ctx) -> html, onClick?(el, ev, ctx), onInput?(ev, ctx), alMontar?(ctx) }); ids 'titulares' y 'titular'.
 * ctx = { D, st, repintar, toast, esc, ir, consultar(n, alTerminar, extra?), raiz }; ayudas: COMPRA.marco/ico/dinero/TIPOS_DOC y los ayudantes de cupos.
 * Orden: evento, identificar, cantidad, titulares (titular), pago, listo. Detalle del estado y de las consultas en README.md. */
window.PANTALLAS = window.PANTALLAS || {};
window.COMPRA = window.COMPRA || {};
window.COMPRA.pantallas = window.COMPRA.pantallas || {};
window.COMPRA.registrar = window.COMPRA.registrar || function (id, def) { window.COMPRA.pantallas[id] = def; };

(function () {
  var COMPRA = window.COMPRA;
  // Equipo y velocidad sobreviven al remontaje; la velocidad es propia y no toca la global de la puerta.
  var M = { disp: 'celular', vel: 'slow', st: null };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dinero(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function iniciales(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x.charAt(0).toUpperCase(); }).join(''); }
  function primerNombre(n) { return String(n || '').split(/\s+/)[0] || ''; }
  // «CC 1.036.482.117» -> «CC •••• 2117»; sirve también para pasaportes con letras.
  function enmascarar(doc) {
    var p = String(doc || '').split(' '), tipo = p.shift(), cola = p.join('').replace(/[^A-Za-z0-9]/g, '');
    return cola ? tipo + ' •••• ' + cola.slice(-4) : String(doc || '');
  }

  /* ---------- Iconos de trazo ---------- */
  var ICO = {
    atras: '<path d="M15 5l-7 7 7 7"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    cuenta: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    lugar: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>', escudo: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    alerta: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>', triangulo: '<path d="M12 4 3 20h18z"/><path d="M12 10v5M12 17.5h.01"/>',
    menos: '<path d="M6 12h12"/>', mas: '<path d="M12 6v12M6 12h12"/>', puerta: '<path d="M3 21h18M5 21V4a1 1 0 0 1 1-1h8v18M14 5h4v16"/><path d="M11 12h.01"/>',
    tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>', banco: '<path d="M3 10l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    girar: '<path d="M12 3a9 9 0 1 0 9 9"/>', cambio: '<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
    documento: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.2 3-2.2s2.4.6 3 2.2M14 10h4M14 13h3"/>'
  };
  function ico(n, t, extra) {
    return '<svg width="' + (t || 20) + '" height="' + (t || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (n === 'menos' || n === 'mas' || n === 'girar' ? 2.4 : 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + ICO[n] + '</svg>';
  }

  /* ---------- Documentos: una sola lista y un solo formato ---------- */
  var TIPOS_DOC = [
    { id: 'CC', nombre: 'Cédula de ciudadanía', min: 5, max: 11, alfa: false },
    { id: 'CE', nombre: 'Cédula de extranjería', min: 5, max: 11, alfa: false },
    { id: 'TI', nombre: 'Tarjeta de identidad', min: 5, max: 11, alfa: false },
    { id: 'PA', nombre: 'Pasaporte', min: 5, max: 12, alfa: true },
    { id: 'PPT', nombre: 'Permiso por protección temporal', min: 5, max: 11, alfa: false },
    { id: 'PEP', nombre: 'Permiso especial de permanencia', min: 5, max: 11, alfa: false },
    { id: 'RUMV', nombre: 'Registro único de migrantes venezolanos', min: 5, max: 11, alfa: false },
    { id: 'RC', nombre: 'Registro civil (menor, con su representante)', min: 5, max: 11, alfa: false }
  ];
  function tipoDoc(id) { return TIPOS_DOC.filter(function (t) { return t.id === id; })[0] || null; }
  function limpio(num) { return String(num || '').replace(/[\s.\-]/g, ''); }
  function claveDoc(tipo, num) { var t = tipoDoc(tipo), l = limpio(num); return tipo + '|' + (t && t.alfa ? l.toUpperCase() : l); }
  // Devuelve '' si el formato es válido, o el mensaje para el campo.
  function validarDoc(tipo, num) {
    var t = tipoDoc(tipo), l = limpio(num);
    if (!String(num || '').trim()) { return 'Escribe el número de documento.'; }
    if (!t) { return 'Elige el tipo de documento.'; }
    if (t.alfa ? !/^[A-Za-z0-9]+$/.test(l) : !/^\d+$/.test(l)) { return t.alfa ? 'El pasaporte solo lleva letras y números.' : 'Este documento solo lleva números.'; }
    if (l.length < t.min || l.length > t.max) { return 'El documento debe tener entre ' + t.min + ' y ' + t.max + (t.alfa ? ' caracteres.' : ' dígitos.'); }
    return '';
  }

  /* ---------- Datos ficticios ---------- */
  var LOCS = [
    { id: 'occ', nombre: 'Occidental', n: 'Occidental', d: 'Numerada · vista central', p: 180000, fila: 'C', puerta: 'Puerta 1 · Occidental' },
    { id: 'ori', nombre: 'Oriental', n: 'Oriental', d: 'Numerada', p: 120000, fila: 'E', puerta: 'Puerta 4 · Oriental' },
    { id: 'norte', nombre: 'Norte', n: 'Norte', d: 'General · sin silla asignada', p: 50000, puerta: 'Puerta 6 · Norte' },
    { id: 'sur', nombre: 'Sur · visitante', n: 'Sur · visitante', d: 'Tribuna de la hinchada visitante', p: 50000, puerta: 'Puerta 8 · Sur' }
  ];
  var CARGO = 7500, MAX = 5, RESERVA = 582000;
  var P = {
    andres: { nombre: 'Andrés Felipe Restrepo Gil', tipo: 'CC', num: '1.036.482.117' },
    santiago: { nombre: 'Santiago Mejía Correa', tipo: 'CC', num: '1.037.664.905' },
    julian: { nombre: 'Julián Andrés Posada', tipo: 'CC', num: '71.894.447' },
    mariana: { nombre: 'Mariana Cárdenas Ríos', tipo: 'CC', num: '1.152.708.339' },
    paula: { nombre: 'Paula Andrea Henao Restrepo', tipo: 'CC', num: '1.040.221.908' },
    rosa: { nombre: 'Rosa Elena Cortés Vega', tipo: 'CC', num: '43.118.920' },
    kevin: { nombre: 'Kevin Andrés Zapata Ruiz', tipo: 'CC', num: '1.001.245.786' },
    daniela: { nombre: 'Daniela Gómez Arias', tipo: 'CC', num: '1.017.889.214' },
    cristian: { nombre: 'Cristian Muñoz Henao', tipo: 'CC', num: '1.128.403.552' },
    tomas: { nombre: 'Tomás Ríos Betancur', tipo: 'CC', num: '1.035.667.120' },
    lucia: { nombre: 'Lucía Marín Osorio', tipo: 'CC', num: '1.020.334.671' },
    mateo: { nombre: 'Mateo Álvarez Duque', tipo: 'CC', num: '1.098.556.204' },
    sofia: { nombre: 'Sofía Vélez Londoño', tipo: 'CC', num: '1.045.790.118' }
  };
  function conDoc(p) { var o = {}; Object.keys(p).forEach(function (k) { o[k] = p[k]; }); o.doc = p.tipo + ' ' + p.num; return o; }
  Object.keys(P).forEach(function (k) { P[k] = conDoc(P[k]); });
  // Quienes el panel propone como titulares, en orden; cada caso puede traer los suyos en `sug`.
  var SUG = [P.santiago, P.lucia, P.mateo, P.sofia];
  function conSug(primero) { return [primero].concat(SUG); }
  function falla(paso, texto, sube, cod) { return { paso: paso, texto: texto, sube: sube, cod: cod }; }
  var F_MEDIDA = falla('Medidas', 'Tiene una medida correctiva vigente', 'Medida vigente ✕', 'Medida restrictiva vigente');

  // `c` = consulta que corta (0 no corta); `ini` = pantalla donde abre el caso; `malo` = a quien la consulta le dice que no;
  // `que` = qué pasa; `ve` = qué ve la persona.
  var CASOS = [
    { id: 'feliz', corto: 'Compra sin problemas', punto: 'verde', c: 0, paso: 'No corta', persona: P.andres, que: 'Todo sale bien: la persona compra y queda con su ingreso.', ve: 'Se identifica, elige 2 ingresos, asigna el otro a Santiago, paga y ve con qué documento entra cada uno.' },
    { id: 'medida-id', corto: 'Bloqueo por medida', punto: 'rojo', c: 1, paso: 'Medidas · DB', codigo: 'Medida restrictiva vigente', persona: P.julian, que: 'Se detiene al identificarse: la persona tiene una medida vigente y no puede comprar.', ve: 'Ve un resultado sin explicación del motivo y un enlace a su portal. No llega a elegir la cantidad.' },
    { id: 'limite-id', corto: 'Límite al identificarse', punto: 'rojo', c: 1, paso: 'Límite', codigo: 'Límite de venta excedido', persona: P.mariana, previas: 5, loc: 'ori', que: 'Se detiene al identificarse: ya tiene 5 ingresos para este partido y el máximo es 5 por persona.', ve: 'Ve la regla de 5 ingresos por persona y puede volver al evento. Con menos ingresos sí avanza, hasta el tope que le quede.' },
    { id: 'limite-carrera', corto: 'Límite al pagar', punto: 'rojo', c: 3, paso: 'Límite', codigo: 'Límite de venta excedido', persona: P.mariana, carrera: 4, loc: 'ori', ini: 'pago', que: 'Se detiene al pagar: mientras pagaba se completó el máximo de 5 ingresos por persona.', ve: 'Llega a Pago con los titulares ya validados. Ve la misma regla y un aviso de que no se hizo ningún cobro. Su reserva se libera.' },
    { id: 'identidad', corto: 'Nombre no coincide', punto: 'rojo', c: 1, paso: 'Registraduría', codigo: 'Identidad no coincide', persona: P.paula, que: 'Se detiene al identificarse: el nombre no coincide con el documento en la Registraduría.', ve: 'Le piden revisar los datos. Tiene 3 intentos; después ve un resultado genérico. Si los corrige, sigue.' },
    { id: 'doc-invalido', corto: 'Cédula no válida', punto: 'rojo', c: 1, paso: 'Registraduría', codigo: 'Documento no válido', persona: P.rosa, que: 'Se detiene al identificarse: la cédula no es válida en la Registraduría.', ve: 'Ve un resultado sin explicación del motivo. No llega a elegir la cantidad.' },
    { id: 'cambio-medida', corto: 'Medida durante el pago', punto: 'rojo', c: 3, paso: 'Medidas · DB', codigo: 'Medida restrictiva vigente', persona: P.kevin, ini: 'pago', que: 'Se detiene al pagar: mientras pagaba apareció una medida vigente a su nombre.', ve: 'Ve un resultado sin explicación del motivo, un aviso de que no se cobró y otro de que su reserva se liberó.' },
    { id: 'acomp-medida', corto: 'Titular con medida', punto: 'rojo', c: 2, paso: 'Medidas · DB', persona: P.andres, ini: 'titulares', malo: P.julian, sug: conSug(P.julian), falla: F_MEDIDA, que: 'Se detiene al asignar el ingreso: la persona escrita como titular tiene una medida vigente.', ve: '«No es posible asignar este ingreso a esta persona», sin motivo. No puede pagar hasta asignar ese ingreso a otra persona.' },
    { id: 'acomp-ingreso', corto: 'Titular ya tiene ingreso', punto: 'rojo', c: 2, paso: 'Una por evento', codigo: 'YA_TIENE_INGRESO', persona: P.andres, ini: 'titulares', malo: P.daniela, sug: conSug(P.daniela), falla: falla('Una por evento', 'Ya tiene un derecho de ingreso a este partido, de cualquier comercializadora', 'Ya tiene ingreso ✕', 'YA_TIENE_INGRESO'), que: 'Se detiene al asignar el ingreso: el documento del titular ya tiene derecho de ingreso a este partido, de cualquier comercializadora (solo se permite uno).', ve: '«No es posible asignar este ingreso a esta persona», sin motivo. En la auditoría queda el código YA_TIENE_INGRESO.' },
    { id: 'acomp-afinidad', corto: 'Titular es hincha visitante', punto: 'rojo', c: 2, paso: 'Afinidad y sector', sinVisitante: true, persona: P.andres, ini: 'titulares', malo: P.cristian, sug: conSug(P.cristian), falla: falla('Afinidad y sector', 'Sin hinchada visitante · afín a Medellín (91 %)', 'No cumple ✕', 'Regla del partido (propuesto)'), que: 'Se detiene al asignar el ingreso: el titular es hincha del club visitante y este partido va sin hinchada visitante.', ve: '«No es posible asignar este ingreso a esta persona», sin motivo. La tribuna Sur queda cerrada para este partido.' },
    { id: 'afinidad-no-concluyente', corto: 'Afinidad dudosa: pasa', punto: 'verde', c: 0, paso: 'Deja pasar', noConcluyente: true, persona: P.andres, ini: 'titulares', sug: [P.tomas].concat(SUG), que: 'No se detiene: no queda claro de qué club es hincha el titular, así que se deja pasar.', ve: 'Asigna el ingreso a Tomás y avanza a Pago, como en la compra sin problemas. El motivo queda anotado en la auditoría.' },
    { id: 'compro-otros', corto: 'Compro para otros', punto: 'verde', c: 0, paso: 'No corta', persona: P.andres, ini: 'titulares', yoVoy: false, cantidad: 2, que: 'No se detiene: quien compra no va a entrar y deja «Yo también voy» apagado.', ve: 'Los 2 ingresos quedan para otras personas; ninguno con su documento.' },
    { id: 'doc-repetido', corto: 'Documento repetido', punto: 'rojo', c: 0, paso: 'Sin consulta', persona: P.andres, ini: 'titulares', cantidad: 3, llenos: 1, sug: [P.santiago, P.santiago, P.lucia], que: 'No llega a consultar: el mismo documento no puede estar en dos ingresos de la orden.', ve: 'Al escribir el documento de Santiago en el tercer ingreso, el campo marca «Este documento ya está en el ingreso 2».' },
    { id: 'titular-medida-pago', corto: 'Titular con medida al pagar', punto: 'rojo', c: 3, paso: 'Medidas · DB', persona: P.andres, ini: 'pago', cantidad: 3, sug: [P.santiago, P.julian], cupoFalla: 3, falla: F_MEDIDA, que: 'Se detiene al pagar: mientras pagaba apareció una medida vigente del documento del titular del ingreso 3.', ve: 'No se cobra y la reserva sigue. Vuelve a Titulares con ese ingreso marcado para asignarlo a otra persona.' },
    { id: 'transferencia', corto: 'Cambiar titular tras pagar', punto: 'verde', c: 0, paso: 'No corta', persona: P.andres, ini: 'listo', cantidad: 2, transfer: P.tomas, que: 'No se detiene: después de pagar, el titular de un ingreso se cambia hasta el inicio del partido.', ve: 'En Tus ingresos toca «Cambiar titular»; se valida a quien recibe y el ingreso pasa a su documento.' },
    { id: 'transferencia-bloqueada', corto: 'Cambio de titular bloqueado', punto: 'rojo', c: 2, paso: 'Medidas · DB', persona: P.andres, ini: 'listo', cantidad: 2, transfer: P.julian, malo: P.julian, falla: F_MEDIDA, que: 'Se detiene al cambiar el titular: la persona que recibiría el ingreso tiene una medida vigente.', ve: '«No es posible asignar este ingreso a esta persona», sin motivo. El ingreso sigue con el titular actual.' }
  ];
  CASOS.forEach(function (c, i) { c.n = i + 1; });
  function casoPorId(id) { return CASOS.filter(function (c) { return c.id === id; })[0] || CASOS[0]; }

  function loc(x) { var id = x && x.id ? x.id : x; return LOCS.filter(function (l) { return l.id === id; })[0] || LOCS[1]; }
  function total(st) { return st.cantidad * (loc(st.localidad).p + CARGO); }
  // La silla es dato de la comercializadora: el derecho de ingreso solo lleva documento, evento y sector.
  function puesto(st, n) { var l = loc(st.localidad); return l.fila ? 'Fila ' + l.fila + ' · Silla ' + (17 + n) : 'General'; }

  /* ---------- Cupos: un ingreso por persona, cada uno con su titular ---------- */
  function cupoVacio(n) { return { n: n, titular: null, estado: 'vacio', codigo: null, esPropietario: false, intentos: 0 }; }
  function datosDe(p) { return { tipo: p.tipo, num: p.num, nombre: p.nombre, doc: p.tipo + ' ' + p.num }; }
  function ponerPropietario(st, c) { c.titular = datosDe(st.persona); c.estado = 'ok'; c.codigo = null; c.esPropietario = true; }
  // Devuelve el nombre de quien perdió su lugar si no quedaba ingreso libre para el propietario.
  function asegurarPropietario(st) {
    if (!st.yoVoy || !st.persona || st.cupos.some(function (c) { return c.esPropietario; })) { return null; }
    var libres = st.cupos.filter(function (c) { return c.estado !== 'ok'; }), c = libres[0] || st.cupos[st.cupos.length - 1];
    var desplazado = c.titular ? c.titular.nombre : null;
    ponerPropietario(st, c);
    return desplazado;
  }
  function ajustarCupos(st, n) {
    n = Math.max(1, Math.min(st.disponibles || MAX, n));
    while (st.cupos.length < n) { st.cupos.push(cupoVacio(st.cupos.length + 1)); }
    while (st.cupos.length > n) {
      var i, vacios = st.cupos.filter(function (c) { return c.estado !== 'ok' && !c.esPropietario; });
      var quitar = vacios.length ? vacios[vacios.length - 1] : null;
      if (!quitar) { for (i = st.cupos.length - 1; i >= 0; i--) { if (!st.cupos[i].esPropietario) { quitar = st.cupos[i]; break; } } }
      st.cupos.splice(st.cupos.indexOf(quitar || st.cupos[st.cupos.length - 1]), 1);
    }
    st.cupos.forEach(function (c, k) { c.n = k + 1; });
    st.cantidad = n;
    return asegurarPropietario(st);
  }
  function alternarYo(st) {
    if (st.yoVoy) {
      st.cupos.forEach(function (c) { if (c.esPropietario) { c.titular = null; c.estado = 'vacio'; c.esPropietario = false; } });
      st.yoVoy = false; return null;
    }
    st.yoVoy = true;
    return asegurarPropietario(st);
  }
  function todosOk(st) { return st.cupos.length === st.cantidad && st.cupos.every(function (c) { return c.estado === 'ok' && c.titular; }); }
  function faltante(st) {
    var f = st.cupos.filter(function (c) { return c.estado !== 'ok'; });
    if (!f.length) { return ''; }
    if (f.length > 1) { return 'Faltan ' + f.length + ' ingresos por asignar.'; }
    return f[0].estado === 'denegado' ? 'El ingreso ' + f[0].n + ' necesita otra persona.' : 'Falta asignar el ingreso ' + f[0].n + '.';
  }
  // Quién ya tiene ese documento en la orden: número de ingreso, -1 si es el propietario sin «Yo también voy», 0 si nadie.
  function ocupante(st, tipo, num, exceptoN) {
    var k = claveDoc(tipo, num), lista = st.pagado ? st.ingresos : st.cupos, i;
    for (i = 0; i < lista.length; i++) {
      if (lista[i].n !== exceptoN && lista[i].titular && claveDoc(lista[i].titular.tipo, lista[i].titular.num) === k) { return lista[i].n; }
    }
    if (!st.pagado && !st.yoVoy && st.persona && claveDoc(st.persona.tipo, st.persona.num) === k) { return -1; }
    return 0;
  }
  // Persona que el panel propone para ese ingreso; tras un rechazo salta a la siguiente que no esté ya en la orden.
  function sugerido(st, n) {
    var sug = st.caso.sug || SUG, c = st.cupos.filter(function (x) { return x.n === n; })[0], intentos = c ? c.intentos : 0;
    var k = st.cupos.filter(function (x) { return x.n < n && !x.esPropietario; }).length + intentos, p;
    for (; k < sug.length; k++) { p = sug[k]; if (!intentos || !ocupante(st, p.tipo, p.num, n)) { return p; } }
    return null;
  }

  function armarCupos(st) {
    var c = st.caso, n = st.cantidad, sug = c.sug || SUG, llenos = c.llenos != null ? c.llenos : (c.ini === 'pago' || c.ini === 'listo' ? n : 0), k = 0, i;
    st.cupos = [];
    for (i = 1; i <= n; i++) { st.cupos.push(cupoVacio(i)); }
    asegurarPropietario(st);
    st.cupos.forEach(function (x) {
      if (x.esPropietario || k >= llenos) { return; }
      x.titular = datosDe(sug[k++]); x.estado = 'ok';
    });
  }

  function nuevoEstado(caso) {
    var st = {
      pantalla: 'evento', caso: caso, casoId: caso.id,
      persona: null, localidad: loc(caso.loc || 'ori'), cantidad: caso.cantidad || 2, disponibles: MAX - (caso.previas || 0), medio: 'tarjeta',
      form: { tipo: caso.persona.tipo, doc: caso.persona.num, nombre: caso.persona.nombre },
      id: { estado: 'espera', restantes: 3, error: false }, consultando: 0, bloqueo: null,
      reservaFin: 0, pagado: false, yoVoy: caso.yoVoy !== false, cupos: [], ingresos: [], edit: null, avisoPago: 0
    };
    // Cada caso abre donde importa, sin repetir los pasos de compra que no le aportan.
    if (caso.ini) {
      st.pantalla = caso.ini;
      st.persona = caso.persona; st.id.estado = 'ok';
      st.reservaFin = Date.now() + RESERVA;
      armarCupos(st);
      if (caso.ini === 'listo') { st.pagado = true; st.reservaFin = 0; crearIngresos(st); }
    }
    return st;
  }

  /* ---------- Definiciones de las consultas (a la app se presentan como consulta a DB) ---------- */
  function paso(n, logo, texto, baja, sube, ms) { return { n: n, logo: logo, texto: texto, baja: baja, sube: sube, r: 'ok', ms: ms }; }
  function marcar(p, texto, sube) { p.texto = texto; p.sube = sube; p.r = 'falla'; }
  function ingresos(n) { return n + (n === 1 ? ' ingreso' : ' ingresos'); }
  // Casos de prueba (shared/demo-casos.js): una sanción vigente en el IVC corta la venta sin decir el motivo.
  function conMedida(tipo, num) { return !!(window.DemoCasos && window.DemoCasos.bloqueado(tipo, num)); }
  function dePaso(p, nombre) { return p.filter(function (x) { return x.n === nombre; })[0]; }

  // Consulta 1 · ¿Puede comprar? Valida a quien compra; `extra.cantidad` es lo que pide al subir la cantidad en Titulares.
  function def1(st, extra) {
    var c = st.caso, tf = { doc: st.form.tipo + ' ' + st.form.doc }, previas = c.previas || 0, pide = extra.cantidad || st.cantidad;
    var p = [
      paso('Graderío', 'GR', 'Envía documento, nombre, evento y cantidad', tf.doc + ' · ' + ingresos(pide), 'Recibida', 120),
      paso('Registraduría', 'ANI', 'Documento vigente · nombre coincide', 'Documento · Nombre', 'Vigente ✓', 320),
      paso('Medidas', 'DB', 'Sin medida correctiva vigente', 'Documento', 'Sin medida ✓', 210),
      paso('Límite', 'DB', previas + ' de 5 para este evento · puede comprar hasta ' + Math.max(0, MAX - previas), 'Evento · Cantidad', 'Dentro del límite ✓', 140),
      paso('Decisión · DB', 'DB', 'Autorizado · queda en la auditoría', null, 'Autorizado', 60)
    ];
    var def = { consulta: 'Consulta 1 de 3 · ¿Puede comprar?', tag: 'Autorizado', pasos: p, codigo: 'Autorizado' };
    var corta = function (i, texto, sube, tag, cod) { marcar(p[i], texto, sube); def.tag = 'Denegado · ' + tag; def.codigo = cod || tag; };
    if (c.id === 'medida-id') { corta(2, 'Tiene una medida correctiva vigente', 'Medida vigente ✕', 'Medida restrictiva vigente'); }
    else if (c.id === 'doc-invalido') { corta(1, 'Cédula cancelada en el ANI', 'No válido ✕', 'Documento no válido'); }
    else if (c.id === 'identidad' && !extra.corregido) { corta(1, 'El nombre no corresponde al documento', 'No coincide ✕', 'Identidad no coincide'); }
    else if (conMedida(st.form.tipo, st.form.doc)) { corta(2, 'Tiene una medida correctiva vigente', 'Medida vigente ✕', 'Medida restrictiva vigente'); }
    else if (previas + pide > MAX) { corta(3, 'Ya tiene ' + previas + ' ingresos para este evento en otra comercializadora · pide ' + pide, 'Supera 5 ✕', 'Límite de venta excedido'); }
    else if (previas) { p[3].texto = previas + ' de 5 en otra comercializadora · pide ' + pide; }
    return def;
  }

  // Consulta 2 · ¿Puede recibir? Una por ingreso: la comercializadora envía documento y nombre, el sistema solo dice sí o no.
  function def2(st, extra) {
    var c = st.caso, t = extra.titular, tr = extra.transferencia, k = extra.cupo;
    var p = [
      paso('Graderío', 'GR', tr ? 'Envía el cambio de titular del ingreso ' + k : 'Envía el ingreso ' + k + ' con su titular', t.doc + ' · ' + t.nombre, 'Recibida', 110),
      paso('Registraduría', 'ANI', 'Documento vigente · nombre coincide', 'Documento · Nombre', 'Vigente ✓', 260),
      paso('Medidas', 'DB', 'Sin medida correctiva vigente', 'Documento', 'Sin medida ✓', 190),
      paso('Una por evento', 'DB', 'Su documento no tiene otro derecho de ingreso a este partido', 'Evento', 'Sin otro derecho ✓', 120),
      paso('Afinidad y sector', 'DB', loc(st.localidad).n + ' habilitada para esta persona', 'Sector · Partido', 'Cumple ✓', 150),
      paso('Decisión · DB', 'DB', tr ? 'Autorizado · el derecho de ingreso cambia de documento' : 'Autorizado · ingreso ' + k + ' asignado', null, 'Autorizado', 50)
    ];
    if (tr) { p.splice(1, 0, paso('Titular actual', 'DB', 'Sigue siendo titular · antes del inicio del partido', 'Ingreso ' + k, 'Vigente ✓', 100)); }
    var def = { consulta: 'Consulta 2 de 3 · ¿Puede recibir? · Ingreso ' + k + (tr ? ' (cambio de titular)' : ''), tag: 'Autorizado', pasos: p, codigo: 'Autorizado' };
    if (c.noConcluyente) { var af = dePaso(p, 'Afinidad y sector'); af.texto = 'Afinidad no concluyente · deja pasar y queda en la auditoría'; af.sube = 'No concluyente ✓'; }
    var f = c.falla;
    if (c.c === 2 && c.malo && f && claveDoc(t.tipo, t.num) === claveDoc(c.malo.tipo, c.malo.num)) {
      marcar(dePaso(p, f.paso), f.texto, f.sube); def.tag = 'Denegado · ' + f.cod; def.codigo = f.cod;
    } else if (conMedida(t.tipo, t.num)) {
      marcar(dePaso(p, 'Medidas'), F_MEDIDA.texto, F_MEDIDA.sube); def.tag = 'Denegado · ' + F_MEDIDA.cod; def.codigo = F_MEDIDA.cod;
    }
    return def;
  }

  // Consulta 3 · revalida al pagar; si pasa, nace el derecho de ingreso de cada documento.
  function def3(st) {
    var c = st.caso, n = st.cupos.length, previas = c.previas || 0;
    var p = [
      paso('Graderío', 'GR', 'Envía la orden antes de cobrar', 'Orden · ' + ingresos(n) + ' · ' + n + ' titulares', 'Recibida', 110),
      paso('Registraduría', 'ANI', 'Siguen vigentes el documento de quien compra y los de los ' + n + ' titulares', 'Documentos', 'Vigentes ✓', 230),
      paso('Medidas', 'DB', 'Sin medida vigente en quien compra ni en los titulares', 'Documentos', 'Sin medida ✓', 200),
      paso('Límite', 'DB', 'Sigue en ' + (previas + n) + ' de 5 · sin compras nuevas', 'Evento · Cantidad', 'Dentro del límite ✓', 130),
      paso('Una por evento', 'DB', 'Ningún titular tiene otro derecho de ingreso a este partido', 'Evento', 'Sin otro derecho ✓', 120),
      paso('Derecho de ingreso', 'DB', 'Autoriza la orden · ' + n + (n === 1 ? ' derecho registrado' : ' derechos registrados, uno por documento'), 'Documento · Evento · Sector', 'Registrado ✓', 90)
    ];
    var def = { consulta: 'Consulta 3 de 3 · revalida al pagar', tag: 'Autorizado · ' + (n === 1 ? 'derecho registrado' : n + ' derechos registrados'), pasos: p, codigo: 'Autorizado', sujeto: null, cupo: 0 };
    var corta = function (nombre, texto, sube, cod, sujeto, cupo) { marcar(dePaso(p, nombre), texto, sube); def.tag = 'Denegado · ' + cod; def.codigo = cod; def.sujeto = sujeto; def.cupo = cupo || 0; };
    if (!def.sujeto && st.persona && conMedida(st.persona.tipo, st.persona.num)) { corta('Medidas', 'Tiene una medida correctiva vigente', 'Medida vigente ✕', 'Medida restrictiva vigente', 'comprador'); }
    st.cupos.forEach(function (q) {
      if (!def.sujeto && q.titular && conMedida(q.titular.tipo, q.titular.num)) { corta('Medidas', 'El titular del ingreso ' + q.n + ' tiene una medida vigente', 'Medida vigente ✕', 'Medida restrictiva vigente', 'cupo', q.n); }
    });
    if (c.id === 'cambio-medida') { corta('Medidas', 'Se registró una medida de quien compra durante la reserva', 'Medida vigente ✕', 'Medida restrictiva vigente', 'comprador'); }
    if (c.id === 'limite-carrera') { corta('Límite', 'Compró ' + c.carrera + ' en otra comercializadora durante la reserva · ahora serían ' + (c.carrera + n), 'Supera 5 ✕', 'Límite de venta excedido', 'comprador'); }
    if (c.id === 'titular-medida-pago') { corta('Medidas', 'Se registró una medida del titular del ingreso ' + c.cupoFalla + ' durante la reserva', 'Medida vigente ✕', 'Medida restrictiva vigente', 'cupo', c.cupoFalla); }
    return def;
  }

  /* ---------- Marco de Graderío (celular y escritorio) ---------- */
  var LOGO = '<span class="pc-logo"><span class="pc-logo__m"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M1 16h16V2h-4v4H9v4H5v4H1z" fill="#FFCC1A"/></svg></span><span class="pc-logo__t">graderío<small>Comercializadora de eventos</small></span></span>';
  /* o = { paso, atras: 'data-acc' | null, cuerpo, pie? } */
  function marco(o) {
    var pie = o.pie ? o.pie : '';
    return '<div class="pc-screen">' +
      '<header class="pc-top"><div class="pc-top__izq">' + (o.atras ? '<button type="button" class="pc-ib" aria-label="Volver" data-acc="' + o.atras + '">' + ico('atras', 22) + '</button>' : '') + LOGO + '</div></header>' +
      '<main class="pc-body">' + o.cuerpo + '</main>' + (pie ? '<footer class="pc-foot">' + pie + '</footer>' : '') + '</div>';
  }

  // «Resultado de la validación»: nunca dice el motivo. o = { titulo, texto, acciones:[{acc, texto, icono?, clase?}] }
  function botonesRes(acciones) {
    return (acciones || []).map(function (a) { return '<button type="button" class="pc-s-btn ' + (a.clase || 'pc-s-btn--pri') + '" data-acc="' + a.acc + '">' + (a.icono ? ico(a.icono, 18) : '') + '<span>' + esc(a.texto) + '</span></button>'; }).join('');
  }
  // Con `enPie`, los botones no van en la pieza: quien la usa los pone en el pie fijo con botonesRes.
  function resultado(o) {
    var acc = o.enPie ? '' : botonesRes(o.acciones);
    return '<div class="pc-s-pieza pc-s-pieza--res" role="alert"><div class="pc-s-res"><span class="pc-s-res__ic">' + ico('alerta', 28) + '</span><h2 class="pc-s-h">' + esc(o.titulo) + '</h2><p class="pc-s-p">' + esc(o.texto) + '</p></div>' +
      '<div class="pc-s-res__acc">' + acc + '<div class="pc-s-sello"><img src="assets/mindeporte.svg" alt="Ministerio del Deporte"><i></i><span>Validado</span></div></div></div>';
  }

  /* ---------- Piezas comunes de las pantallas ---------- */
  function tarjetaPersona(p, sello, cambiar) {
    return '<section class="pc-card pc-pagando" aria-label="Pagando como"><div class="pc-pagando__cab"><span class="pc-pagando__t">PAGANDO COMO</span>' +
      (cambiar ? '<button type="button" class="pc-enlace" aria-label="No soy yo, cambiar de persona" data-acc="cmp-cambiar">No soy yo</button>' : '') + '</div>' +
      '<div class="pc-titular"><span class="pc-avatar">' + esc(iniciales(p.nombre)) + '</span><span class="pc-titular__t"><b>' + esc(p.nombre) + '</b><span>' + esc(p.doc) + '</span></span></div>' +
      '<div class="pc-verificada">' + ico('escudo', 18) + 'Identidad verificada</div>' +
      '</section>';
  }
  function botonCarga(texto) { return '<button type="button" class="pc-btn pc-btn--carga" aria-disabled="true">' + ico('girar', 20, ' class="pc-gira"') + '<span>' + esc(texto) + '</span></button>'; }
  function boton(acc, texto, icono, clase) { return '<button type="button" class="pc-btn' + (clase ? ' ' + clase : '') + '" data-acc="' + acc + '">' + (icono === 'candado' ? ico('candado', 18) : '') + '<span>' + esc(texto) + '</span>' + (icono === 'flecha' ? ico('flecha', 20) : '') + '</button>'; }
  function estadoOk(t, d) { return '<div class="pc-ok" role="status">' + ico('check', 22) + '<div><b>' + esc(t) + '</b>' + (d ? '<span>' + esc(d) + '</span>' : '') + '</div></div>'; }
  function aviso(t, d) { return '<div class="pc-aviso">' + ico('triangulo', 22) + '<div><b>' + esc(t) + '</b>' + (d ? '<span>' + esc(d) + '</span>' : '') + '</div></div>'; }
  function relojTexto(st) {
    var s = st.reservaFin ? Math.max(0, Math.round((st.reservaFin - Date.now()) / 1000)) : 0;
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function chipReloj(st, largo) {
    return '<span class="pc-timer" role="timer" aria-label="Tiempo de la reserva">' + ico('reloj', 18) + '<span>' + (largo ? 'Tu reserva vence en ' : 'Reserva ') + '<span data-reloj>' + relojTexto(st) + '</span></span></span>';
  }

  Object.assign(COMPRA, {
    marco: marco, resultado: resultado, ico: ico, dinero: dinero, iniciales: iniciales, primerNombre: primerNombre, enmascarar: enmascarar,
    casos: CASOS, localidad: loc, TIPOS_DOC: TIPOS_DOC, validarDoc: validarDoc, ocupante: ocupante, puesto: puesto, sugerido: sugerido, ajustarCupos: ajustarCupos, alternarYo: alternarYo,
    todosOk: todosOk, faltante: faltante, chipReloj: chipReloj, botonCarga: botonCarga, aviso: aviso, MAX: MAX
  });

  /* ---------- Pantalla 1 · Evento y localidad ---------- */
  function totalTexto(st) { return 'Un ingreso · ' + loc(st.localidad).n; }
  function precioUna(st) { return dinero(loc(st.localidad).p + CARGO); }
  COMPRA.registrar('evento', {
    render: function (cx) {
      var st = cx.st, c = st.caso;
      var locs = LOCS.map(function (l) {
        var off = c.sinVisitante && l.id === 'sur', sel = l.id === st.localidad.id;
        return '<button type="button" class="pc-opt' + (sel ? ' pc-opt--sel' : '') + (off ? ' pc-opt--off' : '') + '" role="radio" aria-checked="' + sel + '"' + (off ? ' aria-disabled="true"' : '') + ' data-acc="cmp-loc" data-v="' + l.id + '">' +
          '<span class="pc-opt__radio"></span><span class="pc-opt__txt"><b>' + l.n + '</b><span>' + (off ? 'Cerrada · partido sin hinchada visitante' : l.d) + '</span></span><span class="pc-opt__p">' + dinero(l.p) + '</span></button>';
      }).join('');
      var cuerpo =
        '<section class="pc-evento"><img src="assets/estadios/atanasio.webp" alt="Estadio Atanasio Girardot" class="pc-evento__img"><div class="pc-evento__t">' +
          '<span class="pc-evento__liga">LIGA · FECHA 12</span><h1 class="pc-h1" tabindex="-1">Nacional vs. Medellín</h1>' +
          '<div class="pc-evento__meta"><span>' + ico('cal', 16) + 'Lun 28/ Sep/26 · 7:00 p. m.</span><span>' + ico('lugar', 16) + 'Atanasio Girardot, Medellín</span></div></div></section>' +
        '<section class="pc-seccion"><h2 class="pc-h2">Elige tu localidad</h2><div class="pc-opts" role="radiogroup" aria-label="Localidad">' + locs + '</div></section>' +
        '<p class="pc-sub">Máximo 5 ingresos por persona. Cada ingreso es de una persona con su documento; la cantidad y los titulares los eliges después de identificarte.</p>';
      var pie = '<div class="pc-total"><span class="pc-total__t"><span data-resumen>' + totalTexto(st) + '</span></span><b data-total>' + precioUna(st) + '</b></div>' + boton('cmp-continuar', 'Continuar', 'flecha');
      return marco({ paso: 'evento', atras: null, cuerpo: cuerpo, pie: pie });
    },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc;
      if (a === 'cmp-continuar') { cx.ir('identificar'); return; }
      if (a !== 'cmp-loc') { return; }
      if (el.getAttribute('aria-disabled') === 'true') { cx.toast('Localidad cerrada', 'Este partido va sin hinchada visitante.'); return; }
      st.localidad = loc(el.dataset.v);
      cx.raiz.querySelectorAll('[data-acc="cmp-loc"]').forEach(function (b) { var s = b === el; b.classList.toggle('pc-opt--sel', s); b.setAttribute('aria-checked', String(s)); });
      // Solo cambian el resumen y el precio: la foto no se vuelve a pintar.
      cx.raiz.querySelector('[data-resumen]').textContent = totalTexto(st);
      cx.raiz.querySelector('[data-total]').textContent = precioUna(st);
    }
  });

  /* ---------- Pantalla 2 · Identificarse (consulta 1) ---------- */
  // Acciones de los bloqueos: van en el pie fijo del equipo, siempre abajo (DC-223).
  var ACC_PORTAL = { acc: 'cmp-portal', texto: 'Consultar mi estado', icono: 'externo' };
  var BTN_VOLVER = '<button type="button" class="pc-btn pc-btn--sec" data-acc="cmp-evento">Volver al evento</button>';
  function bloqueoIdentificar(cx) {
    var st = cx.st, b = st.bloqueo, p = st.form;
    var quien = { nombre: p.nombre || 'Sin nombre', doc: p.tipo + ' ' + p.doc };
    if (b.codigo === 'Límite de venta excedido') {
      return marco({ paso: 'identificar', atras: 'cmp-evento', fondo: true, cuerpo:
        '<h2 class="pc-h1 pc-tit">Tus datos</h2>' +
        '<div class="pc-cab"><h1 class="pc-h1" tabindex="-1">Superas el límite de ingresos para este evento</h1><p class="pc-sub">' + esc(quien.nombre) + ' · ' + esc(quien.doc) + '</p></div>' +
        aviso('Máximo 5 ingresos por persona', 'El límite suma los ingresos que tengas para este evento en cualquier comercializadora (Decreto 1622 de 2022).') +
        '<p class="pc-sub pc-centro">No reservamos ingresos ni hicimos ningún cobro.</p>',
      pie: botonesRes([{ acc: 'cmp-portal', texto: 'Ver mis ingresos en mi portal', icono: 'externo', clase: 'pc-s-btn--grande' }]) + BTN_VOLVER });
    }
    var acciones = [ACC_PORTAL];
    return marco({ paso: 'identificar', atras: 'cmp-evento', fondo: true, cuerpo:
      '<h2 class="pc-h1 pc-tit">Tus datos</h2>' +
      '<div class="pc-card pc-persona"><span class="pc-avatar">' + esc(iniciales(quien.nombre)) + '</span><span class="pc-titular__t"><b>' + esc(quien.nombre) + '</b><span>' + esc(quien.doc) + '</span></span></div>' +
      resultado({ titulo: 'No es posible continuar', texto: 'Consulta tu estado en tu portal de estado.', acciones: acciones, enPie: true }) +
      '<p class="pc-sub pc-centro">No reservamos ingresos ni hicimos ningún cobro.</p>',
      pie: botonesRes(acciones) + BTN_VOLVER });
  }

  COMPRA.registrar('identificar', {
    render: function (cx) {
      var st = cx.st, f = st.form, i = st.id;
      if (st.bloqueo) { return bloqueoIdentificar(cx); }
      var tipos = TIPOS_DOC.map(function (t) { return '<option' + (t.id === f.tipo ? ' selected' : '') + ' title="' + esc(t.nombre) + '">' + t.id + '</option>'; }).join('');
      var texto = i.formato || (i.vacio ? 'Escribe tu documento y tu nombre.' : '');
      var err = i.error
        ? '<p class="pc-error" id="err-id" role="alert">' + ico('info', 16) + '<span>El nombre y el documento no coinciden con los de la Registraduría. Revisa el número y escribe tu nombre como aparece en tu documento.</span></p>' +
          '<p class="pc-nota">' + ico('info', 16) + '<span>Te quedan ' + i.restantes + (i.restantes === 1 ? ' intento' : ' intentos') + '.</span></p>'
        : (texto ? '<p class="pc-error" id="err-id" role="alert">' + ico('info', 16) + '<span>' + esc(texto) + '</span></p>' : '');
      var mal = i.error || texto ? ' pc-input--error" aria-invalid="true" aria-describedby="err-id' : '';
      var cuerpo = '<h2 class="pc-h1 pc-tit">Tus datos</h2>' +
        '<h1 class="pc-sr" tabindex="-1">¿A nombre de quién va la compra?</h1>' +
        '<div class="pc-fila"><label class="pc-campo">Tipo<select class="pc-input pc-input--sel" data-campo="tipo">' + tipos + '</select></label>' +
        '<label class="pc-campo">Número de documento<input class="pc-input' + mal + '" inputmode="' + (f.tipo === 'PA' ? 'text' : 'numeric') + '" data-campo="doc" value="' + esc(f.doc) + '" autocomplete="off"></label></div>' +
        '<label class="pc-campo">Nombre completo, como en tu documento<input class="pc-input' + mal + '" data-campo="nombre" value="' + esc(f.nombre) + '" autocomplete="off"></label>' + err;
      var pie = st.consultando === 1 ? botonCarga('Validando…') : boton('cmp-id-continuar', i.error ? 'Intentar de nuevo' : 'Continuar');
      return marco({ paso: 'identificar', atras: 'cmp-atras', cuerpo: cuerpo, pie: pie });
    },
    // Con el resultado a la vista, baja hasta el aviso para que se lea sin buscarlo.
    alMontar: function (cx) { var b = cx.raiz.querySelector('.pc-body'); if (b && cx.st.id.error) { b.scrollTop = b.scrollHeight; } },
    onInput: function (ev, cx) {
      var t = ev.target, k = t.dataset && t.dataset.campo;
      if (k) { cx.st.form[k] = t.value; }
    },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc;
      if (st.consultando) { return; }
      if (a !== 'cmp-id-continuar') { return; }
      var c = st.caso, f = st.form;
      st.id.formato = '';
      if (!f.doc.trim() || !f.nombre.trim()) { st.id.vacio = true; cx.repintar(); return; }
      st.id.vacio = false;
      st.id.formato = validarDoc(f.tipo, f.doc);
      if (st.id.formato) { cx.repintar(); return; }
      // Corrigió los datos si cambió algo frente a lo que trajo el caso: así «Intentar de nuevo» tiene sentido.
      var corregido = f.doc !== c.persona.num || f.nombre !== c.persona.nombre || f.tipo !== c.persona.tipo;
      st.consultando = 1;
      cx.raiz.querySelector('.pc-foot .pc-btn, .pc-foot--suelto .pc-btn').outerHTML = botonCarga('Validando…');
      cx.consultar(1, function (r) {
        st.consultando = 0;
        if (r.ok) {
          st.persona = { nombre: f.nombre.trim(), tipo: f.tipo, num: f.doc.trim(), doc: f.tipo + ' ' + f.doc.trim() };
          st.id.estado = 'ok'; st.id.error = false;
          // La reserva corre desde aquí: ya se sabe que puede comprar y cuántos ingresos le quedan.
          st.disponibles = MAX - (c.previas || 0); st.cantidad = Math.min(st.cantidad, st.disponibles) || 1; st.reservaFin = Date.now() + RESERVA;
          st.cupos = [];
          // Sin pantalla de éxito: pasa sola a Cantidad (DC-228); la espera deja leer la franja.
          setTimeout(function () { if (st.pantalla === 'identificar' && st.id.estado === 'ok' && !st.bloqueo) { cx.ir('cantidad'); } }, 400);
          return;
        } else if (r.codigo === 'Identidad no coincide') {
          st.id.restantes = Math.max(0, st.id.restantes - 1);
          st.id.error = true;
          if (st.id.restantes === 0) { st.bloqueo = { n: 1, codigo: 'Identidad no coincide', corte: r.corte }; }
        } else { st.bloqueo = { n: 1, codigo: r.codigo, corte: r.corte }; }
        cx.repintar();
      }, { corregido: corregido, reintentable: true });
    }
  });

  /* ---------- Pantalla 3 · Cantidad (ya se conoce el tope de quien compra) ---------- */
  COMPRA.registrar('cantidad', {
    render: function (cx) {
      var st = cx.st, l = loc(st.localidad), previas = st.caso.previas || 0;
      var nota = previas
        ? 'Ya tienes ' + previas + ' para este partido, así que puedes comprar hasta ' + st.disponibles + ' más.'
        : 'Máximo 5 por persona, contándote a ti si vas a entrar.';
      var cuerpo = '<div class="pc-fila-t"><h1 class="pc-h1 pc-tit" tabindex="-1">Cantidad</h1>' + chipReloj(st) + '</div>' +
        '<section class="pc-card"><div class="pc-cant"><div class="pc-cant__t"><h2 class="pc-h2">¿Cuántos ingresos?</h2><span class="pc-sub">' + esc(l.n) + ' · ' + dinero(l.p + CARGO) + ' cada una, con cargo</span></div>' +
        '<div class="pc-stepper"><button type="button" class="pc-step" aria-label="Quitar un ingreso" data-acc="cmp-menos"' + (st.cantidad <= 1 ? ' disabled' : '') + '>' + ico('menos', 20) + '</button>' +
        '<span class="pc-step__n" data-cant aria-live="polite">' + st.cantidad + '</span>' +
        '<button type="button" class="pc-step" aria-label="Agregar un ingreso" data-acc="cmp-mas"' + (st.cantidad >= st.disponibles ? ' disabled' : '') + '>' + ico('mas', 20) + '</button></div></div></section>' +
        '<p class="pc-nota">' + ico('info', 16) + '<span>' + esc(nota) + ' En el siguiente paso asignas cada ingreso a una persona con su documento.</span></p>';
      var pie = '<div class="pc-total"><span class="pc-total__t"><span data-resumen>' + st.cantidad + ' × ' + esc(l.n) + '</span></span><b data-total>' + dinero(total(st)) + '</b></div>' + boton('cmp-cant-continuar', 'Continuar', 'flecha');
      return marco({ paso: 'cantidad', atras: 'cmp-atras', cuerpo: cuerpo, pie: pie });
    },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc, r = cx.raiz;
      if (a === 'cmp-cant-continuar') { ajustarCupos(st, st.cantidad); cx.ir('titulares'); return; }
      if (a !== 'cmp-menos' && a !== 'cmp-mas') { return; }
      st.cantidad = Math.max(1, Math.min(st.disponibles, st.cantidad + (a === 'cmp-mas' ? 1 : -1)));
      r.querySelector('[data-cant]').textContent = st.cantidad;
      r.querySelector('[data-acc="cmp-menos"]').disabled = st.cantidad <= 1;
      r.querySelector('[data-acc="cmp-mas"]').disabled = st.cantidad >= st.disponibles;
      r.querySelector('[data-resumen]').textContent = st.cantidad + ' × ' + loc(st.localidad).n;
      r.querySelector('[data-total]').textContent = dinero(total(st));
    }
  });

  /* ---------- Pantalla 5 · Pago (consulta 3) ---------- */
  var MEDIOS = [
    { id: 'tarjeta', n: 'Tarjeta de crédito o débito', d: 'Terminada en 4821 · vence 08/29', c: 'Tarjeta', cd: 'Crédito o débito', i: 'tarjeta' },
    { id: 'pse', n: 'Transferencia bancaria', d: 'Desde tu banco, por PSE', c: 'Transferencia', cd: 'Desde tu banco (PSE)', i: 'banco' }
  ];
  function bloqueoPago(cx) {
    var st = cx.st, p = st.persona, b = st.bloqueo, l = loc(st.localidad);
    var medida = b.codigo === 'Medida restrictiva vigente';
    var causa = medida ? 'p. ej. le radicaron una medida mientras pagaba' : 'p. ej. compró en otra comercializadora mientras pagaba';
    var cuerpo =
      '<div class="pc-fila-t"><h1 class="pc-h1 pc-tit" tabindex="-1">Pago</h1><span class="pc-estado pc-estado--vacio pc-estado--g">' + ico('reloj', 16) + 'Reserva liberada</span></div>' +
      tarjetaPersona(p, true, false) +
      '<p class="pc-nota pc-nota--equipo">' + ico('info', 16) + '<span><b>Nota del equipo, la persona no la ve.</b> Pasó las consultas 1 y 2 al identificarse y al asignar los titulares. Este bloqueo ocurre igual porque su estado cambió durante la reserva (' + causa + ').</span></p>' +
      (medida
        ? resultado({ titulo: 'No es posible continuar', texto: 'Consulta tu estado en tu portal de estado.', acciones: [ACC_PORTAL], enPie: true })
        : '<div class="pc-cab"><h2 class="pc-h1 pc-h1--m">Superas el límite de ingresos para este evento</h2>' + aviso('Máximo 5 ingresos por persona', 'Mientras pagabas se registró otra compra tuya para este evento en otra comercializadora.') + '</div>') +
      '<section class="pc-card"><p class="pc-nota pc-nota--tinta">' + ico('info', 16) + '<span>No hicimos ningún cobro a tu tarjeta terminada en 4821.</span></p>' +
      '<p class="pc-nota pc-nota--tinta">' + ico('info', 16) + '<span>Liberamos los ' + st.cantidad + ' ingresos de ' + l.n + ' que tenías reservados.</span></p></section>';
    var acciones = medida ? [ACC_PORTAL] : [{ acc: 'cmp-portal', texto: 'Ver mis ingresos en mi portal', icono: 'externo', clase: 'pc-s-btn--grande' }];
    return marco({ paso: 'pago', atras: null, fondo: true, cuerpo: cuerpo, pie: botonesRes(acciones) + BTN_VOLVER });
  }

  function pagoPie(st) {
    if (st.pagado) { return boton('cmp-ver-ingresos', 'Ver mis ingresos', 'flecha'); }
    if (st.consultando === 3) { return botonCarga('Confirmando…'); }
    if (!todosOk(st)) {
      return '<button type="button" class="pc-btn" disabled aria-describedby="pc-razon">' + ico('candado', 18) + '<span>Pagar ' + dinero(total(st)) + '</span></button>' +
        '<p class="pc-sub pc-centro" id="pc-razon">' + esc(faltante(st) || 'Asigna todos los ingresos para pagar.') + '</p>';
    }
    return boton('cmp-pagar', 'Pagar ' + dinero(total(st)), 'candado');
  }
  function pagoAviso(st) {
    return st.pagado ? estadoOk('Pago aprobado') : '';
  }
  function medioCelular(st) {
    var mm = MEDIOS.map(function (m) {
      var s = m.id === st.medio;
      return '<button type="button" class="pc-opt' + (s ? ' pc-opt--sel' : '') + '" role="radio" aria-checked="' + s + '" data-acc="cmp-medio" data-v="' + m.id + '"><span class="pc-opt__radio"></span><span class="pc-opt__txt"><b>' + m.n + '</b><span>' + m.d + '</span></span></button>';
    }).join('');
    return '<section class="pc-seccion"><h2 class="pc-h2">Medio de pago</h2><div class="pc-opts" role="radiogroup" aria-label="Medio de pago">' + mm + '</div>' +
      '</section>';
  }
  // Resumen de quién entra con cada ingreso, con los documentos enmascarados.
  function resumenTitulares(st) {
    var filas = st.cupos.map(function (c) {
      var t = c.titular;
      return '<li class="pc-resumen__fila"><span class="pc-resumen__n">' + c.n + '</span><span class="pc-titular__t"><b>' + esc(t ? t.nombre : 'Sin titular') + (c.esPropietario ? ' (tú)' : '') + '</b><span>' + esc(t ? enmascarar(t.doc) : 'Falta asignar') + '</span></span></li>';
    }).join('');
    return '<section class="pc-card" aria-label="Ingresos para"><div class="pc-pagando__cab"><span class="pc-pagando__t">INGRESOS PARA</span>' +
      (st.pagado ? '' : '<button type="button" class="pc-enlace" aria-label="Editar los titulares de los ingresos" data-acc="cmp-editar">Editar</button>') + '</div><ul class="pc-resumen">' + filas + '</ul></section>';
  }
  COMPRA.registrar('pago', {
    render: function (cx) {
      var st = cx.st, l = loc(st.localidad);
      if (st.bloqueo) { return bloqueoPago(cx); }
      if (!st.reservaFin && !st.pagado) { st.reservaFin = Date.now() + RESERVA; }
      var lineas = '<div class="pc-lin"><span>' + st.cantidad + ' × ' + l.n + '</span><b>' + dinero(st.cantidad * l.p) + '</b></div>' +
        '<div class="pc-lin"><span>Cargo por servicio</span><b>' + dinero(st.cantidad * CARGO) + '</b></div><hr class="pc-sep"><div class="pc-total"><span class="pc-total__b">Total</span><b>' + dinero(total(st)) + '</b></div>';
      var cuerpo = '<div class="pc-fila-t"><h1 class="pc-h1 pc-tit" tabindex="-1">Pago</h1>' + chipReloj(st) + '</div>' + tarjetaPersona(st.persona, true, !st.pagado) + resumenTitulares(st) +
        '<section class="pc-card">' + lineas + '</section>' + medioCelular(st) + pagoAviso(st);
      return marco({ paso: 'pago', atras: st.pagado ? null : 'cmp-atras', cuerpo: cuerpo, pie: pagoPie(st) });
    },
    alMontar: function (cx) { var b = cx.raiz.querySelector('.pc-body'); if (b && cx.st.pagado) { b.scrollTop = b.scrollHeight; } },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc, r = cx.raiz;
      if (a === 'cmp-cambiar') { st.persona = null; st.cupos = []; st.id = { estado: 'espera', restantes: 3, error: false }; st.form = { tipo: 'CC', doc: '', nombre: '' }; st.reservaFin = 0; cx.ir('identificar'); return; }
      if (a === 'cmp-editar') { cx.ir('titulares'); return; }
      if (a === 'cmp-medio') {
        st.medio = el.dataset.v;
        r.querySelectorAll('[data-acc="cmp-medio"]').forEach(function (b) { var s = b === el; b.classList.toggle('pc-opt--sel', s); b.setAttribute('aria-checked', String(s)); });
        return;
      }
      if (a === 'cmp-ver-ingresos') { cx.ir('listo'); return; }
      if (a !== 'cmp-pagar' || st.consultando || !todosOk(st)) { return; }
      st.consultando = 3;
      var zonaPie = r.querySelector('[data-pie]') || r.querySelector('.pc-foot');
      zonaPie.innerHTML = pagoPie(st);
      cx.consultar(3, function (res) {
        st.consultando = 0;
        if (res.ok) { crearIngresos(st); st.pagado = true; st.reservaFin = 0; cx.repintar(); cx.aprobar(); return; }
        // Falla un titular: no se cobra, la reserva sigue y vuelve a Titulares con ese ingreso marcado.
        if (res.sujeto === 'cupo') {
          var cupo = st.cupos.filter(function (x) { return x.n === res.cupo; })[0];
          if (cupo) { cupo.titular = null; cupo.estado = 'denegado'; cupo.codigo = res.codigo; cupo.intentos += 1; st.avisoPago = cupo.n; }
          cx.ir('titulares', true);
          return;
        }
        st.bloqueo = { n: 3, codigo: res.codigo, corte: res.corte }; st.reservaFin = 0;
        cx.repintar();
      });
    }
  });

  // Al pagar nace un derecho de ingreso por cupo: documento del titular, evento y sector.
  function crearIngresos(st) {
    var l = loc(st.localidad);
    st.ingresos = st.cupos.map(function (c) {
      return { n: c.n, esPropietario: c.esPropietario, localidad: l.n, puesto: puesto(st, c.n), puerta: l.puerta, titular: c.titular, noPosible: false };
    });
  }

  /* ---------- Pantalla final · Tus ingresos (id interno: listo) ---------- */
  COMPRA.registrar('listo', {
    render: function (cx) {
      var st = cx.st;
      if (!st.ingresos.length) { crearIngresos(st); }
      var cards = st.ingresos.map(function (b) {
        var cab = '<div class="pc-ingreso__cab"><b>' + esc(b.localidad + ' · ' + b.puesto) + '</b><span class="pc-estado pc-estado--claro">' + ico('check', 14) + 'Asignado</span></div>';
        var cuerpo = '<div class="pc-qr"><span class="pc-qr__doc">' + ico('documento', 44) + '</span><div class="pc-qr__d"><div class="pc-titular"><span class="pc-avatar">' + esc(iniciales(b.titular.nombre)) + '</span><span class="pc-titular__t"><b>' + esc(b.titular.nombre) + (b.esPropietario ? ' (tú)' : '') + '</b><span>' + esc(enmascarar(b.titular.doc)) + '</span></span></div>' +
          '<span class="pc-puerta">' + ico('puerta', 16) + esc(b.puerta) + '</span><span class="pc-nota-doc">Entra con su documento</span></div></div>';
        var acc = (b.noPosible ? aviso('No es posible asignar este ingreso a esta persona') : '') +
          '<button type="button" class="pc-btn pc-btn--sec" data-acc="lst-cambiar" data-n="' + b.n + '">' + ico('cambio', 18) + '<span>Cambiar titular</span></button>';
        return '<article class="pc-ingreso">' + cab + '<div class="pc-ingreso__cuerpo">' + cuerpo + '<div class="pc-ingreso__acc">' + acc + '</div></div></article>';
      }).join('');
      var n = st.ingresos.length;
      var cuerpo = '<h1 class="pc-h1 pc-tit" tabindex="-1">Tus ingresos</h1>' +
        estadoOk('Listo. ' + (n === 1 ? 'Tu ingreso tiene titular.' : 'Tus ' + n + ' ingresos tienen titular.'), 'Cada uno se revisa en la puerta con el documento de su titular.') +
        '<p class="pc-sub">Puedes cambiar el titular de un ingreso hasta el inicio del partido; se valida a quien recibe.</p>' +
        '<div class="pc-listas">' + cards + '</div>';
      return marco({ paso: 'listo', atras: null, cuerpo: cuerpo });
    },
    onClick: function (el, ev, cx) {
      if (el.dataset.acc === 'lst-cambiar' && COMPRA.abrirTitular) { COMPRA.abrirTitular(cx.st, Number(el.dataset.n), 'transfer'); cx.ir('titular'); }
    }
  });

  /* ---------- Montaje: marco del demo, panel de casos, equipo y capa ---------- */
  window.PANTALLAS.compra = function (raiz, ctxApp) {
    var st = M.st = nuevoEstado(CASOS[0]);
    var disp, zoom = 1, capa = null, gen = 0, timerToast = null, timerReloj = null, timerAprob = null, aprob = null;
    // Pantallas donde corre la reserva: si vence, la compra vuelve al evento.
    var CON_RELOJ = { cantidad: 1, titulares: 1, titular: 1, pago: 1 };
    var ATRAS = { identificar: 'evento', titulares: 'cantidad', pago: 'titulares' };

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar">' +
        '<nwt-title class="pp-toolbar__titulo">Comprar y asignar ingresos<span slot="subtitle">Paso 6 del flujo · Graderío (comercializadora ficticia)</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Volver al inicio</nwt-button></nwt-toolbar>';
    }
    // Mismo semáforo y marcado que la lista de /puerta, para que los dos paneles se lean igual.
    var ASPECTO = { verde: ['positive', 'positive'], amarillo: ['warning', 'attention'], rojo: ['negative', 'negative'] };
    function itemCaso(c) {
      var a = ASPECTO[c.punto] || ASPECTO.verde;
      return '<nwt-detail-item actionable nwt-theme="' + a[0] + '" data-caso="' + c.id + '">' + esc(c.corto) + '<span class="pp-caso__punto pp-caso__punto--' + c.punto + '" aria-hidden="true"></span></nwt-detail-item>';
    }
    // Los casos se agrupan por el momento del flujo en que ocurren, no todos son de compra: hay pago y asignación a otra persona.
    var GRUPOS = [['Sin problemas', ['feliz', 'compro-otros']], ['Al identificarse', ['medida-id', 'limite-id', 'identidad', 'doc-invalido']],
      ['Al asignar titulares', ['acomp-medida', 'acomp-ingreso', 'acomp-afinidad', 'afinidad-no-concluyente', 'doc-repetido']],
      ['Al pagar', ['limite-carrera', 'cambio-medida', 'titular-medida-pago']], ['Después de pagar', ['transferencia', 'transferencia-bloqueada']]];
    // Verdes primero (grupos y casos); el que no es rojo cuenta como verde. Cada grupo es un acordeón.
    var rojo = function (c) { return c.punto === 'rojo' ? 1 : 0; };
    function gruposOrdenados() {
      var usados = [];
      var gs = GRUPOS.map(function (g) { usados = usados.concat(g[1]); return [g[0], CASOS.filter(function (c) { return g[1].indexOf(c.id) >= 0; })]; });
      var otros = CASOS.filter(function (c) { return usados.indexOf(c.id) < 0; });
      if (otros.length) { gs.push(['Otros', otros]); }
      gs = gs.filter(function (g) { return g[1].length; }).map(function (g, i) {
        var cs = g[1].map(function (c, j) { return [c, j]; }).sort(function (x, y) { return rojo(x[0]) - rojo(y[0]) || x[1] - y[1]; }).map(function (x) { return x[0]; });
        var nr = cs.filter(rojo).length;
        return { t: g[0], cs: cs, rank: nr === 0 ? 0 : nr === cs.length ? 2 : 1, i: i };
      });
      return gs.sort(function (x, y) { return x.rank - y.rank || x.i - y.i; });
    }
    function casosAgrupados(abierto) {
      return gruposOrdenados().map(function (g, k) {
        var ab = abierto ? g.cs.some(function (c) { return c.id === abierto; }) : k === 0;
        return '<section class="pc-grupo' + (ab ? ' pc-grupo--abierto' : '') + '"><button type="button" class="pc-grupo__cab" data-grupo aria-expanded="' + ab + '">' +
          '<span class="pc-grupo__t">' + g.t + '</span><span class="pc-grupo__n">' + g.cs.length + '</span>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="pc-grupo__lista"' + (ab ? '' : ' hidden') + '>' + g.cs.map(itemCaso).join('') + '</div></section>';
      }).join('');
    }
    // Acordeón exclusivo (DC-059): al abrir un grupo se cierran los demás.
    function abrirGrupo(sec, ab) {
      if (ab) { sec.parentNode.querySelectorAll('.pc-grupo--abierto').forEach(function (o) { if (o !== sec) { abrirGrupo(o, false); } }); }
      sec.classList.toggle('pc-grupo--abierto', ab);
      sec.querySelector('[data-grupo]').setAttribute('aria-expanded', String(ab));
      sec.querySelector('.pc-grupo__lista').hidden = !ab;
    }
    function guion() {
      return '<aside class="pp-panel" aria-label="Controles del demo">' +
        '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">Casos</span><div class="pp-panel__lista" id="pc-casos">' + casosAgrupados() + '</div></nwt-card>' +
        '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">Este caso</span><div id="pc-caso-info" class="pc-caso-info"></div></nwt-card>' +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p></aside>';
    }
    function velocidadControl() {
      return '<div class="pp-velocidad"><div class="pp-velocidad__g" role="group" aria-label="Velocidad de validación" id="velocidad-ctrl">' +
        '<button type="button" class="pp-velocidad__b" data-vel="slow" aria-pressed="' + (M.vel === 'slow') + '">Slow motion</button>' +
        '<button type="button" class="pp-velocidad__b" data-vel="normal" aria-pressed="' + (M.vel === 'normal') + '">Tiempo real</button></div></div>';
    }
    function infoCaso() {
      var c = st.caso;
      var nota = c.c === 2 ? 'Esta consulta ocurre al asignar un ingreso en Titulares' + (c.ini === 'listo' ? ' o al cambiar su titular.' : '.')
        : c.cupoFalla ? 'Esta consulta ocurre al pagar, con el titular del ingreso ' + c.cupoFalla + '.' : '';
      var el = raiz.querySelector('#pc-caso-info');
      if (el) { el.innerHTML = '<p class="pc-caso-info__t">' + esc(c.que) + '</p><p><b>Lo que ve:</b> ' + esc(c.ve) + '</p>' + (nota ? '<p class="pc-caso-info__n">' + esc(nota) + '</p>' : ''); }
      raiz.querySelectorAll('#pc-casos nwt-detail-item').forEach(function (n) {
        var on = n.dataset.caso === c.id; n.classList.toggle('pc-caso--activo', on);
        if (on) { abrirGrupo(n.closest('.pc-grupo'), true); }
      });
    }

    function estadoBarra() {
      return M.disp === 'celular' ? '<div class="pp-estado" aria-hidden="true"><span>18:44</span><span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>' : '';
    }

    /* ---------- Contexto que ve cada pantalla (también las de B) ---------- */
    var cx = {
      D: null, st: st,
      repintar: function () { pintarPantalla(false); },
      toast: toast, esc: esc, ir: ir, consultar: consultar, reiniciar: reiniciar, aprobar: aprobar, raiz: null
    };

    function pantallaActual() { return COMPRA.pantallas[st.pantalla]; }

    // `conservarCapa`: tras una consulta la franja termina sola su espera de 2 s (no se corta al cambiar de pantalla).
    function ir(id, conservarCapa) {
      cancelarAprob();
      if (!COMPRA.pantallas[id]) { id = 'listo'; }
      st.pantalla = id;
      if (!conservarCapa) { gen++; if (capa) { capa.detener(); } }
      pintarPantalla(true);
    }

    function pintarPantalla(cambio) {
      var pan = pantallaActual();
      var vista = disp.querySelector('.pc-app');
      if (!vista) { pintarDispositivo(); return; }
      var previo = vista.querySelector('.pc-body');
      var sc = previo && !cambio ? previo.scrollTop : 0;
      vista.innerHTML = pan ? pan.render(cx) : '';
      cx.raiz = vista;
      var b = vista.querySelector('.pc-body');
      if (b) { b.scrollTop = sc; }
      if (cambio) { var h = vista.querySelector('h1'); if (h) { h.focus({ preventScroll: true }); } }
      if (pan && pan.alMontar) { pan.alMontar(cx); }
    }

    function pintarDispositivo() {
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + M.disp + '"><div class="pp-pantalla">' + estadoBarra() + '<div class="pc-app pc-app--' + M.disp + '"></div></div></div></div>';
      pintarPantalla(false);
      montarAprob();
      escalar();
    }

    // El equipo llena el alto libre: bajo los controles y, con la franja abierta, sobre la franja pegada al fondo.
    function escalar() {
      SPLASH.ver(disp);
      var e = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!e || !m) { return; }
      var abierta = e.classList.contains('pp-escena--capa'), capaEl = e.querySelector('.pp-c');
      var FONDO = 20, SEP = 16, TOPE = 64;
      var franja = abierta && capaEl ? capaEl.offsetHeight + FONDO + SEP : FONDO;
      var k = Math.min((e.clientWidth - 48) / m.offsetWidth, (e.clientHeight - TOPE - franja) / m.offsetHeight);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }

    function toast(t, m) {
      var app = disp.querySelector('.pc-app');
      if (!app) { return; }
      var viejo = app.querySelector(':scope > .pp-toast');
      if (viejo) { viejo.remove(); }
      app.insertAdjacentHTML('beforeend', '<nwt-toast class="pp-toast" visible icon="info" nwt-theme="informative" heading="' + esc(t) + '" message="' + esc(m) + '" data-acc="cerrar-toast"></nwt-toast>');
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { var n = disp.querySelector('.pp-toast'); if (n) { n.remove(); } }, 3200);
    }

    /* ---------- Consultas ---------- */
    // Elige la definición según la consulta; quien llama decide qué hace con el no (bloqueo, error en el campo o vuelta a Titulares).
    function consultar(n, alTerminar, extra) {
      extra = extra || {};
      var miGen = ++gen;
      var def = n === 1 ? def1(st, extra) : n === 2 ? def2(st, extra) : def3(st);
      capa.correrDef(def, { velocidad: M.vel, alCambiar: escalar }, function (r) {
        if (miGen !== gen) { return; }
        r.sujeto = def.sujeto || null; r.cupo = def.cupo || 0;
        if (alTerminar) { alTerminar(r); }
      });
    }

    /* ---------- Compra aprobada: overlay de todo el equipo, 2 s, y pasa solo ---------- */
    // Cuelga de .pp-pantalla (no de .pc-app) para cubrir también la barra de estado; se rehace si cambia el equipo.
    function montarAprob() {
      var pan = disp && disp.querySelector('.pp-pantalla'), app = disp && disp.querySelector('.pc-app');
      if (!aprob || !pan) { return; }
      var v = pan.querySelector('.pc-aprob'); if (v) { v.remove(); }
      pan.insertAdjacentHTML('beforeend', '<div class="pc-aprob pc-aprob--' + M.disp + '" role="status" style="--pc-t:-' + (Date.now() - aprob.ini) + 'ms">' +
        '<svg class="pc-aprob__ic" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" pathLength="1"/><path d="M28 50l14 14 27-30" pathLength="1"/></svg>' +
        '<p class="pc-aprob__t">Compra aprobada</p><p class="pc-aprob__r">' + esc(ingresos(st.cantidad) + ' · Nacional vs. Medellín · ' + dinero(total(st))) + '</p></div>');
      if (app) { app.setAttribute('inert', ''); }
      if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); }
    }
    function cancelarAprob() {
      clearTimeout(timerAprob); timerAprob = null; aprob = null;
      if (!disp) { return; }
      var v = disp.querySelector('.pc-aprob'), app = disp.querySelector('.pc-app');
      if (v) { v.remove(); }
      if (app) { app.removeAttribute('inert'); }
    }
    function aprobar() {
      cancelarAprob();
      aprob = { ini: Date.now() };
      montarAprob();
      timerAprob = setTimeout(function () { ir('listo'); }, 2000);
    }

    /* ---------- Reinicios ---------- */
    function reiniciar(id) {
      cancelarAprob();
      gen++; if (capa) { capa.detener(); }
      var c = casoPorId(id), nuevo = nuevoEstado(c);
      Object.keys(st).forEach(function (k) { delete st[k]; });
      Object.assign(st, nuevo);
      infoCaso();
      pintarPantalla(true);
    }
    // «Volver al evento»: conserva el caso y la persona identificada; suelta la reserva, los titulares y el bloqueo.
    function alEvento() {
      cancelarAprob();
      gen++; if (capa) { capa.detener(); }
      st.bloqueo = null; st.reservaFin = 0; st.consultando = 0; st.pagado = false; st.ingresos = [];
      st.cupos = []; st.yoVoy = st.caso.yoVoy !== false; st.edit = null; st.avisoPago = 0; st.cantidad = st.caso.cantidad || 2;
      st.id = { estado: 'espera', restantes: 3, error: false };
      st.pantalla = 'evento';
      pintarPantalla(true);
    }

    /* ---------- Eventos ---------- */
    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom],[data-caso],[data-vel],[data-grupo]');
      if (!el) { return; }
      if (el.hasAttribute('data-grupo')) { abrirGrupo(el.parentNode, el.getAttribute('aria-expanded') !== 'true'); return; }
      if (el.dataset.zoom) { zoom = el.dataset.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      if (el.dataset.caso) { reiniciar(el.dataset.caso); return; }
      if (el.dataset.vel) {
        M.vel = el.dataset.vel;
        raiz.querySelectorAll('[data-vel]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        return;
      }
      var a = el.dataset.acc;
      if (a === 'salir') { ctxApp.salir(); return; }
      if (a === 'cerrar-toast') { el.remove(); return; }
      if (!disp.contains(el)) { return; }
      if (a === 'cmp-evento') { alEvento(); return; }
      if (a === 'cmp-atras') {
        if (st.consultando) { return; }
        // Salir de Cantidad suelta la reserva; el resto solo retrocede un paso.
        if (st.pantalla === 'cantidad') { alEvento(); return; }
        ir(ATRAS[st.pantalla] || 'evento'); return;
      }
      if (a === 'cmp-portal') { toast('Portal de la persona', 'Aún fuera del flujo de la demo. Ya está modelado en modeling/desing-views.'); return; }
      var pan = pantallaActual();
      if (pan && pan.onClick) { pan.onClick(el, ev, cx); }
    }
    function onInput(ev) {
      if (!disp.contains(ev.target)) { return; }
      var pan = pantallaActual();
      if (pan && pan.onInput) { pan.onInput(ev, cx); }
    }

    cx.D = ctxApp.D;

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' + velocidadControl() +
        '<div class="pp-zoom"><nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button></div></div>' +
        '<div class="pp-dispositivo" id="dispositivo"></div>' + window.CAPA.htmlDef() + '</div></main></div></div>';
    SPLASH.app('compra', 'grader');
    disp = raiz.querySelector('#dispositivo');
    capa = window.CAPA.crear(raiz.querySelector('.pp-escena'));

    // El reloj de la reserva solo cambia el texto; al vencer, la compra vuelve al evento.
    timerReloj = setInterval(function () {
      if (!st.reservaFin) { return; }
      disp.querySelectorAll('[data-reloj]').forEach(function (n) { n.textContent = relojTexto(st); });
      if (Date.now() >= st.reservaFin && CON_RELOJ[st.pantalla] && !st.pagado && !st.bloqueo && !st.consultando) {
        alEvento(); toast('La reserva venció', 'Los ingresos volvieron a la venta. Elige de nuevo.');
      }
    }, 1000);

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('input', onInput);
    window.addEventListener('resize', escalar);
    infoCaso();
    pintarDispositivo();
    requestAnimationFrame(escalar);

    return function () {
      gen++; if (capa) { capa.detener(); }
      clearTimeout(timerToast); clearInterval(timerReloj); clearTimeout(timerAprob);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('input', onInput);
      window.removeEventListener('resize', escalar);
    };
  };
})();
