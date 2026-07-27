import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';

export interface OrdenPendienteDTO {
  id: number;
  tecnico: string;
  fechaEstimadaEntrega: string;
  ventanaHoraria: string;
  estado: string;
}

export interface DevolucionTransitoDTO {
  id: number;
  idVenta: number;
  productoNombre: string;
  cantidadDevuelta: number;
  motivo: string;
  estadoLogistico: string;
}

@Component({
  selector: 'app-bodega-despachos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bodega-despachos.component.html',
  styleUrls: ['./bodega-despachos.component.css']
})
export class BodegaDespachosComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  activeTab = signal<'preparar' | 'devoluciones'>('preparar');
  ordenesPendientes = signal<OrdenPendienteDTO[]>([]);
  devolucionesEnTransito = signal<DevolucionTransitoDTO[]>([]);
  processingIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.cargarOrdenesPendientes();
    this.cargarDevoluciones();
  }

  setActiveTab(tab: 'preparar' | 'devoluciones') {
    this.activeTab.set(tab);
    if (tab === 'preparar') this.cargarOrdenesPendientes();
    if (tab === 'devoluciones') this.cargarDevoluciones();
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

  cargarOrdenesPendientes() {
    // Mock for now, replace with actual GET request
    this.ordenesPendientes.set([
      { id: 101, tecnico: 'Juan Pérez', fechaEstimadaEntrega: '2026-07-28', ventanaHoraria: '08:00 - 10:00', estado: 'PENDIENTE' },
      { id: 105, tecnico: 'María Gómez', fechaEstimadaEntrega: '2026-07-28', ventanaHoraria: '14:00 - 16:00', estado: 'PENDIENTE' }
    ]);
  }

  cargarDevoluciones() {
    // Mock for now, replace with actual GET request
    this.devolucionesEnTransito.set([
      { id: 1, idVenta: 102, productoNombre: 'Fertilizante Urea', cantidadDevuelta: 2, motivo: 'MALOGRADO', estadoLogistico: 'EN_TRANSITO' }
    ]);
  }

  prepararPaquete(idVenta: number) {
    this.setProcessing(idVenta, true);
    this.http.put(`${environment.apiUrl}/api/operaciones/despachos/${idVenta}/preparar`, {})
      .subscribe({
        next: () => {
          this.toast.success('Paquete Preparado', `La orden #${idVenta} está lista para despacho.`);
          this.ordenesPendientes.update(ords => ords.filter(o => o.id !== idVenta));
          this.setProcessing(idVenta, false);
        },
        error: (err) => {
          this.toast.error('Error', 'No se pudo preparar la orden.');
          this.setProcessing(idVenta, false);
        }
      });
  }

  recibirDevolucion(idDevolucion: number, estadoInventario: 'CUARENTENA' | 'DISPONIBLE') {
    this.http.put(`${environment.apiUrl}/api/operaciones/devoluciones-venta/${idDevolucion}/recibir-fisica?estadoInventario=${estadoInventario}`, {})
      .subscribe({
        next: () => {
          this.toast.success('Devolución Recibida', `El producto ha sido ingresado a ${estadoInventario}.`);
          this.devolucionesEnTransito.update(devs => devs.filter(d => d.id !== idDevolucion));
        },
        error: () => {
          this.toast.error('Error', 'No se pudo procesar la recepción física.');
        }
      });
  }
}
