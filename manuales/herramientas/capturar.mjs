// Toma las capturas de los manuales y escribe img/<id>.webp y capturas.data.js.
// Uso: node manuales/herramientas/capturar.mjs [id…]   (sin ids, toma todas)
// Playwright sale de PLAYWRIGHT_PATH o de momentum-web; no hay dependencia en este repo.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PW = process.env.PLAYWRIGHT_PATH || '/Users/jorge-guzman/Naowee/momentum-web/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MAN = path.resolve(AQUI, '..');
const RAIZ = path.resolve(MAN, '..');
const IMG = path.join(MAN, 'img');
const DATOS = path.join(MAN, 'capturas.data.js');
const HORA = new Date('2026-10-15T18:40:00-05:00');
const MAX_W = 1000, MAX_KB = 60, HOLGURA = 4;

const IVC = 'suid/app.html#/control-acceso/';
const espera = ms => new Promise(r => setTimeout(r, ms));

// ---------- ayudas de preparación ----------
async function forzar(p, persona, estado) {
  await p.goto(BASE + 'index.html'); await p.waitForTimeout(500);
  await p.keyboard.press('Control+Shift+L');
  await p.click('#dcPanel [data-pop="' + persona + '"]');
  await Promise.all([p.waitForEvent('load'), p.click('#dcPanel .dcp__pop [data-st="' + estado + '"]')]);
  await p.waitForTimeout(600);
}
const tiempoReal = async p => { await p.getByText('Tiempo real', { exact: true }).first().click(); await p.waitForTimeout(200); };
async function abrirGrupo(p, texto) {
  await p.locator('.pp-grupo__cab', { hasText: texto }).first().click(); await p.waitForTimeout(300);
}
// El id del registro «Recibido» cambia con la semilla; se busca en vez de fijarlo.
const idRecibido = p => p.evaluate(() => GI.all().find(r => r.estadoRegistro === 'Recibido').id);
const ir = async (p, ruta, ms = 900) => { await p.goto(BASE + ruta); await p.waitForTimeout(ms); };
const tab = (p, nombre) => p.getByRole('tab', { name: nombre, exact: true });
const btn = (p, nombre) => p.getByRole('button', { name: nombre }).first();

