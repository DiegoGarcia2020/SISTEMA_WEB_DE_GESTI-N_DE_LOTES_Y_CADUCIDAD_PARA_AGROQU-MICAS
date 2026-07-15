import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SistemaService } from '../../../core/services/sistema.service';
import { CatalogoItemDTO } from '../../../core/models/sistema.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-gestion-catalogos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Catálogos Generales y Tablas Paramétricas" 
                          subtitle="Administra unidades de medida, clasificaciones de lote agrícola y estados operativos del sistema SACPA.">
        <button (click)="openCreateModal()" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
          <span>+ Nuevo Registro Paramétrico</span>
        </button>
      </app-section-header>

      <!-- Selector de Categoría Paramétrica -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-3 flex flex-wrap gap-2">
        <button (click)="selectedCat.set('UNIDADES_MEDIDA')" [class.bg-[#0B4628]]="selectedCat() === 'UNIDADES_MEDIDA'" [class.text-white]="selectedCat() === 'UNIDADES_MEDIDA'" [class.shadow-sm]="selectedCat() === 'UNIDADES_MEDIDA'" class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 text-gray-600 hover:bg-gray-100">
          <lucide-icon name="layers" class="w-4 h-4"></lucide-icon>
          <span>Unidades de Medida ({{ countCat('UNIDADES_MEDIDA') }})</span>
        </button>

        <button (click)="selectedCat.set('TIPOS_LOTE')" [class.bg-[#0B4628]]="selectedCat() === 'TIPOS_LOTE'" [class.text-white]="selectedCat() === 'TIPOS_LOTE'" [class.shadow-sm]="selectedCat() === 'TIPOS_LOTE'" class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 text-gray-600 hover:bg-gray-100">
          <lucide-icon name="tag" class="w-4 h-4"></lucide-icon>
          <span>Tipos de Lote Agrícola ({{ countCat('TIPOS_LOTE') }})</span>
        </button>

        <button (click)="selectedCat.set('TIPOS_AGROQUIMICO')" [class.bg-[#0B4628]]="selectedCat() === 'TIPOS_AGROQUIMICO'" [class.text-white]="selectedCat() === 'TIPOS_AGROQUIMICO'" [class.shadow-sm]="selectedCat() === 'TIPOS_AGROQUIMICO'" class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 text-gray-600 hover:bg-gray-100">
          <lucide-icon name="filter" class="w-4 h-4"></lucide-icon>
          <span>Clasificación Agroquímica ({{ countCat('TIPOS_AGROQUIMICO') }})</span>
        </button>

        <button (click)="selectedCat.set('ESTADOS_USUARIO')" [class.bg-[#0B4628]]="selectedCat() === 'ESTADOS_USUARIO'" [class.text-white]="selectedCat() === 'ESTADOS_USUARIO'" [class.shadow-sm]="selectedCat() === 'ESTADOS_USUARIO'" class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 text-gray-600 hover:bg-gray-100">
          <lucide-icon name="check-circle" class="w-4 h-4"></lucide-icon>
          <span>Estados Operativos ({{ countCat('ESTADOS_USUARIO') }})</span>
        </button>
      </div>

      <!-- Tabla Paramétrica -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-gray-100 bg-green-50/40 flex items-center justify-between text-xs text-[#0B4628] font-bold">
          <span>Sincronizado con tablas de catálogo y desplegables en formularios de bodega y siembra</span>
          <span>Categoría activa: {{ getCatTitle() }}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th class="py-4 px-6">Código Paramétrico</th>
                <th class="py-4 px-6">Nombre del Ítem</th>
                <th class="py-4 px-6">Descripción o Uso</th>
                <th class="py-4 px-6">Estado</th>
                <th class="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (c of filteredItems(); track c.idItem) {
                <tr class="hover:bg-green-50/20 transition-colors group">
                  <td class="py-4 px-6 font-mono font-bold text-gray-800">
                    <span class="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md text-xs">{{ c.codigo }}</span>
                  </td>
                  <td class="py-4 px-6 font-extrabold text-gray-900 group-hover:text-[#0B4628] transition-colors">{{ c.nombre }}</td>
                  <td class="py-4 px-6 text-xs text-gray-600 max-w-sm">{{ c.descripcion || 'Sin descripción' }}</td>
                  <td class="py-4 px-6">
                    @if (c.activo) {
                      <span class="bg-green-100 text-[#0B4628] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        ● Activo
                      </span>
                    } @else {
                      <span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        Inactivo
                      </span>
                    }
                  </td>
                  <td class="py-4 px-6 text-right">
                    <button (click)="toggleStatus(c)" class="text-xs font-bold text-gray-500 hover:text-[#0B4628] hover:underline cursor-pointer">
                      {{ c.activo ? 'Deshabilitar' : 'Habilitar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr class="text-center text-gray-400">
                  <td colSpan="5" class="py-12 text-xs font-medium">No hay registros en la categoría seleccionada</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREAR ITEM CATÁLOGO -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/60">
              <div class="flex items-center gap-2">
                <lucide-icon name="layers" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                <h3 class="font-bold text-base text-gray-900">Registrar Ítem de Catálogo</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría Paramétrica</label>
                <select [(ngModel)]="form.categoria" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white font-bold text-[#0B4628]">
                  <option value="UNIDADES_MEDIDA">Unidades de Medida</option>
                  <option value="TIPOS_LOTE">Tipos de Lote Agrícola</option>
                  <option value="TIPOS_AGROQUIMICO">Clasificación Agroquímica</option>
                  <option value="ESTADOS_USUARIO">Estados Operativos</option>
                </select>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-1">
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Código</label>
                  <input type="text" [(ngModel)]="form.codigo" placeholder="UND-QQ"
                         class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono uppercase focus:border-[#0B4628] outline-none">
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre</label>
                  <input type="text" [(ngModel)]="form.nombre" placeholder="Ej: Quintales (qq)"
                         class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción de Uso</label>
                <textarea [(ngModel)]="form.descripcion" rows="2" placeholder="Explicación o conversión..."
                          class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none"></textarea>
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveItem()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar Registro</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class GestionCatalogosComponent implements OnInit {
  private sisService = inject(SistemaService);
  private toast = inject(ToastService);

  items = signal<CatalogoItemDTO[]>([]);
  selectedCat = signal<'UNIDADES_MEDIDA' | 'TIPOS_LOTE' | 'ESTADOS_USUARIO' | 'ESTADOS_ORDEN' | 'TIPOS_AGROQUIMICO'>('UNIDADES_MEDIDA');

  isModalOpen = signal<boolean>(false);
  form = { categoria: 'UNIDADES_MEDIDA' as any, codigo: '', nombre: '', descripcion: '' };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.sisService.listarCatalogos().subscribe(data => this.items.set(data));
  }

  filteredItems = computed(() => {
    return this.items().filter(i => i.categoria === this.selectedCat());
  });

  countCat(cat: string): number {
    return this.items().filter(i => i.categoria === cat).length;
  }

  getCatTitle(): string {
    switch(this.selectedCat()) {
      case 'UNIDADES_MEDIDA': return 'Unidades de Medida';
      case 'TIPOS_LOTE': return 'Tipos de Lote Agrícola';
      case 'TIPOS_AGROQUIMICO': return 'Clasificación Agroquímica';
      case 'ESTADOS_USUARIO': return 'Estados Operativos del Sistema';
      default: return 'Catálogo General';
    }
  }

  toggleStatus(c: CatalogoItemDTO): void {
    const newEst = !c.activo;
    this.sisService.cambiarEstadoItem(c.idItem, newEst).subscribe({
      next: () => {
        this.toast.info('Estado actualizado', `El ítem ${c.nombre} ha sido modificado.`);
        this.loadData();
      }
    });
  }

  openCreateModal(): void {
    this.form = { categoria: this.selectedCat(), codigo: 'UND-', nombre: '', descripcion: '' };
    this.isModalOpen.set(true);
  }

  saveItem(): void {
    if (!this.form.nombre.trim() || !this.form.codigo.trim()) {
      this.toast.warning('Validación', 'Ingresa un código y un nombre para el catálogo.');
      return;
    }
    this.sisService.crearItemCatalogo(this.form).subscribe({
      next: (res) => {
        this.toast.success('Ítem registrado', `Se agregó "${res.nombre}" a la categoría.`);
        this.isModalOpen.set(false);
        this.loadData();
      }
    });
  }
}
