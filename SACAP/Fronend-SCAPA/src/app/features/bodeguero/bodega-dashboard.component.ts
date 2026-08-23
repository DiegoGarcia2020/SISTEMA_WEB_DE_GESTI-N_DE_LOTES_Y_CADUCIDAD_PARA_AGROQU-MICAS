import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-bodega-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  styleUrls: ['./bodega-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <!-- Cabecera Hero -->
      <div class="hero-card">
        <div class="hero-card__info">
          <div class="hero-card__icon">
            <lucide-icon name="boxes"></lucide-icon>
          </div>
          <div>
            <span class="hero-card__badge">Rol: Bodeguero & Almacén</span>
            <h1 class="hero-card__title">Kitting Físico, Despachos FEFO & Devoluciones</h1>
            <p class="hero-card__subtitle">Operador en Bodega: {{ authService.currentUser()?.correo || 'bodega@agrosense.ec' }}</p>
          </div>
        </div>
        <div class="hero-card__actions">
          <button (click)="activeTab.set('KITTING')"
                  [class.active]="activeTab() === 'KITTING'"
                  class="btn--tab">
            <lucide-icon name="package-check" class="w-4 h-4"></lucide-icon>
            <span>Armado de Kits (Combos IA)</span>
          </button>
          <button (click)="activeTab.set('LOTES')"
                  [class.active]="activeTab() === 'LOTES'"
                  class="btn--tab">
            <lucide-icon name="list-ordered" class="w-4 h-4"></lucide-icon>
            <span>Matriz Stock FEFO</span>
          </button>
          <button (click)="activeTab.set('DEVOLUCION_CLIENTE')"
                  [class.active]="activeTab() === 'DEVOLUCION_CLIENTE'"
                  class="btn--tab">
            <lucide-icon name="rotate-ccw" class="w-4 h-4"></lucide-icon>
            <span>Devolución Cliente</span>
            @if (devolucionesPendientesCount() > 0) {
              <span class="badge-tab" style="background-color: var(--c-error);">{{ devolucionesPendientesCount() }} Pendientes</span>
            }
          </button>
        </div>
      </div>

      <!-- Tarjetas KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div>
            <p class="kpi-card__title">Alertas para Kitting</p>
            <p class="kpi-card__value">{{ alertasKitting().length }}</p>
            <p class="kpi-card__desc">Lotes críticos en rotación</p>
          </div>
          <div class="kpi-card__icon">
            <lucide-icon name="sparkles" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="kpi-card">
          <div>
            <p class="kpi-card__title">Total en Stock (FEFO)</p>
            <p class="kpi-card__value">{{ totalUnidadesStock() }}</p>
            <p class="kpi-card__desc">Disponibles tras reservas</p>
          </div>
          <div class="kpi-card__icon">
            <lucide-icon name="layers" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="kpi-card">
          <div>
            <p class="kpi-card__title">Devoluciones Clientes</p>
            <p class="kpi-card__value">{{ devolucionesClienteCount() }}</p>
            <p class="kpi-card__desc">Stock sumado de inmediato</p>
          </div>
          <div class="kpi-card__icon">
            <lucide-icon name="rotate-ccw" class="w-6 h-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- TAB 2: KITTING Y COMBOS FÍSICOS -->
      @if (activeTab() === 'KITTING') {
        <div>
          <div class="section-banner">
            <div>
              <h3 class="section-banner__title">Almacén: Armado de Combos & Kitting Inteligente</h3>
              <p class="section-banner__desc">Convierta alertas de caducidad en paquetes listos para venta y empújelos directamente al catálogo de los Técnicos-Comerciales.</p>
            </div>
            <button (click)="openNuevoKitModal()" class="btn btn--primary">
              <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
              <span>Armar Kit Personalizado</span>
            </button>
          </div>

          <div class="kitting-grid">
            @for (alerta of alertasKitting(); track alerta.idAlerta) {
              <div class="alert-card">
                <div class="alert-card__header">
                  <span class="alert-card__badge">
                    VENCE EN {{ alerta.diasRestantes }} DÍAS
                  </span>
                  <span style="font-size: 0.6875rem; color: var(--c-sage-border);">{{ alerta.codigoLote }}</span>
                </div>

                <div class="alert-card__body">
                  <h4 class="alert-card__title">{{ alerta.nombreProducto }}</h4>
                  <p class="alert-card__desc">
                    <strong style="color: var(--c-cacao-accent); display: block; margin-bottom: 2px;">Sugerencia IA AgroSense:</strong>
                    Armar un pack rotativo con {{ alerta.sugerenciaDescuento }}% de descuento para agotar los {{ alerta.stockActual }} {{ alerta.unidadMedida }} antes del {{ alerta.fechaCaducidad }}.
                  </p>

                  <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--c-warm-black);">
                    <div>
                      <strong style="text-transform: uppercase;">Bodega:</strong>
                      <span style="display: block;">{{ alerta.bodega }}</span>
                    </div>
                    <div style="text-align: right;">
                      <strong style="text-transform: uppercase;">Stock Disp.:</strong>
                      <span style="display: block; font-weight: 700;">{{ alerta.stockActual }} unds</span>
                    </div>
                  </div>
                </div>

                <div class="alert-card__footer">
                  <button (click)="armarKitDesdeAlerta(alerta)" class="btn btn--primary" style="width: 100%;">
                    <lucide-icon name="send" class="w-4 h-4"></lucide-icon>
                    <span>Armar Kit y Enviar a Comercial</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <lucide-icon name="check-circle-2" class="empty-state__icon"></lucide-icon>
                <p class="empty-state__title">No hay alertas críticas de kitting pendientes</p>
                <p class="empty-state__text">Todos los lotes se encuentran dentro de rangos normales de rotación FEFO.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 3: MATRIZ STOCK FEFO -->
      @if (activeTab() === 'LOTES') {
        <div class="table-card">
          <div class="table-card__header">
            <div>
              <h3 class="table-card__title">Matriz de Lotes - Primero en Vencer, Primero en Salir (FEFO)</h3>
              <p class="table-card__desc">Stock disponible y reservas de pedidos calculados por lotes.</p>
            </div>
            <button (click)="loadAll()" class="btn btn--ghost">
              <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Prioridad / Vencimiento</th>
                  <th>Lote & Producto</th>
                  <th>Stock Físico</th>
                  <th>Reservado</th>
                  <th>Stock Disp.</th>
                  <th>Ubicación Almacén</th>
                </tr>
              </thead>
              <tbody>
                @for (lote of lotes(); track lote.idLote; let i = $index) {
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--c-bone-bg); color: var(--c-dark-green); font-weight: 800; font-size: 0.75rem; border: 1px solid var(--c-sage-border);">#{{ i + 1 }}</span>
                        <div>
                          <span style="font-weight: 700; color: var(--c-warm-black); display: block;">{{ lote.fechaVencimiento }}</span>
                          <span style="font-size: 0.625rem; color: var(--c-sage-border);">FEFO Activo</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--c-warm-black);">{{ lote.nombreProducto }}</div>
                      <div style="font-size: 0.6875rem; color: var(--c-sage-border);">Lote: {{ lote.numeroLote }}</div>
                    </td>
                    <td style="font-weight: 800; color: var(--c-warm-black);">{{ lote.cantidadActual || 0 }} unds</td>
                    <td style="font-weight: 700; color: var(--c-cacao-accent);">{{ lote.cantidadReservada || 0 }} unds</td>
                    <td style="font-weight: 800; color: var(--c-dark-green); font-size: 1rem;">
                      {{ Math.max(0, (lote.cantidadActual || 0) - (lote.cantidadReservada || 0)) }} unds
                    </td>
                    <td style="font-size: 0.75rem; font-weight: 700; color: var(--c-sage-border);">{{ lote.ubicacionAlmacen }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 4: DEVOLUCIÓN DE CLIENTE -->
      @if (activeTab() === 'DEVOLUCION_CLIENTE') {
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start;">
          <!-- Formulario de Reingreso -->
          <div class="form-card">
            <div style="margin-bottom: 1rem; border-bottom: 1px solid var(--c-sage-border); padding-bottom: 1rem;">
              <h3 style="font-family: var(--font-slab); font-size: 1.125rem; font-weight: 700; color: var(--c-warm-black); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                <lucide-icon name="rotate-ccw" class="w-5 h-5"></lucide-icon>
                <span>Reingreso por Devolución de Cliente</span>
              </h3>
              <p style="font-size: 0.75rem; color: var(--c-sage-border); margin: 0.5rem 0 0 0;">Cuando un cliente devuelve cajas o producto en buen estado, el stock se suma automáticamente al lote seleccionado en bodega.</p>
            </div>

            <form [formGroup]="devClienteForm" (ngSubmit)="onSaveDevolucionCliente()">
              <div class="form-group">
                <label class="form-label">Seleccionar Lote a Reingresar *</label>
                <select formControlName="idLote" class="form-select">
                  <option [ngValue]="null" disabled>-- Seleccione lote original --</option>
                  @for (l of lotes(); track l.idLote) {
                    <option [value]="l.idLote">{{ l.nombreProducto }} (Lote: {{ l.numeroLote }})</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Orden de Pedido / Cliente Ref. (Opcional)</label>
                <input type="text" formControlName="idPedidoOriginal" placeholder="ej. ORD-801 o Cédula Cliente" class="form-input">
              </div>

              <div class="form-group">
                <label class="form-label">Cantidad Devuelta (a sumar al stock) *</label>
                <input type="number" formControlName="cantidad" min="1" placeholder="ej. 5" class="form-input">
              </div>

              <div class="form-group">
                <label class="form-label">Motivo / Estado del Producto Devuelto *</label>
                <textarea formControlName="motivo" rows="2" placeholder="ej. Sobrante de aplicación en finca. Cajas intactas y selladas, aptas para reventa." class="form-textarea"></textarea>
              </div>

              <button type="submit" [disabled]="devClienteForm.invalid" class="btn btn--primary" style="width: 100%; margin-top: 1rem;">
                <lucide-icon name="plus-circle" class="w-4 h-4"></lucide-icon>
                <span>Registrar Devolución (+ Sumar Stock)</span>
              </button>
            </form>
          </div>
        </div>
      }
    </div>

    <!-- MODAL DE CREACIÓN DE KIT PERSONALIZADO -->
    @if (isKitModalOpen()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Armar Combo / Kit de Venta</h3>
            <button (click)="isKitModalOpen.set(false)" class="modal-close">×</button>
          </div>

          <form [formGroup]="kitForm" (ngSubmit)="onSaveKit()" style="padding: 1.5rem;">
            <div class="form-group">
              <label class="form-label">Nombre del Kit *</label>
              <input type="text" formControlName="nombrePromocion" placeholder="ej. Kit Liquidación Urea + Abono" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Seleccionar Lote Principal *</label>
              <select formControlName="codigoLoteRef" class="form-select">
                @for (l of lotes(); track l.idLote) {
                  <option [value]="l.numeroLote">{{ l.nombreProducto }} (Lote: {{ l.numeroLote }})</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Descuento Global Kit (%) *</label>
              <input type="number" formControlName="descuentoGlobal" min="5" max="50" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Descripción / Justificación para Comercial *</label>
              <textarea formControlName="descripcion" rows="3" placeholder="Detalle qué incluye el combo..." class="form-textarea"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
              <button type="button" (click)="isKitModalOpen.set(false)" class="btn btn--ghost">Cancelar</button>
              <button type="submit" [disabled]="kitForm.invalid" class="btn btn--primary">
                Armar y Publicar Kit
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class BodegaDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private wsService = inject(WebsocketService);

  Math = Math;
  activeTab = signal<'KITTING' | 'LOTES' | 'DEVOLUCION_CLIENTE'>('KITTING');

  lotes = signal<any[]>([]);
  alertasKitting = signal<any[]>([]);
  isKitModalOpen = signal<boolean>(false);
  devolucionesClienteCount = signal<number>(0);
  devolucionesPendientesCount = signal<number>(0);

  kitForm = this.fb.group({
    nombrePromocion: ['', Validators.required],
    codigoLoteRef: ['', Validators.required],
    descuentoGlobal: [20, [Validators.required, Validators.min(1), Validators.max(80)]],
    descripcion: ['Combo empaquetado en almacén para rotación acelerada FEFO', Validators.required]
  });

  devClienteForm = this.fb.group({
    idLote: [null as number | null, Validators.required],
    idPedidoOriginal: [''],
    cantidad: [5, [Validators.required, Validators.min(1)]],
    motivo: ['Devolución de cajas intactas por sobrante en finca', Validators.required]
  });

  totalUnidadesStock = computed(() => {
    return this.lotes().reduce((acc, l) => acc + (l.cantidadActual || 0), 0);
  });

  ngOnInit(): void {
    this.loadAll();
    
    // Suscripción WebSocket para despachos y recepciones
    this.wsService.subscribe('/topic/bodega/recepciones', (mensaje) => {
      if (mensaje.tipo === 'RECEPCION_COMPRA') {
        this.toast.success(
          '¡Nueva Recepción de Compra!', 
          `Orden #${mensaje.idOrden} - ${mensaje.proveedor}: ${mensaje.mensaje}`
        );
        this.loadAll(); // Recargar datos si es necesario (ej. si hay que ubicar lotes flotantes)
      }
    });

    this.wsService.subscribe('/topic/bodega/devoluciones', (mensaje) => {
      if (mensaje.tipo === 'DEVOLUCION_EN_TRANSITO') {
        this.toast.info(
          'Devolución en Tránsito', 
          `Se reportó una devolución (ID: ${mensaje.idDevolucion}) de la Venta #${mensaje.idVenta}. Prepare espacio en bodega.`
        );
        this.loadAll(); // Recargar contador
      }
    });
  }

  loadAll(): void {
    this.operacionesService.listarLotesDisponiblesFefo().subscribe(data => this.lotes.set(data));
    this.operacionesService.listarAlertas().subscribe(res => this.alertasKitting.set(res.content));
    this.operacionesService.listarDevolucionesPendientesBodega(0, 1).subscribe(page => this.devolucionesPendientesCount.set(page.totalElements));
  }

  armarKitDesdeAlerta(alerta: any): void {
    const payload = {
      nombrePromocion: `Kit Rotación Rápida: ${alerta.nombreProducto}`,
      codigoLoteRef: alerta.codigoLote,
      descuentoGlobal: alerta.sugerenciaDescuento || 20,
      descripcion: `Kit empaquetado en almacén por alerta de caducidad en ${alerta.diasRestantes} días. Lote ${alerta.codigoLote}.`
    };

    this.operacionesService.crearComboKit(payload).subscribe({
      next: (res) => {
        this.toast.success('Kit Armado y Publicado', 'El combo está ahora activo en la pantalla de los Técnicos-Comerciales para su venta inmediata.');
        this.loadAll();
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Error al armar el kit.');
      }
    });
  }

  openNuevoKitModal(): void {
    if (this.lotes().length > 0) {
      this.kitForm.patchValue({ codigoLoteRef: this.lotes()[0].numeroLote });
    }
    this.isKitModalOpen.set(true);
  }

  onSaveKit(): void {
    if (this.kitForm.invalid) return;
    this.operacionesService.crearComboKit(this.kitForm.value).subscribe({
      next: (res) => {
        this.toast.success('Kit Personalizado Creado', 'El combo ya está en el catálogo del Técnico-Comercial.');
        this.isKitModalOpen.set(false);
        this.kitForm.reset({ descuentoGlobal: 20, descripcion: 'Combo empaquetado en almacén para rotación acelerada FEFO' });
        this.loadAll();
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Error al guardar kit.');
      }
    });
  }

  onSaveDevolucionCliente(): void {
    if (this.devClienteForm.invalid) return;
    const payload = {
      ...this.devClienteForm.value,
      idUsuario: this.authService.currentUser()?.idUsuario || 3
    };

    this.operacionesService.registrarDevolucionCliente(payload).subscribe({
      next: (res) => {
        this.toast.success('Reingreso Exitoso', 'La cantidad devuelta se ha sumado de inmediato al stock del lote.');
        this.devolucionesClienteCount.update((c: number) => c + 1);
        this.devClienteForm.reset({ cantidad: 5, motivo: 'Devolución de cajas intactas por sobrante en finca' });
        this.loadAll();
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'No se pudo reingresar el stock.');
      }
    });
  }
}
