import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, AvatarComponent],
  styleUrl: './sidebar.component.css',
  template: `
    <aside class="sidebar">
      <!-- Logo & Título -->
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <lucide-icon name="leaf" class="w-6 h-6 sidebar-logo__icon"></lucide-icon>
        </div>
        <div>
          <h1 class="sidebar-title">AgroSense</h1>

          <span class="sidebar-subtitle">SACPA v2.4</span>
        </div>
      </div>

      <!-- Menú de Navegación por Rol -->
      <div class="sidebar-nav custom-scrollbar">
        
        <!-- BODEGUERO / ALMACÉN -->
        @if (isRol('bodeg') || currentPath().includes('/bodega')) {
          <div class="nav-section-title">Espacio Bodeguero</div>
          <a routerLink="/bodega/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="package" class="nav-item__icon"></lucide-icon>
            <span>Almacén & Despachos</span>
          </a>
          <a routerLink="/bodega/recepciones-hoy" routerLinkActive="active" class="nav-item">
            <lucide-icon name="package-check" class="nav-item__icon"></lucide-icon>
            <span>Recepción de Compras</span>
          </a>
          <a routerLink="/admin/alertas" routerLinkActive="active" class="nav-item">
            <lucide-icon name="alert-triangle" class="nav-item__icon"></lucide-icon>
            <span>Alertas de Caducidad</span>
          </a>
          <a routerLink="/bodega/devoluciones" routerLinkActive="active" class="nav-item">
            <lucide-icon name="corner-up-left" class="nav-item__icon"></lucide-icon>
            <span>Devoluciones Pendientes</span>
          </a>
          <a routerLink="/admin/bodega/topologia" routerLinkActive="active" class="nav-item">
            <lucide-icon name="network" class="nav-item__icon"></lucide-icon>
            <span>Topología de Bodega</span>
          </a>
          <a routerLink="/admin/bodega/asignacion" routerLinkActive="active" class="nav-item">
            <lucide-icon name="arrow-right-left" class="nav-item__icon"></lucide-icon>
            <span>Asignar a Ubicación</span>
          </a>
          <a routerLink="/admin/bodega/auditoria-qr" routerLinkActive="active" class="nav-item">
            <lucide-icon name="qr-code" class="nav-item__icon"></lucide-icon>
            <span>Auditoría QR (Móvil)</span>
          </a>
        }

        <!-- TÉCNICO DE CAMPO -->
        @if (isRol('tecnic') || isRol('técnic') || isRol('campo') || currentPath().includes('/campo')) {
          <div class="nav-section-title">Espacio Campo</div>
          <a routerLink="/campo/combos" routerLinkActive="active" class="nav-item">
            <lucide-icon name="zap" class="nav-item__icon"></lucide-icon>
            <span>Combos IA</span>
          </a>
          <a routerLink="/admin/ventas/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="file-plus" class="nav-item__icon"></lucide-icon>
            <span>Generar Venta / Pedido</span>
          </a>
          <a routerLink="/admin/ventas/sugerencias" routerLinkActive="active" class="nav-item">
            <lucide-icon name="sparkles" class="nav-item__icon"></lucide-icon>
            <span>Motor de Sugerencias</span>
          </a>
          <a routerLink="/campo/historial-ventas" routerLinkActive="active" class="nav-item">
            <lucide-icon name="clipboard-list" class="nav-item__icon"></lucide-icon>
            <span>Historial de Ventas</span>
          </a>
          <a routerLink="/campo/entregas" routerLinkActive="active" class="nav-item">
            <lucide-icon name="truck" class="nav-item__icon"></lucide-icon>
            <span>Historial de Entregas</span>
          </a>
          <a routerLink="/campo/historial-devoluciones" routerLinkActive="active" class="nav-item">
            <lucide-icon name="corner-up-left" class="nav-item__icon"></lucide-icon>
            <span>Historial de Devoluciones</span>
          </a>
        }

        <!-- SUPERVISOR -->
        @if (isRol('supervis') || currentPath().includes('/supervisor')) {
          <div class="nav-section-title">Panel de Supervisor</div>
          
          <a routerLink="/supervisor/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="layout-dashboard" class="nav-item__icon"></lucide-icon>
            <span>Dashboard Principal</span>
          </a>

          <a routerLink="/admin/supervisor/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="package" class="nav-item__icon"></lucide-icon>
            <span>Mi Bodega</span>
          </a>

          <a routerLink="/supervisor/proveedores" routerLinkActive="active" class="nav-item">
            <lucide-icon name="truck" class="nav-item__icon"></lucide-icon>
            <span>Gestión de Proveedores</span>
          </a>
          
          <a routerLink="/supervisor/compras" routerLinkActive="active" class="nav-item">
            <lucide-icon name="receipt" class="nav-item__icon"></lucide-icon>
            <span>Compras a Proveedores</span>
          </a>
          
          <a routerLink="/admin/temporadas" routerLinkActive="active" class="nav-item">
            <lucide-icon name="calendar" class="nav-item__icon"></lucide-icon>
            <span>Temporadas Agrícolas</span>
          </a>
          
          <a routerLink="/supervisor/centro-aprobaciones" routerLinkActive="active" class="nav-item">
            <lucide-icon name="check-circle" class="nav-item__icon"></lucide-icon>
            <span>Centro de Aprobaciones</span>
          </a>
          
          <a routerLink="/admin/alertas" routerLinkActive="active" class="nav-item">
            <lucide-icon name="alert-triangle" class="nav-item__icon"></lucide-icon>
            <span>Alertas de Caducidad</span>
          </a>
        }

        <!-- ADMINISTRADOR / GENERAL -->
        @if (!isRol('bodeg') && !isRol('tecnic') && !isRol('técnic') && !isRol('campo') && !isRol('supervis') && !currentPath().includes('/bodega') && !currentPath().includes('/campo') && !currentPath().includes('/supervisor')) {
          <div class="nav-section-title">Principal Admin</div>
          
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="layout-dashboard" class="nav-item__icon"></lucide-icon>
            <span>Dashboard Principal</span>
          </a>

          <!-- Acordeón Operaciones & IA -->
          <div class="accordion" style="margin-top: 1rem;">
            <button type="button" class="accordion-header" (click)="toggleOperaciones()">
              <span class="accordion-title">Operaciones & IA</span>
              <span class="accordion-icon">{{ isOperacionesOpen() ? '–' : '+' }}</span>
            </button>
            <div class="accordion-content" [class.open]="isOperacionesOpen()">
              <a routerLink="/admin/temporadas" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="calendar" class="nav-item__icon"></lucide-icon>
                <span>Temporadas Agrícolas</span>
              </a>
              <a routerLink="/admin/alertas" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="alert-triangle" class="nav-item__icon"></lucide-icon>
                <span>Alertas Caducidad</span>
              </a>
              <a routerLink="/admin/ia/promociones" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="gift" class="nav-item__icon"></lucide-icon>
                <span>Combos & IA</span>
              </a>
            </div>
          </div>

          <!-- Acordeón Sistema -->
          <div class="accordion" style="margin-top: 0.5rem;">
            <button type="button" class="accordion-header" (click)="toggleSistema()">
              <span class="accordion-title">Sistema</span>
              <span class="accordion-icon">{{ isSistemaOpen() ? '–' : '+' }}</span>
            </button>
            <div class="accordion-content" [class.open]="isSistemaOpen()">
              <a routerLink="/admin/catalogos" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="layers" class="nav-item__icon"></lucide-icon>
                <span>Catálogos SACPA</span>
              </a>
              <a routerLink="/admin/auditoria" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="shield-check" class="nav-item__icon"></lucide-icon>
                <span>Log de Auditoría</span>
              </a>
              <a routerLink="/admin/configuracion" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="settings" class="nav-item__icon"></lucide-icon>
                <span>Configuración general</span>
              </a>
            </div>
          </div>

          <!-- Acordeón Seguridad y Accesos -->
          <div class="accordion" style="margin-top: 0.5rem;">
            <button type="button" class="accordion-header" (click)="toggleSeguridad()">
              <span class="accordion-title">Seguridad y Accesos</span>
              <span class="accordion-icon">{{ isSeguridadOpen() ? '–' : '+' }}</span>
            </button>
            <div class="accordion-content" [class.open]="isSeguridadOpen()">
              <a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="users" class="nav-item__icon"></lucide-icon>
                <span>Gestión de Usuarios</span>
              </a>
              <a routerLink="/admin/roles" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="key" class="nav-item__icon"></lucide-icon>
                <span>Roles del Sistema</span>
              </a>
              <a routerLink="/admin/privilegios" routerLinkActive="active" class="nav-item nav-item--sub">
                <lucide-icon name="shield" class="nav-item__icon"></lucide-icon>
                <span>Matriz Privilegios</span>
              </a>
            </div>
          </div>
        }

      </div>

      <!-- Pie del Sidebar: Usuario logueado & Selector -->

      <div class="sidebar-footer">
        <app-avatar [name]="authService.currentUser()?.correo || 'Usuario'" size="md"></app-avatar>
        <div class="user-info">
          <p class="user-info__name">{{ authService.currentUser()?.correo || 'admin@agrosense.ec' }}</p>
          <p class="user-info__role">{{ authService.currentRole() || 'Administrador' }}</p>
        </div>
        <button (click)="authService.logout()" class="btn-logout" title="Cerrar sesión">
          <lucide-icon name="log-out" class="w-4 h-4"></lucide-icon>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  private router = inject(Router);
  
  isSeguridadOpen = signal(false);
  isOperacionesOpen = signal(false);
  isSistemaOpen = signal(false);

  currentPath(): string {
    return this.router.url;
  }

  isRol(termino: string): boolean {
    const r = (this.authService.currentRole() || '').toLowerCase();
    return r.includes(termino.toLowerCase());
  }

  toggleSeguridad(): void {
    this.isSeguridadOpen.set(!this.isSeguridadOpen());
  }

  toggleOperaciones(): void {
    this.isOperacionesOpen.set(!this.isOperacionesOpen());
  }

  toggleSistema(): void {
    this.isSistemaOpen.set(!this.isSistemaOpen());

  }
}
