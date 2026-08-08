import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-campo-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  styleUrl: './campo-dashboard.component.css',
  template: `
    <div class="campo-page animate-fade-in">
      <!-- MAIN CONTENT -->
        <header class="campo-header">
          <div class="campo-header__info">
            <h1 class="campo-header__title">Gestión Agronómica & Ventas en Campo</h1>
            <p class="campo-header__subtitle">Técnico asignado: {{ authService.currentUser()?.correo || 'tecnico@agrosense.ec' }}</p>
          </div>
        </header>

        <!-- TAB 1: CATÁLOGO Y COMBOS IA (INICIO) -->
        @if (activeTab() === 'combos') {
        <div class="animate-fade-in">
          <div class="combos-banner">
            <div class="combos-banner__info">
              <div class="combos-banner__icon">
                <lucide-icon name="sparkles"></lucide-icon>
              </div>
              <div>
                <h3 class="section-title">Recomendaciones de Venta Inteligente (IA AgroSense)</h3>
                <p class="section-subtitle">Promociones estratégicas generadas para empujar lotes próximos a vencer. Úselas al visitar fincas para lograr rotación FEFO rápida.</p>
              </div>
            </div>
            <span class="combos-banner__badge">
              <lucide-icon name="flame" class="w-4 h-4"></lucide-icon>
              <span>{{ combosActivos().length }} Promociones Activas para Hoy</span>
            </span>
          </div>

          <div class="combos-grid">
            @for (combo of combosActivos(); track combo.idPromocion) {
              <div class="combo-card">
                <div class="combo-card__body">
                  <div class="combo-card__header">
                    <span class="combo-badge-discount">
                      <lucide-icon name="tag" class="w-3.5 h-3.5"></lucide-icon> DESCUENTO -{{ combo.descuentoGlobal }}%
                    </span>
                    <span class="combo-badge-vigente">
                      Vigente hasta {{ combo.fechaFin }}
                    </span>
                  </div>

                  <h4 class="combo-card__title">{{ combo.nombrePromocion }}</h4>
                  <p class="combo-card__desc">{{ combo.descripcion }}</p>

                  <div class="combo-card__meta">
                    <div>
                      <span class="combo-meta-label">Lote Recomendado</span>
                      <span class="combo-meta-value">{{ combo.codigoLoteRef }}</span>
                    </div>
                    <div style="text-align: right">
                      <span class="combo-meta-label">Stock Disponible</span>
                      <span class="combo-meta-value" style="color: var(--c-dark-green)">{{ combo.stockLote }} unds</span>
                    </div>
                  </div>
                </div>

                <div class="combo-card__footer">
                  <button (click)="seleccionarComboParaReceta(combo)" class="btn-primary btn-primary-small">
                    <lucide-icon name="arrow-right-circle" class="w-4 h-4"></lucide-icon>
                    <span>Generar Pedido con este Combo</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon"><lucide-icon name="package-check"></lucide-icon></div>
                <h3 class="empty-state__title">No hay combos IA activos en este momento</h3>
                <p class="empty-state__desc">El Supervisor o el Bodeguero pueden aprobar nuevas promociones desde su panel.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: DIAGNÓSTICO Y RECETA (VENTAS / PEDIDOS) -->
      @if (activeTab() === 'receta') {
        <div class="grid-receta animate-fade-in">
          <!-- Columna Izquierda: Selección o Creación de Cliente -->
          <div class="card-section">
            <div class="card-section__header">
              <div>
                <h3 class="section-title">
                  <lucide-icon name="users" class="w-5 h-5"></lucide-icon>
                  <span>1. Datos del Cliente / Finca</span>
                </h3>
                <p class="section-subtitle">Seleccione un cliente registrado por cédula o registre uno nuevo en campo.</p>
              </div>
              <button (click)="toggleNuevoCliente()" class="btn-secondary">
                <lucide-icon [name]="isNuevoCliente() ? 'list' : 'user-plus'" class="w-3.5 h-3.5"></lucide-icon>
                <span>{{ isNuevoCliente() ? 'Seleccionar Existente' : '+ Nuevo Cliente' }}</span>
              </button>
            </div>

            @if (!isNuevoCliente()) {
              <div class="form-group">
                <label class="form-label">Seleccionar Cliente / Dueño de Finca</label>
                <select [(ngModel)]="selectedIdCliente" (change)="onSelectCliente()" class="form-select">
                  <option [ngValue]="null" disabled>-- Seleccione por Cédula / Finca --</option>
                  @for (c of clientes(); track c.idCliente) {
                    <option [value]="c.idCliente">{{ c.nombreFinca }} (Cédula: {{ c.cedula }})</option>
                  }
                </select>
              </div>

              @if (clienteSeleccionado()) {
                <div class="client-detail">
                  <div class="client-detail-row">
                    <span class="client-detail-label">Cédula Identidad:</span>
                    <span class="client-detail-value form-input--mono">{{ clienteSeleccionado().cedula }}</span>
                  </div>
                  <div class="client-detail-row">
                    <span class="client-detail-label">Teléfono:</span>
                    <span class="client-detail-value">{{ clienteSeleccionado().telefono || 'No registrado' }}</span>
                  </div>
                  <div class="client-detail-address">
                    <span class="client-detail-label">Dirección / Ubicación:</span>
                    <span class="client-detail-value">{{ clienteSeleccionado().direccion || 'Sin dirección' }}</span>
                  </div>
                </div>
              }
            } @else {
              <!-- Formulario de Creación de Nuevo Cliente -->
              <form [formGroup]="clienteForm" (ngSubmit)="onSaveCliente()" class="form-creation-container">
                <div class="form-creation-header">
                  <span class="form-creation-title">Registro en Finca</span>
                  <span style="font-size: 0.625rem; color: var(--c-text-muted);">Cédula 10 dígitos (No RUC)</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Cédula de Identidad *</label>
                  <input type="text" formControlName="cedula" placeholder="ej. 1204567890" maxlength="13" class="form-input form-input--mono">
                </div>

                <div class="form-group">
                  <label class="form-label">Nombre de la Finca o Dueño *</label>
                  <input type="text" formControlName="nombreFinca" placeholder="ej. Hacienda El Rocío - Cacao" class="form-input">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="text" formControlName="telefono" placeholder="0987654321" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Sector / Dirección</label>
                    <input type="text" formControlName="direccion" placeholder="Vía Quevedo Km 5" class="form-input">
                  </div>
                </div>

                <button type="submit" [disabled]="clienteForm.invalid" class="btn-primary">
                  <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                  <span>Guardar y Seleccionar Cliente</span>
                </button>
              </form>
            }
          </div>

          <!-- Columna Derecha: Formulario de Receta Agronómica y Pedido -->
          <div class="card-section">
            <div class="card-section__header">
              <div>
                <h3 class="section-title">
                  <lucide-icon name="clipboard-check" class="w-5 h-5"></lucide-icon>
                  <span>2. Diagnóstico Técnico & Selección de Insumos</span>
                </h3>
                <p class="section-subtitle">Al emitir el pedido, el stock queda reservado para despacho por el Bodeguero.</p>
              </div>
              @if (comboAplicadoInfo()) {
                <span class="badge-combo-applied">
                  <lucide-icon name="zap" class="w-4 h-4"></lucide-icon>
                  <span>Combo IA Aplicado: #{{ comboAplicadoInfo().idPromocion }}</span>
                  <button (click)="limpiarComboAplicado()" class="btn-ghost-small">×</button>
                </span>
              }
            </div>

            <form [formGroup]="pedidoForm" (ngSubmit)="onSavePedido()">
              <div class="form-group">
                <label class="form-label">Diagnóstico Agronómico / Descripción de la Plaga o Síntoma *</label>
                <textarea formControlName="descripcionPlaga" rows="2" placeholder="ej. Brote severo de pudrición negra y moniliasis..." class="form-textarea"></textarea>
              </div>

              <div class="form-row-3col">
                <div class="form-group">
                  <label class="form-label">Producto / Lote a Despachar (FEFO) *</label>
                  <select formControlName="idLote" class="form-select">
                    <option [ngValue]="null" disabled>-- Seleccione agroquímico disponible --</option>
                    @for (lote of lotesDisponibles(); track lote.idLote) {
                      <option [value]="lote.idLote">{{ lote.nombreProducto }} | Lote: {{ lote.numeroLote }} (Disp: {{ (lote.cantidadActual || 0) - (lote.cantidadReservada || 0) }} unds)</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Cantidad Solic. *</label>
                  <input type="number" formControlName="cantidad" placeholder="ej. 15" min="1" class="form-input" style="color: var(--c-dark-green)">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Instrucciones de Aplicación / Observaciones para Bodega</label>
                <input type="text" formControlName="observacion" placeholder="ej. Aplicar en aspersión 2L/ha." class="form-input">
              </div>

              <div class="form-footer">
                <div class="form-footer-note">
                  <span style="font-weight: 700; color: var(--c-warm-black);">Nota técnica:</span> El bodeguero verificará la orden en la pestaña de Despachos y aplicará FEFO.
                </div>
                <button type="submit" [disabled]="pedidoForm.invalid || (!selectedIdCliente && !clienteSeleccionado())" class="btn-primary" style="width: auto;">
                  <lucide-icon name="send" class="w-4 h-4"></lucide-icon>
                  <span>Emitir Orden de Pedido / Receta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- TAB 3: HISTORIAL DE PEDIDOS Y USO EN CAMPO -->
      @if (activeTab() === 'historial') {
        <div class="card-section animate-fade-in">
          <div class="card-section__header">
            <div>
              <h3 class="section-title">
                <lucide-icon name="clipboard-list" class="w-5 h-5"></lucide-icon>
                <span>Historial de Órdenes de Pedido Generadas</span>
              </h3>
              <p class="section-subtitle">Seguimiento en tiempo real del estado de sus pedidos en Bodega y despachos a clientes.</p>
            </div>
            <button (click)="cargarPedidos()" class="btn-secondary">
              <lucide-icon name="refresh-cw" class="w-3.5 h-3.5"></lucide-icon>
              <span>Actualizar Estado</span>
            </button>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pedido # / Fecha</th>
                  <th>Cliente / Finca</th>
                  <th>Diagnóstico Agronómico</th>
                  <th>Insumo & Cantidad</th>
                  <th>Estado en Bodega</th>
                </tr>
              </thead>
              <tbody>
                @for (ped of pedidos(); track ped.idUso) {
                  <tr>
                    <td>
                      <span class="td-main-text form-input--mono">ORD-{{ ped.idUso }}</span><br>
                      <span class="td-sub-text">{{ ped.fechaAplicacion }}</span>
                    </td>
                    <td>
                      <div class="td-main-text">{{ ped.cliente?.nombreFinca || 'Finca Cliente' }}</div>
                      <div class="td-sub-text form-input--mono" style="color: var(--c-mid-green)">CI: {{ ped.cliente?.cedula || 'N/A' }}</div>
                    </td>
                    <td style="max-width: 250px;">
                      <p class="td-desc-text">{{ ped.descripcionPlaga || ped.observacion }}</p>
                      @if (ped.idComboAplicado) {
                        <span class="badge-combo-applied" style="padding: 0.125rem 0.375rem; font-size: 0.625rem; margin-top: 0.25rem;">Combo IA #{{ ped.idComboAplicado }}</span>
                      }
                    </td>
                    <td>
                      <div class="td-main-text">{{ ped.lote?.nombreProducto || ped.lote?.producto?.nombre || 'Agroquímico' }}</div>
                      <div class="td-sub-text form-input--mono">Lote: {{ ped.lote?.numeroLote || ped.idLote }}</div>
                      <div class="td-amount">{{ ped.cantidadUsada || ped.cantidad }} unds</div>
                    </td>
                    <td>
                      @if (ped.idEstadoPedido === 1) {
                        <span class="badge-status badge-pendiente">
                          <lucide-icon name="clock" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Pendiente Bodega</span>
                        </span>
                      } @else if (ped.idEstadoPedido === 2) {
                        <span class="badge-status badge-despachado">
                          <lucide-icon name="check-circle" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Despachado al Cliente</span>
                        </span>
                      } @else if (ped.idEstadoPedido === 5) {
                        <span class="badge-status badge-devuelto">
                          <lucide-icon name="rotate-ccw" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Devuelto por Cliente</span>
                        </span>
                      } @else {
                        <span class="badge-status badge-default">Registrado</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5">
                      <div class="empty-state">
                        <div class="empty-state__icon"><lucide-icon name="clipboard-x"></lucide-icon></div>
                        <p class="td-main-text">No ha generado órdenes de pedido aún en esta jornada</p>
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
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  activeTab = signal<'combos' | 'receta' | 'historial'>('combos');

  combosActivos = signal<any[]>([]);
  clientes = signal<any[]>([]);
  lotesDisponibles = signal<any[]>([]);
  pedidos = signal<any[]>([]);

  irANuevoCliente() {
    this.activeTab.set('receta');
    this.isNuevoCliente.set(true);
  }

  selectedIdCliente = signal<number | null>(1);
  isNuevoCliente = signal<boolean>(false);
  comboAplicadoInfo = signal<any | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab']);
      }
      if (params['action'] === 'nuevo-cliente') {
        this.isNuevoCliente.set(true);
      } else {
        this.isNuevoCliente.set(false);
      }
    });

    this.cargarCombos();
    this.cargarClientes();
    this.cargarLotes();
    this.cargarPedidos();
  }

  clienteForm = this.fb.group({
    cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
    nombreFinca: ['', Validators.required],
    telefono: ['0987654321'],
    direccion: ['Vía principal finca']
  });

  pedidoForm = this.fb.group({
    descripcionPlaga: ['Brote moderado de moniliasis / control preventivo fúngico en follaje', Validators.required],
    idLote: [null as number | null, Validators.required],
    cantidad: [10, [Validators.required, Validators.min(1)]],
    observacion: ['Aplicación recomendada por el técnico']
  });

  clienteSeleccionado = computed(() => {
    const id = this.selectedIdCliente();
    if (!id) return null;
    return this.clientes().find(c => c.idCliente === Number(id)) || null;
  });

  cargarCombos(): void {
    this.operacionesService.listarCombosActivos().subscribe(data => this.combosActivos.set(data));
  }

  cargarClientes(): void {
    this.operacionesService.listarClientes().subscribe(data => {
      this.clientes.set(data);
      if (data.length > 0 && !this.selectedIdCliente()) {
        this.selectedIdCliente.set(data[0].idCliente);
      }
    });
  }

  cargarLotes(): void {
    this.operacionesService.listarLotesDisponiblesFefo().subscribe(data => this.lotesDisponibles.set(data));
  }

  cargarPedidos(): void {
    const userId = this.authService.currentUser()?.idUsuario || 1;
    this.operacionesService.listarPedidosPorTecnico(userId).subscribe(data => this.pedidos.set(data));
  }

  onSelectCliente(): void {
    // Al seleccionar cliente existente en el dropdown, se actualiza la vista computable
  }

  toggleNuevoCliente(): void {
    this.isNuevoCliente.set(!this.isNuevoCliente());
  }

  onSaveCliente(): void {
    if (this.clienteForm.invalid) return;
    const payload = {
      ...this.clienteForm.value,
      idTecnico: this.authService.currentUser()?.idUsuario || 1
    };
    this.operacionesService.crearCliente(payload).subscribe({
      next: (res) => {
        this.toast.success('Finca Registrada', 'El nuevo cliente se guardó con su cédula.');
        this.cargarClientes();
        if (res.cliente) {
          this.selectedIdCliente.set(res.cliente.idCliente);
        }
        this.isNuevoCliente.set(false);
        this.clienteForm.reset({ telefono: '0987654321', direccion: 'Vía principal finca' });
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Error al guardar cliente.');
      }
    });
  }

  seleccionarComboParaReceta(combo: any): void {
    this.comboAplicadoInfo.set(combo);
    const loteEncontrado = this.lotesDisponibles().find(l => l.numeroLote === combo.codigoLoteRef || l.idLote === combo.idLoteRef);

    this.pedidoForm.patchValue({
      descripcionPlaga: `Prescripción basada en ${combo.nombrePromocion}: ${combo.descripcion}`,
      idLote: loteEncontrado ? loteEncontrado.idLote : (this.lotesDisponibles().length > 0 ? this.lotesDisponibles()[0].idLote : null),
      cantidad: 10,
      observacion: `Descuento -${combo.descuentoGlobal}% aplicado según combo IA`
    });

    this.activeTab.set('receta');
    this.toast.info('Combo Seleccionado', `Se ha precargado la receta y el lote para ${combo.nombrePromocion}.`);
  }

  limpiarComboAplicado(): void {
    this.comboAplicadoInfo.set(null);
  }

  onSavePedido(): void {
    const idCli = this.selectedIdCliente();
    if (!idCli || this.pedidoForm.invalid) {
      this.toast.warning('Atención', 'Seleccione una finca/cliente y complete el diagnóstico.');
      return;
    }

    const payload = {
      idCliente: Number(idCli),
      descripcionPlaga: this.pedidoForm.value.descripcionPlaga,
      idLote: Number(this.pedidoForm.value.idLote),
      cantidad: Number(this.pedidoForm.value.cantidad),
      observacion: this.pedidoForm.value.observacion,
      idTecnico: this.authService.currentUser()?.idUsuario || 1,
      idComboAplicado: this.comboAplicadoInfo() ? this.comboAplicadoInfo().idPromocion : null
    };

    this.operacionesService.crearOrdenPedido(payload).subscribe({
      next: (res) => {
        this.toast.success('Orden de Pedido Emitida', 'Stock reservado en bodega. El bodeguero podrá despachar en su panel.');
        this.pedidoForm.reset({
          descripcionPlaga: 'Control preventivo agroquímico en lote principal',
          cantidad: 10,
          observacion: 'Despacho FEFO requerido'
        });
        this.limpiarComboAplicado();
        this.cargarPedidos();
        this.cargarLotes();
        this.activeTab.set('historial');
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'No se pudo generar la orden de pedido.');
      }
    });
  }
}
