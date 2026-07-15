import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      @for (t of toastService.toasts(); track t.id) {
        <div class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border bg-white transition-all duration-300 animate-slide-up"
             [ngClass]="{
               'border-green-200 text-green-950 bg-green-50/90': t.type === 'success',
               'border-red-200 text-red-950 bg-red-50/90': t.type === 'error',
               'border-blue-200 text-blue-950 bg-blue-50/90': t.type === 'info',
               'border-amber-200 text-amber-950 bg-amber-50/90': t.type === 'warning'
             }">
          <div class="mt-0.5 flex-shrink-0">
            @if (t.type === 'success') {
              <lucide-icon name="check-circle" class="w-5 h-5 text-green-600"></lucide-icon>
            } @else if (t.type === 'error') {
              <lucide-icon name="alert-triangle" class="w-5 h-5 text-red-600"></lucide-icon>
            } @else if (t.type === 'warning') {
              <lucide-icon name="alert-circle" class="w-5 h-5 text-amber-600"></lucide-icon>
            } @else {
              <lucide-icon name="info" class="w-5 h-5 text-blue-600"></lucide-icon>
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">{{ t.title }}</p>
            @if (t.message) {
              <p class="text-xs mt-0.5 opacity-90 leading-relaxed">{{ t.message }}</p>
            }
          </div>
          <button (click)="toastService.remove(t.id)" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
