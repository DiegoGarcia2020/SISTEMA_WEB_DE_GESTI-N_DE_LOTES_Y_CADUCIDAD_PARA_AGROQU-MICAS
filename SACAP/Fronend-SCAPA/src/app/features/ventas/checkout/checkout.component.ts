import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../core/services/ventas.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { ClienteDTO } from '../../../core/models/ventas.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  private ventasService = inject(VentasService);
  private router = inject(Router);
  carrito = inject(CarritoService);

  // Búsqueda / creación de cliente
  textoBusqueda = signal('');
  resultadosCliente = signal<ClienteDTO[]>([]);
  buscando = signal(false);

  modalNuevoCliente = signal(false);
  formCliente = { nombre: '', cedulaRuc: '', telefono: '', ubicacionFinca: '' };
  guardandoCliente = signal(false);

  confirmando = signal(false);
  errorCheckout = signal('');

  buscarCliente() {
    const texto = this.textoBusqueda().trim();
    if (!texto) { this.resultadosCliente.set([]); return; }
    this.buscando.set(true);
    this.ventasService.buscarClientes(texto).subscribe({
      next: r => { this.resultadosCliente.set(r || []); this.buscando.set(false); },
      error: () => { this.resultadosCliente.set([]); this.buscando.set(false); }
    });
  }

  seleccionarCliente(c: ClienteDTO) {
    this.carrito.clienteSeleccionado.set(c);
    this.resultadosCliente.set([]);
    this.textoBusqueda.set('');
  }

  quitarCliente() {
    this.carrito.clienteSeleccionado.set(null);
  }

  abrirModalNuevoCliente() {
    this.formCliente = { nombre: this.textoBusqueda(), cedulaRuc: '', telefono: '', ubicacionFinca: '' };
    this.modalNuevoCliente.set(true);
  }

  cerrarModalNuevoCliente() {
    this.modalNuevoCliente.set(false);
  }

  guardarNuevoCliente() {
    if (!this.formCliente.nombre.trim()) return;
    this.guardandoCliente.set(true);
    this.ventasService.crearCliente({
      nombre: this.formCliente.nombre.trim(),
      cedulaRuc: this.formCliente.cedulaRuc || undefined,
      telefono: this.formCliente.telefono || undefined,
      ubicacionFinca: this.formCliente.ubicacionFinca || undefined
    }).subscribe({
      next: c => {
        this.guardandoCliente.set(false);
        this.carrito.clienteSeleccionado.set(c);
        this.modalNuevoCliente.set(false);
        this.resultadosCliente.set([]);
        this.textoBusqueda.set('');
      },
      error: () => { this.guardandoCliente.set(false); }
    });
  }

  actualizarCantidad(idLote: number, valor: string) {
    const cantidad = Math.max(1, parseInt(valor, 10) || 1);
    this.carrito.actualizarCantidad(idLote, cantidad);
  }

  quitarItem(idLote: number) {
    this.carrito.quitar(idLote);
  }

  irASugerencias() {
    this.router.navigate(['/admin/ventas/sugerencias']);
  }

  confirmarVenta() {
    const cliente = this.carrito.clienteSeleccionado();
    if (!cliente) { this.errorCheckout.set('Seleccione o cree un cliente antes de confirmar.'); return; }
    if (this.carrito.items().length === 0) { this.errorCheckout.set('El carrito está vacío.'); return; }

    this.errorCheckout.set('');
    this.confirmando.set(true);

    const payload = {
      idCliente: cliente.idCliente,
      lineas: this.carrito.items().map(i => ({
        idLote: i.idLote,
        cantidad: i.cantidad,
        esComboIA: i.esComboIA,
        idPromocion: i.idPromocion ?? null,
        descuentoPct: i.descuentoPct ?? null
      }))
    };

    this.ventasService.crearVenta(payload).subscribe({
      next: venta => {
        this.confirmando.set(false);
        this.carrito.vaciar();
        this.router.navigate(['/admin/ventas/confirmacion', venta.idVenta]);
      },
      error: e => {
        this.confirmando.set(false);
        this.errorCheckout.set(e?.error?.message || 'Error al confirmar la venta. Verifique el stock disponible.');
      }
    });
  }
}
