import { Injectable, signal, computed } from '@angular/core';
import { CarritoItem, ClienteDTO } from '../models/ventas.model';

/** Estado del carrito de Ventas en memoria — vive mientras el Técnico navega entre pantallas. */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  items = signal<CarritoItem[]>([]);
  clienteSeleccionado = signal<ClienteDTO | null>(null);

  subtotal = computed(() => this.items().reduce((s, i) => s + i.precioUnitario * i.cantidad, 0));
  descuentoTotal = computed(() => this.items().reduce((s, i) =>
    s + (i.precioUnitario * i.cantidad * (i.descuentoPct ?? 0) / 100), 0));
  total = computed(() => this.subtotal() - this.descuentoTotal());
  cantidadItems = computed(() => this.items().length);

  agregar(item: CarritoItem) {
    this.items.update(list => {
      const idx = list.findIndex(i => i.idProducto === item.idProducto);
      if (idx >= 0) {
        const copia = [...list];
        copia[idx] = { ...copia[idx], cantidad: Math.min(copia[idx].cantidad + item.cantidad, 999999) };
        return copia;
      }
      return [...list, item];
    });
  }

  actualizarCantidad(idProducto: number, cantidad: number) {
    this.items.update(list => list.map(i => i.idProducto === idProducto ? { ...i, cantidad } : i));
  }

  quitar(idProducto: number) {
    this.items.update(list => list.filter(i => i.idProducto !== idProducto));
  }

  asignarReceta(idProducto: number, idReceta: number) {
    this.items.update(list => list.map(i => i.idProducto === idProducto ? { ...i, idReceta } : i));
  }

  /** Productos con receta pendiente: exigen receta pero aún no se les asignó una. */
  itemsConRecetaPendiente = computed(() =>
    this.items().filter(i => i.requiereReceta && !i.idReceta));

  vaciar() {
    this.items.set([]);
    this.clienteSeleccionado.set(null);
  }
}
