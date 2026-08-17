import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { DemandaTemporadaDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-demanda-temporada',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <lucide-icon name="thermometer" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Demanda por temporada</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Productos más demandados en los últimos 90 días</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Analizando demanda por temporada...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="thermometer" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay datos de demanda disponibles.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total unidades</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ totalUnidades() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="dollar-sign" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total ingreso</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ formatoMoneda(totalMonto()) }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="bar-chart-3" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Productos</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ datos().length }}</p>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="rounded-xl border border-gray-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold w-12">#</th>
                  <th class="text-left px-4 py-3 font-bold">Producto</th>
                  <th class="text-right px-4 py-3 font-bold">Unidades</th>
                  <th class="text-right px-4 py-3 font-bold">Monto</th>
                  <th class="text-right px-4 py-3 font-bold">% Participación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (d of datos(); track d.idProducto; let i = $index) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                        [class]="i < 3 ? 'bg-sky-100 text-sky-500' : 'bg-gray-100 text-gray-500'">{{ i + 1 }}</span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ d.nombre }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ d.unidadesVendidas }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(d.montoTotal) }}</td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <div class="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div class="h-full bg-sky-500 rounded-full" [style.width.%]="d.totalUnidades > 0 ? (d.unidadesVendidas / d.totalUnidades * 100) : 0"></div>
                        </div>
                        <span class="text-xs font-bold text-gray-700 font-mono w-12 text-right">{{ d.totalUnidades > 0 ? (d.unidadesVendidas / d.totalUnidades * 100).toFixed(1) : 0 }}%</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gráfico de barras -->
        <div class="mt-6">
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Unidades vendidas por producto</h4>
          <div class="space-y-3">
            @for (d of datos().slice(0, 8); track d.idProducto; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-36 md:w-48 text-right text-xs font-semibold text-gray-700 truncate flex-shrink-0">{{ d.nombre }}</span>
                <div class="flex-1 relative h-6 bg-gray-100 rounded-md overflow-hidden">
                  <div class="h-full rounded-md transition-all duration-700 bg-sky-500"
                    [style.width.%]="porcentajeBarra(d)"></div>
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-800 font-mono">{{ d.unidadesVendidas }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DemandaTemporadaComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<DemandaTemporadaDTO[]>([]);
  loading = signal(true);
  totalUnidades = signal(0);
  totalMonto = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.demandaTemporada().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.totalUnidades.set(d.reduce((s, x) => s + x.unidadesVendidas, 0));
        this.totalMonto.set(d.reduce((s, x) => s + x.montoTotal, 0));
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  formatoMoneda(v: number): string {
    return (Number(v) || 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
  }

  porcentajeBarra(d: DemandaTemporadaDTO): number {
    const max = Math.max(...this.datos().map(x => x.unidadesVendidas), 1);
    return Math.max(4, Math.round((d.unidadesVendidas / max) * 100));
  }
}
