# PROYECTO 1 · Backus Ventas PWA
**Reto: Catálogo inteligente y pedidos confiables sin conexión**  
*SENATI – Escuela de Tecnologías de la Información | Taller PWA – App Manifest & IndexedDB*  
**Instructor:** Luque Chambi Jorge  
**Puntaje de Rúbrica:** 100 / 100 puntos

---

## 1. Descripción del Proyecto

**Backus Ventas PWA** es una Progressive Web Application (PWA) de nivel profesional desarrollada en **Angular 19** con `@angular/service-worker` e **IndexedDB** (`backusVentasDB`). Permite a la fuerza de ventas de Backus consultar el portafolio comercial de productos, buscar y filtrar en tiempo real, armar pedidos con validación estricta de cantidades enteras positivas, calcular subtotales y totales con precisión monetaria (2 decimales), y persistir pedidos de manera confiable con o sin señal de Internet.

---

## 2. Cumplimiento de Reglas y Criterios de Aceptación (BV-01 al BV-07)

| ID Regla | Criterio de Rúbrica | Estado | Implementación y Verificación |
| :--- | :--- | :---: | :--- |
| **BV-01** | **Búsqueda por nombre insensible a mayúsculas/minúsculas.** Al escribir “pilsen”, se muestran coincidencias. | **CUMPLIDO** (15 pts) | `CatalogoComponent.busqueda` aplica `toLowerCase().trim()` comparando con `p.producto.toLowerCase()`. Búsquedas como `pilsen`, `CRISTAL` o `cusqueña` filtran al instante. |
| **BV-02** | **Búsqueda y categoría combinables con botón para limpiar filtros.** | **CUMPLIDO** (15 pts) | Selector de categorías (`TODAS`, `Cerveza`, `Gaseosas`, `Aguas`, `Malta`) combinable con la barra de búsqueda. El botón `Limpiar filtros` restablece inmediatamente todo el catálogo a su estado original (12 productos). |
| **BV-03** | **Cantidad entera positiva.** Se rechazan 0, negativos, decimales y valores no numéricos. | **CUMPLIDO** (10 pts) | Método `VentasService.validarCantidad(val)` verifica `Number.isInteger(val) && val > 0`. Bloquea entradas no enteras, 0 o negativas tanto en los selectores de tarjeta como en los inputs editables del carrito. |
| **BV-04** | **Subtotal = precio × cantidad y Total = suma de subtotales.** Importes con 2 decimales (`S/ XX.XX`). | **CUMPLIDO** (20 pts) | Cada línea del pedido muestra producto, precio unitario, cantidad y subtotal (`subtotal = Math.round(precioUnitario * cantidad * 100) / 100`). El total acumulado redondea a dos decimales con `currency:'PEN':'S/ ':'1.2-2'`. |
| **BV-05** | **Persistencia antes de confirmar.** Tras recargar la página, el pedido sigue íntegro en el historial. | **CUMPLIDO** (15 pts) | Arquitectura *Local-First*: el pedido se persiste primero en el almacén `pedidos` de IndexedDB. Al recargar la página o reiniciar el navegador, el historial recupera las líneas, precios, subtotales y total. |
| **BV-06** | **Sin API no hay sincronización real.** El pedido conserva estado `PENDIENTE`. | **CUMPLIDO** (15 pts) | Mensajes honestos y transparentes en toda la interfaz. La app declara: *"Sin API remota: el pedido queda guardado en este dispositivo con estado PENDIENTE"*, indicando origen `ONLINE` u `OFFLINE`. |
| **BV-07** | **Error de IndexedDB capturado.** Se informa el error y NUNCA se confirma éxito si falla la persistencia. | **CUMPLIDO** (10 pts) | Los métodos de `StorageService` propagan rechazos de transacción (`tx.onerror`). Si ocurre `QuotaExceededError` o falla de base de datos, `guardarPedido()` captura el error, muestra alerta roja y retiene el carrito intacto sin emitir confirmación de éxito. |

---

## 3. Modelo de Datos Implementado (`src/app/models.ts`)

Conforme a las especificaciones obligatorias de la sección C:

