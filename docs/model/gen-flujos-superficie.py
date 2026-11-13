#!/usr/bin/env python3
"""Genera docs/flujos.html y docs/spec/flujos.md desde docs/model/flujos.json.
Uso: python3 docs/model/gen-flujos-superficie.py"""
import json, os, html
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda n: json.load(open(R + '/docs/model/%s.json' % n, encoding='utf-8'))
FL, SU, RO = J('flujos'), J('superficie'), J('roles')
ROL = {r['id']: r['label'] for r in RO['roles']}
e = html.escape
DEMO = '../suid/app.html'
CSS = '''<style>
:root{--bg:#f6f7fb;--pn:#fff;--tx:#282834;--mu:#646587;--bd:#e7e9f3;--ac:#d74009;--okbg:#e3f5e9;--ok:#166534;--wabg:#fdf0dc;--wa:#92400e;--slbg:#eceff4;--sl:#3f4a5c;--rebg:#fde8e8;--re:#9b1c1c;--code:#f0f1f7;--acbg:#fdeee6;--onac:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#0f1218;--pn:#171b24;--tx:#e8eaf0;--mu:#9aa0b4;--bd:#2a2e38;--ac:#ff8a5c;--okbg:#14301f;--ok:#7ee2a3;--wabg:#3a2810;--wa:#fbc27f;--slbg:#262d3a;--sl:#c3cbd8;--rebg:#3b1d1d;--re:#fca5a5;--code:#1f2430;--acbg:#3a2117;--onac:#171b24}}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.55 Inter,system-ui,-apple-system,Arial,sans-serif}
main{max-width:1000px;margin:0 auto;padding:0 16px 64px}header{padding:32px 0 8px}h1{margin:0 0 6px;font-size:28px}h2{margin:32px 0 6px;font-size:20px}h3{margin:0 0 6px;font-size:16px}
.sub,.mu{color:var(--mu)}.sub{margin:0 0 14px}a{color:var(--ac)}a:focus-visible,button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.card{background:var(--pn);border:1px solid var(--bd);border-radius:14px;padding:18px 20px;margin:12px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.tw{overflow-x:auto;background:var(--pn);border:1px solid var(--bd);border-radius:14px}table{width:100%;border-collapse:collapse;font-size:13.5px}th{text-align:left;padding:10px 12px;border-bottom:1px solid var(--bd);font-size:12px;color:var(--mu)}td{padding:10px 12px;border-bottom:1px solid var(--bd);vertical-align:top}tr:last-child>*{border-bottom:0}
.pill{display:inline-block;margin:0 4px 2px 0;padding:2px 9px;border-radius:999px;background:var(--slbg);color:var(--sl);font-size:12px;font-weight:700}
.tg{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:800}.tg-n{background:var(--okbg);color:var(--ok)}.tg-a{background:var(--rebg);color:var(--re)}.tg-m{background:var(--wabg);color:var(--wa)}.tg-s{background:var(--slbg);color:var(--sl)}
.prop{display:inline-block;padding:2px 10px;border:1px dashed var(--mu);border-radius:999px;font-size:12px;font-weight:700;color:var(--mu)}
.seglbl{margin:4px 0 6px;font-size:13px;color:var(--mu)}.seglbl b{color:var(--tx)}.seg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 16px;scroll-margin-top:12px}.seg button{display:flex;gap:10px;align-items:flex-start;text-align:left;font:inherit;color:var(--tx);background:var(--pn);border:1.5px solid var(--bd);border-radius:12px;padding:12px;cursor:pointer;transition:border-color .15s,background .15s}.seg button:hover{border-color:var(--ac);background:var(--acbg)}.seg button[aria-selected=true]{border-color:var(--ac);background:var(--acbg);box-shadow:inset 0 0 0 1px var(--ac)}.seg .n{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--slbg);color:var(--sl);font-weight:800;font-size:13px}.seg [aria-selected=true] .n{background:var(--ac);color:var(--onac)}.seg b{display:block;font-size:14px;line-height:1.25}.seg small{display:block;margin-top:3px;color:var(--mu);font-size:12px;line-height:1.3}.panel[hidden]{display:none}.pvn{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)}.pv{font:700 13px Inter,system-ui,sans-serif;color:var(--ac);background:none;border:1.5px solid var(--bd);border-radius:10px;padding:8px 12px;cursor:pointer}.pv:hover{border-color:var(--ac);background:var(--acbg)}@media (max-width:560px){.seg{grid-template-columns:repeat(2,1fr)}.seg button{padding:10px;gap:8px}}
ol,ul{padding-left:20px;margin:6px 0}li{margin:4px 0}.flow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}.st{padding:6px 12px;border-radius:999px;border:1px solid var(--bd);background:var(--pn);font-size:13px;font-weight:600}.arr{color:var(--mu)}
.menu{background:var(--pn);border:1px solid var(--bd);border-radius:12px;padding:12px 14px;font-size:13px}.menu b{display:block;margin:10px 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--mu)}.menu b:first-child{margin-top:0}.menu div{padding:3px 8px;border-radius:6px}.menu .new{background:var(--okbg);color:var(--ok);font-weight:700}
.panel>.card{background:none;border:0;box-shadow:none;padding:8px 0 0;margin:0}.cv{position:relative;height:min(80vh,780px);min-height:460px;margin:16px 0 14px;overflow:hidden;border:1px solid var(--bd);border-radius:20px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 18px 40px -22px rgba(16,24,40,.28);cursor:grab;touch-action:none;user-select:none;background-color:var(--bg);background-image:radial-gradient(circle,color-mix(in srgb,var(--mu) 28%,transparent) 1px,transparent 1.2px);background-size:22px 22px}.cv.drag{cursor:grabbing}.cv:focus-visible{outline:2px solid var(--ac);outline-offset:2px}.cv-in{position:absolute;left:0;top:0;transform-origin:0 0}.dg{display:block;overflow:visible}.cv .lane{fill:none;stroke:none}.cv .lane.l1{stroke:none;fill:color-mix(in srgb,var(--ac) 4%,transparent)}.cv .lt{fill:var(--ac);opacity:.85}.cv-tb{position:absolute;right:12px;top:12px;z-index:2;display:flex;align-items:center;gap:2px;padding:4px;background:var(--pn);border:1px solid var(--bd);border-radius:12px;box-shadow:0 6px 18px -10px rgba(16,24,40,.35)}.cv-tb button{min-width:34px;height:32px;padding:0 10px;font:700 13px system-ui,sans-serif;color:var(--tx);background:none;border:0;border-radius:8px;cursor:pointer}.cv-tb button:hover{background:var(--bg);color:var(--ac)}.cv-tb output{min-width:48px;text-align:center;font:700 12px system-ui,sans-serif;color:var(--mu);font-variant-numeric:tabular-nums}.cv-tb i{width:1px;height:20px;background:var(--bd);margin:0 4px}.cv-ay{position:absolute;left:12px;bottom:12px;z-index:2;padding:6px 10px;border-radius:9px;background:color-mix(in srgb,var(--pn) 88%,transparent);border:1px solid var(--bd);font-size:12px;color:var(--mu);pointer-events:none}.cv.max,.cv:fullscreen{position:fixed;inset:0;z-index:60;height:auto;margin:0;border:0;border-radius:0}.wide main{max-width:1340px}.lane{fill:var(--bg);stroke:var(--bd)}.lane.l1{fill:none;stroke-dasharray:4 4}.lt{font:800 10.5px Inter,system-ui,sans-serif;fill:var(--mu);letter-spacing:.06em}
.nd{stroke-width:1.5}.nd.ini{fill:var(--slbg);stroke:var(--sl)}.nd.pas{fill:var(--pn);stroke:var(--mu)}.nd.dec{fill:var(--wabg);stroke:var(--wa)}.nd.err{fill:var(--rebg);stroke:var(--re);stroke-width:2}.nd.est{fill:var(--okbg);stroke:var(--ok);stroke-width:3}.nd.psu{fill:var(--wabg);stroke:var(--wa);stroke-width:3}.nd.vac{fill:var(--bg);stroke:var(--mu);stroke-dasharray:5 4}.nd.not{fill:none;stroke:var(--mu);stroke-dasharray:2 4}
.tx{font:600 12px Inter,system-ui,sans-serif;fill:var(--tx)}.tx.est{font-weight:800;fill:var(--ok)}.tx.psu{font-weight:800;fill:var(--wa)}.tx.err{fill:var(--re)}.tx.not{font-style:italic;fill:var(--mu)}
.ed{fill:none;stroke:var(--mu);stroke-width:1.6}.ed.ba{stroke:var(--re);stroke-dasharray:6 4}.ed.no{stroke-dasharray:2 3}.ah{fill:var(--mu)}.ah.b{fill:var(--re)}.el{font:800 11.5px Inter,system-ui,sans-serif;fill:var(--mu);paint-order:stroke;stroke:var(--pn);stroke-width:4px;stroke-linejoin:round}.el.si{fill:var(--ok)}.el.no,.el.ba{fill:var(--re)}
.ley{display:flex;gap:6px 14px;flex-wrap:wrap;font-size:12px;color:var(--mu);margin:0 0 6px}.ley span{display:inline-flex;align-items:center;gap:6px}.k{display:inline-block;width:14px;height:14px;border-radius:4px;border:1.5px solid var(--mu);background:var(--pn)}.k.ini{background:var(--slbg);border-color:var(--sl);border-radius:7px}.k.dec{background:var(--wabg);border-color:var(--wa);transform:rotate(45deg) scale(.8)}.k.err{background:var(--rebg);border-color:var(--re)}.k.vac{background:var(--bg);border-style:dashed}.k.not{background:none;border-style:dotted}.k.est{background:var(--okbg);border:3px solid var(--ok)}.k.psu{background:var(--wabg);border:3px solid var(--wa)}.kl{display:inline-block;width:22px;border-top:2px dashed var(--re)}
.st.s-ok{background:var(--okbg);color:var(--ok);border-color:var(--ok)}.st.s-wa{background:var(--wabg);color:var(--wa);border-color:var(--wa)}.st.s-sl{background:var(--slbg);color:var(--sl);border-color:var(--sl)}
details{margin-top:10px}summary{cursor:pointer;font-weight:700;color:var(--mu);font-size:13px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}.lbl{font-size:12px;font-weight:800;color:var(--mu);margin:0 0 6px}
</style>'''
def page(titulo, sub, cuerpo, script='', cls=''):
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s · IVC SVN</title>%s<link rel="stylesheet" href="assets/entrega.css"></head><body class="%s"><main><header><h1>%s</h1><p class="sub">%s</p></header>%s</main>%s<script src="assets/entrega.js"></script></body></html>' % (e(titulo), CSS, cls, e(titulo), e(sub), cuerpo, script)
def li(xs, tag='ul'): return '<%s>%s</%s>' % (tag, ''.join('<li>%s</li>' % e(x) for x in xs), tag) if xs else '<p class="mu">—</p>'
ESTCL = {'Validado': 's-ok', 'Activa': 's-ok', 'Por subsanar': 's-wa'}
def estados():
    out = ''
    for k in ('registro', 'restriccion'):
        s = FL['estados'][k]
        out += '<div class="card"><h3>%s</h3>%s<p class="sub" style="margin:0">%s</p></div>' % (e(s['titulo']), ''.join('<div class="flow">%s</div>' % '<span class="arr">→</span>'.join('<span class="st %s">%s</span>' % (ESTCL.get(p, 's-sl'), e(p)) for p in r) for r in s['rutas']), e(s['nota']))
    return '<div class="grid">%s</div>' % out


