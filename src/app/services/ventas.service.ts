import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Borrador, LineaPedido, Mensaje, Pedido, Producto } from '../models';
import { CatalogoService } from './catalogo.service';
import { StorageService } from './storage.service';

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  readonly storage = inject(StorageService);
  private catalogo = inject(CatalogoService);

  online = signal(navigator.onLine);
  productos = signal<Producto[]>([]);
  lineas = signal<LineaPedido[]>([]);
  pedidos = signal<Pedido[]>([]);
  mensajes = signal<Mensaje[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  aviso = signal('');
  listoOffline = signal(false);
  install = signal<InstallEvent | null>(null);
  instalada = signal(matchMedia('(display-mode: standalone)').matches);

  cliente = '';
  notas = '';
  mensaje = '';
  private draftQueue: Promise<unknown> = Promise.resolve();

  // BV-04: Subtotal = precio * cantidad, Total = suma de subtotales
  total = computed(() => {
    const sum = this.lineas().reduce((acc, l) => acc + l.subtotal, 0);
    return Math.round(sum * 100) / 100;
  });

  unidades = computed(() => this.lineas().reduce((acc, l) => acc + l.cantidad, 0));

  constructor() {
    window.addEventListener('online', () => {
      this.online.set(true);
      this.aviso.set('Conexión reestablecida. Los pedidos se conservan en IndexedDB (Modo ONLINE).');
    });
    window.addEventListener('offline', () => {
      this.online.set(false);
      this.aviso.set('Modo sin conexión activado. Los pedidos se guardarán localmente (Modo OFFLINE).');
    });
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.install.set(e as InstallEvent);
    });
    window.addEventListener('appinstalled', () => {
      this.instalada.set(true);
      this.install.set(null);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => void this.prepararOffline());
      void navigator.serviceWorker.ready.then(() => this.prepararOffline());
    }

    void this.iniciar();
  }

  // BV-03: Validación estricta de cantidad entera positiva
  validarCantidad(val: unknown): boolean {
    if (typeof val === 'number') {
      return !isNaN(val) && isFinite(val) && Number.isInteger(val) && val > 0;
    }
    if (typeof val === 'string' && val.trim() !== '') {
      const parsed = Number(val);
      return !isNaN(parsed) && isFinite(parsed) && Number.isInteger(parsed) && parsed > 0;
    }
    return false;
  }

  private async iniciar() {
    try {
      const b = await this.storage.borrador();
      if (b) {
        this.lineas.set(b.lineas || []);
        this.cliente = b.cliente || '';
        this.notas = b.notas || '';
        this.mensaje = b.mensaje || '';
      }
      await this.refrescar();
    } catch {
      this.error.set('No se pudo inicializar IndexedDB. Comprueba los permisos de almacenamiento.');
    }
    await this.cargar();
  }

  async cargar() {
    this.loading.set(true);
    try {
      const prods = await firstValueFrom(this.catalogo.obtenerCatalogo());
      this.productos.set(prods);
    } catch {
      this.error.set('No se pudo cargar el catálogo. Conéctate a Internet para sincronizarlo una vez.');
    } finally {
      this.loading.set(false);
    }
    if (navigator.serviceWorker?.controller) void this.prepararOffline();
  }

  private async prepararOffline() {
    try {
      if (!navigator.serviceWorker.controller) return;
      await firstValueFrom(this.catalogo.obtenerCatalogo());
      const names = await caches.keys();
      for (const name of names.filter(n => n.includes('catalogo') && n.endsWith(':cache'))) {
        if (await (await caches.open(name)).match(new URL('data/catalogo.json', document.baseURI).href)) {
          this.listoOffline.set(true);
          return;
        }
      }
    } catch {
      this.listoOffline.set(false);
    }
  }

  async refrescar() {
    try {
      const [p, m] = await Promise.all([this.storage.pedidos(), this.storage.mensajes()]);
      this.pedidos.set(p.reverse());
      this.mensajes.set(m.reverse());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      this.error.set('Error al leer pedidos de IndexedDB: ' + msg);
    }
  }

  persistir() {
    const b: Borrador = {
      id: 'actual',
      lineas: structuredClone(this.lineas()),
      cliente: this.cliente,
      notas: this.notas,
      mensaje: this.mensaje
    };
    this.draftQueue = this.draftQueue
      .then(() => this.storage.guardarBorrador(b))
      .catch(() => this.error.set('No se pudo guardar el borrador del pedido en almacenamiento local.'));
  }

  // BV-03 & BV-04: Añadir con cantidad validada y subtotal calculado
  agregar(p: Producto, cantidad: number = 1) {
    if (!this.validarCantidad(cantidad)) {
      this.error.set('Cantidad inválida. Solo se aceptan números enteros mayores que cero.');
      return;
    }

    const cantEntera = Math.trunc(cantidad);
    const actual = this.lineas().find(l => l.productoId === p.id);

    if (actual) {
      const nuevaCantidad = actual.cantidad + cantEntera;
      if (nuevaCantidad > 999) {
        this.error.set('La cantidad máxima por producto es 999 unidades.');
        return;
      }
      this.lineas.update(ls =>
        ls.map(l =>
          l.productoId === p.id
            ? {
                ...l,
                cantidad: nuevaCantidad,
                subtotal: Math.round(l.precioUnitario * nuevaCantidad * 100) / 100
              }
            : l
        )
      );
    } else {
      const nuevaLinea: LineaPedido = {
        productoId: p.id,
        producto: p.producto,
        precioUnitario: p.precio,
        cantidad: cantEntera,
        subtotal: Math.round(p.precio * cantEntera * 100) / 100
      };
      this.lineas.update(ls => [...ls, nuevaLinea]);
    }

    this.persistir();
    this.aviso.set(`${p.producto} (+${cantEntera}) añadido al pedido.`);
  }

  // BV-03 & BV-04: Modificar cantidad en carrito
  actualizarCantidad(productoId: number, valor: unknown) {
    if (!this.validarCantidad(valor)) {
      this.error.set('Valor rechazado: La cantidad debe ser un número entero mayor que cero.');
      return;
    }

    const cant = Math.min(999, Math.trunc(Number(valor)));
    this.lineas.update(ls =>
      ls.map(l =>
        l.productoId === productoId
          ? {
              ...l,
              cantidad: cant,
              subtotal: Math.round(l.precioUnitario * cant * 100) / 100
            }
          : l
      )
    );
    this.persistir();
  }

  incrementar(productoId: number) {
    const linea = this.lineas().find(l => l.productoId === productoId);
    if (!linea) return;
    if (linea.cantidad >= 999) return;
    this.actualizarCantidad(productoId, linea.cantidad + 1);
  }

  decrementar(productoId: number) {
    const linea = this.lineas().find(l => l.productoId === productoId);
    if (!linea) return;
    if (linea.cantidad <= 1) {
      this.quitarLinea(productoId);
    } else {
      this.actualizarCantidad(productoId, linea.cantidad - 1);
    }
  }

  quitarLinea(productoId: number) {
    this.lineas.update(ls => ls.filter(l => l.productoId !== productoId));
    this.persistir();
  }

  limpiarPedido() {
    this.lineas.set([]);
    this.cliente = '';
    this.notas = '';
    this.persistir();
  }

  // BV-05, BV-06 & BV-07: Guardar pedido en IndexedDB
  async guardarPedido() {
    if (this.saving()) return;

    // Validación: no permitir pedido vacío
    if (!this.lineas().length) {
      this.error.set('No se puede registrar un pedido vacío. Selecciona al menos un producto.');
      return;
    }

    // Validación BV-03: revisar que todas las cantidades sean válidas
    for (const l of this.lineas()) {
      if (!this.validarCantidad(l.cantidad)) {
        this.error.set(`Cantidad inválida en ${l.producto}. Debe ser un entero positivo.`);
        return;
      }
    }

    if (!this.cliente.trim()) {
      this.error.set('Por favor ingresa el nombre del cliente o bodega para el pedido.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const pedido: Pedido = {
      fecha: new Date().toISOString(),
      cliente: this.cliente.trim(),
      notas: this.notas.trim(),
      lineas: structuredClone(this.lineas()),
      total: this.total(),
      estado: 'PENDIENTE',
      origen: this.online() ? 'ONLINE' : 'OFFLINE'
    };

    try {
      // Guardar primero en IndexedDB
      const id = await this.storage.guardarPedido(pedido);

      // Limpiar borrador tras guardado exitoso
      this.lineas.set([]);
      this.cliente = '';
      this.notas = '';
      this.persistir();
      await this.refrescar();

      // BV-06: Mensaje transparente de persistencia local y estado PENDIENTE
      const modoDesc = pedido.origen === 'ONLINE' ? 'Conexión activa' : 'Sin conexión';
      this.aviso.set(
        `✓ Pedido #${id} guardado con éxito en este dispositivo (${modoDesc}). Estado: PENDIENTE (almacenado en IndexedDB; sin API remota).`
      );
    } catch (err: unknown) {
      // BV-07: Error de IndexedDB capturado. NUNCA confirmar éxito.
      const msg = err instanceof Error ? err.message : 'Error al escribir en la base de datos';
      this.error.set(`Error de IndexedDB: ${msg}. El pedido NO pudo ser guardado y la operación no fue confirmada.`);
    } finally {
      this.saving.set(false);
    }
  }

  async guardarMensaje() {
    if (this.saving()) return;
    if (!this.mensaje.trim()) {
      this.error.set('Escribe una nota o mensaje antes de guardar.');
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const mensajeObj: Mensaje = {
      texto: this.mensaje.trim(),
      fecha: new Date().toISOString(),
      estado: 'PENDIENTE',
      origen: this.online() ? 'ONLINE' : 'OFFLINE'
    };

    try {
      const id = await this.storage.guardarMensaje(mensajeObj);
      this.mensaje = '';
      this.persistir();
      await this.refrescar();
      this.aviso.set(`Mensaje #${id} guardado en el dispositivo (Estado: PENDIENTE).`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      this.error.set(`Error de IndexedDB al guardar mensaje: ${msg}.`);
    } finally {
      this.saving.set(false);
    }
  }

  async eliminar(tipo: 'pedidos' | 'mensajes', id: number) {
    const tipoNombre = tipo === 'pedidos' ? 'este pedido' : 'este mensaje';
    if (!confirm(`¿Eliminar ${tipoNombre} del almacenamiento local?`)) return;
    try {
      await this.storage.eliminar(tipo, id);
      await this.refrescar();
      this.aviso.set('Registro eliminado de IndexedDB.');
    } catch {
      this.error.set('No se pudo eliminar el registro de IndexedDB.');
    }
  }

  exportar() {
    const payload = {
      exportadoEn: new Date().toISOString(),
      dispositivo: 'Backus Ventas PWA - SENATI',
      totalPedidos: this.pedidos().length,
      pedidos: this.pedidos(),
      totalMensajes: this.mensajes().length,
      mensajes: this.mensajes()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backus-pedidos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async instalar() {
    const e = this.install();
    if (!e) return;
    await e.prompt();
    await e.userChoice;
    this.install.set(null);
  }
}
