/* Datos ficticios del backoffice de eventos. Fechas y horas alineadas con el Monitor PMU del SVN. */
window.EV_DATOS = {
  backoffice: {
    hoy: '2026-09-28',
    usuario: { nombre: 'Laura Cárdenas Mejía', cargo: 'Organizadora' },
    competencias: ['Liga profesional 2026-II', 'Torneo de ascenso 2026-II', 'Copa nacional 2026'],
    // Restricciones vigentes por sector (id del sector: norte, occ, ori, sur). `tope` es el aforo máximo de un sector limitado.
    escenarios: [
      { id: 'atanasio', nombre: 'Estadio Atanasio Girardot', ciudad: 'Medellín', aforo: '38.000', foto: 'img/estadios/atanasio.jpg', eventos: 3,
        restricciones: [
          { sector: 'occ', estado: 'sancionado', motivo: 'Sanción del IVC · Resolución 0412 de 2026', hasta: 'Hasta nueva orden' },
          { sector: 'ori', estado: 'limitado', tope: 7080, motivo: 'Obras en las graderías', hasta: '30 nov 2026' }
        ] },
      { id: 'metropolitano', nombre: 'Estadio Metropolitano', ciudad: 'Barranquilla', aforo: '46.692', foto: 'img/estadios/metropolitano.jpg', eventos: 1, restricciones: [] },
      { id: 'campin', nombre: 'Estadio El Campín', ciudad: 'Bogotá', aforo: '36.343', foto: 'img/estadios/campin.jpg', eventos: 2,
        restricciones: [{ sector: 'sur', estado: 'limitado', tope: 5950, motivo: 'Obras de accesibilidad', hasta: '15 dic 2026' }] },
      { id: 'pascual-guerrero', nombre: 'Estadio Pascual Guerrero', ciudad: 'Cali', aforo: '35.405', foto: 'img/estadios/pascual-guerrero.jpg', eventos: 1, restricciones: [] },
      { id: 'jaime-moron', nombre: 'Estadio Jaime Morón', ciudad: 'Cartagena', aforo: '16.068', foto: 'img/estadios/jaime-moron.jpg', eventos: 1, restricciones: [] },
      { id: 'palogrande', nombre: 'Estadio Palogrande', ciudad: 'Manizales', aforo: '31.611', eventos: 0, restricciones: [] }
    ],
    // Soportes que pide el IVC para revisar un escenario nuevo (la carga es simulada). `obligatorio`: sin él no se envía a revisión.
    documentosEscenario: [
      { id: 'existencia', nombre: 'Certificado de existencia y representación legal', detalle: 'Cámara de Comercio, con vigencia no mayor a 30 días. Aplica si lo administra una empresa.', obligatorio: true, archivo: 'certificado-existencia.pdf', peso: '412 KB' },
      { id: 'rut', nombre: 'RUT del administrador', detalle: 'Registro Único Tributario actualizado.', obligatorio: true, archivo: 'rut-administrador.pdf', peso: '186 KB' },
      { id: 'estructural', nombre: 'Concepto técnico de estabilidad estructural', detalle: 'Firmado por un ingeniero estructural con matrícula profesional vigente.', obligatorio: true, archivo: 'concepto-estructural.pdf', peso: '3,4 MB' },
      { id: 'bomberos', nombre: 'Concepto de seguridad humana y contra incendios', detalle: 'Expedido por el cuerpo oficial de bomberos de la ciudad.', obligatorio: true, archivo: 'concepto-bomberos.pdf', peso: '1,1 MB' },
      { id: 'emergencia', nombre: 'Plan de emergencia y contingencia', detalle: 'Evacuación, atención de primeros auxilios y puntos de encuentro.', obligatorio: true, archivo: 'plan-emergencia.pdf', peso: '2,8 MB' },
      { id: 'poliza', nombre: 'Póliza de responsabilidad civil extracontractual', detalle: 'Vigente durante todo el calendario de eventos.', obligatorio: true, archivo: 'poliza-rce.pdf', peso: '640 KB' },
      { id: 'comision', nombre: 'Acta de la Comisión Local de Seguridad, Comodidad y Convivencia', detalle: 'Solo si el escenario recibe partidos de fútbol profesional.', obligatorio: false, archivo: 'acta-comision-local.pdf', peso: '298 KB' },
      { id: 'accesibilidad', nombre: 'Certificación de accesibilidad', detalle: 'Rutas, rampas y sillas para personas con discapacidad.', obligatorio: false, archivo: 'certificacion-accesibilidad.pdf', peso: '905 KB' }
    ],
    // Escenarios de ejemplo con los que «Siguiente» completa el asistente de agregar escenario.
    escenariosEjemplo: [
      { nombre: 'Estadio Hernán Ramírez Villegas', ciudad: 'Pereira', aforo: '30.297' },
      { nombre: 'Estadio Departamental Libertad', ciudad: 'Pasto', aforo: '20.665' },
      { nombre: 'Estadio Alfonso López', ciudad: 'Bucaramanga', aforo: '28.000' },
      { nombre: 'Estadio Centenario', ciudad: 'Armenia', aforo: '20.000' }
    ],
    // Identidad de cada club para la lista: sin `escudo` se pinta la sigla sobre su color.
    equipos: {
      'Nacional': { sigla: 'NAC', color: '#0b7a3e', escudo: 'img/escudos/nacional.png' },
      'Medellín': { sigla: 'DIM', color: '#c8102e', escudo: 'img/escudos/medellin.png' },
      'Junior': { sigla: 'JUN', color: '#d2122e' },
      'Santa Fe': { sigla: 'SFE', color: '#b5121b' },
      'Millonarios': { sigla: 'MIL', color: '#003da5' },
      'América': { sigla: 'AME', color: '#c8102e' },
      'Once Caldas': { sigla: 'ONC', color: '#1d1d1b' },
      'Tolima': { sigla: 'TOL', color: '#7a1631' },
      'Real Cartagena': { sigla: 'RCA', color: '#00843d' },
      'Unión Magdalena': { sigla: 'UNI', color: '#0033a0' }
    },
    // Base física del escenario: cada evento la toma y la ajusta en su configuración.
    escenario: {
      nombre: 'Estadio Atanasio Girardot', ciudad: 'Medellín', modificado: '26 sep 2026, 10:14 · J. Restrepo',
      sectores: [
        { id: 'norte', nombre: 'Norte', tipo: 'libre', aforo: 8500, filas: '' },
        { id: 'occ', nombre: 'Occidental', tipo: 'num', aforo: 9200, filas: 'Filas A a T' },
        { id: 'ori', nombre: 'Oriental', tipo: 'num', aforo: 11800, filas: 'Filas A a Y' },
        { id: 'sur', nombre: 'Sur', tipo: 'libre', aforo: 8500, filas: '' }
      ],
      puertas: [{ n: 1, sector: 'norte' }, { n: 2, sector: 'norte' }, { n: 3, sector: 'occ' }, { n: 8, sector: 'occ' }, { n: 4, sector: 'ori' }, { n: 5, sector: 'ori' }, { n: 6, sector: 'sur' }, { n: 7, sector: 'sur' }],
      dispositivos: [
        { id: 'DSP-0101', tipo: 'Torniquete con lector', puerta: 1, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0102', tipo: 'Celular de operador', puerta: 1, estado: 'linea', senal: '16:07' },
        { id: 'DSP-0201', tipo: 'Torniquete con lector', puerta: 2, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0301', tipo: 'Torniquete con lector', puerta: 3, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0401', tipo: 'Torniquete con lector', puerta: 4, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0402', tipo: 'Tablet de operador', puerta: 4, estado: 'linea', senal: '16:06' },
        { id: 'DSP-0501', tipo: 'Torniquete con lector', puerta: 5, estado: 'paquete', senal: '16:05' },
        { id: 'DSP-0601', tipo: 'Torniquete con lector', puerta: 6, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0701', tipo: 'Tablet de operador', puerta: 7, estado: 'sinred', senal: '15:42' },
        { id: 'DSP-0901', tipo: 'Celular de operador', puerta: 0, estado: 'libre', senal: '16:02' }
      ]
    },
    // `hora` es la del partido; `apertura`, la de las puertas. `sinVis`: partido sin hinchada visitante.
    eventos: [
      { id: 'e1', codigo: 'EV-2026-0412', nombre: 'Nacional vs. Medellín', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', fecha: '2026-09-28', apertura: '16:00', estado: 'curso', aforo: '38.000', pub: 'Publicado el 12 sep 2026', partidos: [{ local: 'Nacional', visita: 'Medellín', hora: '19:00', sinVis: false }], boletas: { generadas: 36912, cupos: 38000 }, vivo: { dentro: 4812, novedades: 2 } },
      { id: 'e2', codigo: 'EV-2026-0410', nombre: 'Junior vs. Santa Fe', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Metropolitano', ciudad: 'Barranquilla', fecha: '2026-09-28', apertura: '15:00', estado: 'curso', aforo: '46.692', pub: 'Publicado el 9 sep 2026', partidos: [{ local: 'Junior', visita: 'Santa Fe', hora: '18:00', sinVis: false }], vivo: { dentro: 31240, novedades: 7 } },
      { id: 'e3', codigo: 'EV-2026-0409', nombre: 'Millonarios vs. América', competencia: 'Liga profesional 2026-II', escenario: 'Estadio El Campín', ciudad: 'Bogotá', fecha: '2026-09-29', apertura: '17:30', estado: 'publicado', aforo: '36.343', pub: 'Publicado el 14 sep 2026', partidos: [{ local: 'Millonarios', visita: 'América', hora: '20:00', sinVis: false }], boletas: { generadas: 33580, cupos: 36343 } },
      { id: 'e4', codigo: 'EV-2026-0431', nombre: 'América vs. Once Caldas', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Pascual Guerrero', ciudad: 'Cali', fecha: '2026-10-03', apertura: '13:00', estado: 'borrador', aforo: '35.405', pub: '', partidos: [{ local: 'América', visita: 'Once Caldas', hora: '16:00', sinVis: true }], boletas: { generadas: 0, cupos: 35405 } },
      { id: 'e5', codigo: 'EV-2026-0388', nombre: 'Santa Fe vs. Nacional', competencia: 'Liga profesional 2026-II', escenario: 'Estadio El Campín', ciudad: 'Bogotá', fecha: '2026-09-26', apertura: '16:30', estado: 'cerrado', aforo: '36.343', pub: 'Publicado el 8 sep 2026', partidos: [{ local: 'Santa Fe', visita: 'Nacional', hora: '19:30', sinVis: false }], cierre: { entraron: 33104, noEntraron: 412, acciones: 9 } },
      // e6 a e9 completan los tres momentos de la lista: otro en vivo y los pasados que se auditan.
      { id: 'e6', codigo: 'EV-2026-0415', nombre: 'Real Cartagena vs. Unión Magdalena', competencia: 'Torneo de ascenso 2026-II', escenario: 'Estadio Jaime Morón', ciudad: 'Cartagena', fecha: '2026-09-28', apertura: '14:00', estado: 'curso', aforo: '16.068', pub: 'Publicado el 15 sep 2026', partidos: [{ local: 'Real Cartagena', visita: 'Unión Magdalena', hora: '16:00', sinVis: false }], vivo: { dentro: 9812, novedades: 2 } },
      { id: 'e7', codigo: 'EV-2026-0371', nombre: 'Medellín vs. Junior', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', fecha: '2026-09-20', apertura: '15:30', estado: 'cerrado', aforo: '38.000', pub: 'Publicado el 2 sep 2026', partidos: [{ local: 'Medellín', visita: 'Junior', hora: '18:30', sinVis: false }], cierre: { entraron: 35870, noEntraron: 388, acciones: 14 } },
      { id: 'e8', codigo: 'EV-2026-0374', nombre: 'Once Caldas vs. Tolima', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Palogrande', ciudad: 'Manizales', fecha: '2026-09-21', apertura: '14:00', estado: 'cerrado', aforo: '31.611', pub: 'Publicado el 3 sep 2026', partidos: [{ local: 'Once Caldas', visita: 'Tolima', hora: '17:00', sinVis: false }], cierre: { entraron: 21455, noEntraron: 176, acciones: 3 } },
      { id: 'e9', codigo: 'EV-2026-0352', nombre: 'América vs. Junior', competencia: 'Copa nacional 2026', escenario: 'Estadio Pascual Guerrero', ciudad: 'Cali', fecha: '2026-09-13', apertura: '17:00', estado: 'cerrado', aforo: '35.405', pub: 'Publicado el 28 ago 2026', partidos: [{ local: 'América', visita: 'Junior', hora: '20:00', sinVis: false }], cierre: { entraron: 29930, noEntraron: 295, acciones: 6 } }
    ]
  }
};
