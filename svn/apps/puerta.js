/* Superficie 5 · Acceso en puerta: app del operador y vista de seguridad. Modelo en modeling/desing-views/05-acceso-puerta.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  var TIPOS = ['CC', 'CE', 'TI', 'PPT', 'PEP', 'Pasaporte', 'RUMV'];
  // Mínimo y máximo de dígitos al digitar un documento.
  var MIN_DOC = 5, MAX_DOC = 12;

  var U = window.SVN_UTIL;
  // Alertas que nacen de lecturas del bus: guardadas aquí sobreviven al cambio de ruta con su asignación y su estado.
  var DEL_BUS = {};
  var RE_LLAMO = /llamó a la autoridad/;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hora(min) { var h = 18 + Math.floor(min / 60), m = min % 60; return h + ':' + (m < 10 ? '0' : '') + m; }

  function montar(raiz, ctx, modo) {
    var D = ctx.D, E = D.evento;
    var NUM = parseInt((/Puerta (\d+)/.exec(E.puerta) || [0, 4])[1], 10), IDX = NUM - 1;
    // Turno y alertas parten de los datos base y suman lo que el bus lleva de esta puerta, para que sobrevivan al cambio de ruta.
    function lecturasBus() {
      return U.leer(function (x) { return x.evento === U.EVENTO && x.origen === 0 && +x.puerta === NUM && ({ verde: 1, amarillo: 1, medida: 1, operativo: 1 })[x.tipo] && !RE_LLAMO.test(x.detalle); });
    }
    function desdeBus() {
      var ls = lecturasBus(), t = JSON.parse(JSON.stringify(D.turno));
      ls.forEach(function (x) { if (x.tipo === 'verde' || x.tipo === 'amarillo') { t.ingresos++; } else { t.rojos++; } });
      return { turno: t, historial: ls.slice().reverse().map(function (x) { return { color: x.tipo === 'verde' || x.tipo === 'amarillo' ? 'verde' : 'rojo', texto: x.detalle, hora: x.horaEscena, lectura: true }; }).concat(D.historial) };
    }
    function extraPuerta() {
      var ls = lecturasBus(), n = { ing: 0, rojos: 0, avisos: 0 };
      ls.forEach(function (x) { if (x.tipo === 'verde' || x.tipo === 'amarillo') { n.ing++; } else { n.rojos++; } if (x.tipo === 'amarillo') { n.avisos++; } });
      return n;
    }
    function nombrePuerta(n) { var p = D.policia.tablero.puertas[(+n || 1) - 1]; return p ? p.nombre : E.puerta; }
    function causaDe(d) { return String(d || '').split(' · ')[0] || 'Llamado del operador'; }
    function alertasBus() {
      var out = [];
      U.leer(function (x) { return x.evento === U.EVENTO && x.origen === 0 && (x.tipo === 'medida' || (x.tipo === 'operativo' && RE_LLAMO.test(x.detalle))); }).forEach(function (x) {
        var id = 'b' + x.ts, a = DEL_BUS[id], k = U.deClave(x.clave), r = U.res(k.tipo, k.num, 'pmu'), med = x.tipo === 'medida';
        if (!a) {
          a = DEL_BUS[id] = { id: id, estado: 'nueva', puerta: nombrePuerta(x.puerta), hora: x.horaEscena, clave: x.clave, doc: r ? r.docVisible : k.tipo + ' •••• ' + k.num.slice(-4),
            causa: med ? 'Medida vigente' : causaDe(x.detalle), origen: med ? 'Lectura en puerta' : 'Llamado del operador',
            pasos: [{ hora: x.horaEscena, texto: med ? 'Generada en la puerta' : 'El operador llamó a la autoridad', quien: x.quien || 'Op. L. Mejía' }] };
        }
        out.push(a);
      });
      return out;
    }
    // Lecturas verdes con aviso: el PMU las ve como avisos silenciosos junto a los del guion.
    function avisosBus() {
      return lecturasBus().filter(function (x) { return x.tipo === 'amarillo'; }).reverse().map(function (x) {
        var k = U.deClave(x.clave), r = U.res(k.tipo, k.num, 'pmu'), et = (/aviso al PMU · (.*)$/.exec(x.detalle) || [])[1] || 'Aviso';
        return { id: 'v' + x.ts, tipo: /levantada/.test(et) ? 'veto' : /cumplida/.test(et) ? 'cumplida' : 'riesgo', etiqueta: et, puerta: nombrePuerta(x.puerta), hora: x.horaEscena,
          doc: r ? r.docVisible : k.tipo + ' •••• ' + k.num.slice(-4), causa: 'Entró con aviso', detalle: x.detalle.split(' · aviso')[0], quien: x.quien };
      });
    }
    var inicial = desdeBus();
    var st = {
      disp: modo === 'policia' ? 'tablet' : 'celular',
      offline: false, torn: true,
      // Huella: modo del evento, lector, contingencia del supervisor y lectura en curso (`hu`).
      huella: (D.evento.huella || {}).modo || 'apagada', lector: true, lectorAuto: false, contingencia: false, hu: null, motivo: null, motivoNota: '',
      vista: 'lectura', caso: null,
      apoyo: false, policia: false, luz: false, zoomCam: false, hoja: null, hojaError: false, digitos: '', tipo: 'CC',
      reloj: 40, pendientes: 0,
      turno: inicial.turno,
      historial: inicial.historial,
      alerta: 'nueva', cierre: null, toast: null,
      // Autoridad: primero el tablero del evento, después el perfil de la alerta que se abre.
      pvista: 'eventos', efiltro: 'vivo', ebusca: '', filtro: 'todas', filtroAbierto: false, expandido: false, verTodas: false, foco: null, abierta: null, min: 43, modal: null, tomaPrimero: false,
      alertas: JSON.parse(JSON.stringify(D.policia.tablero.alertas)).concat(alertasBus())
    };
    var CASOS = D.casos.slice();
    var temporizadores = [];
    function luego(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }
    var capa = null;
    function cancelar() { temporizadores.forEach(clearTimeout); temporizadores = []; if (capa) { capa.detener(); } }

    /* ---------- Guion (fuera del producto) ---------- */

    // Tema e icono por caso, para que el panel hable el mismo semáforo que la app.
    var ASPECTO = {
      verde: { tema: 'positive', icono: 'positive' },
      rojo: { tema: 'negative', icono: 'negative' }
    };

    function toolbar() {
      var titulo = modo === 'policia' ? 'Vista de seguridad' : 'Acceso en puerta';
      var sub = modo === 'policia' ? 'Autoridad de seguridad · ' + E.escenario : 'Operador de puerta · ' + E.puerta;
      return window.SVN_TOOLBAR({ marca: modo === 'policia' ? window.NAOWEE.entidades : window.NAOWEE.deporteSvn, titulo: titulo, subtitulo: sub, acciones: [{ texto: 'Cambiar de perfil', acc: 'salir' }] });
    }

    function tarjeta(titulo, cuerpo) {
      return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>';
    }

    // Grupos de la card «Leer una persona»: verdes primero, rojos después (DC-067).
    var GRUPOS = [
      ['Entra', ['verde', 'solocc']],
      ['No entra en la puerta', ['sin', 'usada', 'puerta', 'prestada']],
      ['No entra por medida', ['medida']],
      ['Con huella', ['huella-ok', 'huella-excepcion', 'huella-sinref', 'huella-lector', 'huella-no', 'huella-sinderecho', 'huella-medida']]
    ];
    var MODOS = { apagada: 'Apagada', opcional: 'Opcional', obligatoria: 'Obligatoria' };
    var AYUDA_MODO = {
      apagada: 'Sin cambios: documento y foto impresa.',
      opcional: 'Solo si el operador duda: «No es la persona» abre la lectura.',
      obligatoria: 'Tras el documento se pide la huella. La enciende Mindeporte con la norma que la habilita.'
    };
    var casoActivo = null;
    function itemCaso(c) {
      var a = ASPECTO[c.punto];
      return '<nwt-detail-item actionable nwt-theme="' + a.tema + '" data-caso="' + c.id + '"' + (c.id === casoActivo ? ' class="pp-caso--activo"' : '') + (c.que ? ' title="' + esc(c.que) + '"' : '') + '>' + esc(c.etiqueta) + '<span class="pp-caso__punto pp-caso__punto--' + c.punto + '" aria-hidden="true"></span></nwt-detail-item>';
    }
    function casosAgrupados() {
      var usados = [];
      var gs = GRUPOS.map(function (g) { usados = usados.concat(g[1]); return [g[0], CASOS.filter(function (c) { return g[1].indexOf(c.id) >= 0; })]; });
      var otros = CASOS.filter(function (c) { return usados.indexOf(c.id) < 0; });
      if (otros.length) { gs.push(['Otros', otros]); }
      gs = gs.filter(function (g) { return g[1].length; });
      return gs.map(function (g, k) {
        var ab = casoActivo ? g[1].some(function (c) { return c.id === casoActivo; }) : k === 0;
        return '<section class="pp-grupo' + (ab ? ' pp-grupo--abierto' : '') + '"><button type="button" class="pp-grupo__cab" data-grupo aria-expanded="' + ab + '">' +
          '<span class="pp-grupo__t">' + g[0] + '</span><span class="pp-grupo__n">' + g[1].length + '</span>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="pp-grupo__lista"' + (ab ? '' : ' hidden') + '>' + g[1].map(itemCaso).join('') + '</div></section>';
      }).join('');
    }
    // Acordeón exclusivo: al abrir un grupo se cierran los demás.
    function abrirGrupo(sec, ab) {
      if (ab) { sec.parentNode.querySelectorAll('.pp-grupo--abierto').forEach(function (o) { if (o !== sec) { abrirGrupo(o, false); } }); }
      sec.classList.toggle('pp-grupo--abierto', ab);
      sec.querySelector('[data-grupo]').setAttribute('aria-expanded', String(ab));
      sec.querySelector('.pp-grupo__lista').hidden = !ab;
    }

    // Qué muestra cada caso y qué resultado produce; `que` y `dato` del caso, si existen, mandan.
    var INFO_CASO = {
      verde: ['Un documento con derecho de ingreso vigente, leído por escáner.', 'Verde: la puerta se abre y el ingreso queda registrado.'],
      solocc: ['El mismo derecho de ingreso, pero con la cédula digitada a mano y sin boleta.', 'Verde: entra, y el registro queda marcado como documento digitado.'],
      medida: ['Un documento con una medida correctiva vigente.', 'Rojo: no entra, se oculta el motivo al operador y se alerta al PMU.'],
      sin: ['Un documento sin ingreso comprado para este partido.', 'Rojo: no entra; el operador ve solo la causa operativa.'],
      usada: ['Un documento cuyo ingreso ya se usó en esta puerta o en otra.', 'Rojo: no entra de nuevo; queda constancia del primer ingreso.'],
      puerta: ['Un documento con derecho de ingreso, pero asignado a otra puerta.', 'Rojo: no entra por esta puerta; se indica a cuál dirigirse.'],
      prestada: ['Una persona presenta un documento que parece no ser suyo.', 'Rojo: no entra y se avisa a la autoridad de seguridad.'],
      'huella-ok': ['Documento con derecho de ingreso y lector de huella en uso.', 'Verde: la huella coincide y entra como identidad verificada.'],
      'huella-excepcion': ['Una persona que no puede dar huella por lesión o discapacidad.', 'Verde con excepción: tras tres lecturas ilegibles, entra sin huella con motivo registrado.'],
      'huella-sinref': ['Un documento que no tiene huella de referencia.', 'Verde: no hay lectura posible y entra por el documento.'],
      'huella-lector': ['El lector de huella está sin servicio.', 'Verde: entra sin huella hasta que el supervisor active la contingencia.'],
      'huella-no': ['Tiene derecho de ingreso, pero la huella no coincide con el documento.', 'Rojo: tras tres lecturas legibles no entra y se alerta.'],
      'huella-sinderecho': ['La huella coincide, pero el documento no tiene derecho de ingreso.', 'Rojo: no entra; la huella no sustituye el derecho de ingreso.'],
      'huella-medida': ['La huella coincide, pero hay una medida vigente.', 'Rojo: no entra y se alerta al PMU.']
    };
    function htmlInfoCaso() {
      var c = casoActivo && CASOS.filter(function (x) { return x.id === casoActivo; })[0];
      if (!c) { return '<p class="pp-caso-info__n">Elija un caso de la lista para ver qué muestra y qué resultado produce.</p>'; }
      var i = INFO_CASO[c.id] || [c.que || c.etiqueta, c.causa || ''];
      return '<p class="pp-caso-info__t">' + esc(c.etiqueta) + '</p><p>' + esc(c.que || i[0]) + '</p>' +
        '<p><b>Resultado:</b> ' + esc(i[1]) + '</p>' + (c.dato ? '<p class="pp-caso-info__n">' + esc(c.dato) + '.</p>' : '');
    }

    // El caso activo abre su grupo solo, también el que llega digitando el documento.
    function activarEnPanel(id) {
      casoActivo = id;
      var inf = raiz.querySelector('#pp-caso-info'); if (inf) { inf.innerHTML = htmlInfoCaso(); }
      raiz.querySelectorAll('#pp-casos nwt-detail-item[data-caso]').forEach(function (n) {
        var on = n.dataset.caso === id; n.classList.toggle('pp-caso--activo', on);
        if (on) { abrirGrupo(n.closest('.pp-grupo'), true); }
      });
    }

    function guion() {
      var casos = modo === 'policia'
        ? '<nwt-detail-item actionable icon="filter" nwt-theme="informative" data-acc="elegir-evento">Elegir el evento en vivo</nwt-detail-item>' +
          '<nwt-detail-item actionable icon="notification" nwt-theme="negative" data-acc="nueva-alerta">Recibir una alerta roja</nwt-detail-item>' +
          '<nwt-detail-item actionable icon="user" nwt-theme="informative" data-acc="agente-primero">Un agente la toma antes de asignarla</nwt-detail-item>'
        : casosAgrupados();
      return '<aside class="pp-panel" aria-label="Controles del demo">' + '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Dispositivo', '<nwt-tabs id="tabs-disp" full-width></nwt-tabs>') +
        tarjeta(modo === 'policia' ? 'Alertas' : 'Leer una persona', '<div class="pp-panel__lista' + (modo === 'policia' ? '' : ' pp-casos') + '"' + (modo === 'policia' ? '' : ' id="pp-casos"') + '>' + casos + '</div>') +
        (modo === 'policia' ? '' : tarjeta('Este caso', '<div id="pp-caso-info" class="pp-caso-info">' + htmlInfoCaso() + '</div>')) +
        '</aside>';
    }

    function zoomControles() {
      return '<div class="pp-zoom">' +
        '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
      '</div>';
    }

    function velocidadControl() {
      return '<div class="pp-velocidad">' +
        '<div class="pp-velocidad__g" role="group" aria-label="Velocidad de validación" id="velocidad-ctrl">' +
          '<button type="button" class="pp-velocidad__b" data-vel="slow" aria-pressed="false">Slow motion</button>' +
          '<button type="button" class="pp-velocidad__b" data-vel="normal" aria-pressed="true">Tiempo real</button>' +
        '</div>' +
      '</div>';
    }

    function chipConexion() { return '<span class="pp-conexion' + (st.offline ? ' pp-conexion--off' : '') + '">' + (st.offline ? 'Sin conexión' : 'En línea') + '</span>'; }

    // Cromo del sistema operativo: barra de estado y fila de marca, como la app del conductor de uaesp.
    function cromo() {
      // Sin barra de estado mientras hay validación o resultado (DC-332).
      if (st.disp === 'consola' || st.vista !== 'lectura') { return ''; }
      var estado = '<div class="pp-estado" aria-hidden="true"><span>' + hora(st.reloj) + '</span>' +
        '<span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>';
      // En tablet el logo va en la barra de la puerta (una sola línea); la fila de marca es solo del celular.
      if (st.disp === 'tablet') { return estado; }
      return estado +
        '<div class="pp-marca"><div class="pp-marca__izq">' + window.NAOWEE.entidades + '</div>' +
        '<div class="pp-marca__acciones">' + chipConexion() + '<span class="pp-marca__sep" aria-hidden="true"></span>' +
        '<button type="button" class="pp-menu" aria-label="Menú" data-acc="menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg></button></div></div>';
    }

    /* ---------- Piezas de la app ---------- */

    // Cuenta regresiva al inicio del partido: parte de 20 min y baja cada segundo; cada lectura del demo resta un minuto.
    var desde = Date.now();
    function faltan() {
      var s = 20 * 60 - (st.reloj - 40) * 60 - Math.floor((Date.now() - desde) / 1000);
      if (s <= 0) { return '00:00'; }
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }
    var timerCuenta = setInterval(function () {
      disp && disp.querySelectorAll('[data-cuenta]').forEach(function (e) { e.textContent = faltan(); });
      disp && disp.querySelectorAll('[data-cron]:not([data-tfin])').forEach(function (e) {
        var pt = partesCrono(Date.now() - (+e.dataset.t0));
        e.firstChild.textContent = pt[0]; e.lastChild.textContent = ':' + pt[1];
      });
    }, 1000);

    function barra() {
      // Con validación o resultado en pantalla no va la barra de la puerta (DC-333).
      if (st.vista !== 'lectura') { return ''; }
      var partes = E.partido.split(/\svs\.?\s/);
      var logoNaowee = '<span class="pp-marca__naowee">' + window.NAOWEE.logo + '</span>';
      // El visitante lleva el escudo a la derecha del nombre (DC-128).
      var equipo = function (nom, texto, visita) { var img = '<img class="pp-escudo" src="assets/escudos/' + nom + '.webp" alt="Escudo">'; return '<span class="pp-equipo-nom' + (visita ? ' pp-equipo-nom--visita' : '') + '">' + (visita ? esc(texto) + img : img + esc(texto)) + '</span>'; };
      // Cada pieza del partido va en su propio span sin corte: si no, el texto se parte entre los escudos.
      return '<header class="pp-barra">' +
        '<div class="pp-barra__marca">' + (st.disp === 'tablet' || st.disp === 'consola' ? logoNaowee : '') + '</div>' +
        '<div class="pp-barra__lugar"><div class="pp-barra__fila"><p class="pp-barra__puerta">' + esc(E.puerta) + '</p></div>' +
        '<p class="pp-barra__partido">' + equipo('nacional', partes[0]) + '<span class="pp-vs">vs</span>' + equipo('medellin', partes[1], true) + '<span class="pp-tiempo"><span class="pp-hora">' + esc(E.hora) + '</span><span class="pp-faltan">Inicia en <b data-cuenta>' + faltan() + '</b></span></span></p></div>' +
        (st.disp === 'celular' ? '' : chipConexion()) +
      '</header>' +
      (st.offline ? '<div class="pp-aviso" role="status"><nwt-icon value="refresh"></nwt-icon>Validando con el paquete del evento · actualizado 17:05 · ' + st.pendientes + ' por sincronizar</div>' : '');
    }

    // Icon button sobre la cámara: solo ícono de 16 px, 44 px de objetivo; activo en naranja (DC-191).
    function tagCamara(acc, icono, texto, activo) {
      return '<button type="button" class="pp-camara__ib" data-acc="' + acc + '" aria-pressed="' + activo + '" aria-label="' + texto + '" title="' + texto + '"><nwt-icon value="' + icono + '"></nwt-icon></button>';
    }
    // Estado de un equipo: solo la palabra; el punto lleva el estado y `estadoEquipos` lo mantiene en vivo (DC-192).
    var ESTADOS = {
      red: { nombre: 'Conexión', ok: 'en línea', off: 'sin conexión' },
      torn: { nombre: 'Torniquete', ok: 'conectado', off: 'sin conexión', ocupado: 'respondiendo', apagado: 'apagado' },
      huella: { nombre: 'Lector', ok: 'listo', off: 'sin conexión', ocupado: 'leyendo', falla: 'sin servicio', apagado: 'apagado' }
    };
    function puntoDe(clave) {
      if (clave === 'red') { return st.offline ? 'alerta' : 'ok'; }
      if (clave === 'huella') { return st.huella === 'apagada' ? 'apagado' : !st.lector ? 'falla' : st.offline ? 'off' : st.vista === 'huella' && st.hu && st.hu.est === 'leyendo' ? 'ocupado' : 'ok'; }
      // Precedencia: apagado > sin conexión > respondiendo > conectado.
      return !st.torn ? 'apagado' : st.offline ? 'off' : st.vista === 'validando' ? 'ocupado' : 'ok';
    }
    // Un equipo apagado o sin conexión se opaca solo en su chip; el aria-label sigue diciendo el estado.
    var APAGADOS = ['apagado', 'off'];
    function estadoCamara(clave) {
      var punto = puntoDe(clave), e = ESTADOS[clave], det = e.nombre + ': ' + e[punto];
      return '<span class="pp-camara__tag pp-camara__tag--estado' + (APAGADOS.indexOf(punto) >= 0 ? ' pp-camara__tag--apagado' : '') + '" data-equipo="' + clave + '" role="status" aria-label="' + det + '" title="' + det + '"><i class="pp-camara__punto pp-camara__punto--' + punto + '"></i>' + e.nombre + '</span>';
    }
    function lectorFijo(texto) { return '<span class="pp-camara__tag pp-camara__tag--estado"><i class="pp-camara__punto pp-camara__punto--ok"></i>' + texto + '</span>'; }
    // Cambia solo el punto y el nombre accesible: sin repintar el equipo no se reinicia láser ni validación.
    function estadoEquipos() {
      disp.querySelectorAll('[data-equipo]').forEach(function (t) {
        var clave = t.dataset.equipo, punto = puntoDe(clave), e = ESTADOS[clave], det = e.nombre + ': ' + e[punto];
        t.querySelector('.pp-camara__punto').className = 'pp-camara__punto pp-camara__punto--' + punto;
        t.setAttribute('aria-label', det); t.title = det;
        t.classList.toggle('pp-camara__tag--apagado', APAGADOS.indexOf(punto) >= 0);
      });
    }

    function camara() {
      return '<div class="pp-camara' + (st.luz ? ' pp-camara--luz' : '') + (st.zoomCam ? ' pp-camara--zoom' : '') + '" aria-label="Cámara leyendo">' +
        '<div class="pp-camara__herr">' +
          '<div class="pp-camara__estado">' + estadoCamara('torn') + estadoCamara('huella') + '</div>' +
          '<div class="pp-camara__botones">' + tagCamara('linterna', 'sun', 'Linterna', st.luz) + tagCamara('zoom', 'zoom-in', 'Zoom 2×', st.zoomCam) + '</div>' +
        '</div>' +
        '<div class="pp-camara__guia"><span class="pp-esquina pp-esquina--1"></span><span class="pp-esquina pp-esquina--2"></span><span class="pp-esquina pp-esquina--3"></span><span class="pp-esquina pp-esquina--4"></span><span class="pp-camara__laser"></span></div>' +
        '<p class="pp-camara__ayuda">Escanee el documento</p>' +
      '</div>';
    }

    function acciones() {
      return '<div class="pp-acciones">' +
        '<nwt-button class="pp-grande" nwt-variant="quiet" icon="edit" data-acc="digitar">Digitar documento</nwt-button>' +
        (st.disp === 'celular' ? '<nwt-icon-button nwt-variant="quiet" icon="history" label="Mi turno" data-acc="turno"></nwt-icon-button>' : '') +
      '</div>';
    }

    function turno() {
      var t = st.turno;
      return '<div class="pp-turno"><p class="pp-turno__h">Mi turno</p>' +
        '<div class="pp-turno__stats">' +
          '<div class="pp-stat"><p class="pp-stat__v">' + t.ingresos + '</p><p class="pp-stat__l">Ingresos</p></div>' +
          '<div class="pp-stat"><p class="pp-stat__v">' + t.rojos + '</p><p class="pp-stat__l">Rojos</p></div>' +
        '</div>' +
        '<p class="pp-turno__sub">Últimas lecturas</p>' +
        '<ul class="pp-historial">' + st.historial.filter(function (h) { return h.lectura; }).slice(0, 5).map(function (h) {
          return '<li><span class="pp-caso__punto pp-caso__punto--' + h.color + '"></span><span>' + esc(h.texto) + '</span><time>' + h.hora + '</time></li>';
        }).join('') + '</ul></div>';
    }

    function icono(v) { return '<div class="pp-resultado__icono" aria-hidden="true"><nwt-icon value="' + v + '"></nwt-icon></div>'; }

    /* ---------- Semáforo del equipo (canvas): palabra, rótulo, documento sobre el color, notas, acciones ---------- */

    var SVG = function (d, t) { return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none">' + d + '</svg>'; };
    var I = {
      pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
      doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/>',
      aviso: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
      escudo: '<path d="M12 3l7.5 3v6c0 4.4-3.1 7.7-7.5 9-4.4-1.3-7.5-4.6-7.5-9V6z"/>',
      flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
      candado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
      refresh: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
      persona: '<circle cx="12" cy="9" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>',
      x: '<path d="M6 6l12 12M18 6L6 18"/>',
      huella: '<path d="M6 11a6 6 0 0 1 12 0v2M9 20c.5-1.5.8-3 .8-5a2.2 2.2 0 0 1 4.4 0c0 3-.7 5-1.7 6.5M5 15c.4-2 .4-3 .2-4M18 15c0 2-.3 3.500-1 5M12 11v4"/>'
    };
    var SILUETA = '<svg viewBox="0 0 56 64" width="80%" height="80%" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="28" cy="24" r="11"/><path d="M6 64c2-14 11-20 22-20s20 6 22 20"/></svg>';

    // La foto viene del caso (`c.foto`); sin foto en el caso, la silueta. `sin` fuerza el estado "Sin foto".
    function foto(sin, url) {
      return sin
        ? '<div class="pp-r__foto pp-r__foto--sin">' + SVG('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 15h5"/>', 22) + 'Sin foto</div>'
        : url ? '<div class="pp-r__foto pp-r__foto--img"><img src="' + esc(url) + '" alt="Foto del documento"></div>'
        : '<div class="pp-r__foto">' + SILUETA + '</div>';
    }

    // Mismo lugar y tamaño en todos los estados. El rojo por medida no lleva nombre (supuesto del modelo).
    function documento(c) {
      return '<section class="pp-r__doc" aria-label="' + (c.digitado ? 'Documento digitado' : 'Documento escaneado') + '">' + foto(c.sinFoto, c.foto) +
        '<div class="pp-r__datos"><span class="pp-r__tipo">' + (c.digitado ? 'Documento digitado' : 'Documento escaneado') + '</span>' +
        '<span class="pp-r__nombre">' + esc(c.nombre || 'La autoridad reserva el nombre') + '</span><span class="pp-r__num">' + esc(c.doc) + '</span></div></section>';
    }

    function nota(icono, texto, fuerte) { return '<p class="pp-r__nota' + (fuerte ? ' pp-r__nota--fuerte' : '') + '">' + (icono ? SVG(I[icono], 16) : '') + '<span class="pp-r__nota-linea" title="' + esc(texto) + '">' + esc(texto) + '</span></p>'; }
    function notaHtml(icono, html) { return '<p class="pp-r__nota">' + SVG(I[icono], 16) + html + '</p>'; }
    function boton(acc, texto, o) {
      o = o || {};
      var atajo = o.atajo && st.disp === 'consola' ? '<kbd>' + o.atajo + '</kbd>' : '';
      var fin = o.flecha && st.disp !== 'consola' ? SVG(I.flecha, 20) : '';
      return '<button type="button" class="pp-r__btn' + (o.sec ? ' pp-r__btn--sec' : '') + '" data-acc="' + acc + '"' + (o.off ? ' disabled aria-disabled="true"' : '') + '>' + atajo + esc(texto) + (o.check ? SVG('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18) : '') + fin + '</button>';
    }

    function pantalla(tono, palabra, rotulo, dato, doc, notas, acciones) {
      return '<section class="pp-r pp-r--' + tono + (st.disp === 'celular' ? '' : ' pp-r--cols') + '" role="alert"><div class="pp-r__top">' +
        '<h1 class="pp-r__palabra">' + palabra + '</h1>' +
        '<div class="pp-r__rotulo"><div class="pp-r__rotulo-l">' + SVG(I[rotulo[0]], 18) + '<span>' + esc(rotulo[1]) + '</span></div><p class="pp-r__dato">' + esc(dato) + '</p></div>' +
        doc + (notas ? '<div class="pp-r__notas">' + notas + '</div>' : '') + '</div>' +
        '<div class="pp-r__acciones">' + acciones + '</div>' +
        '<div class="pp-r__lector">' + SVG('<path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M7 12h10"/>', 20) + 'Lector activo · la siguiente lectura reemplaza esta pantalla</div></section>';
    }

    function validando() {
      // Mismo orden del splash: Deporte arriba, IVC al centro, el loader del código y el texto debajo (DC-375).
      return '<section class="pp-r pp-r--cargando" role="status"><div class="pp-r__centro">' +
        '<div class="pp-r__cabeza">' + window.NAOWEE.mindeporteSolo(56) + '</div>' +
        '<div class="pp-r__nucleo">' + window.NAOWEE.chipIvc(32) + SPLASH.codigo() +
        '<p class="pp-r__texto" aria-live="polite">' + (st.offline ? 'Validando con el paquete del evento…' : 'Consultando la base nacional…') + '</p></div></div>' +
        '<div class="pp-r__acciones">' + boton('cancelar-scan', 'Cancelar escaneo', { sec: true }) + '</div></section>';
    }

    // Lectura de huella transitoria: no es un color, la lectura es simulada y el resultado lo fija el caso elegido.
    function huellaVista() {
      var h = st.hu, n = h.n;
      var cab = {
        leyendo: ['Ponga el dedo en el lector', 'Lectura simulada · intento ' + n + ' de 3'],
        nocoincide: ['No coincide', 'Intento ' + n + ' de 3 · pruebe con otro dedo'],
        ilegible: ['Lectura ilegible', 'Limpie el lector o el dedo · intento ' + n + ' de 3 · no cuenta como no coincide'],
        sinlector: ['Lector de huella sin servicio', 'No se registra ningún ingreso hasta que el supervisor active la contingencia']
      }[h.est];
      var otra = (h.est === 'nocoincide' || h.est === 'ilegible') && n < 3;
      var acc = h.est === 'sinlector'
        ? boton('contingencia', 'Activar contingencia (supervisor)') + boton('cancelar-huella', 'Cancelar', { sec: true })
        : (otra ? boton('leer-otra', 'Leer otra vez') : '') + boton('sin-huella', 'No puede dar huella', { sec: h.est === 'leyendo' || otra });
      return '<section class="pp-r pp-r--huella" role="status" aria-live="polite"><div class="pp-r__centro">' +
        '<div class="pp-r__huella' + (h.est === 'leyendo' ? ' pp-r__huella--lee' : '') + '" aria-hidden="true">' + SVG(I.huella, 72) + '</div>' +
        '<p class="pp-r__texto">' + esc(cab[0]) + '</p><p class="pp-r__sub">' + esc(cab[1]) + '</p></div>' +
        '<div class="pp-r__acciones">' + acc + '</div></section>';
    }

    function resultado() {
      var c = st.caso, hh = hora(st.reloj);
      if (st.vista === 'validando') { return validando(); }
      if (st.vista === 'huella') { return huellaVista(); }
      if (c.color === 'verde') {
        // Con huella que coincide, la identidad ya está verificada; en cualquier otro verde el operador compara la foto impresa.
        var ver = !!c.verificado;
        var tag = ver ? '<span class="pp-r__bio pp-r__bio--ok">' + SVG(I.huella, 18) + 'Huella coincide' + SVG('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 16) + '</span>' : '';
        return pantalla('verde', 'ENTRA', ver ? ['escudo', 'Identidad verificada'] : ['pin', 'Ubicación'], c.detalle, documento(c),
          tag + (c.notaHuella ? nota('aviso', c.notaHuella) : '') + (c.notaLector ? nota('aviso', c.notaLector) : '') +
          (ver ? '' : nota('persona', 'Compare la foto del documento con la persona', true)) +
          (st.offline && !c.sinRed ? nota('refresh', 'Sin conexión · se sincroniza al volver') : ''),
          boton('continuar', 'Registrar ingreso', { atajo: c.exc ? null : 'Enter', flecha: true }) +
          (ver ? '' : boton('no-persona', 'No es la persona', { sec: true })));
      }
      if (c.color === 'rojo' && c.operativo) {
        return pantalla('rojo', 'NO ENTRA', [c.sinPolicia ? 'pin' : 'doc', c.dato ? c.causa : 'Causa'], c.dato || c.causa, documento(c), '',
          boton('cerrar-rojo', 'Siguiente', { atajo: 'Enter', flecha: true }) +
          (c.sinPolicia ? '' : st.policia ? boton('policia', 'Autoridad avisada', { sec: true, off: true, check: true }) : boton('policia', 'Llamar a la autoridad', { sec: true, atajo: 'P' })));
      }
      return pantalla('rojo', 'NO ENTRA', ['escudo', 'Medida vigente'], 'Remitir a la autoridad', documento(c),
        nota(null, st.offline ? 'Alerta en cola · sale al volver la red' : 'Alerta al PMU · ' + hh + ' · ' + E.puerta.split(' · ')[0]) + nota(null, 'Nadie en la puerta puede autorizarlo'),
        boton('cerrar-rojo', 'Remitir y siguiente', { atajo: 'Enter', flecha: true }) +
        (st.apoyo ? boton('apoyo', 'Apoyo solicitado', { sec: true, off: true, check: true }) : boton('apoyo', 'Reportar alteración', { sec: true })));
    }

    // Solo presentación: bloques de 3 para leer el número; st.digitos queda sin espacios.
    // Miles desde la derecha: el grupo corto queda a la izquierda (DC-195).
    function grupos(d) { return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

    function hoja() {
      if (!st.hoja) { return ''; }
      if (st.hoja === 'turno' || st.hoja === 'menu') {
        var tit = 'Mi turno';
        return '<div class="pp-velo" data-acc="cerrar-hoja"></div><div class="pp-hoja" role="dialog" aria-label="' + tit + '"><div class="pp-hoja__cab"><span>' + tit + '</span><nwt-icon-button nwt-variant="mute" nwt-size="small" icon="close" label="Cerrar" data-acc="cerrar-hoja"></nwt-icon-button></div>' + turno() + '</div>';
      }
      if (st.hoja === 'verificar-huella') {
        var lee = st.lector && !st.offline;
        return hojaMarco('Verificar con huella',
          '<p class="pp-hoja__txt">' + (lee ? 'Si la foto del documento no coincide con la persona, la huella aclara la duda. Lectura simulada: el resultado lo fija el caso elegido.' : st.offline ? 'Sin conexión la huella no se verifica. La revisión sigue con el documento.' : 'El lector está sin servicio. La revisión sigue con el documento.') + '</p>' +
          '<div class="pp-hoja__acciones"><button type="button" class="pp-hoja__btn" data-acc="leer-huella"' + (lee ? '' : ' disabled aria-disabled="true"') + '>Leer huella</button>' +
          '<button type="button" class="pp-hoja__btn pp-hoja__btn--sec" data-acc="no-entra">No entra sin verificar</button></div>');
      }
      if (st.hoja === 'sin-huella') {
        var otro = st.motivo === MOTIVOS[2], listo = !!st.motivo && (!otro || st.motivoNota.trim().length >= 3);
        return hojaMarco('Ingreso sin huella',
          '<p class="pp-hoja__txt">Elija el motivo. Después compare la foto del documento con la persona.</p>' +
          '<div class="pp-tipos" role="radiogroup" aria-label="Motivo">' + MOTIVOS.map(function (m) { return '<button type="button" class="pp-tipo" role="radio" aria-checked="' + (st.motivo === m) + '" data-motivo="' + m + '">' + m + '</button>'; }).join('') + '</div>' +
          (otro ? '<input class="pp-hoja__campo" id="motivo-nota" autocomplete="off" maxlength="60" aria-label="Anote el motivo" placeholder="Anote el motivo" value="' + esc(st.motivoNota) + '">' : '') +
          '<div class="pp-hoja__acciones"><button type="button" class="pp-hoja__btn" data-acc="confirmar-sin-huella"' + (listo ? '' : ' disabled aria-disabled="true"') + '>Continuar</button>' +
          '<button type="button" class="pp-hoja__btn pp-hoja__btn--sec" data-acc="cerrar-hoja">Volver</button></div>');
      }
      var teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'ok'];
      var est = estadoHoja();
      return '<div class="pp-velo" data-acc="cerrar-hoja"></div><div class="pp-hoja" role="dialog" aria-label="Digitar documento">' +
        '<div class="pp-hoja__cab"><span>Digitar documento</span><nwt-icon-button nwt-variant="mute" nwt-size="small" icon="close" label="Cerrar" data-acc="cerrar-hoja"></nwt-icon-button></div>' +
        '<div class="pp-tipos" role="radiogroup" aria-label="Tipo de documento">' + TIPOS.map(function (t) { return '<button type="button" class="pp-tipo" role="radio" aria-checked="' + (st.tipo === t) + '" data-tipo="' + t + '">' + t + '</button>'; }).join('') + '</div>' +
        '<div class="pp-pantallita" aria-live="polite">' + esc(grupos(st.digitos)) + '</div>' +
        '<div class="pp-teclas">' + teclas.map(function (k) {
          return k === 'ok'
            ? '<button type="button" class="pp-tecla" style="background:var(--naotech-primary-color-600);color:var(--naotech-color-white-alpha-100)" data-tecla="ok" aria-describedby="hoja-ayuda"' + (est.puede ? '' : ' disabled aria-disabled="true"') + '>Validar</button>'
            : '<button type="button" class="pp-tecla" data-tecla="' + k + '"' + (k === '⌫' ? ' aria-label="Borrar"' : '') + '>' + k + '</button>';
        }).join('') + '</div>' +
        '<p class="nwt-smalltext-font-regular pp-hoja__ayuda' + (est.error ? ' pp-hoja__ayuda--error' : '') + '" id="hoja-ayuda" role="status">' + esc(est.texto) + '</p></div>';
    }

    var MOTIVOS = ['Discapacidad o lesión', 'Huella ilegible', 'Otro (anotar)'];
    function hojaMarco(titulo, cuerpo) {
      return '<div class="pp-velo" data-acc="cerrar-hoja"></div><div class="pp-hoja" role="dialog" aria-label="' + titulo + '"><div class="pp-hoja__cab"><span>' + titulo + '</span><nwt-icon-button nwt-variant="mute" nwt-size="small" icon="close" label="Cerrar" data-acc="cerrar-hoja"></nwt-icon-button></div>' + cuerpo + '</div>';
    }

    // Razón visible bajo el teclado: por qué Validar está apagado, o que el número no existe.
    function estadoHoja() {
      var n = st.digitos.length;
      if (st.hojaError) { return { puede: n >= MIN_DOC, error: true, texto: 'No encontramos ese documento. Revise el tipo y el número.' }; }
      if (!n) { return { puede: false, texto: 'Mínimo ' + MIN_DOC + ' dígitos. Para probar: 1036482117 entra; 71894447 es un rojo.' }; }
      if (n < MIN_DOC) { return { puede: false, texto: 'Faltan ' + (MIN_DOC - n) + (MIN_DOC - n === 1 ? ' dígito' : ' dígitos') + ': el mínimo es ' + MIN_DOC + '.' }; }
      return { puede: true, texto: 'Listo para validar ' + st.tipo + ' ' + grupos(st.digitos) + '.' };
    }
    // Actualiza pantallita, ayuda y Validar sin repintar la hoja: no se reanima ni se pierde el foco.
    function pintarHoja() {
      var est = estadoHoja(), pant = disp.querySelector('.pp-pantallita'), ay = disp.querySelector('#hoja-ayuda'), ok = disp.querySelector('[data-tecla="ok"]');
      if (pant) { pant.textContent = grupos(st.digitos); }
      if (ay) { ay.textContent = est.texto; ay.classList.toggle('pp-hoja__ayuda--error', !!est.error); }
      if (ok) { ok.disabled = !est.puede; ok.setAttribute('aria-disabled', String(!est.puede)); }
    }
    function teclear(k) {
      st.hojaError = false;
      if (k === '⌫') { st.digitos = st.digitos.slice(0, -1); }
      else if (st.digitos.length < MAX_DOC) { st.digitos += k; }
      pintarHoja();
    }

    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + (st.toast.tema === 'warning' ? 'attention' : 'positive') + '" nwt-theme="' + (st.toast.tema || 'positive') + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }

    function listo() {
      return '<div class="pp-lateral__listo"><strong>Listo para leer</strong><span>La cámara sigue leyendo mientras ve el resultado.</span></div>';
    }

    function appOperador() {
      var hayResultado = st.vista !== 'lectura';
      var columnaCamara = '<div class="pp-columna">' + camara() + acciones() + '</div>';
      var cuerpo;
      if (st.disp === 'celular') {
        cuerpo = '<div class="pp-cuerpo">' + columnaCamara + (hayResultado ? resultado() : '') + '</div>';
      } else if (st.disp === 'tablet') {
        // Con resultado, ocupa toda la pantalla; la validación en curso queda en la columna.
        cuerpo = '<div class="pp-cuerpo">' + columnaCamara +
          '<div class="pp-lateral"><div class="pp-lateral__arriba">' + listo() + '</div>' + turno() + '</div>' +
          (st.vista !== 'lectura' ? resultado() : '') + '</div>';
      } else {
        cuerpo = '<div class="pp-cuerpo"><div class="pp-lector">' +
          '<form class="pp-lector__campo" data-form="lector"><nwt-icon value="qr-code"></nwt-icon>' +
            '<input id="lector" autocomplete="off" inputmode="numeric" aria-label="Lectura del lector USB o documento digitado" placeholder="Pase el documento por el lector o digite el número">' +
            '<nwt-button type="submit" data-acc="leer">Validar</nwt-button></form>' +
          ('<div class="pp-lector__espera"><div><nwt-icon value="qr-code"></nwt-icon><p class="pp-resultado__causa">Esperando lectura</p><p>El foco vuelve solo al campo después de cada persona.</p></div></div>') +
          '</div><div class="pp-lateral"><div class="pp-lateral__arriba">' + listoConsola() + '</div>' + turno() + '</div>' +
          (st.vista !== 'lectura' ? resultado() : '') + '</div>';
      }
      return '<div class="pp-app">' + barra() + cuerpo + hoja() + toast() + '</div>';
    }

    function listoConsola() {
      // Mismos tags de estado del celular, sobre fondo gris claro (DC-187).
      return '<div class="pp-lateral__listo"><strong>' + esc(E.puerta) + '</strong><span>Lector USB conectado · torniquete asignado desde el backoffice.</span>' +
        '<div class="pp-lateral__estado">' + estadoCamara('red') + estadoCamara('torn') + estadoCamara('huella') +
          lectorFijo('Lector de cédula · Conectado') + lectorFijo('Lector QR · Conectado') + '</div></div>';
    }

    // Club afín: el indicativo más visible de la vista. Escudo y nombre a la izquierda; barras y porcentaje a la derecha.
    // Ícono a la izquierda de cada título de señal (DC-100).
    var ICONO_SENAL = { 'Club afín': 'favorite', 'Tribuna habitual': 'gps-pin', 'Frecuencia': 'calendar', 'Viajes de visitante': 'vehicles', 'Con quién va': 'user', 'Intentos fallidos': 'attention' };
    function tituloSenal(l) { return '<p class="pp-senal__l"><nwt-icon value="' + (ICONO_SENAL[l] || 'info') + '"></nwt-icon>' + esc(l) + '</p>'; }

    function senalClub(s) {
      var partes = s.v.split(' · '), pct = parseInt(partes[1], 10) || 0, llenas = Math.round(pct / 20);
      var barras = [0, 1, 2, 3, 4].map(function (i) { return '<span class="pp-barra-n' + (i < llenas ? ' pp-barra-n--on' : '') + '" style="height:' + (10 + i * 6) + 'px"></span>'; }).join('');
      return '<div class="pp-senal pp-senal--club">' + tituloSenal(s.l) +
        '<div class="pp-club"><img class="pp-club__escudo" src="assets/escudos/nacional.webp" alt="Escudo"><p class="pp-club__nombre">' + esc(partes[0]) + '</p>' +
        '<div class="pp-club__pct"><span class="pp-barras" aria-hidden="true">' + barras + '</span><span class="pp-club__num">' + esc(partes[1] || '') + '</span></div></div>' +
        '<p class="pp-senal__por">' + esc(s.por) + '</p><p class="pp-senal__marca">Único dato que decide un acceso: partidos sin hinchada visitante</p></div>';
    }

    /* ---------- Tablero del evento (Autoridad, antes del perfil) ---------- */

    function ahora() { return '18:' + st.min; }
    function abierta() { return st.alertas.filter(function (a) { return a.id === st.abierta; })[0]; }
    function contar(e) { return st.alertas.filter(function (a) { return a.estado === e; }).length; }

    function volverIcono(acc, rotulo) {
      return '<button type="button" class="pp-t__volver pp-t__volver--ico" data-acc="' + acc + '" aria-label="' + rotulo + '" title="' + rotulo + '">' + SVG('<path d="M19 12H5M11 6l-6 6 6 6"/>', 20) + '</button>';
    }

    // tipo: 'lista' (eventos, con el selector), 'tablero' (vuelve a eventos) o 'perfil' (vuelve al tablero).
    function barraPolicia(tipo) {
      // Volver es solo icono (DC-145): en el tablero vive junto al partido; en el perfil, en la barra.
      var volver = tipo === 'perfil' ? volverIcono('t-tablero', 'Volver al tablero del evento') : '';
      return '<header class="pp-policia__barra">' +
        '<div class="pp-policia__grupo pp-policia__grupo--izq">' + volver +
          window.NAOWEE.entidades +
          '</div>' +
        '<div class="pp-policia__grupo"><span class="pp-policia__texto">Autoridad de seguridad</span><svg class="pp-policia__escudo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.500-3.200 8-8 9-4.800-1-8-4.500-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg><span class="pp-conexion">En línea</span></div>' +
      '</header>';
    }

    var ESTADO = { nueva: 'Nueva', atencion: 'En atención', cerrada: 'Cerrada' };

    function nombres(a) { return (a.asignados || []).join(', '); }

    // Aviso silencioso de la puerta: la persona entró como verde; no es una alerta ni hay nada que atender (DC-030/031).
    function tarjetaAviso(v) {
      return '<article class="pp-t__aviso" data-aviso="' + v.id + '" data-tipo-aviso="' + esc(v.tipo) + '">' +
        '<div class="pp-t__alerta-top"><span class="pp-t__estado">Aviso · ' + esc(v.etiqueta) + '</span><span class="pp-t__origen">' + esc(v.origen || 'Entró · ' + v.quien) + '</span><span class="pp-t__tiempo">' + esc(v.hora) + '</span></div>' +
        '<div><p class="pp-t__puerta">' + esc(v.puerta) + '</p><p class="pp-t__doc">' + esc(v.doc) + ' · ' + esc(v.causa) + '</p></div>' +
        '<p class="pp-t__aviso-det">' + SVG(I.aviso, 16) + esc(v.detalle) + '</p></article>';
    }

    // Cronómetro de la alerta (DC-129): corre mientras está abierta o en trámite y se congela al cerrarse.
    function minDe(h) { var x = String(h).split(':'); return (+x[0]) * 60 + (+x[1] || 0); }
    function cronoDe(a) {
      var ult = a.pasos[a.pasos.length - 1], falta = minDe(ahora()) - minDe(a.hora), seg = 0, i;
      if (!a.t0) {
        for (i = 0; i < a.id.length; i++) { seg += a.id.charCodeAt(i) * 7; }
        var dur = a.estado === 'cerrada' ? (minDe(ult.hora) - minDe(a.hora)) * 60 + seg % 60 : falta > 0 ? falta * 60 + seg % 60 : 0;
        a.t0 = Date.now() - (a.estado === 'cerrada' ? 0 : dur * 1000);
        if (a.estado === 'cerrada') { a.tFin = a.t0 + dur * 1000; }
      }
      if (a.estado === 'cerrada' && !a.tFin) { a.tFin = Date.now(); }
      return a;
    }
    function partesCrono(ms) {
      var t = Math.max(0, Math.floor(ms / 1000));
      return [String(Math.floor(t / 60)).padStart(2, '0'), String(t % 60).padStart(2, '0')];
    }
    function cronoHtml(a) {
      cronoDe(a);
      var pt = partesCrono((a.tFin || Date.now()) - a.t0);
      return '<span class="pp-t__cron" data-cron data-t0="' + a.t0 + '"' + (a.tFin ? ' data-tfin="' + a.tFin + '"' : '') + ' title="' + (a.tFin ? 'Tiempo total' : 'Tiempo abierta') + '"><b class="pp-t__cron-m">' + pt[0] + '</b><span class="pp-t__cron-s">:' + pt[1] + '</span></span>';
    }
    // Vista expandida: menos datos, una línea por dato (DC-129).
    function tarjetaCompacta(a) {
      var asignada = a.estado === 'nueva' && a.asignados;
      var primaria = a.estado === 'nueva' ? '<button type="button" class="pp-t__btn" data-acc="t-asignar" data-id="' + a.id + '">' + (asignada ? 'Reasignar' : 'Asignar') + '</button>'
        : a.estado === 'atencion' ? '<button type="button" class="pp-t__btn" data-acc="t-perfil" data-id="' + a.id + '">Cerrar con resultado</button>' : '';
      return '<article class="pp-t__alerta pp-t__alerta--' + a.estado + ' pp-t__alerta--compacta" data-alerta="' + a.id + '">' +
        '<div class="pp-t__alerta-top"><span class="pp-t__estado">' + ESTADO[a.estado] + '</span>' + cronoHtml(a) + '</div>' +
        '<p class="pp-t__puerta pp-t__linea">' + esc(a.puerta) + '</p>' +
        '<p class="pp-t__doc pp-t__linea">' + esc(a.doc) + ' · ' + esc(a.causa) + '</p>' +
        '<div class="pp-t__acciones">' + primaria + '<button type="button" class="pp-t__btn pp-t__btn--sec" data-acc="t-perfil" data-id="' + a.id + '">Ver perfil</button></div>' +
      '</article>';
    }

    function tarjetaAlerta(a) {
      var ultimo = a.pasos[a.pasos.length - 1], asignada = a.estado === 'nueva' && a.asignados;
      var tiempo = a.estado === 'nueva' ? (asignada ? 'Notificada · ' + a.horaAsig : 'Sonando · ' + a.hora) : a.estado === 'atencion' ? 'Abierta · ' + a.hora : 'Cerrada · ' + ultimo.hora;
      var pasos = a.pasos.map(function (p) {
        return '<li><span class="pp-t__paso-hora">' + esc(p.hora) + '</span><span>' + esc(p.texto) + ' <span class="pp-t__quien">· ' + esc(p.quien) + '</span></span></li>';
      }).join('');
      // La autoridad de seguridad no toma la alerta: la asigna, y la toma el agente desde su dispositivo (DC-114).
      var primaria = a.estado === 'nueva' ? '<button type="button" class="pp-t__btn" data-acc="t-asignar" data-id="' + a.id + '">' + (asignada ? 'Cambiar asignación' : 'Asignar') + '</button>'
        : a.estado === 'atencion' ? '<button type="button" class="pp-t__btn" data-acc="t-perfil" data-id="' + a.id + '">Cerrar con resultado</button>' : '';
      return '<article class="pp-t__alerta pp-t__alerta--' + a.estado + '" data-alerta="' + a.id + '">' +
        '<div class="pp-t__alerta-top"><span class="pp-t__estado">' + ESTADO[a.estado] + '</span><span class="pp-t__origen">' + esc(a.origen) + '</span><span class="pp-t__tiempo">' + tiempo + '</span></div>' +
        '<div><p class="pp-t__puerta">' + esc(a.puerta) + '</p><p class="pp-t__doc">' + esc(a.doc) + ' · ' + esc(a.causa) + '</p></div>' +
        (asignada ? '<p class="pp-t__espera">' + SVG(I.campana, 16) + 'Notificada a ' + esc(nombres(a)) + ' · esperando que uno la tome</p>' : '') +
        '<ol class="pp-t__pasos">' + pasos + '</ol>' +
        '<div class="pp-t__acciones">' + primaria + '<button type="button" class="pp-t__btn pp-t__btn--sec" data-acc="t-perfil" data-id="' + a.id + '">Ver perfil</button></div>' +
      '</article>';
    }

    /* ---------- Asignar una alerta (DC-114): modal con la info de la puerta y los agentes a notificar ---------- */

    function zona(puesto) { return puesto.split(' · ')[1]; }
    // Más cerca primero: los de la misma puerta, luego la misma tribuna, luego el resto; los ocupados al final.
    function cercania(ag, puerta) { return ag.ocupado ? 3 : ag.puesto === puerta ? 0 : zona(ag.puesto) === zona(puerta) ? 1 : 2; }
    var CERCA = ['En la puerta', 'Misma tribuna', 'Otra tribuna', 'Ocupado'];
    function agentesDe(puerta) {
      return D.policia.agentes.slice().sort(function (x, y) { return cercania(x, puerta) - cercania(y, puerta); });
    }
    function abrirModal(a) {
      var lista = agentesDe(a.puerta), sel = [];
      if (a.asignados) { sel = lista.filter(function (g) { return a.asignados.indexOf(g.nombre) >= 0; }).map(function (g) { return g.id; }); }
      else { sel = lista.filter(function (g) { return cercania(g, a.puerta) === 0; }).map(function (g) { return g.id; }); if (!sel.length) { sel = [lista[0].id]; } }
      st.modal = { id: a.id, sel: sel, foco: true };
      pintarDispositivo();
    }

    function modal() {
      var m = st.modal; if (!m) { return ''; }
      var a = st.alertas.filter(function (x) { return x.id === m.id; })[0]; if (!a) { return ''; }
      var T = D.policia.tablero, i = T.puertas.map(function (p) { return p.nombre; }).indexOf(a.puerta), pt = T.puertas[i], pv = vivo.puertas[i], ex = i === IDX ? extraPuerta() : { rojos: 0, avisos: 0 };
      var tomo = a.estado !== 'nueva', quienTomo = tomo ? a.pasos.filter(function (p) { return p.texto === 'Tomada'; })[0] : null;
      var dato = function (l, v) { return '<div class="pp-m__dato"><span>' + l + '</span><b>' + v + '</b></div>'; };
      var puerta = pv ? '<div class="pp-m__puerta" aria-label="Información de la puerta">' +
        dato('Flujo por minuto', pv.off ? 'Sin conexión' : pv.flujo) + dato('Ingresados', pv.ing.toLocaleString('es-CO')) + dato('Avisos', pt.avisos + ex.avisos) + dato('Rojos', pt.rojos + ex.rojos) + '</div>' : '';
      var agentes = agentesDe(a.puerta).map(function (g) {
        var c = cercania(g, a.puerta), on = m.sel.indexOf(g.id) >= 0;
        var par = g.nombre.split(' '), ini = par[par.length - 2].charAt(0) + par[par.length - 1].charAt(0);
        return '<label class="pp-m__agente' + (g.ocupado ? ' pp-m__agente--off' : '') + '"><input type="checkbox" data-agente="' + g.id + '"' + (on ? ' checked' : '') + (g.ocupado || tomo ? ' disabled' : '') + '>' +
          '<nwt-avatar nwt-size="large" nwt-color="blue" aria-hidden="true">' + ini + (g.foto ? '<img class="pp-m__foto" src="' + g.foto + '" alt="" onerror="this.remove()">' : '') + '</nwt-avatar>' +
          '<span class="pp-m__quien"><b>' + esc(g.nombre) + '</b><span>' + esc(g.ocupado || g.puesto) + '</span><span class="pp-m__cerca pp-m__cerca--' + c + '">' + CERCA[c] + '</span></span></label>';
      }).join('');
      var aviso = tomo ? '<p class="pp-m__aviso" role="status">' + SVG(I.escudo, 16) + 'Ya la tomó ' + esc(quienTomo ? quienTomo.quien : 'un agente') + ' · ' + esc(quienTomo ? quienTomo.hora : '') + '. No hace falta asignarla.</p>' : '';
      var n = m.sel.length;
      return '<div class="pp-velo pp-velo--modal" data-acc="t-modal-cerrar"></div>' +
        '<div class="pp-modal" role="dialog" aria-modal="true" aria-labelledby="pp-m-t" tabindex="-1">' +
          '<div class="pp-modal__cab"><div><h2 class="pp-modal__t" id="pp-m-t">Asignar alerta</h2>' +
            '<p class="pp-modal__s">' + esc(a.puerta) + ' · ' + esc(a.causa) + ' · ' + esc(a.doc) + ' · ' + esc(a.hora) + '</p></div>' +
            '<button type="button" class="pp-modal__x" data-acc="t-modal-cerrar" aria-label="Cerrar">' + SVG(I.x, 20) + '</button></div>' +
          puerta + aviso +
          '<fieldset class="pp-m__agentes"><legend>Agentes a notificar</legend><div class="pp-m__grid">' + agentes + '</div></fieldset>' +
          '<p class="pp-modal__nota">Reciben la notificación en su dispositivo. Si uno la toma antes, la alerta pasa a En atención.</p>' +
          '<div class="pp-modal__pie"><button type="button" class="pp-m__btn pp-m__btn--sec" data-acc="t-modal-cerrar">' + (tomo ? 'Cerrar' : 'Cancelar') + '</button>' +
            (tomo ? '' : '<button type="button" class="pp-m__btn" data-acc="t-modal-asignar"' + (n ? '' : ' disabled') + '>' + (a.asignados ? 'Reasignar y notificar' : 'Asignar y notificar') + (n ? ' · ' + n : '') + '</button>') + '</div>' +
        '</div>';
    }

    var tomasPendientes = {};
    // Un agente toma la alerta desde su dispositivo: `propia` es cuando nadie se la había asignado.
    function tomaAgente(a, quien, propia) {
      if (!a || a.estado !== 'nueva') { return; }
      st.min++;
      a.estado = 'atencion';
      a.pasos.push({ hora: ahora(), texto: 'Tomada', quien: quien });
      clearTimeout(tomasPendientes[a.id]);
      if (st.abierta === a.id && st.alerta === 'nueva') { st.alerta = 'tomada'; }
      mostrarToast(propia ? quien + ' la tomó primero' : quien + ' tomó la alerta', a.puerta + ' · ' + ahora() + (propia ? ' · nadie la había asignado' : ''), true);
    }
    function programarToma(a) {
      clearTimeout(tomasPendientes[a.id]);
      tomasPendientes[a.id] = setTimeout(function () { if (a.estado === 'nueva' && a.asignados) { tomaAgente(a, a.asignados[0], false); } }, 7000);
      temporizadores.push(tomasPendientes[a.id]);
    }
    // Agente de la misma puerta si lo hay; si no, el más cercano que esté libre.
    function tomadorDe(a) { return agentesDe(a.puerta).filter(function (g) { return !g.ocupado; })[0].nombre; }
    // Caso "ellos la toman primero": pasado un rato sin asignar, el agente de la Puerta 6 la toma por su cuenta.
    function programarTomaPrimero() {
      if (st.tomaPrimero) { return; }
      st.tomaPrimero = true;
      luego(function () {
        var a = st.alertas.filter(function (x) { return x.id === 'a2'; })[0];
        if (a && a.estado === 'nueva' && !a.asignados) { tomaAgente(a, tomadorDe(a), true); }
      }, 20000);
    }

    /* ---------- Tablero en vivo (DC-108) ---------- */

    // Simulación en bucle: cada ciclo parte de los datos del tablero y vuelve a ellos. Con reduced-motion va más lenta.
    var QUIETO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PASO_MS = QUIETO ? 6000 : 1500, CICLO = 48;
    var vivo = null, paso = 0, timerVivo = null;
    function baseIng(i) { return D.policia.tablero.puertas[i].ing + (i === IDX ? extraPuerta().ing : 0); }
    function reiniciarVivo() {
      var T = D.policia.tablero;
      vivo = { flujo: T.flujo.slice(), acum: T.puertas.map(function () { return 0; }),
        puertas: T.puertas.map(function (p, i) { return { flujo: p.flujo, ing: baseIng(i), off: p.off }; }) };
      paso = 0;
    }
    reiniciarVivo();
    function sumaFlujo(v) { return v.puertas.reduce(function (n, p) { return n + (p.off ? 0 : p.flujo); }, 0); }
    function sumaIng(v) { return v.puertas.reduce(function (n, p) { return n + p.ing; }, 0); }
    function barrasHtml(flujo) {
      var max = Math.max.apply(null, flujo);
      return flujo.map(function (v, i) {
        return '<span class="pp-t__barra' + (i === flujo.length - 1 ? ' pp-t__barra--ahora' : '') + '" style="height:' + Math.round(v / max * 100) + '%" title="' + v + ' por minuto"></span>';
      }).join('');
    }
    function flujoPuertaHtml(p) {
      return p.off ? '<span class="pp-t__off">Sin conexión</span>' : '<span class="pp-t__pista"><span style="width:' + Math.round(p.flujo / 40 * 100) + '%"></span></span><span class="pp-t__num">' + p.flujo + '</span>';
    }
    function textoVivo(clave, txt) { var e = disp && disp.querySelector('[data-vivo="' + clave + '"]'); if (e && e.textContent !== txt) { e.textContent = txt; } }
    function latido() {
      var T = D.policia.tablero;
      paso++;
      if (paso >= CICLO) { reiniciarVivo(); }
      else {
        // Cada puerta oscila con su propia fase; lo que entra sale del flujo de ese momento.
        vivo.puertas.forEach(function (p, i) {
          if (p.off) { return; }
          p.flujo = Math.max(4, Math.round(T.puertas[i].flujo + 6 * Math.sin(paso / 3 + i * 1.7) + 3 * Math.sin(paso / 1.4 + i)));
          vivo.acum[i] += p.flujo * 0.16;
          p.ing = baseIng(i) + Math.floor(vivo.acum[i]);
        });
        // La gráfica corre una barra cada 3 pasos: sale la más vieja, entra el flujo total de ahora.
        if (paso % 3 === 0) { vivo.flujo.shift(); vivo.flujo.push(sumaFlujo(vivo)); }
        else { vivo.flujo[vivo.flujo.length - 1] = sumaFlujo(vivo); }
      }
      var total = sumaIng(vivo), pm = sumaFlujo(vivo), pico = Math.max(190, Math.max.apply(null, vivo.flujo));
      textoVivo('ing', total.toLocaleString('es-CO'));
      textoVivo('ing-pct', (total / T.aforo * 100).toFixed(1).replace('.', ',') + ' % de ' + T.aforo.toLocaleString('es-CO'));
      textoVivo('pm', String(pm));
      textoVivo('pico', pico > 190 ? 'Pico: ' + pico + ' ahora' : 'Pico: ' + T.pico);
      var g = disp && disp.querySelector('[data-vivo="grafica"]'); if (g) { g.innerHTML = barrasHtml(vivo.flujo); }
      vivo.puertas.forEach(function (p, i) {
        var f = disp && disp.querySelector('[data-vivo="p' + i + '-f"]');
        if (f) { f.innerHTML = flujoPuertaHtml(p); }
        textoVivo('p' + i + '-i', p.ing.toLocaleString('es-CO'));
      });
    }
    // Un solo intervalo, solo mientras el tablero está en pantalla; el estado sobrevive a los repintados.
    function sincronizarVivo() {
      var ver = modo === 'policia' && st.pvista === 'tablero';
      if (ver && !timerVivo) { timerVivo = setInterval(latido, PASO_MS); }
      if (!ver && timerVivo) { clearInterval(timerVivo); timerVivo = null; }
    }

    /* ---------- Eventos (Autoridad): la primera pantalla, antes del tablero. Las cards viven en apps/eventos.js ---------- */

    function appEventos() {
      return '<div class="pp-app"><div class="pp-policia">' + barraPolicia('lista') +
        window.EVENTOS.lista({
          eventos: D.policia.eventos, filtro: st.efiltro, busca: st.ebusca, acc: 'e-abrir', accFiltro: 'e-filtro',
          titulo: 'Eventos', sub: 'Partidos de su jurisdicción: en vivo, los que vienen y los pasados.',
          accion: function (e) { return e.estado === 'pasado' ? 'Ver resumen' : e.estado === 'vivo' ? 'Abrir tablero' : 'Ver preparación'; },
          nota: function (e) { return e.tablero ? esc(e.nota) + ' · faltan <b data-cuenta>' + faltan() + '</b>' : esc(e.nota); },
          // El evento con tablero cuenta sus alertas en vivo; los demás traen las suyas en los datos.
          estados: function (e) { return e.tablero ? { nueva: contar('nueva'), atencion: contar('atencion'), cerrada: contar('cerrada') } : e.estados; }
        }) + '</div>' + toast() + '</div>';
    }

    function filtrarEventos() { window.EVENTOS.filtrar(disp, st.ebusca); }
    function onInput(ev) {
      if (ev.target.classList.contains('pp-e__busca')) { st.ebusca = ev.target.value; filtrarEventos(); }
      if (ev.target.id === 'motivo-nota') {
        st.motivoNota = ev.target.value;
        var ok = disp.querySelector('[data-acc="confirmar-sin-huella"]');
        if (ok) { var puede = st.motivoNota.trim().length >= 3; ok.disabled = !puede; ok.setAttribute('aria-disabled', String(!puede)); }
      }
    }

    function appTablero() {
      var T = D.policia.tablero, ex = extraPuerta();
      var orden = { nueva: 0, atencion: 1, cerrada: 2 };
      var lista = st.alertas.filter(function (a) { return st.filtro === 'todas' || a.estado === st.filtro; })
        .sort(function (a, b) { return orden[a.estado] - orden[b.estado]; });
      var nuevas = contar('nueva'), sinAsignar = st.alertas.filter(function (x) { return x.estado === 'nueva' && !x.asignados; }).length;
      var totalIng = sumaIng(vivo), pm = sumaFlujo(vivo);
      var pct = (totalIng / T.aforo * 100).toFixed(1).replace('.', ',');
      var barras = barrasHtml(vivo.flujo);
      var puertas = vivo.puertas.map(function (p, i) {
        return '<tr><th scope="row"><span class="pp-t__punto' + (p.off ? ' pp-t__punto--off' : '') + '"></span>' + esc(T.puertas[i].nombre) + (T.puertas[i].lector === 'revisar' ? '<span class="pp-t__lector">Lector: revisar</span>' : '') + '</th>' +
          '<td class="pp-t__flujo" data-vivo="p' + i + '-f">' + flujoPuertaHtml(p) + '</td>' +
          '<td class="pp-t__num" data-vivo="p' + i + '-i">' + p.ing.toLocaleString('es-CO') + '</td><td class="pp-t__num pp-t__num--aviso">' + (T.puertas[i].avisos + (i === IDX ? ex.avisos : 0)) + '</td>' +
          '<td class="pp-t__num' + (T.puertas[i].rojos + (i === IDX ? ex.rojos : 0) ? ' pp-t__num--rojo' : '') + '">' + (T.puertas[i].rojos + (i === IDX ? ex.rojos : 0)) + '</td></tr>';
      }).join('');
      // Los avisos no piden atención: aparecen en Todas, Nuevas y Cerradas, nunca en En atención (DC-055).
      var avisos = avisosBus().concat(T.avisosPuerta), nAv = avisos.length, verAvisos = st.filtro !== 'atencion';
      // Expandido muestra las 3 más recientes y los avisos esperan a «Ver todas» (DC-129).
      var recorta = st.expandido && !st.verTodas, tope = recorta ? 3 : lista.length, mostrarAvisos = !recorta, totalLista = lista.length + (verAvisos ? nAv : 0);
      var opciones = [['todas', 'Todas', st.alertas.length + nAv], ['nueva', 'Nuevas', nuevas + nAv], ['atencion', 'En atención', contar('atencion')], ['cerrada', 'Cerradas', contar('cerrada') + nAv]];
      var filtros = opciones.map(function (f) {
        return '<button type="button" role="tab" class="pp-t__filtro" aria-selected="' + (st.filtro === f[0]) + '" data-acc="t-filtro" data-id="' + f[0] + '">' + f[1] + ' · ' + f[2] + '</button>';
      }).join('');
      // Con el panel en tamaño normal el filtro es un solo chip con desplegable (DC-123); expandido, el segmentador.
      var actualF = opciones.filter(function (f) { return f[0] === st.filtro; })[0] || opciones[0];
      var selectorFiltro = '<div class="nwt-dropdown pp-t__sel"><button type="button" class="pp-t__chip" aria-haspopup="listbox" aria-expanded="' + !!st.filtroAbierto + '" aria-controls="pp-t-filtros-menu" data-acc="t-filtro-abrir"><span>' + actualF[1] + ' · ' + actualF[2] + '</span>' + SVG('<path d="M6 9l6 6 6-6"/>', 18) + '</button>' +
        (st.filtroAbierto ? '<div class="nwt-dropdown__list nwt-dropdown__list--bottom pp-t__menu" id="pp-t-filtros-menu" role="listbox" aria-label="Filtrar por estado"><div class="nwt-dropdown__options">' +
          opciones.map(function (f) { var on = f[0] === st.filtro; return '<button type="button" role="option" aria-selected="' + on + '" class="nwt-dropdown__option pp-t__opcion' + (on ? ' nwt-dropdown__option--highlighted' : '') + '" data-acc="t-filtro" data-id="' + f[0] + '"><span>' + f[1] + ' · ' + f[2] + '</span></button>'; }).join('') +
          '</div></div>' : '') + '</div>';
      var kpi = function (l, v, s, mod, vivoV, vivoS) { return '<div class="pp-t__kpi' + (mod ? ' pp-t__kpi--' + mod : '') + '"><span class="pp-t__kpi-l">' + l + '</span><span class="pp-t__kpi-v"' + (vivoV ? ' data-vivo="' + vivoV + '"' : '') + '>' + v + '</span><span class="pp-t__kpi-s"' + (vivoS ? ' data-vivo="' + vivoS + '"' : '') + '>' + s + '</span></div>'; };

      return '<div class="pp-app"><div class="pp-policia">' + barraPolicia('tablero') +
        '<div class="pp-t' + (st.expandido ? ' pp-t--expandido' : '') + '">' +
          '<div class="pp-t__main">' +
            '<section class="pp-t__evento" aria-label="Evento">' +
              volverIcono('t-eventos', 'Volver a Eventos') +
              '<div>' + window.EVENTOS.equipos(E.partido) +
              '<p class="pp-t__lugar"><span>' + esc(E.escenario) + ' · hoy · inicio ' + esc(E.hora) + ' · ' + T.puertas.length + ' puertas</span><nwt-badge nwt-size="large" nwt-theme="positive">Abiertos</nwt-badge></p></div>' +
              '<div class="pp-t__cuenta"><span>Faltan para el inicio</span><b data-cuenta>' + faltan() + '</b></div>' +
            '</section>' +
            '<section class="pp-t__kpis" aria-label="Indicadores">' +
              kpi('Ingresados', totalIng.toLocaleString('es-CO'), pct + ' % de ' + T.aforo.toLocaleString('es-CO'), '', 'ing', 'ing-pct') +
              kpi('Ingresos por minuto', pm, 'Pico: ' + T.pico, '', 'pm', 'pico') +
              kpi('Avisos', T.avisos + ex.avisos, 'Entraron · sin atención', 'aviso') +
              kpi('Alertas rojas', st.alertas.length, nuevas + (nuevas === 1 ? ' nueva · ' : ' nuevas · ') + contar('atencion') + ' en atención · ' + contar('cerrada') + (contar('cerrada') === 1 ? ' cerrada' : ' cerradas'), 'rojo') +
            '</section>' +
            '<section class="pp-t__caja" aria-label="Ingreso en vivo"><h2 class="pp-t__h">Ingreso en vivo<span>Personas por minuto, cada 5 min · desde las 17:00</span></h2>' +
              '<div class="pp-t__grafica" data-vivo="grafica">' + barras + '</div><div class="pp-t__eje"><span>17:05</span><span>17:35</span><span>18:05</span><span>18:40</span></div></section>' +
            '<section class="pp-t__caja" aria-label="Puertas"><h2 class="pp-t__h">Puertas <span>7 en línea · 1 sin conexión</span></h2>' +
              '<table class="pp-t__tabla"><thead><tr><th scope="col">Puerta</th><th scope="col">Flujo por minuto</th><th scope="col">Ingresados</th><th scope="col">Avisos</th><th scope="col">Rojos</th></tr></thead><tbody>' + puertas + '</tbody></table></section>' +
          '</div>' +
          '<aside class="pp-t__panel" aria-label="Alertas">' +
            '<div class="pp-t__panel-cab"><div class="pp-t__panel-top"><h2 class="pp-t__h">Alertas <span>Evento de hoy · ' + st.alertas.length + '</span></h2>' +
              '<div class="pp-t__panel-acc">' + '<span class="pp-t__vivo-punto" role="img" aria-label="Alertas en vivo" title="Alertas en vivo"></span>' +
              '<button type="button" class="pp-t__expandir" aria-expanded="' + !!st.expandido + '" data-acc="t-expandir">' + (st.expandido ? 'Colapsar' : 'Expandir') + '</button></div></div>' +
              (sinAsignar ? '<p class="pp-t__sonando" role="status" title="Deja de sonar al asignarla">' + SVG(I.campana, 18) + (sinAsignar === 1 ? '1 alerta sin asignar' : sinAsignar + ' alertas sin asignar') + '</p>' : '') +
              (st.expandido ? '<div class="pp-t__filtros" role="tablist" aria-label="Filtrar por estado">' + filtros + '</div>' : selectorFiltro) + '</div>' +
            '<div class="pp-t__lista">' + (lista.length ? lista.slice(0, tope).map(st.expandido ? tarjetaCompacta : tarjetaAlerta).join('') : '<p class="pp-t__vacio">No hay alertas en este estado.</p>') +
              (st.expandido && totalLista > 3 ? '<button type="button" class="pp-t__expandir pp-t__mas" data-acc="t-ver-todas">' + (st.verTodas ? 'Ver menos' : 'Ver todas (' + totalLista + ')') + '</button>' : '') +
              (verAvisos && mostrarAvisos ? '<h3 class="pp-t__sub">Avisos de la puerta<span>Entraron · ' + nAv + '</span></h3>' + avisos.map(tarjetaAviso).join('') : '') + '</div>' +
            '<p class="pp-t__pie">Cada paso y cada consulta de perfil quedan en la auditoría.</p>' +
          '</aside>' +
        '</div></div>' + modal() + toast() + '</div>';
    }

    // Perfil de la alerta: la persona sale del resolver (vista PMU: documento enmascarado, menor sin nombre); las señales cruzadas son solo de Julián.
    var JULIAN = 'CC|71894447';
    function perfil(a) {
      var k = (a && a.clave) || JULIAN, p = U.deClave(k), r = U.res(p.tipo, p.num, 'pmu'), ms = r ? U.medidas(r) : [];
      var hace3 = U.sumar(U.hoyIso(), -1095);
      return { esJulian: k === JULIAN, menor: !!(r && r.esMenor), nombre: r ? r.nombreVisible : '', doc: (a && a.doc) || (r ? r.docVisible : ''), medidas: ms,
        reincidencia: ms.filter(function (m) { return m.ejecutoria >= hace3; }).length };
    }
    function medidaHtml(m) {
      var sub = m.acto + (m.vigente ? ' · vence ' + U.fechaIso(m.fin) + ' · ' + m.dias + (m.dias === 1 ? ' día' : ' días') : ' · cumplida el ' + U.fechaIso(m.fin));
      return '<div class="pp-medida"><nwt-badge nwt-size="large" nwt-theme="' + (m.vigente ? 'negative' : 'neutral') + '">' + (m.vigente ? 'Vigente' : 'Cumplida') + '</nwt-badge><div><p class="pp-medida__t">' + esc(m.conductas.join(' · ')) + '</p><p class="pp-medida__s">' + esc(sub) + '</p></div></div>';
    }
    function appPolicia() {
      var P = D.policia, A = abierta() || { puerta: E.puerta, hora: '18:42', pasos: [] }, PF = perfil(A);
      var tomada = A.pasos.filter(function (p) { return p.texto === 'Tomada'; })[0];
      var accion;
      if (st.alerta === 'nueva') {
        accion = (A.asignados ? '<p class="pp-resultado__nota"><nwt-icon value="notification"></nwt-icon>Notificada a ' + esc(nombres(A)) + ' · esperando que uno la tome</p>' : '') +
          '<button type="button" class="pp-r__btn" data-acc="t-asignar" data-id="' + esc(A.id) + '">' + (A.asignados ? 'Cambiar asignación' : 'Asignar') + '</button>';
      } else if (st.alerta === 'tomada') {
        accion = '<p class="pp-resultado__nota"><nwt-icon value="user"></nwt-icon>Tomada por ' + esc(tomada ? tomada.quien : 'Pt. R. Gómez (usted)') + ' · ' + esc(tomada ? tomada.hora : ahora()) + '</p>' +
          '<p class="pp-resultado__causa" style="font-size:var(--naotech-sizing-18)">Cerrar con resultado</p>' +
          '<div class="pp-motivos">' + ['Conducido', 'No encontrado', 'Falsa alarma'].map(function (m) {
            return '<button class="pp-motivo pp-motivo--claro" aria-pressed="' + (st.cierre === m) + '" data-cierre="' + m + '">' + m + '</button>';
          }).join('') + '</div>' +
          '<button type="button" class="pp-r__btn" data-acc="cerrar-alerta"' + (st.cierre ? '' : ' disabled style="opacity:.5;cursor:not-allowed"') + '>Cerrar alerta</button>';
      } else {
        accion = '<p class="pp-resultado__nota"><nwt-icon value="positive"></nwt-icon>Cerrada · ' + esc(st.cierre) + ' · queda en la auditoría</p>';
      }
      return '<div class="pp-app"><div class="pp-policia">' + barraPolicia('perfil') +
        '<div class="pp-policia__cuerpo">' +
          '<section class="pp-policia__alerta" aria-label="Alerta roja">' +
            '<h2 class="pp-r__palabra">ALERTA ROJA</h2>' +
            '<div class="pp-r__rotulo"><div class="pp-r__rotulo-l">' + SVG(I.pin, 18) + '<span>Puerta y hora</span></div><p class="pp-r__dato">' + esc(A.puerta) + ' · ' + esc(A.hora) + '</p></div>' +
            window.EVENTOS.equipos(E.partido, { extra: '<span class="pp-alerta__falta">Inicia en <b data-cuenta>' + faltan() + '</b></span>' }) +
            '<div class="pp-r__doc">' + foto(false, PF.esJulian ? 'assets/fotos/sospechoso-sin.webp' : null) +
              '<div class="pp-r__datos"><span class="pp-r__nombre">' + esc(PF.menor ? 'Menor de edad' : PF.nombre || 'Sin expediente en el IVC') + '</span><span class="pp-r__num">' + esc(PF.doc) + '</span></div></div>' +
            '<div class="pp-alerta__accion">' + accion + '</div>' +
          '</section>' +
          '<div class="pp-policia__detalle">' +
            '<p class="pp-principio"><nwt-icon value="info"></nwt-icon><span>Estas señales <strong>informan, no deciden</strong>. No hay un puntaje de peligrosidad: cada dato dice de dónde sale. Esta consulta queda en la auditoría.</span></p>' +
            '<section class="pp-seccion"><h3 class="pp-seccion__h"><nwt-icon value="file"></nwt-icon>Medidas correctivas</h3>' + (PF.medidas.length ? PF.medidas.map(medidaHtml).join('') : '<p class="pp-medida__s">Sin medidas registradas en el IVC para este documento.</p>') +
            '<p class="pp-medida__s">Reincidencia: ' + PF.reincidencia + (PF.reincidencia === 1 ? ' medida' : ' medidas') + ' en los últimos 3 años.</p></section>' +
            '<section class="pp-seccion"><h3 class="pp-seccion__h"><nwt-icon value="categories"></nwt-icon>Datos cruzados</h3>' + (PF.esJulian ? '<div class="pp-senales">' + P.senales.map(function (s) {
              if (s.decide) { return senalClub(s); }
              return '<div class="pp-senal">' + tituloSenal(s.l) + '<p class="pp-senal__v">' + esc(s.v) + '</p><p class="pp-senal__por">' + esc(s.por) + '</p></div>';
            }).join('') + '</div>' : '<p class="pp-medida__s">Sin datos cruzados de este documento en la demo.</p>') + '</section>' +
          '</div></div></div>' + modal() + toast() + '</div>';
    }

    /* ---------- Pintado y escala ---------- */

    var disp, ultimaClave = '';
    // Repintar rehace el DOM y reiniciaba láser, giros y entradas: se devuelven a su punto (DC-170).
    function claveVista() { return [st.disp, st.vista, st.caso && st.caso.color, st.caso && st.caso.doc, st.pvista, st.hoja, !!st.modal].join('|'); }
    function propias(a) { return a.animationName && a.effect && a.effect.target && !a.effect.target.closest('.pp-toast'); }
    function animacionesVivas() {
      var por = {};
      if (!disp || !disp.getAnimations) { return por; }
      disp.getAnimations({ subtree: true }).filter(propias).forEach(function (a) { (por[a.animationName] = por[a.animationName] || []).push(a.currentTime); });
      return por;
    }
    function retomarAnimaciones(previas, mismaVista) {
      if (!disp.getAnimations) { return; }
      disp.getAnimations({ subtree: true }).filter(propias).forEach(function (a) {
        var t = previas[a.animationName] && previas[a.animationName].shift();
        if (t != null) { a.currentTime = t; }
        else if (mismaVista && a.effect.getComputedTiming().iterations !== Infinity) { a.finish(); }
      });
    }
    // El toast se monta y se quita solo, sin repintar el equipo (DC-170).
    function pintarToast() {
      var app = disp.querySelector('.pp-app');
      if (!app) { pintarDispositivo(); return; }
      var viejo = app.querySelector(':scope > .pp-toast');
      if (viejo) { viejo.remove(); }
      app.insertAdjacentHTML('beforeend', toast());
    }
    // Repintar rehace el DOM y una transition no corre sobre nodos nuevos: se toma foto de las tarjetas y se anima con WAAPI (DC-374).
    function fotoAlertas() {
      var lista = disp && disp.querySelector('.pp-t__lista');
      if (!lista || !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) { return null; }
      var foto = {};
      lista.querySelectorAll('[data-alerta]').forEach(function (t) {
        var c = getComputedStyle(t), e = getComputedStyle(t.querySelector('.pp-t__estado'));
        foto[t.dataset.alerta] = { pos: t.offsetTop, estado: t.className, fondo: c.backgroundColor, borde: c.borderTopColor, tinta: c.color, chipFondo: e.backgroundColor, chipTinta: e.color };
      });
      return foto;
    }
    function animarAlertas(foto) {
      var lista = foto && disp.querySelector('.pp-t__lista');
      if (!lista || !lista.animate) { return; }
      var ms = parseFloat(getComputedStyle(disp).getPropertyValue('--naotech-duration-base')) || 260, op = { duration: ms, easing: 'ease' };
      lista.querySelectorAll('[data-alerta]').forEach(function (t) {
        var antes = foto[t.dataset.alerta];
        if (!antes) { t.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], op); return; }
        var dy = antes.pos - t.offsetTop;
        if (dy) { t.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], op); }
        if (antes.estado !== t.className) {
          var c = getComputedStyle(t), chip = t.querySelector('.pp-t__estado'), e = getComputedStyle(chip);
          t.animate([{ backgroundColor: antes.fondo, borderColor: antes.borde, color: antes.tinta }, { backgroundColor: c.backgroundColor, borderColor: c.borderTopColor, color: c.color }], op);
          chip.animate([{ backgroundColor: antes.chipFondo, color: antes.chipTinta }, { backgroundColor: e.backgroundColor, color: e.color }], op);
        }
      });
    }
    // Cierra el desplegable del filtro en el DOM (sin repintar) y, si se pide, devuelve el foco al chip.
    function cerrarMenuFiltro(conFoco) {
      st.filtroAbierto = false;
      var m = disp.querySelector('.pp-t__menu'); if (m) { m.remove(); }
      var c = disp.querySelector('[data-acc="t-filtro-abrir"]');
      if (c) { c.setAttribute('aria-expanded', 'false'); if (conFoco) { c.focus({ preventScroll: true }); } }
    }
    // El título crece (o se achica) y el resto sale en el DOM vivo; recién al terminar se repinta (DC-131).
    var MOV_MS = 320, animandoVista = false;
    function alternarExpandido() {
      var t = disp.querySelector('.pp-t'), quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var fin = function () {
        animandoVista = false; var abre = !st.expandido;
        st.expandido = abre; st.verTodas = false; st.filtroAbierto = false; st.foco = '[data-acc="t-expandir"]'; pintarDispositivo();
        var n = disp.querySelector('.pp-t');
        if (n && !abre && !quieto) { n.classList.add('pp-t--vuelve'); setTimeout(function () { n.classList.remove('pp-t--vuelve'); }, MOV_MS + 60); }
      };
      if (!t || quieto || animandoVista) { fin(); return; }
      animandoVista = true; t.classList.add('pp-t--saliendo');
      setTimeout(fin, MOV_MS);
    }
    function pintarDispositivo() {
      var previas = animacionesVivas(), clave = claveVista(), fotoA = fotoAlertas();
      var pie = st.disp === 'consola' ? '<div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div>' : '';
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + st.disp + '"><div class="pp-pantalla">' +
        cromo() + (modo === 'policia' ? (st.pvista === 'eventos' ? appEventos() : st.pvista === 'tablero' ? appTablero() : appPolicia()) : appOperador()) + '</div></div>' + pie + '</div>';
      // El repintado rehace el DOM: el control que se pulsó recupera el foco.
      if (st.foco) { var fo = disp.querySelector(st.foco); st.foco = null; if (fo) { fo.focus({ preventScroll: true }); } }
      retomarAnimaciones(previas, clave === ultimaClave);
      animarAlertas(fotoA);
      ultimaClave = clave;
      escalar();
      sincronizarVivo();
      if (modo === 'policia' && st.pvista === 'eventos' && st.ebusca) { filtrarEventos(); }
      if (st.modal && st.modal.foco) { st.modal.foco = false; var dlg = disp.querySelector('.pp-modal'); if (dlg) { dlg.focus({ preventScroll: true }); } }
      if (st.disp === 'consola' && !st.hoja) { var i = disp.querySelector('#lector'); if (i) { i.focus({ preventScroll: true }); } }
    }
    // El equipo mide fijo; se encoge para caber y el zoom del escenario multiplica esa escala.
    var zoom = 1;
    function escalar() {
      SPLASH.ver(disp);
      var esc_ = raiz.querySelector('.pp-escena'), m = disp.firstElementChild;
      if (!esc_ || !m) { return; }
      // Con la capa abierta el equipo se achica y deja abajo el alto real de la franja, más aire, para no pisar el tag.
      var abierta = esc_.classList.contains('pp-escena--capa');
      var capaEl = esc_.querySelector('.pp-c');
      var FRANJA = capaEl ? capaEl.offsetHeight + 28 : 0;
      esc_.style.setProperty('--franja', FRANJA + 'px');
      var ancho = esc_.clientWidth - 48;
      var alto = esc_.clientHeight - 64 - 24 - (abierta ? FRANJA + 20 : 0);
      var k = Math.min(ancho / m.offsetWidth, alto / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
      // La línea de la capa arranca a 8 px del equipo (el carril sobresale 8 px hacia arriba) (DC-169).
      esc_.style.setProperty('--capa-top', Math.round(64 + m.offsetHeight * k * zoom + 16) + 'px');
    }

    /* ---------- Acciones ---------- */

    // Cada lectura resuelta va al bus con la clave de la persona: de ahí leen el PMU, el turno y la Auditoría del IVC.
    var AVISOS = { 'sin-huella': 'Sin huella', 'sin-referencia': 'Sin referencia de huella' };
    function emitir(tipo, c, detalle) {
      var k = c && claveDe(c);
      if (k) { U.emitir({ tipo: tipo, clave: k, evento: U.EVENTO, puerta: NUM, origen: 0, detalle: detalle, quien: 'Op. L. Mejía', horaEscena: hora(st.reloj) }); }
    }
    // `lectura`: solo las lecturas suman a los contadores y salen en la lista (DC-212).
    // `aviso`: tipo de aviso silencioso al PMU que esta lectura deja en el historial (el operador no lo ve).
    function registrar(color, texto, lectura, aviso) { st.historial.unshift({ color: color, texto: texto, hora: hora(st.reloj), lectura: !!lectura, aviso: aviso || undefined }); if (st.offline) { st.pendientes++; } }
    // Sin repintar: el láser y la validación en curso no se reinician.
    function alternarCamara(btn, clave, clase) {
      st[clave] = !st[clave];
      btn.setAttribute('aria-pressed', String(st[clave]));
      btn.closest('.pp-camara').classList.toggle(clase, st[clave]);
    }
    function aLectura() { cancelar(); st.vista = 'lectura'; st.caso = null; st.hu = null; st.apoyo = false; st.policia = false; pintarDispositivo(); }
    // Timer propio: cancelar() corre en cada lectura y no debe dejar el toast pegado.
    var timerToast = null;
    // `cambio`: la acción ya movió estado que se ve en pantalla, así que va un solo repintado con el toast.
    function mostrarToast(t, m, cambio, tema) {
      st.toast = { t: t, m: m, tema: tema };
      if (cambio) { pintarDispositivo(); } else { pintarToast(); }
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; pintarToast(); }, 3200);
    }

    // Ningún resultado se cierra solo: el turno suma al tocar Continuar.
    function continuar() {
      var c = st.caso;
      st.turno.ingresos++;
      registrar('verde', c.registro || 'Entró · ' + c.detalle.split(' · ')[0], true, c.aviso);
      emitir(c.aviso ? 'amarillo' : 'verde', c, (c.registro || 'Entró · ' + c.detalle.split(' · ')[0]) + (c.aviso ? ' · aviso al PMU · ' + (AVISOS[c.aviso] || c.aviso) : ''));
      aLectura();
    }

    /* ---------- Huella: lectura simulada, excepciones y contingencia ---------- */

    var PASO_HUELLA = 5, MS_LECTURA = 1200;
    function clon(c) { return JSON.parse(JSON.stringify(c)); }
    function sitio(c) { return String(c.detalle || '').split(' · ')[0]; }
    function lectorListo() { return st.lector && !st.offline; }
    // El sector del caso puede subir el modo del evento, pero nunca con el módulo apagado.
    function modoDe(c) {
      if (st.huella === 'apagada') { return 'apagada'; }
      return ((D.evento.huella || {}).sectores || {})[sitio(c)] || st.huella;
    }
    // Verde con excepción: nunca se confirma con Enter y solo avisa al PMU en el modo obligatorio.
    function excepcion(c, nota_, registro, aviso, sinRed) {
      var v = clon(c); v.exc = true; v.notaHuella = nota_; v.registro = registro; v.aviso = aviso || undefined; v.sinRed = !!sinRed;
      return v;
    }
    function verificado(c) { var v = clon(c); v.verificado = true; v.registro = 'Entró · huella coincide · ' + sitio(c); return v; }
    function rojoHuella(c) {
      var r = clon(c);
      r.color = 'rojo'; r.punto = 'rojo'; r.operativo = true; r.prestada = true; r.causa = 'Posible cédula prestada'; r.dato = 'La huella no coincide con el documento';
      r.registro = 'No entró · huella no coincide (3 lecturas legibles)';
      return r;
    }
    function sinReferencia(c, m) { return excepcion(c, 'Documento sin huella de referencia', 'Entró · sin referencia de huella', m === 'obligatoria' ? 'sin-referencia' : null); }
    function presentar(c) {
      st.caso = c; st.vista = 'resultado'; st.hu = null;
      if (c.color === 'rojo') {
        var txt = c.registro || (c.operativo ? 'No entró · ' + c.causa : 'No entró · alerta al PMU');
        st.turno.rojos++; registrar('rojo', txt, true);
        emitir(c.operativo ? 'operativo' : 'medida', c, txt);
      }
      pintarDispositivo();
    }
    // Cierra la huella: con la capa retenida la libera y ella muestra el resultado al terminar; si no, se muestra ya.
    function cerrarHuella(c) {
      st.hoja = null;
      if (st.hu && st.hu.retenida) { st.hu.final = c; st.hu.retenida = false; st.vista = 'validando'; pintarDispositivo(); capa.seguir(); }
      else { presentar(c); }
    }
    function lectura(origen) {
      st.hu = { n: 1, est: 'leyendo', origen: origen, retenida: origen === 'obligatoria' };
      st.vista = 'huella'; pintarDispositivo();
      luego(resolverLectura, MS_LECTURA);
    }
    // El resultado sale del caso elegido: calidad y coincidencia se cuentan aparte; solo 3 legibles sin coincidir dan rojo.
    function resolverLectura() {
      var h = st.hu, c = st.caso;
      if (!h || st.vista !== 'huella') { return; }
      var r = c.huella || 'coincide';
      if (r === 'sinref') { cerrarHuella(sinReferencia(c, modoDe(c))); return; }
      if (r === 'no' || r === 'ilegible') {
        if (h.n < 3) { h.est = r === 'no' ? 'nocoincide' : 'ilegible'; pintarDispositivo(); return; }
        if (r === 'no') { cerrarHuella(rojoHuella(c)); return; }
        h.est = 'ilegible'; st.motivo = null; st.motivoNota = ''; st.hoja = 'sin-huella'; pintarDispositivo(); return;
      }
      cerrarHuella(verificado(c));
    }
    // Verde candidato que no pasó por lectura: sin referencia, lector caído, sin red o solo opcional.
    function sinLectura(c, m, pide) {
      if (m === 'apagada' || c.color !== 'verde') { return c; }
      if (c.huella === 'sinref') { return sinReferencia(c, m); }
      if (!pide) {
        if (!lectorListo()) { c.notaLector = st.offline ? 'Sin conexión · la huella no se verifica' : 'Lector de huella sin servicio · la verificación sigue con el documento'; }
        return c;
      }
      if (st.offline) { return excepcion(c, 'Sin conexión · sin huella · se sincroniza al volver', 'Entró · sin huella · contingencia (sin conexión)', null, true); }
      if (!st.contingencia) { st.hu = { n: 0, est: 'sinlector' }; st.vista = 'huella'; pintarDispositivo(); return null; }
      return excepcion(c, 'Sin huella · contingencia', 'Entró · sin huella · contingencia');
    }
    function fijarModo(m) {
      st.huella = m;
    }
    function fijarLector(v) { st.lector = v; }
    // Un caso de huella con el módulo apagado lo enciende; el caso del lector lo apaga y el siguiente lo devuelve.
    function prepararHuella(c) {
      if (c.modo && st.huella === 'apagada') {
        fijarModo(c.modo);
        mostrarToast('Huella: ' + MODOS[c.modo].toLowerCase() + ' en este sector', 'El módulo estaba apagado: se enciende para este caso.', false);
      }
      if (c.huella === 'lector' && st.lector) { fijarLector(false); st.lectorAuto = true; }
      else if (c.huella && c.huella !== 'lector' && st.lectorAuto && !st.lector) { fijarLector(true); st.lectorAuto = false; }
    }

    var lento = false;
    // DC-095: el caso abre la hoja «Digitar documento» y la teclea solo; al terminar valida como si el operador pulsara Validar.
    function escribiendo(caso) {
      cancelar();
      var m = /^(\S+)\s(.+)$/.exec(caso.doc), digitos = m[2].replace(/\D/g, '');
      st.caso = null; st.vista = 'lectura'; st.hu = null; st.hoja = 'digitar'; st.tipo = m[1]; st.digitos = ''; st.hojaError = false;
      pintarDispositivo();
      var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var paso = (lento ? 4800 : 1200) / digitos.length;
      var validar = function () {
        var tk = disp.querySelector('[data-tecla="ok"]'); if (tk) { tk.classList.add('pp-tecla--on'); }
        luego(function () { var h = buscarCaso(st.tipo, st.digitos, true); if (h) { st.digitos = ''; leer(h); } else { st.hojaError = true; pintarHoja(); } }, 350);
      };
      if (reducido) { st.digitos = digitos; pintarHoja(); luego(validar, 500); return; }
      var pulsa = function (d) {
        var tk = disp.querySelector('[data-tecla="' + d + '"]'); teclear(d);
        if (tk) { tk.classList.add('pp-tecla--on'); luego(function () { tk.classList.remove('pp-tecla--on'); }, Math.min(paso * 0.8, 200)); }
      };
      digitos.split('').forEach(function (d, i) { luego(pulsa.bind(null, d), (i + 1) * paso); });
      luego(validar, digitos.length * paso + 400);
    }

    function leer(caso) {
      caso = reconciliar(caso);
      cancelar();
      st.hoja = null; st.reloj++; st.apoyo = false; st.policia = false; st.hu = null;
      prepararHuella(caso);
      st.caso = caso; st.vista = 'validando';
      activarEnPanel(caso.id);
      SPLASH.flash();
      pintarDispositivo();
      // En obligatoria el verde candidato espera la huella en el paso 6 de la capa; sin referencia o sin lector no hay lectura.
      var m = modoDe(caso), pide = m === 'obligatoria' && caso.color === 'verde' && caso.huella !== 'sinref';
      var lee = pide && lectorListo();
      var paraCapa = lee && caso.huella === 'no' ? Object.assign({}, caso, { color: 'rojo' }) : caso;
      var mostrar = function () {
        if (st.hu && st.hu.final) { presentar(st.hu.final); return; }
        var c = sinLectura(clon(caso), m, pide);
        if (c) { presentar(c); }
      };
      // Cada validación pasa por la capa oculta: 7 pasos de 1 s en Slow motion.
      if (capa) { capa.correr(paraCapa, { evento: E, offline: st.offline, reloj: st.reloj, alCambiar: escalar, huella: m, lector: st.lector, contingencia: st.contingencia, retener: lee ? PASO_HUELLA : -1, alRetener: function () { lectura('obligatoria'); } }, mostrar); } else { luego(mostrar, 450); }
    }

    // DC-099: documento fuera de los casos de puerta, resuelto contra el IVC (las 20 de la demo y cualquier registro de GI); la medida vigente es rojo.
    function copia(id) { return JSON.parse(JSON.stringify(CASOS.filter(function (c) { return c.id === id; })[0])); }
    function rojoMedida(r) { var m = copia('medida'); m.doc = r.docVisible; m.clave = r.clave; m.digitado = true; delete m.nombre; return m; }
    function buscarEnDemo(tipo, num) {
      var r = U.res(tipo, num, 'puerta');
      if (!r) { return null; }
      if (r.bloquea) { return rojoMedida(r); }
      var v = copia('verde'); v.doc = r.docVisible; v.nombre = r.nombreVisible; v.clave = r.clave; v.digitado = true; v.detalle = 'Oriental Baja · Fila E · Silla 18';
      v.registro = 'Entró · documento digitado · Oriental Baja';
      if (r.antecedente) { v.aviso = 'Sanción cumplida'; } else if (r.estado === 'enTramite') { v.aviso = 'Registro en trámite'; }
      return v;
    }
    function claveDe(c) { var m = /^(\S+)\s(.+)$/.exec(c.doc || ''); return c.clave || (m && /\d/.test(m[2]) && m[2].indexOf('•') < 0 ? U.clave(m[1], m[2]) : ''); }

    // Cruza tipo + número contra los casos del demo; sin coincidencia, null. El rojo por medida es solo 71894447 y llega enmascarado (…4447).
    function buscarCaso(tipo, num, digitado) {
      var hit = CASOS.filter(function (c) {
        if (c.id === 'medida') { return U.clave(tipo, num) === c.clave; }
        var m = /^(\S+)\s(.+)$/.exec(c.doc);
        return !!m && m[1] === tipo && m[2].replace(/\D/g, '') === num;
      })[0];
      if (!hit) { return digitado ? buscarEnDemo(tipo, num) : null; }
      var c = JSON.parse(JSON.stringify(hit));
      if (digitado) { c.digitado = true; }
      if (digitado && c.color === 'verde') { c.registro = 'Entró · documento digitado · ' + c.detalle.split(' · ')[0]; }
      return reconciliar(c);
    }

    // El IVC manda: un verde del guion cuyo documento hoy tiene medida vigente pasa a rojo; el rojo de Julián vuelve a verde si el IVC lo levantó.
    function reconciliar(c) {
      var k = claveDe(c), p = k ? U.deClave(k) : null, r = p && U.res(p.tipo, p.num, 'puerta');
      if (!r || c.id === 'huella-medida' || (c.color === 'rojo' && c.id !== 'medida')) { return c; }
      if (c.id === 'medida') {
        if (r.bloquea) { return Object.assign(c, { doc: r.docVisible, clave: r.clave }); }
        var v = copia('verde'); v.id = c.id; v.doc = r.docVisible; v.nombre = r.nombreVisible; v.clave = r.clave; v.digitado = true; v.detalle = 'Oriental Baja · Fila E · Silla 18'; v.registro = 'Entró · documento digitado · Oriental Baja';
        if (r.antecedente) { v.aviso = 'Sanción cumplida'; }
        return v;
      }
      if (c.color === 'verde' && r.bloquea) { var m = rojoMedida(r); m.id = c.id; return m; }
      c.clave = r.clave;
      return c;
    }

    // El operador compara la foto impresa con la persona: si no coincide, rojo operativo sin pasar por el SVN.
    function noEsLaPersona() {
      var np = clon(st.caso);
      np.color = 'rojo'; np.punto = 'rojo'; np.operativo = true; np.prestada = true; np.causa = 'Posible cédula prestada'; np.dato = 'La foto del documento no coincide con la persona';
      delete np.registro;
      presentar(np);
    }

    function onClick(ev) {
      var t = ev.target;
      // Un clic fuera del desplegable lo cierra sin repintar: el clic original sigue su curso.
      if (st.filtroAbierto && !t.closest('.pp-t__sel')) { cerrarMenuFiltro(false); }
      var el = t.closest('[data-grupo],[data-caso],[data-acc],[data-tecla],[data-tipo],[data-cierre],[data-zoom],[data-motivo]');
      if (!el) { return; }
      if (el.dataset.motivo) {
        st.motivo = el.dataset.motivo; pintarDispositivo();
        var campo = disp.querySelector('#motivo-nota'); if (campo) { campo.focus({ preventScroll: true }); }
        return;
      }
      if (el.dataset.zoom) {
        var z = el.dataset.zoom;
        zoom = z === 'in' ? Math.min(2, zoom + 0.15) : z === 'out' ? Math.max(0.5, zoom - 0.15) : 1;
        escalar();
        return;
      }
      if (el.hasAttribute('data-grupo')) { var sec = el.closest('.pp-grupo'); abrirGrupo(sec, !sec.classList.contains('pp-grupo--abierto')); return; }
      if (el.dataset.caso) {
        casoActivo = el.dataset.caso;
        activarEnPanel(casoActivo);
        el.closest('#pp-casos').querySelectorAll('nwt-detail-item').forEach(function (n) { n.classList.toggle('pp-caso--activo', n === el); });
        // Se ve 1 s el estado inicial (lectura) antes de validar, en Tiempo real y en Slow motion (DC-178).
        var elegido = CASOS.filter(function (c) { return c.id === el.dataset.caso; })[0];
        st.hoja = null; aLectura(); luego(function () { if (elegido.digitado) { escribiendo(elegido); } else { leer(elegido); } }, 1000);
        return;
      }
      if (el.dataset.cierre) { st.cierre = el.dataset.cierre; pintarDispositivo(); return; }
      if (el.dataset.tipo) {
        // Sin repintar el equipo: la hoja no debe reanimarse al elegir el tipo.
        st.tipo = el.dataset.tipo; st.hojaError = false;
        disp.querySelectorAll('[data-tipo]').forEach(function (t) { t.setAttribute('aria-checked', String(t.dataset.tipo === st.tipo)); });
        pintarHoja();
        return;
      }
      if (el.dataset.tecla) {
        var k = el.dataset.tecla;
        if (k === 'ok') {
          if (!estadoHoja().puede) { return; }
          var hallado = buscarCaso(st.tipo, st.digitos, true);
          if (!hallado) { st.hojaError = true; pintarHoja(); return; }
          st.digitos = ''; leer(hallado); return;
        }
        teclear(k);
        return;
      }
      switch (el.dataset.acc) {
        case 'salir': ctx.salir(); break;
        case 'digitar': st.hoja = 'digitar'; st.digitos = ''; st.hojaError = false; pintarDispositivo(); break;
        case 'turno': st.hoja = 'turno'; pintarDispositivo(); break;
        case 'cerrar-hoja': cancelar(); st.hoja = null; pintarDispositivo(); break;
        case 'cerrar-toast': st.toast = null; clearTimeout(timerToast); pintarToast(); break;
        case 'menu': st.hoja = 'menu'; pintarDispositivo(); break;
        case 'linterna': alternarCamara(el, 'luz', 'pp-camara--luz'); break;
        case 'zoom': alternarCamara(el, 'zoomCam', 'pp-camara--zoom'); break;
        case 'cerrar-rojo':
          var sig = st.caso; aLectura();
          mostrarToast(sig && sig.operativo ? 'Caso cerrado' : 'Remitido a la autoridad', (sig && sig.causa ? sig.causa + ' · ' : '') + 'Lector listo para la siguiente persona'); break;
        case 'policia': st.policia = true; registrar('rojo', 'Autoridad avisada'); emitir('operativo', st.caso, (st.caso.causa || 'Rojo operativo') + ' · llamó a la autoridad'); mostrarToast('Autoridad avisada', E.puerta + ' · ' + hora(st.reloj), true); break;
        case 'apoyo': st.apoyo = true; registrar('rojo', 'Alteración reportada'); mostrarToast('Apoyo solicitado', 'Autoridad y supervisor avisados · ' + E.puerta + ' · ' + hora(st.reloj), true); break;
        case 'cancelar-scan': registrar('neutro', 'Escaneo cancelado'); aLectura(); break;
        case 'continuar': continuar(); break;
        case 'no-persona':
          // En modo opcional la duda se aclara con la hoja de huella, sin un botón más en el verde.
          if (modoDe(st.caso) === 'opcional' && !st.caso.exc) { st.hoja = 'verificar-huella'; pintarDispositivo(); break; }
          noEsLaPersona();
          break;
        case 'no-entra': st.hoja = null; noEsLaPersona(); break;
        case 'leer-huella': st.hoja = null; lectura('opcional'); break;
        case 'leer-otra': if (st.hu && st.hu.n < 3) { st.hu.n++; st.hu.est = 'leyendo'; pintarDispositivo(); luego(resolverLectura, MS_LECTURA); } break;
        case 'sin-huella': st.motivo = null; st.motivoNota = ''; st.hoja = 'sin-huella'; pintarDispositivo(); break;
        case 'confirmar-sin-huella':
          if (!st.motivo) { break; }
          var mot = st.motivo === MOTIVOS[2] ? 'Otro · ' + st.motivoNota.trim() : st.motivo;
          cerrarHuella(excepcion(st.caso, 'Sin huella · ' + mot, 'Entró · sin huella · ' + mot, modoDe(st.caso) === 'obligatoria' ? 'sin-huella' : null));
          break;
        case 'contingencia':
          st.contingencia = true;
          mostrarToast('Contingencia de huella activa', E.puerta + ' · un solo aviso al PMU · cada ingreso queda marcado', false, 'warning');
          presentar(excepcion(st.caso, 'Sin huella · contingencia', 'Entró · sin huella · contingencia'));
          break;
        case 'cancelar-huella': registrar('neutro', 'Lectura cancelada'); aLectura(); break;
        case 'nueva-alerta':
          st.min++;
          st.alertas.push({ id: 'n' + st.alertas.length, estado: 'nueva', puerta: 'Puerta 3 · Occidental', hora: ahora(), doc: 'CC •••• 3318', causa: 'Medida vigente', origen: 'Lectura en puerta',
            pasos: [{ hora: ahora(), texto: 'Generada en la puerta', quien: 'Op. P. Torres' }] });
          st.pvista = 'tablero'; st.filtro = 'todas'; programarTomaPrimero(); pintarDispositivo(); break;
        case 't-tablero': st.pvista = 'tablero'; programarTomaPrimero(); pintarDispositivo(); break;
        case 't-eventos': st.pvista = 'eventos'; pintarDispositivo(); break;
        // Primer caso de Autoridad: elegir el evento en vivo, filtrado, antes de ver la bandeja de alertas (DC-317).
        case 'elegir-evento': st.pvista = 'eventos'; st.efiltro = 'vivo'; pintarDispositivo(); break;
        case 'e-filtro': st.efiltro = el.dataset.id; pintarDispositivo(); break;
        case 'e-abrir':
          var ev = D.policia.eventos.filter(function (x) { return x.id === el.dataset.id; })[0];
          // Monitor PMU y Auditoría son apps separadas (DC-116): el evento pasado avisa, no salta a la otra app.
          if (ev.estado === 'pasado') { mostrarToast(ev.partido, 'Resumen del evento: ' + window.EVENTOS.datoTexto(ev.dato) + '. El detalle registro a registro está en la app de Auditoría.'); break; }
          if (ev.tablero) { st.pvista = 'tablero'; programarTomaPrimero(); pintarDispositivo(); break; }
          mostrarToast(ev.partido, ev.estado === 'vivo' ? 'En el demo, el tablero está armado para Nacional vs. Medellín.' : 'La preparación del evento (puertas, operadores, medidas cruzadas) llega en la próxima versión.');
          break;
        case 't-filtro-abrir': st.filtroAbierto = !st.filtroAbierto; st.foco = '[data-acc="t-filtro-abrir"]'; pintarDispositivo(); break;
        case 't-filtro': st.filtro = el.dataset.id; st.filtroAbierto = false; st.foco = st.expandido ? '[data-acc="t-filtro"][data-id="' + st.filtro + '"]' : '[data-acc="t-filtro-abrir"]'; pintarDispositivo(); break;
        case 't-expandir': alternarExpandido(); break;
        case 't-ver-todas': st.verTodas = !st.verTodas; st.foco = '[data-acc="t-ver-todas"]'; pintarDispositivo(); break;
        case 't-asignar': abrirModal(st.alertas.filter(function (x) { return x.id === el.dataset.id; })[0]); break;
        case 't-modal-cerrar': st.modal = null; pintarDispositivo(); break;
        case 't-modal-asignar':
          var am = st.alertas.filter(function (x) { return x.id === st.modal.id; })[0];
          var nom = agentesDe(am.puerta).filter(function (g) { return st.modal.sel.indexOf(g.id) >= 0; }).map(function (g) { return g.nombre; });
          if (am.estado !== 'nueva' || !nom.length) { break; }
          st.min++; am.asignados = nom; am.horaAsig = ahora();
          am.pasos.push({ hora: ahora(), texto: 'Asignada a ' + nom.join(', '), quien: 'Pt. R. Gómez (usted)' });
          st.modal = null; programarToma(am);
          mostrarToast('Agentes notificados', nom.join(', ') + ' · ' + am.puerta, true);
          break;
        case 'agente-primero':
          var an = st.alertas.filter(function (x) { return x.estado === 'nueva'; })[0];
          if (!an) { mostrarToast('Sin alertas nuevas', 'Todas ya tienen quien las atienda.'); break; }
          st.pvista = 'tablero'; tomaAgente(an, tomadorDe(an), true); break;
        case 't-perfil':
          // Abrir el perfil es una consulta a datos protegidos: en el producto queda en la auditoría.
          var ap = st.alertas.filter(function (x) { return x.id === el.dataset.id; })[0];
          st.abierta = ap.id; st.alerta = { nueva: 'nueva', atencion: 'tomada', cerrada: 'cerrada' }[ap.estado]; st.cierre = ap.resultado || null;
          st.pvista = 'perfil'; pintarDispositivo(); break;
        case 'cerrar-alerta':
          if (!st.cierre) { return; }
          var ac = abierta();
          if (ac) { st.min++; ac.estado = 'cerrada'; ac.resultado = st.cierre; ac.pasos.push({ hora: ahora(), texto: 'Cerrada · ' + st.cierre, quien: 'Pt. R. Gómez (usted)' }); }
          st.alerta = 'cerrada'; mostrarToast('Alerta cerrada', st.cierre + ' · registrada en la auditoría del PMU', true); break;
      }
    }

    // Consola: Enter avanza y P llama a la autoridad, sin tocar la pantalla.
    function onTecla(ev) {
      if (st.filtroAbierto && ev.key === 'Escape') { cerrarMenuFiltro(true); return; }
      if (st.modal) {
        if (ev.key === 'Escape') { st.modal = null; pintarDispositivo(); return; }
        // Foco atrapado dentro del modal mientras está abierto.
        if (ev.key === 'Tab') {
          var f = Array.prototype.slice.call(disp.querySelectorAll('.pp-modal button:not(:disabled), .pp-modal input:not(:disabled)')); if (!f.length) { return; }
          var ult = f[f.length - 1], pri = f[0];
          if (ev.shiftKey && (document.activeElement === pri || document.activeElement.classList.contains('pp-modal'))) { ev.preventDefault(); ult.focus(); }
          else if (!ev.shiftKey && document.activeElement === ult) { ev.preventDefault(); pri.focus(); }
        }
        return;
      }
      if (st.hoja === 'digitar' && !(ev.target.closest && ev.target.closest('input'))) {
        if (/^\d$/.test(ev.key)) { ev.preventDefault(); teclear(ev.key); }
        else if (ev.key === 'Backspace') { ev.preventDefault(); teclear('⌫'); }
        else if (ev.key === 'Escape') { st.hoja = null; pintarDispositivo(); }
        return;
      }
      // Enter no lee ni confirma una huella: ni en la lectura, ni en las hojas, ni en el verde con excepción.
      if (ev.key === 'Enter' && (st.vista === 'huella' || st.hoja === 'verificar-huella' || st.hoja === 'sin-huella' || (st.vista === 'resultado' && st.caso && st.caso.exc))) { ev.preventDefault(); return; }
      if (st.disp !== 'consola' || st.vista !== 'resultado' || st.hoja || ev.target.closest && ev.target.closest('button')) { return; }
      var b = ev.key === 'Enter' ? disp.querySelector('.pp-r__acciones .pp-r__btn:not(.pp-r__btn--sec)') : (ev.key === 'p' || ev.key === 'P') ? disp.querySelector('[data-acc=policia]') : null;
      if (b && !b.disabled) { ev.preventDefault(); b.click(); }
    }

    // Casillas del modal: se actualiza el estado y el botón sin repintar, para no perder el foco.
    function onChange(ev) {
      var id = ev.target.dataset && ev.target.dataset.agente;
      if (!id || !st.modal) { return; }
      var i = st.modal.sel.indexOf(id);
      if (ev.target.checked && i < 0) { st.modal.sel.push(id); } else if (!ev.target.checked && i >= 0) { st.modal.sel.splice(i, 1); }
      var b = disp.querySelector('[data-acc="t-modal-asignar"]');
      if (b) { var n = st.modal.sel.length; b.disabled = !n; b.textContent = b.textContent.replace(/ · \d+$/, '') + (n ? ' · ' + n : ''); }
    }

    function onSubmit(ev) {
      if (!ev.target.matches('[data-form="lector"]')) { return; }
      ev.preventDefault();
      var v = (disp.querySelector('#lector').value || '').replace(/\D/g, '');
      if (v.length < MIN_DOC) { return; }
      var c = buscarCaso('CC', v, false) || buscarEnDemo('CC', v);
      if (c) { leer(c); } else { mostrarToast('No encontramos ese documento', 'Revise el número e inténtelo de nuevo.', false, 'warning'); }
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' + (modo === 'puerta' ? velocidadControl() : '') + zoomControles() + '</div><div class="pp-dispositivo" id="dispositivo"></div>' +
      (modo === 'puerta' ? window.CAPA.html() : '') + '</div></main></div></div>';
    SPLASH.app(modo === 'policia' ? 'pmu' : 'puerta');
    disp = raiz.querySelector('#dispositivo');
    if (modo === 'puerta') { capa = window.CAPA.crear(raiz.querySelector('.pp-escena')); }

    var tabs = raiz.querySelector('#tabs-disp');
    if (tabs) {
      // El tablero de la autoridad de seguridad es para tablet y escritorio: sin celular.
      tabs.items = modo === 'policia'
        ? [{ id: 'tablet', label: 'Tablet', value: 'tablet' }, { id: 'consola', label: 'Escritorio', value: 'consola' }]
        : [{ id: 'celular', label: 'Celular', value: 'celular' }, { id: 'tablet', label: 'Tablet', value: 'tablet' }, { id: 'consola', label: 'PC', value: 'consola' }];
      tabs.value = st.disp;
      tabs.addEventListener('nwtChange', function (e) { st.disp = e.detail; st.hoja = null; pintarDispositivo(); });
    }
    var velCtrl = raiz.querySelector('#velocidad-ctrl');
    if (velCtrl) {
      velCtrl.addEventListener('click', function (e) {
        var b = e.target.closest('[data-vel]');
        if (!b) { return; }
        velCtrl.querySelectorAll('[data-vel]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        lento = b.dataset.vel === 'slow';
        window.CAPA.setVelocidad(b.dataset.vel);
      });
    }

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('input', onInput);
    raiz.addEventListener('change', onChange);
    raiz.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onTecla);
    window.addEventListener('resize', escalar);
    // Otra pestaña emitió al bus (ev = null): se relee turno y alertas sin pisar lo que el operador tiene abierto.
    function resincronizar() {
      var b = desdeBus();
      st.turno = b.turno; st.historial = b.historial;
      alertasBus().forEach(function (a) { if (!st.alertas.some(function (x) { return x.id === a.id; })) { st.alertas.push(a); } });
      var ocupado = st.hoja || st.modal || st.vista !== 'lectura' || (modo === 'policia' && st.pvista === 'perfil');
      if (!ocupado) { pintarDispositivo(); }
    }
    var bajaBus = U.suscribir(function (ev) { if (!ev) { resincronizar(); } });
    pintarDispositivo();
    requestAnimationFrame(escalar);

    return function () {
      bajaBus();
      cancelar();
      clearTimeout(timerToast);
      clearInterval(timerVivo);
      clearInterval(timerCuenta);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('input', onInput);
      raiz.removeEventListener('change', onChange);
      raiz.removeEventListener('submit', onSubmit);
      document.removeEventListener('keydown', onTecla);
      window.removeEventListener('resize', escalar);
    };
  }

  window.PANTALLAS.puerta = function (raiz, ctx) { return montar(raiz, ctx, 'puerta'); };
  window.PANTALLAS.policia = function (raiz, ctx) { return montar(raiz, ctx, 'policia'); };
})();
