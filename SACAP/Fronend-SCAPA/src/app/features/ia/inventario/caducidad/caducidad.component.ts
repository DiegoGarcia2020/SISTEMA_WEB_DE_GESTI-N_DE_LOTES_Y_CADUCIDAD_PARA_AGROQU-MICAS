import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { LoteProximoVencerDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-caducidad',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <lucide-icon name="alert-triangle" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Lotes próximos a vencer</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Lotes que vencen en los próximos días según el umbral seleccionado</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <lucide-icon name="clock" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></lucide-icon>
            <select [ngModel]="dias()" (ngModelChange)="cambiarDias($event)"
              class="pl-9 pr-8 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 bg-white outline-none cursor-pointer focus:border-[#0B4628]/50">
              <option [value]="7">Próximos 7 días</option>
              <option [value]="15">Próximos 15 días</option>
              <option [value]="30">Próximos 30 días</option>
              <option [value]="60">Próximos 60 días</option>
              <option [value]="90">Próximos 90 días</option>
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
          <span class="text-sm text-gray-500">Verificando lotes próximos a vencer...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="check-circle-2" class="w-8 h-8 text-emerald-500"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No hay lotes próximos a vencer en este rango.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-red-50 border border-red-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <lucide-icon name="alert-octagon" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">Críticos (≤7 días)</p>
              <p class="text-lg font-bold text-red-900 font-mono">{{ criticos() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-amber-50 border border-amber-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <lucide-icon name="alert-triangle" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Moderados (8-15 días)</p>
              <p class="text-lg font-bold text-amber-900 font-mono">{{ moderados() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
              <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total lotes</p>
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
                  <th class="text-left px-4 py-3 font-bold">Nivel</th>
                  <th class="text-left px-4 py-3 font-bold">Producto</th>
                  <th class="text-left px-4 py-3 font-bold">Lote</th>
                  <th class="text-right px-4 py-3 font-bold">Cantidad</th>
                  <th class="text-right px-4 py-3 font-bold">Vence</th>
                  <th class="text-right px-4 py-3 font-bold">Días rest.</th>
                  <th class="text-left px-4 py-3 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (lote of datos(); track lote.idLote) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                        [class]="badgeNivel(lote.nivelAlerta)">
                        <lucide-icon [name]="iconoNivel(lote.nivelAlerta)" class="w-3 h-3"></lucide-icon>
                        {{ lote.nivelAlerta }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ lote.nombreProducto }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ lote.numeroLote }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">{{ lote.cantidadActual }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 text-xs">{{ formatFecha(lote.fechaVencimiento) }}</td>
                    <td class="px-4 py-3 text-right font-bold font-mono"
                      [class]="lote.diasRestantes <= 7 ? 'text-red-600' : lote.diasRestantes <= 15 ? 'text-amber-600' : 'text-gray-600'">
                      {{ lote.diasRestantes }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-xs font-semibold"
                        [class]="lote.estadoLote === 'ACTIVO' ? 'text-emerald-600' : 'text-gray-500'">
                        {{ lote.estadoLote }}
                      </span>
                    </td>
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
export class CaducidadComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  dias = signal(30);
  datos = signal<LoteProximoVencerDTO[]>([]);
  loading = signal(true);
  criticos = signal(0);
  moderados = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.caducidad(this.dias()).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.criticos.set(d.filter(x => x.diasRestantes <= 7).length);
        this.moderados.set(d.filter(x => x.diasRestantes > 7 && x.diasRestantes <= 15).length);
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  cambiarDias(v: number | string): void {
    this.dias.set(Number(v));
    this.cargar();
  }

  formatFecha(f: string | null): string {
    if (!f) return '—';
    try { return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }); }
    catch { return '—'; }
  }

  badgeNivel(nivel: string): string {
    const n = (nivel || '').toUpperCase();
    if (n === 'CRÍTICO' || n === 'CRITICO') return 'bg-red-100 text-red-700';
    if (n === 'ALTO') return 'bg-amber-100 text-amber-700';
    if (n === 'MEDIO') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  }

  iconoNivel(nivel: string): string {
    const n = (nivel || '').toUpperCase();
    if (n === 'CRÍTICO' || n === 'CRITICO') return 'alert-octagon';
    if (n === 'ALTO') return 'alert-triangle';
    return 'clock';
  }
}
