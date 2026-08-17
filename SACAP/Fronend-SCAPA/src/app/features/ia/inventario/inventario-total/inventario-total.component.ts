import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { InventarioTotalDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-inventario-total',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
              <lucide-icon name="package" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Inventario total por producto</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Stock total consolidado de todos los lotes activos</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando inventario total...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="package" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay datos de inventario.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
              <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Productos</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ datos().length }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="boxes" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unidades totales</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ totalUnidades() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="dollar-sign" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Valor total</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ formatoMoneda(totalValor()) }}</p>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="rounded-xl border border-gray-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold">Producto</th>
                  <th class="text-left px-4 py-3 font-bold">Unidad</th>
                  <th class="text-right px-4 py-3 font-bold">Cantidad</th>
                  <th class="text-right px-4 py-3 font-bold">Precio unit.</th>
                  <th class="text-right px-4 py-3 font-bold">Valor total</th>
                  <th class="text-right px-4 py-3 font-bold">Lotes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of datos(); track p.idProducto) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ p.nombre }}</td>
                    <td class="px-4 py-3 text-gray-600 text-xs">{{ p.unidadMedida }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ p.cantidadTotal }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ formatoMoneda(p.precioUnitario) }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ formatoMoneda(p.valorTotal) }}</td>
                    <td class="px-4 py-3 text-right">
                      <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                        {{ p.lotesActivos }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gráfico de barras -->
        <div class="mt-6">
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Valor total por producto</h4>
          <div class="space-y-3">
            @for (p of datos(); track p.idProducto; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-36 md:w-48 text-right text-xs font-semibold text-gray-700 truncate flex-shrink-0">{{ p.nombre }}</span>
                <div class="flex-1 relative h-6 bg-gray-100 rounded-md overflow-hidden">
                  <div class="h-full rounded-md transition-all duration-700"
                    [style.width.%]="porcentajeBarra(p)"
                    [class]="i % 3 === 0 ? 'bg-[#0B4628]' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-amber-500'"></div>
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-800 font-mono">{{ formatoMoneda(p.valorTotal) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class InventarioTotalComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<InventarioTotalDTO[]>([]);
  loading = signal(true);
  totalUnidades = signal(0);
  totalValor = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.inventarioTotal().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.totalUnidades.set(d.reduce((s, x) => s + x.cantidadTotal, 0));
        this.totalValor.set(d.reduce((s, x) => s + x.valorTotal, 0));
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  formatoMoneda(v: number): string {
    return (Number(v) || 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
  }

  porcentajeBarra(p: InventarioTotalDTO): number {
    const max = Math.max(...this.datos().map(x => x.valorTotal), 1);
    return Math.max(4, Math.round((p.valorTotal / max) * 100));
  }
}
