import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface SubCliente {
  ruta: string;
  etiqueta: string;
  disponible: boolean;
}

@Component({
  selector: 'app-clientes-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <lucide-icon name="users" class="w-5 h-5 text-[#0B4628]"></lucide-icon>
        <h3 class="text-base font-bold text-gray-900">Análisis de Clientes</h3>
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
export class ClientesSectionComponent {
  subSecciones: SubCliente[] = [
    { ruta: 'frecuentes', etiqueta: 'Clientes frecuentes', disponible: true },
    { ruta: 'churn', etiqueta: 'Churn de clientes', disponible: true },
    { ruta: 'geografia', etiqueta: 'Por geografía', disponible: false }
  ];
}
