// Captura y mide cada vista de superficie.json a 375/768/1280: escribe img/responsive/ y responsive-medicion.json.
// Uso: node docs/model/medir-responsive.mjs [vista…]   Playwright sale de PLAYWRIGHT_PATH o de momentum-web.
// Las vistas de referencia de superficie.json (fuera de la fase 1 o no disponibles) no se miden: conservan su medición anterior.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PW = process.env.PLAYWRIGHT_PATH || '/Users/jorge-guzman/Naowee/momentum-web/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const IMG = path.resolve(AQUI, '..', 'img', 'responsive');
const SALIDA = path.join(AQUI, 'responsive-medicion.json');
const ANCHOS = [375, 768, 1280];
const ALTO = { 375: 812, 768: 1024, 1280: 800 };
const HORA = new Date('2026-10-15T18:40:00-05:00');
const IVC = 'suid/app.html#/control-acceso/';

const ir = async (p, ruta, ms = 1000) => { await p.goto(BASE + ruta); await p.waitForTimeout(ms); };
const idRecibido = p => p.evaluate(() => GI.all().find(r => r.estadoRegistro === 'Recibido').id);
const buscar = async (p, doc) => { await p.fill('#gcQ', doc); await p.click('#gcGo'); await p.waitForTimeout(1600); };
const abrirResultado = async p => { await p.locator('#gcOut tbody tr, #gcOut [role=button], #gcOut button').first().click(); await p.waitForTimeout(900); };

// Carga masiva con el archivo de ejemplo con errores: 3 valida, 4 corrige (excluye las malas), 5 confirma.
async function cargaHasta(p, paso) {
  const sig = async () => { await p.click('#bkNext'); await p.waitForTimeout(700); };
  await p.getByRole('button', { name: 'Ya la tengo' }).first().click(); await p.waitForTimeout(500);
  await p.click('#bkExErr'); await p.waitForTimeout(600); await sig();
  await p.waitForFunction(() => !document.querySelector('#bkNext[disabled]'), null, { timeout: 8000 }).catch(() => {});
  if (paso === 3) return;
  await sig(); if (paso === 4) return;
  for (let i = 0; i < 20; i++) { const b = p.locator('[data-a="excl"]:visible').first(); if (!(await b.count())) break; await b.click(); await p.waitForTimeout(250); }
  await sig(); await p.waitForTimeout(400);
}

// Una receta por vista de superficie.json. Lo que no se pueda abrir solo queda como «manual».
const RECETAS = {
  login: { ruta: 'index.html' },
  indicadores: { ruta: IVC + 'infractores' },
  registros: { ruta: IVC + 'infractores', prep: async p => { await p.click('#giTabR'); await p.waitForTimeout(700); } },
  'panel-registro': { ruta: IVC + 'infractores', prep: async p => {
    await p.click('#giTabR'); await p.waitForTimeout(700);
    await p.locator('#view tbody tr:visible, #view [data-id]:visible').first().click({ position: { x: 20, y: 10 } }); await p.waitForTimeout(900);
  } },
  registrar: { ruta: IVC + 'infractores/nuevo' },
  carga: { ruta: IVC + 'infractores/carga-masiva' },
  'carga-salir': { ruta: IVC + 'infractores/carga-masiva', prep: async p => {
    await p.getByRole('button', { name: 'Ya la tengo' }).first().click(); await p.waitForTimeout(600);
    await p.getByRole('button', { name: /Salir|Cancelar|Volver/ }).first().click(); await p.waitForTimeout(600);
    await p.locator('.naowee-modal').first().waitFor({ timeout: 2000 });
  } },
  'carga-3': { ruta: IVC + 'infractores/carga-masiva', prep: p => cargaHasta(p, 3) },
  'carga-4': { ruta: IVC + 'infractores/carga-masiva', prep: p => cargaHasta(p, 4) },
  ficha: { ruta: IVC + 'infractores', prep: async p => { await ir(p, IVC + 'infractores/' + await idRecibido(p), 1200); } },
  validar: { ruta: IVC + 'infractores', prep: async p => { await ir(p, IVC + 'infractores/' + await idRecibido(p), 1200); await p.click('#aVal'); await p.waitForTimeout(600); } },
  devolver: { ruta: IVC + 'infractores', prep: async p => { await ir(p, IVC + 'infractores/' + await idRecibido(p), 1200); await p.click('#aSub'); await p.waitForTimeout(600); } },
  editar: { ruta: IVC + 'infractores/INF-2026-0044/editar' },
  consulta: { ruta: IVC + 'consulta', prep: p => buscar(p, '1090000004') },
  'panel-persona': { ruta: IVC + 'consulta', prep: async p => { await buscar(p, '1090000004'); await abrirResultado(p); } },
  'menor-motivo': { ruta: IVC + 'consulta', prep: async p => {
    await buscar(p, '1090000007'); await abrirResultado(p);
    await p.waitForTimeout(1200);
    await p.locator('[data-open]:visible').last().click(); await p.waitForTimeout(800);
    await p.locator('.naowee-modal').first().waitFor({ timeout: 3000 });
  } },
  calidad: { ruta: IVC + 'calidad' },
  trazabilidad: { ruta: IVC + 'calidad', prep: async p => { await p.click('[data-tab="aud"]'); await p.waitForTimeout(700); } },
  avisos: { manual: 'Aviso breve de 3 s: se revisa a mano al validar o devolver.' }
};

