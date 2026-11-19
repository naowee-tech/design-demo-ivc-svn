/* Roles de la fase 1: matriz única. El rol llega por ?rol= (lo pone demo.html) y se recuerda en sessionStorage.
   Criterio de diseño por confirmar con el IVC: quien debe cerrar un flujo puede hacerlo. */
(function (w) {
  var ROLES = {
    profesional: { label: 'Profesional', cargo: 'Profesional del IVC · Mindeporte', user: { name: 'Marcela Ortiz', initials: 'MO' },
      resumen: 'Registra, edita y consulta. Carga masiva. No cierra el registro.',
      puede: ['consultar', 'registrar', 'editar', 'cargar'] },
    coordinador: { label: 'Coordinador', cargo: 'Coordinador del área · Mindeporte', user: { name: 'Camilo Reyes', initials: 'CR' },
      resumen: 'Todo lo del profesional, y cierra: valida o devuelve por subsanar. Edita registros validados, con motivo.',
      puede: ['consultar', 'registrar', 'editar', 'editar_validado', 'cargar', 'validar', 'devolver'] },
    director: { label: 'Director', cargo: 'Director Técnico · Mindeporte', user: { name: 'Lucía Pardo', initials: 'LP' },
      resumen: 'Aprueba: valida o devuelve por subsanar. Consulta. No digita.',
      puede: ['consultar', 'validar', 'devolver'] }
  };
  var DEF = 'coordinador', id = DEF;

  try {
    var q = /[?&]rol=([a-z]+)/.exec(w.location.search);
    id = (q && ROLES[q[1]] && q[1]) || w.sessionStorage.getItem('suid.rol') || DEF;
    if (!ROLES[id]) id = DEF;
    w.sessionStorage.setItem('suid.rol', id);
  } catch (e) { if (!ROLES[id]) id = DEF; }

  w.SUID_ROLES = {
    todos: ROLES,
    actual: function () { return id; },
    info: function () { return ROLES[id]; },
    puede: function (a) { return ROLES[id].puede.indexOf(a) >= 0; }
  };
})(window);
