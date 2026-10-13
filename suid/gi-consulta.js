/* Consulta de infractores: ¿esta persona tiene una medida vigente y hasta cuándo? Menores solo por documento completo. */
(function (w, d) {
  'use strict';
  var GI = w.GI, U = GI.util, D = GI.derive, C = GI.cat, UI = w.GIUI, esc = SUID.esc;
  var BASE = UI.BASE, PAGINA = 5, MAX_REC = 30;
  var st = { q: '', cq: '', abiertos: {}, page: 1, sel: '', f: { est: '', tipo: '', ciu: '' }, av: false, a: av0(), pa: av0() }; /* q: lo escrito; cq: lo consultado; abiertos: menores abiertos con motivo; sel: persona elegida */
  var MOTIVOS = ['Verificar una medida vigente antes de permitir el ingreso', 'Requerimiento de una autoridad', 'Trámite de un recurso o una solicitud de la persona', 'Auditoría interna'];
  var CASOS = [{ t: 'Ramírez', q: 'Ramírez' }, { t: '71.894.447', q: '71.894.447' }, { t: 'Menor', q: '1020200003' }];
  var CORTA = ['Armas u objetos peligrosos', 'Estupefacientes', 'Violencia contra la fuerza pública', 'Invasión del terreno de juego', 'No atender a logística', 'Bebidas alcohólicas', 'Agresión física', 'Agresión verbal', 'Daño a infraestructura'];

  /* Búsqueda avanzada: a = criterios aplicados, pa = los del panel sin aplicar; viven solo en la sesión de la vista. */
  function av0() { return { edad: '', nom: '', ape: '', mot: '', est: '', ent: '', impD: '', impH: '', venD: '', venH: '', bloq: false }; }
  function abrev(t) { var m = /\(([^)]+)\)/.exec(t || ''); return m ? m[1] : (t || ''); }
  function dias(n) { return GI.fmtDias ? GI.fmtDias(n) : n + ' días'; }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function sinTildes(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function keyOf(p) { return p.tipo + ':' + p.numId; }
  /* Miles con punto, acumulando desde la derecha; solo si lo escrito es un número (un nombre no se toca). */
  function miles(v) { return /^[\d.\s]*$/.test(v) ? digitos(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : v; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : b); }

  /* Agrupa los registros de la base por persona (tipo + número de documento). */
  function personas() {
    var map = {}, out = [];
    GI.all().forEach(function (r) {
      var key = abrev(r.tipoId) + ':' + r.numId, p = map[key];
      if (!p) { p = map[key] = { tipo: abrev(r.tipoId), numId: r.numId, texto: GI.fmtDoc(r.tipoId, r.numId), nombre: D.nombreCompleto(r), ciudad: r.ciudad || '', menor: false, nombres: r.nombres || '', apellidos: r.apellidos || '', medidas: [] }; out.push(p); }
      if (D.esMenor(r)) p.menor = true;
      var res = D.estadoRestriccion(r), fin = D.finVigencia(r), i0 = r.origen[0];
      p.medidas.push({ id: r.id, orig: r.origen || [], acto: r.numActo, art: (/Art\. \d+/.exec(C.origen[i0]) || [''])[0], corta: CORTA[i0] || '', full: r.origen.map(function (i) { return C.origen[i].replace(/^(\d+\.|[a-c]\) )/, ''); }).join('\n'),
        autoridad: 'Inspección de Policía de ' + (r.ciudadHechos || r.ciudad), ini: r.fechaEjecutoria ? U.addDays(r.fechaEjecutoria, 1) : '', fin: fin, meses: +r.meses || 0, dias: D.diasRestantes(r), href: BASE + '/' + r.id, reg: r.fechaRegistro,
        estado: res === 'Activa' ? 'Vigente' : res === 'Cumplida' ? 'Cumplida' : 'En validación', enTramite: res === 'Inactiva' });
    });
    out.forEach(function (p) { p.res = resumen(p); });
    return out;
  }

  /* Resumen de la persona: si hay una vigente manda la que termina más tarde. */
  function resumen(p) {
    function ult(es) { return p.medidas.filter(function (m) { return m.estado === es; }).sort(function (a, b) { return a.fin < b.fin ? 1 : -1; })[0]; }
    var v = ult('Vigente'), c = ult('Cumplida');
    if (v) return { estado: 'Vigente', rank: 0, fin: v.fin, dias: v.dias, m: v };
    if (c) return { estado: 'Cumplida', rank: 2, fin: c.fin, dias: null, m: c };
    return { estado: 'En validación', rank: 1, fin: '', dias: null, m: p.medidas[0] };
  }
  /* Urgencia: restricciones activas que vencen pronto primero; después en validación y las cumplidas más recientes. */
  function porUrgencia(a, b) {
    var x = a.res, y = b.res;
    if (x.rank !== y.rank) return x.rank - y.rank;
    if (x.rank === 0) return x.dias - y.dias;
    if (x.rank === 2) return x.fin < y.fin ? 1 : x.fin > y.fin ? -1 : 0;
    return a.nombre < b.nombre ? -1 : 1;
  }

  function badge(cls, t) { return '<span class="naowee-badge naowee-badge--' + cls + ' naowee-badge--quiet">' + esc(t) + '</span>'; }
  function estadoBadge(e) { return badge(e === 'Vigente' ? 'negative' : e === 'Cumplida' ? 'positive' : 'neutral', e); }
  function tag(t) { return '<span class="naowee-badge naowee-badge--neutral naowee-badge--quiet">' + esc(t) + '</span>'; }
  function vigencia(r) { return r.estado === 'Vigente' ? dias(r.dias) : r.estado === 'Cumplida' ? 'Terminó el ' + U.fmt(r.fin) : 'Aún sin efecto'; }
  function enmascarar(p) { return p.tipo + ' ••••' + String(p.numId).slice(-4); }
  function cerrado(p) { return p.menor && !st.abiertos[keyOf(p)]; }
  /* Título de tarjeta en dos líneas fijas: apellidos arriba, nombres abajo. */
  function lineas(p) { var c = cerrado(p); return '<span>' + esc(c ? 'Persona' : p.apellidos) + '</span><span>' + esc(c ? 'menor de edad' : p.nombres) + '</span>'; }
  function quien(p) { return p.menor && !st.abiertos[keyOf(p)] ? 'Persona menor de edad' : p.nombre; }

  /* Filtros de apoyo bajo el buscador: acotan Recientes y la búsqueda por nombre; un documento completo los ignora. */
  function filtra(p) { return (!st.f.est || p.res.estado === st.f.est) && (!st.f.tipo || p.tipo === st.f.tipo) && (!st.f.ciu || p.ciudad === st.f.ciu) && filtraAv(p); }

  /* Criterios avanzados (AND). Los de la medida deben cumplirse en una misma medida, no repartidos entre varias. */
  function tokens(v) { return sinTildes(v).split(/\s+/).filter(Boolean); }
  function contiene(txt, v) { var n = sinTildes(txt); return tokens(v).every(function (x) { return n.indexOf(x) >= 0; }); }
  function avAplica() { return st.av && activos(st.a).length > 0; }
  function porNombreAv() { return st.av && !!(st.a.nom.trim() || st.a.ape.trim()); }
  function filtraAv(p) {
    if (!st.av) return true;
    var a = st.a;
    if ((a.edad === 'menor' && !p.menor) || (a.edad === 'adulto' && p.menor)) return false;
    if ((a.nom.trim() && !contiene(p.nombres, a.nom)) || (a.ape.trim() && !contiene(p.apellidos, a.ape))) return false;
    if (!(a.mot || a.est || a.ent || a.impD || a.impH || a.venD || a.venH || a.bloq)) return true;
    return p.medidas.some(function (m) {
      var conFin = m.fin && m.estado !== 'En validación'; /* sin validar, la medida aún no tiene vencimiento efectivo */
      return (a.mot === '' || m.orig.indexOf(+a.mot) >= 0) && (!a.est || m.estado === a.est) && (!a.bloq || m.estado === 'Vigente') && (!a.ent || m.autoridad === a.ent) &&
        (!a.impD || (m.ini && m.ini >= a.impD)) && (!a.impH || (m.ini && m.ini <= a.impH)) &&
        (!a.venD || (conFin && m.fin >= a.venD)) && (!a.venH || (conFin && m.fin <= a.venH));
    });
  }
  function hoyMas(n) { return U.addDays(U.now().fecha, n); }
  function motivoTxt(i) { var t = C.origen[i] || '', art = (/Art\. \d+/.exec(t) || ['Derecho de admisión'])[0]; return art + ' · ' + (CORTA[i] || 'Derecho de admisión'); }
  function rango(d1, d2) { return d1 && d2 ? U.fmt(d1) + ' – ' + U.fmt(d2) : d1 ? 'desde ' + U.fmt(d1) : 'hasta ' + U.fmt(d2); }
  /* Un chip por criterio aplicado; las fechas desde/hasta van juntas en uno solo. */
  function activos(a) {
    var out = [];
    if (a.edad) out.push({ k: 'edad', t: 'Edad: ' + (a.edad === 'menor' ? 'Menor de edad' : 'Adulto') });
    if (a.nom.trim()) out.push({ k: 'nom', t: 'Nombres: ' + a.nom.trim() });
    if (a.ape.trim()) out.push({ k: 'ape', t: 'Apellidos: ' + a.ape.trim() });
    if (a.mot !== '') out.push({ k: 'mot', t: 'Motivo: ' + motivoTxt(+a.mot) });
    if (a.est) out.push({ k: 'est', t: 'Estado de la medida: ' + a.est });
    if (a.ent) out.push({ k: 'ent', t: 'Entidad: ' + a.ent });
    if (a.impD || a.impH) out.push({ k: 'imp', t: 'Impuesta ' + rango(a.impD, a.impH) });
    if (a.venD || a.venH) out.push({ k: 'ven', t: a.venD === U.now().fecha && a.venH === hoyMas(30) ? 'Vencen en los próximos 30 días' : 'Vence ' + rango(a.venD, a.venH) });
    if (a.bloq) out.push({ k: 'bloq', t: 'Solo las que bloquean hoy' });
    return out;
  }

  function buscar(q) {
    var t = q.trim();
    if (!t && avAplica()) {
      var cand = personas().filter(filtra), nom = porNombreAv(); /* nombres o apellidos = búsqueda por nombre: los menores no se listan */
      return { modo: 'avanzada', res: cand.filter(function (p) { return !nom || !p.menor; }).sort(porUrgencia), ocultos: nom ? cand.filter(function (p) { return p.menor; }).length : 0 };
    }
    if (!t) return { modo: 'vacio', res: [] };
    if (/[<>{}[\]\\|^~`$%*=]/.test(t)) return { modo: 'invalido', res: [] };
    var dig = digitos(t), soloNum = /^[\d.\s]+$/.test(t) || /^(cc|ce|ti|pa|ppt|pep|rumv)[\s:.-]*\d/i.test(t);
    var todas = personas();
    if (soloNum) {
      if (dig.length < 6) return { modo: 'corto', res: [] };
      return { modo: 'doc', res: todas.filter(function (p) { return p.numId === dig; }) };
    }
    var nt = sinTildes(t).split(/\s+/).filter(Boolean);
    if (sinTildes(t).replace(/\s/g, '').length < 3) return { modo: 'corto', res: [] };
    var hit = todas.filter(function (p) { var n = sinTildes(p.nombre); return nt.every(function (x) { return n.indexOf(x) >= 0; }); });
    return { modo: 'nombre', res: hit.filter(function (p) { return !p.menor; }).filter(filtra).sort(porUrgencia), ocultos: hit.filter(function (p) { return p.menor && filtraAv(p); }).length };
  }

  /* Modelo del expediente (caso medida): lo que el componente compacto pinta; el menor sin abrir llega reservado. */
  function modeloMedida(p, bloq) {
    var r = p.res, mm = r.m, key = keyOf(p), ab = st.abiertos[key], reg = GI.get(mm.id), vig = r.estado === 'Vigente', cum = r.estado === 'Cumplida', pct = null;
    if (vig && mm.ini && mm.fin) { var tot = (U.parse(mm.fin) - U.parse(mm.ini)) / 86400000; pct = tot > 0 ? Math.max(0, Math.min(100, Math.round(100 - mm.dias * 100 / tot))) : 100; }
    var ev = reg && reg.local ? esc(GI.titulo(reg.local + ' vs. ' + reg.visitante)) : '';
    var m = { caso: 'medida', id: mm.id, nombre: quien(p), menor: p.menor, reservado: bloq, doc: p.tipo + ' ' + p.texto, docDigitos: String(p.numId),
      sub: p.tipo + ' ' + p.texto + (p.ciudad && !bloq ? ' · ' + p.ciudad : '') + (bloq ? '' : ' · ' + plural(p.medidas.length, 'medida', 'medidas')), badges: bloq ? [{ t: 'Menor de edad', tono: 'neu' }] : [], /* abierto: el componente ya rotula al menor */
      estado: { tono: vig ? 'neg' : cum ? 'ok' : 'cau', titulo: vig ? 'Medida vigente · bloquea en todo el país' : r.estado, progreso: vig && !bloq ? pct : undefined, desde: vig && !bloq && mm.ini ? 'Desde ' + U.fmt(mm.ini) + (mm.meses ? ' · ' + mm.meses + ' meses' : '') : undefined,
        lineas: bloq ? [] : [vig ? 'Hasta el <b>' + U.fmt(r.fin) + '</b> · <b>' + esc(dias(r.dias).toLowerCase()) + '</b>' : cum ? 'Terminó el <b>' + U.fmt(r.fin) + '</b>' : '<b>Aún sin efecto</b>'] },
      resumenTitulo: '', resumen: [], movimientos: [], acciones: '' };
    if (bloq) {
      m.acciones = '<button type="button" class="naowee-btn naowee-btn--loud" data-open>Abrir con motivo</button>';
      m.aviso = { tono: 'warn', html: '<strong>Menor de edad · reserva reforzada.</strong> El nombre y el detalle de la medida solo se abren con un motivo, y la apertura queda auditada.' };
      return m;
    }
    m.resumen = [{ k: 'Conducta', v: tag(mm.art || '—') + ' ' + esc(mm.corta || 'Sin conducta registrada') }, { k: 'Acto', v: esc(mm.acto || '—') }]
      .concat(ev ? [{ k: 'Evento', v: ev }, { k: 'Fecha', v: U.fmt(reg.fechaHechos) }].concat(reg.ciudadHechos ? [{ k: 'Lugar', v: esc(GI.titulo(reg.ciudadHechos)) }] : []) : [{ k: 'Autoridad', v: esc(mm.autoridad) }], [{ k: 'Tiempo', v: mm.meses ? mm.meses + ' meses' : '—' }]);
    if (reg) m.movimientos = (reg.historial || []).slice().reverse().map(function (x) {
      return { t: x.de === x.a ? x.a : (x.de ? x.de + ' → ' : '') + x.a, por: x.usuario || 'Sistema', nota: x.nota || '', fecha: U.fmt(x.fecha) + ' ' + x.hora };
    });
    m.persona = { t: 'Persona', kv: [{ k: 'Documento', v: esc(m.doc) }, { k: 'Ciudad', v: esc(p.ciudad || '—') }] };
    m.secciones = [{ t: 'Medida ' + mm.id, kv: m.resumen }];
    m.acciones = '<a class="naowee-btn naowee-btn--loud" href="' + mm.href + '">Ampliar expediente</a>';
    if (p.menor && ab) m.aviso = { tono: 'warn', html: '<strong>Menor de edad · datos abiertos con motivo.</strong> Apertura auditada · ' + esc(ab.motivo) + ' · ' + esc(SUID.user.name) + ' · ' + U.fmt(U.now().fecha) + ' ' + U.now().hora };
    return m;
  }

  /* Expediente de la persona en el panel derecho (DC-060): sobre la lista y el buscador, que no se reemplazan. Cerrar = la X del panel. */
  function esqueleto() {
    function b(w2, h) { return '<span class="sk-b" style="display:block;width:' + w2 + ';height:' + h + 'px;margin-top:12px"></span>'; }
    return '<div class="sk" role="status" aria-live="polite"><span class="sk-sr">Consultando…</span>' + b('64%', 20) + b('100%', 80) + b('100%', 120) + b('100%', 120) + '</div>';
  }
  function panelPersona(p, origen, cargando) {
    var key = keyOf(p), bloq = p.menor && !st.abiertos[key], o, c;
    if (cargando) o = { tag: p.menor ? badge('neutral', 'Menor de edad') : '', titulo: bloq ? 'Persona menor de edad' : quien(p), sub: p.tipo + ' ' + p.texto, cuerpo: esqueleto(), acciones: '', nota: '' };
    else { c = modeloMedida(p, bloq); o = GI.expediente.compacto(c); }
    var propio = o.onPintar;
    o.id = key; o.origen = origen;
    o.onPintar = function (el) {
      if (propio) propio(el);
      var ab = el.querySelector('[data-open]'); if (ab) ab.addEventListener('click', function () { pedir(p); });
    };
    o.onCerrar = function (m) { if (m !== 'api') { st.sel = ''; clearTimeout(tp); } }; /* 'api' = repintado propio, no cierre del usuario */
    GI.panel.abrir(o);
  }
  var tp = 0, pedir = null; /* tp: temporizador del loader del panel; pedir: modal de motivo (vive dentro de open) */

  /* Tabla de personas: encabezado con total, filas clicables y paginador (GI.pager se arma en paint). */
  var pgCfg = null;
  function tabla(cabs, filas) {
    return '<div class="gt-wrap"><table class="gt-table"><thead><tr>' + cabs.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + filas + '</tbody></table></div>';
  }
  function docPersona(p) { return esc(p.menor && !st.abiertos[keyOf(p)] ? enmascarar(p) : p.tipo + ' ' + p.texto); }
  function filaPersona(p, k) {
    var r = p.res;
    return '<tr tabindex="0" data-id="' + esc(k) + '" data-k="sel"><td><strong>' + esc(quien(p)) + '</strong><small>' + docPersona(p) + '</small></td>' +
      '<td>' + plural(p.medidas.length, 'medida', 'medidas') + '</td>' +
      '<td>' + estadoBadge(r.estado) + '<small>' + esc(r.estado === 'Vigente' ? dias(r.dias) + ' · hasta ' + U.fmt(r.fin) : vigencia(r)) + '</small></td></tr>';
  }
  function listaHtml(b) {
    var n = b.res.length, pg = Math.min(Math.max(st.page, 1), Math.ceil(n / PAGINA)), ini = (pg - 1) * PAGINA;
    st.page = pg; pgCfg = { k: 'res', total: n, page: pg, size: PAGINA, label: 'Paginación de resultados' };
    return GI.tablaHead({ id: 'gcRes', titulo: 'Resultados', total: n, fuera: true }) + '<section class="gt-card gc-lista" aria-labelledby="gcResT">' +
      '<p class="gc-count" tabindex="-1">' + plural(n, 'persona encontrada', 'personas encontradas') + ' · de mayor a menor urgencia' + (b.ocultos ? ' · ' + b.ocultos + (b.ocultos === 1 ? ' menor no se lista' : ' menores no se listan') + ' por nombre' : '') + '</p>' +
      tabla(['Persona', 'Medidas', 'Estado'], b.res.slice(ini, ini + PAGINA).map(function (p) { return filaPersona(p, keyOf(p)); }).join('')) +
      '<nav data-pag></nav></section>';
  }

  /* Recientes (DC-430): hasta 30 personas por urgencia en una tabla plana, sin paginador. */
  function agregada(p) { return p.medidas.map(function (m) { return m.reg || ''; }).sort().pop(); }
  function filaReciente(p) {
    var ag = agregada(p);
    return '<tr tabindex="0" data-id="' + esc(keyOf(p)) + '" data-k="sel"><td>' + estadoBadge(p.res.estado) + '</td>' +
      '<td><strong' + (cerrado(p) ? '' : ' title="' + esc(p.nombre) + '"') + '>' + lineas(p) + '</strong></td><td>' + docPersona(p) + '</td>' +
      '<td>' + (ag ? 'Agregado el ' + U.fmt(ag) : 'Sin fecha de registro') + '</td></tr>';
  }
  function recientesHtml() {
    var todos = personas().filter(filtra).sort(porUrgencia).slice(0, MAX_REC);
    return '<div class="gc-headrow">' + GI.tablaHead({ id: 'gcRec', titulo: 'Recientes', total: todos.length, fuera: true }) +
      '<a class="naowee-btn naowee-btn--mute gc-btn" href="' + BASE + '">Ver todos</a></div>' +
      '<section class="gt-card gc-lista" aria-labelledby="gcRecT">' + (todos.length ?
        tabla(['Estado', 'Persona', 'Documento', 'Registro'], todos.map(filaReciente).join('')) : '<p class="gc-count">Ninguna persona coincide con los filtros.</p>') + '</section>';
  }
  var INFO = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg>';

  function vacio(titulo, texto, extra, cls) {
    return '<div class="gc-empty' + (cls ? ' ' + cls : '') + '"' + (cls ? ' role="alert"' : '') + '><strong>' + titulo + '</strong>' + texto + (extra || '') + '</div>';
  }

  /* El expediente vive solo en Gestión: una ruta con parámetro lleva a la ficha de esa persona o, si no existe, a la bandeja. */
  SUID.views['control-acceso/consulta'] = function (view, ctx) {
    var a = ctx.rest && ctx.rest[0];
    if (!a) return open(view, ctx);
    var k = decodeURIComponent(a), p = personas().filter(function (x) { return keyOf(x) === k; })[0];
    location.hash = p ? p.res.m.href : GI.get(k) ? BASE + '/' + k : BASE.replace('infractores', 'consulta');
  };
  var RESET = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 9 8 9"/></svg>';
  /* Switch arriba a la derecha y panel de criterios extra; el panel cerrado no recibe foco (hidden). */
  function avTop() {
    return '<div class="gca-top"><span class="gca-count" id="gcaCount" hidden></span><button type="button" class="gf-sw gca-sw" id="gcaSw" role="switch" aria-checked="' + st.av + '" aria-controls="gcaPanel">' +
      '<i class="gf-sw__trk" aria-hidden="true"><i></i></i><b>Búsqueda avanzada</b></button></div>';
  }
  function campo(id, label, ctrl) { return '<div class="gs-field gca-f"><label class="gs-field__l" for="' + id + '">' + label + '</label>' + ctrl + '</div>'; }
  function pick(id, label) { return '<div class="gs-field gca-f"><span class="gs-field__l" id="' + id + 'L">' + label + '</span><div id="' + id + 'H"></div></div>'; }
  function fecha(id, label, grupo) { return '<label class="gca-date"><span>' + label + '</span><input class="gi-in" type="date" id="' + id + '" aria-label="' + grupo + ' ' + label.toLowerCase() + '"></label>'; }
  function avPanel() {
    return '<div class="gca-panel" id="gcaPanel" role="group" aria-label="Criterios de búsqueda avanzada"' + (st.av ? '' : ' hidden') + '>' +
      '<fieldset class="gca-grp"><legend>Persona</legend>' + pick('gcaEdad', 'Rango de edad') +
      campo('gcaNom', 'Nombres', '<input class="gi-in" id="gcaNom" type="text" autocomplete="off">') +
      campo('gcaApe', 'Apellidos', '<input class="gi-in" id="gcaApe" type="text" autocomplete="off">') + '</fieldset>' +
      '<fieldset class="gca-grp"><legend>Medida</legend>' + pick('gcaMot', 'Motivo') + pick('gcaEst', 'Estado de la medida') + pick('gcaEnt', 'Entidad que la impuso') +
      '<label class="gca-check"><input type="checkbox" id="gcaBloq"><span>Solo las que bloquean hoy</span></label></fieldset>' +
      '<fieldset class="gca-grp"><legend>Fechas</legend><div class="gs-field gca-f"><span class="gs-field__l">Impuesta</span><div class="gca-rango">' + fecha('gcaImpD', 'Desde', 'Impuesta') + fecha('gcaImpH', 'Hasta', 'Impuesta') + '</div></div>' +
      '<div class="gs-field gca-f"><span class="gs-field__l">Vence</span><div class="gca-rango">' + fecha('gcaVenD', 'Desde', 'Vence') + fecha('gcaVenH', 'Hasta', 'Vence') + '</div></div>' +
      '<button type="button" class="gc-mchip gca-atajo" id="gcaV30">Vencen en 30 días</button></fieldset></div>';
  }
  function opts(arr, todas) { return [{ v: '', n: todas, av: '', tag: '' }].concat(arr.map(function (x) { return { v: x, n: x, av: '', tag: '' }; })); }
  function open(view, ctx) {
    st.q = st.cq;
    ctx.crumbs = [{ label: 'Inicio', href: '#/' }, { label: 'Control de acceso' }, { label: 'Búsqueda avanzada' }];
    view.innerHTML = '<div class="page-inner gi-page gc-page">' +
      '<header class="gi-head"><div class="page-title-block"><h1 class="page-title">Consulta de infractores</h1>' +
      '<p class="page-subtitle">Verifica si una persona tiene una medida vigente y hasta cuándo.</p></div>' +
      '<button type="button" class="gt-info gc-info" id="gcInfo" aria-label="Cómo buscar" aria-describedby="gcTip" aria-expanded="false">' + INFO + '</button></header>' +
      '<div class="gc-veil" id="gcVeil" aria-hidden="true"></div><section class="gc-card' + (st.av ? ' gca-on' : '') + '">' + avTop() + '<div class="gc-card__hd">' + UI.svg('search').replace('<svg', '<svg width="40" height="40"') + '<div class="gc-card__tx"><h2 class="gc-card__t">Búsqueda de infractores</h2>' +
      '<p class="gc-card__s">Escribe el documento completo (mínimo 6 dígitos) o al menos tres letras del nombre.</p></div></div><form class="gc-form" id="gcForm" role="search">' +
      '<div class="gc-field">' + UI.svg('search') + '<input id="gcQ" type="search" autocomplete="off" aria-label="Documento completo o nombre" placeholder="Documento o nombre" value="' + esc(miles(st.cq)) + '">' +
      '<div class="gc-try"><div class="gc-try__list" id="gcTryList" role="group" aria-label="Casos de ejemplo" hidden>' +
      CASOS.map(function (c) { return '<button type="button" class="gc-case" data-q="' + esc(c.q) + '"><span>' + esc(c.t) + '</span></button>'; }).join('') + '</div>' +
      '<button type="button" class="gc-try__btn" id="gcTryBtn" aria-expanded="false" aria-controls="gcTryList" aria-label="Probar con un caso de ejemplo" title="Casos de ejemplo">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div></div>' +
      '<div class="gc-fh" id="gcFEst"></div><div class="gc-fh" id="gcFTipo"></div><div class="gc-fh" id="gcFCiu"></div>' +
      '<button type="submit" class="naowee-btn naowee-btn--loud gc-btn gc-btn--q" id="gcGo">Consultar</button>' +
      '<button type="button" class="gs-reset gc-reset" id="gcFReset" aria-label="Reiniciar filtros" title="Reiniciar filtros">' + RESET + '</button>' + avPanel() + '</form>' +
      '<div class="gca-chips" id="gcaChips" role="group" aria-label="Criterios aplicados" hidden></div>' +
      '<div class="gt-tip" role="tooltip" id="gcTip" hidden><strong>Cómo buscar</strong><p>Por documento, escríbelo completo (mínimo 6 dígitos).</p><p>Por nombre, escribe al menos tres letras.</p>' +
      '<p>Los menores de edad no aparecen al buscar por nombre: solo se consultan por documento completo y con un motivo.</p></div>' +
      '</section>' +
            '<div id="gcOut" class="gc-out" aria-live="polite"></div></div>';
    var inp = d.getElementById('gcQ'), out = d.getElementById('gcOut'), form = d.getElementById('gcForm'), go = d.getElementById('gcGo'), tbtn = d.getElementById('gcTryBtn'), tlist = d.getElementById('gcTryList');

    var veil = d.getElementById('gcVeil'), vcard = veil.nextElementSibling, vsc = view.closest('.main-scroll');
    function velo() {
      if (!d.getElementById('gcVeil')) return vsc && vsc.removeEventListener('scroll', velo), w.removeEventListener('resize', velo);
      var sr = vsc.getBoundingClientRect(), cr = vcard.getBoundingClientRect(), pr = veil.getBoundingClientRect(); /* a su caja, no a la del padre: en móvil este trae 14 px de relleno */
      veil.style.setProperty('--gc-vx', (sr.left - pr.left) + 'px');
      veil.style.setProperty('--gc-vw', vsc.clientWidth + 'px');
      veil.style.setProperty('--gc-vh', (cr.bottom - sr.top) + 'px');
      veil.classList.toggle('is-stuck', !vcard.classList.contains('gca-on') && vsc.scrollTop > 0 && cr.top - sr.top <= 17);
    }
    if (vsc) { vsc.addEventListener('scroll', velo, { passive: true }); w.addEventListener('resize', velo); velo(); }

    var pend = Object.assign({}, st.f); /* los filtros se aplican al pulsar Consultar */
    function filtros() {
      var all = personas(), ciu = all.map(function (p) { return p.ciudad; }).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).sort(function (a, b) { return a.localeCompare(b, 'es'); }),
        tipos = all.map(function (p) { return p.tipo; }).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).sort();
      function pick(host, id, label, pre, k, items) {
        GI.selectGrafico({ host: d.getElementById(host), id: id, label: label, prefijo: pre, value: pend[k], items: items, onPick: function (v) { pend[k] = v; } });
      }
      pick('gcFEst', 'gcSEst', 'Filtrar por estado de la medida', 'Estado', 'est', opts(['Vigente', 'Cumplida', 'En validación'], 'Todos'));
      pick('gcFTipo', 'gcSTipo', 'Filtrar por tipo de documento', 'Tipo', 'tipo', opts(tipos, 'Todos'));
      pick('gcFCiu', 'gcSCiu', 'Filtrar por ciudad', 'Ciudad', 'ciu', opts(ciu, 'Todas'));
    }
    d.getElementById('gcFReset').addEventListener('click', function () { pend = { est: '', tipo: '', ciu: '' }; st.f = Object.assign({}, pend); limpiarAv(); st.page = 1; filtros(); paint(false); });
    function paint(enfoque) {
      var b, html = '', det = null;
      pgCfg = null;
      try { b = buscar(st.cq); } catch (e) { b = { modo: 'error', res: [] }; }
      if (b.modo === 'vacio') html = recientesHtml();
      else if (b.modo === 'avanzada' && !b.res.length) html = vacio('Ninguna persona coincide con los criterios', 'Quita o ajusta algún criterio para ampliar la búsqueda.' +
        (b.ocultos ? ' Hay ' + b.ocultos + (b.ocultos === 1 ? ' registro reservado' : ' registros reservados') + ' de menores: consúltalos por documento completo.' : ''));
      else if (b.modo === 'error') html = vacio('No pudimos completar la consulta', 'Hubo un problema al leer la información. Intenta de nuevo.', '<button type="button" class="naowee-btn naowee-btn--loud gc-btn" data-retry>Reintentar</button>', 'gc-empty--error');
      else if (b.modo === 'invalido') html = vacio('Hay caracteres que no se pueden buscar', 'Usa solo letras, números, puntos y guiones.', '', 'gc-empty--error');
      else if (b.modo === 'corto') html = vacio('Falta información para buscar', 'El documento debe ir completo (mínimo 6 dígitos) y el nombre, con al menos tres letras.');
      else if (!b.res.length && b.modo === 'nombre' && avAplica()) html = vacio('Ninguna persona coincide con los criterios', 'Quita o ajusta algún criterio, o revisa el nombre escrito.' +
        (b.ocultos ? ' Hay ' + b.ocultos + (b.ocultos === 1 ? ' registro reservado' : ' registros reservados') + ' de menores: consúltalos por documento completo.' : ''));
      else if (!b.res.length) html = vacio('Sin medidas registradas', (b.modo === 'doc' ? 'No hay medidas para ese documento.' : 'No hay coincidencias por nombre.') +
        (b.ocultos ? ' Hay ' + b.ocultos + (b.ocultos === 1 ? ' registro reservado' : ' registros reservados') + ' de menores: consúltalos por documento completo.' : ''));
      else {
        html = listaHtml(b);
        if (b.ocultos) html += '<p class="gc-count">Hay ' + b.ocultos + (b.ocultos === 1 ? ' registro reservado' : ' registros reservados') + ' de menores: consúltalos por documento completo.</p>';
      }
      if (b.modo === 'doc' && chipsDe().length) html = '<p class="gca-nota">La búsqueda por documento completo no aplica los filtros ni los criterios.</p>' + html;
      chips();
      if (st.sel) det = personas().filter(function (p) { return keyOf(p) === st.sel; })[0] || null;
      out.innerHTML = html;
      if (pgCfg) { var c = pgCfg; c.onPage = function (p) { st.page = p; paint(false); var k = out.querySelector('.gt-pag [aria-current]'); if (k) k.focus(); }; ligaPag(); }
      if (det) { clearTimeout(tp); panelPersona(det); GI.panel.sincronizar(); }
      else { st.sel = ''; if (GI.panel.abierto()) GI.panel.cerrar('api'); }
      var el = enfoque && !det && out.querySelector('.gc-count'); if (el) el.focus();
      var rt = out.querySelector('[data-retry]');
      if (rt) rt.addEventListener('click', function () { paint(true); });
    }

    filtros();
    /* El paginador se vuelve a armar tras repintar o restaurar el HTML guardado (los eventos no sobreviven a innerHTML). */
    function ligaPag() { var nav = out.querySelector('[data-pag]'); if (nav && pgCfg) GI.pager(nav, pgCfg); }

    /* Elegir una fila abre el panel derecho con su loader de 1 s; la lista y el buscador quedan debajo (DC-061). */
    GI.filasClicables(out, function (id, tr) {
      var p = personas().filter(function (x) { return keyOf(x) === id; })[0]; if (!p) return;
      clearTimeout(tp); st.sel = id; panelPersona(p, tr, true); GI.panel.sincronizar();
      tp = setTimeout(function () { if (st.sel === id && out.isConnected) { panelPersona(p); GI.panel.sincronizar(); } }, ESPERA);
    });

    /* La consulta tarda 1 s fijo: el loader ocupa el lugar de los resultados (tabla o ficha). Sin datos válidos responde al instante. */
    var ESPERA = 1000, tm = 0, salvado = '', prev = null;
    /* Estado previo a la consulta: si se cancela al escribir, el HTML restaurado y el estado vuelven juntos. */
    function snap() { if (!tm) prev = { cq: st.cq, page: st.page, sel: st.sel }; }
    function ocupado(si) {
      form.setAttribute('aria-busy', String(si)); form.classList.toggle('is-busy', si);
      go.textContent = si ? 'Consultando…' : 'Consultar';
    }
    function detener() {
      if (!tm) return;
      clearTimeout(tm); tm = 0; ocupado(false); out.removeAttribute('aria-busy'); out.innerHTML = salvado; ligaPag();
    }
    function cargar(forma, fin) {
      clearTimeout(tm);
      if (!tm) { salvado = out.innerHTML; }
      ocupado(true); out.setAttribute('aria-busy', 'true');
      out.innerHTML = SUID.load.fragmento(forma);
      tm = setTimeout(function () {
        tm = 0; if (!out.isConnected) return;
        ocupado(false); out.removeAttribute('aria-busy'); fin();
      }, ESPERA);
    }
    function consultar(q, enfoque) {
      snap();
      clearTimeout(tp); if (GI.panel.abierto()) GI.panel.cerrar('api');
      inp.value = miles(q); st.q = st.cq = q; st.page = 1; st.sel = '';
      var b; try { b = buscar(q); } catch (e) { b = { modo: 'error', res: [] }; }
      if (b.modo === 'corto' || b.modo === 'invalido') { detener(); paint(enfoque); return; }
      if (out.contains(d.activeElement)) inp.focus({ preventScroll: true }); /* el reciente pulsado desaparece mientras se consulta */
      cargar('resultados', function () { if (b.res.length === 1) st.sel = keyOf(b.res[0]); paint(enfoque); });
    }

    /* Tooltip de «Cómo buscar» (DC-298): mismo patrón del ⓘ de los insights; hover/foco lo muestran, el clic lo fija y Esc lo cierra. */
    var ibtn = d.getElementById('gcInfo'), itip = d.getElementById('gcTip');
    function infoOff() { itip.hidden = true; ibtn.setAttribute('aria-expanded', 'false'); ibtn.removeAttribute('data-pin'); }
    function infoOn() {
      itip.hidden = false; ibtn.setAttribute('aria-expanded', 'true');
      var r = ibtn.getBoundingClientRect(), tw = itip.offsetWidth, th = itip.offsetHeight, top = r.bottom + 4;
      if (top + th > w.innerHeight - 8) top = Math.max(8, r.top - th - 4);
      itip.style.left = Math.max(8, Math.min(r.right - tw, w.innerWidth - tw - 8)) + 'px'; itip.style.top = top + 'px';
    }
    ibtn.addEventListener('mouseenter', infoOn);
    ibtn.addEventListener('mouseleave', function () { if (!ibtn.hasAttribute('data-pin')) infoOff(); });
    ibtn.addEventListener('focus', infoOn);
    ibtn.addEventListener('blur', function () { if (!ibtn.hasAttribute('data-pin')) infoOff(); });
    ibtn.addEventListener('click', function (e) { e.stopPropagation(); if (ibtn.hasAttribute('data-pin')) infoOff(); else { infoOn(); ibtn.setAttribute('data-pin', '1'); } });
    d.addEventListener('keydown', function esc1(e) {
      if (!d.getElementById('gcInfo')) return d.removeEventListener('keydown', esc1);
      if (e.key === 'Escape' && !itip.hidden) { infoOff(); ibtn.focus(); }
    });
    d.addEventListener('click', function fuera1(e) {
      if (!d.getElementById('gcInfo')) return d.removeEventListener('click', fuera1);
      if (!itip.hidden && !e.target.closest('#gcTip')) infoOff();
    });
    w.addEventListener('resize', infoOff);

    function pedirMotivo(p) {
      var mot = '';
      var m = UI.modal({ title: 'Abrir datos de un menor', sub: p.tipo + ' ' + p.texto,
        body: '<p class="gi-p">Estos datos tienen reserva reforzada. Indica para qué los necesitas; la apertura queda registrada con tu usuario, la fecha y la hora.</p>' +
          '<div class="gs-field"><span class="gs-field__l gs-field__l--req" id="gcMotL">Motivo (puedes elegir varios)</span>' +
          '<div class="gc-mchips" id="gcMot" role="group" aria-labelledby="gcMotL">' + MOTIVOS.map(function (x) { return '<button type="button" class="gc-mchip" aria-pressed="false">' + esc(x) + '</button>'; }).join('') + '</div></div>' +
          '<p class="gi-err" id="gcErr" hidden>Selecciona al menos un motivo para continuar.</p>',
        footer: '<button class="naowee-btn naowee-btn--mute" data-x>Cancelar</button><button class="naowee-btn naowee-btn--loud" id="gcOk">Abrir datos</button>' });
      m.el.querySelector('#gcMot').addEventListener('click', function (e) {
        var b = e.target.closest('.gc-mchip'); if (!b) return;
        b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
        mot = [].map.call(m.el.querySelectorAll('.gc-mchip[aria-pressed="true"]'), function (x) { return x.textContent; }).join(' · ');
        if (mot) m.el.querySelector('#gcErr').hidden = true;
      });
      m.el.querySelector('#gcOk').addEventListener('click', function () {
        if (!mot) { m.el.querySelector('#gcErr').hidden = false; return; }
        st.abiertos[keyOf(p)] = { motivo: mot };
        m.close(); UI.toast('Apertura registrada en la auditoría.'); paint(true);
      });
    }
    pedir = pedirMotivo;

    /* Casos de ejemplo: «+» dentro del input; al abrir salen a su izquierda como badges negros. */
    function ejemplos(abrir) {
      tlist.hidden = !abrir; tbtn.setAttribute('aria-expanded', String(abrir)); tbtn.classList.toggle('is-open', abrir);
    }
    tbtn.addEventListener('click', function (e) {
      ejemplos(tlist.hidden);
      if (!tlist.hidden && e.detail === 0) tlist.querySelector('.gc-case').focus(); /* con teclado la lista queda antes del «+»: el foco entra a ella */
    });
    d.getElementById('gcForm').addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !tlist.hidden) { e.preventDefault(); ejemplos(false); tbtn.focus(); }
    });
    tlist.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q]');
      if (!b) return;
      /* DC-419: un caso de ejemplo promete su resultado; un filtro puesto antes (o pendiente) lo dejaría vacío o distinto. */
      pend = { est: '', tipo: '', ciu: '' }; st.f = Object.assign({}, pend); limpiarAv(); filtros();
      ejemplos(false); consultar(b.getAttribute('data-q'), false); inp.focus();
    });
    d.addEventListener('click', function fuera(e) {
      if (!d.getElementById('gcTryBtn')) return d.removeEventListener('click', fuera);
      if (!tlist.hidden && !e.target.closest('.gc-try')) ejemplos(false);
    });

    d.getElementById('gcForm').addEventListener('submit', function (e) { e.preventDefault(); st.f = Object.assign({}, pend); st.a = st.av ? Object.assign({}, st.pa) : av0(); st.page = 1; ejemplos(false); consultar(inp.value, true); });
    /* Escribir no consulta: cancela la que corre y, con el campo vacío, vuelve a Recientes. */
    inp.addEventListener('input', function () {
      var pos = inp.selectionStart, antes = digitos(inp.value.slice(0, pos == null ? 0 : pos)).length, f = miles(inp.value);
      if (f !== inp.value) {
        inp.value = f;
        if (pos != null && d.activeElement === inp) { var k = 0, n = 0; while (k < f.length && n < antes) { if (/\d/.test(f[k])) n++; k++; } inp.setSelectionRange(k, k); }
      }
      st.q = inp.value;
      if (tm && prev) { st.cq = prev.cq; st.page = prev.page; st.sel = prev.sel; }
      detener();
      if (!st.q.trim() && st.cq) { st.cq = ''; st.page = 1; st.sel = ''; paint(false); }
    });

    /* ── Búsqueda avanzada ── */
    var sw = d.getElementById('gcaSw'), panel = d.getElementById('gcaPanel'), chipsEl = d.getElementById('gcaChips'), cuenta = d.getElementById('gcaCount');
    var FECHAS = { gcaImpD: 'impD', gcaImpH: 'impH', gcaVenD: 'venD', gcaVenH: 'venH' };
    function limpiarAv() { st.a = av0(); st.pa = av0(); pintaAv(); }
    function pintaAv() {
      var todas = personas(), ent = [];
      todas.forEach(function (p) { p.medidas.forEach(function (m) { if (ent.indexOf(m.autoridad) < 0) ent.push(m.autoridad); }); });
      ent.sort(function (a, b) { return a.localeCompare(b, 'es'); });
      function sel(id, label, k, items) { GI.selectGrafico({ host: d.getElementById(id + 'H'), id: id, label: label, campo: true, value: st.pa[k], items: items, onPick: function (v) { st.pa[k] = v; } }); }
      sel('gcaEdad', 'Rango de edad', 'edad', [{ v: '', n: 'Todas', av: '' }, { v: 'adulto', n: 'Adulto', av: '' }, { v: 'menor', n: 'Menor de edad', av: '' }]);
      sel('gcaMot', 'Motivo', 'mot', [{ v: '', n: 'Todos', av: '' }].concat(C.origen.map(function (x, i) { return { v: String(i), n: motivoTxt(i), av: '' }; })));
      sel('gcaEst', 'Estado de la medida', 'est', opts(['Vigente', 'Cumplida', 'En validación'], 'Todos'));
      sel('gcaEnt', 'Entidad que la impuso', 'ent', opts(ent, 'Todas'));
      d.getElementById('gcaNom').value = st.pa.nom; d.getElementById('gcaApe').value = st.pa.ape; d.getElementById('gcaBloq').checked = st.pa.bloq;
      Object.keys(FECHAS).forEach(function (id) { d.getElementById(id).value = st.pa[FECHAS[id]]; });
      topes();
    }
    /* «Hasta» no puede quedar antes de «Desde». */
    function topes() {
      d.getElementById('gcaImpH').min = st.pa.impD; d.getElementById('gcaImpD').max = st.pa.impH;
      d.getElementById('gcaVenH').min = st.pa.venD; d.getElementById('gcaVenD').max = st.pa.venH;
    }
    panel.addEventListener('input', function (e) {
      var t = e.target;
      if (t.id === 'gcaNom') st.pa.nom = t.value; else if (t.id === 'gcaApe') st.pa.ape = t.value;
      else if (FECHAS[t.id]) { st.pa[FECHAS[t.id]] = t.value; topes(); }
    });
    d.getElementById('gcaBloq').addEventListener('change', function (e) { st.pa.bloq = e.target.checked; });
    d.getElementById('gcaV30').addEventListener('click', function () {
      st.pa.venD = U.now().fecha; st.pa.venH = hoyMas(30);
      d.getElementById('gcaVenD').value = st.pa.venD; d.getElementById('gcaVenH').value = st.pa.venH; topes();
    });
    sw.addEventListener('click', function () {
      st.av = !st.av; sw.setAttribute('aria-checked', String(st.av)); panel.hidden = !st.av; vcard.classList.toggle('gca-on', st.av);
      if (!st.av) { var habia = activos(st.a).length; limpiarAv(); if (habia) { st.page = 1; paint(false); } else chips(); } /* apagado = búsqueda de siempre */
      if (vsc) velo();
    });

    function chipsDe() {
      var out = [], LB = { est: 'Estado', tipo: 'Tipo', ciu: 'Ciudad' };
      ['est', 'tipo', 'ciu'].forEach(function (k) { if (st.f[k]) out.push({ k: 'f:' + k, t: LB[k] + ': ' + st.f[k] }); });
      return out.concat(st.av ? activos(st.a) : []);
    }
    function chips() {
      var cs = chipsDe(), n = st.av ? activos(st.a).length : 0;
      cuenta.hidden = !n; cuenta.textContent = plural(n, 'criterio', 'criterios');
      chipsEl.hidden = !cs.length;
      chipsEl.innerHTML = cs.map(function (c) {
        return '<span class="gca-chip"><span title="' + esc(c.t) + '">' + esc(c.t) + '</span><button type="button" class="gca-chip__x" data-quitar="' + c.k + '" aria-label="Quitar ' + esc(c.t) + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>';
      }).join('') + (cs.length ? '<button type="button" class="gca-clear" data-limpiar>Limpiar todo</button>' : '');
      if (vsc) velo();
    }
    chipsEl.addEventListener('click', function (e) {
      var x = e.target.closest('[data-quitar]'), todo = e.target.closest('[data-limpiar]');
      if (!x && !todo) return;
      if (todo) { pend = { est: '', tipo: '', ciu: '' }; st.f = Object.assign({}, pend); limpiarAv(); filtros(); st.page = 1; paint(false); inp.focus(); return; }
      var k = x.getAttribute('data-quitar'), i = [].indexOf.call(chipsEl.querySelectorAll('[data-quitar]'), x), z = av0();
      if (k.indexOf('f:') === 0) { k = k.slice(2); pend[k] = ''; st.f[k] = ''; filtros(); }
      else if (k === 'imp' || k === 'ven') { st.a[k + 'D'] = st.pa[k + 'D'] = ''; st.a[k + 'H'] = st.pa[k + 'H'] = ''; pintaAv(); }
      else { st.a[k] = st.pa[k] = z[k]; pintaAv(); }
      st.page = 1; paint(false);
      var bs = chipsEl.querySelectorAll('[data-quitar]'), sig = bs[Math.min(i, bs.length - 1)] || chipsEl.querySelector('[data-limpiar]'); /* el foco no cae al body */
      (sig || inp).focus();
    });
    pintaAv();
    paint(false);
  }

})(window, document);
