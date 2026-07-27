import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';

export interface EntregaDTO {
  id: number;
  cliente: string;
  fechaEstimadaEntrega: string;
  total: number;
  estado: string;
}

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

  entregas = signal<EntregaDTO[]>([]);
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
    // Mock for now, replace with GET request
    this.entregas.set([
      { id: 101, cliente: 'Finca La Esperanza', fechaEstimadaEntrega: '2026-07-28', total: 150.50, estado: 'PREPARADA' },
      { id: 102, cliente: 'Hacienda San José', fechaEstimadaEntrega: '2026-07-28', total: 45.00, estado: 'ENTREGADA' },
      { id: 103, cliente: 'Agroganadera del Sur', fechaEstimadaEntrega: '2026-07-27', total: 230.00, estado: 'DEVUELTA_PARCIALMENTE' }
    ]);
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
    this.http.put(`${environment.apiUrl}/api/operaciones/despachos/${idVenta}/entregar`, {})
      .subscribe({
        next: () => {
          this.toast.success('Entrega Confirmada', `El paquete #${idVenta} fue entregado exitosamente.`);
          this.entregas.update(ents => ents.map(e => e.id === idVenta ? { ...e, estado: 'ENTREGADA' } : e));
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

    this.http.post(`${environment.apiUrl}/api/operaciones/devoluciones-venta/campo`, payload)
      .subscribe({
        next: () => {
          this.toast.success('Devolución Registrada', 'La novedad fue notificada a bodega exitosamente.');
          this.entregas.update(ents => ents.map(e => e.id === idVenta ? { ...e, estado: 'DEVUELTA_PARCIALMENTE' } : e));
          this.isProcessingModal.set(false);
          this.cerrarModal();
        },
        error: () => {
          this.toast.error('Error', 'No se pudo registrar la devolución.');
          this.isProcessingModal.set(false);
        }
      });
  }
}
