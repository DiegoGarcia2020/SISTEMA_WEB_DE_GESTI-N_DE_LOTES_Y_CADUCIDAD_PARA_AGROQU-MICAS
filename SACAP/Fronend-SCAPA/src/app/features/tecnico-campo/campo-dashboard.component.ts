import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { VentasService } from '../../core/services/ventas.service';
import { CarritoService } from '../../core/services/carrito.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-campo-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styleUrls: ['./campo-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <!-- Cabecera -->
      <div class="page-header">
        <span class="page-header__badge">Rol: Técnico-Comercial</span>
        <h1 class="page-header__title">
          {{ activeTab() === 'combos' ? 'Combos IA' : 'Historial de Ventas' }}
        </h1>
        <p class="page-header__subtitle">
          {{ activeTab() === 'combos'
              ? 'Promociones estratégicas generadas para empujar lotes próximos a vencer.'
              : 'Ventas registradas y confirmadas en su cuenta de técnico.' }}
        </p>
      </div>

      <!-- TAB 1: CATÁLOGO Y COMBOS IA -->
      @if (activeTab() === 'combos') {
        <div>
          <div class="section-banner">
            <div>
              <h3 class="section-banner__title">Recomendaciones de Venta Inteligente (IA AgroSense)</h3>
            </div>
            <span class="badge badge--pendiente">
              {{ combosActivos().length }} Promociones Activas para Hoy
            </span>
          </div>

          <div class="combos-grid">
            @for (combo of combosActivos(); track combo.idPromocion) {
              <div class="combo-card">
                <div class="combo-card__header">
                  <span class="combo-card__discount">
                    DESCUENTO -{{ combo.descuentoSugerido }}%
                  </span>
                  <span class="combo-card__date">
                    Hasta {{ combo.fechaVigencia }}
                  </span>
                </div>

                <div class="combo-card__body">
                  <h4 class="combo-card__title">{{ combo.titulo }}</h4>
                  <p class="combo-card__desc">{{ combo.justificacionIA }}</p>

                  <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--c-warm-black);">
                    <div>
                      <strong style="text-transform: uppercase;">Lote Referencia:</strong>
                      <span>{{ combo.codigoLote }}</span>
                    </div>
                    <div>
                      <strong style="text-transform: uppercase;">Precio Promo:</strong>
                      <span style="color: var(--c-dark-green); font-weight: 700;">$ {{ (combo.precioPromocion || combo.precioOriginal) | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>

                <div class="combo-card__footer">
                  <button (click)="venderConCombo(combo)" class="btn btn--primary" style="width: 100%;">
                    <lucide-icon name="arrow-right-circle" class="w-4 h-4"></lucide-icon>
                    <span>Generar Venta con este Combo</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <lucide-icon name="package-check" class="empty-state__icon"></lucide-icon>
                <p class="empty-state__title">No hay combos IA activos en este momento</p>
                <p class="empty-state__text">El Supervisor o el Bodeguero pueden aprobar nuevas promociones desde su panel.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: HISTORIAL DE VENTAS -->
      @if (activeTab() === 'historial') {
        <div class="table-card">
          <div class="table-card__header">
            <div></div>
            <button (click)="cargarVentas()" class="btn btn--ghost" title="Recargar">
              <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>N° Orden & Fecha</th>
                  <th>Cliente</th>
                  <th>Técnico</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th style="text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (venta of ventas(); track venta.idVenta) {
                  <tr>
                    <td>
                      <span class="data-table__id block">{{ venta.numeroOrden || 'VTA-' + venta.idVenta }}</span>
                      <span style="font-size: 0.6875rem; color: var(--c-sage-border);">{{ venta.fechaVenta | date:'short' }}</span>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--c-warm-black);">{{ venta.nombreCliente }}</div>
                    </td>
                    <td>
                      <div style="font-size: 0.75rem;">{{ venta.nombreTecnico }}</div>
                    </td>
                    <td>
                      <div style="font-weight: 800; color: var(--c-dark-green);">$ {{ venta.total.toFixed(2) }}</div>
                    </td>
                    <td>
                      <span class="badge badge--recepcionada">{{ venta.estado }}</span>
                    </td>
                    <td style="text-align: center;">
                      <button (click)="verDetalleVenta(venta.idVenta)" class="btn--action-view">
                        Ver Detalle
                      </button>
                      @if (venta.estado === 'ENTREGADA') {
                        <button (click)="abrirModalDevolucion(venta)" class="btn btn--outline btn--sm" style="margin-left: 8px;">
                          <lucide-icon name="undo-2"></lucide-icon> Devolver
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6">
                      <div class="empty-state">
                        <lucide-icon name="clipboard-x" class="empty-state__icon"></lucide-icon>
                        <p class="empty-state__title">No ha registrado ninguna venta todavía</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      
      <!-- Modal de Devolución -->
      @if (mostrarModalDevolucion()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Registrar Devolución de Venta</h3>
            <p>Venta: {{ ventaSeleccionada()?.numeroOrden || 'VTA-' + ventaSeleccionada()?.idVenta }}</p>
            
            <div class="form-group" style="margin-top: 15px;">
              <label>Producto a devolver (seleccione del detalle):</label>
              <select [(ngModel)]="devolucionForm.idDetalle" class="form-control" style="width: 100%; padding: 8px; margin-top: 5px;">
                <option value="">-- Seleccione un producto --</option>
                @for (item of detallesVenta(); track item.idDetalle) {
                  <option [value]="item.idDetalle">{{ item.nombreProducto }} (Compró: {{ item.cantidad }})</option>
                }
              </select>
            </div>
            
            <div class="form-group" style="margin-top: 15px;">
              <label>Cantidad a devolver:</label>
              <input type="number" [(ngModel)]="devolucionForm.cantidad" class="form-control" min="1" style="width: 100%; padding: 8px; margin-top: 5px;" />
            </div>
            
            <div class="form-group" style="margin-top: 15px;">
              <label>Motivo de la devolución:</label>
              <select [(ngModel)]="devolucionForm.motivo" class="form-control" style="width: 100%; padding: 8px; margin-top: 5px;">
                <option value="">-- Seleccione un motivo --</option>
                <option value="PRODUCTO_CADUCADO">Producto Caducado</option>
                <option value="EMPAQUE_DANADO">Empaque Dañado</option>
                <option value="ERROR_DESPACHO">Error en Despacho</option>
                <option value="CLIENTE_RECHAZA">Cliente Rechaza / No requiere</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            
            <div class="modal-actions" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
              <button (click)="cerrarModalDevolucion()" class="btn btn--outline">Cancelar</button>
              <button (click)="confirmarDevolucion()" class="btn btn--primary" [disabled]="!devolucionForm.idDetalle || devolucionForm.cantidad <= 0 || !devolucionForm.motivo">Confirmar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CampoDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private operacionesService = inject(OperacionesService);
  private ventasService = inject(VentasService);
  private toast = inject(ToastService);
  private carrito = inject(CarritoService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  /** La vista activa ahora viene de la ruta (cada opción es un ítem del menú lateral). */
  activeTab = signal<'combos' | 'historial'>('combos');

  combosActivos = signal<any[]>([]);
  lotesDisponibles = signal<any[]>([]);
  ventas = signal<any[]>([]);
  
  // Estado para el modal de devolución
  mostrarModalDevolucion = signal<boolean>(false);
  ventaSeleccionada = signal<any | null>(null);
  detallesVenta = signal<any[]>([]);
  devolucionForm = {
    idDetalle: '',
    cantidad: 1,
    motivo: ''
  };

  ngOnInit(): void {
    const vista = this.route.snapshot.data['vista'] as 'combos' | 'historial' | undefined;
    if (vista) {
      this.activeTab.set(vista);
    }
    this.cargarCombos();
    this.cargarLotes();
    this.cargarVentas();
  }

  cargarCombos(): void {
    this.operacionesService.listarCombosActivos().subscribe(data => this.combosActivos.set(data));
  }

  cargarLotes(): void {
    this.operacionesService.listarLotesDisponiblesFefo().subscribe(data => this.lotesDisponibles.set(data));
  }

  cargarVentas(): void {
    this.ventasService.misVentas().subscribe(data => this.ventas.set(data));
  }

  verDetalleVenta(idVenta: number): void {
    this.router.navigate(['/admin/ventas/confirmacion', idVenta]);
  }

  /**
   * Aplica un combo/promoción IA directamente al carrito de ventas y lleva
   * al técnico al checkout para completar la venta — la sugerencia de la IA
   * termina siempre en una Venta real con comprobante, igual que el flujo
   * de ventas/motor-sugerencias.
   */
  venderConCombo(combo: any): void {
    const loteEncontrado = this.lotesDisponibles().find(
      l => l.numeroLote === combo.codigoLote || l.idLote === combo.idLote
    );

    if (!loteEncontrado) {
      this.toast.error('Lote no disponible', 'El lote de este combo ya no tiene stock disponible para despacho.');
      return;
    }

    this.carrito.agregar({
      idLote: loteEncontrado.idLote,
      numeroLote: loteEncontrado.numeroLote,
      nombreProducto: combo.nombreProducto || loteEncontrado.nombreProducto,
      cantidad: 1,
      precioUnitario: combo.precioPromocion || combo.precioOriginal || 0,
      esComboIA: true,
      idPromocion: combo.idPromocion,
      descuentoPct: combo.descuentoSugerido || 0
    });

    this.toast.success('Combo agregado al carrito', `${combo.titulo} listo para completar la venta.`);
    this.router.navigate(['/admin/ventas/checkout']);
  }

  // Lógica de Devolución
  abrirModalDevolucion(venta: any): void {
    this.ventaSeleccionada.set(venta);
    this.mostrarModalDevolucion.set(true);
    this.devolucionForm = { idDetalle: '', cantidad: 1, motivo: '' };
    
    // Cargar detalles de la venta
    this.ventasService.obtenerVenta(venta.idVenta).subscribe({
      next: (ventaCompleta: any) => {
        this.detallesVenta.set(ventaCompleta.lineas || []);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los detalles de la venta.');
        this.cerrarModalDevolucion();
      }
    });
  }

  cerrarModalDevolucion(): void {
    this.mostrarModalDevolucion.set(false);
    this.ventaSeleccionada.set(null);
    this.detallesVenta.set([]);
  }

  confirmarDevolucion(): void {
    const detalleSeleccionado = this.detallesVenta().find(d => d.idDetalle == this.devolucionForm.idDetalle);
    if (!detalleSeleccionado) return;

    if (this.devolucionForm.cantidad > detalleSeleccionado.cantidad) {
      this.toast.error('Error', 'No puede devolver más cantidad de la que se vendió.');
      return;
    }

    const payload = {
      idVenta: this.ventaSeleccionada()?.idVenta,
      idLote: detalleSeleccionado.idLote,
      idProducto: detalleSeleccionado.idProducto,
      cantidadDevuelta: this.devolucionForm.cantidad,
      motivo: this.devolucionForm.motivo
    };

    this.operacionesService.registrarDevolucionCampo(payload).subscribe({
      next: () => {
        this.toast.success('Devolución registrada', 'La solicitud de devolución fue enviada a bodega.');
        this.cerrarModalDevolucion();
        this.cargarVentas(); // Recargar para actualizar el estado
      },
      error: () => {
        this.toast.error('Error', 'No se pudo registrar la devolución.');
      }
    });
  }
}