import textwrap
NW, NH, DH, GX, ROWH, PX, PY = 160, 76, 104, 60, 136, 24, 6
COLW = NW + GX
CLS = {'inicio': 'ini', 'paso': 'pas', 'decision': 'dec', 'error': 'err', 'estado': 'est', 'subsanar': 'psu', 'vacio': 'vac', 'nota': 'not'}
AVISOS = []
def envuelve(t, n): return textwrap.wrap(t, n) or ['']
def _ruta(a, s, t):
    m = a[3] if len(a) > 3 else ''
    if m == 'nota': return 'nota'
    if s['c'] == t['c']: return 'vert'
    if m == 'atras' or t['c'] < s['c']: return 'lazo' if s['r'] == t['r'] else 'atras'
    if s['r'] == t['r']: return 'recta'
    return 'v' if m == 'v' or (s['t'] == 'decision' and m != 'h') else 'h'
def _lados(k, s, t):
    abajo = t['r'] > s['r']
    return {'nota': ('B', 'T'), 'vert': ('B', 'T') if abajo else ('T', 'B'), 'lazo': ('T', 'T'), 'atras': ('L', 'T' if abajo else 'B'),
            'recta': ('R', 'L'), 'v': ('B' if abajo else 'T', 'L'), 'h': ('R', 'T' if abajo else 'B')}[k]
