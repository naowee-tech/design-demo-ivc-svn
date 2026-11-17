#!/usr/bin/env python3
"""Genera docs/modelo-datos.html a partir de los 55 campos de docs/hu-26-3.html y de suid/gi-catalogos.js.
Uso: python3 docs/model/gen-modelo-datos.py"""
import re, json, subprocess, html, os
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(R + '/docs/hu-26-3.html', encoding='utf-8').read()
F = json.loads(re.search(r"var FIELDS = (\[.*?\]);\n", src, re.S).group(1))
cat = json.loads(subprocess.check_output(['node', '-e', "global.window={};require('%s/suid/gi-catalogos.js');console.log(JSON.stringify(Object.fromEntries(Object.entries(window.GI_CAT).map(([k,v])=>[k,Array.isArray(v)?v.length:Object.keys(v).length]))))" % R]))
e = html.escape

BLOQ = [('control', 'A · Control', 'Lo pone el sistema al crear el registro.'),
        ('infractor', 'B · Infractor', 'Identificación, datos personales y dirección.'),
        ('representante', 'C · Representante', 'Solo cuando el infractor es menor de edad.'),
        ('hechos', 'D · Hechos', 'Qué pasó, dónde y con qué agravantes.'),
        ('sancion', 'E · Sanción', 'Acto administrativo, ejecutoria y vigencia.'),
        ('interna', 'F · Registro interno del IVC', 'Radicados, profesional y observaciones. Solo lo diligencia el IVC.')]

EN = json.load(open(R + '/docs/model/campos-en.json', encoding='utf-8'))
OB = json.load(open(R + '/docs/model/obligatoriedad.json', encoding='utf-8'))
ETQ = {'req': ('Obligatorio', 'ob'), 'opt': ('Opcional', 'op'), 'auto': ('Automático', 'au'), 'sin': ('Por confirmar', 'pc')}

conteo = {g: sum(1 for f in F if f['g'] == g) for g, _, _ in BLOQ}

def oblig(f):
    v = OB.get(f['g'] + '|' + f['n'], 'sin')
    t = f['r'].lower()
    if v == 'req' and ('únicamente cuando' in t or 'solo cuando' in t or 'solo se habilita' in t or ('habilitar' in t and 'cuando' in t)): return ('Condicional', 'co')
    return ETQ[v]

def sub(f):
    g, n = f['g'], f['n']
    if g in ('infractor', 'representante'):
        o = 0 if g == 'infractor' else 16
        if n.split('.')[0] in (str(2 + o), str(3 + o), str(4 + o), str(5 + o)): return 'Identificación'
        if n.split('.')[0] in (str(6 + o), str(7 + o), str(8 + o)): return 'Residencia'
        if n.split('.')[0] == str(9 + o if g == 'infractor' else 25): return 'Residencia'
        if n.split('.')[0] == str(10 if g == 'infractor' else 26): return 'Dirección de residencia'
        if n.split('.')[0] in (str(11 + o), str(12 + o), str(13 + o)): return 'Contacto'
        return 'Datos personales'
    return ''

def tabla(g):
    grupos = []
    for f in F:
        if f['g'] != g: continue
        k = sub(f)
        if not grupos or grupos[-1][0] != k: grupos.append((k, []))
        o, c = oblig(f)
        grupos[-1][1].append('<tr><td class="n">%s</td><td><b>%s</b></td><td><code>%s</code></td><td>%s</td><td><span class="tag %s">%s</span></td><td class="r">%s%s</td></tr>' % (
            e(f['n']), e(f['c']), e(EN[f['g'] + '|' + f['n']]), e(f['t'] or '—'), c, o, e(f['r']), ('<br><small>%s</small>' % e(f['s'])) if f['s'] else ''))
    out = ''
    for k, rows in grupos:
        out += ('<h3>%s <span class="cnt">%d</span></h3>' % (e(k), len(rows)) if k else '') + \
               '<div class="tw"><table><thead><tr><th>N.º</th><th>Campo</th><th>Dato (inglés)</th><th>Tipo</th><th>Obligatoriedad</th><th>Regla del diccionario</th></tr></thead><tbody>%s</tbody></table></div>' % ''.join(rows)
    return out

