#!/usr/bin/env python3
"""Genera docs/superficie.html y docs/spec/superficie.md desde docs/model/superficie.json.
Uso: python3 docs/model/gen-superficie.py"""
import json, os
from html import escape as e

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SU = json.load(open(R + '/docs/model/superficie.json', encoding='utf-8'))
V = SU['vistas']
ROL = {'profesional': 'Profesional', 'coordinador': 'Coordinador', 'director': 'Director'}
SV = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'
ICON = {'profesional': SV % '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        'coordinador': SV % '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
        'director': SV % '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'}


def demo(v):
    return '../suid/login.html' if v['ruta'] == 'login' else '../suid/app.html?rol=%s%s' % (v['roles'][-1] if 'coordinador' not in v['roles'] else 'coordinador', v['ruta'])


CSS = '''<style>
:root{--bg:#f4f5f9;--pn:#fff;--tx:#1f2330;--mu:#5d6280;--bd:#e3e6f0;--ac:#d74009;--sl:#3f4a5c;--slbg:#eceff4}
*{box-sizing:border-box}body{margin:0}
.side-img{margin:0;padding:10px;background:var(--pn);border:1px solid var(--bd);border-radius:16px;box-shadow:var(--sh)}.side-img img{display:block;width:100%;height:auto;border-radius:10px}.side-img figcaption{margin:8px 4px 2px;font-size:12px;color:var(--mu)}.where{display:grid;grid-template-columns:260px 1fr;gap:28px;align-items:start}
.side{padding:14px 12px;background:var(--pn);border:1px solid var(--bd);border-radius:16px;box-shadow:var(--sh);font-size:13.5px}
.side b{display:block;margin:9px 8px;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.side b:first-child{margin-top:2px}.side .off{padding:3px 8px;color:var(--mu);opacity:.55}
.side .grp{margin:6px 0;padding:6px;border-radius:12px;background:var(--acbg);border:1px solid var(--acbd)}
.side .grp b{color:var(--ac);margin-top:4px}.side .grp div{padding:6px 8px;font-weight:700;color:var(--tx)}
.where p{margin:0;font-size:16px;line-height:1.6;max-width:56ch}.where p+p{margin-top:12px;color:var(--mu);font-size:14.5px}
.map{display:flex;flex-direction:column;gap:14px}
.mr{display:grid;grid-template-columns:200px repeat(3,minmax(0,1fr));gap:10px;align-items:stretch}
.mc{position:relative;display:flex;flex-direction:column;gap:6px;padding:12px 14px;background:var(--pn);border:1px solid var(--bd);border-radius:14px}
.mc>small{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.mc.in{background:var(--ac);border-color:var(--ac);color:var(--onac);font-weight:800;justify-content:center}
.mc.in small{color:inherit;opacity:.8}
.mc+.mc::before{content:"→";position:absolute;left:-10px;top:50%;transform:translate(-50%,-50%);color:var(--mu);font-weight:800}
.mc a{display:inline-block;padding:5px 10px;border-radius:9px;background:var(--sf);border:1px solid var(--bd);color:var(--tx);font-size:13px;font-weight:650;text-decoration:none}
.mc.vac::before{display:none}.mc a:hover{border-color:var(--ac);color:var(--ac)}.mc.vac{background:none;border-style:dashed}
.vs{display:flex;flex-direction:column;gap:22px;margin:0;padding:0;list-style:none}
.v{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:0;background:var(--pn);border:1px solid var(--bd);border-radius:20px;box-shadow:var(--sh);overflow:hidden;scroll-margin-top:24px}
.v-g{padding:18px;background:var(--sf);border-right:1px solid var(--bd)}.v.sin-img{grid-template-columns:1fr}.v-img{display:block;position:relative;width:100%;padding:0;background:none;border:0;cursor:zoom-in;text-align:left;font:inherit;color:inherit}.v-img .cap{position:absolute;left:10px;bottom:10px;padding:4px 9px;border-radius:8px;background:rgba(20,22,38,.78);color:#fff;font-size:12px;font-weight:700}.th{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.th .v-img{cursor:pointer;padding:4px;border-radius:10px;border:1.5px solid transparent}.th .v-img.on{border-color:var(--ac);background:var(--pn)}.th .v-img img{border-radius:6px;box-shadow:none}.th .v-img span{display:block;margin-top:4px;font-size:11px;font-weight:650;color:var(--mu);line-height:1.3}.th .v-img.on span{color:var(--ac)}
.v-img img{display:block;width:100%;height:auto;border-radius:10px;border:1px solid var(--bd);box-shadow:0 8px 24px -16px rgba(16,24,40,.4)}
.v-b{padding:24px 26px 20px;display:flex;flex-direction:column}
.v-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-bottom:8px}
.tp{padding:3px 9px;border-radius:999px;background:var(--slbg);color:var(--sl);font-size:11.5px;font-weight:800}
.rl{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 7px;border-radius:999px;font-size:11.5px;font-weight:700}
.rl-profesional{background:#e8f0fe;color:#1d4ed8}.rl-coordinador{background:#fdf0e9;color:#d74009}.rl-director{background:#f1effc;color:#5b4bb7}
.v h3,section.sec .v h3{margin:2px 0 6px;font-size:21px;font-weight:800;letter-spacing:-.01em}
.v-para{margin:0 0 16px;font-size:15.5px;color:var(--mu)}
.v-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.v-cols p{margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.v-cols ul{margin:0;padding-left:16px;font-size:13.5px;line-height:1.5}.v-cols li{margin:3px 0}
.v-cols .no{font-size:13px;color:var(--mu)}
.v-pie{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:auto;padding-top:16px}
.v-pie .hu{padding:3px 8px;border-radius:7px;border:1px solid var(--acbd);background:var(--acbg);color:var(--ac);font:800 11.5px ui-monospace,Menlo,monospace;text-decoration:none}
.v-pie .go{margin-left:auto;font-weight:700;font-size:14px;text-decoration:none}.v-pie .go:hover{text-decoration:underline}
dialog.lb{max-width:min(1200px,94vw);padding:0;border:0;border-radius:16px;background:var(--pn);box-shadow:0 30px 80px -20px rgba(0,0,0,.5)}
dialog.lb::backdrop{background:rgba(15,18,30,.6)}dialog.lb img{display:block;width:100%;height:auto}
dialog.lb button{position:absolute;right:12px;top:12px;padding:8px 12px;border:0;border-radius:10px;background:var(--pn);font:700 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2)}
@media (max-width:1000px){.v{grid-template-columns:1fr}.v-g{border-right:0;border-bottom:1px solid var(--bd)}.v-cols{grid-template-columns:1fr}.mr{grid-template-columns:1fr}.mc+.mc::before{display:none}.where{grid-template-columns:1fr}}
</style>'''

