import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-bodeguero-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styleUrls: ['./bodega-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <span class="page-header__badge">Bodega Central</span>
        <h1 class="page-header__title">Recepción de Devoluciones</h1>
        <p class="page-header__subtitle">Registre la entrada física de las devoluciones reportadas por los técnicos en campo.</p>
      </div>

      <div class="table-card" style="margin-top: 1rem;">
        <div class="table-card__header">
          <h3 style="font-size: 1rem; font-weight: 600; color: var(--c-warm-black);">Devoluciones Pendientes (En Tránsito) — {{ totalElementos() }} en total</h3>
          <button (click)="cargarDevoluciones()" class="btn btn--ghost" title="Actualizar">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Devolución ID / Venta</th>
                <th>Producto</th>
                <th>Técnico</th>
                <th>Cantidad</th>
                <th>Estado Logístico</th>
                <th style="text-align: center;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (dev of devoluciones(); track dev.id) {
                <tr>
                  <td>
                    <span class="data-table__id block">DEV-{{ dev.id }}</span>
                    <span style="font-size: 0.75rem; color: var(--c-sage-border);">Venta: {{ dev.numeroComprobante || dev.idVenta }}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700;">{{ dev.nombreProducto }}</div>
                    <div style="font-size: 0.75rem; color: var(--c-sage-text);">Motivo: {{ dev.motivo }}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.875rem;">{{ dev.nombreTecnico }}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--c-dark-green);">{{ dev.cantidadDevuelta }}</div>
                  </td>
                  <td>
                    <span class="badge badge--pendiente">{{ dev.estadoLogistico }}</span>
                  </td>
                  <td style="text-align: center;">
                    <button (click)="abrirModalRecibir(dev)" class="btn btn--primary btn--sm">
                      <lucide-icon name="package-check" class="w-4 h-4"></lucide-icon> Recibir
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6">
                    <div class="empty-state">
                      <lucide-icon name="check-circle-2" class="empty-state__icon" style="color: var(--c-sage-text);"></lucide-icon>
                      <p class="empty-state__title">No hay devoluciones pendientes de recepción física.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPaginas() > 1) {
          <div class="table-card__footer" style="display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 0.75rem;">
            <button class="btn btn--ghost btn--sm" [disabled]="paginaActual() === 0" (click)="irAPagina(paginaActual() - 1)">← Anterior</button>
            <span style="font-size: 0.875rem;">Página {{ paginaActual() + 1 }} de {{ totalPaginas() }}</span>
            <button class="btn btn--ghost btn--sm" [disabled]="paginaActual() + 1 >= totalPaginas()" (click)="irAPagina(paginaActual() + 1)">Siguiente →</button>
          </div>
        }
      </div>

      <!-- Modal Recibir Devolución -->
      @if (mostrarModal()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Recibir Devolución Física</h3>
            <p>Producto: {{ devSeleccionada()?.nombreProducto }} (Cantidad: {{ devSeleccionada()?.cantidadDevuelta }})</p>
            <p style="font-size: 0.875rem; color: var(--c-sage-text); margin-bottom: 15px;">Motivo: {{ devSeleccionada()?.motivo }}</p>

            <div class="form-group">
              <label>Estado de Inventario Destino:</label>
              <select [(ngModel)]="estadoInventarioSeleccionado" class="form-control" style="width: 100%; padding: 8px; margin-top: 5px;">
                <option value="CUARENTENA">Cuarentena (Revisión de Calidad)</option>
                <option value="DISPONIBLE">Reintegrar a Stock (Disponible)</option>
                <option value="DESECHADO">Merma / Desechado</option>
              </select>
            </div>

            <div class="modal-actions" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
              <button (click)="cerrarModal()" class="btn btn--outline">Cancelar</button>
              <button (click)="confirmarRecepcion()" class="btn btn--primary">Confirmar Recepción</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BodegueroDevolucionesComponent implements OnInit {
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);

  devoluciones = signal<any[]>([]);
  paginaActual = signal<number>(0);
  totalPaginas = signal<number>(0);
  totalElementos = signal<number>(0);
  tamanoPagina = 20;
  mostrarModal = signal<boolean>(false);
  devSeleccionada = signal<any | null>(null);
  estadoInventarioSeleccionado = 'CUARENTENA';

  ngOnInit(): void {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.operacionesService.listarDevolucionesPendientesBodega(this.paginaActual(), this.tamanoPagina).subscribe({
      next: (pagina) => {
        this.devoluciones.set(pagina.content);
        this.totalPaginas.set(pagina.totalPages);
        this.totalElementos.set(pagina.totalElements);
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar las devoluciones pendientes.')
    });
  }

  irAPagina(pagina: number): void {
    this.paginaActual.set(pagina);
    this.cargarDevoluciones();
  }

  abrirModalRecibir(dev: any): void {
    this.devSeleccionada.set(dev);
    this.estadoInventarioSeleccionado = 'CUARENTENA'; // default
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.devSeleccionada.set(null);
  }

  confirmarRecepcion(): void {
    const dev = this.devSeleccionada();
    if (!dev) return;

    this.operacionesService.recibirDevolucionFisicaVenta(dev.id, this.estadoInventarioSeleccionado).subscribe({
      next: () => {
        this.toast.success('Recepción Confirmada', 'El estado del inventario ha sido actualizado.');
        this.cerrarModal();
        this.cargarDevoluciones();
      },
      error: (err) => {
        const msg = err.error?.message || 'Hubo un problema al procesar la recepción física.';
        this.toast.error('Error', msg);
      }
    });
  }
}
