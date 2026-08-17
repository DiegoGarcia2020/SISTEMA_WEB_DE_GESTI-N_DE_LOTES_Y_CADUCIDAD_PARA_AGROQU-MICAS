import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { DevolucionMensualDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-devoluciones-mensuales',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="undo-2" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Devoluciones mensuales</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Tendencia de devoluciones agrupadas por mes</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <lucide-icon name="calendar" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></lucide-icon>
            <select [ngModel]="meses()" (ngModelChange)="cambiarMeses($event)"
              class="pl-9 pr-8 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 bg-white outline-none cursor-pointer focus:border-[#0B4628]/50">
              <option [value]="3">Últimos 3 meses</option>
              <option [value]="6">Últimos 6 meses</option>
              <option [value]="12">Último año</option>
            </select>
          </div>
          <button (click)="cargar()" title="Actualizar"
            class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando devoluciones mensuales...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="undo-2" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay devoluciones registradas en este período.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="undo-2" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total devoluciones</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ totalDevoluciones() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unidades devueltas</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ totalCantidad() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center">
              <lucide-icon name="alert-triangle" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Motivo principal</p>
              <p class="text-sm font-bold text-gray-900 truncate max-w-[140px]">{{ motivoPrincipal() }}</p>
            </div>
          </div>
        </div>

        <!-- Gráfico de barras -->
        <div class="mb-6">
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Devoluciones por mes</h4>
          <div class="space-y-3">
            @for (d of datos(); track d.mes; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-20 text-right text-xs font-bold text-gray-700 flex-shrink-0">{{ d.nombreMes }}</span>
                <div class="flex-1 relative h-7 bg-gray-100 rounded-md overflow-hidden">
                  <div class="h-full rounded-md transition-all duration-700 bg-amber-500"
                    [style.width.%]="porcentajeBarra(d)"></div>
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-800 font-mono">
                    {{ d.totalDevoluciones }} dev. · {{ d.cantidadTotal }} unid.
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Tabla -->
        <div class="rounded-xl border border-gray-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold">Mes</th>
                  <th class="text-right px-4 py-3 font-bold">Devoluciones</th>
                  <th class="text-right px-4 py-3 font-bold">Unidades</th>
                  <th class="text-left px-4 py-3 font-bold">Motivo principal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (d of datos(); track d.mes) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ d.nombreMes }} {{ d.anio }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ d.totalDevoluciones }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ d.cantidadTotal }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        {{ d.motivoPrincipal }}
                      </span>
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
export class DevolucionesMensualesComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  meses = signal(6);
  datos = signal<DevolucionMensualDTO[]>([]);
  loading = signal(true);
  totalDevoluciones = signal(0);
  totalCantidad = signal(0);
  motivoPrincipal = signal('—');

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.devolucionesMensuales(this.meses()).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.totalDevoluciones.set(d.reduce((s, x) => s + x.totalDevoluciones, 0));
        this.totalCantidad.set(d.reduce((s, x) => s + x.cantidadTotal, 0));
        // Most common motivo
        const motivos = d.map(x => x.motivoPrincipal).filter(Boolean);
        this.motivoPrincipal.set(motivos.length > 0 ? motivos[0] : '—');
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  cambiarMeses(v: number | string): void {
    this.meses.set(Number(v));
    this.cargar();
  }

  porcentajeBarra(d: DevolucionMensualDTO): number {
    const max = Math.max(...this.datos().map(x => x.totalDevoluciones), 1);
    return Math.max(4, Math.round((d.totalDevoluciones / max) * 100));
  }
}
