import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { UsuarioAnulacionDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-anulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <lucide-icon name="x-circle" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Usuarios con anulaciones frecuentes</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Operaciones de auditoría de tipo ANULACION por usuario</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <lucide-icon name="calendar" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></lucide-icon>
            <select [ngModel]="semanas()" (ngModelChange)="cambiarSemanas($event)"
              class="pl-9 pr-8 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 bg-white outline-none cursor-pointer focus:border-[#0B4628]/50">
              <option [value]="2">Últimas 2 semanas</option>
              <option [value]="4">Últimas 4 semanas</option>
              <option [value]="8">Últimas 8 semanas</option>
              <option [value]="12">Últimas 12 semanas</option>
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
          <span class="text-sm text-gray-500">Cargando anulaciones...</span>
        </div>
      } @else if (datos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="check-circle-2" class="w-8 h-8 text-emerald-500"></lucide-icon>
          <span class="text-sm font-semibold text-gray-600">No se registran anulaciones en este período.</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-red-50 border border-red-200/80 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <lucide-icon name="users" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">Usuarios afectados</p>
              <p class="text-lg font-bold text-red-900 font-mono">{{ datos().length }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
              <lucide-icon name="x-circle" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total anulaciones</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ totalOperaciones() }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <lucide-icon name="table-2" class="w-4 h-4"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tablas afectadas</p>
              <p class="text-lg font-bold text-gray-900 font-mono">{{ tablasAfectadas() }}</p>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="rounded-xl border border-gray-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th class="text-left px-4 py-3 font-bold">Usuario</th>
                  <th class="text-left px-4 py-3 font-bold">Operación</th>
                  <th class="text-left px-4 py-3 font-bold">Tabla</th>
                  <th class="text-right px-4 py-3 font-bold">Operaciones</th>
                  <th class="text-right px-4 py-3 font-bold">Última operación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (u of datos(); track u.idUsuario) {
                  <tr class="hover:bg-gray-50/70 transition-colors">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ u.correo }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                        {{ u.operacion }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ u.tablaAfectada }}</td>
                    <td class="px-4 py-3 text-right font-bold text-red-600 font-mono">{{ u.totalOperaciones }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 text-xs">{{ formatFecha(u.ultimaOperacion) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Alerta -->
        <div class="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <lucide-icon name="alert-triangle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"></lucide-icon>
          <div>
            <p class="text-xs font-black text-red-900 uppercase tracking-wider">Alerta de auditoría</p>
            <p class="text-xs text-red-800 mt-1 leading-relaxed">
              Se detectaron <strong>{{ datos().length }}</strong> usuarios con operaciones de anulación
              en las últimas <strong>{{ semanas() }}</strong> semanas. Revise los registros de auditoría
              para verificar la regularidad de estas operaciones.
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class AnulacionesComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  semanas = signal(4);
  datos = signal<UsuarioAnulacionDTO[]>([]);
  loading = signal(true);
  totalOperaciones = signal(0);
  tablasAfectadas = signal(0);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.anulaciones(this.semanas()).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.totalOperaciones.set(d.reduce((s, x) => s + x.totalOperaciones, 0));
        this.tablasAfectadas.set(new Set(d.map(x => x.tablaAfectada)).size);
        this.loading.set(false);
      },
      error: () => { this.datos.set([]); this.loading.set(false); }
    });
  }

  cambiarSemanas(v: number | string): void {
    this.semanas.set(Number(v));
    this.cargar();
  }

  formatFecha(f: string | null | undefined): string {
    if (!f) return '—';
    try { return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch { return '—'; }
  }
}
