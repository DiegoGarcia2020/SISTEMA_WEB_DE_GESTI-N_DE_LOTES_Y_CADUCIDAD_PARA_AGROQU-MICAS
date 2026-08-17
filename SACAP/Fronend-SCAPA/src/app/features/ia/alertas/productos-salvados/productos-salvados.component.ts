import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { ProductoSalvadoDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-productos-salvados',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="shield-check" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Productos salvados por alertas</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Lotes que fueron vendidos antes de vencer gracias a las alertas de caducidad</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando productos salvados...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="shield-check" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay productos salvados registrados aún.</span>
          <span class="text-xs text-gray-400">Los productos aparecerán aquí cuando se vendan lotes antes de su fecha de vencimiento.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Lotes salvados</p>
              <p class="text-lg font-bold text-emerald-900 font-mono">{{ datos().length }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
              <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unidades vendidas</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ totalVendidas() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="percent" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tasa recuperación</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ tasaRecuperacion() }}%</p>
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
                  <th class="text-left px-4 py-3 font-bold">Lote</th>
                  <th class="text-right px-4 py-3 font-bold">Alertada</th>
                  <th class="text-right px-4 py-3 font-bold">Vendida</th>
                  <th class="text-right px-4 py-3 font-bold">% Recuperado</th>
                  <th class="text-right px-4 py-3 font-bold">Vencimiento</th>
                  <th class="text-left px-4 py-3 font-bold">Alerta</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of datos(); track p.idLote) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ p.nombreProducto }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ p.numeroLote }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">{{ p.cantidadAlertada }}</td>
                    <td class="px-4 py-3 text-right font-bold text-emerald-600 font-mono">{{ p.cantidadVendida }}</td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <div class="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div class="h-full bg-emerald-500 rounded-full"
                            [style.width.%]="p.cantidadAlertada > 0 ? (p.cantidadVendida / p.cantidadAlertada * 100) : 0"></div>
                        </div>
                        <span class="text-xs font-bold text-gray-700 font-mono w-12 text-right">
                          {{ p.cantidadAlertada > 0 ? (p.cantidadVendida / p.cantidadAlertada * 100).toFixed(0) : 0 }}%
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right text-gray-600 text-xs">{{ formatFecha(p.fechaVencimiento) }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {{ p.nombreAlerta }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Insight -->
        <div class="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <lucide-icon name="lightbulb" class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"></lucide-icon>
          <div>
            <p class="text-xs font-black text-emerald-900 uppercase tracking-wider">Impacto</p>
            <p class="text-xs text-emerald-800 mt-1 leading-relaxed">
              Las alertas de caducidad permitieron recuperar <strong>{{ totalVendidas() }}</strong> unidades
              de <strong>{{ datos().length }}</strong> lotes antes de que vencieran, con una tasa de recuperación
              del <strong>{{ tasaRecuperacion() }}%</strong>.
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductosSalvadosComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<ProductoSalvadoDTO[]>([]);
  loading = signal(true);
  totalVendidas = signal(0);
  tasaRecuperacion = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.productosSalvados().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.totalVendidas.set(d.reduce((s, x) => s + x.cantidadVendida, 0));
        const totalAlertadas = d.reduce((s, x) => s + x.cantidadAlertada, 0);
        this.tasaRecuperacion.set(
          totalAlertadas > 0 ? Math.round(this.totalVendidas() / totalAlertadas * 100) : 0
        );
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  formatFecha(f: string | null): string {
    if (!f) return '—';
    try { return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }); }
    catch { return '—'; }
  }
}
