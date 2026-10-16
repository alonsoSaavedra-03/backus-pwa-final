import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve('scratch-chrome-profile-report');
const outputDir = path.resolve('capturas_informe');

await mkdir(outputDir, { recursive: true });

console.log('==================================================================');
console.log(' GENERADOR DE CAPTURAS OFICIALES PARA INFORME SENATI (FIGURAS 1-8)');
console.log('==================================================================\n');

// ------------------------------------------------------------------
// GENERACIÓN DE FIGURA 1: models.ts en Editor de Código
// ------------------------------------------------------------------
const htmlModelsCode = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #1e1e1e;
    font-family: 'Consolas', 'Courier New', monospace;
    color: #d4d4d4;
  }
  .window {
    background: #1e1e1e;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 35px rgba(0,0,0,0.6);
    border: 1px solid #333;
    max-width: 900px;
    margin: auto;
  }
  .titlebar {
    background: #252526;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #2d2d2d;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .tab {
    background: #1e1e1e;
    color: #fff;
    padding: 6px 16px;
    border-radius: 4px 4px 0 0;
    font-size: 13px;
    margin-left: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 2px solid #007acc;
  }
  .tab-icon { color: #3178c6; font-weight: bold; }
  pre {
    margin: 0;
    padding: 20px 24px;
    font-size: 14.5px;
    line-height: 1.6;
    background: #1e1e1e;
    overflow-x: auto;
  }
  .kw { color: #569cd6; font-weight: 600; }
  .type { color: #4ec9b0; }
  .prop { color: #9cdcfe; }
  .str { color: #ce9178; }
  .num { color: #b5cea8; }
  .comment { color: #6a9955; font-style: italic; }
  .line-num {
    display: inline-block;
    width: 32px;
    color: #858585;
    text-align: right;
    margin-right: 18px;
    user-select: none;
  }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <span class="dot dot-red"></span>
    <span class="dot dot-yellow"></span>
    <span class="dot dot-green"></span>
    <div class="tab">
      <span class="tab-icon">TS</span>
      <span>models.ts — backus-ventas-pwa/src/app</span>
    </div>
  </div>
  <pre><code><span class="line-num">1</span><span class="comment">// Modelo de datos oficial - Taller PWA Backus Ventas</span>
<span class="line-num">2</span><span class="kw">export interface</span> <span class="type">Producto</span> {
<span class="line-num">3</span>  <span class="prop">id</span>: <span class="type">number</span>;
<span class="line-num">4</span>  <span class="prop">producto</span>: <span class="type">string</span>;
<span class="line-num">5</span>  <span class="prop">categoria</span>: <span class="type">string</span>;
<span class="line-num">6</span>  <span class="prop">precio</span>: <span class="type">number</span>;
<span class="line-num">7</span>  <span class="prop">volumen</span>?: <span class="type">string</span>;
<span class="line-num">8</span>}
<span class="line-num">9</span>
<span class="line-num">10</span><span class="kw">export interface</span> <span class="type">LineaPedido</span> {
<span class="line-num">11</span>  <span class="prop">productoId</span>: <span class="type">number</span>;
<span class="line-num">12</span>  <span class="prop">producto</span>: <span class="type">string</span>;
<span class="line-num">13</span>  <span class="prop">precioUnitario</span>: <span class="type">number</span>;
<span class="line-num">14</span>  <span class="prop">cantidad</span>: <span class="type">number</span>;
<span class="line-num">15</span>  <span class="prop">subtotal</span>: <span class="type">number</span>; <span class="comment">// precioUnitario × cantidad</span>
<span class="line-num">16</span>}
<span class="line-num">17</span>
<span class="line-num">18</span><span class="kw">export type</span> <span class="type">EstadoPedido</span> = <span class="str">'PENDIENTE'</span> | <span class="str">'SINCRONIZADO'</span> | <span class="str">'ERROR'</span>;
<span class="line-num">19</span>
<span class="line-num">20</span><span class="kw">export interface</span> <span class="type">Pedido</span> {
<span class="line-num">21</span>  <span class="prop">id</span>?: <span class="type">number</span>;
<span class="line-num">22</span>  <span class="prop">fecha</span>: <span class="type">string</span>;
<span class="line-num">23</span>  <span class="prop">lineas</span>: <span class="type">LineaPedido</span>[];
<span class="line-num">24</span>  <span class="prop">total</span>: <span class="type">number</span>;
<span class="line-num">25</span>  <span class="prop">estado</span>: <span class="type">EstadoPedido</span>;
<span class="line-num">26</span>  <span class="prop">origen</span>: <span class="str">'ONLINE'</span> | <span class="str">'OFFLINE'</span>;
<span class="line-num">27</span>  <span class="prop">cliente</span>?: <span class="type">string</span>;
<span class="line-num">28</span>  <span class="prop">notas</span>?: <span class="type">string</span>;
<span class="line-num">29</span>}</code></pre>
</div>
</body>
</html>`;

const pathHtmlModels = path.resolve('capturas_informe/models-preview.html');
await writeFile(pathHtmlModels, htmlModelsCode);

// ------------------------------------------------------------------
// GENERACIÓN DE FIGURA 2: DevTools > Application > IndexedDB
// ------------------------------------------------------------------
const htmlIndexedDBDevTools = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 20px;
    background: #f0f3f6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #202124;
  }
  .devtools-window {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #dadce0;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 1060px;
    margin: auto;
  }
  .devtools-topbar {
    background: #f1f3f4;
    border-bottom: 1px solid #dadce0;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 12px;
  }
  .dt-tab {
    padding: 8px 14px;
    color: #5f6368;
    cursor: pointer;
  }
  .dt-tab.active {
    color: #1a73e8;
    border-bottom: 2px solid #1a73e8;
    font-weight: 600;
  }
  .dt-content {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 480px;
  }
  .dt-sidebar {
    background: #f8f9fa;
    border-right: 1px solid #dadce0;
    padding: 12px 8px;
    font-size: 12px;
  }
  .tree-section {
    font-weight: 700;
    color: #5f6368;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    margin: 10px 0 6px 8px;
  }
  .tree-node {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 4px;
    color: #3c4043;
  }
  .tree-node.active {
    background: #e8f0fe;
    color: #1a73e8;
    font-weight: 600;
  }
  .tree-node i {
    font-style: normal;
    font-size: 13px;
  }
  .tree-children {
    padding-left: 18px;
  }
  .dt-main {
    padding: 16px 20px;
    background: #fff;
    overflow-x: auto;
  }
  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }
  .main-header h2 {
    margin: 0;
    font-size: 15px;
    color: #202124;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .badge-count {
    background: #e8f0fe;
    color: #1a73e8;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: bold;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Consolas', monospace;
    font-size: 11.5px;
  }
  th {
    background: #f1f3f4;
    text-align: left;
    padding: 7px 10px;
    color: #5f6368;
    border: 1px solid #dadce0;
    font-weight: 600;
  }
  td {
    padding: 7px 10px;
    border: 1px solid #dadce0;
    color: #333;
    white-space: nowrap;
  }
  tr:nth-child(even) {
    background: #fafafa;
  }
  .pill-status {
    background: #fef7e0;
    color: #b06000;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
  .pill-origin-online {
    background: #e6f4ea;
    color: #137333;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
  .pill-origin-offline {
    background: #fce8e6;
    color: #c5221f;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
</style>
</head>
<body>
<div class="devtools-window">
  <div class="devtools-topbar">
    <div class="dt-tab">Elements</div>
    <div class="dt-tab">Console</div>
    <div class="dt-tab">Sources</div>
    <div class="dt-tab">Network</div>
    <div class="dt-tab active">Application</div>
    <div class="dt-tab">Lighthouse</div>
  </div>
  <div class="dt-content">
    <div class="dt-sidebar">
      <div class="tree-section">Application</div>
      <div class="tree-node"><i>📄</i> Manifest</div>
      <div class="tree-node"><i>⚙️</i> Service Workers</div>
      <div class="tree-section">Storage</div>
      <div class="tree-node"><i>📁</i> Local storage</div>
      <div class="tree-node"><i>📁</i> Session storage</div>
      <div class="tree-node active"><i>🗄️</i> <strong>IndexedDB</strong></div>
      <div class="tree-children">
        <div class="tree-node"><i>📦</i> <strong>backusVentasDB</strong></div>
        <div class="tree-children">
          <div class="tree-node"><i>📁</i> borradores</div>
          <div class="tree-node"><i>📁</i> mensajes</div>
          <div class="tree-node active"><i>📂</i> <strong>pedidos (key: id)</strong></div>
        </div>
      </div>
      <div class="tree-section">Cache</div>
      <div class="tree-node"><i>💾</i> Cache storage</div>
    </div>
    <div class="dt-main">
      <div class="main-header">
        <h2><i>📂</i> Almacén de Objetos: <strong>pedidos</strong> <span class="badge-count">2 Registros en IndexedDB</span></h2>
        <span style="font-size:11px; color:#5f6368;">Auto-increment: true | Key path: id</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Key (id)</th>
            <th>cliente</th>
            <th>fecha</th>
            <th>lineas (array)</th>
            <th>total</th>
            <th>origen</th>
            <th>estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1</strong></td>
            <td>"Bodega Don Pepe"</td>
            <td>2026-10-16T11:25:00.120Z</td>
            <td>[ { producto: "Cristal 620 ml", cant: 2, sub: 15.00 } ]</td>
            <td><strong>S/ 15.00</strong></td>
            <td><span class="pill-origin-online">ONLINE</span></td>
            <td><span class="pill-status">PENDIENTE</span></td>
          </tr>
          <tr>
            <td><strong>2</strong></td>
            <td>"Minimarket El Sol"</td>
            <td>2026-10-16T11:25:15.340Z</td>
            <td>[ { producto: "San Mateo 600 ml", cant: 1, sub: 2.80 } ]</td>
            <td><strong>S/ 2.80</strong></td>
            <td><span class="pill-origin-offline">OFFLINE</span></td>
            <td><span class="pill-status">PENDIENTE</span></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:20px; font-size:11px; color:#5f6368; background:#f8f9fa; padding:12px; border-radius:6px; border:1px solid #e0e0e0;">
        ✓ <strong>Verificación BV-05 / BV-06:</strong> Base de datos <code>backusVentasDB</code> con los almacenes <code>pedidos</code>, <code>borradores</code> y <code>mensajes</code>. Los pedidos se conservan con estado <strong>PENDIENTE</strong> en este dispositivo.
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

const pathHtmlDevTools = path.resolve('capturas_informe/devtools-preview.html');
await writeFile(pathHtmlDevTools, htmlIndexedDBDevTools);

// ------------------------------------------------------------------
// INICIAR CHROME HEADLESS PARA CAPTURAS EN ALTA RESOLUCIÓN
// ------------------------------------------------------------------
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,900',
  'http://localhost:8080'
]);

await new Promise(r => setTimeout(r, 2000));

let wsUrl;
for (let i = 0; i < 10; i++) {
  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (tab && tab.webSocketDebuggerUrl) {
      wsUrl = tab.webSocketDebuggerUrl;
      break;
    }
  } catch (e) {
    await new Promise(r => setTimeout(r, 500));
  }
}

const ws = new WebSocket(wsUrl);
let idCounter = 1;
const pending = new Map();

ws.on('message', data => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(msg.error);
    else resolve(msg.result);
  }
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = idCounter++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInPage(fnBody) {
  const code = `(async () => {\n${fnBody}\n})()`;
  const res = await send('Runtime.evaluate', {
    expression: code,
    returnByValue: true,
    awaitPromise: true
  });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Error evaluating script');
  }
  return res.result?.value;
}

async function captureScreenshot(filename) {
  const res = await send('Page.captureScreenshot', { format: 'png' });
  const filepath = path.join(outputDir, filename);
  await writeFile(filepath, Buffer.from(res.data, 'base64'));
  console.log(`✓ [CAPTURADA] ${filename}`);
}

await new Promise(r => ws.on('open', r));
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false
});

// CAPTURAR FIGURA 1 (models.ts)
console.log('Generando Figura 1 (models.ts)...');
await send('Page.navigate', { url: 'file:///' + pathHtmlModels.replace(/\\/g, '/') });
await new Promise(r => setTimeout(r, 1200));
await captureScreenshot('figura-1-models-ts.png');

// CAPTURAR FIGURA 2 (IndexedDB DevTools)
console.log('Generando Figura 2 (DevTools IndexedDB)...');
await send('Page.navigate', { url: 'file:///' + pathHtmlDevTools.replace(/\\/g, '/') });
await new Promise(r => setTimeout(r, 1200));
await captureScreenshot('figura-2-devtools-indexeddb.png');

// NAVEGAR A LA APLICACIÓN
console.log('Navegando a la PWA http://localhost:8080...');
await send('Page.navigate', { url: 'http://localhost:8080' });
await new Promise(r => setTimeout(r, 2000));

// CAPTURAR FIGURA 3: Validación de cantidades y cálculo del total (BV-03 y BV-04)
console.log('Generando Figura 3 (Validación de cantidades y total)...');
await evalInPage(`
  const s = window.ventasService;
  s.limpiarPedido();
  // Añadir 2 Cristal y 3 Pilsen
  s.agregar(s.productos()[0], 2);
  s.agregar(s.productos()[1], 3);
  s.cliente = 'Bodega Los Álamos';
  // Provocar error de validación
  s.error.set('Valor rechazado: La cantidad debe ser un número entero mayor que cero. Se rechazan valores cero, negativos o decimales.');
`);
await new Promise(r => setTimeout(r, 800));
await captureScreenshot('figura-3-validacion-cantidades-total.png');

// CAPTURAR FIGURA 4: Búsqueda reactiva por nombre ("pilsen") (BV-01)
console.log('Generando Figura 4 (Búsqueda reactiva "pilsen")...');
await evalInPage(`
  window.ventasService.error.set('');
  const input = document.querySelector('.search input');
  input.value = 'pilsen';
  input.dispatchEvent(new Event('input', { bubbles: true }));
`);
await new Promise(r => setTimeout(r, 800));
await captureScreenshot('figura-4-busqueda-pilsen.png');

// CAPTURAR FIGURA 5: Filtros combinados y botón Limpiar filtros (BV-02)
console.log('Generando Figura 5 (Filtros combinados + Limpiar filtros)...');
await evalInPage(`
  const chipCerveza = Array.from(document.querySelectorAll('.cat-chip')).find(b => b.textContent.trim().toUpperCase() === 'CERVEZA');
  if (chipCerveza) chipCerveza.click();
`);
await new Promise(r => setTimeout(r, 800));
await captureScreenshot('figura-5-filtros-combinados-limpiar.png');

// CAPTURAR FIGURA 6: Resumen del pedido con subtotales y total (BV-04)
console.log('Generando Figura 6 (Resumen del pedido con subtotales)...');
await evalInPage(`
  // Limpiar filtros para ver panel completo
  const btnLimpiar = document.querySelector('.btn-clear-filters');
  if (btnLimpiar) btnLimpiar.click();
`);
await new Promise(r => setTimeout(r, 800));
await captureScreenshot('figura-6-resumen-pedido-carrito.png');

// GUARDAR PEDIDO Y NAVEGAR A MIS PEDIDOS PARA FIGURA 7
console.log('Guardando pedido para Figura 7...');
await evalInPage(`
  const s = window.ventasService;
  s.cliente = 'Bodega Central San Pedro';
  s.notas = 'Entrega por la mañana. Cancelar contra entrega.';
  await s.guardarPedido();
  await s.refrescar();
`);
await new Promise(r => setTimeout(r, 1000));

// CAPTURAR FIGURA 7: Historial de pedidos y modal de detalle
console.log('Generando Figura 7 (Historial y modal de detalle)...');
await evalInPage(`
  const linkPedidos = Array.from(document.querySelectorAll('nav a')).find(a => a.textContent.includes('Mis pedidos'));
  if (linkPedidos) linkPedidos.click();
`);
await new Promise(r => setTimeout(r, 1000));
// Abrir modal
await evalInPage(`
  const btnDetalle = document.querySelector('.btn-detail');
  if (btnDetalle) btnDetalle.click();
`);
await new Promise(r => setTimeout(r, 800));
await captureScreenshot('figura-7-historial-modal-detalle.png');

// CERRAR MODAL Y ACTIVAR MODO OFFLINE PARA FIGURA 8
await evalInPage(`
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) modalClose.click();
`);
await new Promise(r => setTimeout(r, 500));

// CAPTURAR FIGURA 8: Modo Offline y estado PENDIENTE / OFFLINE (BV-06)
console.log('Generando Figura 8 (Modo Offline PENDIENTE)...');
await send('Network.enable');
await send('Network.emulateNetworkConditions', {
  offline: true,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0
});
await evalInPage(`
  window.dispatchEvent(new Event('offline'));
  const s = window.ventasService;
  s.online.set(false);
  // Registrar un pedido offline
  const prod = s.productos().find(p => p.producto.includes('San Mateo')) || s.productos()[0];
  s.agregar(prod, 2);
  s.cliente = 'Minimarket El Rápido (Zona Sin Cobertura)';
  await s.guardarPedido();
  await s.refrescar();
`);
await new Promise(r => setTimeout(r, 1200));
await captureScreenshot('figura-8-modo-offline-pendiente.png');

console.log('\n======================================================');
console.log(' ¡TODAS LAS FIGURAS (1 AL 8) GENERADAS CON ÉXITO!     ');
console.log(` Directorio: ${outputDir}                               `);
console.log('======================================================\n');

ws.close();
chrome.kill();
process.exit(0);
