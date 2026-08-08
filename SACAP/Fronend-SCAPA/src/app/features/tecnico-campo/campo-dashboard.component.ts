import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { VentasService } from '../../core/services/ventas.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-campo-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
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
                    DESCUENTO -{{ combo.descuentoGlobal }}%
                  </span>
                  <span class="combo-card__date">
                    Hasta {{ combo.fechaFin }}
                  </span>
                </div>

                <div class="combo-card__body">
                  <h4 class="combo-card__title">{{ combo.nombrePromocion }}</h4>
                  <p class="combo-card__desc">{{ combo.descripcion }}</p>

                  <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--c-warm-black);">
                    <div>
                      <strong style="text-transform: uppercase;">Lote Referencia:</strong>
                      <span>{{ combo.codigoLoteRef }}</span>
                    </div>
                    <div>
                      <strong style="text-transform: uppercase;">Stock:</strong>
                      <span style="color: var(--c-dark-green); font-weight: 700;">{{ combo.stockLote }} unds</span>
                    </div>
                  </div>
                </div>

                <div class="combo-card__footer">
                  <button (click)="router.navigate(['/admin/ventas/dashboard'])" class="btn btn--primary" style="width: 100%;">
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

      <!-- TAB 2: DIAGNÓSTICO Y RECETA (VENTAS / PEDIDOS) -->
      @if (activeTab() === 'receta') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <!-- Columna Izquierda: Selección o Creación de Cliente -->
          <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 class="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <lucide-icon name="users" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                  <span>1. Datos del Cliente / Finca</span>
                </h3>
                <p class="text-xs text-gray-500">Seleccione un cliente registrado por cédula o registre uno nuevo en campo.</p>
              </div>
              <button (click)="toggleNuevoCliente()" 
                      class="px-3 py-1.5 bg-green-50 text-[#0B4628] hover:bg-green-100 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer">
                <lucide-icon [name]="isNuevoCliente() ? 'list' : 'user-plus'" class="w-3.5 h-3.5"></lucide-icon>
                <span>{{ isNuevoCliente() ? 'Seleccionar Existente' : '+ Nuevo Cliente' }}</span>
              </button>
            </div>

            @if (!isNuevoCliente()) {
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1.5">Seleccionar Cliente / Dueño de Finca</label>
                  <select [(ngModel)]="selectedIdCliente" (change)="onSelectCliente()"
                          class="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:border-[#0B4628] outline-none bg-gray-50/80">
                    <option [ngValue]="null" disabled>-- Seleccione por Cédula / Finca --</option>
                    @for (c of clientes(); track c.idCliente) {
                      <option [value]="c.idCliente">{{ c.nombreFinca }} (Cédula: {{ c.cedula }})</option>
                    }
                  </select>
                </div>

                @if (clienteSeleccionado()) {
                  <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-gray-500 uppercase text-[10px]">Cédula Identidad:</span>
                      <span class="font-mono font-bold text-gray-900">{{ clienteSeleccionado().cedula }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-gray-500 uppercase text-[10px]">Teléfono:</span>
                      <span class="font-bold text-gray-800">{{ clienteSeleccionado().telefono || 'No registrado' }}</span>
                    </div>
                    <div class="pt-1 border-t border-emerald-200/50 text-gray-600">
                      <span class="font-bold text-gray-500 uppercase text-[10px] block">Dirección / Ubicación:</span>
                      <span class="font-medium text-gray-800">{{ clienteSeleccionado().direccion || 'Sin dirección' }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <!-- Formulario de Creación de Nuevo Cliente -->
              <form [formGroup]="clienteForm" (ngSubmit)="onSaveCliente()" class="space-y-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-[#0B4628] uppercase">Registro en Finca</span>
                  <span class="text-[10px] text-gray-500">Cédula 10 dígitos (No RUC)</span>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Cédula de Identidad *</label>
                  <input type="text" formControlName="cedula" placeholder="ej. 1204567890" maxlength="13"
                         class="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-mono font-bold focus:border-[#0B4628] outline-none bg-white">
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Nombre de la Finca o Dueño *</label>
                  <input type="text" formControlName="nombreFinca" placeholder="ej. Hacienda El Rocío - Cacao"
                         class="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none bg-white">
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Teléfono</label>
                    <input type="text" formControlName="telefono" placeholder="0987654321"
                           class="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:border-[#0B4628] outline-none bg-white">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Sector / Dirección</label>
                    <input type="text" formControlName="direccion" placeholder="Vía Quevedo Km 5"
                           class="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:border-[#0B4628] outline-none bg-white">
                  </div>
                </div>

                <button type="submit" [disabled]="clienteForm.invalid"
                        class="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                  <span>Guardar y Seleccionar Cliente</span>
                </button>
              </form>
            }
          </div>

          <!-- Columna Derecha (2 columnas en desktop): Formulario de Receta Agronómica y Pedido -->
          <div class="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 class="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <lucide-icon name="clipboard-check" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                  <span>2. Diagnóstico Técnico & Selección de Insumos</span>
                </h3>
                <p class="text-xs text-gray-500">Al emitir el pedido, el stock queda reservado para despacho por el Bodeguero.</p>
              </div>
              @if (comboAplicadoInfo()) {
                <span class="px-3 py-1.5 bg-amber-100 text-amber-900 font-black text-xs rounded-xl flex items-center gap-1.5 animate-pulse">
                  <lucide-icon name="zap" class="w-4 h-4 text-amber-600"></lucide-icon>
                  <span>Combo IA Aplicado: #{{ comboAplicadoInfo().idPromocion }}</span>
                  <button (click)="limpiarComboAplicado()" class="ml-1 text-amber-900/60 hover:text-amber-900">×</button>
                </span>
              }
            </div>

            <form [formGroup]="pedidoForm" (ngSubmit)="onSavePedido()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Diagnóstico Agronómico / Descripción de la Plaga o Síntoma *</label>
                <textarea formControlName="descripcionPlaga" rows="2" placeholder="ej. Brote severo de pudrición negra y moniliasis en mazorcas en desarrollo. Se prescribe tratamiento preventivo-curativo inmediato..."
                          class="w-full p-3 border border-gray-300 rounded-xl text-sm font-medium focus:border-[#0B4628] outline-none bg-gray-50/50"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Producto / Lote a Despachar (FEFO) *</label>
                  <select formControlName="idLote" class="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none bg-gray-50">
                    <option [ngValue]="null" disabled>-- Seleccione agroquímico disponible --</option>
                    @for (lote of lotesDisponibles(); track lote.idLote) {
                      <option [value]="lote.idLote">{{ lote.nombreProducto }} | Lote: {{ lote.numeroLote }} (Disp: {{ (lote.cantidadActual || 0) - (lote.cantidadReservada || 0) }} unds)</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Cantidad Solic. *</label>
                  <input type="number" formControlName="cantidad" placeholder="ej. 15" min="1"
                         class="w-full p-3 border border-gray-300 rounded-xl text-sm font-black text-[#0B4628] focus:border-[#0B4628] outline-none bg-gray-50">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Instrucciones de Aplicación / Observaciones para Bodega</label>
                <input type="text" formControlName="observacion" placeholder="ej. Aplicar en aspersión 2L/ha. Despachar en envases sellados."
                       class="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:border-emerald-600 outline-none">
              </div>

              <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-xs text-gray-500">
                  <span class="font-bold text-gray-700">Nota técnica:</span> El bodeguero verificará la orden en la pestaña de Despachos y aplicará FEFO.
                </div>
                <button type="submit" [disabled]="pedidoForm.invalid || (!selectedIdCliente && !clienteSeleccionado())"
                        class="w-full sm:w-auto px-8 py-3 bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <lucide-icon name="send" class="w-4 h-4"></lucide-icon>
                  <span>Emitir Orden de Pedido / Receta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- TAB 3: HISTORIAL DE VENTAS -->
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
  private fb = inject(FormBuilder);
  router = inject(Router);

  activeTab = signal<'combos' | 'receta' | 'historial'>('combos');

  combosActivos = signal<any[]>([]);
  clientes = signal<any[]>([]);
  lotesDisponibles = signal<any[]>([]);
  pedidos = signal<any[]>([]);
  ventas = signal<any[]>([]);

  selectedIdCliente = signal<number | null>(1);
  isNuevoCliente = signal<boolean>(false);
  comboAplicadoInfo = signal<any | null>(null);

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

  ngOnInit(): void {
    this.cargarCombos();
    this.cargarClientes();
    this.cargarLotes();
    this.cargarVentas();
  }

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

  cargarVentas(): void {
    this.ventasService.misVentas().subscribe(data => this.ventas.set(data));
  }

  verDetalleVenta(idVenta: number): void {
    this.router.navigate(['/admin/ventas/confirmacion', idVenta]);
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
