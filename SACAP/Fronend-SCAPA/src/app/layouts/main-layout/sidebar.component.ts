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
          <span class="text-[11px] font-medium text-green-200/80 uppercase tracking-widest mt-0.5 block">SACPA v2.4</span>
        </div>
      </div>

      <!-- Menú de Navegación por Rol -->
      <div class="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
        
        <!-- BODEGUERO / ALMACÉN -->
        @if (isRol('bodeg') || currentPath().includes('/bodega')) {
          <div class="px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Espacio Bodeguero</div>
          <a routerLink="/bodega/dashboard" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="package" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Almacén & Despachos</span>
          </a>
          <a routerLink="/admin/alertas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="alert-triangle" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Alertas de Caducidad</span>
          </a>
        }

        <!-- TÉCNICO DE CAMPO -->
        @if (isRol('tecnic') || isRol('técnic') || isRol('campo') || currentPath().includes('/campo')) {
          <div class="px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Espacio Campo</div>
          <a routerLink="/campo/dashboard" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="activity" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Registro de Uso Agronómico</span>
          </a>
        }

        <!-- SUPERVISOR -->
        @if (isRol('supervis') || currentPath().includes('/supervisor')) {
          <div class="px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Control de Calidad</div>
          <a routerLink="/supervisor/dashboard" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="check-circle" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Centro de Aprobaciones</span>
          </a>
          <a routerLink="/admin/temporadas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="calendar" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Temporadas Agrícolas</span>
          </a>
          <a routerLink="/admin/alertas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="alert-triangle" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Alertas de Caducidad</span>
          </a>
        }

        <!-- ADMINISTRADOR / GENERAL -->
        @if (!isRol('bodeg') && !isRol('tecnic') && !isRol('técnic') && !isRol('campo') && !isRol('supervis') && !currentPath().includes('/bodega') && !currentPath().includes('/campo') && !currentPath().includes('/supervisor')) {
          <div class="px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Principal Admin</div>
          
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

          <div class="pt-4 px-3 pb-1.5 text-[10px] font-bold text-green-200/60 uppercase tracking-wider">Operaciones & IA</div>

          <a routerLink="/admin/temporadas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="calendar" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Temporadas Agrícolas</span>
          </a>

          <a routerLink="/admin/alertas" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="alert-triangle" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Alertas Caducidad</span>
          </a>

          <a routerLink="/admin/ia/promociones" routerLinkActive="!bg-white !text-[#0B4628] font-bold shadow-md [&_span]:!text-[#0B4628] [&_lucide-icon]:!text-[#0B4628]"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-green-100 hover:bg-white/10 transition-all duration-150 cursor-pointer group">
            <lucide-icon name="gift" class="w-4 h-4 flex-shrink-0"></lucide-icon>
            <span>Combos & IA</span>
          </a>

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

      <!-- Pie del Sidebar: Usuario logueado & Selector -->
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
  private router = inject(Router);

  currentPath(): string {
    return this.router.url;
  }

  isRol(termino: string): boolean {
    const r = (this.authService.currentRole() || '').toLowerCase();
    return r.includes(termino.toLowerCase());
  }
}
