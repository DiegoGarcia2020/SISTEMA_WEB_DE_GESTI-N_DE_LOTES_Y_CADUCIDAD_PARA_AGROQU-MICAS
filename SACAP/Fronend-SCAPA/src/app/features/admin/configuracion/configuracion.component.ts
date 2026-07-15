import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SistemaService } from '../../../core/services/sistema.service';
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
          <button (click)="saveConfig()" class="px-5 py-2.5 bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
            <span>Guardar Parámetros</span>
          </button>
        </div>
      </app-section-header>

      <!-- Contenedor de Configuración -->
      <div class="space-y-6 max-w-4xl">
        
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
  `
})
export class ConfiguracionComponent implements OnInit {
  private sisService = inject(SistemaService);
  private toast = inject(ToastService);

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
}