// ---------- lista de capturas ----------
// recorte: selector, lista de selectores (se unen) o 'viewport'. marcas: selector o p => locator.
const CAPTURAS = [
  { id: 'acc-login-pie', ruta: 'index.html', recorte: '.naowee-credit', margen: 12,
    marcas: ['a[href="svn/index.html"]', '.naowee-credit [data-demo-panel]', 'a[href="manuales/index.html"]'] },
  { id: 'acc-avatar', ruta: IVC + 'infractores', prep: async p => { await p.click('.suid-avatar'); await p.waitForTimeout(300); },
    recorte: ['.suid-avatar', '.suid-user__menu'],
    marcas: ['.suid-user__menu [data-demo-panel]', '.suid-user__menu a[href="../svn/index.html"]', '.suid-user__menu a[href="../manuales/index.html"]'] },
  { id: 'acc-gate-pie', ruta: 'svn/index.html#/', recorte: '.sv-gate__pie', margen: 8,
    marcas: ['button.sv-gate__demo', 'a[href="../manuales/index.html"]'] },
  { id: 'acc-panel', ruta: 'index.html', prep: async p => { await p.keyboard.press('Control+Shift+L'); await p.waitForTimeout(500); },
    alto: 960, recorte: '#dcPanel', marcas: ['#dcPanel .dcp__vi', '#dcPanel .dcp__l', '#dcPanel [data-pop]', '#dcPanel [data-all]'] },
  { id: 'acc-panel-estado', ruta: 'index.html',
    prep: async p => {
      await p.keyboard.press('Control+Shift+L'); await p.waitForTimeout(400); await p.click('#dcPanel [data-pop="limpia-1"]'); await p.waitForTimeout(300);
    },
    recorte: ['#dcPanel .dcp__l', '#dcPanel .dcp__pop'], xDe: '#dcPanel', margen: 12, marcas: ['#dcPanel .dcp__pop'] },

  { id: 'ivc-login', ruta: 'index.html', recorte: '.auth-card', marcas: ['#kc-login'] },
  { id: 'ivc-menu', ruta: 'suid/app.html', recorte: '#sidebar',
    marcas: ['.nav-row[data-id="infractores"]', '.nav-row[data-id="consulta"]', '.nav-row[data-id="solicitudes"]', '.nav-row[data-id="eventos"]'] },
  { id: 'ivc-gestion-ind', ruta: IVC + 'infractores', recorte: '#view', marcas: ['#giTabI', '#giChartCard', p => p.locator('#view').getByText('Registrar infractores', { exact: true }).first()] },
  { id: 'ivc-gestion-reg', ruta: IVC + 'infractores', prep: async p => { await p.click('#giTabR'); await p.waitForTimeout(700); },
    recorte: '#view', marcas: ['#giTabR', '#view tbody tr:visible'] },
  { id: 'ivc-gestion-panel', ruta: IVC + 'infractores',
    prep: async p => { await p.click('#giTabR'); await p.waitForTimeout(700); await p.locator('#view tbody tr:visible').first().click({ position: { x: 60, y: 10 } }); await p.waitForTimeout(800); },
    recorte: 'viewport', marcas: ['.gpn', p => p.locator('.gpn').getByText('Ver expediente', { exact: true }).first()] },
  { id: 'ivc-gestion-exp', ruta: IVC + 'infractores', prep: async p => { await p.click('#giTabS'); await p.waitForTimeout(700); },
    recorte: '#view', marcas: ['#giTabS'] },
  { id: 'ivc-alta-inicio', ruta: IVC + 'infractores/nuevo', recorte: '#view', marcas: ['#gfStart'] },
  { id: 'ivc-alta-autollena', ruta: IVC + 'infractores/nuevo',
    prep: async p => {
      const st = p.locator('#gfStart'); if (await st.isVisible().catch(() => false)) { await st.click(); await p.waitForTimeout(400); }
      const n = p.locator('[data-p="i.numId"]'); await n.fill('1090000001'); await n.dispatchEvent('input'); await p.waitForTimeout(1500);
    },
    recorte: '#view', marcas: ['[data-p="i.numId"]', '[data-p="i.nombres"]', '.gi-steps'] },
  { id: 'ivc-alta-guardar', ruta: IVC + 'infractores/nuevo',
    prep: async p => {
      const st = p.locator('#gfStart'); if (await st.isVisible().catch(() => false)) { await st.click(); await p.waitForTimeout(400); }
      const n = p.locator('[data-p="i.numId"]'); await n.fill('1090000001'); await n.dispatchEvent('input'); await p.waitForTimeout(1500);
      for (let i = 0; i < 8 && !(await p.locator('#giSave').isVisible().catch(() => false)); i++) { await p.click('#gfNext'); await p.waitForTimeout(600); }
    },
    recorte: 'viewport', marcas: ['#giSave'] },
  { id: 'ivc-carga', ruta: IVC + 'infractores/carga-masiva', recorte: '#view',
    marcas: ['#bkTpl', p => btn(p, 'Ya la tengo')] },
  { id: 'ivc-expediente', ruta: IVC + 'infractores', prep: async p => { await ir(p, IVC + 'infractores/' + await idRecibido(p), 1200); },
    recorte: '#view', marcas: ['#aVal', '#aSub'] },
  { id: 'ivc-validar', ruta: IVC + 'infractores',
    prep: async p => { await ir(p, IVC + 'infractores/' + await idRecibido(p), 1200); await p.click('#aVal'); await p.waitForTimeout(600); },
    recorte: '.naowee-modal', marcas: ['.naowee-modal .naowee-btn--loud'] },
  { id: 'ivc-busqueda', ruta: IVC + 'consulta',
    prep: async p => { await p.fill('#gcQ', '1090000004'); await p.click('#gcGo'); await p.waitForTimeout(1600); },
    recorte: '#view', marcas: ['#gcQ', '#gcGo', '#gcOut'] },
  { id: 'ivc-busqueda-menor', ruta: IVC + 'consulta',
    prep: async p => { await p.fill('#gcQ', '1090000007'); await p.click('#gcGo'); await p.waitForTimeout(1600); },
    recorte: '#gcOut', marcas: [p => p.locator('#gcOut').getByText('Persona menor de edad').first()] },
  { id: 'ivc-busqueda-av', ruta: IVC + 'consulta', prep: async p => { await p.click('#gcaSw'); await p.waitForTimeout(500); },
    recorte: '#view', marcas: ['#gcaSw'] },
  { id: 'ivc-sol-lista', ruta: IVC + 'solicitudes', prep: async p => { await p.locator('#gsBody tr').first().click(); await p.waitForTimeout(800); },
    recorte: 'viewport', marcas: ['#gsBody', '.gpn'] },
  { id: 'ivc-sol-interna', ruta: IVC + 'solicitudes/R-2026-0482', recorte: '#view',
    marcas: [p => btn(p, 'Marcar como recibida')] },
  { id: 'ivc-eventos', ruta: IVC + 'eventos', recorte: '#view',
    marcas: ['[role=group][aria-label="Filtrar por momento"]', p => btn(p, 'Crear evento')] },
  { id: 'ivc-vivo-resumen', ruta: IVC + 'eventos/e1', recorte: '#view', marcas: [p => tab(p, 'Resumen')] },
  { id: 'ivc-vivo-puertas', ruta: IVC + 'eventos/e1', prep: async p => { await tab(p, 'Puertas').click(); await p.waitForTimeout(700); },
    recorte: '#view', marcas: [p => tab(p, 'Puertas'), '#view .pb-tabla'] },
  { id: 'ivc-auditoria', ruta: IVC + 'eventos/e1', prep: async p => { await tab(p, 'Registros').click(); await p.waitForTimeout(700); },
    recorte: '#view', marcas: [p => tab(p, 'Registros')] },
  { id: 'ivc-borrador', ruta: IVC + 'eventos/e4', recorte: '#view',
    marcas: ['.gi-steps', p => btn(p, 'Siguiente')] },
  { id: 'ivc-borrador-revisar', ruta: IVC + 'eventos/e4',
    prep: async p => { for (let i = 0; i < 5 && await btn(p, 'Siguiente').isVisible().catch(() => false); i++) { await btn(p, 'Siguiente').click(); await p.waitForTimeout(700); } },
    recorte: '#view', marcas: [p => btn(p, 'Publicar evento')] },
  { id: 'ivc-publicado', ruta: IVC + 'eventos/e3', recorte: '#view', marcas: [p => p.locator('#view [role=tablist]').first()] },
  { id: 'ivc-pasado', ruta: IVC + 'eventos/e5', recorte: '#view', marcas: [p => p.locator('#view [role=tablist]').first()] },
  { id: 'ivc-escenarios', ruta: IVC + 'eventos/escenarios', recorte: '#view', marcas: [p => tab(p, 'Escenarios'), p => p.locator('#view').getByText('Agregar escenario', { exact: true }).first()] },
  { id: 'ivc-escenario', ruta: IVC + 'eventos/escenarios/atanasio', recorte: '#view',
    marcas: [p => p.locator('#view button', { hasText: 'Occidental' }).first(), p => p.locator('#view button', { hasText: 'Oriental' }).first()] },

  { id: 'svn-gate', ruta: 'svn/index.html#/', recorte: 'viewport', marcas: ['#gate-modo', '.sv-card__num'] },
  { id: 'svn-gate-rol', ruta: 'svn/index.html#/', prep: async p => { await tab(p, 'Por rol').click(); await p.waitForTimeout(800); },
    recorte: '#gate-cuerpo', marcas: [] },
  { id: 'svn-fase0', ruta: 'fase0/index.html', espera: 6000, recorte: 'viewport',
    marcas: [p => p.locator('button', { hasText: 'Anterior' }).first().locator('xpath=..')] },
  { id: 'svn-integ', ruta: 'svn/index.html#/integracion',
    prep: async p => { await p.getByText('Homologación', { exact: true }).first().click(); await p.waitForTimeout(800); },
    recorte: '.pp-demo', marcas: [p => p.getByText('Homologación', { exact: true }).first()] },
  { id: 'svn-ent-club', ruta: 'svn/index.html#/entidades', recorte: '.pp-demo',
    marcas: [p => tab(p, 'Club'), '[data-acc="ir-reportar"]'] },
  { id: 'svn-ent-reportar', ruta: 'svn/index.html#/entidades',
    prep: async p => { await p.locator('[data-acc="ir-reportar"]').first().click(); await p.waitForTimeout(1000); },
    recorte: '.pp-demo', marcas: [p => p.locator('.pp-demo input').first()] },
  { id: 'svn-ent-grad', ruta: 'svn/index.html#/entidades', prep: async p => { await tab(p, 'Graderío').click(); await p.waitForTimeout(1000); },
    recorte: '.pp-demo', marcas: [] },
  { id: 'svn-compra', ruta: 'svn/index.html#/compra', prep: tiempoReal, recorte: 'viewport',
    marcas: ['.pp-panel', '.pp-velocidad', '.pp-equipo'] },
  { id: 'svn-compra-bloq', ruta: 'index.html',
    prep: async p => {
      await forzar(p, 'limpia-1', 'vigente'); await ir(p, 'svn/index.html#/compra', 1500); await tiempoReal(p);
      await p.getByText('Continuar', { exact: true }).first().click(); await p.waitForTimeout(1000);
      const ins = p.locator('.pp-pantalla input, .pp-equipo input');
      await ins.nth(0).fill('1090000001'); await ins.nth(1).fill('Valentina Cortés Ibarra');
      await p.getByText('Continuar', { exact: true }).first().click(); await p.waitForTimeout(3000);
    },
    recorte: '.pp-equipo', marcas: [p => p.getByText('No es posible continuar').first()] },
  { id: 'svn-puerta', ruta: 'svn/index.html#/puerta', prep: tiempoReal, recorte: 'viewport',
    marcas: ['.pp-dispositivo', '.pp-panel', p => p.locator('.pp-equipo button', { hasText: 'Digitar documento' }).first()] },
  { id: 'svn-puerta-entra', ruta: 'svn/index.html#/puerta',
    prep: async p => { await tiempoReal(p); await p.locator('[data-caso="verde"]').click(); await p.waitForTimeout(2500); },
    recorte: '.pp-equipo', marcas: [p => p.getByText('Registrar ingreso').first()] },
  { id: 'svn-puerta-medida', ruta: 'svn/index.html#/puerta',
    prep: async p => { await tiempoReal(p); await abrirGrupo(p, 'No entra por medida'); await p.locator('[data-caso="medida"]').click(); await p.waitForTimeout(2500); },
    recorte: '.pp-equipo', marcas: [p => p.locator('.pp-equipo').getByText('NO ENTRA').first()] },
  { id: 'svn-pmu-lista', ruta: 'svn/index.html#/policia', recorte: 'viewport',
    marcas: ['[aria-label="Abrir tablero: Nacional vs. Medellín"]'] },
  { id: 'svn-pmu-tablero', ruta: 'svn/index.html#/policia',
    prep: async p => { await p.getByLabel('Abrir tablero: Nacional vs. Medellín').click(); await p.waitForTimeout(2000); },
    recorte: '.pp-equipo', marcas: [p => btn(p, 'Asignar').locator('xpath=ancestor::*[contains(@class,"card") or contains(@class,"alerta")][1]'), p => btn(p, 'Asignar')] },
  { id: 'svn-portal', ruta: 'svn/index.html#/portal',
    prep: async p => { await p.locator('[data-caso="vigente"]').click(); await p.waitForTimeout(800); await p.getByText('Verificar mi identidad').first().click(); await p.waitForTimeout(2500); },
    recorte: '.pp-equipo', marcas: [] },
  { id: 'svn-soporte', ruta: 'svn/index.html#/soporte', recorte: '.pp-demo',
    marcas: [p => p.locator('button.sp-fila', { hasText: 'R-2026-0173' }).first(), p => btn(p, 'Tomar el caso')] },
];