def _punto(p, lado, off):
    # Los rombos salen y entran por su vértice: un desplazamiento lo despegaría del borde.
    if p['t'] == 'decision': off = 0
    return {'T': (p['cx'] + off, p['y']), 'B': (p['cx'] + off, p['y'] + p['h']), 'L': (p['x'], p['cy'] + off), 'R': (p['x'] + p['w'], p['cy'] + off)}[lado]
def diagrama(g, uid, titulo='el flujo'):
    cols = max(n[3] for n in g['nodos']) + 1; rows = max(c[2] for c in g['carriles']) + 1
    W = PX * 2 + cols * COLW - GX; H = PY * 2 + rows * ROWH
    pos = {}
    for id_, tipo, r, c, txt in g['nodos']:
        h = DH if tipo == 'decision' else NH; x = PX + c * COLW; cy = PY + r * ROWH + ROWH / 2 + 8
        lin = envuelve(txt, 16 if tipo == 'decision' else 22)
        if len(lin) > (3 if tipo == 'decision' else 4): AVISOS.append('%s/%s: texto de %d líneas' % (uid, id_, len(lin)))
        pos[id_] = dict(t=tipo, x=x, y=cy - h / 2, w=NW, h=h, cx=x + NW / 2, cy=cy, lin=lin, c=c, r=r)
    eds = []
    for a in g['aristas']:
        s, t = pos[a[0]], pos[a[1]]; k = _ruta(a, s, t); ls, lt = _lados(k, s, t)
        eds.append(dict(a=a, s=s, t=t, k=k, ls=ls, lt=lt, os=0, ot=0))
    # Dos aristas en el mismo lado de un nodo se separan para que no parezcan una sola.
    grupos = {}
    for i, e_ in enumerate(eds):
        grupos.setdefault((e_['a'][0], e_['ls']), []).append((i, 's', e_['t'])); grupos.setdefault((e_['a'][1], e_['lt']), []).append((i, 't', e_['s']))
    for (nid, lado), xs in grupos.items():
        if len(xs) < 2: continue
        xs.sort(key=lambda z: z[2]['cx'] if lado in 'TB' else z[2]['cy'])
        paso = 30 if lado in 'TB' else 18
        for j, (i, cual, _) in enumerate(xs): eds[i]['o' + cual] = (j - (len(xs) - 1) / 2) * paso
    out = ['<svg class="dg" viewBox="0 0 %d %d" width="%d" height="%d" role="img" aria-label="Diagrama: %s" xmlns="http://www.w3.org/2000/svg">' % (W, H, W, H, e(titulo)),
           '<defs>%s</defs>' % ''.join('<marker id="%s-%s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah %s"/></marker>' % (uid, k, k) for k in ('n', 'b'))]
    for i, (lab, r0, r1) in enumerate(g['carriles']):
        y0 = PY + r0 * ROWH; hh = (r1 - r0 + 1) * ROWH
        out.append('<rect x="2" y="%d" width="%d" height="%d" rx="10" class="lane l%d"/><text x="14" y="%d" class="lt">%s</text>' % (y0 + 2, W - 4, hh - 4, i % 2, y0 + 19, e(lab.upper())))
    segs, etq = [], []
    for e_ in eds:
        s, t, k, a = e_['s'], e_['t'], e_['k'], e_['a']
        (px, py), (qx, qy) = _punto(s, e_['ls'], e_['os']), _punto(t, e_['lt'], e_['ot'])
        if k in ('vert', 'nota'): pts = [(qx, py), (qx, qy)]
        elif k == 'recta': pts = [(px, py), (qx, qy)] if py == qy else [(px, py), ((px + qx) / 2, py), ((px + qx) / 2, qy), (qx, qy)]
        elif k == 'v': pts = [(px, py), (px, qy), (qx, qy)]
        elif k in ('h', 'atras'): pts = [(px, py), (qx, py), (qx, qy)]
        else: yt = min(s['y'], t['y']) - 16; pts = [(px, py), (px, yt), (qx, yt), (qx, qy)]
        segs += [(pts[j], pts[j + 1], a[0], a[1], k) for j in range(len(pts) - 1)]
        cls = 'ed' + {'atras': ' ba', 'lazo': ' ba', 'nota': ' no'}.get(k, '')
        mk = '' if k == 'nota' else ' marker-end="url(#%s-%s)"' % (uid, 'b' if k in ('atras', 'lazo') else 'n')
        out.append('<path d="M%s" class="%s"%s/>' % (' L'.join('%g %g' % p for p in pts), cls, mk))
        lab = a[2] if len(a) > 2 else ''
        if lab:
            if k in ('atras', 'lazo'): j = 1 if k == 'lazo' else 0; lx, ly, an = (pts[j][0] + pts[j + 1][0]) / 2, pts[j][1] - 7, 'middle'
            elif e_['ls'] == 'R': lx, ly, an = px + 8, py - 8, 'start'
            elif e_['ls'] == 'B': lx, ly, an = px + 8, py + 17, 'start'
            else: lx, ly, an = px + 8, py - 9, 'start'
            # El color sigue al destino, no a la palabra: un «No» puede ser el camino feliz.
            c_ = 'ba' if k in ('atras', 'lazo') else 'no' if t['t'] == 'error' else 'si' if t['t'] in ('estado', 'subsanar') else ''
            etq.append('<text x="%g" y="%g" class="el %s" text-anchor="%s">%s</text>' % (lx, ly, c_, an, e(lab)))
    for id_, p_ in pos.items():
        t = p_['t']; x, y, w, h = p_['x'], p_['y'], p_['w'], p_['h']
        if t == 'decision': shape = '<polygon points="%g,%g %g,%g %g,%g %g,%g" class="nd dec"/>' % (x + w / 2, y, x + w, y + h / 2, x + w / 2, y + h, x, y + h / 2)
        else: shape = '<rect x="%g" y="%g" width="%g" height="%g" rx="%d" class="nd %s"/>' % (x, y, w, h, 38 if t == 'inicio' else 10, CLS[t])
        ty0 = p_['cy'] - (len(p_['lin']) - 1) * 7.5 + 4
        out.append(shape + ''.join('<text x="%g" y="%g" class="tx %s" text-anchor="middle">%s</text>' % (p_['cx'], ty0 + i * 15, CLS[t], e(l)) for i, l in enumerate(p_['lin'])))
    out += etq + ['</svg>']
    # Chequeo barato: una línea que cruza un nodo ajeno es el error visual más común.
    for (x1, y1), (x2, y2), a0, a1, k in segs:
        for id_, p_ in pos.items():
            if id_ in (a0, a1): continue
            if min(x1, x2) < p_['x'] + p_['w'] + 4 and max(x1, x2) > p_['x'] - 4 and min(y1, y2) < p_['y'] + p_['h'] + 4 and max(y1, y2) > p_['y'] - 4:
                AVISOS.append('%s: arista %s→%s cruza %s' % (uid, a0, a1, id_))
    return ('<div class="cv" tabindex="0" role="region" aria-label="Lienzo del diagrama: arrastra para moverte, rueda con Ctrl o pellizco para acercar">'
            '<div class="cv-tb"><button type="button" data-z="-" aria-label="Alejar">−</button><output aria-live="polite">100 %</output><button type="button" data-z="+" aria-label="Acercar">+</button><i></i>'
            '<button type="button" data-z="fit">Ajustar</button><button type="button" data-z="max" aria-pressed="false">Pantalla completa</button></div>'
            '<div class="cv-in">' + ''.join(out) + '</div><p class="cv-ay">Arrastra para moverte · Ctrl + rueda o pellizco para acercar · Esc para salir</p></div>')