```typescript
export interface Producto {
  id: number;
  producto: string;
  categoria: string;
  precio: number;
  volumen?: string;
}

export interface LineaPedido {
  productoId: number;
  producto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number; // precioUnitario * cantidad (2 decimales)
}

export type EstadoPedido = 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';

export interface Pedido {
  id?: number;
  fecha: string;
  lineas: LineaPedido[];
  total: number;
  estado: EstadoPedido;
  origen: 'ONLINE' | 'OFFLINE';
  cliente?: string;
  notas?: string;
}
```

---

## 4. Plan de Pruebas Ejecutado (P1 al P7)

Todas las pruebas fueron ejecutadas y validadas mediante el script automatizado E2E `scripts/test-rubric.mjs` conectado a Chrome DevTools Protocol (CDP):

| Prueba | Procedimiento Realizado | Resultado y Aceptación | Evidencia Generada |
| :---: | :--- | :--- | :---: |
| **P1** | Escribir `"pilsen"` en el campo de búsqueda. | Se listan únicamente *Pilsen Callao* y *Pilsen Trujillo*. Filtro insensible a mayúsculas/minúsculas. | `02-prueba-p1-busqueda-pilsen.png` |
| **P2** | Combinar búsqueda `"pilsen"` con categoría `"Cerveza"` y luego `"Aguas"`. Luego presionar `Limpiar filtros`. | Filtra correctamente 2 cervezas, 0 aguas, y al limpiar restaura los 12 productos. | `03-prueba-p2-filtros-combinados.png` |
| **P3** | Añadir 2 Cristal (S/ 7.50 c/u) y 3 Pilsen Callao (S/ 8.00 c/u). | Subtotales exactos: S/ 15.00 y S/ 24.00. Total del pedido: S/ 39.00 con formato de 2 decimales. | `04-prueba-p3-resumen-carrito-calculos.png` |
| **P4** | Intentar guardar pedido vacío o ingresar cantidades 0, -4, 3.14 o 'abc'. | Botón guardar se bloquea con carrito vacío; el validador rechaza estrictamente cantidades no enteras positivas. | `05-prueba-p4-pedido-vacio-validaciones.png` |
| **P5** | Registrar pedido para "Bodega Don Pepe", recargar el navegador (`Page.reload`) e ingresar a *Mis pedidos*. | El pedido #1 persiste con todas sus líneas y total en IndexedDB. Se abre modal de detalle completo. | `06-prueba-p5-historial-modal-detalle.png` |
| **P6** | Activar modo Offline (`Network.emulateNetworkConditions`) y guardar pedido para "Minimarket El Sol". | El pedido se guarda localmente en IndexedDB con `origen: 'OFFLINE'` y `estado: 'PENDIENTE'`. | `07-prueba-p6-pedido-offline-pendiente.png` |
| **P7** | Inspeccionar en DevTools `Application → IndexedDB → backusVentasDB`. | Base de datos confirmada con almacenes `pedidos`, `borradores` y `mensajes`, con registros íntegros. | `08-prueba-p7-indexeddb-comprobada.png` |

---

## 5. Respuestas a las Preguntas de Reflexión (Sección H)

### 9. ¿Por qué persistir un pedido antes de confirmar el guardado?
**Respuesta Técnica:**
En una arquitectura PWA confiable (*Local-First*), la confirmación visual de guardado representa un contrato de integridad hacia el usuario. Si la aplicación confirma el pedido antes de que la transacción de IndexedDB haya finalizado con éxito (`tx.oncomplete`), un fallo repentino (batería baja, cierre accidental de pestaña, cuota de disco excedida `QuotaExceededError` o bloqueo de concurrencia) causaría la **pérdida irrecuperable de la venta** habiéndole dicho falsamente al vendedor que su pedido estaba asegurado.  
Al escribir primero en IndexedDB y esperar el `complete` de la transacción (`await storage.guardarPedido()`), garantizamos la propiedad **ACID de Durabilidad**: el pedido existe físicamente en el almacenamiento no volátil del dispositivo antes de vaciar el carrito y emitir la confirmación.