M = SU['menu']
where = '<div class="where"><figure class="side-img"><img src="img/superficie/menu.jpg" alt="Menú real del IVC en la demo, con la sección Control de acceso y sus tres entradas" width="274"><figcaption>Menú del IVC en la demo</figcaption></figure><div><p>%s</p><p>Las %d vistas del módulo se llegan desde estas tres entradas del menú. El resto del IVC sigue igual.</p></div></div>' % (e(M['nota']), len(V))


def chips(ids): return ''.join('<a href="#v-%s">%s</a>' % (i, e(V[i]['n'].split(' · ')[-1])) for i in ids)


mapa = '<div class="map">' + ''.join(
    '<div class="mr"><div class="mc in"><small>Menú</small>%s</div><div class="mc"><small>Abre</small>%s</div><div class="mc"><small>Desde ahí</small>%s</div>%s</div>' % (
        e(m['entrada']), chips(m['principal']), chips(m['abre']),
        '<div class="mc"><small>Ventanas de confirmación</small>%s</div>' % chips(m['desde_ficha']) if m.get('desde_ficha') else '<div class="mc vac"></div>')
    for m in SU['mapa']) + '</div>'


def vista(i):
    v = V[i]
    lst = lambda xs: '<ul>%s</ul>' % ''.join('<li>%s</li>' % e(x) for x in xs) if xs else '<span class="no">—</span>'
    hus = ''.join('<a class="hu" href="index.html#hu/%s" target="_top">%s</a>' % (h.lower(), e(h)) for h in v['historias'])
    im = v['imgs']
    gal = ('<div class="v-g"><button type="button" class="v-img" aria-label="Ampliar: %s"><img src="img/superficie/%s" alt="%s" loading="lazy"><span class="cap">%s</span></button>%s</div>' % (
        e(im[0][1]), e(im[0][0]), e(v['n'] + ' · ' + im[0][1]), e(im[0][1]),
        '<div class="th">%s</div>' % ''.join('<button type="button" class="v-img v-t%s" aria-label="Ver: %s"><img src="img/superficie/%s" alt="%s" loading="lazy"><span>%s</span></button>' % (
            ' on' if j == 0 else '', e(c), e(f), e(v['n'] + ' · ' + c), e(c)) for j, (f, c) in enumerate(im)) if len(im) > 1 else '')) if im else ''
    return ('<li class="v%s" id="v-%s">%s'
            '<div class="v-b"><div class="v-top"><span class="tp">%s</span>%s</div><h3>%s</h3><p class="v-para">%s</p>'
            '<div class="v-cols"><div><p>Qué tiene</p>%s</div><div><p>Qué se puede hacer</p>%s</div><div><p>Estados y errores</p>%s</div></div>'
            '<div class="v-pie">%s<a class="go" href="%s" target="_blank" rel="noopener">Abrir en la demo →</a></div></div></li>') % (
        '' if im else ' sin-img', i, gal, e(v['tipo']),
        ''.join('<span class="rl rl-%s">%s%s</span>' % (r, ICON[r], ROL[r]) for r in v['roles']),
        e(v['n']), e(v['para']), lst(v['contiene']), lst(v['acciones']), lst(v['estados']), hus, e(demo(v)))


