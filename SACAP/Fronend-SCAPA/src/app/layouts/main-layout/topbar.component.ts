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
  template: `
    <header class="bg-white border-b border-gray-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs select-none">
      <!-- Título de vista y Módulo Dinámico -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center font-bold text-sm">
          <lucide-icon [name]="currentRouteInfo().icon" class="w-4 h-4"></lucide-icon>
        </div>
        <div>
          <h2 class="text-base font-bold text-gray-900 leading-none">{{ currentRouteInfo().title }}</h2>
          <span class="text-xs text-gray-500 font-medium">{{ currentRouteInfo().subtitle }}</span>
        </div>
      </div>

      <!-- Acciones Derecha -->
      <div class="flex items-center gap-4">
        <!-- Indicador de Alertas / Campana -->
        <div class="relative">
          <button (click)="toast.info('Alertas Operativas', 'Hay 2 lotes urgentes por caducidad que requieren tu revisión.')"
                  class="w-9 h-9 rounded-xl border border-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" 
                  title="Notificaciones SACPA">
            <lucide-icon name="bell" class="w-4 h-4"></lucide-icon>
          </button>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div class="h-6 w-px bg-gray-200"></div>

        <!-- Perfil rápido (Clic para abrir modal de foto) -->
        <div (click)="openProfileModal()" 
             class="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-green-50/50 transition-all cursor-pointer group"
             title="Haz clic para editar tu foto de perfil">
          <app-avatar [name]="authService.currentUser()?.correo || 'Admin'" [imageUrl]="savedPhoto()" size="sm"></app-avatar>
          <div class="hidden md:block text-left">
            <div class="text-xs font-bold text-gray-800 leading-none group-hover:text-[#0B4628] transition-colors flex items-center gap-1">
              <span>{{ authService.currentUser()?.correo || 'admin@agrosense.ec' }}</span>
              <lucide-icon name="camera" class="w-3 h-3 text-gray-400 group-hover:text-[#0B4628]"></lucide-icon>
            </div>
            <div class="text-[10px] text-[#0B4628] font-semibold uppercase mt-0.5">{{ authService.currentRole() || 'Administrador' }}</div>
          </div>
        </div>
      </div>
    </header>

    <!-- MODAL DE PERFIL Y FOTO -->
    @if (isProfileModalOpen()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50/60 to-white">
            <div class="flex items-center gap-2.5">
              <lucide-icon name="user" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
              <h3 class="font-bold text-base text-gray-900">Configuración de Perfil y Foto</h3>
            </div>
            <button (click)="isProfileModalOpen.set(false)" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <div class="p-6 space-y-6 text-center">
            <!-- Vista previa del Avatar -->
            <div class="flex flex-col items-center justify-center gap-2">
              <div class="w-24 h-24 rounded-full border-4 border-green-100 shadow-md overflow-hidden relative group">
                @if (fotoUrl) {
                  <img [src]="fotoUrl" alt="Preview" class="w-full h-full object-cover rounded-full">
                } @else {
                  <div class="w-full h-full bg-[#0B4628] text-white flex items-center justify-center text-3xl font-bold">
                    {{ (authService.currentUser()?.correo || 'A')[0].toUpperCase() }}
                  </div>
                }
              </div>
              <span class="text-xs font-bold text-gray-700 mt-1">{{ authService.currentUser()?.correo }}</span>
              <span class="bg-green-100 text-[#0B4628] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{{ authService.currentRole() || 'ADMINISTRADOR' }}</span>
            </div>

            <!-- Carga de Archivo o URL -->
            <div class="space-y-3 text-left">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Subir imagen desde tu equipo</label>
                <label class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-[#0B4628] rounded-xl text-xs font-semibold text-gray-600 hover:text-[#0B4628] bg-gray-50/50 hover:bg-green-50/20 transition-all cursor-pointer">
                  <lucide-icon name="upload" class="w-4 h-4"></lucide-icon>
                  <span>Hacer clic para seleccionar archivo de foto</span>
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
                </label>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">O pegar URL de imagen</label>
                <input type="text" [(ngModel)]="fotoUrl" placeholder="https://ejemplo.com/mifoto.jpg"
                       class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
              </div>

              @if (fotoUrl) {
                <div class="text-right">
                  <button (click)="fotoUrl = ''" class="text-xs text-red-600 hover:underline font-semibold cursor-pointer">
                    Remover foto (usar iniciales)
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            <button (click)="isProfileModalOpen.set(false)" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
              Cancelar
            </button>
            <button (click)="saveFoto()" class="px-5 py-2 bg-[#0B4628] hover:bg-[#146C43] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
              <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
              <span>Guardar Foto en BD</span>
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