def resumen(g):
    c = {}
    for f in F:
        if f['g'] == g: c[oblig(f)[0]] = c.get(oblig(f)[0], 0) + 1
    PL = {'Obligatorio': 'obligatorios', 'Opcional': 'opcionales', 'Condicional': 'condicionales', 'Automático': 'automáticos'}
    SG = {'Obligatorio': 'obligatorio', 'Opcional': 'opcional', 'Condicional': 'condicional', 'Automático': 'automático'}
    return ' · '.join('%d %s' % (v, (SG if v == 1 else PL)[k]) for k, v in c.items())

def pestana(i, g, t):
    letra, nombre = t.split(' · ', 1)
    return ('<button type="button" role="tab" id="t-%s" data-t="%s" aria-selected="%s" aria-controls="%s" tabindex="%s"><span class="num">%s</span>'
            '<span class="tt"><b>%s</b><small>%d %s</small></span></button>') % (g, g, 'true' if i == 0 else 'false', g, '0' if i == 0 else '-1', e(letra), e(nombre), conteo[g], 'campo' if conteo[g] == 1 else 'campos')
bloques = ('<section id="campos"><h2>Campos</h2><p class="lead">Son 6 bloques del formulario. Elige uno para ver sus campos.</p>'
           '<p class="pick"><b>%d bloques</b> · elige uno</p><div class="seg" id="seg" role="tablist" aria-label="Bloques del formulario">' % len(BLOQ)
           + ''.join(pestana(i, g, t) for i, (g, t, d) in enumerate(BLOQ))
           + '</div>' + ''.join('<div class="panel" id="%s" role="tabpanel" aria-labelledby="t-%s"%s><p class="lead"><b>%s.</b> %s <span class="mu">%s</span></p>%s</div>' % (g, g, '' if i == 0 else ' hidden', e(t), e(d), e(resumen(g)), tabla(g)) for i, (g, t, d) in enumerate(BLOQ))
           + '</section>')
nav = '<a href="#campos">Campos</a>'
cats = ''.join('<tr><td><code>%s</code></td><td>%s</td></tr>' % (e(k), v) for k, v in cat.items())
EJEMPLO = json.dumps({
    "source": {"entity": "<id de la entidad que reporta>", "reference": "<id del reporte en su sistema>"},
    "person": {"document_type": "CC", "document_number": "1090000001", "first_names": "…", "last_names": "…", "birth_date": "YYYY-MM-DD", "sex": "…",
               "residence_country": "Colombia", "residence_department": "…", "residence_city": "…", "is_rural": False, "residence_address": "…", "phone_number": "…", "email": "…"},
    "guardian": {"document_type": "CC", "document_number": "…", "first_names": "…", "last_names": "…"},
    "incident": {"incident_date": "YYYY-MM-DD", "competition": "…", "incident_city": "…", "obligation_origin": "1", "aggravating_factors": [], "conduct_description": "…"},
    "sanction": {"resolution_date": "YYYY-MM-DD", "resolution_number": "…", "enforceability_date": "YYYY-MM-DD", "sanction_months": 12}
}, ensure_ascii=False, indent=2)

