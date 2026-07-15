import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { AlertaCaducidadDTO, ReglaNegocioIADTO } from '../../../core/models/operaciones.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-alertas-caducidad',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Alertas Inteligentes de Caducidad e Inventario" 
                          subtitle="Monitoreo predictivo AgroSense de agroquímicos, fertilizantes y semillas próximas a vencer para evitar pérdidas en bodega.">
        <button (click)="openConfigModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="sliders" class="w-4 h-4 text-amber-400"></lucide-icon>
          <span>Configurar Umbrales IA</span>
        </button>
      </app-section-header>

      <!-- Barra de Filtros -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <lucide-icon name="filter" class="w-4 h-4 text-gray-400"></lucide-icon>
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridad:</span>
          <div class="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button (click)="filterPrioridad.set('TODAS')" [class.bg-white]="filterPrioridad() === 'TODAS'" [class.shadow-2xs]="filterPrioridad() === 'TODAS'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">Todas</button>
            <button (click)="filterPrioridad.set('URGENTE')" [class.bg-red-600]="filterPrioridad() === 'URGENTE'" [class.text-white]="filterPrioridad() === 'URGENTE'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">⚡ Urgentes</button>
            <button (click)="filterPrioridad.set('ALTA')" [class.bg-amber-600]="filterPrioridad() === 'ALTA'" [class.text-white]="filterPrioridad() === 'ALTA'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">Altas</button>
            <button (click)="filterPrioridad.set('MEDIA')" [class.bg-blue-600]="filterPrioridad() === 'MEDIA'" [class.text-white]="filterPrioridad() === 'MEDIA'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">Medias</button>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="font-bold text-gray-700">Estado:</span>
          <select [(ngModel)]="filterEstado" class="px-3 py-1.5 border border-gray-300 rounded-xl bg-white font-semibold outline-none focus:border-[#0B4628]">
            <option value="ACTIVA">Solo Activas</option>
            <option value="TODAS">Ver Todas</option>
            <option value="EN_PROMOCION">En Promoción IA</option>
            <option value="DESCARTADA">Descartadas</option>
          </select>
        </div>
      </div>

      <!-- Grid de Alertas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (a of filteredAlertas(); track a.idAlerta) {
          <div [class]="getBorderClass(a)" 
               class="bg-white rounded-2xl border-2 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
            
            @if (a.nivelPrioridad === 'URGENTE' && a.estado === 'ACTIVA') {
              <div class="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                <span>Crítico</span>
              </div>
            }

            <div>
              <div class="flex items-center gap-2.5 mb-2">
                <span class="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">{{ a.codigoLote }}</span>
                <span [class]="getPriorityBadge(a)" class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {{ a.nivelPrioridad }}
                </span>
              </div>

              <h3 class="font-extrabold text-base text-gray-900 group-hover:text-[#0B4628] transition-colors leading-tight">{{ a.nombreProducto }}</h3>
              
              <div class="mt-3 space-y-1.5 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <div class="flex justify-between">
                  <span class="text-gray-400">Bodega / Almacén:</span>
                  <span class="font-semibold text-gray-800">{{ a.bodega }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Stock disponible:</span>
                  <span class="font-bold text-gray-900">{{ a.stockActual }} {{ a.unidadMedida }}</span>
                </div>
                <div class="flex justify-between border-t border-gray-200/60 pt-1.5 mt-1.5">
                  <span class="text-gray-400">Fecha vencimiento:</span>
                  <span class="font-mono font-bold text-red-600">{{ a.fechaCaducidad }}</span>
                </div>
              </div>
            </div>

            <!-- Días restantes y Botones de Acción -->
            <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <lucide-icon name="clock" class="w-4 h-4 text-gray-400"></lucide-icon>
                <span class="text-sm font-extrabold" [class.text-red-600]="a.diasRestantes <= 15" [class.text-amber-600]="a.diasRestantes > 15">
                  Vence en {{ a.diasRestantes }} días
                </span>
              </div>

              <div class="flex items-center gap-1.5">
                @if (a.estado === 'ACTIVA') {
                  <button (click)="solicitarPromo(a)" 
                          class="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          title="Generar combo o descuento IA automático para liquidar">
                    <lucide-icon name="sparkles" class="w-3.5 h-3.5 text-amber-300"></lucide-icon>
                    <span>Promo IA</span>
                  </button>
                  <button (click)="descartar(a)" 
                          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Descartar alerta">
                    <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                  </button>
                } @else if (a.estado === 'EN_PROMOCION') {
                  <span class="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                    <lucide-icon name="sparkles" class="w-3.5 h-3.5 text-purple-600"></lucide-icon>
                    <span>En Promo</span>
                  </span>
                } @else {
                  <span class="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-xl">
                    Descartada
                  </span>
                }
              </div>
            </div>

          </div>
        } @empty {
          <div class="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200/80">
            <lucide-icon name="check-circle" class="w-16 h-16 mx-auto text-green-500 mb-3"></lucide-icon>
            <h3 class="font-bold text-gray-900 text-lg">Excelente: No hay lotes en riesgo inminente</h3>
            <p class="text-sm text-gray-500 mt-1">Todos los agroquímicos y fertilizantes se encuentran dentro de los parámetros de frescura óptimos.</p>
          </div>
        }
      </div>

      <!-- MODAL CONFIGURACIÓN DE UMBRALES -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
              <div class="flex items-center gap-2">
                <lucide-icon name="sliders" class="w-5 h-5 text-amber-400"></lucide-icon>
                <h3 class="font-bold text-base">Umbrales y Modelo de Inteligencia Artificial</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="p-1 text-gray-400 hover:text-white rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Días de Anticipación para Alerta</label>
                <div class="flex items-center gap-3">
                  <input type="range" [(ngModel)]="regla.diasAlertaAnticipada" min="15" max="120" step="5" class="flex-1 accent-[#0B4628] cursor-pointer">
                  <span class="font-extrabold text-base text-[#0B4628] bg-green-50 px-3 py-1 rounded-xl border border-green-200">{{ regla.diasAlertaAnticipada }} días</span>
                </div>
                <p class="text-[11px] text-gray-500 mt-1.5">AgroSense disparará alertas rojas automáticamente cuando un lote entre en este periodo de gracia antes de vencer.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descuento Máximo en Promociones Automáticas</label>
                <div class="flex items-center gap-3">
                  <input type="range" [(ngModel)]="regla.descuentoMaximo" min="5" max="50" step="5" class="flex-1 accent-purple-600 cursor-pointer">
                  <span class="font-extrabold text-base text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">{{ regla.descuentoMaximo }}% max</span>
                </div>
              </div>

              <div class="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                <div>
                  <span class="text-xs font-bold text-gray-900 block">Autogenerar Sugerencias IA</span>
                  <span class="text-[10px] text-gray-500">Crear borrador de combo al detectar urgencias</span>
                </div>
                <input type="checkbox" [(ngModel)]="regla.activarPromociones" class="w-5 h-5 text-[#0B4628] rounded cursor-pointer">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Motor IA Activo en Servidor</label>
                <input type="text" [(ngModel)]="regla.modeloIaActivo" readonly
                       class="w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-xl text-xs font-mono text-gray-600 outline-none">
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveRegla()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AlertasCaducidadComponent implements OnInit {
  private opService = inject(OperacionesService);
  private toast = inject(ToastService);

  alertas = signal<AlertaCaducidadDTO[]>([]);
  filterPrioridad = signal<string>('TODAS');
  filterEstado = 'ACTIVA';

  isModalOpen = signal<boolean>(false);
  regla: ReglaNegocioIADTO = { idRegla: 1, descuentoMaximo: 35, activarPromociones: true, diasAlertaAnticipada: 60, modeloIaActivo: 'AgroSense Predictor v2.4' };

  ngOnInit(): void {
    this.loadData();
    this.opService.obtenerReglaNegocioIA().subscribe(r => this.regla = { ...r });
  }

  loadData(): void {
    this.opService.listarAlertas().subscribe(data => this.alertas.set(data));
  }

  filteredAlertas = computed(() => {
    return this.alertas().filter(a => {
      const matchPrio = this.filterPrioridad() === 'TODAS' || a.nivelPrioridad === this.filterPrioridad();
      const matchEst = this.filterEstado === 'TODAS' || a.estado === this.filterEstado;
      return matchPrio && matchEst;
    });
  });

  getBorderClass(a: AlertaCaducidadDTO): string {
    if (a.estado !== 'ACTIVA') return 'border-gray-200/60 opacity-75';
    if (a.nivelPrioridad === 'URGENTE') return 'border-red-500/80 bg-gradient-to-b from-red-50/30 to-white shadow-red-500/5';
    if (a.nivelPrioridad === 'ALTA') return 'border-amber-400/80';
    return 'border-gray-200/80';
  }

  getPriorityBadge(a: AlertaCaducidadDTO): string {
    if (a.nivelPrioridad === 'URGENTE') return 'bg-red-100 text-red-800 border border-red-200';
    if (a.nivelPrioridad === 'ALTA') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (a.nivelPrioridad === 'MEDIA') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  }

  solicitarPromo(a: AlertaCaducidadDTO): void {
    this.opService.solicitarPromocionAlerta(a.idAlerta).subscribe({
      next: (promo) => {
        this.toast.success('⚡ Sugerencia IA Generada', `Se creó el combo "${promo.titulo}" con ${promo.descuentoSugerido}% de descuento sugerido. Revisa la pestaña Combos & IA.`);
        this.loadData();
      }
    });
  }

  descartar(a: AlertaCaducidadDTO): void {
    this.opService.descartarAlerta(a.idAlerta).subscribe({
      next: () => {
        this.toast.info('Alerta Descartada', `El lote ${a.codigoLote} fue removido del monitoreo activo.`);
        this.loadData();
      }
    });
  }

  openConfigModal(): void {
    this.isModalOpen.set(true);
  }

  saveRegla(): void {
    this.opService.actualizarReglaNegocioIA(this.regla).subscribe({
      next: () => {
        this.toast.success('Parámetros actualizados', 'Los umbrales de alerta e inteligencia artificial fueron aplicados.');
        this.isModalOpen.set(false);
      }
    });
  }
}
