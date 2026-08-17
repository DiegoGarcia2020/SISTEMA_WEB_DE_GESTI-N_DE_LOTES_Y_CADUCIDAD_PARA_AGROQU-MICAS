import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../../core/services/ventas.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PeriodoVentas, VentasMasVendidosDTO, VentaRankingDTO } from '../../../../core/models/ventas.model';

@Component({
  selector: 'app-ventas-mas-vendidos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <!-- Cabecera -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
              <lucide-icon name="bar-chart-3" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Productos más vendidos</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Analiza los productos con mayor movimiento de ventas</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Selector de período -->
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

          @if (tieneAccesoCompleto()) {
            <div class="relative">
              <button (click)="menuExport = !menuExport"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                [class]="menuExport ? 'border-[#0B4628] text-[#0B4628] bg-[#0B4628]/5' : 'border-gray-200 text-gray-600 bg-white hover:border-[#0B4628]/40'">
                <lucide-icon name="download" class="w-4 h-4"></lucide-icon>
                Exportar
                <lucide-icon name="chevron-down" class="w-3.5 h-3.5"></lucide-icon>
              </button>
              @if (menuExport) {
                <div class="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg z-20 py-1">
                  <button (click)="onExportar('EXCEL')" class="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Excel (.xlsx)</button>
                  <button (click)="onExportar('PDF')" class="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">PDF</button>
                  <button (click)="onExportar('CSV')" class="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">CSV</button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Estados -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Analizando ventas del período...</span>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="alert-triangle" class="w-8 h-8 text-red-500"></lucide-icon>
          <span class="text-sm text-gray-600">No se pudieron cargar los datos de ventas.</span>
          <button (click)="cargar()"
            class="mt-1 px-4 py-2 rounded-lg bg-[#0B4628] text-white text-xs font-bold hover:bg-[#0B4628]/90 transition-all">
            Reintentar
          </button>
        </div>
      } @else if (dato()) {
        @let data = dato()!;
        @if (data.ranking.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <lucide-icon name="shopping-cart" class="w-8 h-8 text-gray-300"></lucide-icon>
            <span class="text-sm font-semibold text-gray-600">No existen ventas para el período seleccionado.</span>
            <span class="text-xs text-gray-400">Intenta con otro período para ver el ranking de productos.</span>
          </div>
        } @else {
          <!-- KPIs del período -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
                <lucide-icon name="shopping-cart" class="w-4 h-4"></lucide-icon>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Ventas</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ data.totalVentas }}</p>
              </div>
            </div>
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unidades</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ data.totalUnidades }}</p>
              </div>
            </div>
            @if (tieneAccesoCompleto()) {
              <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
                  <lucide-icon name="dollar-sign" class="w-4 h-4"></lucide-icon>
                </div>
                <div>
                  <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Monto Total</p>
                  <p class="text-lg font-bold text-gray-900 font-mono">{{ formatoMoneda(data.totalMonto) }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Top 3 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            @for (item of data.ranking.slice(0, 3); track item.idProducto; let i = $index) {
              <div [class]="'rounded-xl p-4 border flex flex-col gap-2 ' + colorCard(i)">
                <div class="flex items-center justify-between">
                  <div [class]="'w-10 h-10 rounded-full flex items-center justify-center font-black ' + colorMedalla(i)">
                    <lucide-icon name="trophy" class="w-5 h-5"></lucide-icon>
                  </div>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">#{{ i + 1 }}</span>
                </div>
                <p class="font-bold text-sm text-gray-900 leading-snug">{{ item.nombre }}</p>
                <div class="flex items-end justify-between">
                  <div>
                    <p class="text-2xl font-black text-gray-900 font-mono">{{ item.unidades }}</p>
                    <p class="text-[11px] text-gray-500">unidades</p>
                  </div>
                  <div class="text-right">
                    @if (tieneAccesoCompleto()) {
                      <p class="text-sm font-bold text-gray-700">{{ formatoMoneda(item.montoTotal) }}</p>
                    }
                    <p [class]="'inline-flex items-center gap-1 text-[11px] font-bold ' + colorVariacion(item)">
                      <lucide-icon [name]="iconoVariacion(item)" class="w-3.5 h-3.5"></lucide-icon>
                      {{ textoVariacion(item) }}
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Tabla de ranking -->
          <div class="rounded-xl border border-gray-200/80 overflow-hidden mb-6">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                    <th class="text-left px-4 py-3 font-bold w-12">Posición</th>
                    <th class="text-left px-4 py-3 font-bold">Producto</th>
                    <th class="text-right px-4 py-3 font-bold">Unidades vendidas</th>
                    @if (tieneAccesoCompleto()) {
                      <th class="text-right px-4 py-3 font-bold">Monto total</th>
                    }
                    <th class="text-right px-4 py-3 font-bold">Unidades período anterior</th>
                    <th class="text-right px-4 py-3 font-bold">Variación %</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (item of data.ranking; track item.idProducto; let i = $index) {
                    <tr class="hover:bg-gray-50/70 transition-colors">
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                          [class]="i < 3 ? colorMedalla(i) : 'bg-gray-100 text-gray-500'">
                          {{ i + 1 }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-gray-800">{{ item.nombre }}</p>
                      </td>
                      <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ item.unidades }}</td>
                      @if (tieneAccesoCompleto()) {
                        <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(item.montoTotal) }}</td>
                      }
                      <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ item.unidadesAnterior ?? 0 }}</td>
                      <td class="px-4 py-3 text-right">
                        <span [class]="'inline-flex items-center gap-1 text-xs font-bold ' + colorVariacion(item)">
                          <lucide-icon [name]="iconoVariacion(item)" class="w-3.5 h-3.5"></lucide-icon>
                          {{ textoVariacion(item) }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Gráfico de barras -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider">Gráfico de barras</h4>
              <span class="text-[10px] text-gray-400">Unidades vendidas por producto</span>
            </div>
            <div class="space-y-3">
              @for (item of data.ranking; track item.idProducto; let i = $index) {
                <div class="flex items-center gap-3">
                  <span class="w-32 md:w-48 text-right text-xs font-semibold text-gray-700 truncate flex-shrink-0">{{ item.nombre }}</span>
                  <div class="flex-1 relative h-6 bg-gray-100 rounded-md overflow-hidden">
                    <div class="h-full rounded-md transition-all duration-700"
                      [style.width.%]="porcentajeBarra(item)"
                      [class]="colorBarra(i)"></div>
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-800 font-mono">{{ item.unidades }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Análisis IA + Alerta (solo Gerente/Administrador) -->
          @if (tieneAccesoCompleto()) {
            <div class="rounded-xl border border-[#0B4628]/20 bg-[#0B4628]/5 p-4 space-y-3">
              <div class="flex items-center gap-2">
                <lucide-icon name="brain" class="w-4 h-4 text-[#0B4628]"></lucide-icon>
                <span class="text-xs font-black text-[#0B4628] uppercase tracking-wider">Análisis IA · AgroSense</span>
                <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                  [class]="badgeTendencia(data.analisis.tendencia)">{{ data.analisis.tendencia }}</span>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">{{ data.analisis.resumen }}</p>
              <ul class="space-y-1">
                @for (h of data.analisis.hallazgos; track $index) {
                  <li class="text-xs text-gray-600 flex items-start gap-2">
                    <lucide-icon name="check-circle-2" class="w-3.5 h-3.5 text-[#0B4628] flex-shrink-0 mt-0.5"></lucide-icon>
                    <span>{{ h }}</span>
                  </li>
                }
              </ul>
            </div>

            @if (data.analisis.alertaAltaDemanda) {
              <div class="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                <lucide-icon name="alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                <div>
                  <p class="text-xs font-black text-amber-900 uppercase tracking-wider">Alerta de Alta Demanda</p>
                  <p class="text-xs text-amber-800 mt-1 leading-relaxed">{{ data.analisis.alertaMensaje }}</p>
                </div>
              </div>
            }
          }

          <!-- Ver análisis completo (solo Gerente/Administrador) -->
          @if (tieneAccesoCompleto() && data.ranking.length > 5) {
            <div class="flex items-center justify-center pt-2">
              <button (click)="toggleCompleto()"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0B4628]/30 text-[#0B4628] text-xs font-bold hover:bg-[#0B4628]/5 transition-all">
                <lucide-icon [name]="analisisCompleto() ? 'chevron-up' : 'chevron-down'" class="w-4 h-4"></lucide-icon>
                {{ analisisCompleto() ? 'Ver ranking principal' : 'Ver análisis completo' }}
              </button>
            </div>
          }
        }
      } @else {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="alert-triangle" class="w-8 h-8 text-amber-500"></lucide-icon>
          <span class="text-sm text-gray-600">No se pudieron cargar los datos de ventas.</span>
          <button (click)="cargar()"
            class="mt-1 px-4 py-2 rounded-lg bg-[#0B4628] text-white text-xs font-bold hover:bg-[#0B4628]/90 transition-all">
            Reintentar
          </button>
        </div>
      }
    </div>
  `
})
export class VentasMasVendidosComponent implements OnInit {
  private ventasService = inject(VentasService);
  private authService = inject(AuthService);

  periodos: { value: PeriodoVentas; label: string }[] = [
    { value: 'ESTA_SEMANA', label: 'Esta semana' },
    { value: 'SEMANA_ANTERIOR', label: 'Semana anterior' },
    { value: 'QUINCENA', label: 'Esta quincena' },
    { value: 'QUINCENA_ANTERIOR', label: 'Quincena anterior' },
    { value: 'ESTE_MES', label: 'Este mes' },
    { value: 'MES_ANTERIOR', label: 'Mes anterior' },
    { value: 'ULTIMOS_30_DIAS', label: 'Últimos 30 días' }
  ];

  periodo = signal<PeriodoVentas>('ESTA_SEMANA');
  menuExport = false;
  dato = signal<VentasMasVendidosDTO | null>(null);
  loading = signal(true);
  error = signal(false);
  analisisCompleto = signal(false);

  rol = computed(() => (this.authService.currentRole() || '').toUpperCase());
  tieneAccesoCompleto = computed(() =>
    this.rol() === 'ADMINISTRADOR' || this.rol() === 'GERENTE' || this.rol() === 'SUPERVISOR');
  nombrePeriodo = computed(() => this.periodos.find(p => p.value === this.periodo())?.label ?? this.periodo());

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(false);
    const top = this.analisisCompleto() ? 10 : 5;
    this.ventasService.masVendidos(this.periodo(), top).subscribe({
      next: (d) => {
        if (!d || !Array.isArray(d.ranking)) {
          this.error.set(true);
        } else {
          this.dato.set(d);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  cambiarPeriodo(p: PeriodoVentas): void {
    if (this.periodo() === p) return;
    this.periodo.set(p);
    this.analisisCompleto.set(false);
    this.cargar();
  }

  toggleCompleto(): void {
    this.analisisCompleto.set(!this.analisisCompleto());
    this.cargar();
  }

  onExportar(formato: string): void {
    this.menuExport = false;
    if (!formato) return;
    this.ventasService.exportar(formato as 'EXCEL' | 'PDF' | 'CSV', this.periodo()).subscribe({
      next: (blob) => {
        const ext = formato === 'EXCEL' ? 'xlsx' : formato.toLowerCase();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos-mas-vendidos-${this.periodo().toLowerCase()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => console.error('No se pudo exportar el reporte')
    });
  }

  formatoMoneda(v: number): string {
    return (Number(v) || 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
  }

  porcentajeBarra(item: VentaRankingDTO): number {
    const max = Math.max(...(this.dato()?.ranking ?? []).map(r => r.unidades), 1);
    return Math.max(4, Math.round((item.unidades / max) * 100));
  }

  textoVariacion(item: VentaRankingDTO): string {
    if (item.variacion === null || item.variacion === undefined) return 'nuevo';
    const v = Number(item.variacion);
    return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
  }

  iconoVariacion(item: VentaRankingDTO): string {
    if (item.variacion === null || item.variacion === undefined) return 'sparkles';
    return item.variacion >= 0 ? 'trending-up' : 'trending-down';
  }

  colorVariacion(item: VentaRankingDTO): string {
    if (item.variacion === null || item.variacion === undefined) return 'text-[#0B4628]';
    return item.variacion >= 0 ? 'text-emerald-600' : 'text-red-500';
  }

  colorCard(i: number): string {
    return ['bg-white border-amber-200/80 shadow-[0_2px_12px_rgba(251,191,36,0.12)]',
            'bg-white border-gray-200 shadow-xs',
            'bg-white border-orange-200/70 shadow-[0_2px_12px_rgba(249,115,22,0.10)]'][i] ?? 'bg-white border-gray-200';
  }

  colorMedalla(i: number): string {
    return ['bg-amber-100 text-amber-500',
            'bg-gray-100 text-gray-400',
            'bg-orange-100 text-orange-400'][i] ?? 'bg-gray-100 text-gray-400';
  }

  colorBarra(i: number): string {
    return ['bg-[#0B4628]', 'bg-emerald-500', 'bg-amber-500'][i % 3] ?? 'bg-[#0B4628]';
  }

  badgeTendencia(t: string): string {
    return t === 'AL ALZA'
      ? 'bg-emerald-100 text-emerald-700'
      : t === 'A LA BAJA'
        ? 'bg-red-100 text-red-600'
        : 'bg-gray-100 text-gray-600';
  }
}
