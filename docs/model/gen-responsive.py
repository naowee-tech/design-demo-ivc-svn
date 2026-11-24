#!/usr/bin/env python3
"""Genera docs/responsive.html y docs/spec/responsive.md desde responsive.json, la medición y superficie.json."""
import json, os
from html import escape as e

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M = R + '/docs/model/'
J = json.load(open(M + 'responsive.json', encoding='utf-8'))
MED = json.load(open(M + 'responsive-medicion.json', encoding='utf-8'))
SUP = json.load(open(M + 'superficie.json', encoding='utf-8'))
NOM = {k: v['n'] for k, v in SUP['vistas'].items()}
VER = {'ok': 'Bien', 'ajuste': 'Ajuste menor', 'rompe': 'Se rompe', 'variante': 'Necesita variante', 'manual': 'Revisión manual'}
ANCHOS = [a[0] for a in J['anchos']]
POR_VISTA = {}
for h in J['hallazgos']:
    for v in h['vistas']:
        POR_VISTA.setdefault(v, []).append(h['id'])
TRANS = [h for h in J['hallazgos'] if h.get('transversal')]
TIPO = {h['id']: h['tipo'] for h in J['hallazgos'] if h['estado'] != 'resuelto'}
ORDEN = ['rompe', 'variante', 'ajuste', 'ok']
# Vistas de referencia, con la regla de gen-superficie.py: grupo con «fuera» o vista con «fuera» propio (la propia gana).
REF = {i: 'fuera de la fase 1' for g in SUP['grupos'] if g.get('fuera') for i in g['vistas']}
REF.update({i: 'no disponible hasta la siguiente etapa' for i, x in SUP['vistas'].items() if x.get('fuera')})


def fase1(h):
    # Cuenta para la fase 1 si es transversal o toca al menos una vista de la fase 1.
    return not h['vistas'] or any(v not in REF for v in h['vistas'])


H1 = [h for h in J['hallazgos'] if fase1(h)]


def donde(v):
    return NOM.get(v, v) + (' (referencia)' if v in REF else '')


def veredicto(v):
    # El peor hallazgo abierto de la vista; los transversales van aparte.
    if v in J.get('manual', []): return 'manual'
    return min([TIPO[i] for i in POR_VISTA.get(v, []) if i in TIPO] + ['ok'], key=ORDEN.index)

