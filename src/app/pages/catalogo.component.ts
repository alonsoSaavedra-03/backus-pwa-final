import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VentasService } from '../services/ventas.service';
import { Producto } from '../models';

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent {
  v = inject(VentasService);

  // BV-01: Búsqueda por nombre (case-insensitive)
  busqueda = signal('');

  // BV-02: Filtro por categoría combinable
  categoriaSeleccionada = signal('TODAS');

  // Cantidad seleccionada individual por producto antes de añadir al pedido
  cantidadesPorProducto = signal<Record<number, number>>({});

  // Categorías disponibles dinámicas
  categorias = computed(() => {
    const cats = new Set(this.v.productos().map(p => p.categoria));
    return ['TODAS', ...Array.from(cats)];
  });

  // BV-01 + BV-02: Filtro combinado de búsqueda y categoría
  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const cat = this.categoriaSeleccionada();

    return this.v.productos().filter(p => {
      const coincideNombre = !q || p.producto.toLowerCase().includes(q);
      const coincideCategoria = cat === 'TODAS' || p.categoria.toLowerCase() === cat.toLowerCase();
      return coincideNombre && coincideCategoria;
    });
  });

  // BV-02: Limpiar filtros
  limpiarFiltros() {
    this.busqueda.set('');
    this.categoriaSeleccionada.set('TODAS');
  }

  // Obtener cantidad actual en el selector de la tarjeta (por defecto 1)
  obtenerCantidadCard(id: number): number {
    return this.cantidadesPorProducto()[id] ?? 1;
  }

  // Modificar cantidad en la tarjeta del producto
  setCantidadCard(id: number, val: number) {
    if (val < 1) val = 1;
    if (val > 999) val = 999;
    this.cantidadesPorProducto.update(map => ({ ...map, [id]: Math.trunc(val) }));
  }

  // Añadir producto con la cantidad configurada
  agregarAlPedido(p: Producto) {
    const cant = this.obtenerCantidadCard(p.id);
    this.v.agregar(p, cant);
    // Reiniciar cantidad a 1 tras agregar
    this.setCantidadCard(p.id, 1);
  }

  // BV-03: Manejar cambio directo en input de cantidad en el carrito
  onInputCantidadCarrito(productoId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value;
    if (!this.v.validarCantidad(val)) {
      // Revertir input visual al valor válido actual
      const linea = this.v.lineas().find(l => l.productoId === productoId);
      if (linea) input.value = String(linea.cantidad);
      this.v.error.set('Cantidad inválida. Debe ser un número entero positivo mayor que cero.');
      return;
    }
    this.v.actualizarCantidad(productoId, Number(val));
  }
}