HTML = '''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Modelo de datos · IVC SVN</title>
<style>
:root{--bg:#f6f7fb;--pn:#fff;--tx:#282834;--mu:#646587;--bd:#e7e9f3;--ac:#d74009;--okbg:#e3f5e9;--ok:#166534;--wabg:#fdf0dc;--wa:#92400e;--sl:#3f4a5c;--slbg:#eceff4;--code:#f0f1f7}
@media (prefers-color-scheme:dark){:root{--bg:#0f1218;--pn:#171b24;--tx:#e8eaf0;--mu:#9aa0b4;--bd:#2a2e38;--ac:#ff8a5c;--okbg:#14301f;--ok:#7ee2a3;--wabg:#3a2810;--wa:#fbc27f;--sl:#c3cbd8;--slbg:#262d3a;--code:#1f2430}}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.55 Inter,system-ui,-apple-system,Arial,sans-serif}
main{max-width:1100px;margin:0 auto;padding:0 16px 64px}
header{padding:32px 0 8px}h1{margin:0 0 6px;font-size:28px}h2{margin:0 0 4px;font-size:20px}h3{margin:24px 0 8px;font-size:16px}
.lead,.sub{color:var(--mu);margin:0 0 14px}
nav{position:sticky;top:0;z-index:2;display:flex;gap:4px 14px;flex-wrap:wrap;padding:10px 0;background:var(--bg);border-bottom:1px solid var(--bd)}
nav a{color:var(--mu);font-size:13px;font-weight:600;text-decoration:none}nav a:hover,nav a:focus-visible{color:var(--ac)}
section{padding:28px 0 4px}
.card{background:var(--pn);border:1px solid var(--bd);border-radius:14px;padding:18px 20px;margin:12px 0}
.tw{overflow-x:auto;background:var(--pn);border:1px solid var(--bd);border-radius:14px}
table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:var(--mu);font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding:10px 12px;border-bottom:1px solid var(--bd);white-space:nowrap}
td{padding:9px 12px;border-bottom:1px solid var(--bd);vertical-align:top}tr:last-child td{border-bottom:0}td.n{color:var(--mu);font-variant-numeric:tabular-nums;white-space:nowrap}td.r{min-width:320px;color:var(--mu)}td.r small{display:block;margin-top:4px;opacity:.85}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}.tag.ob{background:var(--okbg);color:var(--ok)}.tag.op{background:var(--slbg);color:var(--sl)}.tw table code{white-space:nowrap}.tag.co{background:var(--wabg);color:var(--wa)}.tag.au{background:var(--slbg);color:var(--sl);border:1px dashed var(--sl)}.tag.pc{background:var(--wabg);color:var(--wa)}
.prop{display:inline-block;padding:2px 10px;border:1px dashed var(--mu);border-radius:999px;font-size:12px;font-weight:700;color:var(--mu)}
code,pre{font-family:ui-monospace,Menlo,monospace;background:var(--code);border-radius:6px}code{padding:1px 5px;font-size:12.5px}pre{padding:14px;overflow:auto;font-size:12.5px;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}ul{padding-left:20px;margin:8px 0}li{margin:4px 0}
.flow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}.st{padding:6px 12px;border-radius:999px;border:1px solid var(--bd);background:var(--pn);font-size:13px;font-weight:600}.arr{color:var(--mu)}
a{color:var(--ac)}.pick{margin:8px 0 6px;font-size:13px;color:var(--mu)}.pick b{color:var(--ac)}.seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:4px 0 18px}@media (max-width:640px){.seg{grid-template-columns:repeat(2,minmax(0,1fr))}}.seg button{display:flex;align-items:center;gap:12px;text-align:left;font:inherit;color:var(--tx);background:var(--pn);border:2px solid var(--bd);border-radius:14px;padding:12px 14px;cursor:pointer;transition:border-color .15s,transform .15s}.seg button:hover{border-color:var(--ac);transform:translateY(-1px)}.seg button .num{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--code);color:var(--mu);font-weight:800;font-size:14px}.seg button .tt{display:flex;flex-direction:column;line-height:1.25}.seg button small{color:var(--mu);font-size:12px}.seg button[aria-selected=true]{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 9%,var(--pn));box-shadow:0 4px 14px -6px var(--ac)}.seg button[aria-selected=true] .num{background:var(--ac);color:#fff}.cnt{display:inline-block;min-width:20px;padding:0 6px;border-radius:999px;background:var(--code);color:var(--mu);font-size:11px;text-align:center}.panel[hidden]{display:none}.mu{color:var(--mu)}h3 .cnt{vertical-align:middle}nav a{color:var(--mu)}a:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
</style><link rel="stylesheet" href="assets/entrega.css"></head><body><main>
<header><h1>Modelo de datos del infractor</h1>
<p class="sub">IVC SVN · fase 1 · HU-26.3 «Gestión de infractores» (v04). Qué se guarda, con qué reglas y qué se espera recibir si un registro entra por integración.</p></header>
<nav aria-label="Secciones"><a href="#resumen">Resumen</a>NAV<a href="#catalogos">Catálogos</a><a href="#estados">Estados</a><a href="#integracion">Integración</a></nav>

<section id="resumen"><h2>Resumen</h2>
<div class="grid">
<div class="card"><b>55 campos</b> en 6 bloques (A a F); la dirección y el representante se despliegan en subcampos (91 filas). Fuente: hoja «Diccionario de Datos» de la base de sancionatorios del IVC y el formulario de la HU.</div>
<div class="card"><b>Una sola entidad lógica:</b> el registro de sanción. El infractor y su representante viven dentro del registro; no hay tabla de personas aparte en la fase 1.</div>
<div class="card"><b>Origen de los datos:</b> los 55 campos se digitan en la demo hoy. Por integración es una <span class="prop">propuesta</span> sin contrato: ver <a href="#integracion">Integración</a>.</div>
</div>
<p class="sub">Obligatoriedad: la define el formulario de la demo (<span class="tag ob">Obligatorio</span> <span class="tag op">Opcional</span>); <span class="tag co">Condicional</span> es obligatorio solo si otro campo lo activa; <span class="tag au">Automático</span> es lo que calcula el sistema.</p>
</section>
BLOQUES
<section id="catalogos"><h2>Catálogos</h2><p class="lead">Listas parametrizadas que usa el formulario. Cantidad de valores por catálogo, tomados de la hoja «Catálogos».</p>
<div class="tw"><table><thead><tr><th>Catálogo</th><th>Valores</th></tr></thead><tbody>CATS</tbody></table></div></section>

<section id="estados"><h2>Estados</h2>
<h3>Del registro (campo 54, <code>record_status</code>)</h3>
<div class="flow"><span class="st">Recibido</span><span class="arr">→</span><span class="st">Validado</span></div><div class="flow"><span class="st">Recibido</span><span class="arr">→</span><span class="st">Por subsanar</span><span class="arr">→</span><span class="st">Validado</span></div>
<p class="sub">Valores de dato: <code>received</code>, <code>validated</code>, <code>to_correct</code> (restricción: <code>inactive</code>, <code>active</code>, <code>fulfilled</code>). Un registro nuevo entra como Recibido. Quien tiene el rol de cierre (coordinador o director) lo valida o lo devuelve por subsanar; un registro Por subsanar se corrige y luego se valida.</p>
<h3>De la restricción (campo 47, <code>restriction_status</code>)</h3>
<div class="flow"><span class="st">Inactiva</span><span class="arr">→</span><span class="st">Activa</span><span class="arr">→</span><span class="st">Cumplida</span></div>
<p class="sub">La restricción solo bloquea cuando el registro está Validado y la fecha cae dentro de la vigencia (campo 45). Pasa a Cumplida sola al vencer.</p>
<h3>Reglas entre campos</h3>
<ul><li>Fecha del acto &lt; ejecutoria &lt; radicado de entrada.</li><li>Fecha de los hechos anterior al acto, y nunca hoy ni futura.</li><li>Representante obligatorio si el infractor es menor de edad.</li></ul>
</section>

<section id="integracion"><h2>Integración <span class="prop">propuesta</span></h2>
<p class="lead">Fuera de la fase 1: la HU no define entidad, formato ni contrato. Esta es la propuesta de diseño para discutir con el IVC y con quien implemente.</p>
<div class="grid">
<div class="card"><h3 style="margin-top:0">Qué llegaría</h3><ul><li>Bloques B a E: infractor, representante (si es menor), hechos y sanción.</li><li>Un identificador de la entidad que reporta y la referencia de su reporte.</li></ul></div>
<div class="card"><h3 style="margin-top:0">Qué completa el IVC</h3><ul><li>Bloque A: fecha de registro, automática.</li><li>Bloque F: radicados, profesional responsable y observaciones.</li><li>Estado del registro: entra como Recibido.</li></ul></div>
<div class="card"><h3 style="margin-top:0">Qué pasa al recibirlo</h3><ul><li>Se validan las mismas reglas del formulario.</li><li>Si falla alguna, se rechaza con el detalle de cada campo.</li><li>Si pasa, sigue el flujo normal de validación del IVC.</li></ul></div>
</div>
<h3>Ejemplo de mensaje <span class="prop">propuesta</span></h3><p class="sub">Los nombres de los datos van en inglés (snake_case, como el contrato del back); los textos para el usuario, en español. Los valores de los catálogos quedan como los define la HU. La estructura y los nombres son una propuesta de diseño.</p>
<pre>EJEMPLO</pre>
</section>
</main>
<script>
(function(){var seg=document.getElementById('seg');function ver(t){[].forEach.call(seg.querySelectorAll('button'),function(b){var on=b.getAttribute('data-t')===t;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});[].forEach.call(document.querySelectorAll('.panel'),function(p){p.hidden=p.id!==t})}
seg.addEventListener('click',function(e){var b=e.target.closest('button');if(b)ver(b.getAttribute('data-t'))});seg.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!k)return;var bs=[].slice.call(seg.querySelectorAll('button')),i=bs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();var n=bs[(i+k+bs.length)%bs.length];n.focus();ver(n.getAttribute('data-t'))});
function hash(){var h=location.hash.slice(1);if(h&&document.getElementById(h)&&document.getElementById(h).className==='panel'){ver(h);document.getElementById('campos').scrollIntoView()}}
window.addEventListener('hashchange',hash);hash()})();
</script><script src="assets/entrega.js"></script></body></html>'''
out = (HTML.replace('NAV', nav).replace('BLOQUES', bloques).replace('CATS', cats).replace('EJEMPLO', e(EJEMPLO)))
open(R + '/docs/modelo-datos.html', 'w', encoding='utf-8').write(out)
print('ok', len(out), conteo)

