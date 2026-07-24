import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SistemaService } from '../../../core/services/sistema.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfiguracionGlobalDTO } from '../../../core/models/sistema.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Configuración Global del Sistema AgroSense SACPA" 
                          subtitle="Parámetros corporativos, identificación de bodega central y canales de notificación del sistema.">
        <div class="flex items-center gap-2">
          <button (click)="isPasswordModalOpen.set(true)" class="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer">
            <lucide-icon name="key" class="w-4 h-4 text-[#0B4628]"></lucide-icon>
            <span>Cambiar Contraseña</span>
          </button>
          <button (click)="saveConfig()" class="px-5 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
            <span>Guardar Parámetros</span>
          </button>
        </div>
      </app-section-header>

      <!-- Contenedor de Configuración -->
      <div class="space-y-6 max-w-4xl">
        
        <!-- Tarjeta Rápida de Seguridad / Contraseña -->
        <div class="bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-transparent rounded-2xl border border-emerald-200/80 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-[#0B4628] text-white flex items-center justify-center shadow-md shrink-0">
              <lucide-icon name="shield" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-base text-gray-900">Seguridad de Cuenta & Credenciales</h3>
              <p class="text-xs text-gray-600 mt-0.5">Puedes actualizar la contraseña de tu cuenta actual ({{ authService.currentUser()?.correo || 'usuario' }}) en cualquier momento por motivos de seguridad.</p>
            </div>
          </div>
          <button (click)="isPasswordModalOpen.set(true)" class="px-4 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer">
            <lucide-icon name="key" class="w-4 h-4"></lucide-icon>
            <span>Cambiar Mi Contraseña</span>
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
            <lucide-icon name="file-text" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
            <h3 class="font-bold text-base text-gray-900">Identificación Corporativa y Bodega Central</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Empresa o Fundo</label>
              <input type="text" [(ngModel)]="config.nombreEmpresa" 
                     class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">RUC Tributario</label>
              <input type="text" [(ngModel)]="config.ruc" font-mono
                     class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico del Servidor / Soporte</label>
              <input type="email" [(ngModel)]="config.correoContacto" 
                     class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Teléfono de Emergencias / Agroindustria</label>
              <input type="text" [(ngModel)]="config.telefonoSoporte" 
                     class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Bodega / Almacén Principal por Defecto</label>
              <input type="text" [(ngModel)]="config.bodegaPrincipal" 
                     class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-semibold focus:border-[#0B4628] outline-none">
              <p class="text-[11px] text-gray-500 mt-1">Los nuevos ingresos de inventario se asignarán a este almacén si no se especifica uno secundario.</p>
            </div>
          </div>
        </div>

        <!-- Canales de Notificación y Alerta -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
            <lucide-icon name="bell" class="w-5 h-5 text-amber-600"></lucide-icon>
            <h3 class="font-bold text-base text-gray-900">Canales Automáticos de Alerta AgroSense</h3>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-amber-50/40 rounded-xl border border-amber-200/60">
              <div>
                <span class="text-sm font-bold text-gray-900 block">Notificaciones por Correo Electrónico (SMTP)</span>
                <span class="text-xs text-gray-600">Enviar correos de alerta con credenciales y contraseñas temporales a usuarios registrados, así como alertas de caducidad.</span>
              </div>
              <input type="checkbox" [(ngModel)]="config.notificarPorCorreo" class="w-5 h-5 text-[#0B4628] rounded cursor-pointer">
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL PARA CAMBIO DE CONTRASEÑA -->
    @if (isPasswordModalOpen()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
          <div class="bg-[#0B4628] p-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <lucide-icon name="key" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-lg">Cambiar Contraseña</h3>
                <p class="text-xs text-green-200">Actualiza tus credenciales de acceso</p>
              </div>
            </div>
            <button (click)="closePasswordModal()" class="text-white/70 hover:text-white font-bold text-xl leading-none">×</button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña Actual *</label>
              <input type="password" [(ngModel)]="passData.contrasenaActual" placeholder="Ingresa tu contraseña actual..."
                     class="w-full p-3 border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nueva Contraseña *</label>
              <input type="password" [(ngModel)]="passData.nuevaContrasena" placeholder="Mínimo 6 caracteres..."
                     class="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Confirmar Nueva Contraseña *</label>
              <input type="password" [(ngModel)]="passData.confirmarContrasena" placeholder="Repite tu nueva contraseña..."
                     class="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0B4628] outline-none">
            </div>

            @if (passData.nuevaContrasena && passData.confirmarContrasena && passData.nuevaContrasena !== passData.confirmarContrasena) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <lucide-icon name="alert-circle" class="w-4 h-4 shrink-0 text-red-600"></lucide-icon>
                <span>Las contraseñas nuevas no coinciden</span>
              </div>
            }

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" (click)="closePasswordModal()" class="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">
                Cancelar
              </button>
              <button type="button" (click)="onSubmitPasswordChange()" 
                      [disabled]="!passData.contrasenaActual || !passData.nuevaContrasena || passData.nuevaContrasena !== passData.confirmarContrasena || isChangingPass()"
                      class="px-6 py-2.5 bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer flex items-center gap-2">
                @if (isChangingPass()) {
                  <lucide-icon name="loader" class="w-4 h-4 animate-spin"></lucide-icon>
                  <span>Actualizando...</span>
                } @else {
                  <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                  <span>Confirmar Cambio</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfiguracionComponent implements OnInit {
  authService = inject(AuthService);
  private sisService = inject(SistemaService);
  private toast = inject(ToastService);

  isPasswordModalOpen = signal<boolean>(false);
  isChangingPass = signal<boolean>(false);

  passData = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };

  config: ConfiguracionGlobalDTO = {
    nombreEmpresa: 'AgroSense S.A. / SACPA Agrícola',
    ruc: '1792145870001',
    correoContacto: 'soporte@agrosense.ec',
    telefonoSoporte: '+593 99 888 7766',
    bodegaPrincipal: 'Bodega Central Quevedo - Km 4.5 Vía El Empalme',
    notificarPorCorreo: true,
    notificarPorSms: true,
    modoMantenimiento: false,
    intervaloSincronizacionMinutos: 15,
    versionSistema: 'v2.4.0-PROD (Enterprise LMS)'
  };

  ngOnInit(): void {
    this.sisService.obtenerConfiguracion().subscribe(c => this.config = { ...c });
  }

  saveConfig(): void {
    this.sisService.actualizarConfiguracion(this.config).subscribe({
      next: () => {
        this.toast.success('Configuración Guardada', 'Los parámetros corporativos y canales de alerta han sido actualizados.');
      }
    });
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
    this.passData = { contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' };
  }

  onSubmitPasswordChange(): void {
    if (!this.passData.contrasenaActual || !this.passData.nuevaContrasena) {
      this.toast.warning('Campos requeridos', 'Por favor ingresa tu contraseña actual y la nueva.');
      return;
    }
    if (this.passData.nuevaContrasena !== this.passData.confirmarContrasena) {
      this.toast.error('Las contraseñas no coinciden', 'La confirmación de contraseña debe ser igual a la nueva contraseña.');
      return;
    }
    if (this.passData.nuevaContrasena.length < 6) {
      this.toast.warning('Contraseña muy corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isChangingPass.set(true);
    this.authService.cambiarContrasena(this.passData.nuevaContrasena, this.passData.contrasenaActual).subscribe({
      next: () => {
        this.isChangingPass.set(false);
        this.toast.success('¡Contraseña Actualizada!', 'Tu contraseña ha sido cambiada y guardada de forma segura.');
        this.closePasswordModal();
      },
      error: (err) => {
        this.isChangingPass.set(false);
        this.toast.error('Error al cambiar contraseña', err.error?.message || err.message || 'Contraseña actual incorrecta o error en el servidor.');
      }
    });
  }
}
