import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface SeccionIA {
  ruta: string;
  etiqueta: string;
  icono: string;
  exact: boolean;
}

@Component({
  selector: 'app-ia-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cabecera del módulo -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
                <lucide-icon name="brain-circuit" class="w-5 h-5"></lucide-icon>
              </span>
              Dashboard IA
            </h2>
            <p class="text-sm text-gray-500 mt-1">Análisis inteligente de las operaciones de SACPA</p>
          </div>
        </div>
      </div>

      <!-- Tabs de secciones del módulo -->
      <nav class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-1.5 flex flex-wrap gap-1">
        @for (s of secciones; track s.ruta) {
          <a [routerLink]="s.ruta"
             routerLinkActive="!bg-[#0B4628] !text-white !shadow-md"
             [routerLinkActiveOptions]="s.exact ? { exact: true } : { exact: false }"
             class="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-[#0B4628]/5 hover:text-[#0B4628] transition-all cursor-pointer flex items-center gap-2">
            <lucide-icon [name]="s.icono" class="w-4 h-4"></lucide-icon>
            <span>{{ s.etiqueta }}</span>
          </a>
        }
      </nav>

      <router-outlet></router-outlet>
    </div>
  `
})
export class IADashboardComponent {
  secciones: SeccionIA[] = [
    { ruta: '/admin/ia/resumen', etiqueta: 'Resumen', icono: 'layout-dashboard', exact: true },
    { ruta: '/admin/ia/ventas', etiqueta: 'Ventas', icono: 'bar-chart-3', exact: false },
    { ruta: '/admin/ia/inventario', etiqueta: 'Inventario', icono: 'package', exact: true },
    { ruta: '/admin/ia/alertas', etiqueta: 'Alertas', icono: 'alert-triangle', exact: true },
    { ruta: '/admin/ia/temporadas', etiqueta: 'Temporadas', icono: 'calendar', exact: true },
    { ruta: '/admin/ia/clientes', etiqueta: 'Clientes', icono: 'users', exact: true },
    { ruta: '/admin/ia/ia', etiqueta: 'Análisis IA', icono: 'brain', exact: true }
  ];
}
