import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styleUrl: './supervisor-dashboard.component.css',
  template: `
    <div class="dashboard-container">
      <!-- Cabecera del Supervisor (Section Header Minimalista) -->
      <div class="dashboard-header">
        <div class="dashboard-header__info">
          <div class="dashboard-header__icon">
            <lucide-icon name="shield-check" class="w-8 h-8"></lucide-icon>
          </div>
          <div>
            <span class="dashboard-header__badge">Rol: Supervisor & Auditoría</span>
            <h1 class="dashboard-header__title">Aprobaciones de Combos IA, Logística & Rentabilidad</h1>
            <p class="dashboard-header__subtitle">Auditor Activo: {{ authService.currentUser()?.correo || 'supervisor@agrosense.ec' }}</p>
          </div>
        </div>
        <div class="dashboard-header__actions">
          <button (click)="loadAll()" class="btn btn--ghost">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            <span>Actualizar Todo</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-card__content">
            <p class="kpi-card__label">Combos por Aprobar</p>
            <p class="kpi-card__value kpi-card__value--dark">{{ promosPendientes().length }}</p>
            <p class="kpi-card__subtext">
              <lucide-icon name="sparkles" class="w-3.5 h-3.5"></lucide-icon> Kits propuestos por Bodega/IA
            </p>
          </div>
          <div class="kpi-card__icon-wrapper">
            <lucide-icon name="zap" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card__content">
            <p class="kpi-card__label">Despachos por Aprobar</p>
            <p class="kpi-card__value kpi-card__value--dark">{{ despachosPendientes().length }}</p>
            <p class="kpi-card__subtext">
              <lucide-icon name="clock" class="w-3.5 h-3.5"></lucide-icon> Requiere visto bueno
            </p>
          </div>
          <div class="kpi-card__icon-wrapper">
            <lucide-icon name="truck" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card__content">
            <p class="kpi-card__label">Devoluciones Proveedor</p>
            <p class="kpi-card__value kpi-card__value--dark">{{ devolucionesPendientes().length }}</p>
            <p class="kpi-card__subtext">Defectos / Reclamaciones</p>
          </div>
          <div class="kpi-card__icon-wrapper">
            <lucide-icon name="rotate-ccw" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card__content">
            <p class="kpi-card__label">Aprobaciones Hoy</p>
            <p class="kpi-card__value kpi-card__value--green">{{ procesadosHoy() }}</p>
            <p class="kpi-card__subtext">Decisiones validadas en turno</p>
          </div>
          <div class="kpi-card__icon-wrapper">
            <lucide-icon name="check-check" class="w-6 h-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- BANDEJA 1: APROBACIÓN DE COMBOS IA Y PROMOCIONES DE VENTA -->
      <div class="data-section">
        <div class="data-section__header">
          <div class="data-section__title-group">
            <div class="data-section__icon">
              <lucide-icon name="sparkles" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h3 class="data-section__title">Bandeja de Aprobación de Combos & Promociones de Venta (IA / Almacén)</h3>
              <p class="data-section__subtitle">Autorice los kits propuestos por Almacén o por el motor AgroSense para que se publiquen en el catálogo de los Técnicos.</p>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Combo # / Fecha</th>
                <th>Título del Combo & Lote Ref.</th>
                <th>Descuento</th>
                <th>Justificación Comercial</th>
                <th style="text-align: right">Decisión de Supervisión</th>
              </tr>
            </thead>
            <tbody>
              @for (promo of promosPendientes(); track promo.idPromocion) {
                <tr>
                  <td class="cell-mono">
                    <span class="cell-mono__title">PROMO-{{ promo.idPromocion }}</span>
                    <span class="cell-mono__subtitle">{{ promo.fechaInicio || promo.fechaCreacion }}</span>
                  </td>
                  <td>
                    <div class="cell-title">{{ promo.nombrePromocion || promo.titulo }}</div>
                    <div class="cell-subtitle">Lote: {{ promo.codigoLoteRef || promo.codigoLote }} ({{ promo.productoRef || promo.nombreProducto }})</div>
                  </td>
                  <td class="cell-highlight">
                    -{{ promo.descuentoGlobal || promo.descuentoSugerido }}%
                  </td>
                  <td class="cell-text">
                    {{ promo.descripcion || promo.justificacionIA }}
                  </td>
                  <td class="cell-actions">
                    <button (click)="aprobarPromo(promo)" class="btn btn--primary">
                      <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                      <span>Aprobar y Publicar</span>
                    </button>
                    <button (click)="rechazarPromo(promo)" class="btn btn--secondary">
                      ✕ Rechazar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <lucide-icon name="zap" class="empty-state__icon"></lucide-icon>
                      <p class="empty-state__title">No hay combos o promociones pendientes de aprobación</p>
                      <p class="empty-state__text">Todos los combos generados están aprobados en catálogo o vigentes.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- BANDEJA 2: DESPACHOS PENDIENTES -->
      <div class="data-section">
        <div class="data-section__header">
          <div class="data-section__title-group">
            <div class="data-section__icon">
              <lucide-icon name="send" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h3 class="data-section__title">Bandeja de Despachos FEFO Críticos (Auditoría de Salidas)</h3>
              <p class="data-section__subtitle">Auditoría del supervisor sobre movimientos y salidas de bodega.</p>
            </div>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto & Lote</th>
                <th>Cantidad</th>
                <th>Observación / Destino</th>
                <th style="text-align: right">Decisión de Control</th>
              </tr>
            </thead>
            <tbody>
              @for (des of despachosPendientes(); track des.idMovimiento) {
                <tr>
                  <td class="cell-mono-light">{{ des.fechaMovimiento || 'Hoy' }}</td>
                  <td>
                    <div class="cell-title">{{ des.lote?.producto?.nombre || 'Producto' }}</div>
                    <div class="cell-subtitle-light">Lote: {{ des.lote?.numeroLote || des.idLote }}</div>
                  </td>
                  <td class="cell-highlight-dark">{{ des.cantidad }} unds</td>
                  <td class="cell-text">{{ des.observacion }}</td>
                  <td class="cell-actions">
                    <button (click)="aprobarDespacho(des.idMovimiento)" class="btn btn--primary">
                      ✓ Aprobar Salida
                    </button>
                    <button (click)="rechazarDespacho(des.idMovimiento)" class="btn btn--danger">
                      ✕ Rechazar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <lucide-icon name="check-circle" class="empty-state__icon"></lucide-icon>
                      <p class="empty-state__title">No hay despachos críticos pendientes de revisión</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- BANDEJA 3: DEVOLUCIONES A PROVEEDOR & DISPARO DE ALERTAS IA -->
      <div class="data-section">
        <div class="data-section__header">
          <div class="data-section__title-group">
            <div class="data-section__icon">
              <lucide-icon name="rotate-ccw" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h3 class="data-section__title">Bandeja de Devoluciones Correctivas a Proveedor & Alertas IA</h3>
              <p class="data-section__subtitle">Autorice devoluciones por daños o defectos. El motor IA evaluará si debe sugerirse combo rotatorio.</p>
            </div>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto & Lote</th>
                <th>Proveedor</th>
                <th>Defecto / Motivo</th>
                <th style="text-align: right">Decisión de Control</th>
              </tr>
            </thead>
            <tbody>
              @for (dev of devolucionesPendientes(); track dev.idDevolucion) {
                <tr>
                  <td class="cell-mono-light">{{ dev.fechaDevolucion || 'Hoy' }}</td>
                  <td>
                    <div class="cell-title">{{ dev.lote?.producto?.nombre || 'Insumo' }}</div>
                    <div class="cell-subtitle-light">Lote: {{ dev.lote?.numeroLote || dev.idLote }} ({{ dev.cantidadDevuelta }} unds)</div>
                  </td>
                  <td class="cell-title-small">{{ dev.proveedor?.nombre || 'Proveedor' }}</td>
                  <td class="cell-text-danger">{{ dev.motivo }}</td>
                  <td class="cell-actions">
                    <button (click)="aprobarDevolucion(dev.idDevolucion)" class="btn btn--primary">
                      ✓ Aprobar Devolución
                    </button>
                    <button (click)="rechazarDevolucion(dev.idDevolucion)" class="btn btn--secondary">
                      ✕ Denegar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <lucide-icon name="shield-check" class="empty-state__icon"></lucide-icon>
                      <p class="empty-state__title">No hay devoluciones a proveedor pendientes</p>
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
export class SupervisorDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);

  promosPendientes = signal<any[]>([]);
  despachosPendientes = signal<any[]>([]);
  devolucionesPendientes = signal<any[]>([]);
  procesadosHoy = signal<number>(4);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.operacionesService.listarPromociones().subscribe(data => {
      this.promosPendientes.set(data.filter(p => p.estado === 'SUGERIDA' || (p as any).idEstado === 2));
    });
    this.operacionesService.listarDespachosPendientes().subscribe(data => this.despachosPendientes.set(data));
    this.operacionesService.listarDevolucionesPendientes().subscribe(data => this.devolucionesPendientes.set(data));
  }

  aprobarPromo(promo: any): void {
    const id = promo.idPromocion;
    this.operacionesService.cambiarEstadoPromocion(id, 'APROBADA').subscribe({
      next: () => {
        promo.estado = 'APROBADA';
        (promo as any).idEstado = 1;
        this.toast.success('Combo IA Aprobado', 'El combo ha sido autorizado y está visible para todos los Técnicos-Comerciales.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar la promoción/combo.')
    });
  }

  rechazarPromo(promo: any): void {
    const id = promo.idPromocion;
    this.operacionesService.cambiarEstadoPromocion(id, 'RECHAZADA').subscribe({
      next: () => {
        this.toast.info('Combo Denegado', 'La sugerencia de combo ha sido descartada.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo denegar el combo.')
    });
  }

  aprobarDespacho(idMovimiento: number): void {
    this.operacionesService.aprobarDespacho(idMovimiento, 'Aprobado en auditoría de Supervisor').subscribe({
      next: () => {
        this.toast.success('Despacho Confirmado', 'Se ha autorizado la salida de bodega.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar el despacho.')
    });
  }

  rechazarDespacho(idMovimiento: number): void {
    this.operacionesService.rechazarDespacho(idMovimiento, 'Denegado por Supervisor').subscribe({
      next: () => {
        this.toast.info('Despacho Denegado', 'El movimiento logístico fue rechazado.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo rechazar el despacho.')
    });
  }

  aprobarDevolucion(idDevolucion: number): void {
    this.operacionesService.cambiarEstadoDevolucion(idDevolucion, { idEstadoAprobacion: 1, observacionSupervisor: 'Aprobado por Supervisor' }).subscribe({
      next: () => {
        this.toast.success('Devolución Aprobada', 'Se registró la devolución al proveedor y se actualizó el inventario.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo procesar la aprobación.')
    });
  }

  rechazarDevolucion(idDevolucion: number): void {
    this.operacionesService.cambiarEstadoDevolucion(idDevolucion, { idEstadoAprobacion: 3, observacionSupervisor: 'Denegado por Supervisor' }).subscribe({
      next: () => {
        this.toast.info('Devolución Denegada', 'La solicitud de devolución al proveedor fue descartada.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo denegar la devolución.')
    });
  }
}
