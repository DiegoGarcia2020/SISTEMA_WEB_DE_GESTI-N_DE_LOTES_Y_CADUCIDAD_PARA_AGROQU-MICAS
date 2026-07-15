import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { RolService } from '../../../core/services/rol.service';
import { RolDTO, RolBDDTO } from '../../../core/models/rol.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent, BadgeComponent, ConfirmDialogComponent],
  styles: [`
    .gestion-container { padding: 1.5rem; }
    .btn-primary { background: #0B4628; color: white; padding: 0.65rem 1.35rem; border-radius: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover { background: #146C43; }
    .btn-ghost { padding: 0.65rem 1.25rem; border-radius: 0.75rem; font-weight: 600; color: #64748B; background: transparent; border: none; cursor: pointer; }
    .btn-ghost:hover { background: #F1F5F9; color: #1E293B; }
    .input-field { width: 100%; padding: 0.65rem 0.9rem; border-radius: 0.6rem; border: 1px solid #CBD5E1; font-size: 0.875rem; outline: none; background: white; }
    .input-field:focus { border-color: #0B4628; box-shadow: 0 0 0 3px rgba(11, 70, 40, 0.1); }
  `],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Gestión de Roles y Control de Acceso BD" 
                          subtitle="Administra los perfiles de usuario en la aplicación y vincúlalos con roles nativos de PostgreSQL en los esquemas SACPA.">
        <div class="flex items-center gap-2">
          @if (activeTab() === 'ROLES_SYS') {
            <button (click)="openCreateRolModal()" 
                    class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
              <span>+ Nuevo Rol del Sistema</span>
            </button>
          } @else {
            <button (click)="openCreateRolBdModal()" 
                    class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <lucide-icon name="database" class="w-4 h-4"></lucide-icon>
              <span>+ Nuevo Rol PostgreSQL</span>
            </button>
          }
        </div>
      </app-section-header>

      <!-- Pestañas de Navegación -->
      <div class="flex items-center gap-2 border-b border-gray-200">
        <button (click)="activeTab.set('ROLES_SYS')"
                [class]="activeTab() === 'ROLES_SYS' ? 'border-[#0B4628] text-[#0B4628] font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="key" class="w-4 h-4"></lucide-icon>
          <span>Roles del Sistema (App)</span>
          <span class="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{{ roles().length }}</span>
        </button>
        <button (click)="activeTab.set('ROLES_BD')"
                [class]="activeTab() === 'ROLES_BD' ? 'border-blue-600 text-blue-600 font-bold bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'"
                class="px-5 py-3 border-b-2 text-sm transition-all flex items-center gap-2 cursor-pointer rounded-t-xl">
          <lucide-icon name="database" class="w-4 h-4"></lucide-icon>
          <span>Roles de Base de Datos (PostgreSQL)</span>
          <span class="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{{ rolesBd().length }}</span>
        </button>
      </div>

      @if (activeTab() === 'ROLES_SYS') {
        <!-- TAB 1: ROLES DEL SISTEMA -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
            <span>Los roles del sistema definen el menú de Angular y se mapean automáticamente a un rol en la BD para aislar consultas por esquema.</span>
            <span class="font-bold text-[#0B4628]">● Sincronizado con seguridad.rol</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="py-4 px-6">Rol del Sistema</th>
                  <th class="py-4 px-6">Descripción</th>
                  <th class="py-4 px-6">Rol BD Vinculado</th>
                  <th class="py-4 px-6">Usuarios Asignados</th>
                  <th class="py-4 px-6">Estado</th>
                  <th class="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (r of roles(); track r.idRol) {
                  <tr class="hover:bg-green-50/30 transition-colors group">
                    <td class="py-4 px-6 font-bold text-gray-900 flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center font-bold text-xs">
                        {{ r.nombre.charAt(0) }}
                      </div>
                      <span>{{ r.nombre }}</span>
                    </td>
                    <td class="py-4 px-6 text-xs text-gray-600 max-w-xs truncate">{{ r.descripcion || 'Sin descripción' }}</td>
                    <td class="py-4 px-6">
                      <span class="font-mono text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-bold flex items-center gap-1.5 w-fit">
                        <lucide-icon name="database" class="w-3.5 h-3.5 text-blue-600"></lucide-icon>
                        <span>{{ getRolBdName(r) }}</span>
                      </span>
                    </td>
                    <td class="py-4 px-6">
                      <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold">{{ r.totalUsuarios || 0 }} usuarios</span>
                    </td>
                    <td class="py-4 px-6"><app-badge [status]="r.idEstado"></app-badge></td>
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button (click)="openEditRolModal(r)" class="p-1.5 text-gray-400 hover:text-[#0B4628] hover:bg-green-50 rounded-lg transition-colors cursor-pointer" title="Editar Rol">
                          <lucide-icon name="edit-3" class="w-4 h-4"></lucide-icon>
                        </button>
                        @if (r.idEstado === 1) {
                          <button (click)="toggleRolStatus(r, 2)" class="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="Desactivar">
                            <lucide-icon name="user-x" class="w-4 h-4"></lucide-icon>
                          </button>
                        } @else {
                          <button (click)="toggleRolStatus(r, 1)" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer" title="Activar">
                            <lucide-icon name="user-check" class="w-4 h-4"></lucide-icon>
                          </button>
                        }
                        <button (click)="confirmDeleteRol(r)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Eliminar Rol">
                          <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- TAB 2: ROLES DE BASE DE DATOS -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden animate-fade-in">
          <div class="p-4 border-b border-gray-100 bg-blue-50/30 flex items-center justify-between text-xs text-blue-900">
            <span>Estos son los roles nativos en el servidor PostgreSQL que otorgan permisos SELECT/INSERT/UPDATE sobre los esquemas de SACPA.</span>
            <span class="font-bold text-blue-700">● Sincronizado con seguridad.rol_bd</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="py-4 px-6">Nombre en PostgreSQL</th>
                  <th class="py-4 px-6">Propósito / Descripción</th>
                  <th class="py-4 px-6">Estado en Servidor</th>
                  <th class="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (bd of rolesBd(); track bd.idRolBd) {
                  <tr class="hover:bg-blue-50/20 transition-colors group">
                    <td class="py-4 px-6 font-mono font-bold text-blue-800 flex items-center gap-2">
                      <lucide-icon name="database" class="w-4 h-4 text-blue-500"></lucide-icon>
                      <span>{{ bd.nombreRolBd }}</span>
                    </td>
                    <td class="py-4 px-6 text-xs text-gray-600">{{ bd.descripcion || 'Rol de acceso PostgreSQL' }}</td>
                    <td class="py-4 px-6">
                      @if (bd.activo) {
                        <span class="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          ● Activo
                        </span>
                      } @else {
                        <span class="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          ● Inactivo
                        </span>
                      }
                    </td>
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button (click)="openEditRolBdModal(bd)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Editar Rol BD">
                          <lucide-icon name="edit-3" class="w-4 h-4"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL ROL SISTEMA -->
      @if (isModalRolOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 class="font-bold text-base text-gray-900">{{ selectedRol() ? 'Editar Rol del Sistema' : 'Crear Nuevo Rol del Sistema' }}</h3>
              <button (click)="isModalRolOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Rol</label>
                <input type="text" [(ngModel)]="formRol.nombre" placeholder="Ej: Auditor Externo"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
                <textarea [(ngModel)]="formRol.descripcion" rows="2" placeholder="Describe los permisos y propósito de este rol..."
                          class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none"></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Rol de PostgreSQL Asociado</label>
                <select [(ngModel)]="formRol.idRolBd" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white">
                  <option [ngValue]="null">-- Seleccionar Rol BD --</option>
                  @for (bd of rolesBd(); track bd.idRolBd) {
                    <option [ngValue]="bd.idRolBd">{{ bd.nombreRolBd }} ({{ bd.descripcion }})</option>
                  }
                </select>
                <p class="text-[11px] text-gray-500 mt-1">Todas las consultas que haga este usuario usarán este usuario de base de datos.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                <select [(ngModel)]="formRol.idEstado" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none bg-white">
                  <option [ngValue]="1">Activo</option>
                  <option [ngValue]="2">Inactivo</option>
                </select>
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalRolOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveRol()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar Rol</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL ROL BD -->
      @if (isModalRolBdOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <h3 class="font-bold text-base text-blue-900">{{ selectedRolBd() ? 'Editar Rol PostgreSQL' : 'Registrar Nuevo Rol PostgreSQL' }}</h3>
              <button (click)="isModalRolBdOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre en Servidor PostgreSQL</label>
                <input type="text" [(ngModel)]="formRolBd.nombreRolBd" placeholder="Ej: rol_auditoria_sacpa"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:border-blue-600 outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción de Permisos en BD</label>
                <textarea [(ngModel)]="formRolBd.descripcion" rows="2" placeholder="Ej: Solo lectura en esquemas gerencia y seguridad..."
                          class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-blue-600 outline-none"></textarea>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <input type="checkbox" id="chkActivo" [(ngModel)]="formRolBd.activo" class="w-4 h-4 text-blue-600 rounded border-gray-300">
                <label for="chkActivo" class="text-sm font-semibold text-gray-800">Habilitado para conexiones en el servidor</label>
              </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button (click)="isModalRolBdOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button (click)="saveRolBd()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar Rol BD</span>
              </button>
            </div>
          </div>
        </div>
      }

      <app-confirm-dialog [isOpen]="isConfirmOpen()"
                          [title]="confirmTitle()"
                          [message]="confirmMessage()"
                          confirmText="Eliminar"
                          [isDanger]="true"
                          (cancel)="isConfirmOpen.set(false)"
                          (confirm)="executeDeleteRol()">
      </app-confirm-dialog>
    </div>
  `
})
export class GestionRolesComponent implements OnInit {
  private rolService = inject(RolService);
  private toast = inject(ToastService);

  activeTab = signal<'ROLES_SYS' | 'ROLES_BD'>('ROLES_SYS');
  roles = signal<RolDTO[]>([]);
  rolesBd = signal<RolBDDTO[]>([]);

  // Modales
  isModalRolOpen = signal<boolean>(false);
  selectedRol = signal<RolDTO | null>(null);
  formRol = { nombre: '', descripcion: '', idRolBd: null as number | null, idEstado: 1 };

  isModalRolBdOpen = signal<boolean>(false);
  selectedRolBd = signal<RolBDDTO | null>(null);
  formRolBd = { nombreRolBd: '', descripcion: '', activo: true };

  // Confirm
  isConfirmOpen = signal<boolean>(false);
  confirmTitle = signal<string>('');
  confirmMessage = signal<string>('');
  rolToDelete = signal<RolDTO | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.rolService.listar().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.roles.set(data);
        } else {
          this.roles.set(this.getRolesSistemaDefault());
        }
      },
      error: () => this.roles.set(this.getRolesSistemaDefault())
    });

    this.rolService.listarRolesBd().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.rolesBd.set(data);
        } else {
          this.rolesBd.set(this.getRolesBdDefault());
        }
      },
      error: () => this.rolesBd.set(this.getRolesBdDefault())
    });
  }

  getRolesSistemaDefault(): RolDTO[] {
    return [
      { idRol: 1, nombre: 'Administrador General', descripcion: 'Perfil con acceso total a gerencia, operaciones, inventario y seguridad en SACPA.', idEstado: 1, rolBD: { idRolBd: 1, nombreRolBd: 'rol_admin_sacpa', activo: true } },
      { idRol: 2, nombre: 'Gerente de Operaciones', descripcion: 'Gestión y supervisión de reportes, alertas IA y logística de almacenes.', idEstado: 1, rolBD: { idRolBd: 2, nombreRolBd: 'rol_gerente_sacpa', activo: true } },
      { idRol: 3, nombre: 'Supervisor de Inventario', descripcion: 'Administración de lotes, bodegas, estanterías y fechas de caducidad.', idEstado: 1, rolBD: { idRolBd: 3, nombreRolBd: 'rol_supervisor_inv_sacpa', activo: true } },
      { idRol: 4, nombre: 'Auditor Externo', descripcion: 'Acceso de solo lectura al historial de auditoría y reportes gerenciales.', idEstado: 1, rolBD: { idRolBd: 4, nombreRolBd: 'rol_auditor_sacpa', activo: true } }
    ];
  }

  getRolesBdDefault(): RolBDDTO[] {
    return [
      { idRolBd: 1, nombreRolBd: 'rol_admin_sacpa', descripcion: 'Rol nativo PostgreSQL super-acceso SACPA', activo: true },
      { idRolBd: 2, nombreRolBd: 'rol_gerente_sacpa', descripcion: 'Rol nativo PostgreSQL con RLS en gerencia y reportes', activo: true },
      { idRolBd: 3, nombreRolBd: 'rol_supervisor_inv_sacpa', descripcion: 'Rol nativo PostgreSQL en esquema inventario', activo: true },
      { idRolBd: 4, nombreRolBd: 'rol_auditor_sacpa', descripcion: 'Rol nativo PostgreSQL solo lectura (SELECT)', activo: true }
    ];
  }

  getRolBdName(r: RolDTO): string {
    if (r.rolBD?.nombreRolBd) return r.rolBD.nombreRolBd;
    if (r.idRolBd) {
      const found = this.rolesBd().find(x => x.idRolBd === r.idRolBd);
      if (found) return found.nombreRolBd;
    }
    return `rol_${r.nombre.toLowerCase().replace(/\s+/g, '_')}_sacpa`;
  }

  // --- ACCIONES ROLES SISTEMA ---
  openCreateRolModal(): void {
    this.selectedRol.set(null);
    this.formRol = { nombre: '', descripcion: '', idRolBd: null, idEstado: 1 };
    this.isModalRolOpen.set(true);
  }

  openEditRolModal(r: RolDTO): void {
    this.selectedRol.set(r);
    this.formRol = {
      nombre: r.nombre,
      descripcion: r.descripcion || '',
      idRolBd: r.rolBD?.idRolBd || r.idRolBd || null,
      idEstado: r.idEstado
    };
    this.isModalRolOpen.set(true);
  }

  saveRol(): void {
    if (!this.formRol.nombre.trim()) {
      this.toast.warning('Validación', 'El nombre del rol es obligatorio.');
      return;
    }

    const payload: Partial<RolDTO> = {
      nombre: this.formRol.nombre,
      descripcion: this.formRol.descripcion,
      idEstado: this.formRol.idEstado,
      idRolBd: this.formRol.idRolBd || undefined
    };

    if (this.selectedRol()) {
      this.rolService.actualizar(this.selectedRol()!.idRol, payload).subscribe({
        next: () => {
          this.toast.success('Rol actualizado', `El rol "${this.formRol.nombre}" fue actualizado.`);
          this.isModalRolOpen.set(false);
          this.loadData();
        },
        error: () => this.toast.error('Error', 'No se pudo actualizar el rol en el servidor.')
      });
    } else {
      this.rolService.crear(payload).subscribe({
        next: () => {
          this.toast.success('Rol creado', `Se creó el rol "${this.formRol.nombre}".`);
          this.isModalRolOpen.set(false);
          this.loadData();
        },
        error: () => this.toast.error('Error', 'No se pudo crear el rol.')
      });
    }
  }

  toggleRolStatus(r: RolDTO, newStatus: number): void {
    this.rolService.cambiarEstado(r.idRol, newStatus).subscribe({
      next: () => {
        const estText = newStatus === 1 ? 'activado' : 'desactivado';
        this.toast.success('Estado modificado', `El rol "${r.nombre}" ahora está ${estText}.`);
        this.loadData();
      }
    });
  }

  confirmDeleteRol(r: RolDTO): void {
    this.rolToDelete.set(r);
    this.confirmTitle.set('Eliminar Rol del Sistema');
    this.confirmMessage.set(`⚠️ ¿Estás seguro de eliminar el rol "${r.nombre}"? Si hay usuarios asignados a este rol, podrían perder sus permisos de acceso.`);
    this.isConfirmOpen.set(true);
  }

  executeDeleteRol(): void {
    const r = this.rolToDelete();
    if (!r) return;
    this.rolService.eliminar(r.idRol).subscribe({
      next: () => {
        this.toast.success('Rol eliminado', `El rol "${r.nombre}" fue eliminado.`);
        this.isConfirmOpen.set(false);
        this.loadData();
      }
    });
  }

  // --- ACCIONES ROLES BD ---
  openCreateRolBdModal(): void {
    this.selectedRolBd.set(null);
    this.formRolBd = { nombreRolBd: 'rol_', descripcion: '', activo: true };
    this.isModalRolBdOpen.set(true);
  }

  openEditRolBdModal(bd: RolBDDTO): void {
    this.selectedRolBd.set(bd);
    this.formRolBd = {
      nombreRolBd: bd.nombreRolBd,
      descripcion: bd.descripcion || '',
      activo: bd.activo
    };
    this.isModalRolBdOpen.set(true);
  }

  saveRolBd(): void {
    if (!this.formRolBd.nombreRolBd.trim() || !this.formRolBd.nombreRolBd.startsWith('rol_')) {
      this.toast.warning('Validación', 'El nombre en PostgreSQL debe empezar con el prefijo "rol_".');
      return;
    }

    const payload: Partial<RolBDDTO> = {
      nombreRolBd: this.formRolBd.nombreRolBd,
      descripcion: this.formRolBd.descripcion,
      activo: this.formRolBd.activo
    };

    if (this.selectedRolBd()) {
      this.rolService.actualizarRolBd(this.selectedRolBd()!.idRolBd, payload).subscribe({
        next: () => {
          this.toast.success('Rol PostgreSQL guardado', `Se ha actualizado el rol "${this.formRolBd.nombreRolBd}" en la base de datos.`);
          this.isModalRolBdOpen.set(false);
          this.loadData();
        },
        error: () => this.toast.error('Error', 'No se pudo actualizar el rol en la base de datos.')
      });
    } else {
      this.rolService.crearRolBd(payload).subscribe({
        next: () => {
          this.toast.success('Rol PostgreSQL guardado', `Se ha registrado "${this.formRolBd.nombreRolBd}" y sus políticas RLS en base de datos.`);
          this.isModalRolBdOpen.set(false);
          this.loadData();
        },
        error: () => this.toast.error('Error', 'No se pudo registrar el rol de BD.')
      });
    }
  }
}
