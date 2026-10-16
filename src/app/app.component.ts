import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { VentasService } from './services/ventas.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html'
})
export class AppComponent {
  v = inject(VentasService);

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).ventasService = this.v;
      (window as any).storageService = this.v.storage;
    }
  }
}
