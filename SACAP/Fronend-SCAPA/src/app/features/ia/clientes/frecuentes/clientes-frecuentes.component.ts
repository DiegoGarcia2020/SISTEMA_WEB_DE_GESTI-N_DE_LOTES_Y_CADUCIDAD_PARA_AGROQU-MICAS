import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { ClienteFrecuenteDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-clientes-frecuentes',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
              <lucide-icon name="users" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Clientes más frecuentes</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Top clientes por número de compras y monto total</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando clientes frecuentes...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="users" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay datos de clientes.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
              <lucide-icon name="user-check" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Top cliente</p>
              <p class="text-sm font-bold text-gray-900 truncate max-w-[140px]">{{ datos()[0]?.cliente }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="repeat" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Más compras</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ datos()[0]?.totalCompras ?? 0 }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="dollar-sign" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mayor monto</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ formatoMoneda(montoMax()) }}</p>
            </div>
          </div>
        </div>

        <!-- Top 3 cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          @for (c of datos().slice(0, 3); track c.cliente; let i = $index) {
            <div class="rounded-xl p-4 border flex flex-col gap-2"
              [class]="i === 0 ? 'bg-[#0B4628]/5 border-[#0B4628]/20' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-black"
                  [class]="i === 0 ? 'bg-[#0B4628]/10 text-[#0B4628]' : 'bg-gray-100 text-gray-400'">
                  <lucide-icon name="trophy" class="w-5 h-5"></lucide-icon>
                </div>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">#{{ i + 1 }}</span>
              </div>
              <p class="font-bold text-sm text-gray-900 leading-snug truncate">{{ c.cliente }}</p>
              <div class="flex items-end justify-between">
                <div>
                  <p class="text-2xl font-black text-gray-900 font-mono">{{ c.totalCompras }}</p>
                  <p class="text-[11px] text-gray-500">compras</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-700">{{ formatoMoneda(c.montoTotal) }}</p>
                  <p class="text-[11px] text-gray-500">prom. {{ formatoMoneda(c.promedioCompra) }}</p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Tabla completa -->
        <div class="rounded-xl border border-gray-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold w-12">#</th>
                  <th class="text-left px-4 py-3 font-bold">Cliente</th>
                  <th class="text-right px-4 py-3 font-bold">Compras</th>
                  <th class="text-right px-4 py-3 font-bold">Monto total</th>
                  <th class="text-right px-4 py-3 font-bold">Promedio</th>
                  <th class="text-right px-4 py-3 font-bold">Última compra</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (c of datos(); track c.cliente; let i = $index) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                        [class]="i < 3 ? 'bg-[#0B4628]/10 text-[#0B4628]' : 'bg-gray-100 text-gray-500'">{{ i + 1 }}</span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ c.cliente }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ c.totalCompras }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(c.montoTotal) }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ formatoMoneda(c.promedioCompra) }}</td>
                    <td class="px-4 py-3 text-right text-gray-500 text-xs">{{ formatFecha(c.ultimaCompra) }}</td>
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
export class ClientesFrecuentesComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<ClienteFrecuenteDTO[]>([]);
  loading = signal(true);
  montoMax = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.clientesFrecuentes().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.montoMax.set(d.length > 0 ? Math.max(...d.map(x => x.montoTotal)) : 0);
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  formatoMoneda(v: number): string {
    return (Number(v) || 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
  }

  formatFecha(f: string | null | undefined): string {
    if (!f) return '—';
    try {
      return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  }
}
