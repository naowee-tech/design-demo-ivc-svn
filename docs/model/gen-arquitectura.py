#!/usr/bin/env python3
"""Genera docs/arquitectura.html y docs/spec/arquitectura.md desde docs/model/arquitectura.json.
Pestaña 07 · Base técnica de la fase 1. Uso: python3 docs/model/gen-arquitectura.py"""
import json, os, re
from html import escape as e

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = json.load(open(R + '/docs/model/arquitectura.json', encoding='utf-8'))


def f(s):
    """Texto del JSON a HTML: escapa y aplica **negrita**, *cursiva* y `código`.
    El código se separa antes: así un `*_campo` no se lee como cursiva."""
    out = []
    for i, parte in enumerate(re.split(r'`(.+?)`', s)):
        if i % 2:
            out.append('<code>%s</code>' % e(parte))
            continue
        t = e(parte)
        t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
        out.append(re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', t))
    return ''.join(out)


CSS = '''<style>
:root{--bg:#f4f5f9;--pn:#fff;--tx:#1f2330;--mu:#5d6280;--bd:#e3e6f0;--ac:#d74009;--okbg:#e3f5e9;--ok:#166534}
*{box-sizing:border-box}body{margin:0}
code{padding:.0625rem .3125rem;border-radius:.3125rem;background:var(--code,#f0f1f7);font-size:.9em;overflow-wrap:anywhere}
.ir{display:inline-flex;margin-top:.75rem;padding:.5625rem .875rem;border-radius:.6875rem;background:var(--ac);color:var(--onac);font-size:.875rem;font-weight:700;text-decoration:none}
.ir:hover{filter:brightness(.94)}
.dos{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1rem}
.dos>div{background:var(--pn);border:1px solid var(--bd);border-radius:1rem;box-shadow:var(--sh);padding:1.125rem 1.25rem}
section.sec .dos h3{margin:0 0 .5rem;font-size:1rem}
.dos ul,.lista{margin:0;padding-left:1.125rem;font-size:.9375rem;line-height:1.55}
.dos li,.lista li{margin:0 0 .375rem}
.dos .no{background:var(--bg)}
.enf{display:grid;gap:.75rem;margin:0}
.enf p{margin:0;max-width:80ch;font-size:.9375rem;line-height:1.6}
.enf .alt{color:var(--mu)}
.arq{display:grid;grid-template-columns:minmax(0,1fr) 6rem minmax(0,1fr) 6rem minmax(0,1fr) 6rem minmax(0,1fr);row-gap:.875rem}
.nodo{background:var(--pn);border:1px solid var(--bd);border-radius:1rem;box-shadow:var(--sh);padding:1rem;overflow-wrap:break-word}
.nodo.srv{border-color:var(--acbd);background:linear-gradient(180deg,var(--acbg),var(--pn) 70%)}
.nodo b{display:block;font-size:1rem;line-height:1.3}
.nodo span{display:block;margin-top:.375rem;color:var(--mu);font-size:.875rem;line-height:1.45}
.fl{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.125rem;padding:0 .25rem;text-align:center;font-size:.75rem;font-weight:700;line-height:1.3;color:var(--mu);overflow-wrap:anywhere}
.fl i{font-style:normal;font-size:1.375rem;line-height:1;color:var(--ac)}
.lat{grid-column:1 / -1;padding:.75rem 1rem;border:1.5px dashed var(--acbd);border-radius:.875rem;background:var(--pn);font-size:.875rem;line-height:1.5}
.tw{overflow-x:auto;margin:1.25rem 0 0;background:var(--pn);border:1px solid var(--bd);container-type:inline-size}
.tw:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.arq-w{container-type:inline-size}
table{width:100%;border-collapse:collapse}
th{text-align:start;border-bottom:1px solid var(--bd)}
thead th{white-space:nowrap}
td{border-bottom:1px solid var(--bd);vertical-align:top;line-height:1.5}
tr:last-child td{border-bottom:0}
/* El nombre de la fila (tabla, permiso, ruta) no se parte con espacio de sobra; en tablas angostas sí. */
tbody th code{overflow-wrap:normal}
.notas{margin:1rem 0 0}
.conf{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:.875rem}
.conf>div{display:flex;flex-direction:column;padding:1.125rem 1.25rem;border:1px solid var(--wabd);border-radius:1rem;background:var(--wabg)}
section.sec .conf h3{margin:0 0 .375rem;font-size:1rem;line-height:1.35}
.conf p{margin:0;font-size:.9rem;line-height:1.55}
.conf .mt{margin-top:.625rem;padding-top:.625rem;border-top:1px solid var(--wabd)}
.conf small{display:block;margin-top:auto;padding-top:.625rem;color:var(--wa);font-size:.75rem;font-weight:700}
/* El diagrama se apila según su propio ancho, no el del viewport. */
@container (width < 60rem){
  .arq{grid-template-columns:1fr;row-gap:0}.fl{flex-direction:row;gap:.625rem;padding:.625rem 0}.fl i{rotate:90deg}
  .lat{margin-top:.875rem}
}
/* Tabla angosta: cada fila pasa a ficha y cada celda muestra su etiqueta. */
@container (width < 36rem){
  .apila table,.apila thead,.apila tbody,.apila tr,.apila th,.apila td{display:block}
  .apila thead{display:none}
  .apila table tr{padding:.875rem 1rem;border-bottom:1px solid var(--bd)}
  .apila table tr:last-child{border-bottom:0}
  .apila table tbody th{padding:0 0 .375rem;font-weight:700}
  .apila table td{padding:.1875rem 0;border:0;text-align:start}
  .apila table td::before{font-weight:700;color:var(--mu)}
  tbody th code{overflow-wrap:anywhere}
  .apila table td:nth-child(2)::before{content:var(--l2) ": "}
  .apila table td:nth-child(3)::before{content:var(--l3) ": "}
  .apila table td:nth-child(4)::before{content:var(--l4) ": "}
}
</style>'''


def sec(id_, h2, sub, cuerpo):
    return '<section id="%s"><h2>%s</h2>%s%s</section>' % (id_, e(h2), '<p class="sub">%s</p>' % f(sub) if sub else '', cuerpo)


def tabla(nombre, cab, filas, clases=None):
    """Tabla en una región enfocable (scroll con teclado). La 1.ª columna es encabezado de fila;
    en contenedores angostos se apila y cada celda muestra su etiqueta (--l2, --l3…)."""
    clases = clases or [''] * len(cab)
    etiquetas = ';'.join("--l%d:'%s'" % (i + 1, c) for i, c in enumerate(cab))

    def celda(i, x, k):
        tag = 'th scope="row"' if i == 0 else 'td'
        return '<%s%s>%s</%s>' % (tag, ' class="%s"' % k if k else '', f(x), tag.split()[0])
    return ('<div class="tw%s" tabindex="0" role="region" aria-label="%s"><table style="%s"><thead><tr>%s</tr></thead>'
            '<tbody>%s</tbody></table></div>') % (
        ' apila' if len(cab) > 2 else '', e(nombre), e(etiquetas), ''.join('<th scope="col">%s</th>' % e(c) for c in cab),
        ''.join('<tr>%s</tr>' % ''.join(celda(i, x, k) for i, (x, k) in enumerate(zip(fila, clases))) for fila in filas))


def ul(xs, cls='lista'):
    return '<ul class="%s">%s</ul>' % (cls, ''.join('<li>%s</li>' % f(x) for x in xs))


def ol(xs):
    return '<ol class="lista">%s</ol>' % ''.join('<li>%s</li>' % f(x) for x in xs)


A, EN, P, ES, FR = J['alcance'], J['enfoque'], J['piezas'], J['estados'], J['front']
CAB_API = ['Método y ruta', 'Permiso', 'Qué hace']
CAB_PER = ['Permiso', 'Profesional', 'Coordinador', 'Director']

alcance = '<div class="dos"><div><h3>Entra</h3>%s</div><div class="no"><h3>No entra</h3>%s</div></div>' % (ul(A['entra'], ''), ul(A['no_entra'], ''))

enfoque = ('<div class="enf"><p>%s</p><p class="alt">%s</p><p class="alt">%s</p></div>'
           '<div data-call="decision" data-call-l="Abierto a desarrollo"><p>%s</p></div>'
           '<h3>Decisiones tomadas</h3>%s') % (f(EN['elegido']), f(EN['alternativa']), f(EN['descartado']), f(EN['abierto']), ol(J['decisiones']))

arq = '<div class="arq" role="group" aria-label="Piezas de la fase 1 y cómo se conectan">'
for i, (t, s) in enumerate(P['nodos']):
    if i:
        arq += '<div class="fl"><i aria-hidden="true">→</i>%s</div>' % e(P['flechas'][i - 1])
    arq += '<div class="nodo%s"><b>%s</b><span>%s</span></div>' % (' srv' if t == 'ivc-ms' else '', e(t), e(s))
arq += '<div class="lat">%s</div></div>' % f(P['lateral'])
piezas = '<div class="arq-w">%s</div>' % arq

datos = (tabla('Tablas nuevas en ivc-ms', ['Tabla', 'Qué guarda'], J['tablas'])
         + '<h3>Columnas de sanction_records</h3>' + tabla('Columnas de sanction_records por grupo', ['Grupo', 'Columnas'], J['columnas'])
         + ul(J['datos_notas'], 'lista notas'))

estados = ('<p>%s</p>' % f(ES['registro'])
           + tabla('Estado de la restricción', ['Estado de la restricción', 'Cuándo'], ES['restriccion'])
           + ul(ES['notas'], 'lista notas'))

conf = '<div class="conf">%s</div>' % ''.join(
    '<div><h3>%d. %s</h3><p>%s</p>%s<small>%s</small></div>' % (
        i + 1, e(c['t']), f(c['d']), '<p class="mt"><b>Mientras tanto:</b> %s</p>' % f(c['mientras']) if c['mientras'] else '', e(c['ref']))
    for i, c in enumerate(J['confirmar']))

fuera = ul(J['fuera']) + '<a class="ir" href="%s" target="_blank" rel="noopener">Contexto de las fases siguientes ↗</a>' % e(J['recorrido'])

SECS = [
    ('alcance', 'Alcance de la fase 1', 'Registrar, editar, validar o devolver, guardar en la base de datos y consultar.', alcance),
    ('enfoque', 'Cómo se construye', 'Lo que decide la construcción es dónde viven el formulario de 55 campos y sus reglas.', enfoque),
    ('piezas', 'Las piezas', 'Tres repos y una base de datos, sin servicios nuevos. Las extensiones de PostgreSQL de la búsqueda se ven en Datos.', piezas),
    ('datos', 'Datos en ivc-ms', 'Propuesta. Una tabla principal, tres de bitácora y una de catálogos.', datos),
    ('reglas', 'Reglas: una sola clase', '`SanctionRecordRules` (Kotlin) recibe el registro completo y devuelve la lista de errores por campo. La usan crear, editar, validar carga e importar; ninguna regla vive en otro lugar del servidor. El front repite solo las básicas, para avisar antes de enviar.',
     tabla('Reglas de SanctionRecordRules', ['Regla', 'Detalle'], J['reglas'])),
    ('estados', 'Estados y vigencia', '', estados),
    ('api', 'API', 'Doce endpoints nuevos en `ivc-ms`, expuestos por el gateway.',
     tabla('Endpoints de la fase 1', CAB_API, J['api']) + ul(J['api_notas'], 'lista notas')),
    ('errores', 'Errores', 'Un contrato de errores por campo, igual para el formulario y la carga masiva.',
     tabla('Errores y su respuesta', ['Caso', 'Respuesta'], J['errores']) + ul(J['errores_notas'], 'lista notas')),
    ('permisos', 'Permisos y roles', 'Seis permisos nuevos. «Editar» un Validado necesita uno propio.',
     tabla('Permisos por rol', CAB_PER, J['permisos']) + ul(J['permisos_notas'], 'lista notas')),
    ('menores', 'Menores de edad', '', ul(J['menores'])),
    ('busqueda', 'Búsqueda', '', ul(J['busqueda'])),
    ('catalogos', 'Catálogos', '', ul(J['catalogos'])),
    ('carga', 'Carga masiva', 'Síncrona, con tope de **500 filas** por envío.', ol(J['carga'])),
    ('front', 'Front: suite-web-ivc', '',
     tabla('Archivos del front', ['Pieza', 'Dónde'], FR['archivos']) + '<h3>Pantallas</h3>' + ul(FR['pantallas'])),
    ('pruebas', 'Pruebas mínimas', '', tabla('Pruebas mínimas por repo', ['Repo', 'Qué se prueba'], J['pruebas'])),
    ('confirmar', 'Por confirmar con el IVC', 'Lo que depende del IVC. Las consultas se enviaron el 2026-11-17; las que traen «Mientras tanto» tienen un valor provisional, elegido para que desarrollo arranque y cambiarlo después cueste poco.', conf),
    ('desarrollo', 'Lo decide desarrollo', '', ul(J['desarrollo'])),
    ('fuera', 'Fuera de la fase 1', 'Quedan para las fases siguientes. El recorrido animado se conserva solo como contexto.', fuera),
]

body = ''.join(sec(*s) for s in SECS)
html = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Base técnica · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body><main>'
        '<header><h1>%s</h1><p class="sub">%s</p></header>%s</main><script src="assets/entrega.js"></script></body></html>') % (
    CSS, e(J['titulo']), f(J['sub']), body)
