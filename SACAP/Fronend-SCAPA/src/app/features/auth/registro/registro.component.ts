import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SolicitudRegistroService } from '../../../core/services/solicitud-registro.service';
import { SolicitudRegistroDTO } from '../../../core/models/solicitud-registro.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#0B4628] via-[#093820] to-[#051f12] flex items-center justify-center p-4">
      <div class="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 sm:p-10 animate-fade-in">
        
        <!-- Logo y Encabezado -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B4628]/10 text-[#0B4628] mb-3 shadow-inner">
            <lucide-icon name="sprout" class="w-8 h-8"></lucide-icon>
          </div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Solicitar Cuenta Institucional</h1>
          <p class="text-sm text-gray-600 mt-1">Sistema Agroindustrial de Control y Producción Agrícola (SACPA)</p>
        </div>

        @if (solicitudEnviada()) {
          <!-- Estado: Enviado -->
          <div class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-4">
            <div class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <lucide-icon name="check" class="w-6 h-6"></lucide-icon>
            </div>
            <h3 class="text-lg font-bold text-gray-900">¡Solicitud Registrada con Éxito!</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Hemos recibido su información. Un Administrador verificará su registro de empleado y le notificará a su correo electrónico 
              <span class="font-bold text-gray-800">{{ correo }}</span> con su contraseña temporal de acceso.
            </p>
            <div class="pt-2">
              <a routerLink="/login" 
                 class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl transition-all shadow-md">
                <lucide-icon name="arrow-left" class="w-4 h-4"></lucide-icon>
                <span>Volver al Inicio de Sesión</span>
              </a>
            </div>
          </div>
        } @else {
          <!-- Formulario -->
          <form (ngSubmit)="enviarSolicitud()" #registroForm="ngForm" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombres *</label>
                <input type="text" [(ngModel)]="nombres" name="nombres" required placeholder="Ej: Carlos Eduardo"
                       class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Apellidos *</label>
                <input type="text" [(ngModel)]="apellidos" name="apellidos" required placeholder="Ej: Mendoza Ríos"
                       class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cédula / Identificación *</label>
                <input type="text" [(ngModel)]="cedula" name="cedula" required placeholder="1712345678"
                       class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Teléfono</label>
                <input type="text" [(ngModel)]="telefono" name="telefono" placeholder="0991234567"
                       class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Correo Institucional *</label>
              <input type="email" [(ngModel)]="correo" name="correo" required placeholder="c.mendoza@agrosense.ec"
                     class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Departamento / Área</label>
                <input type="text" [(ngModel)]="departamento" name="departamento" placeholder="Ej: Almacén y Bodega"
                       class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cargo Solicitado</label>
                <input type="text" [(ngModel)]="cargo" name="cargo" placeholder="Ej: Bodeguero / Técnico"
                       class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
            </div>

            @if (errorMessage()) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {{ errorMessage() }}
              </div>
            }

            <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a routerLink="/login" class="text-xs font-bold text-[#0B4628] hover:underline flex items-center gap-1">
                <lucide-icon name="arrow-left" class="w-3.5 h-3.5"></lucide-icon>
                <span>Volver al Login</span>
              </a>

              <button type="submit" [disabled]="isSubmitting()"
                      class="w-full sm:w-auto px-6 py-3 bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                @if (isSubmitting()) {
                  <lucide-icon name="loader" class="w-4 h-4 animate-spin"></lucide-icon>
                  <span>Enviando...</span>
                } @else {
                  <lucide-icon name="send" class="w-4 h-4"></lucide-icon>
                  <span>Enviar Solicitud de Registro</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class RegistroComponent {
  private solicitudService = inject(SolicitudRegistroService);

  nombres = '';
  apellidos = '';
  cedula = '';
  correo = '';
  telefono = '';
  departamento = '';
  cargo = '';

  isSubmitting = signal<boolean>(false);
  solicitudEnviada = signal<boolean>(false);
  errorMessage = signal<string>('');

  enviarSolicitud(): void {
    if (!this.nombres.trim() || !this.apellidos.trim() || !this.cedula.trim() || !this.correo.trim()) {
      this.errorMessage.set('Por favor completa todos los campos requeridos (*).');
      return;
    }
    if (this.cedula.trim().length < 10) {
      this.errorMessage.set('La cédula o identificación debe tener al menos 10 dígitos.');
      return;
    }
    if (!this.correo.includes('@') || !this.correo.includes('.')) {
      this.errorMessage.set('Por favor ingresa un correo electrónico institucional válido.');
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const payload: SolicitudRegistroDTO = {
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      cedula: this.cedula.trim(),
      correo: this.correo.trim(),
      telefono: this.telefono.trim(),
      departamento: this.departamento.trim() || 'Producción y Operaciones',
      cargo: this.cargo.trim() || 'Técnico / Bodeguero'
    };

    this.solicitudService.solicitar(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.solicitudEnviada.set(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || err.error?.error || 'No se pudo enviar la solicitud de registro al servidor.';
        this.errorMessage.set(msg);
      }
    });
  }
}
