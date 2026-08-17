import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { DiaCompraDTO, PeriodoAnalisis } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-dias-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <lucide-icon name="calendar-days" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Días de mayor compra</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Ventas totales agrupadas por día de la semana</p>
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
          <span class="text-sm text-gray-500">Cargando ventas por día...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="calendar-x" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay ventas registradas para este período.</span>
        </div>
      } @else {
        <!-- KPIs resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <lucide-icon name="bar-chart" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Día pico</p>
              <p class="text-lg font-bold text-gray-900">{{ diaPico()?.nombreDia }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="shopping-cart" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Más ventas</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ diaPico()?.totalVentas ?? 0 }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="dollar-sign" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mayor monto</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ formatoMoneda(diaPico()?.montoTotal ?? 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Gráfico de barras por día -->
        <div class="mb-6">
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Ventas por día de la semana</h4>
          <div class="space-y-3">
            @for (d of datos(); track d.diaSemana; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-24 text-right text-xs font-bold text-gray-700 flex-shrink-0">{{ d.nombreDia }}</span>
                <div class="flex-1 relative h-8 bg-gray-100 rounded-md overflow-hidden">
                  <div class="h-full rounded-md transition-all duration-700"
                    [style.width.%]="porcentajeBarra(d)"
                    [class]="d.diaSemana === diaPico()?.diaSemana ? 'bg-[#0B4628]' : 'bg-gray-300'"></div>
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-800 font-mono">{{ d.totalVentas }} ventas · {{ formatoMoneda(d.montoTotal) }}</span>
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
                  <th class="text-left px-4 py-3 font-bold">Día</th>
                  <th class="text-right px-4 py-3 font-bold">Ventas</th>
                  <th class="text-right px-4 py-3 font-bold">Unidades</th>
                  <th class="text-right px-4 py-3 font-bold">Monto total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (d of datos(); track d.diaSemana) {
                  <tr class="hover:bg-gray-50/70 transition-colors"
                    [class]="d.diaSemana === diaPico()?.diaSemana ? 'bg-[#0B4628]/5' : ''">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ d.nombreDia }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ d.totalVentas }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ d.totalUnidades }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(d.montoTotal) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Insight -->
        <div class="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4 flex items-start gap-3">
          <lucide-icon name="lightbulb" class="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5"></lucide-icon>
          <div>
            <p class="text-xs font-black text-violet-900 uppercase tracking-wider">Insight</p>
            <p class="text-xs text-violet-800 mt-1 leading-relaxed">
              El día <strong>{{ diaPico()?.nombreDia }}</strong> concentra el mayor volumen de ventas con
              <strong>{{ diaPico()?.totalVentas }}</strong> operaciones y <strong>{{ formatoMoneda(diaPico()?.montoTotal ?? 0) }}</strong> en ingresos.
              Considere reforzar personal y stock ese día.
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class DiasCompraComponent implements OnInit {
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
  datos = signal<DiaCompraDTO[]>([]);
  loading = signal(true);

  diaPico = signal<DiaCompraDTO | null>(null);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.diasCompra(this.periodo()).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.diaPico.set(d.length > 0 ? [...d].sort((a, b) => b.totalVentas - a.totalVentas)[0] : null);
        this.loading.set(false);
      },
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

  porcentajeBarra(d: DiaCompraDTO): number {
    const max = Math.max(...this.datos().map(x => x.totalVentas), 1);
    return Math.max(4, Math.round((d.totalVentas / max) * 100));
  }
}
