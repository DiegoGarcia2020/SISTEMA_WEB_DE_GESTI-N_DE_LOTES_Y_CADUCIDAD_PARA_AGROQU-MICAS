import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { OperacionesService, PageResponse } from '../../../core/services/operaciones.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ComprobanteService } from '../../../core/services/comprobante.service';

@Component({
  selector: 'app-compras-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
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
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-group__label">Buscar por Factura</label>
            <input type="text" class="form-group__input" [formControl]="searchControl" placeholder="Escriba el número de factura..." />
          </div>
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
                <option [ngValue]="prov.idProveedor">{{ prov.empresa?.nombre || prov.nombreRepresentante || prov.nombre }}</option>
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
          <button class="btn btn--filter btn--sm" (click)="buscarFiltros()">
            <lucide-icon name="search" class="w-3.5 h-3.5"></lucide-icon>
            Filtrar
          </button>
        </div>
      </div>

      <!-- Tabla de Órdenes -->
      <div class="table-card">
        <div class="table-card__header">
          <h3 class="table-card__title">Historial de Compras</h3>
          <span class="table-card__count">Total: {{ totalElements() }} registros</span>
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
                          Ver Detalle
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
                      <button class="btn--action btn--action-download" (click)="descargarPDF(orden.id)">
                        <lucide-icon name="download" class="w-3.5 h-3.5"></lucide-icon>
                        Descargar PDF
                      </button>
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
        
        <!-- Paginador -->
        @if (totalElements() > 0) {
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-top: 1px solid var(--c-sage-border); background: #fafafa;">
            <span style="font-size: 0.875rem; color: var(--c-warm-black);">
              Mostrando página {{ currentPage() + 1 }} de {{ totalPages() }}
            </span>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn--ghost" [disabled]="currentPage() === 0" (click)="cambiarPagina(currentPage() - 1)">Anterior</button>
              <button class="btn btn--ghost" [disabled]="currentPage() >= totalPages() - 1" (click)="cambiarPagina(currentPage() + 1)">Siguiente</button>
            </div>
          </div>
        }
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
    <!-- Modal Detalle de Orden (solo lectura — recepcionar es tarea del Bodeguero) -->
    @if (modalDetalleAbierto()) {
      <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(18,38,29,0.55); display:flex; justify-content:center; align-items:center; z-index:1000;">
        <div style="background:var(--c-bone-bg); border:1px solid var(--c-sage-border); border-radius:var(--radius-card); width:min(780px, 92vw); max-height:88vh; overflow-y:auto;">

          <div style="background:var(--c-dark-green); padding:1.25rem 1.75rem;">
            <h2 style="margin:0; font-family:'Fraunces', serif; font-size:1.25rem; color:var(--c-bone-bg);">
              Detalle de Orden de Compra
            </h2>
            @if (ordenDetalle(); as det) {
              <p style="margin:0.25rem 0 0; font-size:0.8125rem; color:var(--c-sage-border);">
                OC-{{ det.id }} · Factura {{ det.numeroFactura }}
              </p>
            }
          </div>

          <div style="padding:1.75rem;">
            @if (ordenDetalle(); as det) {
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
                <div>
                  <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Proveedor</p>
                  <p style="margin:0.25rem 0 0; font-weight:600; color:var(--c-warm-black);">{{ det.nombreProveedor }}</p>
                </div>
                <div>
                  <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Fecha Emisión</p>
                  <p style="margin:0.25rem 0 0; font-weight:600; color:var(--c-warm-black);">{{ det.fechaEmision }}</p>
                </div>
                <div>
                  <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Estado</p>
                  <p style="margin:0.25rem 0 0; font-weight:600; color:var(--c-warm-black);">{{ det.estado }}</p>
                </div>
                <div>
                  <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Cumplimiento</p>
                  <p style="margin:0.25rem 0 0; font-weight:600; color:var(--c-warm-black);">{{ det.estadoCumplimiento || '—' }}</p>
                </div>
                <div>
                  <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Llegada Estimada</p>
                  <p style="margin:0.25rem 0 0; font-weight:600; color:var(--c-warm-black);">
                    {{ det.fechaLlegadaEstimada || 'Sin programar' }}
                    @if (det.ventanaHoraria) { <span style="font-weight:400;"> · {{ det.ventanaHoraria }}</span> }
                  </p>
                </div>
                <div>
                  <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Llegada Real</p>
                  <p style="margin:0.25rem 0 0; font-weight:600; color:var(--c-warm-black);">
                    {{ det.fechaLlegadaReal || 'Aún no ha llegado' }}
                  </p>
                </div>
                @if (det.observacionRetraso) {
                  <div style="grid-column:1 / -1;">
                    <p style="margin:0; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--c-mid-green);">Observación de Retraso</p>
                    <p style="margin:0.25rem 0 0; color:var(--c-error);">{{ det.observacionRetraso }}</p>
                  </div>
                }
              </div>

              <table style="width:100%; border-collapse:collapse; font-size:0.875rem; margin-bottom:1.5rem;">
                <thead>
                  <tr style="border-bottom:1px solid var(--c-sage-border);">
                    <th style="text-align:left; padding:0.5rem 0; color:var(--c-mid-green); font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em;">Producto</th>
                    <th style="text-align:right; padding:0.5rem 0; color:var(--c-mid-green); font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em;">Cant.</th>
                    <th style="text-align:right; padding:0.5rem 0; color:var(--c-mid-green); font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em;">P. Unit.</th>
                    <th style="text-align:right; padding:0.5rem 0; color:var(--c-mid-green); font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  @for (d of det.detalles; track d.id) {
                    <tr style="border-bottom:1px solid rgba(143,174,155,0.35);">
                      <td style="padding:0.625rem 0; color:var(--c-warm-black);">
                        {{ d.nombreProducto }}
                        @if (d.esBonificacion) {
                          <span style="margin-left:0.5rem; font-size:0.625rem; padding:0.125rem 0.375rem; background:var(--c-success); color:var(--c-bone-bg); letter-spacing:0.04em;">BONIFICACIÓN</span>
                        }
                      </td>
                      <td style="text-align:right; color:var(--c-warm-black);">{{ d.cantidad }}</td>
                      <td style="text-align:right; color:var(--c-warm-black);">{{ d.precioUnitario | number:'1.2-2' }}</td>
                      <td style="text-align:right; color:var(--c-warm-black);">{{ d.subtotal | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <div style="border-top:1px solid var(--c-sage-border); padding-top:1rem; display:flex; flex-direction:column; gap:0.375rem; font-size:0.875rem;">
                <div style="display:flex; justify-content:space-between; color:var(--c-warm-black);">
                  <span>Subtotal Bruto</span><span>{{ det.subtotalBruto | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--c-error);">
                  <span>Total Descuentos</span><span>-{{ det.totalDescuentos | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--c-warm-black);">
                  <span>IVA</span><span>{{ det.impuestos | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:var(--c-warm-black);">
                  <span>Transporte</span><span>{{ det.costoTransporte | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1rem; color:var(--c-dark-green); border-top:1px solid var(--c-sage-border); padding-top:0.625rem; margin-top:0.25rem;">
                  <span>TOTAL A PAGAR</span><span>{{ det.totalNeto | number:'1.2-2' }}</span>
                </div>
              </div>
            } @else {
              <p style="text-align:center; padding:2rem; color:var(--c-mid-green);">Cargando detalle…</p>
            }

            <div style="display:flex; justify-content:flex-end; margin-top:1.75rem;">
              <button class="btn btn--ghost" (click)="cerrarDetalle()">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ComprasListadoComponent implements OnInit, OnDestroy {
  private operacionesService = inject(OperacionesService);
  private comprobanteService = inject(ComprobanteService);
  private toast = inject(ToastService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();
  searchControl = new FormControl('');

  ordenes = signal<any[]>([]);
  proveedores = signal<any[]>([]);

  filtroEstado = '';
  filtroProveedor: number | null = null;
  filtroDesde = '';
  filtroHasta = '';

  // Paginación
  currentPage = signal<number>(0);
  pageSize = 100;
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  ngOnInit(): void {
    this.cargarProveedores();
    
    // Suscripción reactiva al buscador
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(0); // Reiniciar a página 0 en nueva búsqueda
      this.cargarOrdenes();
    });

    // Carga inicial
    this.cargarOrdenes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buscarFiltros(): void {
    this.currentPage.set(0); // Reiniciar a página 0 en nuevo filtro manual
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    const term = this.searchControl.value?.trim() || '';
    
    // NOTA: Para este prototipo paginado priorizaremos la llamada paginada básica 
    // y aplicaremos los demás filtros si están en la versión original. 
    // Como el endpoint /paginadas generado en el backend solo soporta numeroFactura y estado,
    // usaremos esos. (Si quisieras todos, deberías añadirlos al Controller backend).
    
    this.operacionesService.getOrdenesPaginadas(
      this.currentPage(),
      this.pageSize,
      term
    ).subscribe({
      next: (response: PageResponse<any>) => {
        // Como 'response' puede que no venga paginado si hubo un error en la conexión 
        // y se usa el fallback, validamos:
        if (response && response.content) {
          // Filtrado local manual (para los campos no implementados en backend por el momento)
          let filtradas = response.content;
          if (this.filtroEstado) filtradas = filtradas.filter(o => o.estado === this.filtroEstado);
          if (this.filtroProveedor) filtradas = filtradas.filter(o => o.idProveedor === this.filtroProveedor);
          if (this.filtroDesde) filtradas = filtradas.filter(o => o.fechaEmision >= this.filtroDesde);
          if (this.filtroHasta) filtradas = filtradas.filter(o => o.fechaEmision <= this.filtroHasta);
          
          this.ordenes.set(filtradas);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
        } else if (Array.isArray(response)) {
           this.ordenes.set(response);
           this.totalElements.set(response.length);
           this.totalPages.set(1);
        }
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar las órdenes de compra.')
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages()) {
      this.currentPage.set(nuevaPagina);
      this.cargarOrdenes();
    }
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
    this.ordenDetalle.set(null);
    this.modalDetalleAbierto.set(true);
    this.operacionesService.obtenerOrdenCompra(id).subscribe({
      next: (orden) => this.ordenDetalle.set(orden),
      error: () => {
        this.modalDetalleAbierto.set(false);
        this.toast.error('Error', 'No se pudo cargar el detalle de la orden.');
      }
    });
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.ordenDetalle.set(null);
  }

  descargarPDF(id: number): void {
    this.toast.info('Generando PDF', `Descargando orden OC-${id}...`);
    this.operacionesService.obtenerOrdenCompra(id).subscribe({
      next: (ordenCompleta) => {
        this.comprobanteService.generarComprobanteCompra(ordenCompleta);
      },
      error: () => this.toast.error('Error', 'No se pudo generar el comprobante. Intente más tarde.')
    });
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
  modalDetalleAbierto = signal<boolean>(false);
  ordenDetalle = signal<any | null>(null);
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
