import { Injectable } from '@angular/core';
import { Borrador, Mensaje, Pedido } from '../models';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db?: Promise<IDBDatabase>;

  private open(): Promise<IDBDatabase> {
    return (this.db ??= new Promise((resolve, reject) => {
      const request = indexedDB.open('backusVentasDB', 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('pedidos')) {
          db.createObjectStore('pedidos', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('mensajes')) {
          db.createObjectStore('mensajes', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('borradores')) {
          db.createObjectStore('borradores', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          this.db = undefined;
        };
        resolve(db);
      };

      request.onerror = () => {
        this.db = undefined;
        reject(request.error || new Error('Error al abrir la base de datos IndexedDB.'));
      };

      request.onblocked = () => {
        this.db = undefined;
        reject(new Error('Cierra las otras pestañas para acceder a IndexedDB.'));
      };
    }));
  }

  private async run<T>(
    name: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(name, mode);
        const request = action(tx.objectStore(name));

        tx.oncomplete = () => resolve(request.result);
        tx.onerror = () => reject(tx.error ?? request.error ?? new Error(`Fallo en transacción ${name}`));
        tx.onabort = () => reject(tx.error ?? new Error(`Transacción abortada en ${name}`));
      } catch (err) {
        reject(err);
      }
    });
  }

  pedidos(): Promise<Pedido[]> {
    return this.run<Pedido[]>('pedidos', 'readonly', s => s.getAll());
  }

  pedidoPorId(id: number): Promise<Pedido | undefined> {
    return this.run<Pedido | undefined>('pedidos', 'readonly', s => s.get(id));
  }

  mensajes(): Promise<Mensaje[]> {
    return this.run<Mensaje[]>('mensajes', 'readonly', s => s.getAll());
  }

  guardarPedido(p: Pedido): Promise<number> {
    return this.run<number>('pedidos', 'readwrite', s => s.add(p) as unknown as IDBRequest<number>);
  }

  guardarMensaje(m: Mensaje): Promise<number> {
    return this.run<number>('mensajes', 'readwrite', s => s.add(m) as unknown as IDBRequest<number>);
  }

  eliminar(store: 'pedidos' | 'mensajes', id: number): Promise<undefined> {
    return this.run<undefined>(store, 'readwrite', s => s.delete(id));
  }

  guardarBorrador(b: Borrador): Promise<string> {
    return this.run<string>('borradores', 'readwrite', s => s.put(b) as unknown as IDBRequest<string>);
  }

  borrador(): Promise<Borrador | undefined> {
    return this.run<Borrador | undefined>('borradores', 'readonly', s => s.get('actual'));
  }
}
