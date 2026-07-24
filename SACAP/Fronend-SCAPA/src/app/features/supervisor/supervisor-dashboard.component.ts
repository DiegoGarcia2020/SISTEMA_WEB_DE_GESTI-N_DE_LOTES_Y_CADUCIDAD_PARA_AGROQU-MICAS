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
  template: `
    <div class="p-6 space-y-6 animate-fade-in min-h-screen bg-slate-50/50">
      <!-- Cabecera del Supervisor -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-[#0B4628] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-4 z-10">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
            <lucide-icon name="shield-check" class="w-8 h-8"></lucide-icon>
          </div>
          <div>
            <span class="inline-block px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-1">Rol: Supervisor & Auditoría</span>
            <h1 class="text-2xl font-bold tracking-tight">Aprobaciones de Combos IA, Logística & Rentabilidad</h1>
            <p class="text-xs text-slate-300 mt-0.5">Auditor Activo: {{ authService.currentUser()?.correo || 'supervisor@agrosense.ec' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 z-10">
          <button (click)="loadAll()" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            <span>Actualizar Todo</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas KPI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Combos por Aprobar</p>
            <p class="text-2xl font-black text-purple-600 mt-1">{{ promosPendientes().length }}</p>
            <p class="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
              <lucide-icon name="sparkles" class="w-3.5 h-3.5"></lucide-icon> Kits propuestos por Bodega/IA
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <lucide-icon name="zap" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Despachos por Aprobar</p>
            <p class="text-2xl font-black text-amber-600 mt-1">{{ despachosPendientes().length }}</p>
            <p class="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <lucide-icon name="clock" class="w-3.5 h-3.5"></lucide-icon> Requiere visto bueno
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <lucide-icon name="truck" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Devoluciones Proveedor</p>
            <p class="text-2xl font-black text-red-600 mt-1">{{ devolucionesPendientes().length }}</p>
            <p class="text-[11px] text-red-600 font-medium mt-1">Defectos / Reclamaciones</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <lucide-icon name="rotate-ccw" class="w-6 h-6"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Aprobaciones Hoy</p>
            <p class="text-2xl font-black text-green-600 mt-1">{{ procesadosHoy() }}</p>
            <p class="text-[11px] text-green-600 font-medium mt-1">Decisiones validadas en turno</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <lucide-icon name="check-check" class="w-6 h-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- BANDEJA 1: APROBACIÓN DE COMBOS IA Y PROMOCIONES DE VENTA -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden animate-fade-in">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <lucide-icon name="sparkles" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-base text-gray-900">Bandeja de Aprobación de Combos & Promociones de Venta (IA / Almacén)</h3>
              <p class="text-xs text-gray-500">Autorice los kits propuestos por Almacén o por el motor AgroSense para que se publiquen en el catálogo de los Técnicos.</p>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th class="py-3.5 px-4">Combo # / Fecha</th>
                <th class="py-3.5 px-4">Título del Combo & Lote Ref.</th>
                <th class="py-3.5 px-4">Descuento</th>
                <th class="py-3.5 px-4">Justificación Comercial</th>
                <th class="py-3.5 px-4 text-right">Decisión de Supervisión</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (promo of promosPendientes(); track promo.idPromocion) {
                <tr class="hover:bg-purple-50/30 transition-colors">
                  <td class="py-4 px-4 font-mono">
                    <span class="font-black text-gray-900 block">PROMO-{{ promo.idPromocion }}</span>
                    <span class="text-xs text-gray-500">{{ promo.fechaInicio || promo.fechaCreacion }}</span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="font-bold text-gray-900">{{ promo.nombrePromocion || promo.titulo }}</div>
                    <div class="text-xs font-mono text-purple-700 font-bold">Lote: {{ promo.codigoLoteRef || promo.codigoLote }} ({{ promo.productoRef || promo.nombreProducto }})</div>
                  </td>
                  <td class="py-4 px-4 font-black text-purple-800 text-base">
                    -{{ promo.descuentoGlobal || promo.descuentoSugerido }}%
                  </td>
                  <td class="py-4 px-4 max-w-xs text-xs text-gray-600 line-clamp-2">
                    {{ promo.descripcion || promo.justificacionIA }}
                  </td>
                  <td class="py-4 px-4 text-right space-x-2">
                    <button (click)="aprobarPromo(promo)"
                            class="px-3.5 py-1.5 bg-[#0B4628] hover:bg-[#146C43] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1">
                      <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                      <span>Aprobar y Publicar</span>
                    </button>
                    <button (click)="rechazarPromo(promo)"
                            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
                      ✕ Rechazar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-12 text-center text-gray-400">
                    <lucide-icon name="zap" class="w-12 h-12 mx-auto mb-2 opacity-40 text-purple-600"></lucide-icon>
                    <p class="font-bold text-sm text-gray-600">No hay combos o promociones pendientes de aprobación</p>
                    <p class="text-xs text-gray-400 mt-1">Todos los combos generados están aprobados en catálogo o vigentes.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- BANDEJA 2: DESPACHOS PENDIENTES -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <lucide-icon name="send" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-base text-gray-900">Bandeja de Despachos FEFO Críticos (Auditoría de Salidas)</h3>
              <p class="text-xs text-gray-500">Auditoría del supervisor sobre movimientos y salidas de bodega.</p>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th class="py-3.5 px-4">Fecha</th>
                <th class="py-3.5 px-4">Producto & Lote</th>
                <th class="py-3.5 px-4">Cantidad</th>
                <th class="py-3.5 px-4">Observación / Destino</th>
                <th class="py-3.5 px-4 text-right">Decisión de Control</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (des of despachosPendientes(); track des.idMovimiento) {
                <tr class="hover:bg-amber-50/30 transition-colors">
                  <td class="py-4 px-4 font-mono text-xs text-gray-600">{{ des.fechaMovimiento || 'Hoy' }}</td>
                  <td class="py-4 px-4">
                    <div class="font-bold text-gray-900">{{ des.lote?.producto?.nombre || 'Producto' }}</div>
                    <div class="text-xs font-mono text-gray-500">Lote: {{ des.lote?.numeroLote || des.idLote }}</div>
                  </td>
                  <td class="py-4 px-4 font-black text-amber-700">{{ des.cantidad }} unds</td>
                  <td class="py-4 px-4 text-xs text-gray-600">{{ des.observacion }}</td>
                  <td class="py-4 px-4 text-right space-x-2">
                    <button (click)="aprobarDespacho(des.idMovimiento)" class="px-3 py-1.5 bg-[#0B4628] hover:bg-[#146C43] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
                      ✓ Aprobar Salida
                    </button>
                    <button (click)="rechazarDespacho(des.idMovimiento)" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
                      ✕ Rechazar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-12 text-center text-gray-400">
                    <lucide-icon name="check-circle" class="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-600"></lucide-icon>
                    <p class="font-bold text-sm text-gray-600">No hay despachos críticos pendientes de revisión</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- BANDEJA 3: DEVOLUCIONES A PROVEEDOR & DISPARO DE ALERTAS IA -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/40">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <lucide-icon name="rotate-ccw" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-base text-gray-900">Bandeja de Devoluciones Correctivas a Proveedor & Alertas IA</h3>
              <p class="text-xs text-gray-500">Autorice devoluciones por daños o defectos. El motor IA evaluará si debe sugerirse combo rotatorio.</p>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th class="py-3.5 px-4">Fecha</th>
                <th class="py-3.5 px-4">Producto & Lote</th>
                <th class="py-3.5 px-4">Proveedor</th>
                <th class="py-3.5 px-4">Defecto / Motivo</th>
                <th class="py-3.5 px-4 text-right">Decisión de Control</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (dev of devolucionesPendientes(); track dev.idDevolucion) {
                <tr class="hover:bg-red-50/30 transition-colors">
                  <td class="py-4 px-4 font-mono text-xs text-gray-600">{{ dev.fechaDevolucion || 'Hoy' }}</td>
                  <td class="py-4 px-4">
                    <div class="font-bold text-gray-900">{{ dev.lote?.producto?.nombre || 'Insumo' }}</div>
                    <div class="text-xs font-mono text-gray-500">Lote: {{ dev.lote?.numeroLote || dev.idLote }} ({{ dev.cantidadDevuelta }} unds)</div>
                  </td>
                  <td class="py-4 px-4 text-xs font-bold text-gray-700">{{ dev.proveedor?.nombre || 'Proveedor' }}</td>
                  <td class="py-4 px-4 text-xs text-red-700 font-semibold">{{ dev.motivo }}</td>
                  <td class="py-4 px-4 text-right space-x-2">
                    <button (click)="aprobarDevolucion(dev.idDevolucion)" class="px-3.5 py-1.5 bg-[#0B4628] hover:bg-[#146C43] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
                      ✓ Aprobar Devolución
                    </button>
                    <button (click)="rechazarDevolucion(dev.idDevolucion)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
                      ✕ Denegar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-12 text-center text-gray-400">
                    <lucide-icon name="shield-check" class="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-600"></lucide-icon>
                    <p class="font-bold text-sm text-gray-600">No hay devoluciones a proveedor pendientes</p>
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