dep = ''.join('<tr><td><b>%s</b></td><td><span class="pill">%s</span></td><td>%s</td></tr>' % (e(d['que']), e(d['de']), e(d['nota'])) for d in SU['dependencias'])
body = ('<h2>Dónde vive en el IVC</h2><p class="sub">Una sección nueva del menú, con tres entradas.</p>%s'
        '<h2>Mapa de vistas</h2><p class="sub">Desde cada entrada del menú, a qué vista se llega. Toca una para ir a su detalle.</p>%s') % (where, mapa)
body += ''.join('<section id="%s"><h2>%s</h2><p class="sub">%s</p><ol class="vs">%s</ol></section>' % (g['id'], e(g['titulo']), e(g['sub']), ''.join(vista(i) for i in g['vistas'])) for g in SU['grupos'])
body += '<h2>De qué depende</h2><div class="tw"><table><thead><tr><th>Qué</th><th>De quién</th><th>Nota</th></tr></thead><tbody>%s</tbody></table></div>' % dep
body += '<dialog class="lb" id="lb"><button type="button" id="lbx">Cerrar</button><img id="lbi" alt=""></dialog>'
js = '''<script>(function(){var d=document.getElementById('lb'),i=document.getElementById('lbi');
document.addEventListener('click',function(ev){var t=ev.target.closest('.th .v-img');if(t){var g=t.closest('.v-g'),big=g.querySelector(':scope>.v-img'),ti=t.querySelector('img');big.querySelector('img').src=ti.src;big.querySelector('img').alt=ti.alt;big.querySelector('.cap').textContent=t.querySelector('span').textContent;[].forEach.call(g.querySelectorAll('.th .v-img'),function(x){x.classList.toggle('on',x===t)});return}
var b=ev.target.closest('.v-img');if(b){var im=b.querySelector('img');i.src=im.src;i.alt=im.alt;d.showModal()}});
document.getElementById('lbx').addEventListener('click',function(){d.close()});d.addEventListener('click',function(ev){if(ev.target===d)d.close()})})();</script>'''

html = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Superficie · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body class="wide"><main>'
        '<header><h1>Superficie del módulo</h1><p class="sub">Las %d vistas que conforman Gestión de infractores: dónde viven en el IVC, cómo se llega a cada una, quién la ve, qué tiene y qué se puede hacer.</p></header>'
        '%s</main>%s<script src="assets/entrega.js"></script></body></html>') % (CSS, len(V), body, js)
open(R + '/docs/superficie.html', 'w', encoding='utf-8').write(html)

# ── spec markdown ──
md = ['# Superficie · Gestión de infractores (IVC SVN, fase 1)', '',
      'Inventario de las %d vistas del módulo: dónde viven, cómo se navega entre ellas, quién las ve, qué contienen, qué acciones ofrecen y qué estados manejan.' % len(V), '',
      '## Dónde vive', '', M['nota'], '', 'Sección **%s** en el menú del IVC, con tres entradas: %s.' % (M['sec'], ', '.join(M['items'])), '',
      '## Mapa de navegación', '', '| Entrada del menú | Abre | Desde ahí | Ventanas de confirmación |', '|---|---|---|---|']
nm = lambda ids: ', '.join(V[i]['n'] for i in ids) or '—'
md += ['| %s | %s | %s | %s |' % (m['entrada'], nm(m['principal']), nm(m['abre']), nm(m.get('desde_ficha', []))) for m in SU['mapa']]
md += ['', '## Resumen de vistas', '', '| Vista | Tipo | Ruta | Quién la ve | Historias |', '|---|---|---|---|---|']
md += ['| %s | %s | `%s` | %s | %s |' % (V[i]['n'], V[i]['tipo'], V[i]['ruta'], ', '.join(ROL[r] for r in V[i]['roles']), ', '.join(V[i]['historias']) or '—') for g in SU['grupos'] for i in g['vistas']]
for g in SU['grupos']:
    md += ['', '## %s' % g['titulo'], '', g['sub']]
    for i in g['vistas']:
        v = V[i]
        md += ['', '### %s' % v['n'], '', '- **Tipo:** %s' % v['tipo'], '- **Ruta:** `%s`' % v['ruta'], '- **Quién la ve:** %s' % ', '.join(ROL[r] for r in v['roles']),
               '- **Para qué:** %s' % v['para'], '- **Capturas:** %s' % (', '.join(c for _, c in v['imgs']) or '—'), '- **Historias:** %s' % (', '.join(v['historias']) or '—'), '', '**Qué tiene**', ''] + ['- ' + x for x in v['contiene']]
        md += ['', '**Acciones**', ''] + ['- ' + x for x in v['acciones']]
        if v['estados']: md += ['', '**Estados y errores**', ''] + ['- ' + x for x in v['estados']]
md += ['', '## Dependencias', '', '| Qué | De quién | Nota |', '|---|---|---|'] + ['| %s | %s | %s |' % (d['que'], d['de'], d['nota']) for d in SU['dependencias']]
md += ['', '## Criterios de aceptación', '',
       '- [ ] Las %d vistas existen con el contenido, las acciones y los estados descritos.' % len(V),
       '- [ ] Cada vista se muestra solo a los roles indicados; las acciones respetan la matriz de Roles.',
       '- [ ] La navegación sigue el mapa: menú → vista → ficha → confirmaciones.',
       '- [ ] Ninguna pantalla actual del IVC cambia; el módulo entra como sección nueva del menú.', '']
open(R + '/docs/spec/superficie.md', 'w', encoding='utf-8').write('\n'.join(md))
print('ok superficie.html + spec/superficie.md ·', len(V), 'vistas')
