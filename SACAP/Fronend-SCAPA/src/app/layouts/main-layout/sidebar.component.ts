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
          <span class="sidebar-subtitle">LMS v2.4</span>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <div class="sidebar-nav custom-scrollbar">

        <!-- Categoría: PRINCIPAL (Admin / Supervisor / Gerente) -->
        @if (hasRole(['SUPERVISOR', 'GERENTE'])) {
          <div class="nav-section-title">Principal</div>

          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="layout-dashboard" class="nav-item__icon"></lucide-icon>
            <span>Dashboard IA</span>
          </a>

          <a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-item">
            <lucide-icon name="users" class="nav-item__icon"></lucide-icon>
            <span>Gestión de Usuarios</span>
          </a>
        }

        <!-- Solo Administrador: Configuración Estructural -->
        @if (hasExactRole(['ADMINISTRADOR'])) {
          <a routerLink="/admin/bodega/topologia" routerLinkActive="active" class="nav-item">
            <lucide-icon name="network" class="nav-item__icon"></lucide-icon>
            <span>Topología y Almacenes</span>
          </a>

          <a routerLink="/admin/roles" routerLinkActive="active" class="nav-item">
            <lucide-icon name="key" class="nav-item__icon"></lucide-icon>
            <span>Roles del Sistema</span>
          </a>

          <a routerLink="/admin/privilegios" routerLinkActive="active" class="nav-item">
            <lucide-icon name="shield" class="nav-item__icon"></lucide-icon>
            <span>Matriz Privilegios</span>
          </a>
        }

        <!-- Categoría: MÓDULO 3 - INVENTARIO (Proveedores y Bodegueros) -->
        @if (hasExactRole(['PROVEEDOR', 'BODEGUERO'])) {
          <div class="nav-section-title">Módulo Inventario</div>

          @if (hasExactRole(['PROVEEDOR'])) {
            <a routerLink="/admin/proveedor/dashboard" routerLinkActive="active" class="nav-item">
              <lucide-icon name="layout-dashboard" class="nav-item__icon"></lucide-icon>
              <span>Mi Dashboard</span>
            </a>

            <a routerLink="/admin/inventario/pre-registro" routerLinkActive="active" class="nav-item">
              <lucide-icon name="clipboard-check" class="nav-item__icon"></lucide-icon>
              <span>Pre-registro de Lotes</span>
            </a>
          }

          @if (hasExactRole(['BODEGUERO'])) {
            <a routerLink="/admin/bodega/topologia" routerLinkActive="active" class="nav-item">
              <lucide-icon name="grid" class="nav-item__icon"></lucide-icon>
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
        }

        <!-- Solo Supervisor: Mi Bodega -->
        @if (hasExactRole(['SUPERVISOR'])) {
          <div class="nav-section-title">Mi Bodega</div>

          <a routerLink="/admin/supervisor/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="package" class="nav-item__icon"></lucide-icon>
            <span>Dashboard Supervisor</span>
          </a>
        }

        <!-- Solo Técnico de Campo: Ventas (Módulo 3) -->
        @if (hasExactRole(['TECNICO'])) {
          <div class="nav-section-title">Ventas</div>

          <a routerLink="/admin/ventas/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="layout-dashboard" class="nav-item__icon"></lucide-icon>
            <span>Mi Panel</span>
          </a>

          <a routerLink="/admin/ventas/sugerencias" routerLinkActive="active" class="nav-item">
            <lucide-icon name="sparkles" class="nav-item__icon"></lucide-icon>
            <span>Motor de Sugerencias</span>
          </a>

          <a routerLink="/admin/ventas/checkout" routerLinkActive="active" class="nav-item">
            <lucide-icon name="dollar-sign" class="nav-item__icon"></lucide-icon>
            <span>Punto de Venta</span>
          </a>
        }

        <!-- Categoría: OPERACIONES & IA (Supervisores y Gerentes) -->
        @if (hasRole(['SUPERVISOR', 'BODEGUERO', 'GERENTE'])) {
          <div class="nav-section-title">Operaciones & IA</div>

          @if (hasRole(['SUPERVISOR', 'GERENTE'])) {
            <a routerLink="/admin/temporadas" routerLinkActive="active" class="nav-item">
              <lucide-icon name="calendar" class="nav-item__icon"></lucide-icon>
              <span>Temporadas Agrícolas</span>
            </a>
          }

          <a routerLink="/admin/alertas" routerLinkActive="active" class="nav-item">
            <lucide-icon name="alert-triangle" class="nav-item__icon"></lucide-icon>
            <span>Alertas Caducidad</span>
            <span class="nav-item__badge">5</span>
          </a>

          @if (hasRole(['GERENTE'])) {
            <a routerLink="/admin/ia/promociones" routerLinkActive="active" class="nav-item">
              <lucide-icon name="gift" class="nav-item__icon"></lucide-icon>
              <span>Combos & IA</span>
            </a>
          }
        }

        <!-- Categoría: SISTEMA & PARÁMETROS (Solo Admin) -->
        @if (hasRole([])) {
          <div class="nav-section-title">Sistema</div>

          <a routerLink="/admin/catalogos" routerLinkActive="active" class="nav-item">
            <lucide-icon name="layers" class="nav-item__icon"></lucide-icon>
            <span>Catálogos SACPA</span>
          </a>

          <a routerLink="/admin/auditoria" routerLinkActive="active" class="nav-item">
            <lucide-icon name="shield-check" class="nav-item__icon"></lucide-icon>
            <span>Log de Auditoría</span>
          </a>

          <a routerLink="/admin/configuracion" routerLinkActive="active" class="nav-item">
            <lucide-icon name="settings" class="nav-item__icon"></lucide-icon>
            <span>Configuración general</span>
          </a>
        }
      </div>

      <!-- Pie del Sidebar: Usuario logueado -->
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

  hasRole(allowedRoles: string[]): boolean {
    const currentRole = this.authService.currentRole()?.toUpperCase() || '';
    if (currentRole === 'ADMINISTRADOR') return true;
    return allowedRoles.includes(currentRole);
  }

  hasExactRole(allowedRoles: string[]): boolean {
    const currentRole = this.authService.currentRole()?.toUpperCase() || '';
    return allowedRoles.map(r => r.toUpperCase()).includes(currentRole);
  }
}
