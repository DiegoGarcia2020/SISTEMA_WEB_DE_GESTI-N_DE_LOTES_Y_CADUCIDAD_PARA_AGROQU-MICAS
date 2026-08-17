import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { ProductoMayorIngresoDTO, PeriodoAnalisis } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-mayor-ingreso',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="trending-up" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Mayor ingreso bruto</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Productos con mayor ingreso generado en el período</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <lucide-icon name="calendar" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></lucide-icon>
            <select [ngModel]="periodo()" (ngModelChange)="cambiarPeriodo($event)"
              class="pl-9 pr-8 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 bg-white outline-none cursor-pointer focus:border-[#0B4628]/50">
              @for (p of periodos; track p.value) {
                <option [value]="p.value">{{ p.label }}</option>
              }
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
          <span class="text-sm text-gray-500">Analizando ingresos...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="trending-up" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay datos de ingresos para este período.</span>
        </div>
      } @else {
        <!-- Top 3 tarjetas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 mt-4">
          @for (item of datos().slice(0, 3); track item.idProducto; let i = $index) {
            <div class="rounded-xl p-4 border flex flex-col gap-2"
              [class]="i === 0 ? 'bg-amber-50 border-amber-200/80' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-black"
                  [class]="i === 0 ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-400'">
                  <lucide-icon name="trophy" class="w-5 h-5"></lucide-icon>
                </div>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">#{{ i + 1 }}</span>
              </div>
              <p class="font-bold text-sm text-gray-900 leading-snug">{{ item.nombre }}</p>
              <div class="flex items-end justify-between">
                <div>
                  <p class="text-2xl font-black text-gray-900 font-mono">{{ item.unidadesVendidas }}</p>
                  <p class="text-[11px] text-gray-500">unidades</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-700">{{ formatoMoneda(item.ingresoTotal) }}</p>
                  @if (item.variacion !== null && item.variacion !== undefined) {
                    <p class="inline-flex items-center gap-1 text-[11px] font-bold"
                      [class]="item.variacion >= 0 ? 'text-emerald-600' : 'text-red-500'">
                      <lucide-icon [name]="item.variacion >= 0 ? 'trending-up' : 'trending-down'" class="w-3.5 h-3.5"></lucide-icon>
                      {{ item.variacion >= 0 ? '+' : '' }}{{ item.variacion.toFixed(1) }}%
                    </p>
                  }
                </div>
              </div>
            </div>
          }
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
                  <th class="text-right px-4 py-3 font-bold">Ingreso bruto</th>
                  <th class="text-right px-4 py-3 font-bold">Ingreso anterior</th>
                  <th class="text-right px-4 py-3 font-bold">Variación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (item of datos(); track item.idProducto; let i = $index) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                        [class]="i < 3 ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-500'">{{ i + 1 }}</span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ item.nombre }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ item.unidadesVendidas }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(item.ingresoTotal) }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ item.ingresoAnterior }}</td>
                    <td class="px-4 py-3 text-right">
                      @if (item.variacion !== null && item.variacion !== undefined) {
                        <span class="inline-flex items-center gap-1 text-xs font-bold"
                          [class]="item.variacion >= 0 ? 'text-emerald-600' : 'text-red-500'">
                          <lucide-icon [name]="item.variacion >= 0 ? 'trending-up' : 'trending-down'" class="w-3.5 h-3.5"></lucide-icon>
                          {{ item.variacion >= 0 ? '+' : '' }}{{ item.variacion.toFixed(1) }}%
                        </span>
                      } @else {
                        <span class="text-xs text-[#0B4628] font-bold">nuevo</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gráfico de barras -->
        <div class="mt-6">
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Ingreso bruto por producto</h4>
          <div class="space-y-3">
            @for (item of datos(); track item.idProducto; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-36 md:w-48 text-right text-xs font-semibold text-gray-700 truncate flex-shrink-0">{{ item.nombre }}</span>
                <div class="flex-1 relative h-6 bg-gray-100 rounded-md overflow-hidden">
                  <div class="h-full rounded-md transition-all duration-700"
                    [style.width.%]="porcentajeBarra(item)"
                    [class]="i % 3 === 0 ? 'bg-amber-500' : i % 3 === 1 ? 'bg-[#0B4628]' : 'bg-emerald-500'"></div>
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-800 font-mono">{{ formatoMoneda(item.ingresoTotal) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class MayorIngresoComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  periodos: { value: PeriodoAnalisis; label: string }[] = [
    { value: 'ESTA_SEMANA', label: 'Esta semana' },
    { value: 'SEMANA_ANTERIOR', label: 'Semana anterior' },
    { value: 'ESTE_MES', label: 'Este mes' },
    { value: 'MES_ANTERIOR', label: 'Mes anterior' },
    { value: 'ULTIMOS_30_DIAS', label: 'Últimos 30 días' },
    { value: 'ULTIMOS_90_DIAS', label: 'Últimos 90 días' }
  ];

  periodo = signal<PeriodoAnalisis>('ESTA_SEMANA');
  datos = signal<ProductoMayorIngresoDTO[]>([]);
  loading = signal(true);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.mayorIngreso(this.periodo()).subscribe({
      next: (d) => { this.datos.set(d); this.loading.set(false); },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  cambiarPeriodo(p: PeriodoAnalisis): void {
    this.periodo.set(p);
    this.cargar();
  }

  formatoMoneda(v: number): string {
    return (Number(v) || 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
  }

  porcentajeBarra(item: ProductoMayorIngresoDTO): number {
    const max = Math.max(...this.datos().map(d => d.ingresoTotal), 1);
    return Math.max(4, Math.round((item.ingresoTotal / max) * 100));
  }
}