LEYENDA = ('<div class="ley"><span><i class="k ini"></i>Inicio</span><span><i class="k pas"></i>Paso</span><span><i class="k dec"></i>Decisión</span><span><i class="k err"></i>Error</span>'
           '<span><i class="k vac"></i>Estado vacío</span><span><i class="k not"></i>Nota</span><span><i class="k est"></i>Resultado</span><span><i class="k psu"></i>Queda por subsanar</span>'
           '<span><i class="kl"></i>Vuelve a corregir</span></div>')

# Lienzo: mover arrastrando, zoom con Ctrl + rueda, pellizco o botones; «Ampliar» lo lleva a toda la ventana.
CANVAS_JS = """<script>(function(){
[].forEach.call(document.querySelectorAll('.cv'),function(cv){
var inn=cv.querySelector('.cv-in'),svg=inn.querySelector('svg'),out=cv.querySelector('output'),W=+svg.getAttribute('width'),H=+svg.getAttribute('height'),k=1,x=0,y=0,MIN=.25,MAX=3,pts={},d0=0,k0=1;
function pon(){inn.style.transform='translate('+x+'px,'+y+'px) scale('+k+')';out.textContent=Math.round(k*100)+' %'}
function zoom(nk,cx,cy){nk=Math.min(MAX,Math.max(MIN,nk));var r=cv.getBoundingClientRect();if(cx==null){cx=r.width/2;cy=r.height/2}x=cx-(cx-x)*nk/k;y=cy-(cy-y)*nk/k;k=nk;pon()}
cv._fit=function(){var r=cv.getBoundingClientRect();if(!r.width)return;k=Math.min(1.1,(r.width-48)/W,(r.height-110)/H);x=(r.width-W*k)/2;y=Math.max(60,(r.height-H*k)/2);pon()};
cv.addEventListener('wheel',function(e){e.preventDefault();var r=cv.getBoundingClientRect();if(e.ctrlKey||e.metaKey)zoom(k*Math.exp(-e.deltaY*(Math.abs(e.deltaY)>=40?.002:.012)),e.clientX-r.left,e.clientY-r.top);else{x-=e.deltaX;y-=e.deltaY;pon()}},{passive:false});
cv.addEventListener('pointerdown',function(e){if(e.target.closest('.cv-tb'))return;cv.setPointerCapture(e.pointerId);pts[e.pointerId]=[e.clientX,e.clientY];cv.classList.add('drag');var v=Object.keys(pts);if(v.length===2){var a=pts[v[0]],b=pts[v[1]];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);k0=k}});
cv.addEventListener('pointermove',function(e){var p=pts[e.pointerId];if(!p)return;var v=Object.keys(pts);if(v.length===2){pts[e.pointerId]=[e.clientX,e.clientY];var a=pts[v[0]],b=pts[v[1]],r=cv.getBoundingClientRect();zoom(k0*Math.hypot(a[0]-b[0],a[1]-b[1])/d0,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);return}x+=e.clientX-p[0];y+=e.clientY-p[1];pts[e.pointerId]=[e.clientX,e.clientY];pon()});
function fin(e){delete pts[e.pointerId];if(!Object.keys(pts).length)cv.classList.remove('drag')}
cv.addEventListener('pointerup',fin);cv.addEventListener('pointercancel',fin);
function marca(on){var b=cv.querySelector('[data-z=max]');b.setAttribute('aria-pressed',String(on));b.textContent=on?'Salir de pantalla completa':'Pantalla completa';setTimeout(cv._fit,60)}function max(on){if(cv.requestFullscreen&&document.fullscreenEnabled){if(on)cv.requestFullscreen();else if(document.fullscreenElement)document.exitFullscreen();return}cv.classList.toggle('max',on);document.documentElement.style.overflow=on?'hidden':'';marca(on)}document.addEventListener('fullscreenchange',function(){marca(document.fullscreenElement===cv)});
cv.querySelector('.cv-tb').addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;var z=b.getAttribute('data-z');if(z==='+')zoom(k*1.25);else if(z==='-')zoom(k/1.25);else if(z==='fit')cv._fit();else max(!(cv.classList.contains('max')||document.fullscreenElement===cv))});
cv.addEventListener('keydown',function(e){var m={'+':function(){zoom(k*1.25)},'=':function(){zoom(k*1.25)},'-':function(){zoom(k/1.25)},'0':cv._fit,ArrowLeft:function(){x+=60;pon()},ArrowRight:function(){x-=60;pon()},ArrowUp:function(){y+=60;pon()},ArrowDown:function(){y-=60;pon()},Escape:function(){if(cv.classList.contains('max'))max(false)}}[e.key];if(m){e.preventDefault();m()}});
addEventListener('resize',function(){if(cv.offsetParent)cv._fit()});cv._fit()})})();</script>"""

