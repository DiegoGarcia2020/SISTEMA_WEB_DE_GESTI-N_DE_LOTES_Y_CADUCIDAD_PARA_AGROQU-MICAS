import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200/80 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ title }}</h1>
        @if (subtitle) {
          <p class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
        }
      </div>
      <div class="flex items-center gap-3">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
