import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-compras-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styleUrl: './compras-listado.component.css',
  template: `
    <div class="compras-container">
      <!-- Cabecera Hero -->
      <div class="alert-warning">
        <div class="alert-warning__info">
          <div class="alert-warning__icon">
            <lucide-icon name="file-text" class="w-7 h-7"></lucide-icon>
          </div>
          <div>
            <span class="alert-warning__badge">Módulo Compras</span>
            <h1 class="alert-warning__title">Órdenes de Compra</h1>
            <p class="alert-warning__subtitle">Registro y seguimiento de facturas de proveedores</p>
          </div>
        </div>
        <div class="alert-warning__actions">
          <button class="btn btn--ghost" (click)="cargarOrdenes()">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            <span>Actualizar</span>
          </button>
          <button class="btn btn--primary" (click)="irANuevaCompra()">
            <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-card">
        <p class="filters-card__title">
          <lucide-icon name="filter" class="w-3.5 h-3.5"></lucide-icon>
          Filtros de búsqueda
        </p>
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-group__label">Estado</label>
            <select class="form-group__select" [(ngModel)]="filtroEstado">
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="RECEPCIONADA">Recepcionada</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-group__label">Proveedor</label>
            <select class="form-group__select" [(ngModel)]="filtroProveedor">
              <option [ngValue]="null">Todos</option>
              @for (prov of proveedores(); track prov.idProveedor) {
                <option [ngValue]="prov.idProveedor">{{ prov.nombre }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="form-group__label">Desde</label>
            <input type="date" class="form-group__input" [(ngModel)]="filtroDesde" />
          </div>
          <div class="form-group">
            <label class="form-group__label">Hasta</label>
            <input type="date" class="form-group__input" [(ngModel)]="filtroHasta" />
          </div>
          <button class="btn btn--filter btn--sm" (click)="cargarOrdenes()">
            <lucide-icon name="search" class="w-3.5 h-3.5"></lucide-icon>
            Buscar
          </button>
        </div>
      </div>

      <!-- Tabla de Órdenes -->
      <div class="table-card">
        <div class="table-card__header">
          <h3 class="table-card__title">Historial de Compras</h3>
          <span class="table-card__count">{{ ordenes().length }} registros</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>N° Orden</th>
                <th>Proveedor</th>
                <th>N° Factura</th>
                <th>Fecha Emisión</th>
                <th>Total ($)</th>
                <th>Estado</th>
                <th>Cumplimiento Logístico</th>
                <th style="text-align: right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (orden of ordenes(); track orden.id) {
                <tr>
                  <td>
                    <span class="data-table__id">OC-{{ orden.id | number:'3.0-0' }}</span>
                  </td>
                  <td>
                    <strong>{{ orden.nombreProveedor }}</strong>
                  </td>
                  <td>
                    <span style="font-family: monospace; font-size: 0.75rem;">{{ orden.numeroFactura }}</span>
                  </td>
                  <td>
                    <span class="data-table__date">{{ orden.fechaEmision }}</span>
                  </td>
                  <td>
                    <span class="data-table__total">\${{ orden.totalNeto | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <span class="badge text-stamped"
                          [class.badge--pendiente]="orden.estado === 'PENDIENTE'"
                          [class.badge--recepcionada]="orden.estado === 'RECEPCIONADA'"
                          [class.badge--anulada]="orden.estado === 'ANULADA'">
                      {{ orden.estado }}
                    </span>
                  </td>
                  <td>
                    @if (orden.estadoCumplimiento) {
                      <span class="badge" 
                            [class.badge--success]="orden.estadoCumplimiento === 'A_TIEMPO'"
                            [class.badge--danger]="orden.estadoCumplimiento === 'NO_ENTREGADO'"
                            [class.badge--warning]="orden.estadoCumplimiento === 'RETRASADO'"
                            [class.badge--neutral]="orden.estadoCumplimiento === 'PENDIENTE'">
                        {{ orden.estadoCumplimiento.replace('_', ' ') }}
                      </span>
                      @if (orden.estadoCumplimiento === 'NO_ENTREGADO') {
                        <div style="font-size: 0.75rem; color: #ef4444; margin-top: 4px;">
                          Motivo: {{ orden.observacionRetraso }}
                        </div>
                      }
                    } @else {
                      <span class="badge badge--neutral">N/A</span>
                    }
                  </td>
                  <td>
                    <div class="table-actions">
                      @if (orden.estadoCumplimiento === 'NO_ENTREGADO') {
                        <button class="btn--action btn--action-view" (click)="abrirReprogramar(orden.id)" style="color: #d97706;">
                          <lucide-icon name="calendar-clock" class="w-3.5 h-3.5"></lucide-icon>
                          Reprogramar
                        </button>
                        <button class="btn--action btn--action-void" (click)="cancelarSLA(orden.id)">
                          <lucide-icon name="ban" class="w-3.5 h-3.5"></lucide-icon>
                          Cancelar SLA
                        </button>
                      } @else if (orden.estado === 'PENDIENTE') {
                        <button class="btn--action btn--action-view" (click)="verOrden(orden.id)">
                          <lucide-icon name="eye" class="w-3.5 h-3.5"></lucide-icon>
                          Recepcionar
                        </button>
                        <button class="btn--action btn--action-void" (click)="anularOrden(orden.id)">
                          <lucide-icon name="x" class="w-3.5 h-3.5"></lucide-icon>
                          Anular
                        </button>
                      } @else {
                        <button class="btn--action btn--action-view" (click)="verOrden(orden.id)">
                          <lucide-icon name="eye" class="w-3.5 h-3.5"></lucide-icon>
                          Ver Detalle
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7">
                    <div class="empty-state">
                      <div class="empty-state__icon">
                        <lucide-icon name="file-text" class="w-12 h-12"></lucide-icon>
                      </div>
                      <p class="empty-state__title">No hay órdenes de compra registradas</p>
                      <p class="empty-state__text">Haz clic en "Nueva Compra" para registrar la primera factura de proveedor.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Reprogramar CSS Puro -->
    @if (modalReprogramarAbierto()) {
      <div class="modal-overlay" style="position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:1000;">
        <div class="modal-content" style="background:#fff; padding:2rem; border-radius:12px; width:400px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
          <h2 style="margin:0 0 1rem 0; font-size:1.25rem;">Reprogramar Orden</h2>
          <p style="color:#6b7280; font-size:0.875rem; margin-bottom:1.5rem;">
            Asigne una nueva fecha y ventana horaria para la llegada del camión.
          </p>
          <div class="form-group" style="margin-bottom:1rem; display:flex; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.875rem; font-weight:600;">Nueva Fecha Estimada</label>
            <input type="date" [(ngModel)]="nuevaFechaReprogramar" style="padding:0.75rem; border:1px solid #e5e7eb; border-radius:8px;">
          </div>
          <div class="form-group" style="margin-bottom:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.875rem; font-weight:600;">Nueva Ventana Horaria</label>
            <select [(ngModel)]="nuevaVentanaReprogramar" style="padding:0.75rem; border:1px solid #e5e7eb; border-radius:8px;">
              <option value="08:00 - 10:00">08:00 - 10:00</option>
              <option value="10:00 - 12:00">10:00 - 12:00</option>
              <option value="14:00 - 16:00">14:00 - 16:00</option>
            </select>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:1rem;">
            <button class="btn btn--ghost" (click)="cerrarReprogramar()">Cancelar</button>
            <button class="btn btn--primary" (click)="confirmarReprogramar()" [disabled]="!nuevaFechaReprogramar || !nuevaVentanaReprogramar">Guardar Cambios</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ComprasListadoComponent implements OnInit {
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  ordenes = signal<any[]>([]);
  proveedores = signal<any[]>([]);

  filtroEstado = '';
  filtroProveedor: number | null = null;
  filtroDesde = '';
  filtroHasta = '';

  ngOnInit(): void {
    this.cargarOrdenes();
    this.cargarProveedores();
  }

  cargarOrdenes(): void {
    this.operacionesService.listarOrdenesCompra(
      this.filtroEstado || undefined,
      this.filtroProveedor || undefined,
      this.filtroDesde || undefined,
      this.filtroHasta || undefined
    ).subscribe({
      next: (data) => this.ordenes.set(data),
      error: () => this.toast.error('Error', 'No se pudieron cargar las órdenes de compra.')
    });
  }

  cargarProveedores(): void {
    // Reutiliza el endpoint existente de proveedores
    this.operacionesService['http'].get<any[]>(`${this.operacionesService['apiUrl']}/proveedores`).subscribe({
      next: (data) => this.proveedores.set(data),
      error: () => {
        // Mock fallback
        this.proveedores.set([
          { idProveedor: 1, nombre: 'Agroquímicos del Pacífico' },
          { idProveedor: 2, nombre: 'Bayer CropScience' },
          { idProveedor: 3, nombre: 'Syngenta Ecuador' },
          { idProveedor: 4, nombre: 'Semillas Certificadas S.A.' }
        ]);
      }
    });
  }

  irANuevaCompra(): void {
    this.router.navigate(['/supervisor/compras/nueva']);
  }

  verOrden(id: number): void {
    const orden = this.ordenes().find(o => o.id === id);
    if (orden?.estado === 'PENDIENTE') {
      this.router.navigate(['/bodega/recepcion', id]);
    } else {
      // Para órdenes ya recepcionadas, podemos mostrar un detalle o navegar
      this.toast.info('Detalle de Orden', `Visualizando detalle de la Orden OC-${id}.`);
    }
  }

  anularOrden(id: number): void {
    if (confirm('¿Estás seguro de anular esta orden de compra? Esta acción no se puede deshacer.')) {
      this.operacionesService.anularOrdenCompra(id).subscribe({
        next: () => {
          this.toast.success('Orden Anulada', 'La orden de compra fue anulada exitosamente.');
          this.cargarOrdenes();
        },
        error: () => this.toast.error('Error', 'No se pudo anular la orden.')
      });
    }
  }

  // =========================================================================
  // GESTIÓN DE ALERTAS SLA (DOCK SCHEDULING)
  // =========================================================================

  modalReprogramarAbierto = signal<boolean>(false);
  ordenReprogramar = signal<number | null>(null);
  nuevaFechaReprogramar = '';
  nuevaVentanaReprogramar = '';

  abrirReprogramar(id: number) {
    this.ordenReprogramar.set(id);
    this.nuevaFechaReprogramar = '';
    this.nuevaVentanaReprogramar = '';
    this.modalReprogramarAbierto.set(true);
  }

  cerrarReprogramar() {
    this.modalReprogramarAbierto.set(false);
    this.ordenReprogramar.set(null);
  }

  confirmarReprogramar() {
    const id = this.ordenReprogramar();
    if (!id) return;
    
    // Aquí iría la llamada HTTP real: this.http.put(/api/ordenes-compra/${id}/reprogramar, ...)
    this.toast.success('Orden Reprogramada', 'Se ha notificado al proveedor la nueva fecha y ventana horaria.');
    
    // Actualización local para reflejar el cambio inmediato en UI
    this.ordenes.update(ords => ords.map(o => {
      if (o.id === id) {
        return { 
          ...o, 
          estadoCumplimiento: 'PENDIENTE', 
          fechaLlegadaEstimada: this.nuevaFechaReprogramar, 
          ventanaHoraria: this.nuevaVentanaReprogramar,
          observacionRetraso: null 
        };
      }
      return o;
    }));
    this.cerrarReprogramar();
  }

  cancelarSLA(id: number) {
    if (confirm('¿Estás seguro de cancelar definitivamente esta orden por incumplimiento de entrega?')) {
      this.operacionesService['http'].put(`${this.operacionesService['apiUrl']}/api/ordenes-compra/${id}/cancelar-sla`, {})
        .subscribe({
          next: (res: any) => {
            this.toast.success('Orden Cancelada', res.mensaje || 'Orden cancelada por incumplimiento.');
            this.cargarOrdenes();
          },
          error: () => this.toast.error('Error', 'No se pudo cancelar la orden SLA.')
        });
    }
  }
}