// ---------- servidor propio ----------
const libre = () => new Promise(r => { const s = net.createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => r(port)); }); });
const PUERTO = await libre();
const BASE = 'http://127.0.0.1:' + PUERTO + '/';
const srv = spawn('python3', ['-m', 'http.server', String(PUERTO), '--bind', '127.0.0.1'], { cwd: RAIZ, stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(BASE + 'index.html'); break; } catch { await espera(100); } }

const br = await chromium.launch();
const conv = await (await br.newContext()).newPage();
fs.mkdirSync(IMG, { recursive: true });

async function aWebp(png) {
  for (const q of [0.8, 0.7, 0.6, 0.5]) {
    const out = await conv.evaluate(async ({ b64, q, maxW }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const k = Math.min(1, maxW / img.width), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
      return { url: c.toDataURL('image/webp', q), w: c.width, h: c.height };
    }, { b64: png.toString('base64'), q, maxW: MAX_W });
    const buf = Buffer.from(out.url.split(',')[1], 'base64');
    if (buf.length <= MAX_KB * 1024 || q === 0.5) return { buf, w: out.w, h: out.h, q };
  }
}

const loc = (p, m) => typeof m === 'function' ? m(p) : p.locator(m).first();

async function tomar(c, dpr) {
  // alto: algunas vistas (el panel de casos) necesitan más alto para no esconder botones bajo el pliegue.
  const H = c.alto || 800;
  const ctx = await br.newContext({ viewport: { width: 1280, height: H }, deviceScaleFactor: dpr });
  await ctx.clock.setFixedTime(HORA);
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  try {
    await p.goto(BASE + c.ruta); await p.waitForTimeout(c.espera || 1000);
    if (c.prep) await c.prep(p);
    await p.waitForFunction(() => !document.querySelector('.sk-progress.is-on'), null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(300);
    const vp = { x: 0, y: 0, width: 1280, height: H };
    let r;
    if (c.recorte === 'viewport') r = vp;
    else {
      const sels = [].concat(c.recorte), bs = [];
      for (const s of sels) { const b = await p.locator(s).first().boundingBox(); if (b) bs.push(b); }
      if (!bs.length) throw new Error('recorte no visible: ' + sels.join(', '));
      const x = Math.min(...bs.map(b => b.x)), y = Math.min(...bs.map(b => b.y));
      r = { x, y, width: Math.max(...bs.map(b => b.x + b.width)) - x, height: Math.max(...bs.map(b => b.y + b.height)) - y };
      if (c.xDe) { const b = await p.locator(c.xDe).first().boundingBox(); r.x = b.x; r.width = b.width; }
      const m = c.margen || 0, mx = c.xDe ? 0 : m;
      r = { x: r.x - mx, y: r.y - m, width: r.width + 2 * mx, height: Math.min(r.height + 2 * m, c.altoMax || 1e4) };
      // Se recorta a lo que se ve: el manual muestra la pantalla, no la página entera.
      const x2 = Math.min(r.x + r.width, 1280), y2 = Math.min(r.y + r.height, H);
      r = { x: Math.max(0, r.x), y: Math.max(0, r.y) }; r.width = x2 - r.x; r.height = y2 - r.y;
    }
    const marcas = [], faltan = [];
    for (const [i, m] of c.marcas.entries()) {
      const b = await loc(p, m).boundingBox({ timeout: 3000 }).catch(() => null);
      if (!b) { faltan.push(i + 1); continue; }
      const x1 = Math.max(r.x, b.x - HOLGURA), y1 = Math.max(r.y, b.y - HOLGURA);
      const x2 = Math.min(r.x + r.width, b.x + b.width + HOLGURA), y2 = Math.min(r.y + r.height, b.y + b.height + HOLGURA);
      if (x2 <= x1 || y2 <= y1) { faltan.push(i + 1); continue; }
      const pc = (v, t) => Math.round(v / t * 10000) / 100;
      marcas.push({ n: i + 1, x: pc(x1 - r.x, r.width), y: pc(y1 - r.y, r.height), w: pc(x2 - x1, r.width), h: pc(y2 - y1, r.height) });
    }
    const png = await p.screenshot({ clip: r, animations: 'disabled' });
    return { r, marcas, faltan, png, errores };
  } finally { await ctx.close(); }
}

const pedidos = process.argv.slice(2);
const lista = pedidos.length ? CAPTURAS.filter(c => pedidos.includes(c.id)) : CAPTURAS;
const previos = (() => { try { const w = {}; new Function('window', fs.readFileSync(DATOS, 'utf8'))(w); return w.MANUALES_CAPTURAS || {}; } catch { return {}; } })();
const datos = { ...previos }, filas = [];
let fallos = 0;

for (const c of lista) {
  try {
    let t = await tomar(c, 1), dpr = 1;
    if (t.r.width < 500) { t = await tomar(c, 2); dpr = 2; }
    const { buf, w, h, q } = await aWebp(t.png);
    fs.writeFileSync(path.join(IMG, c.id + '.webp'), buf);
    // dpr deja a manuales.js mostrar los recortes a 2x en su tamaño real (w / dpr).
    datos[c.id] = { src: 'img/' + c.id + '.webp', w, h, dpr, marcas: t.marcas };
    const kb = (buf.length / 1024).toFixed(1);
    filas.push([c.id, w + '×' + h, kb + ' KB', 'q' + q, t.faltan.length ? 'faltan marcas ' + t.faltan.join(',') : '', t.errores.length ? 'pageerror: ' + t.errores[0].slice(0, 80) : ''].join(' | '));
    console.log('ok   ', c.id, w + '×' + h, kb + ' KB', t.faltan.length ? '· FALTAN ' + t.faltan : '');
  } catch (e) { fallos++; console.log('FALLA', c.id, e.message.split('\n')[0]); filas.push(c.id + ' | FALLA | ' + e.message.split('\n')[0]); }
}

const orden = Object.keys(datos).sort((a, b) => {
  const ia = CAPTURAS.findIndex(c => c.id === a), ib = CAPTURAS.findIndex(c => c.id === b);
  return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
});
const cuerpo = orden.map(id => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(datos[id])).join(',\n');
fs.writeFileSync(DATOS, '// GENERADO por herramientas/capturar.mjs; no se edita a mano.\nwindow.MANUALES_CAPTURAS = {\n' + cuerpo + '\n};\n');
console.log('\n' + filas.join('\n'));

await br.close(); srv.kill();
process.exit(fallos ? 1 : 0);
