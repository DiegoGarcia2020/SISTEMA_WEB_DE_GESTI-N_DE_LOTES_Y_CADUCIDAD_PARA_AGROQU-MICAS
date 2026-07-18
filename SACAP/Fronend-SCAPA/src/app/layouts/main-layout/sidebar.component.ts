import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, AvatarComponent],
  template: `
    <aside class="w-[240px] bg-[#0B4628] text-white flex flex-col h-screen sticky top-0 flex-shrink-0 shadow-lg select-none z-30">
      <!-- Logo & Título -->
      <div class="p-5 border-b border-white/10 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner flex-shrink-0">
          <lucide-icon name="leaf" class="w-6 h-6 text-green-300"></lucide-icon>
        </div>
        <div>
          <h1 class="font-bold text-lg tracking-tight leading-none text-white">AgroSense</h1>
          <span class="text-[11px] font-medium text-green-200/80 uppercase tracking-widest mt-0.5 block">LMS v2.4</span>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <div class="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
        
        <!-- Categoría: PRINCIPAL (Admin / Supervisor / Gerente) -->
        @if (hasRole(['SUPERVISOR', 'GERENTE'])) {
          <div class="px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Principal</div>
          
          <a routerLink="/admin/dashboard" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="layout-dashboard" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Dashboard IA</span>
          </a>

          <a routerLink="/admin/usuarios" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="users" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Gestión de Usuarios</span>
          </a>
        }

        <!-- Solo Administrador -->
        @if (hasRole([])) {
          <a routerLink="/admin/roles" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="key" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Roles del Sistema</span>
          </a>

          <a routerLink="/admin/privilegios" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="shield" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Matriz Privilegios</span>
          </a>
        }

        <!-- Categoría: MÓDULO 3 - INVENTARIO (Proveedores y Bodegueros) -->
        @if (hasRole(['PROVEEDOR', 'BODEGUERO'])) {
          <div class="pt-4 px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Módulo Inventario</div>

          @if (hasRole(['PROVEEDOR', 'BODEGUERO'])) {
            <a routerLink="/admin/inventario/pre-registro" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
              <lucide-icon name="clipboard-check" class="w-4 h-4 flex-shrink-0"></lucide-icon>
              <span>Pre-registro de Lotes</span>
            </a>
          }

          @if (hasRole(['BODEGUERO'])) {
            <a routerLink="/admin/inventario/recepcion" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
              <lucide-icon name="box" class="w-4 h-4 flex-shrink-0"></lucide-icon>
              <span>Recepción y Validación</span>
            </a>

            <a routerLink="/admin/inventario/estructura" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
              <lucide-icon name="layers" class="w-4 h-4 flex-shrink-0"></lucide-icon>
              <span>Estructura Física</span>
            </a>
          }
        }

        <!-- Categoría: OPERACIONES & IA (Supervisores y Gerentes) -->
        @if (hasRole(['SUPERVISOR', 'BODEGUERO', 'GERENTE'])) {
          <div class="pt-4 px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Operaciones & IA</div>

          @if (hasRole(['SUPERVISOR', 'GERENTE'])) {
            <a routerLink="/admin/temporadas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
              <lucide-icon name="calendar" class="w-4 h-4 flex-shrink-0"></lucide-icon>
              <span>Temporadas Agrícolas</span>
            </a>
          }

          <a routerLink="/admin/alertas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="alert-triangle" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Alertas Caducidad</span>
            <span class="ml-auto text-[10px] bg-amber-500 !text-white font-bold px-1.5 py-0.5 rounded-full">5</span>
          </a>

          @if (hasRole(['GERENTE'])) {
            <a routerLink="/admin/ia/promociones" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
              <lucide-icon name="gift" class="w-4 h-4 flex-shrink-0"></lucide-icon>
              <span>Combos & IA</span>
            </a>
          }
        }

        <!-- Categoría: SISTEMA & PARÁMETROS (Solo Admin) -->
        @if (hasRole([])) {
          <div class="pt-4 px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Sistema</div>

          <a routerLink="/admin/catalogos" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="layers" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Catálogos SACPA</span>
          </a>

          <a routerLink="/admin/auditoria" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="shield-check" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Log de Auditoría</span>
          </a>

          <a routerLink="/admin/configuracion" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="settings" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Configuración general</span>
          </a>
        }
      </div>

      <!-- Pie del Sidebar: Usuario logueado -->
      <div class="p-4 border-t border-white/10 bg-black/10">
        <div class="flex items-center gap-3">
          <app-avatar [name]="authService.currentUser()?.correo || 'Usuario'" size="md"></app-avatar>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-white truncate">{{ authService.currentUser()?.correo || 'admin@agrosense.ec' }}</p>
            <p class="text-[11px] text-green-300 font-medium truncate">{{ authService.currentRole() || 'Administrador' }}</p>
          </div>
          <button (click)="authService.logout()" 
                  class="p-2 rounded-lg text-green-200 hover:text-white hover:bg-red-600/80 transition-all cursor-pointer"
                  title="Cerrar sesión">
            <lucide-icon name="log-out" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  hasRole(allowedRoles: string[]): boolean {
    const currentRole = this.authService.currentRole()?.toUpperCase() || '';
    if (currentRole === 'ADMINISTRADOR') return true;
    return allowedRoles.includes(currentRole);
  }
}
