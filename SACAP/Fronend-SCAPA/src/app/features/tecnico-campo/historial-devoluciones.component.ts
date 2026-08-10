import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-historial-devoluciones',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  styleUrls: ['./campo-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <span class="page-header__badge">Rol: Técnico-Comercial</span>
        <h1 class="page-header__title">Historial de Devoluciones</h1>
        <p class="page-header__subtitle">Sus devoluciones de venta reportadas desde el campo.</p>
      </div>

      <div class="table-card">
        <div class="table-card__header">
          <div></div>
          <button (click)="cargarDevoluciones()" class="btn btn--ghost" title="Recargar">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Venta Origen</th>
                <th>Producto & Cantidad</th>
                <th>Cliente</th>
                <th>Motivo</th>
                <th>Estado Logístico</th>
                <th>Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody>
              @for (dev of devoluciones(); track dev.id) {
                <tr>
                  <td>
                    <span class="data-table__id block">{{ dev.numeroComprobante || 'VTA-' + dev.idVenta }}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700;">{{ dev.nombreProducto }}</div>
                    <div style="font-size: 0.75rem;">Devuelto: {{ dev.cantidadDevuelta }}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.875rem;">{{ dev.nombreCliente }}</div>
                  </td>
                  <td>
                    <span style="color: var(--c-sage-text); font-size: 0.8rem;">{{ dev.motivo }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge--pendiente': dev.estadoLogistico === 'EN_TRANSITO',
                      'badge--recepcionada': dev.estadoLogistico === 'RECIBIDO_BODEGA'
                    }">{{ dev.estadoLogistico }}</span>
                  </td>
                  <td>
                    <span style="font-size: 0.875rem;">{{ dev.fechaSolicitud | date:'short' }}</span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6">
                    <div class="empty-state">
                      <lucide-icon name="corner-up-left" class="empty-state__icon"></lucide-icon>
                      <p class="empty-state__title">No ha reportado devoluciones.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class HistorialDevolucionesComponent implements OnInit {
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);
  
  devoluciones = signal<any[]>([]);

  ngOnInit(): void {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.operacionesService.listarMisDevolucionesCampo().subscribe({
      next: (data) => {
        this.devoluciones.set(data);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar sus devoluciones.');
      }
    });
  }
}
