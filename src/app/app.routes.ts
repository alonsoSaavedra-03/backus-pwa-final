import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo.component';
import { PedidosComponent } from './pages/pedidos.component';
import { MensajesComponent } from './pages/mensajes.component';
export const routes: Routes = [{path:'',component:CatalogoComponent},{path:'pedidos',component:PedidosComponent},{path:'mensajes',component:MensajesComponent},{path:'**',redirectTo:''}];
