import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { ClienteChurnDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-churn-clientes',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <lucide-icon name="user-x" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Churn de clientes</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Clientes que dejaron de comprar durante al menos 2 meses</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Analizando churn de clientes...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="check-circle-2" class="w-8 h-8 text-emerald-500"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No se detectaron clientes en riesgo de churn.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-red-50 border border-red-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <lucide-icon name="user-x" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">Clientes en riesgo</p>
              <p class="text-lg font-bold text-red-900 font-mono">{{ datos().length }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
              <lucide-icon name="dollar-sign" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Ingreso potencial perdido</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ formatoMoneda(montoPerdido()) }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="clock" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Meses sin compra (prom.)</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ mesesPromedio() }}</p>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="rounded-xl border border-gray-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold">Cliente</th>
                  <th class="text-right px-4 py-3 font-bold">Compras anteriores</th>
                  <th class="text-right px-4 py-3 font-bold">Monto anterior</th>
                  <th class="text-right px-4 py-3 font-bold">Última compra</th>
                  <th class="text-right px-4 py-3 font-bold">Meses sin compra</th>
                  <th class="text-right px-4 py-3 font-bold">Prom. mensual</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (c of datos(); track c.cliente) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ c.cliente }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ c.comprasAnteriores }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-700 font-mono">{{ formatoMoneda(c.montoAnterior) }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 text-xs">{{ formatFecha(c.ultimaCompra) }}</td>
                    <td class="px-4 py-3 text-right">
                      <span class="inline-flex items-center gap-1 text-xs font-bold"
                        [class]="c.mesesSinCompra > 6 ? 'text-red-600' : c.mesesSinCompra > 3 ? 'text-amber-600' : 'text-gray-600'">
                        <lucide-icon [name]="c.mesesSinCompra > 6 ? 'alert-octagon' : 'clock'" class="w-3.5 h-3.5"></lucide-icon>
                        {{ c.mesesSinCompra }} meses
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ formatoMoneda(c.promedioMensual) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Insight -->
        <div class="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <lucide-icon name="lightbulb" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"></lucide-icon>
          <div>
            <p class="text-xs font-black text-red-900 uppercase tracking-wider">Riesgo de churn</p>
            <p class="text-xs text-red-800 mt-1 leading-relaxed">
              <strong>{{ datos().length }}</strong> clientes dejaron de comprar durante al menos 2 meses.
              El ingreso potencial perdido es de <strong>{{ formatoMoneda(montoPerdido()) }}</strong>.
              Considere campañas de reactivación personalizada para estos clientes.
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class ChurnClientesComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<ClienteChurnDTO[]>([]);
  loading = signal(true);
  montoPerdido = signal(0);
  mesesPromedio = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.churnClientes().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.montoPerdido.set(d.reduce((s, x) => s + x.montoAnterior, 0));
        this.mesesPromedio.set(
          d.length > 0 ? Math.round(d.reduce((s, x) => s + x.mesesSinCompra, 0) / d.length) : 0
        );
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
    try { return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  }
}
