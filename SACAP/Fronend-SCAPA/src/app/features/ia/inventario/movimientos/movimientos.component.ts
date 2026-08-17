import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { MovimientoProductoDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <lucide-icon name="arrow-left-right" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Movimientos de inventario</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Historial de entradas y salidas de inventario</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="date" [ngModel]="desde()" (ngModelChange)="desde.set($event)"
            class="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 bg-white outline-none focus:border-[#0B4628]/50" />
          <span class="text-xs text-gray-400">a</span>
          <input type="date" [ngModel]="hasta()" (ngModelChange)="hasta.set($event)"
            class="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 bg-white outline-none focus:border-[#0B4628]/50" />
          <button (click)="cargar()" title="Buscar"
            class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all">
            <lucide-icon name="search" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando movimientos...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="arrow-left-right" class="w-8 h-8 text-gray-300"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay movimientos en el rango seleccionado.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <lucide-icon name="arrow-down-left" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Entradas</p>
              <p class="text-lg font-bold text-emerald-900 font-mono">{{ entradas() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-red-50 border border-red-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <lucide-icon name="arrow-up-right" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">Salidas</p>
              <p class="text-lg font-bold text-red-900 font-mono">{{ salidas() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
              <lucide-icon name="list" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</p>
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
                  <th class="text-left px-4 py-3 font-bold">Fecha</th>
                  <th class="text-left px-4 py-3 font-bold">Tipo</th>
                  <th class="text-left px-4 py-3 font-bold">Producto</th>
                  <th class="text-left px-4 py-3 font-bold">Lote</th>
                  <th class="text-right px-4 py-3 font-bold">Cantidad</th>
                  <th class="text-left px-4 py-3 font-bold">Usuario</th>
                  <th class="text-left px-4 py-3 font-bold">Observación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (m of datos(); track m.idMovimiento) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 text-xs text-gray-600">{{ formatFecha(m.fechaMovimiento) }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                        [class]="m.naturaleza === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                        {{ m.tipoMovimiento }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ m.nombreProducto }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ m.numeroLote }}</td>
                    <td class="px-4 py-3 text-right font-bold font-mono"
                      [class]="m.naturaleza === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'">
                      {{ m.naturaleza === 'ENTRADA' ? '+' : '-' }}{{ m.cantidad }}
                    </td>
                    <td class="px-4 py-3 text-gray-600 text-xs">{{ m.usuario }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{{ m.observacion }}</td>
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
export class MovimientosComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  desde = signal(this.fechaDefault(-7));
  hasta = signal(this.fechaDefault(0));
  datos = signal<MovimientoProductoDTO[]>([]);
  loading = signal(true);
  entradas = signal(0);
  salidas = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    const desdeStr = this.desde() + 'T00:00:00';
    const hastaStr = this.hasta() + 'T23:59:59';
    this.analisisService.movimientos(desdeStr, hastaStr).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.entradas.set(d.filter(x => x.naturaleza === 'ENTRADA').length);
        this.salidas.set(d.filter(x => x.naturaleza === 'SALIDA').length);
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  formatFecha(f: string | null): string {
    if (!f) return '—';
    try { return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch { return '—'; }
  }

  private fechaDefault(diasOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + diasOffset);
    return d.toISOString().slice(0, 10);
  }
}
