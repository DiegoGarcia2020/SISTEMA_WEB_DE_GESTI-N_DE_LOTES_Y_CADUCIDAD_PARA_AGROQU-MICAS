import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
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

    <!-- MODAL DE PERFIL: FOTO, DATOS Y CONTRASEÑA (todos los roles) -->
    @if (isProfileModalOpen()) {
      <div class="modal-overlay animate-fade-in">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-header__title">
              <lucide-icon name="user" class="w-5 h-5 text-[var(--c-dark-green)]"></lucide-icon>
              <span>Mi Perfil</span>
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
              <span class="avatar-preview__role">{{ authService.currentRole() || '' }}</span>
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

              <button (click)="saveFoto()" class="btn-primary" style="margin-top: 8px;">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar foto</span>
              </button>
            </div>

            <hr class="profile-modal-divider">

            <!-- Datos personales -->
            <div class="modal-upload-section">
              <label class="upload-label">Datos personales</label>
              <input type="text" [(ngModel)]="datosNombres" placeholder="Nombres" class="upload-input-text">
              <input type="text" [(ngModel)]="datosApellidos" placeholder="Apellidos" class="upload-input-text">
              <input type="text" [(ngModel)]="datosTelefono" placeholder="Teléfono" class="upload-input-text">
              <button (click)="saveDatos()" class="btn-primary" style="margin-top: 8px;">
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                <span>Guardar datos</span>
              </button>
            </div>

            <hr class="profile-modal-divider">

            <!-- Cambiar contraseña -->
            <div class="modal-upload-section">
              <label class="upload-label">Cambiar contraseña</label>
              <input type="password" [(ngModel)]="contrasenaActual" placeholder="Contraseña actual" class="upload-input-text">
              <input type="password" [(ngModel)]="contrasenaNueva" placeholder="Nueva contraseña" class="upload-input-text">
              <input type="password" [(ngModel)]="contrasenaConfirmar" placeholder="Confirmar nueva contraseña" class="upload-input-text">
              <button (click)="cambiarContrasena()" class="btn-primary" style="margin-top: 8px;">
                <lucide-icon name="key" class="w-4 h-4"></lucide-icon>
                <span>Cambiar contraseña</span>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="isProfileModalOpen.set(false)" class="btn-secondary">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class TopbarComponent {
  authService = inject(AuthService);
  private perfilService = inject(PerfilService);
  private router = inject(Router);
  toast = inject(ToastService);

  currentUrl = signal<string>(this.router.url);
  isProfileModalOpen = signal<boolean>(false);
  savedPhoto = signal<string | undefined>(undefined);
  fotoUrl = '';

  datosNombres = '';
  datosApellidos = '';
  datosTelefono = '';

  contrasenaActual = '';
  contrasenaNueva = '';
  contrasenaConfirmar = '';

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });

    // El servidor (seguridad.usuario) es la fuente de verdad para cualquier rol;
    // se carga una vez al iniciar sesión para que el avatar del topbar ya
    // muestre la foto/datos reales sin depender de que el usuario abra el modal.
    this.perfilService.obtenerMiPerfil().subscribe({
      next: perfil => {
        this.savedPhoto.set(perfil.fotoPerfil || undefined);
        this.datosNombres = perfil.nombres || '';
        this.datosApellidos = perfil.apellidos || '';
        this.datosTelefono = perfil.telefono || '';
      },
      error: () => {} // Sin bloquear el resto del topbar si esto falla
    });
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
    
    // Módulo 3: Inventario
    if (url.includes('/inventario/pre-registro')) {
      return { title: 'Pre-registro de Lotes', subtitle: 'Formulario A para proveedores', icon: 'clipboard-check' };
    }
    if (url.includes('/inventario/estructura')) {
      return { title: 'Estructura Física', subtitle: 'Navegación en cascada de almacenes', icon: 'layers' };
    }

    const currentRole = this.authService.currentRole() || 'Administrador';
    return { title: `Módulo ${currentRole}`, subtitle: 'Sistema de Gestión Agroindustrial SACPA', icon: 'leaf' };
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
    this.perfilService.actualizarMiFoto(this.fotoUrl).subscribe({
      next: () => {
        this.savedPhoto.set(this.fotoUrl || undefined);
        this.toast.success('Foto actualizada', 'Tu foto de perfil ha sido guardada.');
      },
      error: (err) => {
        this.toast.error('Error', err?.error?.message || 'No se pudo guardar la foto en el servidor.');
      }
    });
  }

  saveDatos(): void {
    this.perfilService.actualizarMiPerfil({
      nombres: this.datosNombres,
      apellidos: this.datosApellidos,
      telefono: this.datosTelefono
    }).subscribe({
      next: () => this.toast.success('Datos actualizados', 'Tu información personal fue guardada.'),
      error: (err) => this.toast.error('Error', err?.error?.message || 'No se pudieron guardar tus datos.')
    });
  }

  cambiarContrasena(): void {
    if (!this.contrasenaActual || !this.contrasenaNueva) {
      this.toast.warning('Faltan datos', 'Completa la contraseña actual y la nueva.');
      return;
    }
    if (this.contrasenaNueva !== this.contrasenaConfirmar) {
      this.toast.warning('No coinciden', 'La nueva contraseña y su confirmación no son iguales.');
      return;
    }
    this.perfilService.cambiarMiContrasena(this.contrasenaActual, this.contrasenaNueva).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada', 'Tu contraseña fue cambiada correctamente.');
        this.contrasenaActual = '';
        this.contrasenaNueva = '';
        this.contrasenaConfirmar = '';
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'No se pudo cambiar la contraseña.')
    });
  }
}
