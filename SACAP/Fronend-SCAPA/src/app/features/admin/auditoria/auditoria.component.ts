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
      <app-section-header title="Log de Auditoría Transaccional e Historial de Sesiones IP" 
                          subtitle="Supervisión inmutable de operaciones CRUD en PostgreSQL y control de accesos por biometría y tokens JWT.">
        <button (click)="exportCSV()" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="download" class="w-4 h-4"></lucide-icon>
          <span>Exportar Log (CSV)</span>
        </button>
      </app-section-header>

      <!-- Pestañas -->
      <div class="flex items-center gap-2 border-b border-gray-200">
        <button (click)="activeTab.set('TRANSACCIONES')"
                [class]="activeTab() === 'TRANSACCIONES' ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="database" class="w-4 h-4"></lucide-icon>
          <span>Registro de Transacciones BD (seguridad.auditoria)</span>
          <span class="bg-green-100 text-[#0B4628] text-xs px-2 py-0.5 rounded-full font-bold">{{ auditoria().length }}</span>
        </button>
        <button (click)="activeTab.set('SESIONES')"
                [class]="activeTab() === 'SESIONES' ? 'border-blue-600 text-blue-600 font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="globe" class="w-4 h-4"></lucide-icon>
          <span>Historial de Conexiones e IP (seguridad.historial_sesion)</span>
          <span class="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">{{ sesiones().length }}</span>
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

        @if (activeTab() === 'TRANSACCIONES') {
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
        } @else {
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-500 uppercase">Estado Conexión:</span>
            <select [(ngModel)]="filterEstadoSesion" class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold bg-white outline-none focus:border-blue-600">
              <option value="TODAS">Ver Todos</option>
              <option value="ACTIVA">⚡ Activas</option>
              <option value="CERRADA">Cerradas</option>
              <option value="INTENTO_FALLIDO">❌ Intento Fallido</option>
              <option value="EXPIRADA">Expiradas</option>
            </select>
          </div>
        }
      </div>

      @if (activeTab() === 'TRANSACCIONES') {
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
      } @else {
        <!-- TABLA HISTORIAL DE SESIONES -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden animate-fade-in">
          <div class="p-4 border-b border-gray-100 bg-blue-50/40 flex items-center justify-between text-xs text-blue-900">
            <span>Registro de accesos con IP, dispositivo de conexión y resultado de autenticación biometría / JWT.</span>
            <span class="font-bold text-blue-700">● Mostrando {{ filteredSesiones().length }} sesiones</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="py-4 px-6">ID Conexión</th>
                  <th class="py-4 px-6">Usuario SACPA</th>
                  <th class="py-4 px-6">Dirección IP</th>
                  <th class="py-4 px-6">Dispositivo / Navegador</th>
                  <th class="py-4 px-6">Inicio / Fin de Sesión</th>
                  <th class="py-4 px-6 text-right">Estado del Acceso</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (s of filteredSesiones(); track s.idSesion) {
                  <tr class="hover:bg-blue-50/20 transition-colors group">
                    <td class="py-4 px-6 font-mono text-xs font-bold text-gray-400">#{{ s.idSesion }}</td>
                    <td class="py-4 px-6">
                      <div class="font-bold text-gray-900">{{ s.correoUsuario }}</div>
                      <span class="text-[10px] text-gray-500 font-semibold uppercase">Rol: {{ s.rolSeleccionado }}</span>
                    </td>
                    <td class="py-4 px-6 font-mono text-xs font-bold text-blue-600 flex items-center gap-1.5">
                      <lucide-icon name="globe" class="w-3.5 h-3.5 text-blue-500"></lucide-icon>
                      <span>{{ s.direccionIp }}</span>
                    </td>
                    <td class="py-4 px-6 text-xs text-gray-600 font-medium">{{ s.dispositivo }}</td>
                    <td class="py-4 px-6 text-xs text-gray-500 font-mono">
                      <div>IN: {{ s.fechaInicio }}</div>
                      @if (s.fechaFin) {
                        <div class="text-gray-400">OUT: {{ s.fechaFin }}</div>
                      }
                    </td>
                    <td class="py-4 px-6 text-right">
                      @if (s.estadoConexion === 'ACTIVA') {
                        <span class="bg-green-100 text-[#0B4628] text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                          ● Activa
                        </span>
                      } @else if (s.estadoConexion === 'CERRADA') {
                        <span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                          Cerrada
                        </span>
                      } @else if (s.estadoConexion === 'INTENTO_FALLIDO') {
                        <span class="bg-red-100 text-red-800 text-xs font-extrabold px-3 py-1 rounded-full">
                          ❌ Fallo
                        </span>
                      } @else {
                        <span class="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                          Expirada
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

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
  sesiones = signal<HistorialSesionDTO[]>([]);

  isDiffModalOpen = signal<boolean>(false);
  selectedEntry = signal<RegistroAuditoriaDTO | null>(null);

  searchQuery = '';
  filterAccion = 'TODAS';
  filterEstadoSesion = 'TODAS';

  ngOnInit(): void {
    this.sisService.listarAuditoria().subscribe(a => this.auditoria.set(a));
    this.sisService.listarHistorialSesiones().subscribe(s => this.sesiones.set(s));
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

  filteredSesiones = computed(() => {
    return this.sesiones().filter(s => {
      const q = this.searchQuery.toLowerCase();
      const matchQ = !q || s.correoUsuario.toLowerCase().includes(q) || s.direccionIp.includes(q) || s.dispositivo.toLowerCase().includes(q);
      const matchE = this.filterEstadoSesion === 'TODAS' || s.estadoConexion === this.filterEstadoSesion;
      return matchQ && matchE;
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
    if (this.activeTab() === 'TRANSACCIONES') {
      csvContent += 'ID,Fecha y Hora,Usuario,Rol,Accion SQL,Tabla Afectada,Detalle,Direccion IP\r\n';
      this.filteredAuditoria().forEach(r => {
        csvContent += `${r.idAuditoria},"${r.fechaHora}","${r.usuario}","${r.rol}","${r.accion}","${r.tablaAfectada}","${r.detalleCambio}","${r.direccionIp}"\r\n`;
      });
    } else {
      csvContent += 'ID Sesion,Usuario,Rol,Direccion IP,Dispositivo,Inicio,Fin,Estado\r\n';
      this.filteredSesiones().forEach(s => {
        csvContent += `${s.idSesion},"${s.correoUsuario}","${s.rolSeleccionado}","${s.direccionIp}","${s.dispositivo}","${s.fechaInicio}","${s.fechaFin || ''}","${s.estadoConexion}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_sacpa_${this.activeTab().toLowerCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toast.success('Log Exportado', 'Se descargó el archivo CSV de auditoría con las trazas de seguridad.');
  }
}