# ───────── FLUJOS ─────────
def quien(rs):
    n = [ROL[r] for r in rs]; n = [n[0]] + [x.lower() for x in n[1:]]
    return n[0] if len(n) == 1 else ', '.join(n[:-1]) + ' o ' + n[-1]
FS = FL['flujos']
tabs = ''.join('<button type="button" role="tab" id="tab-%s" data-t="%s" aria-controls="%s" aria-selected="%s" tabindex="%s"><span class="n">%d</span><span><b>%s</b><small>%s</small></span></button>' % (
    f['id'], f['id'], f['id'], 'true' if i == 0 else 'false', '0' if i == 0 else '-1', i + 1, e(f['titulo']), e(quien(f['roles']))) for i, f in enumerate(FS))
def nav(i):
    a = '<button type="button" class="pv" data-ir="%s">← Anterior: %s</button>' % (FS[i - 1]['id'], e(FS[i - 1]['titulo'])) if i else '<span></span>'
    b = '<button type="button" class="pv" data-ir="%s">Siguiente: %s →</button>' % (FS[i + 1]['id'], e(FS[i + 1]['titulo'])) if i < len(FS) - 1 else '<span></span>'
    return '<nav class="pvn" aria-label="Cambiar de flujo">%s%s</nav>' % (a, b)
