import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { TemporadaDTO, FaseAgrariaDTO } from '../../../core/models/operaciones.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gestion-temporadas',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Calendario y Gestión de Temporadas Agrícolas SACPA" 
                          subtitle="Planificación agronómica, timeline de fases de cultivo (siembra de loritos, fumigación, cosecha) y monitoreo de campañas.">
        <div class="flex items-center gap-2">
          <button (click)="openCreateModal()" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
            <span>+ Aperturar Campaña</span>
          </button>
        </div>
      </app-section-header>

      <!-- 3 Tarjetas KPI -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-gradient-to-br from-[#0B4628] to-[#146C43] text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between z-10">
            <span class="text-xs font-bold uppercase tracking-wider text-green-200">Campaña Activa en Fundo</span>
            <lucide-icon name="sprout" class="w-6 h-6 text-green-300"></lucide-icon>
          </div>
          <div class="mt-4 z-10">
            <h3 class="text-lg font-extrabold truncate">{{ activeSeason()?.nombre || 'Sin Campaña Activa' }}</h3>
            <p class="text-xs text-green-100 mt-0.5">{{ activeSeason()?.cultivo || 'Planificando siembra' }}</p>
          </div>
          @if (activeSeason()) {
            <div class="mt-4 z-10">
              <div class="flex justify-between text-[11px] font-semibold text-green-200 mb-1">
                <span>Avance de temporada</span>
                <span>{{ activeSeason()?.progresoPorcentaje }}%</span>
              </div>
              <div class="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                <div class="bg-green-300 h-full rounded-full transition-all duration-500" [style.width.%]="activeSeason()?.progresoPorcentaje"></div>
              </div>
            </div>
          }
          <lucide-icon name="calendar" class="w-32 h-32 absolute -right-6 -bottom-6 text-white/5"></lucide-icon>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner flex-shrink-0">
            <lucide-icon name="award" class="w-7 h-7"></lucide-icon>
          </div>
          <div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block">Campañas Cerradas / Histórico</span>
            <span class="text-2xl font-extrabold text-gray-900">{{ closedCount() }}</span>
            <span class="text-xs text-green-600 font-semibold block mt-0.5">● Rendimiento agronómico en meta</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shadow-inner flex-shrink-0">
            <lucide-icon name="clock" class="w-7 h-7"></lucide-icon>
          </div>
          <div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block">Campañas Planificadas</span>
            <span class="text-2xl font-extrabold text-gray-900">{{ plannedCount() }}</span>
            <span class="text-xs text-amber-600 font-semibold block mt-0.5">Rotación de cultivos en espera</span>
          </div>
        </div>
      </div>

      <!-- Selector de Pestañas (Calendario Gantt vs Listado) -->
      <div class="flex items-center justify-between border-b border-gray-200">
        <div class="flex items-center gap-2">
          <button (click)="activeTab.set('GANTT')"
                  [class]="activeTab() === 'GANTT' ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                  class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
            <lucide-icon name="calendar" class="w-4 h-4"></lucide-icon>
            <span>Calendario Agrícola & Timeline por Fases</span>
            <span class="bg-green-100 text-[#0B4628] text-xs px-2 py-0.5 rounded-full font-bold">Interactivo</span>
          </button>

          <button (click)="activeTab.set('LISTADO')"
                  [class]="activeTab() === 'LISTADO' ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                  class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
            <lucide-icon name="list" class="w-4 h-4"></lucide-icon>
            <span>Listado General de Campañas</span>
            <span class="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">{{ temporadas().length }}</span>
          </button>
        </div>

        @if (activeTab() === 'GANTT' && selectedSeason()) {
          <button (click)="openAddFaseModal(selectedSeason()!)"
                  class="px-3.5 py-1.5 bg-[#0B4628]/10 hover:bg-[#0B4628] text-[#0B4628] hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-[#0B4628]/20">
            <lucide-icon name="plus-circle" class="w-4 h-4"></lucide-icon>
            <span>+ Añadir Fase o Hito Agrícola</span>
          </button>
        }
      </div>

      @if (activeTab() === 'GANTT') {
        <!-- VISTA CALENDARIO & TIMELINE POR FASES -->
        <div class="space-y-6 animate-fade-in">
          
          <!-- Selector de Temporada para el Calendario -->
          <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaña a Visualizar:</span>
              <select [ngModel]="selectedSeasonId()" (ngModelChange)="onSelectSeason($event)"
                      class="px-4 py-2 border border-gray-300 rounded-xl text-sm font-bold bg-gray-50/80 text-gray-900 outline-none focus:border-[#0B4628]">
                @for (t of temporadas(); track t.idTemporada) {
                  <option [value]="t.idTemporada">{{ t.nombre }} ({{ t.cultivo }}) - {{ t.estado }}</option>
                }
              </select>
            </div>

            @if (selectedSeason()) {
              <div class="flex items-center gap-4 text-xs">
                <span class="text-gray-500">Periodo: <b class="text-gray-900 font-mono">{{ selectedSeason()!.fechaInicio }} al {{ selectedSeason()!.fechaFinProyectada }}</b></span>
                <span [class]="selectedSeason()!.estado === 'ACTIVA' ? 'bg-green-100 text-[#0B4628]' : 'bg-gray-100 text-gray-700'"
                      class="px-2.5 py-1 rounded-full font-extrabold uppercase text-[10px]">
                  {{ selectedSeason()!.estado }}
                </span>
              </div>
            }
          </div>

          <!-- Timeline Cronológico de Fases Agrícolas -->
          @if (selectedSeason(); as season) {
            <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div class="p-5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h3 class="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <lucide-icon name="calendar" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                    <span>Cronograma y Fases Agrícolas: {{ season.nombre }}</span>
                  </h3>
                  <p class="text-xs text-gray-500 mt-0.5">Control de etapas agronómicas y asignación de insumos requeridos en campo.</p>
                </div>
                <div class="text-right">
                  <span class="text-xs font-bold text-gray-400 uppercase block">Progreso Global</span>
                  <span class="text-lg font-black text-[#0B4628]">{{ season.progresoPorcentaje }}%</span>
                </div>
              </div>

              <!-- Fases Cronológicas -->
              <div class="p-6">
                <div class="relative border-l-2 border-green-600/30 ml-4 space-y-8 pl-6">
                  @for (f of season.fases || []; track f.idFase || $index) {
                    <div class="relative group">
                      <!-- Punto de Timeline -->
                      <div [class]="getFaseIconBg(f.estadoFase)"
                           class="absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        <lucide-icon [name]="getFaseIcon(f.tipoActividad)" class="w-3.5 h-3.5"></lucide-icon>
                      </div>

                      <!-- Tarjeta de Fase -->
                      <div class="bg-gray-50/70 hover:bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-[#0B4628]/50 shadow-2xs hover:shadow-md transition-all">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div class="flex items-center gap-2">
                              <span [class]="getTipoBadge(f.tipoActividad)"
                                    class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                                {{ f.tipoActividad }}
                              </span>
                              <h4 class="font-bold text-base text-gray-900">{{ f.nombreFase }}</h4>
                            </div>
                            <p class="text-xs text-gray-600 mt-1">{{ f.observaciones || 'Sin observaciones detalladas' }}</p>
                          </div>

                          <div class="flex items-center gap-2">
                            <span class="font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700">
                              📅 {{ f.fechaInicio }} ➔ {{ f.fechaFin }}
                            </span>
                            <span [class]="getEstadoFaseBadge(f.estadoFase)"
                                  class="text-xs font-extrabold px-3 py-1.5 rounded-xl">
                              {{ formatEstadoFase(f.estadoFase) }}
                            </span>
                          </div>
                        </div>

                        <!-- Insumos Requeridos -->
                        @if (f.insumosRequeridos && f.insumosRequeridos.length > 0) {
                          <div class="mt-4 pt-3 border-t border-gray-200/70 flex flex-wrap items-center gap-2">
                            <span class="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                              <lucide-icon name="package" class="w-3.5 h-3.5 text-gray-400"></lucide-icon>
                              <span>Insumos y Agroquímicos:</span>
                            </span>
                            @for (ins of f.insumosRequeridos; track ins) {
                              <span class="text-xs font-semibold bg-white text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-2xs">
                                {{ ins }}
                              </span>
                            }
                          </div>
                        }

                        <!-- Botones de Cambio Rápido de Estado -->
                        <div class="mt-4 flex items-center justify-end gap-2 pt-2">
                          @if (f.estadoFase !== 'COMPLETADA') {
                            <button (click)="cambiarEstadoFase(f, 'COMPLETADA')"
                                    class="px-3 py-1.5 bg-green-100 hover:bg-[#0B4628] text-[#0B4628] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                              <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                              <span>Marcar Completada</span>
                            </button>
                          }
                          @if (f.estadoFase === 'PENDIENTE') {
                            <button (click)="cambiarEstadoFase(f, 'EN_CURSO')"
                                    class="px-3 py-1.5 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                              <lucide-icon name="play" class="w-3.5 h-3.5"></lucide-icon>
                              <span>Iniciar Fase</span>
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="py-12 text-center text-gray-400">
                      <p class="text-sm font-medium">Esta temporada aún no tiene fases programadas.</p>
                      <button (click)="openAddFaseModal(season)" class="mt-3 px-4 py-2 bg-[#0B4628] text-white text-xs font-bold rounded-xl shadow-sm">
                        + Agregar Primera Fase
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- VISTA LISTADO GENERAL -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden animate-fade-in">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-600">
            <span class="font-bold">Monitoreo de ciclos de cultivo y proyecciones de cosecha en AgroSense</span>
            <span class="text-[#0B4628] font-semibold">Total: {{ temporadas().length }} registros</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="py-4 px-6">Nombre de la Temporada</th>
                  <th class="py-4 px-6">Cultivo / Especie</th>
                  <th class="py-4 px-6">Periodo Proyectado</th>
                  <th class="py-4 px-6">Fases / Avance</th>
                  <th class="py-4 px-6">Estado</th>
                  <th class="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (t of temporadas(); track t.idTemporada) {
                  <tr class="hover:bg-green-50/20 transition-colors group">
                    <td class="py-4 px-6 font-bold text-gray-900">
                      <div>{{ t.nombre }}</div>
                      <span class="text-[10px] font-normal text-gray-400">ID: CAM-2026-{{ t.idTemporada }}</span>
                    </td>
                    <td class="py-4 px-6 font-semibold text-gray-700">{{ t.cultivo }}</td>
                    <td class="py-4 px-6 text-xs text-gray-600 font-mono">
                      <div>{{ t.fechaInicio }} ➔ {{ t.fechaFinProyectada }}</div>
                      @if (t.fechaFinReal) {
                        <span class="text-[10px] text-green-600 font-semibold">Cierre real: {{ t.fechaFinReal }}</span>
                      }
                    </td>
                    <td class="py-4 px-6">
                      <div class="text-xs font-bold text-gray-700">{{ (t.fases?.length || 0) }} fases programadas</div>
                      <div class="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div class="bg-[#0B4628] h-full" [style.width.%]="t.progresoPorcentaje"></div>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      @if (t.estado === 'ACTIVA') {
                        <span class="bg-green-100 text-[#0B4628] text-xs font-extrabold px-3 py-1 rounded-full">● Activa</span>
                      } @else if (t.estado === 'CERRADA') {
                        <span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">● Cerrada</span>
                      } @else {
                        <span class="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">⏱ Planificada</span>
                      }
                    </td>
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button (click)="verTimelineSeason(t)" class="px-3 py-1.5 bg-gray-100 hover:bg-[#0B4628] text-gray-700 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer" title="Ver Timeline por Fases">
                          Fases
                        </button>
                        @if (t.estado === 'PLANIFICADA') {
                          <button (click)="changeStatus(t, 'ACTIVA')" class="px-3 py-1.5 bg-green-50 hover:bg-[#0B4628] text-[#0B4628] hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                            Iniciar
                          </button>
                        }
                        @if (t.estado === 'ACTIVA') {
                          <button (click)="confirmCloseSeason(t)" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                            Cerrar
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL NUEVA TEMPORADA -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/60">
              <div class="flex items-center gap-2">
                <lucide-icon name="calendar" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                <h3 class="font-bold text-base text-gray-900">Aperturar Nueva Temporada</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de Campaña / Ciclo</label>
                <input type="text" [(ngModel)]="form.nombre" placeholder="Ej: Maíz Cosecha Verano 2026"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none font-bold">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Cultivo / Especie Agrícola</label>
                <select [(ngModel)]="form.cultivo" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white font-semibold">
                  <option value="Maíz Híbrido INIAP">Maíz Híbrido INIAP</option>
                  <option value="Cacao CCN-51 / Nacional">Cacao CCN-51 / Nacional</option>
                  <option value="Soja Variedad Tropical">Soja Variedad Tropical</option>
                  <option value="Arroz SFL-11">Arroz SFL-11</option>
                  <option value="Palma Africana">Palma Africana</option>
                  <option value="Bananero de Exportación">Bananero de Exportación</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Inicio</label>
                  <input type="date" [(ngModel)]="form.fechaInicio" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Fin Proyectado</label>
                  <input type="date" [(ngModel)]="form.fechaFinProyectada" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Estado Inicial</label>
                <select [(ngModel)]="form.estado" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white font-semibold">
                  <option value="PLANIFICADA">Planificada (En espera de rotación)</option>
                  <option value="ACTIVA">Activa (Iniciar siembra de inmediato)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Observaciones / Objetivos</label>
                <textarea [(ngModel)]="form.observaciones" rows="2" placeholder="Notas sobre fertilización, meta de rendimiento..."
                          class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none"></textarea>
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveSeason()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar Campaña</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL AGREGAR FASE / HITO AGRÍCOLA -->
      @if (isFaseModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/60">
              <div class="flex items-center gap-2">
                <lucide-icon name="plus-circle" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                <h3 class="font-bold text-base text-gray-900">Programar Nueva Fase Agrícola</h3>
              </div>
              <button (click)="isFaseModalOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Fase o Actividad</label>
                <input type="text" [(ngModel)]="faseForm.nombreFase" placeholder="Ej: Siembra Directa de Loritos en Lote Norte"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none font-bold">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Actividad Agrícola</label>
                <select [(ngModel)]="faseForm.tipoActividad" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white font-semibold">
                  <option value="PREPARACION">Preparación de Terreno & Poda</option>
                  <option value="SIEMBRA">Siembra / Almácigos / Loritos</option>
                  <option value="FUMIGACION">Fumigación & Control Fitosanitario</option>
                  <option value="FERTILIZACION">Fertilización Nitrogenada / Foliar</option>
                  <option value="COSECHA">Cosecha de Mazorcas / Grano</option>
                  <option value="SECADO">Secado, Fermentación & Almacenamiento</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Inicio</label>
                  <input type="date" [(ngModel)]="faseForm.fechaInicio" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha Fin</label>
                  <input type="date" [(ngModel)]="faseForm.fechaFin" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Insumos Requeridos (Separados por coma)</label>
                <input type="text" [(ngModel)]="faseFormInsumosStr" placeholder="Ej: Semilla Maíz Trueno, Urea 46%, Tractor"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Observaciones en Campo</label>
                <textarea [(ngModel)]="faseForm.observaciones" rows="2" placeholder="Indicaciones para el técnico agroindustrial..."
                          class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none"></textarea>
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isFaseModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveNuevaFase()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                <span>Añadir al Cronograma</span>
              </button>
            </div>
          </div>
        </div>
      }

      <app-confirm-dialog [isOpen]="isConfirmOpen()"
                          [title]="'Cerrar Oficialmente Temporada Agrícola'"
                          [message]="'⚠️ ¿Estás seguro de cerrar esta campaña agrícola? Esto consolidará los reportes de rendimiento y congelará el registro de nuevas siembras.'"
                          confirmText="Cerrar Campaña"
                          [isDanger]="true"
                          (cancel)="isConfirmOpen.set(false)"
                          (confirm)="executeCloseSeason()">
      </app-confirm-dialog>
    </div>
  `
})
export class GestionTemporadasComponent implements OnInit {
  private opService = inject(OperacionesService);
  private toast = inject(ToastService);

  activeTab = signal<'GANTT' | 'LISTADO'>('GANTT');
  temporadas = signal<TemporadaDTO[]>([]);
  selectedSeasonId = signal<number | null>(null);

  activeSeason = computed(() => this.temporadas().find(t => t.estado === 'ACTIVA'));
  closedCount = computed(() => this.temporadas().filter(t => t.estado === 'CERRADA').length);
  plannedCount = computed(() => this.temporadas().filter(t => t.estado === 'PLANIFICADA').length);

  selectedSeason = computed(() => {
    const id = this.selectedSeasonId();
    return this.temporadas().find(t => t.idTemporada === id) || this.temporadas()[0] || null;
  });

  isModalOpen = signal<boolean>(false);
  form = { nombre: '', cultivo: 'Maíz Híbrido INIAP', fechaInicio: '2026-07-03', fechaFinProyectada: '2026-11-30', estado: 'PLANIFICADA' as const, observaciones: '' };

  isFaseModalOpen = signal<boolean>(false);
  faseForm: FaseAgrariaDTO = {
    nombreFase: '',
    fechaInicio: '2026-07-05',
    fechaFin: '2026-07-25',
    tipoActividad: 'SIEMBRA',
    estadoFase: 'PENDIENTE',
    insumosRequeridos: [],
    observaciones: ''
  };
  faseFormInsumosStr = '';

  isConfirmOpen = signal<boolean>(false);
  seasonToClose = signal<TemporadaDTO | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.opService.listarTemporadas().subscribe(data => {
      this.temporadas.set(data);
      if (data.length > 0 && !this.selectedSeasonId()) {
        const activa = data.find(t => t.estado === 'ACTIVA');
        this.selectedSeasonId.set(activa ? activa.idTemporada : data[0].idTemporada);
      }
    });
  }

  onSelectSeason(idStr: any): void {
    this.selectedSeasonId.set(Number(idStr));
  }

  verTimelineSeason(t: TemporadaDTO): void {
    this.selectedSeasonId.set(t.idTemporada);
    this.activeTab.set('GANTT');
  }

  openCreateModal(): void {
    this.form = { nombre: '', cultivo: 'Maíz Híbrido INIAP', fechaInicio: '2026-07-03', fechaFinProyectada: '2026-11-30', estado: 'PLANIFICADA', observaciones: '' };
    this.isModalOpen.set(true);
  }

  saveSeason(): void {
    if (!this.form.nombre.trim()) {
      this.toast.warning('Validación', 'Debes ingresar un nombre para la temporada.');
      return;
    }
    this.opService.crearTemporada(this.form).subscribe({
      next: (res) => {
        this.toast.success('Campaña aperturada', `La temporada "${res.nombre}" ha sido registrada.`);
        this.isModalOpen.set(false);
        this.loadData();
      }
    });
  }

  openAddFaseModal(t: TemporadaDTO): void {
    this.selectedSeasonId.set(t.idTemporada);
    this.faseForm = {
      nombreFase: '',
      fechaInicio: '2026-07-05',
      fechaFin: '2026-07-25',
      tipoActividad: 'SIEMBRA',
      estadoFase: 'PENDIENTE',
      insumosRequeridos: [],
      observaciones: ''
    };
    this.faseFormInsumosStr = '';
    this.isFaseModalOpen.set(true);
  }

  saveNuevaFase(): void {
    if (!this.faseForm.nombreFase.trim()) {
      this.toast.warning('Validación', 'Ingresa el nombre de la fase o actividad agrícola.');
      return;
    }
    const s = this.selectedSeason();
    if (!s) return;

    const insumos = this.faseFormInsumosStr.split(',')
      .map(x => x.trim())
      .filter(x => x.length > 0);

    const nuevaFase: FaseAgrariaDTO = {
      idFase: Date.now(),
      nombreFase: this.faseForm.nombreFase.trim(),
      fechaInicio: this.faseForm.fechaInicio,
      fechaFin: this.faseForm.fechaFin,
      tipoActividad: this.faseForm.tipoActividad,
      estadoFase: 'PENDIENTE',
      insumosRequeridos: insumos,
      observaciones: this.faseForm.observaciones
    };

    if (!s.fases) s.fases = [];
    s.fases.push(nuevaFase);

    this.toast.success('Cronograma Actualizado', `Se añadió la fase "${nuevaFase.nombreFase}" a la campaña ${s.nombre}.`);
    this.isFaseModalOpen.set(false);
    this.temporadas.set([...this.temporadas()]);
  }

  cambiarEstadoFase(fase: FaseAgrariaDTO, estado: 'COMPLETADA' | 'EN_CURSO'): void {
    fase.estadoFase = estado;
    this.toast.success('Estado de Fase', `La actividad "${fase.nombreFase}" ahora se encuentra: ${this.formatEstadoFase(estado)}.`);
    this.temporadas.set([...this.temporadas()]);
  }

  changeStatus(t: TemporadaDTO, nuevoEstado: 'ACTIVA' | 'CERRADA' | 'PLANIFICADA'): void {
    this.opService.cambiarEstadoTemporada(t.idTemporada, nuevoEstado).subscribe({
      next: () => {
        const txt = nuevoEstado === 'ACTIVA' ? 'iniciada' : 'cerrada';
        this.toast.success('Estado cambiado', `La campaña "${t.nombre}" ha sido ${txt}.`);
        this.loadData();
      }
    });
  }

  confirmCloseSeason(t: TemporadaDTO): void {
    this.seasonToClose.set(t);
    this.isConfirmOpen.set(true);
  }

  executeCloseSeason(): void {
    const t = this.seasonToClose();
    if (!t) return;
    this.changeStatus(t, 'CERRADA');
    this.isConfirmOpen.set(false);
  }

  getFaseIcon(tipo: string): string {
    switch (tipo) {
      case 'PREPARACION': return 'scissors';
      case 'SIEMBRA': return 'sprout';
      case 'FUMIGACION': return 'shield';
      case 'FERTILIZACION': return 'droplet';
      case 'COSECHA': return 'shopping-bag';
      case 'SECADO': return 'sun';
      default: return 'calendar';
    }
  }

  getFaseIconBg(estado: string): string {
    switch (estado) {
      case 'COMPLETADA': return 'bg-green-600';
      case 'EN_CURSO': return 'bg-blue-600 animate-pulse';
      default: return 'bg-gray-400';
    }
  }

  getTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'PREPARACION': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'SIEMBRA': return 'bg-green-100 text-green-800 border border-green-200';
      case 'FUMIGACION': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'FERTILIZACION': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'COSECHA': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'SECADO': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getEstadoFaseBadge(estado: string): string {
    switch (estado) {
      case 'COMPLETADA': return 'bg-green-100 text-green-800 border border-green-200';
      case 'EN_CURSO': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  }

  formatEstadoFase(estado: string): string {
    switch (estado) {
      case 'COMPLETADA': return '● Completada';
      case 'EN_CURSO': return '⚡ En Curso';
      default: return '⏱ Pendiente';
    }
  }
}
