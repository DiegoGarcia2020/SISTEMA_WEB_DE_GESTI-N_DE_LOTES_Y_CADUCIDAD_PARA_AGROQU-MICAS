import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { GeografiaService } from '../../../core/services/geografia.service';
import { ProvinciaDTO, PaisDTO } from '../../../core/models/geografia.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-gestion-provincias',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <app-section-header title="Gestion de Provincias" 
                          subtitle="Administra las provincias asociadas a cada pais del sistema SACPA.">
        <button (click)="openCreateModal()" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
          <span>+ Nueva Provincia</span>
        </button>
      </app-section-header>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4">
        <div class="flex items-center gap-3">
          <div class="flex-1 relative">
            <lucide-icon name="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar provincia por nombre..."
                   class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-gray-50">
          </div>
          <select [(ngModel)]="filterPais" class="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-gray-50 font-bold text-[#0B4628]">
            <option [ngValue]="0">Todos los paises</option>
            @for (p of paises(); track p.idPais) {
              <option [ngValue]="p.idPais">{{ p.nombre }}</option>
            }
          </select>
          <span class="text-xs text-gray-500 font-medium">{{ filteredItems().length }} registros</span>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th class="py-4 px-6">ID</th>
                <th class="py-4 px-6">Nombre</th>
                <th class="py-4 px-6">Pais</th>
                <th class="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (p of paginatedItems(); track p.idProvincia) {
                <tr class="hover:bg-green-50/20 transition-colors group">
                  <td class="py-4 px-6 font-mono font-bold text-gray-800">
                    <span class="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md text-xs">{{ p.idProvincia }}</span>
                  </td>
                  <td class="py-4 px-6 font-extrabold text-gray-900 group-hover:text-[#0B4628] transition-colors">{{ p.nombre }}</td>
                  <td class="py-4 px-6 text-xs text-gray-600">
                    <span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">{{ getNombrePais(p.idPais) }}</span>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="openEditModal(p)" class="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                        Editar
                      </button>
                      <button (click)="deleteItem(p)" class="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer">
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr class="text-center text-gray-400">
                  <td colSpan="4" class="py-12 text-xs font-medium">No se encontraron provincias</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredItems().length > 0) {
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 font-medium">Mostrar</span>
              <select [(ngModel)]="itemsPerPage" (ngModelChange)="onItemsPerPageChange()" class="px-2 py-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white outline-none focus:border-[#0B4628]">
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
                <option [ngValue]="50">50</option>
              </select>
              <span class="text-xs text-gray-500 font-medium">por pagina</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <span>Mostrando</span>
              <span class="font-bold text-gray-700">{{ firstItemIndex() }}</span>
              <span>-</span>
              <span class="font-bold text-gray-700">{{ lastItemIndex() }}</span>
              <span>de</span>
              <span class="font-bold text-gray-700">{{ filteredItems().length }}</span>
              <span>registros</span>
            </div>
            <div class="flex items-center gap-1">
              <button (click)="goToPage(1)" [disabled]="currentPage() === 1" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                Primera
              </button>
              <button (click)="prevPage()" [disabled]="currentPage() === 1" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                Anterior
              </button>
              <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B4628] text-white">{{ currentPage() }}</span>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                Siguiente
              </button>
              <button (click)="goToPage(totalPages())" [disabled]="currentPage() === totalPages()" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                Ultima
              </button>
            </div>
          </div>
        }
      </div>

      <!-- MODAL CREAR/EDITAR PROVINCIA -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/60">
              <div class="flex items-center gap-2">
                <lucide-icon name="map-pin" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
                <h3 class="font-bold text-base text-gray-900">{{ editingId() ? 'Editar Provincia' : 'Registrar Nueva Provincia' }}</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Pais</label>
                <select [(ngModel)]="form.idPais" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white font-bold text-[#0B4628]">
                  <option [ngValue]="null" disabled>Seleccionar pais...</option>
                  @for (p of paises(); track p.idPais) {
                    <option [ngValue]="p.idPais">{{ p.nombre }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Provincia</label>
                <input type="text" [(ngModel)]="form.nombre" placeholder="Ej: Los Rios"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none">
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveItem()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>{{ editingId() ? 'Actualizar' : 'Guardar' }}</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class GestionProvinciasComponent implements OnInit {
  private geoService = inject(GeografiaService);
  private toast = inject(ToastService);

  items = signal<ProvinciaDTO[]>([]);
  paises = signal<PaisDTO[]>([]);
  searchQuery = '';
  filterPais = 0;
  isModalOpen = signal<boolean>(false);
  editingId = signal<number | null>(null);
  form: { nombre: string; idPais: number | undefined } = { nombre: '', idPais: undefined };
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  ngOnInit(): void {
    this.loadData();
    this.geoService.listarPaises().subscribe(data => this.paises.set(data));
  }

  loadData(): void {
    this.geoService.listarProvincias().subscribe(data => this.items.set(data));
  }

  filteredItems = computed(() => {
    this.currentPage.set(1);
    const q = this.searchQuery.toLowerCase().trim();
    return this.items().filter(p =>
      (!q || p.nombre.toLowerCase().includes(q)) &&
      (this.filterPais === 0 || p.idPais === this.filterPais)
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.itemsPerPage())));

  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredItems().slice(start, start + this.itemsPerPage());
  });

  firstItemIndex = computed(() => {
    if (this.filteredItems().length === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  lastItemIndex = computed(() => {
    const end = this.currentPage() * this.itemsPerPage();
    return Math.min(end, this.filteredItems().length);
  });

  getNombrePais(idPais: number): string {
    return this.paises().find(p => p.idPais === idPais)?.nombre || 'Desconocido';
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form = { nombre: '', idPais: undefined };
    this.isModalOpen.set(true);
  }

  openEditModal(prov: ProvinciaDTO): void {
    this.editingId.set(prov.idProvincia);
    this.form = { nombre: prov.nombre, idPais: prov.idPais };
    this.isModalOpen.set(true);
  }

  saveItem(): void {
    if (!this.form.nombre.trim() || !this.form.idPais) {
      this.toast.warning('Validacion', 'Selecciona un pais y ingresa el nombre de la provincia.');
      return;
    }

    if (this.editingId()) {
      this.geoService.actualizarProvincia(this.editingId()!, this.form).subscribe({
        next: () => {
          this.toast.success('Provincia actualizada', `"${this.form.nombre}" ha sido actualizada.`);
          this.isModalOpen.set(false);
          this.loadData();
        }
      });
    } else {
      this.geoService.crearProvincia(this.form).subscribe({
        next: () => {
          this.toast.success('Provincia registrada', `"${this.form.nombre}" ha sido creada.`);
          this.isModalOpen.set(false);
          this.loadData();
        }
      });
    }
  }

  deleteItem(prov: ProvinciaDTO): void {
    if (confirm(`Desactivar la provincia "${prov.nombre}"?`)) {
      this.geoService.desactivarProvincia(prov.idProvincia).subscribe({
        next: () => {
          this.toast.info('Provincia desactivada', `"${prov.nombre}" ha sido desactivada.`);
          this.loadData();
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage.set(1);
  }
}
