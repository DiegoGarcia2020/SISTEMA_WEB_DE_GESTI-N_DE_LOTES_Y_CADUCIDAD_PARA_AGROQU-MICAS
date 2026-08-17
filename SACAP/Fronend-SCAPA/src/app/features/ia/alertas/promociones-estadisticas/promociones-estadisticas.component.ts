import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AnalisisService } from '../../../../core/services/analisis.service';
import { EstadisticaPromocionesDTO } from '../../../../core/models/analisis.model';

@Component({
  selector: 'app-promociones-estadisticas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <lucide-icon name="badge-percent" class="w-5 h-5"></lucide-icon>
            </span>
            <span>Promociones IA - % Aprobación</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1.5">Tasa de aprobación de sugerencias de promociones generadas por IA</p>
        </div>
        <button (click)="cargar()" title="Actualizar"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0B4628] hover:border-[#0B4628]/40 transition-all self-start">
          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <lucide-icon name="loader-circle" class="w-8 h-8 text-[#0B4628] animate-spin"></lucide-icon>
          <span class="text-sm text-gray-500">Cargando estadísticas de promociones...</span>
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 mt-4">
          <div class="rounded-xl bg-purple-50 border border-purple-200/80 p-4 flex flex-col items-center text-center gap-1">
            <p class="text-3xl font-black text-purple-700 font-mono">{{ datos().porcentajeAprobacion }}%</p>
            <p class="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Aprobación</p>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 flex flex-col items-center text-center gap-1">
            <p class="text-3xl font-black text-gray-900 font-mono">{{ datos().totalSugeridas }}</p>
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sugeridas</p>
          </div>
          <div class="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 flex flex-col items-center text-center gap-1">
            <p class="text-3xl font-black text-emerald-700 font-mono">{{ datos().aprobadas }}</p>
            <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Aprobadas</p>
          </div>
          <div class="rounded-xl bg-blue-50 border border-blue-200/80 p-4 flex flex-col items-center text-center gap-1">
            <p class="text-3xl font-black text-blue-700 font-mono">{{ datos().activas }}</p>
            <p class="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Activas</p>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="rounded-xl border border-gray-200/80 p-6 mb-6">
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">Tasa de aprobación</h4>
          <div class="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000"
              [style.width.%]="datos().porcentajeAprobacion"
              [class]="datos().porcentajeAprobacion >= 70 ? 'bg-emerald-500' : datos().porcentajeAprobacion >= 40 ? 'bg-amber-500' : 'bg-red-500'">
            </div>
            <span class="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-800">
              {{ datos().porcentajeAprobacion }}%
            </span>
          </div>
          <div class="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <!-- Insight -->
        <div class="rounded-xl border border-purple-200 bg-purple-50 p-4 flex items-start gap-3">
          <lucide-icon name="lightbulb" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"></lucide-icon>
          <div>
            <p class="text-xs font-black text-purple-900 uppercase tracking-wider">Insight</p>
            <p class="text-xs text-purple-800 mt-1 leading-relaxed">
              De las <strong>{{ datos().totalSugeridas }}</strong> sugerencias de promociones generadas por IA,
              <strong>{{ datos().aprobadas }}</strong> fueron aprobadas
              (<strong>{{ datos().porcentajeAprobacion }}%</strong>).
              Actualmente hay <strong>{{ datos().activas }}</strong> promociones activas en el sistema.
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class PromocionesEstadisticasComponent implements OnInit {
  private analisisService = inject(AnalisisService);

  datos = signal<EstadisticaPromocionesDTO>({
    aprobadas: 0, totalSugeridas: 0, activas: 0, porcentajeAprobacion: 0
  });
  loading = signal(true);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.analisisService.estadisticasPromociones().subscribe({
      next: (d) => { this.datos.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
