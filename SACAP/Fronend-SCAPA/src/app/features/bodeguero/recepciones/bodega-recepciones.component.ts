import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';

export interface OrdenCompraListDTO {
  id: number;
  nombreProveedor: string;
  numeroFactura: string;
  fechaEmision: string;
  ventanaHoraria: string;
  detalles: any[];
}

@Component({
  selector: 'app-bodega-recepciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './bodega-recepciones.component.html',
  styleUrls: ['./bodega-recepciones.component.css']
})
export class BodegaRecepcionesComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);

  ordenesHoy = signal<OrdenCompraListDTO[]>([]);
  isLoading = signal<boolean>(false);
  processingIds = signal<Set<number>>(new Set());
  
  // Modal State
  modalAbierto = signal<boolean>(false);
  ordenSeleccionada = signal<number | null>(null);
  isProcessingModal = signal<boolean>(false);
  motivoCtrl = new FormControl('');

  ngOnInit() {
    this.cargarRecepcionesHoy();
  }

  cargarRecepcionesHoy() {
    this.isLoading.set(true);
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    // Filtrar estado=PENDIENTE y desde=HOY, hasta=HOY
    this.http.get<OrdenCompraListDTO[]>(`${environment.apiUrl}/ordenes-compra/recepciones-esperadas?estado=PENDIENTE&desde=${hoy}&hasta=${hoy}`)
      .subscribe({
        next: (data) => {
          this.ordenesHoy.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toast.error('Error', 'No se pudieron cargar las recepciones de hoy');
          this.isLoading.set(false);
        }
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

  /** Registra la llegada a tiempo y pasa directo al conteo/recepción — son un solo paso, no dos acciones sueltas. */
  registrarLlegada(idOrden: number) {
    this.setProcessing(idOrden, true);
    this.http.put(`${environment.apiUrl}/ordenes-compra/${idOrden}/llegada-tiempo`, {})
      .subscribe({
        next: (res: any) => {
          this.toast.success('Llegada Registrada', res.mensaje || 'Ahora registre lo que llegó.');
          this.setProcessing(idOrden, false);
          this.irARecepcion(idOrden);
        },
        error: (err) => {
          this.toast.error('Error', 'No se pudo registrar la llegada');
          this.setProcessing(idOrden, false);
        }
      });
  }

  irARecepcion(idOrden: number) {
    this.router.navigate(['/bodega/recepcion', idOrden]);
  }

  abrirModalRetraso(idOrden: number) {
    this.ordenSeleccionada.set(idOrden);
    this.motivoCtrl.reset();
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.ordenSeleccionada.set(null);
  }

  confirmarRetraso() {
    const id = this.ordenSeleccionada();
    if (!id || !this.motivoCtrl.value) return;

    this.isProcessingModal.set(true);
    const payload = { motivo: this.motivoCtrl.value };

    this.http.put(`${environment.apiUrl}/ordenes-compra/${id}/reportar-retraso`, payload)
      .subscribe({
        next: (res: any) => {
          this.toast.success('Retraso Reportado', res.mensaje);
          this.ordenesHoy.update(ordenes => ordenes.filter(o => o.id !== id));
          this.isProcessingModal.set(false);
          this.cerrarModal();
        },
        error: (err) => {
          this.toast.error('Error', 'No se pudo reportar el retraso');
          this.isProcessingModal.set(false);
        }
      });
  }
}
