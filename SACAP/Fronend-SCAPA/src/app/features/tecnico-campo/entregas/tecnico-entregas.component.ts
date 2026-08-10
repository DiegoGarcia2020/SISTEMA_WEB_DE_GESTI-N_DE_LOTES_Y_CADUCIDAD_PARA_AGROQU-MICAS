import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';
import { ComprobanteService } from '../../../core/services/comprobante.service';

import { VentasService } from '../../../core/services/ventas.service';
import { VentaDTO } from '../../../core/models/ventas.model';

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

  entregas = signal<VentaDTO[]>([]);
  processingIds = signal<Set<number>>(new Set());

  // Modal State
  modalAbierto = signal<boolean>(false);
  isProcessingModal = signal<boolean>(false);
  ventaSeleccionada = signal<number | null>(null);
  devolucionForm!: FormGroup;

  ngOnInit(): void {
    this.cargarEntregas();
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

  abrirModalDevolucion(idVenta: number) {
    this.ventaSeleccionada.set(idVenta);
    this.devolucionForm.reset({ cantidadDevuelta: 1 });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.ventaSeleccionada.set(null);
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