panels = ''
for i, f in enumerate(FS):
    panels += ('<div class="panel" id="%s" role="tabpanel" aria-labelledby="tab-%s"%s><div class="card"><h3>%d. %s</h3><p class="sub" style="margin:0 0 8px">Lo hace: %s. <span class="prop">%s</span> <a href="%s%s" target="_blank" rel="noopener">Verlo en la demo →</a></p>%s%s'
               '<details><summary>Detalle: errores, estados vacíos y reglas</summary><div class="cols"><div><p class="lbl">Errores</p>%s</div><div><p class="lbl">Estados vacíos</p>%s</div></div><p class="lbl">Reglas</p>%s</details>%s</div></div>') % (
        f['id'], f['id'], '' if i == 0 else ' hidden', i + 1, e(f['titulo']), e(quien(f['roles'])), 'HU-26.3' if f['origen'] == 'HU' else 'criterio de diseño',
        DEMO, e(f['ruta']), LEYENDA, diagrama(f['grafo'], f['id'], f['titulo']), li(f['errores']), li(f['vacios']), li(f['reglas']), nav(i))
js = """<script>(function(){var s=document.getElementById('seg'),bs=[].slice.call(s.querySelectorAll('[role=tab]'));
function ver(t,foco){bs.forEach(function(b){var on=b.getAttribute('data-t')===t;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&foco)b.focus()});[].forEach.call(document.querySelectorAll('.panel'),function(p){p.hidden=p.id!==t;var c=p.querySelector('.cv');if(!p.hidden&&c&&c._fit)c._fit()})}
s.addEventListener('click',function(e){var b=e.target.closest('[role=tab]');if(b)ver(b.getAttribute('data-t'))});
s.addEventListener('keydown',function(e){var i=bs.indexOf(document.activeElement),n=bs.length,j={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:n-1}[e.key];if(i<0||j===undefined)return;e.preventDefault();ver(bs[(j+n)%n].getAttribute('data-t'),true)});
document.addEventListener('click',function(e){var b=e.target.closest('[data-ir]');if(!b)return;ver(b.getAttribute('data-ir'));s.scrollIntoView({block:'start',behavior:'smooth'})});
function h(){var x=location.hash.slice(1),p=x&&document.getElementById(x);if(p&&p.className==='panel')ver(x)}window.addEventListener('hashchange',h);h()})();</script>""" + CANVAS_JS
body = '<h2>Estados</h2>%s<h2>Flujos</h2><p class="sub">Cada flujo con su camino feliz, sus errores y sus estados vacíos. Quién lo hace sale de la pestaña Roles.</p><p class="seglbl"><b>%d flujos</b> · elige uno para ver su diagrama</p><div class="seg" id="seg" role="tablist" aria-label="Flujos">%s</div>%s' % (estados(), len(FS), tabs, panels)
open(R + '/docs/flujos.html', 'w', encoding='utf-8').write(page('Flujos de la fase 1', 'Pasos, errores y estados vacíos de cada flujo de la gestión de infractores.', body, js, 'wide'))

