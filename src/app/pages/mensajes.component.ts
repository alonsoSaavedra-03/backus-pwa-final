import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../services/ventas.service';

@Component({
  selector: 'app-mensajes',
  imports: [DatePipe, FormsModule],
  template: `
    <div class="page-title">
      <span class="eyebrow blue">ANOTACIONES DEL VENDEDOR</span>
      <h1>Mensajes y Visitas</h1>
      <p>Conserva información y notas de tus visitas comerciales, con o sin señal.</p>
    </div>

    <div class="message-layout">
      <section class="record">
        <h2>Nueva anotación</h2>
        <form (ngSubmit)="v.guardarMensaje()">
          <label class="field">
            Mensaje o nota de visita
            <textarea
              name="mensaje"
              required
              maxlength="2000"
              rows="6"
              placeholder="Escribe observaciones de clientes, requerimientos o acuerdos de la visita..."
              [(ngModel)]="v.mensaje"
              (ngModelChange)="v.persistir()"
            ></textarea>
          </label>
          <p class="muted">{{v.mensaje.length}} / 2000 caracteres</p>
          <button class="primary full" type="submit" [disabled]="!v.mensaje.trim() || v.saving()">
            {{v.saving() ? 'Guardando en IndexedDB…' : 'Guardar anotación'}}
          </button>
          <p class="privacy">Almacenado localmente en IndexedDB. Pendiente de sincronización.</p>
        </form>
      </section>

      <section>
        <div class="section-head">
          <h2>Anotaciones guardadas</h2>
          <span class="count">{{v.mensajes().length}}</span>
        </div>

        @if(!v.mensajes().length) {
          <div class="empty">
            <h3>Sin anotaciones</h3>
            <p>Tus notas de visitas aparecerán aquí al guardarlas.</p>
          </div>
        }

        @for(m of v.mensajes(); track m.id) {
          <article class="record message">
            <div class="section-head">
              <span class="muted">{{m.fecha | date:'dd/MM/yyyy · HH:mm:ss'}}</span>
              <div class="badges-row">
                <span
                  class="badge-origen"
                  [class.badge-offline]="m.origen === 'OFFLINE'"
                  [class.badge-online]="m.origen === 'ONLINE'"
                >
                  {{m.origen}}
                </span>
                <span class="pending">{{m.estado}}</span>
              </div>
            </div>
            <p class="message-text">{{m.texto}}</p>
            <div class="section-head">
              <small class="muted">
                {{m.origen === 'OFFLINE' ? 'Guardado sin conexión' : 'Guardado conectado'}}
              </small>
              <button type="button" class="delete" (click)="v.eliminar('mensajes', m.id!)">
                Eliminar
              </button>
            </div>
          </article>
        }
      </section>
    </div>
  `
})
export class MensajesComponent {
  v = inject(VentasService);
}