CSS = '''<style>
.chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;font-size:12.5px;font-weight:700;white-space:nowrap}
.t-rompe{background:var(--ngbg);color:var(--ng)}.t-variante{background:var(--wabg);color:var(--wa)}.t-ajuste{background:var(--slbg);color:var(--sl)}
.t-ok{background:var(--okbg);color:var(--ok)}.t-manual{background:var(--bg);color:var(--mu)}
.an{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:0 0 18px;padding:0;list-style:none}
.an li,.cr li{padding:16px 20px;background:var(--pn);border:1px solid var(--bd);border-radius:16px;box-shadow:var(--sh)}
.an b{display:block;font-size:26px;font-weight:800;font-variant-numeric:tabular-nums}.an span{display:block;font-weight:700}.an small{color:var(--mu)}
.cr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none}
.cr b{display:block}.cr span{color:var(--mu);font-size:14px}
.cnt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:0 0 18px}
.cnt div{padding:16px 20px;border-radius:16px}.cnt b{display:block;font-size:30px;font-weight:800}.cnt span{font-weight:700}.cnt p{margin:4px 0 0;font-size:13.5px;opacity:.85}
.mx{width:100%;border-collapse:collapse;background:var(--pn);border:1px solid var(--bd);border-radius:16px;overflow:hidden;font-size:14px}
.mx th,.mx td{padding:10px 14px;border-bottom:1px solid var(--bd);text-align:left;vertical-align:top}
.mx th{background:var(--bg);font-size:12.5px;color:var(--mu)}.mx td a{color:var(--tx);font-weight:650}.mx td small{color:var(--mu)}
.mxw{overflow-x:auto}
.hz{display:grid;gap:14px;margin:0;padding:0;list-style:none}
.hz li{padding:18px 22px;background:var(--pn);border:1px solid var(--bd);border-radius:18px;box-shadow:var(--sh)}
.hz .cab{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px}.hz .cab b{font-size:16.5px}
.id{font:700 12.5px/1 ui-monospace,Menlo,monospace;color:var(--mu);text-decoration:none}a.id{color:var(--ac)}a.id:hover{text-decoration:underline}
.hz dl{display:grid;grid-template-columns:110px 1fr;gap:6px 14px;margin:12px 0 0;font-size:14.5px;line-height:1.45}
.hz dt{color:var(--mu);font-weight:650}.hz dd{margin:0}.hz dd a{color:var(--ac)}.hz code{font-size:13px}
.vv{margin:0 0 26px;padding:20px 22px;background:var(--pn);border:1px solid var(--bd);border-radius:18px;box-shadow:var(--sh)}
.vv h3{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:0;font-size:17px}
.vv p{margin:6px 0 14px;color:var(--mu)}
.vv .paso{margin:18px 0 8px;color:var(--tx)}
.caps{display:grid;grid-template-columns:1fr 1.4fr 2.2fr;gap:14px;align-items:start}
.caps figure{margin:0}.caps img{display:block;width:100%;height:auto;max-height:620px;object-fit:cover;object-position:top;border:1px solid var(--bd);border-radius:10px;background:var(--bg)}
.caps figcaption{margin-top:6px;font-size:12.5px;color:var(--mu)}.caps figcaption b{color:var(--tx)}
.caps a{display:block;color:inherit;text-decoration:none}
@media (max-width:860px){.an,.cnt{grid-template-columns:1fr}.cr{grid-template-columns:1fr}.hz dl{grid-template-columns:1fr;gap:2px}.hz dd{margin-bottom:8px}
.caps{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;padding-bottom:6px}.caps figure{flex:0 0 78%;scroll-snap-align:start}}
</style>'''


def chip(t, txt=None):
    return '<span class="chip t-%s">%s</span>' % (t, e(txt or VER.get(t) or J['tipos'][t][0]))


def resumen_ancho(v, w):
    m = MED.get(v, {}).get(str(w))
    if not m or 'falla' in m:
        return '<small>—</small>'
    pts = []
    if m['desborde'] > 0: pts.append('desborde %d px' % m['desborde'])
    if m['recortados']: pts.append('%d recortado' % len(m['recortados']))
    if m['scrollH']: pts.append('%d con scroll lateral' % len(m['scrollH']))
    if w < 1280 and m['tactil']['chicos']: pts.append('%d/%d táctiles < 44' % (m['tactil']['chicos'], m['tactil']['total']))
    if m['texto12']['n']: pts.append('%d textos < 12 px' % m['texto12']['n'])
    return '<small>%s</small>' % e(' · '.join(pts) or 'sin alertas')


# Cómo se auditó
b = '<section id="como"><h2>Cómo se auditó</h2><p class="sub">Cada vista de la Superficie, abierta en el mismo estado a tres anchos y medida con las mismas reglas.</p>'
b += '<ul class="an">%s</ul>' % ''.join('<li><b>%d px</b><span>%s</span><small>%s</small></li>' % (w, e(n), e(d)) for w, n, d in J['anchos'])
b += '<ul class="cr">%s</ul>' % ''.join('<li><b>%s</b><span>%s</span></li>' % (e(t), e(d)) for t, d in J['criterios'])
b += ('<p data-call="info" data-call-l="Volver a medir">La medición la hace <code>node docs/model/medir-responsive.mjs</code> (captura y mide); '
      'la clasificación vive en <code>docs/model/responsive.json</code> y esta página sale de <code>gen-responsive.py</code>. Auditoría del %s.</p></section>') % e(J['fecha'])

