import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { PromocionIADTO } from '../../../core/models/operaciones.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-promociones-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Sugerencias IA y Combos Automáticos" 
                          subtitle="Descuentos calculados algorítmicamente por AgroSense para liquidar lotes con prioridad alta o próxima caducidad.">
        <button (click)="openCreateModal()" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
          <span>+ Crear Combo Manual</span>
        </button>
      </app-section-header>

      <!-- Barra de Filtros -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <lucide-icon name="filter" class="w-4 h-4 text-gray-400"></lucide-icon>
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado del Combo:</span>
          <div class="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button (click)="filterEstado.set('TODAS')" [class.bg-white]="filterEstado() === 'TODAS'" [class.shadow-2xs]="filterEstado() === 'TODAS'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">Todas</button>
            <button (click)="filterEstado.set('SUGERIDA')" [class.bg-purple-600]="filterEstado() === 'SUGERIDA'" [class.text-white]="filterEstado() === 'SUGERIDA'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1">
              <lucide-icon name="sparkles" class="w-3 h-3"></lucide-icon>
              <span>Sugeridas IA</span>
            </button>
            <button (click)="filterEstado.set('APROBADA')" [class.bg-blue-600]="filterEstado() === 'APROBADA'" [class.text-white]="filterEstado() === 'APROBADA'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">Aprobadas</button>
            <button (click)="filterEstado.set('ACTIVA')" [class.bg-[#0B4628]]="filterEstado() === 'ACTIVA'" [class.text-white]="filterEstado() === 'ACTIVA'" class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">⚡ Activas</button>
          </div>
        </div>

        <div class="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5">
          <lucide-icon name="sparkles" class="w-3.5 h-3.5 text-purple-600"></lucide-icon>
          <span>AgroSense Dynamic Pricing activo</span>
        </div>
      </div>

      <!-- Grid de Promociones y Combos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (p of filteredPromociones(); track p.idPromocion) {
          <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
            
            <!-- Insignia de Estado -->
            <div class="flex items-center justify-between mb-3">
              <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">{{ p.codigoLote }}</span>
              @if (p.estado === 'SUGERIDA') {
                <span class="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase flex items-center gap-1 border border-purple-200">
                  <lucide-icon name="sparkles" class="w-3 h-3 text-purple-600 animate-pulse"></lucide-icon>
                  <span>Sugerencia IA</span>
                </span>
              } @else if (p.estado === 'APROBADA') {
                <span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border border-blue-200">
                  Aprobado (Listo para POS)
                </span>
              } @else if (p.estado === 'ACTIVA') {
                <span class="bg-green-100 text-[#0B4628] text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border border-green-200 flex items-center gap-1">
                  ● Vigente en Portal
                </span>
              } @else {
                <span class="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">
                  Rechazado
                </span>
              }
            </div>

            <div>
              <h3 class="font-extrabold text-base text-gray-900 group-hover:text-purple-700 transition-colors">{{ p.titulo }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ p.nombreProducto }}</p>

              <!-- Precio y Descuento -->
              <div class="mt-4 flex items-baseline justify-between bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block">Precio Original</span>
                  <span class="text-sm font-semibold text-gray-500 line-through">\${{ p.precioOriginal | number:'1.2-2' }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-extrabold text-purple-700 uppercase block">Precio Combo IA</span>
                  <span class="text-2xl font-black text-purple-900">\${{ p.precioPromocion | number:'1.2-2' }}</span>
                </div>
                <span class="bg-purple-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
                  -{{ p.descuentoSugerido }}% OFF
                </span>
              </div>

              <!-- Justificación Algorítmica IA -->
              <div class="mt-3.5 p-3 bg-gray-50 rounded-xl border border-gray-200/60 text-xs text-gray-600">
                <div class="flex items-center gap-1 text-[11px] font-bold text-purple-800 mb-1">
                  <lucide-icon name="sparkles" class="w-3 h-3 text-purple-600"></lucide-icon>
                  <span>Análisis AgroSense</span>
                </div>
                <p class="italic leading-relaxed">{{ p.justificacionIA }}</p>
              </div>
            </div>

            <!-- Botones de Decisión -->
            <div class="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              @if (p.estado === 'SUGERIDA') {
                <button (click)="cambiarEstado(p, 'RECHAZADA')" 
                        class="px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1">
                  <lucide-icon name="x" class="w-3.5 h-3.5"></lucide-icon>
                  <span>Descartar</span>
                </button>
                <button (click)="cambiarEstado(p, 'APROBADA')" 
                        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1">
                  <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                  <span>Aprobar Descuento</span>
                </button>
              } @else if (p.estado === 'APROBADA') {
                <button (click)="cambiarEstado(p, 'ACTIVA')" 
                        class="w-full py-2 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <lucide-icon name="play" class="w-3.5 h-3.5"></lucide-icon>
                  <span>Publicar e Iniciar Vigencia</span>
                </button>
              } @else if (p.estado === 'ACTIVA') {
                <span class="text-xs font-bold text-[#0B4628] flex items-center gap-1">
                  <lucide-icon name="check-circle" class="w-4 h-4"></lucide-icon>
                  <span>Disponible para Venta</span>
                </span>
              }
            </div>

          </div>
        } @empty {
          <div class="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200/80">
            <lucide-icon name="gift" class="w-16 h-16 mx-auto text-purple-300 mb-3"></lucide-icon>
            <h3 class="font-bold text-gray-900 text-lg">No hay promociones ni sugerencias pendientes</h3>
            <p class="text-sm text-gray-500 mt-1">El motor AgroSense generará automáticamente nuevas sugerencias cuando un lote agrícola cumpla las reglas de anticipación.</p>
          </div>
        }
      </div>

      <!-- MODAL CREAR COMBO MANUAL -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/60">
              <div class="flex items-center gap-2">
                <lucide-icon name="gift" class="w-5 h-5 text-purple-700"></lucide-icon>
                <h3 class="font-bold text-base text-gray-900">Crear Combo / Promoción Manual</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Título de la Promoción</label>
                <input type="text" [(ngModel)]="form.titulo" placeholder="Ej: Combo Semilla Maíz + Fertilizante"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-purple-600 outline-none font-bold">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Producto / Lote Agrícola</label>
                <input type="text" [(ngModel)]="form.nombreProducto" placeholder="Ej: Semilla Híbrida Maíz Trueno"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-purple-600 outline-none">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Normal ($)</label>
                  <input type="number" [(ngModel)]="form.precioOriginal" (ngModelChange)="calcPromo()" step="0.5"
                         class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:border-purple-600 outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descuento (%)</label>
                  <input type="number" [(ngModel)]="form.descuentoSugerido" (ngModelChange)="calcPromo()" min="5" max="50"
                         class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:border-purple-600 outline-none">
                </div>
              </div>

              <div class="p-3 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center font-bold">
                <span class="text-xs text-purple-900">Precio Final Calculado:</span>
                <span class="text-lg text-purple-700">\${{ form.precioPromocion | number:'1.2-2' }}</span>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Justificación o Motivo</label>
                <textarea [(ngModel)]="form.justificacionIA" rows="2" placeholder="Motivo de la promoción para autorización gerencial..."
                          class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-purple-600 outline-none"></textarea>
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveManual()" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Crear Promoción</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PromocionesIAComponent implements OnInit {
  private opService = inject(OperacionesService);
  private toast = inject(ToastService);

  promociones = signal<PromocionIADTO[]>([]);
  filterEstado = signal<string>('TODAS');

  isModalOpen = signal<boolean>(false);
  form = { titulo: '', nombreProducto: '', codigoLote: 'LT-2026-MAN', precioOriginal: 50.0, descuentoSugerido: 15, precioPromocion: 42.5, justificacionIA: 'Promoción creada manualmente por la gerencia para impulso de ventas.' };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.opService.listarPromociones().subscribe(data => this.promociones.set(data));
  }

  filteredPromociones = computed(() => {
    return this.promociones().filter(p => {
      return this.filterEstado() === 'TODAS' || p.estado === this.filterEstado();
    });
  });

  calcPromo(): void {
    const orig = Number(this.form.precioOriginal) || 0;
    const desc = Number(this.form.descuentoSugerido) || 0;
    this.form.precioPromocion = Number((orig * (1 - desc / 100)).toFixed(2));
  }

  cambiarEstado(p: PromocionIADTO, nuevoEstado: 'APROBADA' | 'RECHAZADA' | 'ACTIVA'): void {
    this.opService.cambiarEstadoPromocion(p.idPromocion, nuevoEstado).subscribe({
      next: () => {
        const txt = nuevoEstado === 'APROBADA' ? 'aprobada' : nuevoEstado === 'ACTIVA' ? 'activada en POS' : 'rechazada';
        this.toast.success('Estado modificado', `La promoción "${p.titulo}" fue ${txt}.`);
        this.loadData();
      }
    });
  }

  openCreateModal(): void {
    this.form = { titulo: '', nombreProducto: '', codigoLote: 'LT-2026-MAN', precioOriginal: 50.0, descuentoSugerido: 15, precioPromocion: 42.5, justificacionIA: 'Promoción creada manualmente por la gerencia para impulso de ventas.' };
    this.isModalOpen.set(true);
  }

  saveManual(): void {
    if (!this.form.titulo.trim() || !this.form.nombreProducto.trim()) {
      this.toast.warning('Validación', 'Ingresa un título y producto.');
      return;
    }
    this.toast.success('Promoción Creada', `El combo "${this.form.titulo}" ha sido guardado como Aprobado.`);
    this.isModalOpen.set(false);
  }
}
