import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';
import { ComprobanteService } from '../../../core/services/comprobante.service';

import { VentasService } from '../../../core/services/ventas.service';
import { VentaDTO } from '../../../core/models/ventas.model';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tecnico-entregas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tecnico-entregas.component.html',
  styleUrls: ['./tecnico-entregas.component.css']
})
export class TecnicoEntregasComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private comprobanteService = inject(ComprobanteService);
  private ventasService = inject(VentasService);
  private operacionesService = inject(OperacionesService);
  private authService = inject(AuthService);

  entregas = signal<VentaDTO[]>([]);
  pedidosPorEntregar = signal<any[]>([]);
  processingIds = signal<Set<number>>(new Set());
  processingPedidoIds = signal<Set<number>>(new Set());

  // Modal State
  modalAbierto = signal<boolean>(false);
  isProcessingModal = signal<boolean>(false);
  ventaSeleccionada = signal<number | null>(null);
  lineasVentaSeleccionada = signal<VentaDTO['lineas']>([]);
  devolucionForm!: FormGroup;

  ngOnInit(): void {
    this.cargarEntregas();
    this.cargarPedidosPorEntregar();
    this.inicializarFormulario();
  }

  private inicializarFormulario() {
    this.devolucionForm = this.fb.group({
      idProducto: [null, Validators.required],
      cantidadDevuelta: [1, [Validators.required, Validators.min(1)]],
      motivo: [null, Validators.required]
    });
  }

  cargarEntregas() {
    this.ventasService.misVentas().subscribe({
      next: (ventas) => {
        // Mostrar ventas que están listas para entregar, ya entregadas o devueltas
        const estadosValidos = ['CONFIRMADA', 'PREPARADA', 'ENTREGADA', 'DEVUELTA_PARCIALMENTE', 'DEVUELTA_TOTAL'];
        const filtradas = ventas.filter(v => estadosValidos.includes(v.estado));
        this.entregas.set(filtradas);
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar las entregas/ventas')
    });
  }

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  setProcessing(id: number, status: boolean) {
    const newSet = new Set(this.processingIds());
    if (status) newSet.add(id);
    else newSet.delete(id);
    this.processingIds.set(newSet);
  }

  confirmarEntrega(idVenta: number) {
    this.setProcessing(idVenta, true);
    this.http.put(`${environment.apiUrl}/operaciones/despachos/${idVenta}/entregar`, {})
      .subscribe({
        next: () => {
          this.toast.success('Entrega Confirmada', `El paquete #${idVenta} fue entregado exitosamente.`);
          this.entregas.update(ents => ents.map(e => e.idVenta === idVenta ? { ...e, estado: 'ENTREGADA' } : e));
          this.setProcessing(idVenta, false);
        },
        error: () => {
          this.toast.error('Error', 'No se pudo confirmar la entrega.');
          this.setProcessing(idVenta, false);
        }
      });
  }

  cargarPedidosPorEntregar() {
    const idTecnico = this.authService.currentUser()?.idUsuario;
    if (!idTecnico) return;
    this.operacionesService.listarPedidosPorTecnico(idTecnico).subscribe({
      next: (pedidos) => {
        // 2 = DESPACHADO (bodega ya lo sacó, falta que el técnico lo entregue en destino)
        this.pedidosPorEntregar.set((pedidos || []).filter(p => p.idEstadoPedido === 2));
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar los pedidos por entregar')
    });
  }

  isProcessingPedido(id: number): boolean {
    return this.processingPedidoIds().has(id);
  }

  entregarPedido(idUso: number) {
    const nuevo = new Set(this.processingPedidoIds());
    nuevo.add(idUso);
    this.processingPedidoIds.set(nuevo);

    this.operacionesService.entregarPedido(idUso).subscribe({
      next: () => {
        this.toast.success('Entrega Confirmada', `El pedido #${idUso} fue entregado exitosamente.`);
        this.pedidosPorEntregar.update(ps => ps.filter(p => p.idUso !== idUso));
        const set = new Set(this.processingPedidoIds());
        set.delete(idUso);
        this.processingPedidoIds.set(set);
      },
      error: () => {
        this.toast.error('Error', 'No se pudo confirmar la entrega del pedido.');
        const set = new Set(this.processingPedidoIds());
        set.delete(idUso);
        this.processingPedidoIds.set(set);
      }
    });
  }

  abrirModalDevolucion(idVenta: number) {
    const venta = this.entregas().find(e => e.idVenta === idVenta);
    this.ventaSeleccionada.set(idVenta);
    this.lineasVentaSeleccionada.set(venta?.lineas ?? []);
    this.devolucionForm.reset({ cantidadDevuelta: 1 });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.ventaSeleccionada.set(null);
    this.lineasVentaSeleccionada.set([]);
  }

  confirmarDevolucion() {
    if (this.devolucionForm.invalid || !this.ventaSeleccionada()) return;

    this.isProcessingModal.set(true);
    const idVenta = this.ventaSeleccionada();
    const payload = {
      idVenta: idVenta,
      ...this.devolucionForm.value
    };

    this.http.post(`${environment.apiUrl}/operaciones/devoluciones-venta/campo`, payload)
      .subscribe({
        next: () => {
          this.toast.success('Devolución Registrada', 'La novedad fue notificada a bodega exitosamente.');
          this.entregas.update(ents => ents.map(e => e.idVenta === idVenta ? { ...e, estado: 'DEVUELTA_PARCIALMENTE' } : e));
          this.isProcessingModal.set(false);
          this.cerrarModal();
        },
        error: () => {
          this.toast.error('Error', 'No se pudo registrar la devolución.');
          this.isProcessingModal.set(false);
        }
      });
  }

  imprimirComprobante(entrega: VentaDTO) {
    this.comprobanteService.generarComprobanteVenta(entrega, `comprobante_venta_${entrega.numeroOrden}.pdf`);
  }

  descargarNotaDevolucion(entrega: VentaDTO) {
    // Si la venta está devuelta parcial o total, generamos la nota con los datos de la venta y un texto genérico de devolución.
    // Idealmente, se llamaría a un endpoint para obtener la data real de la devolución.
    const notaMock: any = {
      idVenta: entrega.idVenta,
      numeroComprobante: entrega.numeroOrden,
      nombreCliente: entrega.nombreCliente,
      nombreTecnico: entrega.nombreTecnico,
      // Solo tomamos el primer producto para el mock de la nota, o mapeamos todo.
      nombreProducto: entrega.lineas.length > 0 ? entrega.lineas[0].nombreProducto : 'Varios',
      cantidadDevuelta: entrega.lineas.length > 0 ? entrega.lineas[0].cantidad : 1,
      estadoLogistico: 'EN_TRANSITO',
      estadoInventario: 'CUARENTENA'
    };
    this.comprobanteService.generarNotaDevolucion(notaMock);
  }
}
