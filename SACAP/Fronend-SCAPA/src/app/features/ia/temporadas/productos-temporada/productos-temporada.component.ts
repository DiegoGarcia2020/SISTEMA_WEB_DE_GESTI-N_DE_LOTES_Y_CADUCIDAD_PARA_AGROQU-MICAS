import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { ProductoTemporadaDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-productos-temporada',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <lucide-icon name="calendar-range" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Productos por temporada</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Distribución de ventas de productos según la temporada de origen</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando productos por temporada...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="calendar-range" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay datos de ventas por temporada.</span>
        </div>
      } @else {
        <!-- Agrupados por temporada -->
        @for (temp of temporadas(); track temp) {
          <div class="mb-6 mt-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <lucide-icon name="calendar" class="w-4 h-4"></lucide-icon>
              </span>
              <h4 class="text-sm font-bold text-gray-900">{{ temp }}</h4>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {{ totalPorTemporada(temp) }} unidades
              </span>
            </div>

            <div class="rounded-xl border border-gray-200/80 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                      <th class="text-left px-4 py-3 font-bold">Producto</th>
                      <th class="text-right px-4 py-3 font-bold">Unidades</th>
                      <th class="text-right px-4 py-3 font-bold">Monto</th>
                      <th class="text-right px-4 py-3 font-bold">% Temporada</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (p of productosPorTemporada(temp); track p.idProducto) {
                      <tr class="hover:bg-gray-50/70 transition-colors">
                        <td class="px-4 py-3 font-semibold text-gray-800">{{ p.nombre }}</td>
                        <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ p.unidadesVendidas }}</td>
                        <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(p.montoTotal) }}</td>
                        <td class="px-4 py-3 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <div class="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div class="h-full bg-sky-500 rounded-full" [style.width.%]="p.porcentajeParticipacion"></div>
                            </div>
                            <span class="text-xs font-bold text-gray-700 font-mono w-12 text-right">{{ p.porcentajeParticipacion }}%</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class ProductosTemporadaComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<ProductoTemporadaDTO[]>([]);
  loading = signal(true);
  temporadas = signal<string[]>([]);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.productosPorTemporada().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.temporadas.set([...new Set(d.map(x => x.temporada))]);
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  productosPorTemporada(temp: string): ProductoTemporadaDTO[] {
    return this.datos().filter(x => x.temporada === temp);
  }

  totalPorTemporada(temp: string): number {
    return this.datos().filter(x => x.temporada === temp).reduce((s, x) => s + x.unidadesVendidas, 0);
  }

  formatoMoneda(v: number): string {
    return (Number(v) || 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
  }
}
