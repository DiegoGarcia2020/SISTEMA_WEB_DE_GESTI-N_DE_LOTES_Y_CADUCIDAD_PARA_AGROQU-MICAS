import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-section-placeholder',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-16 flex flex-col items-center justify-center text-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-[#0B4628]/10 text-[#0B4628] flex items-center justify-center">
        <lucide-icon [name]="(route.snapshot.data['icono'] || 'sparkles')" class="w-7 h-7"></lucide-icon>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-900">{{ route.snapshot.data['titulo'] || 'Sección' }}</h3>
        <p class="text-sm text-gray-500 mt-1">Esta sección se integrará con las próximas preguntas del Dashboard IA.</p>
      </div>
    </div>
  `
})
export class SectionPlaceholderComponent {
  route = inject(ActivatedRoute);
}
