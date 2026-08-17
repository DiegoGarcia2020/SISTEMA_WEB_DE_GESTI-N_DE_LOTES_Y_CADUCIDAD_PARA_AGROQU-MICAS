import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../core/services/ventas.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteDTO } from '../../../core/models/ventas.model';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MotorSugerenciasComponent } from '../motor-sugerencias/motor-sugerencias.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MotorSugerenciasComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private ventasService = inject(VentasService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  carrito = inject(CarritoService);

  // Catálogo general
  textoBusquedaProducto = signal('');
  lotesDisponibles = signal<any[]>([]);
  buscandoProductos = signal(false);
  mostrarSugerenciasIA = signal(false);

  ngOnInit() {
    this.buscarProductos();
  }

  buscarProductos() {
    this.buscandoProductos.set(true);
    this.ventasService.getLotesDisponibles(this.textoBusquedaProducto()).subscribe({
      next: (lotes) => {
        this.lotesDisponibles.set(lotes || []);
        this.buscandoProductos.set(false);
      },
      error: () => {
        this.lotesDisponibles.set([]);
        this.buscandoProductos.set(false);
      }
    });
  }

  agregarLoteAlCarrito(lote: any) {
    this.carrito.agregar({
      idLote: lote.idLote,
      numeroLote: lote.numeroLote,
      nombreProducto: lote.nombreProducto,
      cantidad: 1,
      precioUnitario: lote.precio || 0,
      esComboIA: false,
      descuentoPct: 0
    });
    this.toast.success('Agregado', `${lote.nombreProducto} agregado al carrito`);
  }

  toggleSugerenciasIA() {
    this.mostrarSugerenciasIA.update(v => !v);
  }

  // Búsqueda / creación de cliente
  textoBusqueda = signal('');
  resultadosCliente = signal<ClienteDTO[]>([]);
  buscando = signal(false);

  modalNuevoCliente = signal(false);
  formCliente = { nombreFinca: '', cedula: '', telefono: '', direccion: '' };
  guardandoCliente = signal(false);
  errorNuevoCliente = signal('');

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
    this.formCliente = { nombreFinca: this.textoBusqueda(), cedula: '', telefono: '', direccion: '' };
    this.errorNuevoCliente.set('');
    this.modalNuevoCliente.set(true);
  }

  cerrarModalNuevoCliente() {
    this.modalNuevoCliente.set(false);
  }

  guardarNuevoCliente() {
    const idTecnico = this.auth.currentUser()?.idUsuario;
    if (!this.formCliente.nombreFinca.trim() || !this.formCliente.cedula.trim() || !idTecnico) {
      this.errorNuevoCliente.set('Nombre de la finca y cédula son obligatorios.');
      return;
    }
    this.errorNuevoCliente.set('');
    this.guardandoCliente.set(true);
    this.ventasService.crearCliente({
      nombreFinca: this.formCliente.nombreFinca.trim(),
      cedula: this.formCliente.cedula.trim(),
      telefono: this.formCliente.telefono || undefined,
      direccion: this.formCliente.direccion || undefined,
      idTecnico
    }).subscribe({
      next: c => {
        this.guardandoCliente.set(false);
        this.carrito.clienteSeleccionado.set(c);
        this.modalNuevoCliente.set(false);
        this.resultadosCliente.set([]);
        this.textoBusqueda.set('');
      },
      error: e => {
        this.guardandoCliente.set(false);
        this.errorNuevoCliente.set(e?.error?.message || 'Error al crear el cliente.');
      }
    });
  }

  actualizarCantidad(idLote: number, valor: string) {
    const cantidad = Math.max(1, parseInt(valor, 10) || 1);
    this.carrito.actualizarCantidad(idLote, cantidad);
  }

  quitarItem(idLote: number) {
    this.carrito.quitar(idLote);
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
        this.toast.success('Venta Confirmada', `La venta #${venta.numeroOrden || venta.idVenta} se registró exitosamente.`);
        this.router.navigate(['/campo/dashboard']);
      },
      error: e => {
        this.confirmando.set(false);
        this.errorCheckout.set(e?.error?.message || 'Error al confirmar la venta. Verifique el stock disponible.');
      }
    });
  }
}
