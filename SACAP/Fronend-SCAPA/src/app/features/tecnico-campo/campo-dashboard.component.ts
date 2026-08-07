import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-campo-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6 animate-fade-in min-h-screen bg-slate-50/50">
      <!-- Cabecera Verde del Técnico-Comercial -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-[#0B4628] to-teal-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-4 z-10">
          <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <lucide-icon name="user-check" class="w-8 h-8"></lucide-icon>
          </div>
          <div>
            <span class="inline-block px-2.5 py-0.5 bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-1">Rol: Técnico-Comercial</span>
            <h1 class="text-2xl font-bold tracking-tight">Gestión Agronómica & Ventas en Campo</h1>
            <p class="text-xs text-green-100/80 mt-0.5">Técnico asignado: {{ authService.currentUser()?.correo || 'tecnico@agrosense.ec' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 z-10">
          <!-- Navegación de Tabs del Técnico -->
          <div class="bg-black/20 p-1.5 rounded-2xl flex items-center gap-1 backdrop-blur-md">
            <button (click)="activeTab.set('combos')" 
                    [class]="activeTab() === 'combos' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="zap" class="w-4 h-4 text-amber-400"></lucide-icon>
              <span>Combos IA</span>
            </button>
            <button (click)="activeTab.set('receta')" 
                    [class]="activeTab() === 'receta' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="file-plus" class="w-4 h-4 text-emerald-400"></lucide-icon>
              <span>Generar Pedido & Receta</span>
            </button>
            <button (click)="activeTab.set('historial')" 
                    [class]="activeTab() === 'historial' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="clipboard-list" class="w-4 h-4 text-teal-400"></lucide-icon>
              <span>Historial de Pedidos</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: CATÁLOGO Y COMBOS IA (INICIO) -->
      @if (activeTab() === 'combos') {
        <div class="space-y-6 animate-fade-in">
          <div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <lucide-icon name="sparkles" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-gray-900 text-base">Recomendaciones de Venta Inteligente (IA AgroSense)</h3>
                <p class="text-xs text-gray-600">Promociones estratégicas generadas para empujar lotes próximos a vencer. Úselas al visitar fincas para lograr rotación FEFO rápida.</p>
              </div>
            </div>
            <span class="px-3 py-1.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
              <lucide-icon name="flame" class="w-4 h-4 text-amber-600"></lucide-icon>
              <span>{{ combosActivos().length }} Promociones Activas para Hoy</span>
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (combo of combosActivos(); track combo.idPromocion) {
              <div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group">
                <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div class="p-5 space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <span class="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-[11px] rounded-lg tracking-wide flex items-center gap-1">
                      <lucide-icon name="tag" class="w-3.5 h-3.5"></lucide-icon> DESCUENTO -{{ combo.descuentoGlobal }}%
                    </span>
                    <span class="px-2 py-0.5 bg-green-50 text-green-700 font-bold text-[10px] rounded-md border border-green-200">
                      Vigente hasta {{ combo.fechaFin }}
                    </span>
                  </div>

                  <h4 class="font-black text-gray-900 text-lg leading-snug">{{ combo.nombrePromocion }}</h4>
                  <p class="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">{{ combo.descripcion }}</p>

                  <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-600">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-gray-400 block">Lote Recomendado</span>
                      <span class="font-bold text-gray-800">{{ combo.codigoLoteRef }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] uppercase font-bold text-gray-400 block">Stock Disponible</span>
                      <span class="font-black text-[#0B4628]">{{ combo.stockLote }} unds</span>
                    </div>
                  </div>
                </div>

                <div class="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button (click)="seleccionarComboParaReceta(combo)"
                          class="w-full py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <lucide-icon name="arrow-right-circle" class="w-4 h-4"></lucide-icon>
                    <span>Generar Pedido con este Combo</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="col-span-full bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-400">
                <lucide-icon name="package-check" class="w-12 h-12 mx-auto mb-3 opacity-40"></lucide-icon>
                <p class="font-bold text-gray-600 text-base">No hay combos IA activos en este momento</p>
                <p class="text-xs text-gray-400 mt-1">El Supervisor o el Bodeguero pueden aprobar nuevas promociones desde su panel.</p>
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

      <!-- TAB 3: HISTORIAL DE PEDIDOS Y USO EN CAMPO -->
      @if (activeTab() === 'historial') {
        <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5 animate-fade-in">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 class="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <lucide-icon name="clipboard-list" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                <span>Historial de Órdenes de Pedido Generadas</span>
              </h3>
              <p class="text-xs text-gray-500">Seguimiento en tiempo real del estado de sus pedidos en Bodega y despachos a clientes.</p>
            </div>
            <button (click)="cargarPedidos()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="refresh-cw" class="w-3.5 h-3.5"></lucide-icon>
              <span>Actualizar Estado</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th class="py-3.5 px-4">Pedido # / Fecha</th>
                  <th class="py-3.5 px-4">Cliente / Finca</th>
                  <th class="py-3.5 px-4">Diagnóstico Agronómico</th>
                  <th class="py-3.5 px-4">Insumo & Cantidad</th>
                  <th class="py-3.5 px-4">Estado en Bodega</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (ped of pedidos(); track ped.idUso) {
                  <tr class="hover:bg-green-50/30 transition-colors">
                    <td class="py-4 px-4">
                      <span class="font-mono font-bold text-gray-900 block">ORD-{{ ped.idUso }}</span>
                      <span class="text-xs text-gray-500">{{ ped.fechaAplicacion }}</span>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-extrabold text-gray-900">{{ ped.cliente?.nombreFinca || 'Finca Cliente' }}</div>
                      <div class="text-xs font-mono text-emerald-700">CI: {{ ped.cliente?.cedula || 'N/A' }}</div>
                    </td>
                    <td class="py-4 px-4 max-w-xs">
                      <p class="text-xs text-gray-700 line-clamp-2 font-medium">{{ ped.descripcionPlaga || ped.observacion }}</p>
                      @if (ped.idComboAplicado) {
                        <span class="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">Combo IA #{{ ped.idComboAplicado }}</span>
                      }
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-bold text-gray-800">{{ ped.lote?.nombreProducto || ped.lote?.producto?.nombre || 'Agroquímico' }}</div>
                      <div class="text-xs font-mono text-gray-500">Lote: {{ ped.lote?.numeroLote || ped.idLote }}</div>
                      <div class="font-black text-[#0B4628] mt-0.5">{{ ped.cantidadUsada || ped.cantidad }} unds</div>
                    </td>
                    <td class="py-4 px-4">
                      @if (ped.idEstadoPedido === 1) {
                        <span class="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 border border-amber-200">
                          <lucide-icon name="clock" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Pendiente Bodega</span>
                        </span>
                      } @else if (ped.idEstadoPedido === 2) {
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 border border-emerald-200">
                          <lucide-icon name="check-circle" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Despachado al Cliente</span>
                        </span>
                      } @else if (ped.idEstadoPedido === 5) {
                        <span class="px-3 py-1 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 border border-purple-200">
                          <lucide-icon name="rotate-ccw" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Devuelto por Cliente</span>
                        </span>
                      } @else {
                        <span class="px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl">Registrado</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-12 text-center text-gray-400">
                      <lucide-icon name="clipboard-x" class="w-12 h-12 mx-auto mb-2 opacity-40"></lucide-icon>
                      <p class="font-bold text-sm text-gray-600">No ha generado órdenes de pedido aún en esta jornada</p>
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

  activeTab = signal<'combos' | 'receta' | 'historial'>('combos');

  combosActivos = signal<any[]>([]);
  clientes = signal<any[]>([]);
  lotesDisponibles = signal<any[]>([]);
  pedidos = signal<any[]>([]);

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
    this.cargarPedidos();
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
