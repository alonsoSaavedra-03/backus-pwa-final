import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { Producto } from '../models';
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);
  obtenerCatalogo() { return this.http.get<Producto[]>('data/catalogo.json').pipe(timeout(10000)); }
}