// Corre dentro de la página: desborde, elementos que se salen, zonas táctiles y texto chico.
function medir(ancho) {
  const W = innerWidth, vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const nombre = e => e.id ? '#' + e.id : e.tagName.toLowerCase() + ([...e.classList].slice(0, 2).map(c => '.' + c).join(''));
  const ruta = e => { const out = []; for (let n = e; n && n !== document.body && out.length < 3; n = n.parentElement) out.unshift(nombre(n)); return out.join(' > '); };
  // El shell (#app-shell, .main, #view) recorta por diseño; cualquier otro recorte sí cuenta.
  const SHELL = new Set([document.getElementById('app-shell'), document.querySelector('#app-shell > .main'), document.getElementById('view')]);
  const contenedor = e => { for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) { if (SHELL.has(n)) return null; const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') return 'scroll'; if ((o === 'hidden' || o === 'clip') && n.getBoundingClientRect().right <= W + 1) return 'recorte'; } return null; };
  const todos = [...document.body.querySelectorAll('*')].filter(e => vis(e) && !e.closest('.sr-only'));
  const fuera = todos.filter(e => e.getBoundingClientRect().right > W + 1);
  const raiz = l => l.filter(e => !l.includes(e.parentElement)).slice(0, 8).map(e => ({ el: ruta(e), der: Math.round(e.getBoundingClientRect().right) }));
  const salen = fuera.filter(e => !contenedor(e)), recortados = fuera.filter(e => contenedor(e) === 'recorte');
  const scrollH = todos.filter(e => { const o = getComputedStyle(e).overflowX; return (o === 'auto' || o === 'scroll') && e.scrollWidth > e.clientWidth + 4; })
    .slice(0, 6).map(e => ({ el: ruta(e), ancho: e.scrollWidth, visible: e.clientWidth }));
  const interactivos = todos.filter(e => e.matches('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=checkbox],[role=switch]'));
  const chicos = interactivos.filter(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height) > 2 && Math.min(r.width, r.height) < 44 && r.right > 0 && r.left < W; });
  const textoChico = todos.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12);
  return {
    ancho, desborde: document.scrollingElement.scrollWidth - W, alto: document.scrollingElement.scrollHeight,
    salen: raiz(salen), recortados: raiz(recortados), scrollH,
    tactil: { chicos: chicos.length, total: interactivos.length, ej: chicos.slice(0, 5).map(e => ruta(e) + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height)) },
    texto12: { n: textoChico.length, ej: [...new Set(textoChico.slice(0, 20).map(e => nombre(e) + ' ' + getComputedStyle(e).fontSize))].slice(0, 5) }
  };
}

const libre = () => new Promise(r => { const s = net.createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => r(port)); }); });
const PUERTO = await libre();
const BASE = 'http://127.0.0.1:' + PUERTO + '/';
const srv = spawn('python3', ['-m', 'http.server', String(PUERTO), '--bind', '127.0.0.1'], { cwd: RAIZ, stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(BASE + 'index.html'); break; } catch { await new Promise(r => setTimeout(r, 100)); } }