open(R + '/docs/arquitectura.html', 'w', encoding='utf-8').write(html)


# ---------- markdown ----------
def md_tabla(cab, filas):
    c = lambda x: x.replace('|', '\\|')
    return ['| %s |' % ' | '.join(cab), '|' + '---|' * len(cab)] + ['| %s |' % ' | '.join(c(x) for x in r) for r in filas]


def md_ul(xs):
    return ['- ' + x for x in xs]


def md_ol(xs):
    return ['%d. %s' % (i + 1, x) for i, x in enumerate(xs)]


SUB = {s[0]: s[2] for s in SECS}
H2 = {s[0]: s[1] for s in SECS}


def cab(id_):
    return ['', '## ' + H2[id_], ''] + ([SUB[id_], ''] if SUB[id_] else [])


md = ['# Base técnica · fase 1', '', J['sub'], '',
      'Documento: https://naowee-tech.github.io/design-demo-ivc-svn/entrega/#arquitectura · Fuente: `docs/model/arquitectura.json`.']
md += cab('alcance') + ['**Entra**', ''] + md_ul(A['entra']) + ['', '**No entra**', ''] + md_ul(A['no_entra'])
md += cab('enfoque') + [EN['elegido'], '', EN['alternativa'], '', EN['descartado'], '', '> **Abierto a desarrollo.** ' + EN['abierto'], '',
                        '### Decisiones tomadas', ''] + md_ol(J['decisiones'])
