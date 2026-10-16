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
  subtotal: number;
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

export interface Mensaje {
  id?: number;
  texto: string;
  fecha: string;
  estado: EstadoPedido;
  origen: 'ONLINE' | 'OFFLINE';
}

export interface Borrador {
  id: string;
  lineas: LineaPedido[];
  cliente: string;
  notas: string;
  mensaje: string;
}