# ── spec markdown ──
def celda(s): return (s or '—').replace('|', '\\|').replace('\n', ' ')
md = ['# Modelo de datos · Gestión de infractores (IVC SVN, fase 1)', '',
      'Qué se guarda de cada registro, con qué reglas, y qué se espera recibir si un registro entra por integración.',
      'Fuente: hoja «Diccionario de Datos» de la base de sancionatorios del IVC (adjunta en PROD-45) y el formulario de la demo.', '',
      '## Resumen', '',
      '- **55 campos** en 6 bloques (A a F); dirección y representante se despliegan en subcampos (%d filas).' % len(F),
      '- **Una sola entidad lógica:** el registro de sanción. Infractor y representante viven dentro del registro.',
      '- **Nombres de datos en inglés** (snake_case, como el contrato del back); textos para el usuario en español.',
      '- **Obligatoriedad:** Obligatorio, Opcional, Condicional (obligatorio solo si otro campo lo activa) y Automático (lo calcula el sistema).', '']
for g, t, d in BLOQ:
    md += ['## %s' % t, '', d, '', '| N.º | Campo | Dato | Tipo | Obligatoriedad | Regla del diccionario |', '|---|---|---|---|---|---|']
    md += ['| %s | %s | `%s` | %s | %s | %s |' % (f['n'], celda(f['c']), EN[f['g'] + '|' + f['n']], celda(f['t']), oblig(f)[0], celda(f['r'] + (' ' + f['s'] if f['s'] else ''))) for f in F if f['g'] == g]
    md += ['']