const br = await chromium.launch();
const conv = await (await br.newContext()).newPage();
fs.mkdirSync(IMG, { recursive: true });

async function aWebp(png, maxW) {
  const out = await conv.evaluate(async ({ b64, maxW }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const k = Math.min(1, maxW / img.width), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.72);
  }, { b64: png.toString('base64'), maxW });
  return Buffer.from(out.split(',')[1], 'base64');
}

async function tomar(id, rec, W) {
  const ctx = await br.newContext({ viewport: { width: W, height: ALTO[W] }, deviceScaleFactor: W === 375 ? 2 : 1, hasTouch: W < 1280, isMobile: W === 375 });
  await ctx.clock.setFixedTime(HORA);
  const p = await ctx.newPage(); p.setDefaultTimeout(6000);
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  try {
    await ir(p, rec.ruta);
    if (rec.prep) await rec.prep(p);
    await p.waitForFunction(() => !document.querySelector('.sk-progress.is-on'), null, { timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(300);
    const m = await p.evaluate(medir, W);
    // El scroll vive en #view: se despliega para capturar la vista entera, hasta 2,5 pantallas.
    const alto = await p.evaluate(H => {
      const v = document.getElementById('view'); if (!v) return Math.min(document.scrollingElement.scrollHeight, H);
      const extra = v.scrollHeight - v.clientHeight;
      if (document.querySelector('.naowee-modal, .gpn')) return innerHeight;
      for (const s of [document.getElementById('app-shell'), v.parentElement, v]) { s.style.height = 'auto'; s.style.overflow = 'visible'; }
      // Las barras fijas de abajo pasan al final; si no, quedan flotando a mitad de la captura.
      for (const b of document.querySelectorAll('.gi-bar, .gb-foot')) { b.style.position = 'static'; b.style.paddingBottom = '14px'; }
      return Math.min(innerHeight + extra, H);
    }, Math.round(ALTO[W] * 2.5));
    const png = await p.screenshot({ clip: { x: 0, y: 0, width: W, height: alto }, fullPage: true, animations: 'disabled' });
    const archivo = id + '-' + W + '.webp';
    fs.writeFileSync(path.join(IMG, archivo), await aWebp(png, W === 1280 ? 1000 : W === 768 ? 640 : 560));
    return { ...m, img: 'img/responsive/' + archivo, errores: errores.slice(0, 2) };
  } finally { await ctx.close(); }
}

const pedidas = process.argv.slice(2);
const previa = (() => { try { return JSON.parse(fs.readFileSync(SALIDA, 'utf8')); } catch { return {}; } })();
const res = { ...previa };
// Misma regla que gen-superficie.py y gen-responsive.py: grupo con «fuera» o vista con «fuera» propio.
const SUP = JSON.parse(fs.readFileSync(path.join(AQUI, 'superficie.json'), 'utf8'));
const REF = new Set([...SUP.grupos.filter(g => g.fuera).flatMap(g => g.vistas), ...Object.keys(SUP.vistas).filter(i => SUP.vistas[i].fuera)]);
for (const [id, rec] of Object.entries(RECETAS)) {
  if (pedidas.length && !pedidas.includes(id)) continue;
  if (REF.has(id)) { console.log('referencia', id, '(se conserva la medición anterior)'); continue; }
  if (rec.manual) { res[id] = { manual: rec.manual }; console.log('manual', id); continue; }
  res[id] = {};
  for (const W of ANCHOS) {
    try {
      const m = await tomar(id, rec, W); res[id][W] = m;
      console.log('ok   ', id, W, 'desborde', m.desborde, 'salen', m.salen.length, 'recortados', m.recortados.length, 'scrollH', m.scrollH.length, 'táctil<44', m.tactil.chicos + '/' + m.tactil.total, 'texto<12', m.texto12.n);
    } catch (e) { res[id][W] = { falla: e.message.split('\n')[0] }; console.log('FALLA', id, W, e.message.split('\n')[0]); }
  }
}
fs.writeFileSync(SALIDA, JSON.stringify(res, null, 1) + '\n');
await br.close(); srv.kill();
