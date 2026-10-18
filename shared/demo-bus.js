/* Bus de eventos de la demo: lo que ocurre en una app (puerta, venta, consulta) lo leen las demás, incluso en otra pestaña.
   Solo guarda la clave de la persona; el nombre se resuelve al leer, con la privacidad de cada vista. */
(function (w) {
  'use strict';
  var KEY = 'demo.bus.v1', TOPE = 300;

  function leerTodo() { try { var l = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function hora() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return p(d.getHours()) + ':' + p(d.getMinutes()); }
  function disparar(ev) { try { w.dispatchEvent(new w.CustomEvent('demo:bus', { detail: ev })); } catch (e) { /* entorno sin eventos */ } }

  /* Sin hora de escena, sigue la del último evento del bus (18:40 al inicio) para no mezclar con la hora real del equipo. */
  function siguienteEscena(l) {
    var u = l.length ? l[l.length - 1].horaEscena : '', m = /^(\d\d):(\d\d)$/.exec(u || ''), t = m ? (+m[1]) * 60 + (+m[2]) + 1 : 18 * 60 + 40;
    t = Math.min(t, 23 * 60 + 59);
    return ('0' + Math.floor(t / 60)).slice(-2) + ':' + ('0' + (t % 60)).slice(-2);
  }
  function emitir(o) {
    o = o || {};
    var l = leerTodo();
    var ev = { tipo: o.tipo || '', clave: o.clave || '', evento: o.evento || '', puerta: o.puerta == null ? 0 : o.puerta, origen: o.origen == null ? 0 : o.origen,
      detalle: o.detalle || '', quien: o.quien || '', horaEscena: o.horaEscena || siguienteEscena(l), ts: Date.now() };
    l.push(ev);
    if (l.length > TOPE) { l = l.slice(l.length - TOPE); }
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) { /* sin almacenamiento */ }
    disparar(ev);
    return ev;
  }
  /* filtro: objeto de igualdades (p. ej. { evento: 'EV-2026-0412', tipo: 'venta' }) o función. */
  function leer(filtro) {
    var l = leerTodo();
    if (!filtro) { return l; }
    if (typeof filtro === 'function') { return l.filter(filtro); }
    return l.filter(function (ev) { return Object.keys(filtro).every(function (k) { return ev[k] === filtro[k]; }); });
  }
  function suscribir(fn) {
    function ajeno(e) { if (e.key === KEY || !e.key) { fn(null); } } /* otra pestaña: sin detalle, se relee con leer() */
    function propio(e) { fn(e.detail); }
    w.addEventListener('storage', ajeno);
    w.addEventListener('demo:bus', propio);
    return function () {
      w.removeEventListener('storage', ajeno); w.removeEventListener('demo:bus', propio);
    };
  }
  function vaciar() { try { localStorage.removeItem(KEY); } catch (e) { /* sin almacenamiento */ } disparar(null); }

  w.DemoBus = { emitir: emitir, leer: leer, suscribir: suscribir, vaciar: vaciar };
})(window);
