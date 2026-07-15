import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SolicitudRegistroService } from '../../../core/services/solicitud-registro.service';
import { RolService } from '../../../core/services/rol.service';
import { SolicitudRegistroDTO, ProcesarSolicitudDTO } from '../../../core/models/solicitud-registro.model';
import { RolDTO } from '../../../core/models/rol.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-solicitudes-registro',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, LucideAngularModule,
    SectionHeaderComponent, StatCardComponent, AvatarComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Evaluación de Solicitudes de Registro de Empleados" 
                          subtitle="Revisión, aprobación y asignación de roles para el personal institucional que solicita acceso al SACPA.">
        <a routerLink="/admin/usuarios" 
           class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <lucide-icon name="users" class="w-4 h-4"></lucide-icon>
          <span>Ir a Lista de Usuarios</span>
        </a>
      </app-section-header>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card title="Pendientes de Revisión" [value]="pendientesCount().toString()" subtitle="Requieren aprobación" iconName="clock" colorClass="bg-amber-500/10 text-amber-600"></app-stat-card>
        <app-stat-card title="Solicitudes Aprobadas" [value]="aprobadasCount().toString()" subtitle="Cuentas activas generadas" iconName="check-circle" colorClass="bg-green-600/10 text-green-700"></app-stat-card>
        <app-stat-card title="Solicitudes Rechazadas" [value]="rechazadasCount().toString()" subtitle="No cumplen requisitos" iconName="x-circle" colorClass="bg-red-600/10 text-red-600"></app-stat-card>
      </div>

      <!-- Filtros de Pestaña -->
      <div class="flex items-center gap-2 border-b border-gray-200">
        <button (click)="filtroEstado.set(1)"
                [class]="filtroEstado() === 1 ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="clock" class="w-4 h-4"></lucide-icon>
          <span>Pendientes</span>
          <span class="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">{{ pendientesCount() }}</span>
        </button>

        <button (click)="filtroEstado.set(2)"
                [class]="filtroEstado() === 2 ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="check-circle" class="w-4 h-4"></lucide-icon>
          <span>Aprobadas</span>
        </button>

        <button (click)="filtroEstado.set(3)"
                [class]="filtroEstado() === 3 ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="x-circle" class="w-4 h-4"></lucide-icon>
          <span>Rechazadas</span>
        </button>
      </div>

      <!-- Tabla de Solicitudes -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th class="py-4 px-6">Solicitante</th>
                <th class="py-4 px-6">Cédula</th>
                <th class="py-4 px-6">Departamento & Cargo</th>
                <th class="py-4 px-6">Teléfono</th>
                <th class="py-4 px-6">Fecha Solicitud</th>
                <th class="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (s of solicitudesFiltradas(); track s.idSolicitud) {
                <tr class="hover:bg-green-50/20 transition-colors">
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3.5">
                      <app-avatar [name]="s.nombres + ' ' + s.apellidos" size="md"></app-avatar>
                      <div>
                        <div class="font-bold text-gray-900">{{ s.nombres }} {{ s.apellidos }}</div>
                        <div class="text-xs text-gray-500">{{ s.correo }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 font-mono text-xs text-gray-600">{{ s.cedula }}</td>
                  <td class="py-4 px-6">
                    <div class="font-semibold text-gray-800">{{ s.departamento || 'No especificado' }}</div>
                    <div class="text-xs text-gray-500">{{ s.cargo || 'General' }}</div>
                  </td>
                  <td class="py-4 px-6 text-xs text-gray-600">{{ s.telefono || '---' }}</td>
                  <td class="py-4 px-6 text-xs text-gray-500">{{ s.fechaSolicitud }}</td>
                  <td class="py-4 px-6 text-right">
                    @if (s.idEstado === 1) {
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="abrirModalAprobar(s)"
                                class="px-3 py-1.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5">
                          <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Aprobar</span>
                        </button>
                        <button (click)="rechazarSolicitud(s)"
                                class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                          <lucide-icon name="x" class="w-3.5 h-3.5"></lucide-icon>
                          <span>Rechazar</span>
                        </button>
                      </div>
                    } @else if (s.idEstado === 2) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        <lucide-icon name="check-circle" class="w-3.5 h-3.5"></lucide-icon>
                        <span>Aprobada</span>
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800" [title]="s.motivoRechazo || ''">
                        <lucide-icon name="x-circle" class="w-3.5 h-3.5"></lucide-icon>
                        <span>Rechazada</span>
                      </span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-12 text-center text-gray-400">
                    <lucide-icon name="inbox" class="w-10 h-10 mx-auto mb-2 opacity-40"></lucide-icon>
                    <p class="font-medium text-sm">No hay solicitudes en este estado</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Aprobar y Asignar Roles -->
      @if (solicitudSeleccionada()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-gray-100">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 class="font-bold text-lg text-gray-900">Aprobar Solicitud en SACPA</h3>
                <p class="text-xs text-gray-500">{{ solicitudSeleccionada()?.nombres }} {{ solicitudSeleccionada()?.apellidos }}</p>
              </div>
              <button (click)="solicitudSeleccionada.set(null)" class="text-gray-400 hover:text-gray-600">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="space-y-3">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Seleccione los Roles a Asignar:</label>
              <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
                @for (r of rolesDisponibles(); track r.idRol) {
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#0B4628] cursor-pointer transition-all">
                    <input type="checkbox" [checked]="estaSeleccionado(r.idRol)" (change)="toggleRolSeleccionado(r.idRol)"
                           class="w-4 h-4 text-[#0B4628] rounded border-gray-300 focus:ring-[#0B4628]">
                    <div>
                      <div class="font-bold text-sm text-gray-900">{{ r.nombre }}</div>
                      <div class="text-[11px] text-gray-500">{{ r.descripcion || 'Acceso al módulo ' + r.nombre }}</div>
                    </div>
                  </label>
                }
              </div>
            </div>

            <div class="bg-green-50 p-3.5 rounded-xl border border-green-200 text-xs text-gray-700 space-y-1">
              <div class="font-bold text-[#0B4628] flex items-center gap-1.5">
                <lucide-icon name="mail" class="w-4 h-4"></lucide-icon>
                <span>Generación Automática de Credenciales</span>
              </div>
              <p>Al aprobar, se enviará un correo a <b>{{ solicitudSeleccionada()?.correo }}</b> con una contraseña temporal encriptada.</p>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" (click)="solicitudSeleccionada.set(null)"
                      class="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer">
                Cancelar
              </button>
              <button type="button" (click)="confirmarAprobacion()"
                      class="px-5 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5">
                <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                <span>Confirmar y Enviar Correo</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SolicitudesRegistroComponent implements OnInit {
  private solicitudService = inject(SolicitudRegistroService);
  private rolService = inject(RolService);
  private toast = inject(ToastService);

  solicitudes = signal<SolicitudRegistroDTO[]>([]);
  rolesDisponibles = signal<RolDTO[]>([]);
  filtroEstado = signal<number>(1);
  solicitudSeleccionada = signal<SolicitudRegistroDTO | null>(null);
  rolesElegidos = signal<number[]>([4]); // Por defecto Técnico de Campo (4)

  pendientesCount = computed(() => this.solicitudes().filter(s => s.idEstado === 1).length);
  aprobadasCount = computed(() => this.solicitudes().filter(s => s.idEstado === 2).length);
  rechazadasCount = computed(() => this.solicitudes().filter(s => s.idEstado === 3).length);

  solicitudesFiltradas = computed(() => {
    return this.solicitudes().filter(s => s.idEstado === this.filtroEstado());
  });

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.cargarRoles();
  }

  cargarSolicitudes(): void {
    this.solicitudService.listarTodas().subscribe({
      next: data => this.solicitudes.set(data),
      error: () => this.toast.error('Error', 'No se pudieron recuperar las solicitudes')
    });
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: data => this.rolesDisponibles.set(data)
    });
  }

  abrirModalAprobar(s: SolicitudRegistroDTO): void {
    this.solicitudSeleccionada.set(s);
    this.rolesElegidos.set([4]); // 4 por defecto
  }

  estaSeleccionado(idRol: number): boolean {
    return this.rolesElegidos().includes(idRol);
  }

  toggleRolSeleccionado(idRol: number): void {
    const actuales = [...this.rolesElegidos()];
    const idx = actuales.indexOf(idRol);
    if (idx >= 0) {
      if (actuales.length > 1) actuales.splice(idx, 1);
    } else {
      actuales.push(idRol);
    }
    this.rolesElegidos.set(actuales);
  }

  confirmarAprobacion(): void {
    const sol = this.solicitudSeleccionada();
    if (!sol || !sol.idSolicitud) return;

    this.solicitudService.procesar(sol.idSolicitud, { aprobar: true, idRoles: this.rolesElegidos() }).subscribe({
      next: () => {
        sol.idEstado = 2;
        this.toast.success('Solicitud Aprobada', `Se creó la cuenta para ${sol.correo} y se enviaron sus credenciales temporales.`);
        this.solicitudSeleccionada.set(null);
        this.cargarSolicitudes();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar la solicitud en el servidor')
    });
  }

  rechazarSolicitud(s: SolicitudRegistroDTO): void {
    const motivo = prompt('Ingrese el motivo del rechazo para notificar al solicitante:', 'No coincide con los registros del departamento.');
    if (motivo === null) return;

    this.solicitudService.procesar(s.idSolicitud!, { aprobar: false, motivoRechazo: motivo }).subscribe({
      next: () => {
        s.idEstado = 3;
        s.motivoRechazo = motivo;
        this.toast.warning('Solicitud Rechazada', `Se notificó a ${s.correo} sobre la resolución.`);
        this.cargarSolicitudes();
      },
      error: () => this.toast.error('Error', 'No se pudo rechazar la solicitud')
    });
  }
}
