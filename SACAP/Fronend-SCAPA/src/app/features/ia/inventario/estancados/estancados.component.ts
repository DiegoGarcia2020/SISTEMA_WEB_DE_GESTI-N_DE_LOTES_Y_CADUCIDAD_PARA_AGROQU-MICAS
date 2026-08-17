import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { ProductoEstancadoDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-estancados',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <lucide-icon name="pause-circle" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Productos estancados</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Productos sin movimiento en inventario por un período prolongado</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Buscando productos estancados...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="check-circle-2" class="w-8 h-8 text-emerald-500"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No se encontraron productos estancados.</span>
        </div>
      } @else {
        <div class="rounded-xl border border-gray-200/80 overflow-hidden mt-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold">Producto</th>
                  <th class="text-right px-4 py-3 font-bold">Stock actual</th>
                  <th class="text-right px-4 py-3 font-bold">Último movimiento</th>
                  <th class="text-right px-4 py-3 font-bold">Días sin movimiento</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of datos(); track p.idProducto) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ p.nombre }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ p.cantidadActual }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 text-xs">{{ formatFecha(p.ultimoMovimiento) }}</td>
                    <td class="px-4 py-3 text-right">
                      @if (p.diasSinMovimiento !== null && p.diasSinMovimiento !== undefined) {
                        <span class="inline-flex items-center gap-1 text-xs font-bold"
                          [class]="p.diasSinMovimiento > 60 ? 'text-red-600' : p.diasSinMovimiento > 30 ? 'text-amber-600' : 'text-gray-600'">
                          <lucide-icon name="clock" class="w-3.5 h-3.5"></lucide-icon>
                          {{ p.diasSinMovimiento }} días
                        </span>
                      } @else {
                        <span class="text-xs text-gray-400">sin dato</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Alerta -->
        <div class="mt-4 rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-start gap-3">
          <lucide-icon name="lightbulb" class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"></lucide-icon>
          <div>
            <p class="text-xs font-black text-orange-900 uppercase tracking-wider">Recomendación</p>
            <p class="text-xs text-orange-800 mt-1 leading-relaxed">
              Se encontraron <strong>{{ datos().length }}</strong> productos sin movimiento.
              Considere aplicar promociones o transferencias para rotar el inventario.
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class EstancadosComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<ProductoEstancadoDTO[]>([]);
  loading = signal(true);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.inventarioEstancado().subscribe({
      next: (d) => { this.datos.set(d); this.loading.set(false); },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  formatFecha(f: string | null): string {
    if (!f) return '—';
    try { return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  }
}
