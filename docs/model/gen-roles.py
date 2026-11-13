#!/usr/bin/env python3
"""Genera docs/roles.html y docs/spec/roles.md desde docs/model/roles.json.
Comprueba que la matriz coincida con suid/roles.js (la que usa la demo). Uso: python3 docs/model/gen-roles.py"""
import json, os, subprocess, html, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M = json.load(open(R + '/docs/model/roles.json', encoding='utf-8'))
e = html.escape
demo = json.loads(subprocess.check_output(['node', '-e', "global.window={location:{search:''},sessionStorage:{getItem(){},setItem(){}}};require('%s/suid/roles.js');const t=window.SUID_ROLES.todos;console.log(JSON.stringify(Object.fromEntries(Object.entries(t).map(([k,v])=>[k,v.puede]))))" % R]))
for k, v in M['matriz'].items():
    if sorted(demo.get(k, [])) != sorted(v):
        sys.exit('La matriz de roles.json no coincide con suid/roles.js en %s: %s vs %s' % (k, v, demo.get(k)))
ROL = {r['id']: r for r in M['roles']}
ACC = {a['id']: a for a in M['acciones']}
ORI = {'HU': 'HU-26.3', 'diseño': 'Criterio de diseño'}
SV = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'
# Profesional digita (lápiz), coordinador revisa en equipo (personas), director aprueba (escudo con check).
ICON = {'profesional': SV % '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        'coordinador': SV % '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
        'director': SV % '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'}

# ── spec markdown ──
md = ['# Roles de la fase 1 · IVC SVN', '',
      'Spec para dev. Fuente: `docs/model/roles.json`. Vista: `docs/index.html#roles`. Demo: `suid/app.html?rol=<id>`.', '',
      '## Principio', '', M['principio'], '', '## Roles', '', '| Rol | Quién es | Qué hace |', '|---|---|---|']
md += ['| `%s` | %s | %s |' % (r['id'], r['cargo'], r['resumen']) for r in M['roles']]
md += ['', 'Fuera de la fase 1:', ''] + ['- **%s**: %s' % (f['label'], f['por']) for f in M['fuera']]
md += ['', '## Matriz rol × acción', '', '| Acción | ' + ' | '.join(r['label'] for r in M['roles']) + ' | Origen |', '|---|' + '---|' * (len(M['roles']) + 1)]
for a in M['acciones']:
    md.append('| %s | %s | %s |' % (a['label'], ' | '.join('sí' if a['id'] in M['matriz'][r['id']] else '—' for r in M['roles']), ORI[a['origen']]))
md += ['', '## Quién cierra cada flujo', '', '| Flujo | Cambio de estado | Rol que cierra | Nota |', '|---|---|---|---|']
for c in M['cierres']:
    md.append('| %s | %s | %s | %s |' % (c['flujo'], c['estado'], ', '.join(ROL[x]['label'] for x in c['quien']) or '—', c['nota']))
md += ['', '## Comportamiento esperado', '',
       '- Rol por `?rol=<id>` (se recuerda por sesión). Sin rol: `coordinador`.',
       '- Sin permiso, el control **no se muestra**; si se llega por URL, la pantalla dice «Sin permiso» y ofrece volver a Gestión.',
       '- El menú oculta Calidad y auditoría a quien no la puede ver.',
       '- La firma de cada operación lleva el nombre y cargo del rol activo.',
       '- La autorización real la define el SUID; esto describe lo que la interfaz debe mostrar.', '',
       '## Menores de edad', '', M['menores']['regla'], '',
       '## Criterios de aceptación', '',
       '- [ ] Cada acción de la matriz aparece solo para los roles que la tienen.',
       '- [ ] Los datos de un menor y de su representante se ven igual para todos los roles.',
       '- [ ] Cada flujo tiene al menos un rol que lo cierra, salvo los automáticos y de consulta.',
       '- [ ] El rol activo se ve en la firma de validar y devolver.',
       '- [ ] Alineado con los roles de `suite-web-ivc` y el SUID (por confirmar).', '']
open(R + '/docs/spec/roles.md', 'w', encoding='utf-8').write('\n'.join(md))

# ── html ──
rows = ''.join('<tr><th scope="row">%s<small>%s</small></th>%s<td><span class="o o-%s">%s</span></td></tr>' % (
    e(a['label']), e(a['desc']),
    ''.join('<td data-r="%s" class="%s">%s</td>' % (r['id'], 'si' if a['id'] in M['matriz'][r['id']] else 'no', '✓' if a['id'] in M['matriz'][r['id']] else '—') for r in M['roles']),
    a['origen'], ORI[a['origen']]) for a in M['acciones'])
head = ''.join('<th data-r="%s" scope="col"><span class="ri ri-%s ri-s">%s</span>%s</th>' % (r['id'], r['id'], ICON.get(r['id'], ''), e(r['label'])) for r in M['roles'])
cierres = ''.join('<tr><td><b>%s</b></td><td>%s</td><td>%s</td><td class="mu">%s</td></tr>' % (
    e(c['flujo']), e(c['estado']), ''.join('<span class="pill">%s</span>' % e(ROL[x]['label']) for x in c['quien']) or '<span class="mu">—</span>', e(c['nota'])) for c in M['cierres'])
fuera = ''.join('<li><b>%s</b> %s</li>' % (e(f['label']), e(f['por'])) for f in M['fuera'])
MENU = [('Gestión de sanciones', 'consultar'), ('Búsqueda avanzada', 'consultar'), ('Calidad y auditoría', 'calidad')]
roles_rows = ''.join('<tr><th scope="row"><span class="ri ri-%s">%s</span><b>%s</b><small>%s</small><a class="go" href="../suid/app.html?rol=%s#/control-acceso/infractores" target="_blank" rel="noopener">Ver la demo como %s →</a></th><td class="res">%s</td><td><div class="pills">%s</div></td><td><div class="pills">%s</div></td></tr>' % (
    r['id'], ICON.get(r['id'], ''), e(r['label']), e(r['cargo']), r['id'], e(r['label']), e(r['resumen']),
    ''.join('<span>%s</span>' % e(a['label']) for a in M['acciones'] if a['id'] in M['matriz'][r['id']]),
    ''.join('<span>%s</span>' % e(m) for m, k in MENU if k in M['matriz'][r['id']])) for r in M['roles'])
DATA = json.dumps({'roles': M['roles'], 'acciones': M['acciones'], 'matriz': M['matriz']}, ensure_ascii=False)
PAGE = open(R + '/docs/model/roles.tpl.html', encoding='utf-8').read()
out = (PAGE.replace('%%ROWS%%', rows).replace('%%HEAD%%', head).replace('%%CIERRES%%', cierres).replace('%%FUERA%%', fuera)
       .replace('%%PRINCIPIO%%', e(M['principio'])).replace('%%MENORES%%', e(M['menores']['regla']))
       .replace('%%DATA%%', DATA).replace('%%ROLES%%', roles_rows))
open(R + '/docs/roles.html', 'w', encoding='utf-8').write(out)
print('ok roles.html + spec/roles.md; matriz = suid/roles.js')
