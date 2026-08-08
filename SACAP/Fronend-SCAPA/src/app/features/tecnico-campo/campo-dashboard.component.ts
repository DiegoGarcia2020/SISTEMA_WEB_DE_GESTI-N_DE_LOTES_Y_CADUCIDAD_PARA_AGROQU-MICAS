import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { VentasService } from '../../core/services/ventas.service';
import { CarritoService } from '../../core/services/carrito.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-campo-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  styleUrls: ['./campo-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <!-- Cabecera Hero -->
      <div class="hero-card">
        <div class="hero-card__info">
          <div class="hero-card__icon">
            <lucide-icon name="user-check"></lucide-icon>
          </div>
          <div>
            <span class="hero-card__badge">Rol: Técnico-Comercial</span>
            <h1 class="hero-card__title">Gestión Agronómica & Ventas en Campo</h1>
            <p class="hero-card__subtitle">Técnico asignado: {{ authService.currentUser()?.correo || 'tecnico@agrosense.ec' }}</p>
          </div>
        </div>
        <div class="hero-card__actions">
          <button (click)="activeTab.set('combos')" 
                  [class.active]="activeTab() === 'combos'"
                  class="btn--tab">
            <lucide-icon name="zap" class="w-4 h-4"></lucide-icon>
            <span>Combos IA</span>
          </button>
          <button (click)="router.navigate(['/admin/ventas/dashboard'])" 
                  class="btn--tab">
            <lucide-icon name="file-plus" class="w-4 h-4"></lucide-icon>
            <span>Generar Venta / Pedido</span>
          </button>
          <button (click)="activeTab.set('historial')" 
                  [class.active]="activeTab() === 'historial'"
                  class="btn--tab">
            <lucide-icon name="clipboard-list" class="w-4 h-4"></lucide-icon>
            <span>Historial de Ventas</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: CATÁLOGO Y COMBOS IA -->
      @if (activeTab() === 'combos') {
        <div>
          <div class="section-banner">
            <div>
              <h3 class="section-banner__title">Recomendaciones de Venta Inteligente (IA AgroSense)</h3>
              <p class="section-banner__desc">Promociones estratégicas generadas para empujar lotes próximos a vencer.</p>
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
            <div>
              <h3 class="table-card__title">
                <lucide-icon name="history" class="w-5 h-5"></lucide-icon>
                <span>Historial de Ventas</span>
              </h3>
              <p class="table-card__desc">Ventas registradas y confirmadas en su cuenta de técnico</p>
            </div>
            <button (click)="cargarVentas()" class="btn btn--ghost">
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
    </div>
  `
})
export class CampoDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private operacionesService = inject(OperacionesService);
  private ventasService = inject(VentasService);
  private toast = inject(ToastService);
  private carrito = inject(CarritoService);
  router = inject(Router);

  activeTab = signal<'combos' | 'historial'>('combos');

  combosActivos = signal<any[]>([]);
  lotesDisponibles = signal<any[]>([]);
  ventas = signal<any[]>([]);

  ngOnInit(): void {
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
}
