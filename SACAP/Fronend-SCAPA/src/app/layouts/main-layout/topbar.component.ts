import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { AdministradorService } from '../../core/services/administrador.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AvatarComponent],
  styleUrl: './topbar.component.css',
  template: `
    <header class="topbar">
      <!-- Título de vista y Módulo Dinámico -->
      <div class="topbar-brand">
        <div class="topbar-icon-wrapper">
          <lucide-icon [name]="currentRouteInfo().icon" class="w-4 h-4"></lucide-icon>
        </div>
        <div class="topbar-titles">
          <h2 class="topbar-title">{{ currentRouteInfo().title }}</h2>
          <span class="topbar-subtitle">{{ currentRouteInfo().subtitle }}</span>
        </div>
      </div>

      <!-- Acciones Derecha -->
      <div class="topbar-actions">
        <!-- Indicador de Alertas / Campana -->
        <button (click)="toast.info('Alertas Operativas', 'Hay 2 lotes urgentes por caducidad que requieren tu revisión.')"
                class="btn-icon" title="Notificaciones SACPA">
          <lucide-icon name="bell" class="w-4 h-4"></lucide-icon>
          <span class="indicator-dot indicator-dot--ping"></span>
          <span class="indicator-dot"></span>
        </button>

        <div class="topbar-divider"></div>

        <!-- Perfil rápido (Clic para abrir modal de foto) -->
        <div (click)="openProfileModal()" class="profile-btn" title="Haz clic para editar tu foto de perfil">
          <app-avatar [name]="authService.currentUser()?.correo || 'Admin'" [imageUrl]="savedPhoto()" size="sm"></app-avatar>
          <div class="profile-info">
            <h3 class="profile-name">
              <span>{{ authService.currentUser()?.correo || 'admin@agrosense.ec' }}</span>
              <lucide-icon name="camera" class="w-3 h-3 text-[var(--c-sage-border)]"></lucide-icon>
            </h3>
            <span class="profile-role">{{ authService.currentRole() || 'Administrador' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- MODAL DE PERFIL Y FOTO -->
    @if (isProfileModalOpen()) {
      <div class="modal-overlay animate-fade-in">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-header__title">
              <lucide-icon name="user" class="w-5 h-5 text-[var(--c-dark-green)]"></lucide-icon>
              <span>Configuración de Perfil</span>
            </h3>
            <button (click)="isProfileModalOpen.set(false)" class="btn-close">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <div class="modal-body">
            <!-- Vista previa del Avatar -->
            <div class="modal-avatar-preview">
              <div class="avatar-preview__circle">
                @if (fotoUrl) {
                  <img [src]="fotoUrl" alt="Preview">
                } @else {
                  <span>{{ (authService.currentUser()?.correo || 'A')[0].toUpperCase() }}</span>
                }
              </div>
              <p class="avatar-preview__name">{{ authService.currentUser()?.correo }}</p>
              <span class="avatar-preview__role">{{ authService.currentRole() || 'ADMINISTRADOR' }}</span>
            </div>

            <!-- Carga de Archivo o URL -->
            <div class="modal-upload-section">
              <div>
                <label class="upload-label">Subir imagen desde tu equipo</label>
                <label class="upload-box">
                  <lucide-icon name="upload" class="w-4 h-4"></lucide-icon>
                  <span>Hacer clic para seleccionar archivo</span>
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;">
                </label>
              </div>

              <div>
                <label class="upload-label">O pegar URL de imagen</label>
                <input type="text" [(ngModel)]="fotoUrl" placeholder="https://ejemplo.com/mifoto.jpg" class="upload-input-text">
              </div>

              @if (fotoUrl) {
                <div>
                  <button (click)="fotoUrl = ''" class="btn-remove-photo">
                    Remover foto (usar iniciales)
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="isProfileModalOpen.set(false)" class="btn-secondary">Cancelar</button>
            <button (click)="saveFoto()" class="btn-primary" style="margin-top: 0;">
              <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class TopbarComponent {
  authService = inject(AuthService);
  private adminService = inject(AdministradorService);
  private router = inject(Router);
  toast = inject(ToastService);

  currentUrl = signal<string>(this.router.url);
  isProfileModalOpen = signal<boolean>(false);
  savedPhoto = signal<string | undefined>(undefined);
  fotoUrl = '';

  /** Clave única de localStorage por usuario logueado para aislar fotos entre perfiles */
  private getPhotoKey(): string {
    const correo = this.authService.currentUser()?.correo || 'guest';
    return `sacpa_foto_${correo}`;
  }

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });

    // Cargar la foto del usuario actual al iniciar (clave única por correo)
    const key = this.getPhotoKey();
    const fotoGuardada = localStorage.getItem(key);
    if (fotoGuardada) {
      this.savedPhoto.set(fotoGuardada);
    }
  }

  currentRouteInfo = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/bodega')) {
      return { title: 'Módulo Almacén & Despachos FEFO', subtitle: 'Gestión de inventario físico, rotación de lotes y devoluciones a proveedor', icon: 'package' };
    }
    if (url.includes('/campo')) {
      return { title: 'Módulo Agronómico & Uso en Campo', subtitle: 'Registro transaccional de consumo en parcelas y auditoría de cultivos', icon: 'activity' };
    }
    if (url.includes('/supervisor')) {
      return { title: 'Centro de Control y Autorizaciones', subtitle: 'Revisión de despachos pendientes y aprobación con disparo de Alertas IA', icon: 'check-circle' };
    }
    if (url.includes('/dashboard')) {
      return { title: 'Dashboard Ejecutivo IA', subtitle: 'Monitoreo en tiempo real del sistema AgroSense SACPA', icon: 'layout-dashboard' };
    }
    if (url.includes('/usuarios')) {
      return { title: 'Gestión de Usuarios', subtitle: 'Accesos · Cuentas · Restablecimiento de contraseñas', icon: 'users' };
    }
    if (url.includes('/roles')) {
      return { title: 'Roles del Sistema y BD', subtitle: 'Perfiles de aplicación y políticas RLS en PostgreSQL', icon: 'key' };
    }
    if (url.includes('/privilegios')) {
      return { title: 'Matriz de Privilegios', subtitle: 'Permisos granulares por tabla, vista y módulo UI', icon: 'shield' };
    }
    if (url.includes('/temporadas')) {
      return { title: 'Temporadas Agrícolas', subtitle: 'Apertura y cierre de campañas agrícolas y proyecciones', icon: 'calendar' };
    }
    if (url.includes('/alertas')) {
      return { title: 'Alertas de Caducidad', subtitle: 'Supervisión inteligente de lotes agrícolas próximos a vencer', icon: 'alert-triangle' };
    }
    if (url.includes('/promociones') || url.includes('/ia')) {
      return { title: 'Combos & Sugerencias IA', subtitle: 'Descuentos automatizados por AgroSense para inventario', icon: 'gift' };
    }
    if (url.includes('/catalogos')) {
      return { title: 'Catálogos Generales', subtitle: 'Tablas paramétricas, estados y unidades de medida', icon: 'layers' };
    }
    if (url.includes('/auditoria')) {
      return { title: 'Log de Auditoría & Seguridad', subtitle: 'Registro transaccional inmutable e historial de conexiones IP', icon: 'shield-check' };
    }
    if (url.includes('/configuracion')) {
      return { title: 'Configuración General', subtitle: 'Parámetros del sistema y umbrales de caducidad SACPA', icon: 'settings' };
    }
    return { title: 'Módulo Administrador', subtitle: 'Sistema de Gestión Agroindustrial SACPA', icon: 'users' };
  });

  openProfileModal(): void {
    this.fotoUrl = this.savedPhoto() || '';
    this.isProfileModalOpen.set(true);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toast.warning('Archivo muy grande', 'La imagen debe pesar menos de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoUrl = e.target.result;
        this.toast.info('Imagen cargada', 'Vista previa lista. Haz clic en Guardar Foto para confirmar.');
      };
      reader.readAsDataURL(file);
    }
  }

  saveFoto(): void {
    const usrId = this.authService.currentUser()?.idUsuario || 1;
    this.adminService.actualizarFoto(usrId, this.fotoUrl).subscribe({
      next: () => {
        // Guardar en localStorage con clave única por usuario
        const key = this.getPhotoKey();
        if (this.fotoUrl) {
          localStorage.setItem(key, this.fotoUrl);
        } else {
          localStorage.removeItem(key);
        }
        this.savedPhoto.set(this.fotoUrl || undefined);
        this.isProfileModalOpen.set(false);
        this.toast.success('Foto actualizada', 'Tu foto de perfil ha sido guardada y sincronizada con el servidor.');
      },
      error: () => {
        this.toast.error('Error', 'No se pudo guardar la foto en el servidor.');
      }
    });
  }
}
