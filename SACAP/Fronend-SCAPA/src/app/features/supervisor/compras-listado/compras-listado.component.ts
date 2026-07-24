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
      <div class="page-header">
        <div class="page-header__blur"></div>
        <div class="page-header__info">
          <div class="page-header__icon">
            <lucide-icon name="file-text" class="w-7 h-7"></lucide-icon>
          </div>
          <div>
            <span class="page-header__badge">Módulo Compras</span>
            <h1 class="page-header__title">Órdenes de Compra</h1>
            <p class="page-header__subtitle">Registro y seguimiento de facturas de proveedores</p>
          </div>
        </div>
        <div class="page-header__actions">
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
                    <span class="badge"
                          [class.badge--pendiente]="orden.estado === 'PENDIENTE'"
                          [class.badge--recepcionada]="orden.estado === 'RECEPCIONADA'"
                          [class.badge--anulada]="orden.estado === 'ANULADA'">
                      {{ orden.estado }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      @if (orden.estado === 'PENDIENTE') {
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
}