# Resumen
n = {t: sum(1 for h in H1 if h['tipo'] == t) for t in J['tipos']}
REFS = [v for g in SUP['grupos'] for v in g['vistas'] if v in REF and v in J['vistas']]
b += ('<section id="resumen"><h2>Resumen</h2><p class="sub">%d hallazgos en %d vistas de la fase 1; %d resueltos. Nada se apretó: lo que no cabe cambia de forma. '
      'Además, %d vistas de referencia (%s) con %d hallazgos propios: se conservan como referencia.</p>') % (
    len(H1), sum(1 for v in J['vistas'] if v not in REF), sum(1 for h in H1 if h['estado'] == 'resuelto'),
    len(REFS), e(', '.join(NOM.get(v, v) for v in REFS)), len(J['hallazgos']) - len(H1))
b += '<div class="cnt">%s</div>' % ''.join('<div class="t-%s"><b>%d</b><span>%s</span><p>%s</p></div>' % (t, n[t], e(J['tipos'][t][0]), e(J['tipos'][t][1])) for t in J['tipos'])
filas = '<tr><td><b>En todo el módulo</b><br><small>Menú y encabezado</small></td><td>%s</td>%s<td><small>%s</small></td></tr>' % (
    chip(min([h['tipo'] for h in TRANS if h['id'] in TIPO] + ['ok'], key=ORDEN.index)),
    ''.join('<td><small>%s</small></td>' % e(' · '.join(h['id'] for h in TRANS if w in h['anchos']) or '—') for w in ANCHOS),
    ', '.join('<a class="id" href="#%s">%s</a>' % (h['id'], h['id']) for h in TRANS))
for g in SUP['grupos']:
    for v in g['vistas']:
        if v not in J['vistas']: continue
        ver = veredicto(v)
        filas += '<tr><td><a href="#v-%s">%s</a><br><small>%s</small></td><td>%s</td>%s<td><small>%s</small></td></tr>' % (
            v, e(NOM.get(v, v)), e(g['titulo']), chip(ver) + (' ' + chip('manual', REF[v]) if v in REF else ''), ''.join('<td>%s</td>' % resumen_ancho(v, w) for w in ANCHOS), e(', '.join(POR_VISTA.get(v, [])) or '—'))
b += '<div class="mxw"><table class="mx"><thead><tr><th>Vista</th><th>Veredicto</th>%s<th>Hallazgos</th></tr></thead><tbody>%s</tbody></table></div></section>' % (
    ''.join('<th>%d px</th>' % w for w in ANCHOS), filas)

# Hallazgos por tipo
for t, (tit, sub) in J['tipos'].items():
    hs = [h for h in J['hallazgos'] if h['tipo'] == t]
    b += '<section id="%s"><h2>%s</h2><p class="sub">%s</p><ul class="hz">' % (t, e(tit), e(sub))
    for h in hs:
        est = chip('manual', 'Se corrige en el origen') if h['estado'] == 'origen' else chip('ok', 'Resuelto') if h['estado'] == 'resuelto' else chip('manual', 'Pendiente')
        b += ('<li id="%s"><div class="cab"><span class="id">%s</span><b>%s</b>%s</div><dl>'
              '<dt>Dónde</dt><dd>%s%s</dd><dt>Qué pasa</dt><dd>%s</dd><dt>%s</dt><dd>%s</dd><dt>Archivo</dt><dd><code>%s</code></dd></dl></li>') % (
            h['id'], h['id'], e(h['titulo']), est + ('' if fase1(h) else chip('manual', 'Solo en vistas de referencia')),
            ', '.join('<a href="#v-%s">%s</a>' % (v, e(donde(v))) for v in h['vistas']) or 'Todo el módulo',
            e(' · ' + ' / '.join('%d' % w for w in h['anchos']) + ' px'), e(h['que']), 'Solución' if h['estado'] == 'resuelto' else 'Pendiente', e(h['solucion']), e(h['archivo']))
    b += '</ul></section>'

