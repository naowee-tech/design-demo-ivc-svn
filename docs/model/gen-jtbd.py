#!/usr/bin/env python3
"""Genera docs/trabajos.html (Para qué existe) desde docs/model/jtbd.json."""
import json, os
from html import escape as e

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = json.load(open(R + '/docs/model/jtbd.json', encoding='utf-8'))

CSS = '''<style>
:root{--bg:#f4f5f9;--pn:#fff;--tx:#1f2330;--mu:#5d6280;--bd:#e3e6f0;--ac:#d74009;--okbg:#e3f5e9;--ok:#166534}
@media (prefers-color-scheme:dark){:root{--bg:#0e1117;--pn:#171b24;--tx:#e8eaf0;--mu:#9ba1b6;--bd:#2a2f3b;--ac:#ff8a5c;--okbg:#14301f;--ok:#7ee2a3}}
*{box-sizing:border-box}body{margin:0}
.fondo{margin:24px 0 0;padding:40px 44px;border-radius:22px;background:var(--ac);color:var(--onac,#fff);box-shadow:var(--sh)}
.fondo p.k{margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;opacity:.85}
.fondo h2{margin:0;font-size:clamp(26px,3.2vw,36px);line-height:1.18;font-weight:800;letter-spacing:-.015em;max-width:24ch}
.fondo p.t{margin:16px 0 0;font-size:17px;line-height:1.55;max-width:62ch;opacity:.92}
.fondo small{display:block;margin-top:18px;font-size:12px;opacity:.75}
.jobs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin:0;padding:0;list-style:none;counter-reset:job}
.job{display:flex;flex-direction:column;padding:28px 30px 24px;background:var(--pn);border:1px solid var(--bd);border-radius:20px;box-shadow:var(--sh)}
.job .n{display:grid;place-items:center;width:44px;height:44px;margin:0 0 18px;border-radius:13px;background:var(--acbg);border:1px solid var(--acbd);color:var(--ac);font-size:17px;font-weight:800}
.job h3,section.sec .job h3{margin:0 0 18px;font-size:22px;line-height:1.25;font-weight:800;letter-spacing:-.01em}
.job dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:15.5px;line-height:1.5}
.job dt{font-weight:800;color:var(--ac);font-size:12px;letter-spacing:.07em;text-transform:uppercase;padding-top:3px}
.job dd{margin:0}
.job .bien{margin:20px 0 0;padding:14px 16px;border-radius:14px;background:var(--okbg);color:var(--tx);font-size:14.5px;line-height:1.5}
.job .bien b{display:block;margin:0 0 2px;color:var(--ok);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase}
.job .pie{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:auto;padding-top:18px}
.job .pie a{font-weight:700;font-size:14px;text-decoration:none}.job .pie a:hover{text-decoration:underline}
.job .pie small{flex-basis:100%;color:var(--mu);font-size:12px}
@media (max-width:860px){.jobs{grid-template-columns:1fr}.fondo{padding:28px 24px}.job{padding:22px}}
</style>'''


def job(i, t):
    ir = ''.join('<a href="%s" target="_top">%s →</a>' % (e(u), e(l)) for l, u in t['ir'])
    return ('<li class="job"><span class="n" aria-hidden="true">%d</span><h3>%s</h3>'
            '<dl><dt>Cuando</dt><dd>%s</dd><dt>Quiero</dt><dd>%s</dd><dt>Para</dt><dd>%s</dd></dl>'
            '<p class="bien"><b>Lo hacemos bien si</b>%s</p>'
            '<div class="pie">%s<small>De: %s</small></div></li>') % (
        i, e(t['titulo']), e(t['cuando']), e(t['quiero']), e(t['para']), e(t['bien']), ir, e(t['fuente']))


F = J['fondo']
body = ('<div class="fondo" id="fondo"><p class="k">El trabajo de fondo</p><h2>%s</h2><p class="t">%s</p><small>De: %s</small></div>'
        '<section id="trabajos" class="nonum"><h2>Los %d trabajos que el módulo debe hacer bien</h2><p class="sub">Cada uno dice en qué momento aparece, qué se necesita y cómo sabremos que está bien resuelto. El detalle de cada uno vive en las demás pestañas.</p>'
        '<ol class="jobs">%s</ol></section>') % (
    e(F['titulo']), e(F['texto']), e(F['fuente']), len(J['trabajos']),
    ''.join(job(i + 1, t) for i, t in enumerate(J['trabajos'])))

html = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Para qué existe · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body><main>'
        '<header><h1>Para qué existe el módulo</h1><p class="sub">Gestión de infractores del IVC, contada en lo que tiene que lograr. Sale de la HU-26.3, en palabras de todos los días.</p></header>'
        '%s</main><script src="assets/entrega.js"></script></body></html>') % (CSS, body)
open(R + '/docs/trabajos.html', 'w', encoding='utf-8').write(html)
print('ok trabajos.html ·', len(J['trabajos']), 'trabajos')
