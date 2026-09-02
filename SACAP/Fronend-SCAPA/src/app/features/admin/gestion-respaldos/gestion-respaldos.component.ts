import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { RespaldoService } from '../../../core/services/respaldo.service';

@Component({
  selector: 'app-gestion-respaldos',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Gestión de Respaldos de Base de Datos" 
                          subtitle="Generación de backups completos e incrementales de la base de datos PostgreSQL de SACPA.">
      </app-section-header>

      <!-- Contenedor de Configuración -->
      <div class="space-y-6 max-w-4xl">
        
        <!-- Tarjeta Respaldo Full -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-[#0B4628] text-white flex items-center justify-center shadow-md shrink-0">
                <lucide-icon name="database" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-base text-gray-900">Respaldo Completo (Full Backup)</h3>
                <p class="text-xs text-gray-600 mt-0.5">Exportación total de la base de datos en formato binario/custom, incluyendo esquema y todos los datos (pg_dump -F c).</p>
              </div>
            </div>
            <button (click)="generarRespaldo('FULL')" [disabled]="isFullLoading()" 
                    class="px-5 py-2.5 bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer">
              @if (isFullLoading()) {
                <lucide-icon name="loader" class="w-4 h-4 animate-spin"></lucide-icon>
                <span>Generando...</span>
              } @else {
                <lucide-icon name="download-cloud" class="w-4 h-4"></lucide-icon>
                <span>Generar Respaldo Completo</span>
              }
            </button>
          </div>
        </div>

        <!-- Tarjeta Respaldo Incremental -->
        <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
                <lucide-icon name="server" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-base text-gray-900">Respaldo Incremental</h3>
                <p class="text-xs text-gray-600 mt-0.5">Exportación lógica y estructurada para salvar los cambios más recientes o data-only (simulando incremental).</p>
              </div>
            </div>
            <button (click)="generarRespaldo('INCREMENTAL')" [disabled]="isIncLoading()" 
                    class="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer">
              @if (isIncLoading()) {
                <lucide-icon name="loader" class="w-4 h-4 animate-spin"></lucide-icon>
                <span>Generando...</span>
              } @else {
                <lucide-icon name="layers" class="w-4 h-4"></lucide-icon>
                <span>Generar Respaldo Incremental</span>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class GestionRespaldosComponent {
  private respaldoService = inject(RespaldoService);
  private toast = inject(ToastService);

  isFullLoading = signal<boolean>(false);
  isIncLoading = signal<boolean>(false);

  generarRespaldo(tipo: 'FULL' | 'INCREMENTAL') {
    if (tipo === 'FULL') this.isFullLoading.set(true);
    else this.isIncLoading.set(true);

    this.respaldoService.generarRespaldo(tipo).subscribe({
      next: (res) => {
        if (tipo === 'FULL') this.isFullLoading.set(false);
        else this.isIncLoading.set(false);
        
        this.toast.success(`Respaldo ${tipo} Exitoso`, `El respaldo se guardó en: ${res.rutaArchivo}`);
      },
      error: (err) => {
        if (tipo === 'FULL') this.isFullLoading.set(false);
        else this.isIncLoading.set(false);
        
        const msg = err.error?.mensaje || err.message || 'Error desconocido al generar el respaldo.';
        this.toast.error(`Error en Respaldo ${tipo}`, msg);
      }
    });
  }
}
