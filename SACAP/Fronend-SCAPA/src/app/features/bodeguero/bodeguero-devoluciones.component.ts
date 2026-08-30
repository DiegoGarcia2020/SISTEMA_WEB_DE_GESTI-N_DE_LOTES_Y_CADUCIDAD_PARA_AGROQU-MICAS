import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { InventarioService, NodoTopologiaDTO } from '../../core/services/inventario.service';
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
          <div class="modal-content" style="max-width: 540px; width: 100%; border-radius: 1rem; padding: 1.5rem; background: #ffffff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem;">
              <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">Recibir Devolución Física</h3>
              <button (click)="cerrarModal()" style="border: none; background: transparent; cursor: pointer; color: #6b7280; font-size: 1.25rem;">✕</button>
            </div>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.875rem; margin-bottom: 1.25rem;">
              <div style="font-size: 0.875rem; font-weight: 700; color: #111827;">{{ devSeleccionada()?.nombreProducto }}</div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; color: #4b5563; margin-top: 0.25rem;">
                <span>Cantidad: <strong style="color: #0B4628;">{{ devSeleccionada()?.cantidadDevuelta }} unid.</strong></span>
                <span>Motivo: <strong>{{ devSeleccionada()?.motivo }}</strong></span>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 700; color: #374151; margin-bottom: 0.375rem; text-transform: uppercase;">Estado de Inventario Destino:</label>
              <select [(ngModel)]="estadoInventarioSeleccionado" class="form-control" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background: white;">
                <option value="CUARENTENA">Cuarentena (Revisión de Calidad)</option>
                <option value="EMPAQUE_DANADO">Empaque Dañado (Producto Bueno - Asignar Estantería)</option>
                <option value="DISPONIBLE">Reintegrar a Stock (Disponible en Ubicación Original)</option>
                <option value="DESECHADO">Merma / Desechado</option>
              </select>
              <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.375rem;">
                @if (estadoInventarioSeleccionado === 'EMPAQUE_DANADO') {
                  El producto está en buen estado pero la caja o empaque sufrió daños. Asígnalo a una estantería especial.
                } @else if (estadoInventarioSeleccionado === 'DISPONIBLE') {
                  El producto regresará al lote y estantería que tenía asignado originalmente.
                } @else if (estadoInventarioSeleccionado === 'CUARENTENA') {
                  El producto se mantendrá en cuarentena a la espera de verificación técnica.
                } @else {
                  Se dará de baja como pérdida / merma del inventario.
                }
              </p>
            </div>

            @if (estadoInventarioSeleccionado === 'EMPAQUE_DANADO') {
              <div class="form-group" style="margin-bottom: 1.25rem; padding: 0.875rem; background: #fefce8; border: 1px solid #fef08a; border-radius: 0.75rem;">
                <label style="display: block; font-size: 0.8125rem; font-weight: 700; color: #854d0e; margin-bottom: 0.375rem; text-transform: uppercase;">
                  Seleccionar Estantería / Ubicación Destino *
                </label>
                @if (cargandoUbicaciones()) {
                  <p style="font-size: 0.8125rem; color: #713f12; margin: 0.25rem 0;">Cargando estanterías disponibles...</p>
                } @else {
                  <select [(ngModel)]="idUbicacionSeleccionada" class="form-control" style="width: 100%; padding: 0.625rem; border: 1px solid #ca8a04; border-radius: 0.5rem; font-size: 0.875rem; background: white;">
                    <option [ngValue]="null" disabled>Seleccione la estantería de destino...</option>
                    @for (ub of ubicacionesDisponibles(); track ub.idUbicacion) {
                      <option [ngValue]="ub.idUbicacion" [disabled]="ub.disponible < (devSeleccionada()?.cantidadDevuelta || 1)">
                        {{ ub.label }}
                      </option>
                    }
                  </select>
                  <p style="font-size: 0.75rem; color: #854d0e; margin-top: 0.25rem;">
                    Reintegrará este stock a la estantería seleccionada para productos con caja/empaque dañado.
                  </p>
                }
              </div>
            }

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #f3f4f6; padding-top: 1rem;">
              <button (click)="cerrarModal()" class="btn btn--outline" style="cursor: pointer;">Cancelar</button>
              <button (click)="confirmarRecepcion()" class="btn btn--primary" style="cursor: pointer;">Confirmar Recepción</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BodegueroDevolucionesComponent implements OnInit {
  private operacionesService = inject(OperacionesService);
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  devoluciones = signal<any[]>([]);
  paginaActual = signal<number>(0);
  totalPaginas = signal<number>(0);
  totalElementos = signal<number>(0);
  tamanoPagina = 20;
  mostrarModal = signal<boolean>(false);
  devSeleccionada = signal<any | null>(null);
  estadoInventarioSeleccionado = 'CUARENTENA';
  idUbicacionSeleccionada = signal<number | null>(null);
  ubicacionesDisponibles = signal<Array<{ idUbicacion: number; label: string; disponible: number }>>([]);
  cargandoUbicaciones = signal<boolean>(false);

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

  cargarUbicaciones(): void {
    this.cargandoUbicaciones.set(true);
    this.inventarioService.getArbolTopologia().subscribe({
      next: (arbol) => {
        const flat: Array<{ idUbicacion: number; label: string; disponible: number }> = [];
        this.extraerUbicaciones(arbol, '', flat);
        this.ubicacionesDisponibles.set(flat);
        this.cargandoUbicaciones.set(false);
      },
      error: () => {
        this.cargandoUbicaciones.set(false);
      }
    });
  }

  private extraerUbicaciones(nodos: NodoTopologiaDTO[], ruta: string, resultado: Array<{ idUbicacion: number; label: string; disponible: number }>): void {
    if (!nodos) return;
    for (const nodo of nodos) {
      const nombreActual = ruta ? `${ruta} › ${nodo.nombre}` : nodo.nombre;
      if (nodo.tipo === 'UBICACION') {
        const capMax = nodo.capacidadMaxima || 100;
        const capAct = nodo.capacidadActual || 0;
        const disp = Math.max(0, capMax - capAct);
        resultado.push({
          idUbicacion: nodo.idReal,
          label: `${nombreActual} (Disp: ${disp} u.)`,
          disponible: disp
        });
      } else if (nodo.hijos && nodo.hijos.length > 0) {
        this.extraerUbicaciones(nodo.hijos, nombreActual, resultado);
      }
    }
  }

  irAPagina(pagina: number): void {
    this.paginaActual.set(pagina);
    this.cargarDevoluciones();
  }

  abrirModalRecibir(dev: any): void {
    this.devSeleccionada.set(dev);
    this.estadoInventarioSeleccionado = 'CUARENTENA'; // default
    this.idUbicacionSeleccionada.set(null);
    if (this.ubicacionesDisponibles().length === 0) {
      this.cargarUbicaciones();
    }
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.devSeleccionada.set(null);
    this.idUbicacionSeleccionada.set(null);
  }

  confirmarRecepcion(): void {
    const dev = this.devSeleccionada();
    if (!dev) return;

    if (this.estadoInventarioSeleccionado === 'EMPAQUE_DANADO' && !this.idUbicacionSeleccionada()) {
      this.toast.warning('Ubicación requerida', 'Por favor seleccione la estantería/ubicación de destino para los productos con empaque dañado.');
      return;
    }

    const payload: any = {
      estadoInventario: this.estadoInventarioSeleccionado
    };

    if (this.estadoInventarioSeleccionado === 'EMPAQUE_DANADO' && this.idUbicacionSeleccionada()) {
      payload.idUbicacionDestino = this.idUbicacionSeleccionada();
    }

    this.operacionesService.recibirDevolucionFisicaVenta(dev.id, payload).subscribe({
      next: () => {
        this.toast.success('Recepción Confirmada', 'El estado del inventario ha sido actualizado correctamente.');
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