md = ['# Flujos de la fase 1 · IVC SVN', '', 'Spec para dev. Fuente: `docs/model/flujos.json`. Vista: `docs/index.html#flujos`.', '', '## Estados', '']
for k in ('registro', 'restriccion'):
    s = FL['estados'][k]; md += ['- **%s:** %s. %s' % (s['titulo'], '; '.join(' → '.join(r) for r in s['rutas']), s['nota'])]
for f in FL['flujos']:
    md += ['', '## %s' % f['titulo'], '', '- **Roles:** %s' % ', '.join(ROL[r] for r in f['roles']), '- **Origen:** %s' % ('HU-26.3' if f['origen'] == 'HU' else 'criterio de diseño, por confirmar'), '- **Pantalla:** `%s`' % f['ruta'], '', '**Camino feliz**', ''] + ['%d. %s' % (i + 1, x) for i, x in enumerate(f['pasos'])]
    md += ['', '**Errores**', ''] + (['- ' + x for x in f['errores']] or ['- —']) + ['', '**Estados vacíos**', ''] + (['- ' + x for x in f['vacios']] or ['- —']) + ['', '**Reglas**', ''] + (['- ' + x for x in f['reglas']] or ['- —'])
md += ['', '## Criterios de aceptación', ''] + ['- [ ] %s: camino feliz, errores y vacíos cumplidos y enlazados a su pantalla.' % f['titulo'] for f in FL['flujos']]
md += ['- [ ] Reglas de fechas cotejadas con la hoja «Diccionario de Datos» (pendiente: hasta 5 direcciones adicionales y abreviaturas al guardar).', '']
open(R + '/docs/spec/flujos.md', 'w', encoding='utf-8').write('\n'.join(md))

print('ok flujos (la superficie la genera gen-superficie.py)')
for a in AVISOS: print('AVISO', a)
