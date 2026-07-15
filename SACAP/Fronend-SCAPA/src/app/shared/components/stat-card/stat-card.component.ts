import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-xl p-5 border border-black/8 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      <div class="flex items-center justify-between gap-4 mb-3">
        <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider select-none">{{ title }}</span>
        <div [class]="colorClass" class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
          <lucide-icon [name]="iconName || 'activity'" class="w-4 h-4"></lucide-icon>
        </div>
      </div>
      <div>
        <div class="text-2xl font-bold text-gray-900 font-mono tracking-tight">{{ value }}</div>
        @if (subtitle) {
          <div class="text-xs text-gray-500 mt-1 flex items-center gap-1">{{ subtitle }}</div>
        }
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() iconName = 'activity';
  @Input() colorClass = 'bg-[#0B4628]/10 text-[#0B4628]';
}