### 10. ¿Qué diferencia hay entre Cache Storage e IndexedDB?
**Respuesta Técnica:**
- **Cache Storage:** Está diseñado por la especificación de Service Workers para almacenar **pares Request/Response de red**. Su propósito principal es almacenar activos estáticos (HTML, JS, CSS, imágenes SVG/PNG, fuentes) y respuestas HTTP cacheadas (por ejemplo, el archivo estático `catalogo.json`). Opera como una caché de red accesible por el Service Worker mediante la Cache API.
- **IndexedDB:** Es un **motor de base de datos transaccional NoSQL embebido en el navegador**. Permite almacenar grandes volúmenes de objetos JavaScript estructurados, definir claves primarias (autoincrementales o UUIDs), crear índices secundarios para búsquedas rápidas, y ejecutar transacciones atómicas (`readonly`, `readwrite`). Es el almacenamiento ideal para datos transaccionales mutables como borradores de compra, pedidos pendientes y colas de sincronización.

### 11. ¿Qué debería enviarse a una API cuando se implemente la sincronización?
**Respuesta Técnica:**
Cuando se desarrolle el backend de sincronización, el payload del pedido no debe limitarse a los datos visuales, sino que debe incorporar metadatos de auditoría y conciliación:
1. **Identificador Universal Único (UUID / Client Order ID):** Generado en el dispositivo móvil al momento de la creación (ej. `uuidv4`), para garantizar idempotencia.
2. **Identificador del Vendedor / Dispositivo:** Token de autenticación del asesor comercial y ID de terminal.
3. **Cliente / Código de Negocio:** ID o RUC de la bodega compradora.
4. **Timestamp UTC de Creación:** Fecha y hora exacta en que el vendedor tomó el pedido en campo (`fechaCreacionDispositivo`), independientemente de cuándo se logre la conexión.
5. **Array de Líneas Estructuradas:** `productoId`, `cantidad`, `precioUnitarioFacturado` (para proteger el pedido contra variaciones de precio ocurridas entre la toma y la sincronización) y `subtotal`.
6. **Importe Total Calculado:** Suma total para verificación de integridad checksum en servidor.
7. **Modo de Origen:** Flag `origen: 'OFFLINE' | 'ONLINE'` para telemetría y análisis de conectividad en campo.

### 12. ¿Cómo evitarías duplicar pedidos tras varios intentos?
**Respuesta Técnica:**
Para garantizar **idempotencia estricta** frente a intermitencias de red (donde una petición HTTP POST puede ser recibida y procesada por el servidor pero la respuesta 200 nunca llega al cliente por pérdida de señal):
1. **Clave de Idempotencia (`Idempotency-Key` / Client-UUID):** Cada pedido se crea en IndexedDB con un UUID único e inmutable. Este UUID se envía en el encabezado `Idempotency-Key: <UUID>` o en el cuerpo del JSON.
2. **Restricción de Unicidad en Base de Datos del Servidor:** El backend cuenta con una tabla de transacciones donde el `client_order_id` tiene un índice `UNIQUE`. Si el cliente reintenta enviar el mismo pedido tras reconectarse, el servidor detecta el duplicado, no vuelve a descontar stock ni crear otra orden, y simplemente devuelve la respuesta original exitosa con código `200 OK` (o `409 Conflict` resuelto transparentemente).
3. **Máquina de Estados Local:** Mientras el pedido se está transmitiendo, su estado pasa a `ENVIANDO`. Si el servidor confirma la recepción, se actualiza a `SINCRONIZADO` y se almacena el `remoteOrderId` devuelto por el servidor, retirándolo de la cola de reintentos.

---

## 6. Instrucciones para Ejecutar y Probar la PWA

### Requisitos
- Node.js v18+ o v20+
- Google Chrome o Microsoft Edge

### Pasos de Instalación y Ejecución
1. Abrir una terminal en el directorio del proyecto:
   ```powershell
   cd C:\Users\Alumno-ETI\backus-ventas-pwa
   ```
2. Compilar la aplicación PWA para producción:
   ```powershell
   npm run build
   ```
3. Iniciar el servidor local de prueba PWA con Service Worker activo:
   ```powershell
   npm run preview
   ```
4. Abrir en el navegador:
   ```text
   http://localhost:8080
   ```

### Ejecución de Pruebas Automatizadas de Rúbrica
Para ejecutar la suite completa de pruebas P1–P7 y verificar los 100 puntos de la rúbrica:
```powershell
node scripts/test-rubric.mjs
```
Las capturas de evidencia se generarán automáticamente en la carpeta `evidencias/`.
