import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 overflow-hidden border border-gray-100 transform transition-all">
          <div class="flex items-start gap-4">
            <div [class]="isDanger ? 'bg-red-100 text-red-600' : 'bg-[#0B4628]/10 text-[#0B4628]'" 
                 class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <lucide-icon [name]="isDanger ? 'alert-triangle' : 'help-circle'" class="w-6 h-6"></lucide-icon>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
              <p class="text-sm text-gray-600 mt-1 leading-relaxed">{{ message }}</p>
            </div>
          </div>
          
          @if (requireReason) {
            <div class="mt-4 pt-3 border-t border-gray-100">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                ⚠️ Motivo obligatorio para continuar
              </label>
              <textarea rows="3" [(ngModel)]="motivo"
                        placeholder="Ej: Acceso no autorizado, solicitud de RRHH, reestructuración..."
                        class="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4628]/20 focus:border-[#0B4628] resize-none font-medium text-gray-800 transition-all"></textarea>
              @if (!motivo.trim()) {
                <span class="text-[11px] text-red-500 font-semibold mt-1 block">* Debes especificar un motivo para habilitar la confirmación</span>
              }
            </div>
          }

          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button (click)="onCancel()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              Cancelar
            </button>
            <button (click)="onConfirm()" 
                    [disabled]="requireReason && !motivo.trim()"
                    [class]="requireReason && !motivo.trim() ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' : isDanger ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer' : 'bg-[#0B4628] hover:bg-[#146C43] text-white cursor-pointer'"
                    class="px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = '';
  @Input() confirmText = 'Confirmar';
  @Input() isDanger = false;
  @Input() requireReason = false;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  motivo = '';

  onConfirm(): void {
    if (this.requireReason && !this.motivo.trim()) return;
    this.confirm.emit(this.motivo);
    this.motivo = '';
  }

  onCancel(): void {
    this.motivo = '';
    this.cancel.emit();
  }
}
