#!/usr/bin/env python3
"""Genera docs/historias.html (Historias de usuario) desde docs/model/historias.json."""
import json, os
from html import escape as e

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = json.load(open(R + '/docs/model/historias.json', encoding='utf-8'))
TRAB = [t['titulo'] for t in json.load(open(R + '/docs/model/jtbd.json', encoding='utf-8'))['trabajos']]

CSS = '''<style>
:root{--bg:#f4f5f9;--pn:#fff;--tx:#1f2330;--mu:#5d6280;--bd:#e3e6f0;--ac:#d74009;--sl:#3f4a5c;--slbg:#eceff4}
@media (prefers-color-scheme:dark){:root{--bg:#0e1117;--pn:#171b24;--tx:#e8eaf0;--mu:#9ba1b6;--bd:#2a2f3b;--ac:#ff8a5c;--sl:#c3cbd8;--slbg:#262d3a}}
*{box-sizing:border-box}body{margin:0}
.origen{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;margin:24px 0 0;padding:22px 26px;background:var(--pn);border:1px solid var(--bd);border-radius:18px;box-shadow:var(--sh)}
.origen div{flex:1 1 420px}.origen b{display:block;font-size:16px}.origen small{display:block;margin:2px 0 8px;color:var(--mu);font-size:13px}.origen p{margin:0;color:var(--mu);font-size:14.5px;max-width:72ch}
.origen a.j{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;border:1.5px solid var(--ac);color:var(--ac);font-weight:700;text-decoration:none;white-space:nowrap}
.origen a.j:hover{background:var(--acbg)}
.hs{display:flex;flex-direction:column;gap:20px;margin:0;padding:0;list-style:none}
.h{padding:26px 28px 22px;background:var(--pn);border:1px solid var(--bd);border-radius:20px;box-shadow:var(--sh)}
.h.prop{border:1.5px dashed var(--vibd);background:linear-gradient(var(--vibg),var(--vibg)) top/100% 6px no-repeat,var(--pn)}
.h-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:0 0 10px}
.h-id{font:800 12px/1 ui-monospace,Menlo,monospace;padding:6px 9px;border-radius:8px;background:var(--acbg);color:var(--ac);border:1px solid var(--acbd)}
.rol{padding:4px 10px;border-radius:999px;background:var(--slbg);color:var(--sl);font-size:12px;font-weight:700}
.pp{padding:4px 10px;border-radius:999px;border:1.5px dashed var(--vibd);color:var(--vi);font-size:12px;font-weight:700}
.tj{margin-left:auto;font-size:12.5px;color:var(--mu);text-decoration:none}.tj:hover{color:var(--ac)}
.h h3,section.sec .h h3{margin:0 0 14px;font-size:21px;line-height:1.3;font-weight:800;letter-spacing:-.01em}
.voz{margin:0;padding:16px 20px;border-left:4px solid var(--ac);background:var(--sf);border-radius:0 14px 14px 0;font-size:17px;line-height:1.55}
.voz em{font-style:normal;font-weight:800;color:var(--ac)}
.cr{margin:20px 0 0}.cr>p{margin:0 0 8px;font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.cr ol{margin:0;padding:0;list-style:none;display:grid;gap:8px;counter-reset:c}
.cr li{counter-increment:c;display:grid;grid-template-columns:auto 1fr;gap:2px 14px;padding:12px 16px;border:1px solid var(--bd);border-radius:12px;font-size:14.5px;line-height:1.5}
.cr li::before{content:counter(c);grid-row:1 / span 3;display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--slbg);color:var(--sl);font-size:12px;font-weight:800}
.cr li span b{display:inline-block;min-width:74px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--mu)}
.h-pie{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin-top:18px;padding-top:14px;border-top:1px solid var(--bd)}
.h-pie a{font-weight:700;font-size:14px;text-decoration:none}.h-pie a:hover{text-decoration:underline}
.h-pie small{margin-left:auto;color:var(--mu);font-size:12px}
@media (max-width:700px){.h{padding:20px}.tj{margin-left:0;flex-basis:100%}.h-pie small{margin-left:0;flex-basis:100%}.cr li span b{display:block}}
</style>'''


def historia(h):
    cr = ''.join('<li><span><b>Dado</b> %s</span><span><b>Cuando</b> %s</span><span><b>Entonces</b> %s</span></li>' % tuple(e(x) for x in c) for c in h['criterios'])
    ir = ''.join('<a href="%s" target="_top">%s →</a>' % (e(u), e(l)) for l, u in h['ir'])
    return ('<li class="h%s" id="%s"><div class="h-top"><span class="h-id">%s</span><span class="rol">%s</span>%s'
            '<a class="tj" href="index.html#trabajos" target="_top">Trabajo %d · %s</a></div><h3>%s</h3>'
            '<p class="voz"><em>Como</em> %s, <em>quiero</em> %s, <em>para</em> %s.</p>'
            '<div class="cr"><p>Criterios de aceptación</p><ol>%s</ol></div>'
            '<div class="h-pie">%s<small>De la HU-26.3: %s</small></div></li>') % (
        ' prop' if h.get('propuesta') else '', e(h['id'].lower()), e(h['id']), e(h['rol']),
        '<span class="pp">Modelo propuesto</span>' if h.get('propuesta') else '',
        h['trabajo'], e(TRAB[h['trabajo'] - 1]), e(h['titulo']), e(h['como']), e(h['quiero']), e(h['para']), cr, ir, e(h['traza']))


O = J['origen']
n = sum(len(g['historias']) for g in J['grupos'])
body = '<div class="origen"><div><b>%s</b><small>%s</small><p>%s</p></div></div>' % (e(O['hu']), e(O['version']), e(O['texto']))
body += ''.join('<section id="%s"><h2>%s</h2><p class="sub">%s</p><ol class="hs">%s</ol></section>' % (
    e(g['id']), e(g['titulo']), e(g['sub']), ''.join(historia(h) for h in g['historias'])) for g in J['grupos'])

html = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Historias de usuario · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body><main>'
        '<header><h1>Historias de usuario</h1><p class="sub">%d historias que desglosan la HU-26.3 por quién hace qué, cada una con sus criterios de aceptación y enlaces a donde se ve.</p></header>'
        '%s</main><script src="assets/entrega.js"></script></body></html>') % (CSS, n, body)
open(R + '/docs/historias.html', 'w', encoding='utf-8').write(html)
print('ok historias.html ·', n, 'historias')
