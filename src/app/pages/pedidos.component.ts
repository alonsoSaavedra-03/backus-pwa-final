import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VentasService } from '../services/ventas.service';
import { Pedido } from '../models';

@Component({
  selector: 'app-pedidos',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="section-head page-title">
      <div>
        <span class="eyebrow blue">REGISTRO LOCAL EN INDEXEDDB</span>
        <h1>Historial de pedidos</h1>
        <p>Consulta los pedidos conservados en este dispositivo con estado y detalle completo.</p>
      </div>
      <div class="header-actions">
        <button
          type="button"
          class="secondary"
          (click)="v.exportar()"
          [disabled]="!v.pedidos().length"
        >
          ↓ Exportar pedidos (.json)
        </button>
      </div>
    </div>

    <!-- BV-06: AVISO TRANSPARENTE SOBRE SINCRONIZACIÓN -->
    <div class="info-banner">
      <strong>Aviso de conectividad:</strong> Todos los pedidos se almacenan localmente en <code>IndexedDB (backusVentasDB)</code>. Al no existir una API remota conectada, los pedidos se conservan con estado <strong>PENDIENTE</strong> en este dispositivo (sin sincronización simulada).
    </div>

    @if(!v.pedidos().length) {
      <div class="empty big">
        <h2>No hay pedidos registrados en este dispositivo</h2>
        <p>Ve al catálogo para seleccionar productos y guardar tu primer pedido.</p>
        <a class="primary" routerLink="/">Ir al catálogo de productos</a>
      </div>
    } @else {
      <div class="record-grid">
        @for(p of v.pedidos(); track p.id) {
          <article class="record order-card">
            <div class="section-head">
              <div>
                <span class="eyebrow blue">PEDIDO #{{p.id}}</span>
                <h2>{{p.cliente || 'Cliente no especificado'}}</h2>
              </div>
              <div class="badges-row">
                <!-- Origen ONLINE / OFFLINE -->
                <span
                  class="badge-origen"
                  [class.badge-offline]="p.origen === 'OFFLINE'"
                  [class.badge-online]="p.origen === 'ONLINE'"
                >
                  {{p.origen}}
                </span>
                <!-- Estado PENDIENTE -->
                <span class="pending" [title]="'Estado: ' + p.estado + ' (Pendiente de envío a servidor)'">
                  {{p.estado}}
                </span>
              </div>
            </div>

            <p class="muted">
              📅 {{p.fecha | date:'dd/MM/yyyy · HH:mm:ss'}} ·
              <span>{{p.origen === 'OFFLINE' ? 'Guardado sin conexión' : 'Guardado con conexión'}}</span>
            </p>

            <!-- RESUMEN DE LÍNEAS DEL PEDIDO (BV-04) -->
            <div class="order-lines-preview">
              @for(l of p.lineas; track l.productoId) {
                <div class="record-line">
                  <span class="line-name">
                    {{l.producto}}
                    <small class="line-calc">({{l.precioUnitario | currency:'PEN':'S/ ':'1.2-2'}} × {{l.cantidad}})</small>
                  </span>
                  <strong class="line-subtotal">{{l.subtotal | currency:'PEN':'S/ ':'1.2-2'}}</strong>
                </div>
              }
            </div>

            @if(p.notas) {
              <div class="note-box">
                <span class="note-label">Nota / Instrucciones:</span>
                <p class="note-text">{{p.notas}}</p>
              </div>
            }

            <!-- BV-04: TOTAL DEL PEDIDO -->
            <div class="total">
              <div>
                <span>Total del pedido</span>
                <small class="total-units">
                  {{obtenerTotalUnidades(p)}} uds.
                </small>
              </div>
              <strong>{{p.total | currency:'PEN':'S/ ':'1.2-2'}}</strong>
            </div>

            <div class="order-card-actions">
              <button type="button" class="btn-detail" (click)="abrirDetalle(p)">
                🔍 Ver detalle completo
              </button>
              <button type="button" class="delete" (click)="v.eliminar('pedidos', p.id!)">
                Eliminar pedido
              </button>
            </div>
          </article>
        }
      </div>
    }

    <!-- MODAL DETALLE DE PEDIDO -->
    @if(pedidoSeleccionado()) {
      <div class="modal-backdrop" (click)="cerrarDetalle()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="eyebrow blue">DETALLE DE PEDIDO #{{pedidoSeleccionado()!.id}}</span>
              <h2>{{pedidoSeleccionado()!.cliente}}</h2>
            </div>
            <button type="button" class="modal-close" (click)="cerrarDetalle()">×</button>
          </div>

          <div class="modal-body">
            <div class="modal-meta-grid">
              <div>
                <label>Fecha de registro</label>
                <strong>{{pedidoSeleccionado()!.fecha | date:'dd/MM/yyyy HH:mm:ss'}}</strong>
              </div>
              <div>
                <label>Origen</label>
                <span
                  class="badge-origen"
                  [class.badge-offline]="pedidoSeleccionado()!.origen === 'OFFLINE'"
                  [class.badge-online]="pedidoSeleccionado()!.origen === 'ONLINE'"
                >
                  {{pedidoSeleccionado()!.origen}}
                </span>
              </div>
              <div>
                <label>Estado</label>
                <span class="pending">{{pedidoSeleccionado()!.estado}}</span>
              </div>
              <div>
                <label>Almacenamiento</label>
                <strong>IndexedDB (Local)</strong>
              </div>
            </div>

            <h3>Desglose de productos</h3>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-right">Precio Unitario</th>
                  <th class="text-center">Cantidad</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for(l of pedidoSeleccionado()!.lineas; track l.productoId) {
                  <tr>
                    <td><strong>{{l.producto}}</strong></td>
                    <td class="text-right">{{l.precioUnitario | currency:'PEN':'S/ ':'1.2-2'}}</td>
                    <td class="text-center">{{l.cantidad}}</td>
                    <td class="text-right font-bold">{{l.subtotal | currency:'PEN':'S/ ':'1.2-2'}}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2"><strong>Total acumulado</strong></td>
                  <td class="text-center"><strong>{{obtenerTotalUnidades(pedidoSeleccionado()!)}} uds.</strong></td>
                  <td class="text-right total-cell">
                    <strong>{{pedidoSeleccionado()!.total | currency:'PEN':'S/ ':'1.2-2'}}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            @if(pedidoSeleccionado()!.notas) {
              <div class="modal-notes">
                <label>Instrucciones registradas:</label>
                <p>{{pedidoSeleccionado()!.notas}}</p>
              </div>
            }

            <div class="modal-sync-info">
              <p>
                <strong>Estado PENDIENTE:</strong> Este pedido permanece resguardado en la base de datos local
                del navegador y está preparado para ser enviado cuando se configure una API remota de sincronización.
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="secondary" (click)="cerrarDetalle()">Cerrar</button>
            <button
              type="button"
              class="delete"
              (click)="v.eliminar('pedidos', pedidoSeleccionado()!.id!); cerrarDetalle()"
            >
              Eliminar de IndexedDB
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class PedidosComponent {
  v = inject(VentasService);
  pedidoSeleccionado = signal<Pedido | null>(null);

  abrirDetalle(p: Pedido) {
    this.pedidoSeleccionado.set(p);
  }

  cerrarDetalle() {
    this.pedidoSeleccionado.set(null);
  }

  obtenerTotalUnidades(p: Pedido): number {
    return p.lineas.reduce((acc, l) => acc + l.cantidad, 0);
  }
}