md += cab('piezas') + [' → '.join('**%s** (%s)' % (t, s) for t, s in P['nodos']), '',
                       '- Conexiones: ' + ' → '.join('`%s`' % x for x in P['flechas']) + '.', '- ' + P['lateral'] + '.']
md += cab('datos') + md_tabla(['Tabla', 'Qué guarda'], J['tablas']) + ['', '### Columnas de sanction_records', ''] + md_tabla(['Grupo', 'Columnas'], J['columnas']) + [''] + md_ul(J['datos_notas'])
md += cab('reglas') + md_tabla(['Regla', 'Detalle'], J['reglas'])
md += cab('estados') + [ES['registro'], ''] + md_tabla(['Estado de la restricción', 'Cuándo'], ES['restriccion']) + [''] + md_ul(ES['notas'])
md += cab('api') + md_tabla(CAB_API, J['api']) + [''] + md_ul(J['api_notas'])
md += cab('errores') + md_tabla(['Caso', 'Respuesta'], J['errores']) + [''] + md_ul(J['errores_notas'])
md += cab('permisos') + md_tabla(CAB_PER, J['permisos']) + [''] + md_ul(J['permisos_notas'])
md += cab('menores') + md_ul(J['menores'])
md += cab('busqueda') + md_ul(J['busqueda'])
md += cab('catalogos') + md_ul(J['catalogos'])
md += cab('carga') + md_ol(J['carga'])
md += cab('front') + md_tabla(['Pieza', 'Dónde'], FR['archivos']) + ['', '### Pantallas', ''] + md_ul(FR['pantallas'])
md += cab('pruebas') + md_tabla(['Repo', 'Qué se prueba'], J['pruebas'])
md += cab('confirmar')
for i, c in enumerate(J['confirmar']):
    md += ['### %d. %s' % (i + 1, c['t']), '', c['d'], ''] + (['**Mientras tanto:** ' + c['mientras'], ''] if c['mientras'] else []) + ['*Ref.: %s*' % c['ref'], '']
md += cab('desarrollo') + md_ul(J['desarrollo'])
md += cab('fuera') + md_ul(J['fuera']) + ['', 'Contexto de las fases siguientes: [recorrido animado](../%s).' % J['recorrido'], '']
open(R + '/docs/spec/arquitectura.md', 'w', encoding='utf-8').write('\n'.join(md))
print('ok arquitectura.html + spec/arquitectura.md ·', len(SECS), 'secciones')
