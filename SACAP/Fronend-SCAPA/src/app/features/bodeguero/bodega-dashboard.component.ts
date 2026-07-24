import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bodega-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6 animate-fade-in min-h-screen bg-slate-50/50">
      <!-- Cabecera Verde/Esmeralda del Bodeguero -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B4628] via-emerald-900 to-teal-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-4 z-10">
          <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <lucide-icon name="boxes" class="w-8 h-8"></lucide-icon>
          </div>
          <div>
            <span class="inline-block px-2.5 py-0.5 bg-green-400/20 text-green-200 text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-1">Rol: Bodeguero & Almacén</span>
            <h1 class="text-2xl font-bold tracking-tight">Kitting Físico, Despachos FEFO & Devoluciones</h1>
            <p class="text-xs text-green-100/80 mt-0.5">Operador en Bodega: {{ authService.currentUser()?.correo || 'bodega@agrosense.ec' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 z-10">
          <!-- Navegación de Pestañas Operativas -->
          <div class="bg-black/20 p-1.5 rounded-2xl flex flex-wrap items-center gap-1 backdrop-blur-md">
            <button (click)="activeTab.set('PEDIDOS_VENTAS')"
                    [class]="activeTab() === 'PEDIDOS_VENTAS' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="truck" class="w-4 h-4 text-emerald-400"></lucide-icon>
              <span>Despachos de Pedidos</span>
              @if (pedidosPendientes().length > 0) {
                <span class="px-1.5 py-0.2 bg-amber-400 text-amber-950 font-black rounded-full text-[10px]">{{ pedidosPendientes().length }}</span>
              }
            </button>
            <button (click)="activeTab.set('KITTING')"
                    [class]="activeTab() === 'KITTING' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="package-check" class="w-4 h-4 text-amber-400"></lucide-icon>
              <span>Armado de Kits (Combos IA)</span>
            </button>
            <button (click)="activeTab.set('LOTES')"
                    [class]="activeTab() === 'LOTES' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="list-ordered" class="w-4 h-4 text-teal-400"></lucide-icon>
              <span>Matriz Stock FEFO</span>
            </button>
            <button (click)="activeTab.set('DEVOLUCION_CLIENTE')"
                    [class]="activeTab() === 'DEVOLUCION_CLIENTE' ? 'bg-white text-[#0B4628] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'"
                    class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="rotate-ccw" class="w-4 h-4 text-purple-400"></lucide-icon>
              <span>Devolución Cliente</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjetas KPI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Órdenes por Despachar</p>
            <p class="text-2xl font-black text-amber-600 mt-1">{{ pedidosPendientes().length }}</p>
            <p class="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <lucide-icon name="clock" class="w-3.5 h-3.5"></lucide-icon> Reserva activa en stock
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <lucide-icon name="clipboard-check" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Alertas para Kitting</p>
            <p class="text-2xl font-black text-emerald-600 mt-1">{{ alertasKitting().length }}</p>
            <p class="text-[11px] text-emerald-600 font-medium mt-1">Lotes críticos en rotación</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <lucide-icon name="sparkles" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Total en Stock (FEFO)</p>
            <p class="text-2xl font-black text-gray-900 mt-1">{{ totalUnidadesStock() }} <span class="text-xs font-normal text-gray-500">unds</span></p>
            <p class="text-[11px] text-green-600 font-medium mt-1">Disponibles tras reservas</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-green-50 text-[#0B4628] flex items-center justify-center">
            <lucide-icon name="layers" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Devoluciones de Clientes</p>
            <p class="text-2xl font-black text-purple-600 mt-1">{{ devolucionesClienteCount() }}</p>
            <p class="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
              <lucide-icon name="check-circle" class="w-3.5 h-3.5"></lucide-icon> Stock sumado de inmediato
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <lucide-icon name="rotate-ccw" class="w-6 h-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- TAB 1: DESPACHOS DE PEDIDOS (VENTAS) -->
      @if (activeTab() === 'PEDIDOS_VENTAS') {
        <div class="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden animate-fade-in">
          <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 class="font-bold text-base text-gray-900 flex items-center gap-2">
                <lucide-icon name="truck" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                <span>Órdenes de Pedido Emitidas por Técnicos (Cola de Despacho)</span>
              </h3>
              <p class="text-xs text-gray-500">Al pulsar en "Despachar", el sistema libera la reserva, descuenta el stock del lote y genera la orden de salida al cliente.</p>
            </div>
            <button (click)="loadAll()" class="p-2 text-gray-500 hover:text-[#0B4628] rounded-xl hover:bg-white transition-all cursor-pointer" title="Actualizar">
              <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th class="py-3.5 px-4">Orden # / Fecha</th>
                  <th class="py-3.5 px-4">Finca / Cliente Destino</th>
                  <th class="py-3.5 px-4">Insumo & Lote FEFO</th>
                  <th class="py-3.5 px-4">Reservado</th>
                  <th class="py-3.5 px-4">Receta / Dosis Prescrita</th>
                  <th class="py-3.5 px-4 text-right">Acción Operativa</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (ped of pedidosPendientes(); track ped.idUso) {
                  <tr class="hover:bg-amber-50/30 transition-colors">
                    <td class="py-4 px-4 font-mono">
                      <span class="font-bold text-gray-900 block">ORD-{{ ped.idUso }}</span>
                      <span class="text-xs text-gray-500">{{ ped.fechaAplicacion }}</span>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-extrabold text-gray-900">{{ ped.cliente?.nombreFinca }}</div>
                      <div class="text-xs font-mono text-emerald-700">CI: {{ ped.cliente?.cedula }}</div>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-bold text-gray-800">{{ ped.lote?.nombreProducto || ped.lote?.producto?.nombre }}</div>
                      <div class="text-xs font-mono text-gray-500">Lote: {{ ped.lote?.numeroLote || ped.idLote }}</div>
                      <div class="text-[11px] text-gray-400 mt-0.5">{{ ped.lote?.ubicacionAlmacen }}</div>
                    </td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-1 bg-amber-100 text-amber-900 font-black rounded-lg text-xs">
                        {{ ped.cantidadUsada || ped.cantidadReservada }} unds
                      </span>
                    </td>
                    <td class="py-4 px-4 max-w-xs text-xs text-gray-600 line-clamp-2">
                      {{ ped.descripcionPlaga || ped.observacion }}
                    </td>
                    <td class="py-4 px-4 text-right">
                      <button (click)="despacharPedido(ped.idUso)"
                              class="px-4 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer">
                        <lucide-icon name="check-circle" class="w-4 h-4"></lucide-icon>
                        <span>Despachar (Aplicar FEFO)</span>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-12 text-center text-gray-400">
                      <lucide-icon name="check-circle" class="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-600"></lucide-icon>
                      <p class="font-bold text-sm text-gray-600">No hay órdenes de pedido pendientes en bodega</p>
                      <p class="text-xs text-gray-400 mt-1">Todas las órdenes emitidas por los técnicos han sido procesadas o despachadas.</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: KITTING Y COMBOS FÍSICOS -->
      @if (activeTab() === 'KITTING') {
        <div class="space-y-6 animate-fade-in">
          <div class="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-5 rounded-2xl border border-emerald-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-[#0B4628] text-white flex items-center justify-center shadow-md shrink-0">
                <lucide-icon name="package-check" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-gray-900 text-base">Almacén: Armado de Combos & Kitting Inteligente</h3>
                <p class="text-xs text-gray-600">Convierta alertas de caducidad en paquetes listos para venta y empújelos directamente al catálogo de los Técnicos-Comerciales.</p>
              </div>
            </div>
            <button (click)="openNuevoKitModal()"
                    class="px-4 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
              <span>Armar Kit Personalizado</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (alerta of alertasKitting(); track alerta.idAlerta) {
              <div class="bg-white rounded-2xl border border-amber-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative">
                <div class="p-5 space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <span class="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-[11px] rounded-lg tracking-wide flex items-center gap-1">
                      <lucide-icon name="alert-triangle" class="w-3.5 h-3.5 text-amber-600"></lucide-icon> VENCE EN {{ alerta.diasRestantes }} DÍAS
                    </span>
                    <span class="text-xs font-mono font-bold text-gray-500">{{ alerta.codigoLote }}</span>
                  </div>

                  <h4 class="font-black text-gray-900 text-lg leading-snug">{{ alerta.nombreProducto }}</h4>
                  <p class="text-xs text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <span class="font-bold text-amber-900 block mb-0.5">Sugerencia IA AgroSense:</span>
                    Armar un pack rotativo con {{ alerta.sugerenciaDescuento }}% de descuento para agotar los {{ alerta.stockActual }} {{ alerta.unidadMedida }} antes del {{ alerta.fechaCaducidad }}.
                  </p>

                  <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-gray-400 block">Bodega & Ubicación</span>
                      <span class="font-bold text-gray-700">{{ alerta.bodega }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] uppercase font-bold text-gray-400 block">Stock Disponible</span>
                      <span class="font-black text-gray-900">{{ alerta.stockActual }} unds</span>
                    </div>
                  </div>
                </div>

                <div class="p-4 bg-gray-50/80 border-t border-gray-100">
                  <button (click)="armarKitDesdeAlerta(alerta)"
                          class="w-full py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <lucide-icon name="send" class="w-4 h-4"></lucide-icon>
                    <span>Armar Kit y Enviar a Comercial</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="col-span-full bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-400">
                <lucide-icon name="check-circle-2" class="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600"></lucide-icon>
                <p class="font-bold text-gray-600 text-base">No hay alertas críticas de kitting pendientes</p>
                <p class="text-xs text-gray-400 mt-1">Todos los lotes se encuentran dentro de rangos normales de rotación FEFO.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 3: MATRIZ STOCK FEFO -->
      @if (activeTab() === 'LOTES') {
        <div class="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden animate-fade-in">
          <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 class="font-bold text-base text-gray-900">Matriz de Lotes - Primero en Vencer, Primero en Salir (FEFO)</h3>
              <p class="text-xs text-gray-500">Stock disponible y reservas de pedidos calculados por lotes.</p>
            </div>
            <button (click)="loadAll()" class="p-2 text-gray-500 hover:text-[#0B4628] rounded-xl hover:bg-white transition-all cursor-pointer">
              <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th class="py-3.5 px-4">Prioridad / Vencimiento</th>
                  <th class="py-3.5 px-4">Lote & Producto</th>
                  <th class="py-3.5 px-4">Stock Físico</th>
                  <th class="py-3.5 px-4">Reservado</th>
                  <th class="py-3.5 px-4">Stock Disp.</th>
                  <th class="py-3.5 px-4">Ubicación Almacén</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (lote of lotes(); track lote.idLote; let i = $index) {
                  <tr class="hover:bg-green-50/30 transition-colors">
                    <td class="py-4 px-4 font-mono">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-green-100 text-[#0B4628] font-black text-xs flex items-center justify-center">#{{ i + 1 }}</span>
                        <div>
                          <span class="font-bold text-gray-900 block">{{ lote.fechaVencimiento }}</span>
                          <span class="text-[10px] text-gray-500">FEFO Activo</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-extrabold text-gray-900">{{ lote.nombreProducto }}</div>
                      <div class="text-xs font-mono text-gray-500">Lote: {{ lote.numeroLote }}</div>
                    </td>
                    <td class="py-4 px-4 font-black text-gray-800">{{ lote.cantidadActual || 0 }} unds</td>
                    <td class="py-4 px-4 font-bold text-amber-600">{{ lote.cantidadReservada || 0 }} unds</td>
                    <td class="py-4 px-4 font-black text-[#0B4628] text-base">
                      {{ Math.max(0, (lote.cantidadActual || 0) - (lote.cantidadReservada || 0)) }} unds
                    </td>
                    <td class="py-4 px-4 text-xs font-medium text-gray-600">{{ lote.ubicacionAlmacen }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 4: DEVOLUCIÓN DE CLIENTE (SUMA STOCK INMEDIATA) -->
      @if (activeTab() === 'DEVOLUCION_CLIENTE') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <!-- Formulario de Reingreso -->
          <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div class="border-b border-gray-100 pb-4">
              <h3 class="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <lucide-icon name="rotate-ccw" class="w-5 h-5 text-purple-600"></lucide-icon>
                <span>Reingreso por Devolución de Cliente</span>
              </h3>
              <p class="text-xs text-gray-500">Cuando un cliente devuelve cajas o producto en buen estado, el stock se suma automáticamente al lote seleccionado en bodega.</p>
            </div>

            <form [formGroup]="devClienteForm" (ngSubmit)="onSaveDevolucionCliente()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Seleccionar Lote a Reingresar *</label>
                <select formControlName="idLote" class="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold focus:border-purple-600 outline-none bg-gray-50">
                  <option [ngValue]="null" disabled>-- Seleccione lote original --</option>
                  @for (l of lotes(); track l.idLote) {
                    <option [value]="l.idLote">{{ l.nombreProducto }} (Lote: {{ l.numeroLote }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Orden de Pedido / Cliente Ref. (Opcional)</label>
                <input type="text" formControlName="idPedidoOriginal" placeholder="ej. ORD-801 o Cédula Cliente"
                       class="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:border-purple-600 outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Cantidad Devuelta (a sumar al stock) *</label>
                <input type="number" formControlName="cantidad" min="1" placeholder="ej. 5"
                       class="w-full p-3 border border-gray-300 rounded-xl text-sm font-black text-purple-700 focus:border-purple-600 outline-none bg-purple-50/40">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo / Estado del Producto Devuelto *</label>
                <textarea formControlName="motivo" rows="2" placeholder="ej. Sobrante de aplicación en finca. Cajas intactas y selladas, aptas para reventa."
                          class="w-full p-3 border border-gray-300 rounded-xl text-sm focus:border-purple-600 outline-none"></textarea>
              </div>

              <button type="submit" [disabled]="devClienteForm.invalid"
                      class="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                <lucide-icon name="plus-circle" class="w-4 h-4"></lucide-icon>
                <span>Registrar Devolución (+ Sumar Stock)</span>
              </button>
            </form>
          </div>

          <!-- Historial de Devoluciones de Clientes -->
          <div class="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div class="border-b border-gray-100 pb-4">
              <h3 class="font-extrabold text-gray-900 text-base">Registro Operativo de Devoluciones del Cliente</h3>
              <p class="text-xs text-gray-500">Auditoría de todos los reingresos sumados al inventario.</p>
            </div>

            <div class="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 flex items-center gap-3 text-xs text-purple-900">
              <lucide-icon name="info" class="w-5 h-5 text-purple-600 shrink-0"></lucide-icon>
              <span>A diferencia de las devoluciones a proveedor (que restan stock por daños), las devoluciones de clientes suman stock al lote al instante para que los técnicos puedan comercializarlos de nuevo.</span>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- MODAL DE CREACIÓN DE KIT PERSONALIZADO -->
    @if (isKitModalOpen()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
          <div class="bg-[#0B4628] p-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <lucide-icon name="package" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-lg">Armar Combo / Kit de Venta</h3>
                <p class="text-xs text-green-200">Se enviará directo a los Técnicos-Comerciales</p>
              </div>
            </div>
            <button (click)="isKitModalOpen.set(false)" class="text-white/70 hover:text-white">×</button>
          </div>

          <form [formGroup]="kitForm" (ngSubmit)="onSaveKit()" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Kit *</label>
              <input type="text" formControlName="nombrePromocion" placeholder="ej. Kit Liquidación Urea + Abono"
                     class="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Seleccionar Lote Principal *</label>
              <select formControlName="codigoLoteRef" class="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none bg-gray-50">
                @for (l of lotes(); track l.idLote) {
                  <option [value]="l.numeroLote">{{ l.nombreProducto }} (Lote: {{ l.numeroLote }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descuento Global Kit (%) *</label>
              <input type="number" formControlName="descuentoGlobal" min="5" max="50"
                     class="w-full p-3 border border-gray-300 rounded-xl text-sm font-black text-[#0B4628] focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción / Justificación para Comercial *</label>
              <textarea formControlName="descripcion" rows="3" placeholder="Detalle qué incluye el combo y por qué debe impulsarse hoy..."
                        class="w-full p-3 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="isKitModalOpen.set(false)" class="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
              <button type="submit" [disabled]="kitForm.invalid" class="px-6 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md">
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

  Math = Math;
  activeTab = signal<'PEDIDOS_VENTAS' | 'KITTING' | 'LOTES' | 'DEVOLUCION_CLIENTE'>('PEDIDOS_VENTAS');

  lotes = signal<any[]>([]);
  alertasKitting = signal<any[]>([]);
  pedidosPendientes = signal<any[]>([]);
  isKitModalOpen = signal<boolean>(false);
  devolucionesClienteCount = signal<number>(0);

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
  }

  loadAll(): void {
    this.operacionesService.listarLotesDisponiblesFefo().subscribe(data => this.lotes.set(data));
    this.operacionesService.listarPedidosPendientesBodega().subscribe(data => this.pedidosPendientes.set(data));
    this.operacionesService.listarAlertas().subscribe(data => this.alertasKitting.set(data));
  }

  despacharPedido(idOrden: number): void {
    const bodegueroId = this.authService.currentUser()?.idUsuario || 3;
    this.operacionesService.despacharPedido(idOrden, bodegueroId).subscribe({
      next: (res) => {
        this.toast.success('Despacho Completado', 'Se ha descontado el stock del lote según prioridad FEFO y notificado al cliente.');
        this.loadAll();
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'No se pudo despachar el pedido.');
      }
    });
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
