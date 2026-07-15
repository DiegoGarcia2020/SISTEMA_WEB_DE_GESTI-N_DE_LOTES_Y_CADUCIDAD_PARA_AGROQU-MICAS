import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { OperacionesService } from '../../../core/services/operaciones.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, StatCardComponent, SectionHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera -->
      <app-section-header title="Dashboard Ejecutivo de Control" subtitle="Vista global en tiempo real del sistema agroindustrial SACPA y estado operativo.">
        <div class="flex items-center gap-2 bg-[#0B4628]/10 text-[#0B4628] px-3.5 py-2 rounded-xl font-bold text-xs border border-[#0B4628]/20">
          <lucide-icon name="calendar" class="w-4 h-4"></lucide-icon>
          <span>Temporada Activa: Maíz Cosecha 2026</span>
        </div>
      </app-section-header>

      <!-- 4 KPIs Globales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card title="Total Usuarios" [value]="totalUsuarios().toString()" subtitle="Registrados en SACPA" iconName="users" colorClass="bg-[#0B4628]/10 text-[#0B4628]"></app-stat-card>
        <app-stat-card title="Temporadas Activas" [value]="temporadasActivas().toString() || '1'" subtitle="Campañas agrícolas en curso" iconName="sprout" colorClass="bg-green-600/10 text-green-700"></app-stat-card>
        <app-stat-card title="Alertas Caducidad" [value]="alertasActivas().toString()" subtitle="Por revisar en inventario" iconName="alert-triangle" colorClass="bg-amber-600/10 text-amber-600"></app-stat-card>
        <app-stat-card title="Combos & Promociones" value="3" subtitle="Descuentos de IA activos" iconName="gift" colorClass="bg-purple-600/10 text-purple-600"></app-stat-card>
      </div>

      <!-- Grid Principal del Dashboard -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Panel 1: Accesos Rápidos por Módulo (Ocupa 2 columnas) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-6">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <lucide-icon name="grid" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
            <span>Accesos Rápidos al Sistema de Administración</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <!-- Gestión de Usuarios -->
            <a routerLink="/admin/usuarios" class="p-4 rounded-xl border border-gray-100 hover:border-[#0B4628]/40 bg-gray-50/50 hover:bg-green-50/30 transition-all group flex flex-col justify-between h-32">
              <div class="w-10 h-10 rounded-lg bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon name="users" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 group-hover:text-[#0B4628]">Usuarios & Roles</h4>
                <p class="text-xs text-gray-500 mt-0.5">Control de cuentas y accesos</p>
              </div>
            </a>

            <!-- Temporadas Agrícolas -->
            <a routerLink="/admin/temporadas" class="p-4 rounded-xl border border-gray-100 hover:border-[#0B4628]/40 bg-gray-50/50 hover:bg-green-50/30 transition-all group flex flex-col justify-between h-32">
              <div class="w-10 h-10 rounded-lg bg-green-600/10 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon name="calendar" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 group-hover:text-[#0B4628]">Temporadas</h4>
                <p class="text-xs text-gray-500 mt-0.5">Apertura, cierres y cultivos</p>
              </div>
            </a>

            <!-- Alertas de Caducidad -->
            <a routerLink="/admin/alertas" class="p-4 rounded-xl border border-gray-100 hover:border-[#0B4628]/40 bg-gray-50/50 hover:bg-green-50/30 transition-all group flex flex-col justify-between h-32">
              <div class="w-10 h-10 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon name="alert-triangle" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 group-hover:text-[#0B4628]">Alertas Caducidad</h4>
                <p class="text-xs text-gray-500 mt-0.5">Lotes cercanos a vencer</p>
              </div>
            </a>

            <!-- Sugerencias y Combos IA -->
            <a routerLink="/admin/ia/promociones" class="p-4 rounded-xl border border-gray-100 hover:border-[#0B4628]/40 bg-gray-50/50 hover:bg-green-50/30 transition-all group flex flex-col justify-between h-32">
              <div class="w-10 h-10 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon name="gift" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 group-hover:text-[#0B4628]">Combos & IA</h4>
                <p class="text-xs text-gray-500 mt-0.5">Promociones automáticas</p>
              </div>
            </a>

            <!-- Privilegios & Seguridad -->
            <a routerLink="/admin/privilegios" class="p-4 rounded-xl border border-gray-100 hover:border-[#0B4628]/40 bg-gray-50/50 hover:bg-green-50/30 transition-all group flex flex-col justify-between h-32">
              <div class="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon name="shield" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 group-hover:text-[#0B4628]">Privilegios BD</h4>
                <p class="text-xs text-gray-500 mt-0.5">Permisos y matrices</p>
              </div>
            </a>

            <!-- Catálogos Generales -->
            <a routerLink="/admin/catalogos" class="p-4 rounded-xl border border-gray-100 hover:border-[#0B4628]/40 bg-gray-50/50 hover:bg-green-50/30 transition-all group flex flex-col justify-between h-32">
              <div class="w-10 h-10 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon name="layers" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 group-hover:text-[#0B4628]">Catálogos SACPA</h4>
                <p class="text-xs text-gray-500 mt-0.5">Estados, tipos y niveles</p>
              </div>
            </a>
          </div>

          <!-- Sub-sección: Avance de la Temporada Activa -->
          <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
            <div class="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Progreso de Temporada Agrícola (Cosecha Maíz 2026)</span>
              <span class="text-[#0B4628]">37% transcurrido</span>
            </div>
            <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-[#0B4628] rounded-full transition-all duration-1000" style="width: 37%"></div>
            </div>
            <div class="flex justify-between text-[11px] text-gray-500">
              <span>Inicio: 15 de Mayo, 2026</span>
              <span>Cierre proyectado: 15 de Septiembre, 2026</span>
            </div>
          </div>
        </div>

        <!-- Panel 2: Actividad Reciente & Distribución de Roles (Ocupa 1 columna) -->
        <div class="space-y-6">
          
          <!-- Gráfico CSS: Distribución de Usuarios por Rol -->
          <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <lucide-icon name="pie-chart" class="w-4 h-4 text-[#0B4628]"></lucide-icon>
              <span>Distribución por Rol</span>
            </h3>

            <div class="space-y-3 pt-2">
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-700">Técnicos de Campo</span>
                  <span class="text-gray-900 font-bold">12 usuarios (38%)</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-[#0B4628]" style="width: 38%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-700">Proveedores</span>
                  <span class="text-gray-900 font-bold">8 usuarios (26%)</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500" style="width: 26%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-700">Bodegueros</span>
                  <span class="text-gray-900 font-bold">6 usuarios (19%)</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: 19%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-700">Supervisores & Admins</span>
                  <span class="text-gray-900 font-bold">5 usuarios (17%)</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-purple-500" style="width: 17%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alertas del Sistema -->
          <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <lucide-icon name="bell" class="w-4 h-4 text-amber-600"></lucide-icon>
              <span>Alertas Operativas</span>
            </h3>

            <div class="space-y-3">
              <div class="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <lucide-icon name="alert-circle" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                <div class="text-xs">
                  <p class="font-bold text-amber-900">Lote #LT-2026-089 próximo a vencer</p>
                  <p class="text-amber-700 mt-0.5">Vence en 12 días. La IA sugiere aplicar combo del 15% descuento.</p>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <lucide-icon name="info" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"></lucide-icon>
                <div class="text-xs">
                  <p class="font-bold text-blue-900">Sesión iniciada desde nueva IP</p>
                  <p class="text-blue-700 mt-0.5">Técnico Jhon Vera conectó desde IP 186.42.15.98.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private operacionesService = inject(OperacionesService);

  totalUsuarios = signal<number>(0);
  temporadasActivas = signal<number>(0);
  alertasActivas = signal<number>(0);

  ngOnInit(): void {
    this.usuarioService.listar().subscribe((u: any[]) => {
      this.totalUsuarios.set(u.length);
    });
    this.operacionesService.listarTemporadas().subscribe((t: any[]) => {
      this.temporadasActivas.set(t.filter((x: any) => x.estado === 'ACTIVA').length);
    });
    this.operacionesService.listarAlertas().subscribe((a: any[]) => {
      this.alertasActivas.set(a.filter((x: any) => x.estado === 'ACTIVA').length);
    });
  }
}