md += ['## Catálogos', '', 'Listas parametrizadas del formulario (hoja «Catálogos»).', '', '| Catálogo | Valores |', '|---|---|'] + ['| `%s` | %s |' % (k, v) for k, v in cat.items()]
md += ['', '## Estados', '',
       '**Del registro** (`record_status`): `received` (Recibido) → `validated` (Validado), o `received` → `to_correct` (Por subsanar) → `validated`. Un registro Por subsanar se corrige y luego se valida; no vuelve a Recibido.', '',
       '**De la restricción** (`restriction_status`): `inactive` (Inactiva) → `active` (Activa) → `fulfilled` (Cumplida). Solo bloquea con el registro Validado y la fecha dentro de la vigencia; pasa a Cumplida sola al vencer y no se borra.', '',
       '## Reglas entre campos', '', '- Fecha del acto < ejecutoria < radicado de entrada.', '- Fecha de los hechos anterior al acto, y nunca hoy ni futura.', '- Representante obligatorio si el infractor era menor en la fecha de los hechos.', '- Sin duplicados equivalentes: misma persona, mismo acto y misma vigencia.', '',
       '## Integración (propuesta de diseño)', '',
       '- **Qué llegaría:** bloques B a E (infractor, representante si es menor, hechos y sanción), más el identificador de la entidad que reporta y la referencia de su reporte.',
       '- **Qué completa el IVC:** bloque A (fecha de registro, automática), bloque F (radicados, profesional responsable y observaciones) y el estado del registro, que entra como Recibido.',
       '- **Al recibirlo:** se aplican las mismas reglas del formulario; si falla alguna, se rechaza con el detalle de cada campo; si pasa, sigue el flujo normal de validación del IVC.', '',
       '### Ejemplo de mensaje', '', '```json', EJEMPLO, '```', '']
open(R + '/docs/spec/modelo-datos.md', 'w', encoding='utf-8').write('\n'.join(md))
print('ok spec/modelo-datos.md')
