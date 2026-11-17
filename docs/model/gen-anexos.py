#!/usr/bin/env python3
"""Genera docs/anexos.html (insumos, specs y enlaces) desde docs/model/anexos.json."""
import json, os
from html import escape as e
from urllib.parse import quote

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = json.load(open(R + '/docs/model/anexos.json', encoding='utf-8'))
JI = 'https://naowee.atlassian.net/browse/'
JA = 'https://naowee.atlassian.net/secure/attachment/%d/%s'

CSS = '''<style>
.ax{display:grid;gap:14px;margin:0;padding:0;list-style:none}
.ax li{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:18px;padding:20px 24px;background:var(--pn);border:1px solid var(--bd);border-radius:18px;box-shadow:var(--sh)}
.ext{display:grid;place-items:center;width:52px;height:52px;border-radius:14px;font:800 11.5px/1 ui-monospace,Menlo,monospace;letter-spacing:.04em}
.ext.docx{background:#e8effd;color:#1d4ed8}.ext.xlsx{background:var(--okbg);color:var(--ok)}.ext.md{background:var(--slbg);color:var(--sl)}
.ax b{display:block;font-size:16.5px}.ax p{margin:3px 0 0;color:var(--mu);font-size:14.5px;line-height:1.45}
.ax small{display:block;margin-top:6px;color:var(--mu);font-size:12px}
.acc{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.acc a{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:11px;font-size:13.5px;font-weight:700;text-decoration:none;white-space:nowrap}
.acc a.d{background:var(--ac);color:var(--onac)}.acc a.d:hover{filter:brightness(.94)}
.acc a.j{border:1.5px solid var(--bd);color:var(--tx)}.acc a.j:hover{border-color:var(--ac);color:var(--ac)}
.lk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0;padding:0;list-style:none}
.lk a{display:block;height:100%;padding:18px 22px;background:var(--pn);border:1px solid var(--bd);border-radius:16px;box-shadow:var(--sh);color:var(--tx);text-decoration:none}
.lk a:hover{border-color:var(--ac)}.lk b{display:block;font-size:16px;color:var(--ac)}.lk span{color:var(--mu);font-size:14px}
@media (max-width:760px){.ax li{grid-template-columns:auto 1fr}.acc{grid-column:1 / -1;justify-content:flex-start}.lk{grid-template-columns:1fr}}
</style>'''


def peso(p):
    b = os.path.getsize(R + '/docs/' + p)
    return '%.1f MB' % (b / 1048576) if b > 1048576 else '%d KB' % round(b / 1024)


def item(t, d, p, tarea, att):
    ext = p.rsplit('.', 1)[1]
    fn = p.rsplit('/', 1)[1]
    jira = '<a class="j" href="%s" target="_blank" rel="noopener">Adjunto en %s ↗</a>' % (e(JA % (att, quote(fn))), tarea) if att else \
           '<a class="j" href="%s" target="_blank" rel="noopener">%s ↗</a>' % (JI + tarea, tarea)
    return ('<li><span class="ext %s">%s</span><div><b>%s</b><p>%s</p><small>%s · %s</small></div>'
            '<div class="acc"><a class="d" href="%s" download>Descargar</a>%s</div></li>') % (
        ext, ext.upper(), e(t), e(d), e(fn), peso(p), e(quote(p)), jira)


body = ''.join('<section id="%s"><h2>%s</h2><p class="sub">%s</p><ul class="ax">%s</ul></section>' % (
    g['id'], e(g['titulo']), e(g['sub']), ''.join(item(*i) for i in g['items'])) for g in J['grupos'])
body += '<section id="enlaces"><h2>Enlaces</h2><p class="sub">Dónde vive cada cosa.</p><ul class="lk">%s</ul></section>' % ''.join(
    '<li><a href="%s" target="_blank" rel="noopener"><b>%s ↗</b><span>%s</span></a></li>' % (e(u), e(t), e(d)) for t, u, d in J['enlaces'])

html = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Anexos · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body><main>'
        '<header><h1>Anexos</h1><p class="sub">Los insumos del IVC y los specs de la entrega, para descargar aquí o abrir directo en su tarea de Jira.</p></header>'
        '%s</main><script src="assets/entrega.js"></script></body></html>') % (CSS, body)
open(R + '/docs/anexos.html', 'w', encoding='utf-8').write(html)
print('ok anexos.html')
