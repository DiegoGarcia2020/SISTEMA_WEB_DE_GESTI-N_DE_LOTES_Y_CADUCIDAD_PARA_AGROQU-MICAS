import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SistemaService } from '../../../core/services/sistema.service';
import { RegistroAuditoriaDTO, HistorialSesionDTO } from '../../../core/models/sistema.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DiffModalComponent } from '../../../shared/components/diff-modal/diff-modal.component';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent, DiffModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Auditoría" 
                          subtitle="Supervisión inmutable de operaciones CRUD en PostgreSQL.">
        <button (click)="exportCSV()" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="download" class="w-4 h-4"></lucide-icon>
          <span>Exportar Log (CSV)</span>
        </button>
      </app-section-header>

      <!-- Pestañas (Se deja 1 para mantener el diseño original) -->
      <div class="flex items-center gap-2 border-b border-gray-200">
        <button (click)="activeTab.set('TRANSACCIONES')"
                [class]="activeTab() === 'TRANSACCIONES' ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="database" class="w-4 h-4"></lucide-icon>
          <span>Auditoría</span>
          <span class="bg-green-100 text-[#0B4628] text-xs px-2 py-0.5 rounded-full font-bold">{{ auditoria().length }}</span>
        </button>
      </div>

      <!-- Barra de Búsqueda y Filtros -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-[280px]">
          <div class="relative w-full max-w-md">
            <lucide-icon name="search" class="w-4 h-4 text-gray-400 absolute left-3.5 top-3"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por usuario, IP, tabla o detalle..."
                   class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-500 uppercase">Acción SQL:</span>
          <select [(ngModel)]="filterAccion" class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold bg-white outline-none focus:border-[#0B4628]">
            <option value="TODAS">Ver Todas</option>
            <option value="INSERT">INSERT (Creaciones)</option>
            <option value="UPDATE">UPDATE (Ediciones)</option>
            <option value="DELETE">DELETE (Borrado)</option>
            <option value="LOGIN">LOGIN (Accesos)</option>
            <option value="PERMISO_CAMBIO">PERMISO_CAMBIO</option>
          </select>
        </div>
      </div>

      <!-- TABLA AUDITORÍA BD -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs text-gray-500">
            <span>Traza inmutable generada por triggers en PostgreSQL para auditar modificaciones de datos.</span>
            <span class="font-bold text-[#0B4628]">● Mostrando {{ filteredAuditoria().length }} registros</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="py-4 px-6">Fecha y Hora</th>
                  <th class="py-4 px-6">Usuario / Rol</th>
                  <th class="py-4 px-6">Acción SQL</th>
                  <th class="py-4 px-6">Tabla Afectada</th>
                  <th class="py-4 px-6">Detalle del Evento</th>
                  <th class="py-4 px-6 text-right">Dirección IP</th>
                  <th class="py-4 px-6 text-center">Diff</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm font-mono">
                @for (r of filteredAuditoria(); track r.idAuditoria) {
                  <tr class="hover:bg-green-50/20 transition-colors group">
                    <td class="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">{{ r.fechaHora }}</td>
                    <td class="py-4 px-6 font-sans">
                      <div class="font-bold text-gray-900">{{ r.usuario }}</div>
                      <span class="text-[10px] bg-green-100 text-[#0B4628] font-bold px-2 py-0.5 rounded-md uppercase">{{ r.rol }}</span>
                    </td>
                    <td class="py-4 px-6">
                      <span [class]="getActionBadge(r.accion)" class="text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase">
                        {{ r.accion }}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-xs font-bold text-gray-700">{{ r.tablaAfectada }}</td>
                    <td class="py-4 px-6 text-xs font-sans text-gray-600 max-w-md truncate" [title]="r.detalleCambio">{{ r.detalleCambio }}</td>
                    <td class="py-4 px-6 text-right text-xs font-bold text-blue-600">{{ r.direccionIp }}</td>
                    <td class="py-4 px-6 text-center">
                      <button (click)="openDiffModal(r)" 
                              class="p-1.5 bg-gray-100 hover:bg-[#0B4628] text-gray-600 hover:text-white rounded-lg transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                              title="Ver comparación Antes vs Después (Diff)">
                        <lucide-icon name="eye" class="w-4 h-4"></lucide-icon>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colSpan="7" class="py-12 text-center text-xs text-gray-400 font-sans font-medium">No se encontraron eventos que coincidan con la búsqueda</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>


      <!-- Modal de Comparación Diff -->
      <app-diff-modal [isOpen]="isDiffModalOpen()" [entry]="selectedEntry()" (close)="isDiffModalOpen.set(false)"></app-diff-modal>
    </div>
  `
})
export class AuditoriaComponent implements OnInit {
  private sisService = inject(SistemaService);
  private toast = inject(ToastService);

  activeTab = signal<'TRANSACCIONES' | 'SESIONES'>('TRANSACCIONES');
  auditoria = signal<RegistroAuditoriaDTO[]>([]);

  isDiffModalOpen = signal<boolean>(false);
  selectedEntry = signal<RegistroAuditoriaDTO | null>(null);

  searchQuery = '';
  filterAccion = 'TODAS';

  ngOnInit(): void {
    this.sisService.listarAuditoria().subscribe(a => this.auditoria.set(a));
  }

  openDiffModal(entry: RegistroAuditoriaDTO): void {
    this.selectedEntry.set(entry);
    this.isDiffModalOpen.set(true);
  }

  filteredAuditoria = computed(() => {
    return this.auditoria().filter(r => {
      const q = this.searchQuery.toLowerCase();
      const matchQ = !q || r.usuario.toLowerCase().includes(q) || r.tablaAfectada.toLowerCase().includes(q) || r.detalleCambio.toLowerCase().includes(q) || r.direccionIp.includes(q);
      const matchA = this.filterAccion === 'TODAS' || r.accion === this.filterAccion;
      return matchQ && matchA;
    });
  });



  getActionBadge(accion: string): string {
    switch (accion) {
      case 'INSERT': return 'bg-green-100 text-green-800 border border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border border-red-200';
      case 'LOGIN': return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-amber-100 text-amber-800';
    }
  }

  exportCSV(): void {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Fecha y Hora,Usuario,Rol,Accion SQL,Tabla Afectada,Detalle,Direccion IP\r\n';
    this.filteredAuditoria().forEach(r => {
      csvContent += `${r.idAuditoria},"${r.fechaHora}","${r.usuario}","${r.rol}","${r.accion}","${r.tablaAfectada}","${r.detalleCambio}","${r.direccionIp}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_sacpa_transacciones_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toast.success('Log Exportado', 'Se descargó el archivo CSV de auditoría con las trazas de seguridad.');
  }
}
