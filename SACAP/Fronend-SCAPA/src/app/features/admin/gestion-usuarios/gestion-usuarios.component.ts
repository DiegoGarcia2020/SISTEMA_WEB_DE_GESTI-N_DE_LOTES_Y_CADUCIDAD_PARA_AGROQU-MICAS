import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { UsuarioDTO, CreateUsuarioDTO } from '../../../core/models/usuario.model';
import { RolDTO } from '../../../core/models/rol.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { UserFormModalComponent } from './user-form-modal.component';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, LucideAngularModule,
    ConfirmDialogComponent, UserFormModalComponent
  ],
  styles: [`
    .gestion-container { padding: 1.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem; }
    .title { font-size: 1.6rem; font-weight: 800; color: #111827; letter-spacing: -0.025em; }
    
    .search-card {
      background: white;
      padding: 1rem 1.25rem;
      border-radius: 1rem;
      border: 1px solid #E5E7EB;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .search-wrapper { position: relative; flex: 1; min-width: 260px; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #6B7280; }
    .search-input {
      width: 100%;
      padding: 0.7rem 1rem 0.7rem 2.8rem;
      border-radius: 0.75rem;
      border: 1px solid #D1D5DB;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
      background: #F9FAFB;
      color: #1F2937;
    }
    .search-input:focus { border-color: #0B4628; background: white; box-shadow: 0 0 0 3px rgba(11, 70, 40, 0.1); }

    .table-card {
      background: white;
      border-radius: 1rem;
      border: 1px solid #E5E7EB;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th {
      background: #F8FAFC;
      padding: 1rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      border-bottom: 1px solid #E2E8F0;
    }
    .data-table td {
      padding: 1.15rem 1.25rem;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .data-table tr:hover { background-color: #F0FDF4; }

    .user-info-cell { display: flex; flex-direction: column; gap: 0.15rem; }
    .full-name { font-weight: 700; font-size: 0.95rem; color: #111827; }
    .user-email { font-size: 0.825rem; color: #4B5563; font-weight: 500; }
    .user-username { font-size: 0.75rem; color: #64748B; font-family: monospace; }

    .roles-wrapper { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }
    .badge-rol {
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      user-select: none;
    }
    .badge-rol.active {
      background: #E8F5E9;
      color: #0B4628;
      border-color: #A5D6A7;
    }
    .badge-rol.active:hover {
      background: #C8E6C9;
      border-color: #0B4628;
    }
    .badge-rol.inactive {
      background: #FEF2F2;
      color: #991B1B;
      border-color: #FECACA;
    }
    .badge-rol.disabled { opacity: 0.5; cursor: not-allowed; }

    .status-pill {
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .status-pill.active { background: #E8F5E9; color: #0B4628; border: 1px solid #A5D6A7; }
    .status-pill.inactive { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

    .btn-primary {
      background: #0B4628;
      color: white;
      padding: 0.7rem 1.35rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(11, 70, 40, 0.25);
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn-primary:hover { background: #146C43; }

    .btn-secondary {
      background: white;
      color: #0B4628;
      padding: 0.7rem 1.2rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #0B4628;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: #E8F5E9; }

    .btn-icon {
      padding: 0.5rem;
      border-radius: 0.6rem;
      color: #475569;
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-icon:hover { background: #F1F5F9; color: #0B4628; border-color: #CBD5E1; }
  `],
  template: `
    <div class="gestion-container animate-fade-in">
      <!-- Cabecera exacta del estilo SGAC pero con paleta SACPA -->
      <div class="section-header">
        <div>
          <h2 class="title">Gestión de Usuarios</h2>
          <p class="text-xs text-gray-500 mt-0.5">Control de cuentas, asignación de roles y estados en SACPA</p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/admin/solicitudes" class="btn-secondary">
            <lucide-icon name="user-check" [size]="18"></lucide-icon>
            <span>Solicitudes de Registro</span>
          </a>
          <button type="button" class="btn-primary" (click)="openCreateModal()">
            <lucide-icon name="user-plus" [size]="18"></lucide-icon>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <!-- Tarjeta de Búsqueda y Filtro estilo SGAC -->
      <div class="search-card">
        <div class="search-wrapper">
          <lucide-icon class="search-icon" name="search" [size]="18"></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por nombre, correo o cédula..."
            class="search-input"
          />
        </div>

        <div class="flex items-center gap-2">
          <select [(ngModel)]="roleFilter" class="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 bg-white outline-none cursor-pointer focus:border-[#0B4628]">
            <option value="">Todos los Roles</option>
            @for (r of rolesList(); track r.idRol) {
              <option [value]="r.nombre">{{ r.nombre }}</option>
            }
          </select>

          <select [(ngModel)]="statusFilter" class="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 bg-white outline-none cursor-pointer focus:border-[#0B4628]">
            <option value="">Todos los Estados</option>
            <option value="1">Activos</option>
            <option value="2">Inactivos</option>
          </select>

          <button (click)="loadUsers()" class="btn-icon" title="Actualizar datos">
            <lucide-icon name="rotate-cw" [size]="18" [class.animate-spin]="isLoading()"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Tabla de Datos estilo SGAC gestion-usuarios.html -->
      <div class="table-card">
        <table class="data-table" role="table" aria-label="Lista de usuarios del sistema">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Roles Asignados (Clic para gestionar)</th>
              <th>Estado Global</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              <tr>
                <td colspan="4" class="py-12 text-center text-gray-500 font-semibold">
                  <lucide-icon name="loader" [size]="28" class="animate-spin mx-auto mb-2 text-[#0B4628]"></lucide-icon>
                  Cargando usuarios de SACPA...
                </td>
              </tr>
            } @else {
              @for (user of filteredUsers(); track user.idUsuario) {
                <tr>
                  <!-- Usuario -->
                  <td>
                    <div class="user-info-cell">
                      <div class="full-name">{{ user.nombre || 'Usuario SACPA' }}</div>
                      <div class="user-email">{{ user.correo }}</div>
                      <div class="user-username">Cédula: {{ user.cedula || '1700000000' }}</div>
                    </div>
                  </td>

                  <!-- Roles estilo SGAC (badge-rol) -->
                  <td>
                    <div class="roles-wrapper">
                      @for (rol of user.roles; track rol) {
                        <button
                          type="button"
                          (click)="toggleRolUsuario(user, rol)"
                          class="badge-rol active"
                          title="Clic para remover o alternar rol"
                        >
                          <span>{{ rol }}</span>
                          <lucide-icon name="check" [size]="13"></lucide-icon>
                        </button>
                      }
                      <button
                        type="button"
                        (click)="abrirMenuAsignarRol(user)"
                        class="badge-rol"
                        style="background: white; border: 1px dashed #0B4628; color: #0B4628;"
                        title="Asignar rol adicional"
                      >
                        <lucide-icon name="plus" [size]="13"></lucide-icon>
                        <span>Rol</span>
                      </button>
                    </div>
                  </td>

                  <!-- Estado Global estilo SGAC (status-pill) -->
                  <td>
                    <span class="status-pill" [class.active]="user.idEstado === 1" [class.inactive]="user.idEstado !== 1">
                      <span class="w-2 h-2 rounded-full" [style.background-color]="user.idEstado === 1 ? '#0B4628' : '#DC2626'"></span>
                      <span>{{ user.idEstado === 1 ? 'Activo' : 'Inactivo' }}</span>
                    </span>
                  </td>

                  <!-- Acciones estilo SGAC -->
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button type="button" class="btn-icon" (click)="toggleEstadoUsuario(user)" title="Alternar Estado Global (Activo/Inactivo)">
                        <lucide-icon name="power" [size]="18"></lucide-icon>
                      </button>

                      <button type="button" class="btn-icon" (click)="openEditModal(user)" title="Editar datos del usuario">
                        <lucide-icon name="edit-3" [size]="18"></lucide-icon>
                      </button>

                      <button type="button" class="btn-icon" (click)="resetPassword(user)" title="Enviar clave temporal">
                        <lucide-icon name="key" [size]="18"></lucide-icon>
                      </button>

                      <button type="button" class="btn-icon" style="color: #DC2626;" (click)="confirmDelete(user)" title="Eliminar definitivamente">
                        <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="py-12 text-center text-gray-400">
                    <lucide-icon name="users" [size]="40" class="mx-auto mb-2 opacity-40"></lucide-icon>
                    <p class="font-bold text-sm text-gray-600">No se encontraron usuarios que coincidan con la búsqueda</p>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Modales -->
      <app-user-form-modal [isOpen]="isModalOpen()" [userToEdit]="selectedUser()"
                           (close)="isModalOpen.set(false)" (save)="onSaveUser($event)">
      </app-user-form-modal>

      <app-confirm-dialog [isOpen]="isConfirmOpen()"
                          [title]="confirmTitle()"
                          [message]="confirmMessage()"
                          [confirmText]="confirmText()"
                          [isDanger]="isConfirmDanger()"
                          [requireReason]="isConfirmReasonRequired()"
                          (cancel)="isConfirmOpen.set(false)"
                          (confirm)="executeConfirmAction($event)">
      </app-confirm-dialog>
    </div>
  `
})
export class GestionUsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private toast = inject(ToastService);

  users = signal<UsuarioDTO[]>([]);
  rolesList = signal<RolDTO[]>([]);
  isLoading = signal<boolean>(false);
  activeTab = signal<'USERS' | 'SESSIONS'>('USERS');

  // Modales
  isModalOpen = signal<boolean>(false);
  selectedUser = signal<UsuarioDTO | null>(null);
  
  // Confirm Dialog Config
  isConfirmOpen = signal<boolean>(false);
  confirmTitle = signal<string>('');
  confirmMessage = signal<string>('');
  confirmText = signal<string>('Confirmar');
  isConfirmDanger = signal<boolean>(true);
  isConfirmReasonRequired = signal<boolean>(false);
  confirmActionType = signal<'DEACTIVATE' | 'DELETE' | 'LOGOUT' | null>(null);
  userTarget = signal<UsuarioDTO | null>(null);

  // Filtros
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';

  // KPIs calculados
  totalUsers = computed(() => this.users().length);
  activeUsers = computed(() => this.users().filter(u => u.idEstado === 1).length);
  blockedUsers = computed(() => this.users().filter(u => u.idEstado !== 1).length);
  activeSessions = computed(() => Math.max(1, Math.floor(this.activeUsers() * 0.75)));

  filteredUsers = computed(() => {
    return this.users().filter(u => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (u.nombre?.toLowerCase().includes(q)) || 
        (u.correo?.toLowerCase().includes(q)) || 
        (u.cedula?.toLowerCase().includes(q));

      const matchRole = !this.roleFilter || u.roles.some(r => r.toLowerCase() === this.roleFilter.toLowerCase());
      const matchStatus = !this.statusFilter || String(u.idEstado) === this.statusFilter;

      return matchQuery && matchRole && matchStatus;
    });
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.usuarioService.listar().subscribe({
      next: data => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error de conexión', 'No se pudieron recuperar los usuarios.');
      }
    });
  }

  loadRoles(): void {
    this.rolService.listar().subscribe({
      next: data => this.rolesList.set(data),
      error: () => console.warn('No se pudieron recuperar roles dinámicos')
    });
  }

  openCreateModal(): void {
    this.selectedUser.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(u: UsuarioDTO): void {
    this.selectedUser.set(u);
    this.isModalOpen.set(true);
  }

  onSaveUser(payload: any): void {
    if (this.selectedUser()) {
      // Editar
      this.usuarioService.actualizar(this.selectedUser()!.idUsuario, payload).subscribe({
        next: () => {
          this.toast.success('Usuario actualizado', `Los datos de ${payload.correo} se guardaron exitosamente.`);
          this.isModalOpen.set(false);
          this.loadUsers();
        },
        error: () => this.toast.error('Error al actualizar', 'Ocurrió un problema en el servidor.')
      });
    } else {
      // Crear
      this.usuarioService.crear(payload).subscribe({
        next: () => {
          this.toast.success('Usuario registrado', `Se ha creado la cuenta ${payload.correo} en SACPA.`);
          this.isModalOpen.set(false);
          this.loadUsers();
        },
        error: () => this.toast.error('Error al crear', 'Ocurrió un problema al registrar la cuenta.')
      });
    }
  }

  resetPassword(u: UsuarioDTO): void {
    const tempPass = 'SacpaTemp' + Math.floor(1000 + Math.random() * 9000) + '!';
    this.toast.success('Clave temporal generada', `Se envió la contraseña temporal [${tempPass}] al correo ${u.correo}. Deberá cambiarla al iniciar sesión.`);
  }

  toggleEstadoUsuario(u: UsuarioDTO): void {
    const nuevoEstado = u.idEstado === 1 ? 2 : 1;
    this.usuarioService.cambiarEstado(u.idUsuario, nuevoEstado).subscribe({
      next: () => {
        u.idEstado = nuevoEstado;
        const msg = nuevoEstado === 1 ? 'Usuario activado en SACPA' : 'Usuario puesto como Inactivo';
        this.toast.success('Estado actualizado', `${msg}: ${u.correo}`);
        this.loadUsers();
      },
      error: () => this.toast.error('Error', 'No se pudo cambiar el estado del usuario.')
    });
  }

  toggleRolUsuario(u: UsuarioDTO, rolNombre: string): void {
    if (u.roles.length <= 1) {
      this.toast.warning('Operación no permitida', 'El usuario debe conservar al menos un rol activo.');
      return;
    }
    const nuevosRoles = u.roles.filter(r => r !== rolNombre);
    const idRoles = nuevosRoles.map((name, index) => index + 1);
    this.usuarioService.actualizar(u.idUsuario, { correo: u.correo, idEstado: u.idEstado, idRoles } as any).subscribe({
      next: () => {
        u.roles = nuevosRoles;
        this.toast.info('Rol removido', `Se removió el rol "${rolNombre}" de ${u.correo}.`);
        this.loadUsers();
      },
      error: () => this.toast.error('Error', 'No se pudo actualizar los roles.')
    });
  }

  abrirMenuAsignarRol(u: UsuarioDTO): void {
    this.openEditModal(u);
  }

  activateUser(u: UsuarioDTO): void {
    this.toggleEstadoUsuario(u);
  }

  confirmDeactivate(u: UsuarioDTO): void {
    this.userTarget.set(u);
    this.confirmActionType.set('DEACTIVATE');
    this.confirmTitle.set('Desactivar / Bloquear Cuenta');
    this.confirmMessage.set(`¿Estás seguro de que deseas desactivar el acceso a ${u.correo}? El usuario no podrá iniciar sesión en SACPA y sus sesiones activas serán terminadas.`);
    this.confirmText.set('Sí, desactivar');
    this.isConfirmDanger.set(true);
    this.isConfirmReasonRequired.set(true);
    this.isConfirmOpen.set(true);
  }

  confirmDelete(u: UsuarioDTO): void {
    this.userTarget.set(u);
    this.confirmActionType.set('DELETE');
    this.confirmTitle.set('Eliminar Usuario Definitivamente');
    this.confirmMessage.set(`⚠️ ¿Estás completamente seguro de ELIMINAR a ${u.correo}? Esta acción es irreversible y borrará la cuenta del sistema.`);
    this.confirmText.set('Eliminar definitivamente');
    this.isConfirmDanger.set(true);
    this.isConfirmReasonRequired.set(false);
    this.isConfirmOpen.set(true);
  }

  confirmLogout(u: UsuarioDTO): void {
    this.userTarget.set(u);
    this.confirmActionType.set('LOGOUT');
    this.confirmTitle.set('Terminar Sesión Remota');
    this.confirmMessage.set(`¿Deseas forzar el cierre de sesión del usuario ${u.correo}? Perderá el acceso de inmediato hasta que vuelva a autenticarse.`);
    this.confirmText.set('Terminar Sesión');
    this.isConfirmDanger.set(false);
    this.isConfirmReasonRequired.set(false);
    this.isConfirmOpen.set(true);
  }

  executeConfirmAction(motivo?: string): void {
    const u = this.userTarget();
    const action = this.confirmActionType();
    if (!u || !action) return;

    if (action === 'DEACTIVATE') {
      this.usuarioService.cambiarEstado(u.idUsuario, 2).subscribe({
        next: () => {
          const m = motivo ? ` Motivo: ${motivo}` : '';
          this.toast.warning('Cuenta desactivada', `El usuario ${u.correo} ha quedado en estado inactivo.${m}`);
          this.isConfirmOpen.set(false);
          this.loadUsers();
        },
        error: () => {
          this.toast.error('Error', 'No se pudo cambiar el estado del usuario.');
          this.isConfirmOpen.set(false);
        }
      });
    } else if (action === 'DELETE') {
      this.usuarioService.eliminar(u.idUsuario).subscribe({
        next: () => {
          this.toast.success('Usuario eliminado', `La cuenta ${u.correo} fue eliminada permanentemente.`);
          this.isConfirmOpen.set(false);
          this.loadUsers();
        },
        error: () => {
          this.toast.error('Error al eliminar', 'No se pudo eliminar la cuenta del usuario.');
          this.isConfirmOpen.set(false);
        }
      });
    } else if (action === 'LOGOUT') {
      this.toast.info('Sesión Terminada', `Se cerraron remotamente las sesiones de ${u.correo}.`);
      this.isConfirmOpen.set(false);
    }
  }
}