# Vista por vista
b += '<section id="vistas"><h2>Vista por vista</h2><p class="sub">Las tres capturas de cada vista, de celular a escritorio. Toca una para verla completa.</p>'
for g in SUP['grupos']:
    for v in g['vistas']:
        if v not in J['vistas']: continue
        nota = J['vistas'][v]
        ids = POR_VISTA.get(v, [])
        b += '<div class="vv" id="v-%s"><h3>%s %s %s</h3><p>%s</p>' % (
            v, e(NOM.get(v, v)), chip(veredicto(v)) + (' ' + chip('manual', REF[v]) if v in REF else ''), ' '.join('<a class="id" href="#%s">%s</a>' % (i, i) for i in ids), e(nota))
        for clave, rot in [(v, '')] + [tuple(x) for x in J.get('extra', {}).get(v, [])]:
            caps = ''
            for w in ANCHOS:
                m = MED.get(clave, {}).get(str(w))
                if m and 'img' in m:
                    caps += '<figure><a href="%s" target="_blank" rel="noopener"><img src="%s" alt="%s a %d px" loading="lazy"></a><figcaption><b>%d px</b> · %s</figcaption></figure>' % (
                        m['img'], m['img'], e(NOM.get(v, v) + (' · ' + rot if rot else '')), w, w, resumen_ancho(clave, w)[7:-8])
            if caps: b += ('<p class="paso"><b>%s</b></p>' % e(rot) if rot else '') + '<div class="caps">%s</div>' % caps
        b += '</div>'
b += '</section>'

b += '<section id="decidir"><h2>Por decidir</h2><ul>%s</ul></section>' % ''.join('<li>%s</li>' % e(x) for x in J['decidir'])

html = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Responsive · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body><main>'
        '<header><h1>Responsive</h1><p class="sub">Cómo se ve y se usa el módulo en celular, tablet y escritorio: qué se rompe, qué cambia de forma y qué ya funciona.</p></header>'
        '%s</main><script src="assets/entrega.js"></script></body></html>') % (CSS, b)
open(R + '/docs/responsive.html', 'w', encoding='utf-8').write(html)

# Spec en markdown para quien construye.
md = ['# Responsive · Control de acceso (fase 1)', '',
      'Auditoría del %s a %s px. Fuente: `docs/model/responsive.json`; capturas en `docs/img/responsive/`.' % (J['fecha'], ' / '.join(map(str, ANCHOS))), '',
      '## Criterios', ''] + ['- **%s:** %s' % tuple(c) for c in J['criterios']] + ['']
for t, (tit, sub) in J['tipos'].items():
    md += ['## %s' % tit, '', sub, '']
    for h in [h for h in J['hallazgos'] if h['tipo'] == t]:
        md += ['### %s · %s' % (h['id'], h['titulo']), '',
               '- **Dónde:** %s (%s px)' % (', '.join(donde(v) for v in h['vistas']) or 'Todo el módulo', ' / '.join(map(str, h['anchos']))),
               '- **Qué pasa:** ' + h['que'], '- **%s:** ' % ('Solución' if h['estado'] == 'resuelto' else 'Pendiente') + h['solucion'], '- **Archivo:** `%s`' % h['archivo'], '- **Estado:** ' + h['estado'], '']
md += ['## Veredicto por vista', '', '| Vista | Veredicto | Nota |', '|---|---|---|']
md += ['| En todo el módulo | %s | %s |' % (VER[min([h['tipo'] for h in TRANS if h['id'] in TIPO] + ['ok'], key=ORDEN.index)], ', '.join(h['id'] + ' ' + h['titulo'] for h in TRANS))]
md += ['| %s | %s | %s |' % (NOM.get(v, v) + (' (%s)' % REF[v] if v in REF else ''), VER[veredicto(v)], x) for v, x in J['vistas'].items()]
md += ['', '## Por decidir', ''] + ['- ' + x for x in J['decidir']] + ['']
open(R + '/docs/spec/responsive.md', 'w', encoding='utf-8').write('\n'.join(md))
print('ok responsive.html · spec/responsive.md')
