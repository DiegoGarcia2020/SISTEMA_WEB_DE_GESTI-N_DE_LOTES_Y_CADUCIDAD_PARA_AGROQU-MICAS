import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface SubVentas {
  ruta: string;
  etiqueta: string;
  disponible: boolean;
}

@Component({
  selector: 'app-ventas-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <lucide-icon name="bar-chart-3" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
        <h3 class="text-base font-bold text-gray-900">Análisis de Ventas</h3>
      </div>

      <nav class="flex flex-wrap gap-2">
        @for (s of subSecciones; track s.ruta) {
          @if (s.disponible) {
            <a [routerLink]="s.ruta" routerLinkActive="!bg-[#0B4628] !text-white !shadow-md"
               class="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 bg-white hover:border-[#0B4628]/40 transition-all cursor-pointer">
              {{ s.etiqueta }}
            </a>
          } @else {
            <span class="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                  title="Se integrará en las próximas preguntas">
              {{ s.etiqueta }} · pronto
            </span>
          }
        }
      </nav>

      <router-outlet></router-outlet>
    </div>
  `
})
export class VentasSectionComponent {
  subSecciones: SubVentas[] = [
    { ruta: 'mas-vendidos', etiqueta: 'Productos más vendidos', disponible: true },
    { ruta: 'mayor-ingreso', etiqueta: 'Mayor ingreso bruto', disponible: true },
    { ruta: 'dias-compra', etiqueta: 'Días de mayor compra', disponible: true }
  ];
}
