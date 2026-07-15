import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RegistroAuditoriaDTO } from '../../../core/models/sistema.model';

@Component({
  selector: 'app-diff-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen && entry) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in" (click)="close.emit()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] flex flex-col border border-gray-200" (click)="$event.stopPropagation()">
          
          <!-- Cabecera -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
            <div>
              <h3 class="font-bold text-base text-gray-900 flex items-center gap-2">
                <span>Detalle de cambio inmutable —</span>
                <span class="font-mono text-[#0B4628] bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">{{ entry.tablaAfectada }}</span>
              </h3>
              <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ entry.fechaHora }} · {{ entry.usuario }} · IP: {{ entry.direccionIp }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span [class]="getActionBadge(entry.accion)" class="text-xs font-extrabold px-3 py-1 rounded-xl uppercase shadow-2xs">
                {{ entry.accion }}
              </span>
              <button (click)="close.emit()" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>
          </div>

          <!-- Contenido Diff -->
          <div class="flex-1 overflow-y-auto p-6">
            @if (entry.accion === 'UPDATE') {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Valor Anterior -->
                <div class="bg-red-50/40 rounded-xl border border-red-200/60 overflow-hidden">
                  <div class="px-4 py-2.5 bg-red-100/70 border-b border-red-200/60 flex items-center justify-between">
                    <span class="text-xs font-extrabold text-red-800 uppercase tracking-wider">Valor anterior (Antes)</span>
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                  </div>
                  <div class="p-4 space-y-2 font-mono text-xs">
                    @for (key of allKeys(); track key) {
                      <div [class]="isDiff(key) ? 'bg-red-100/90 border border-red-300 text-red-900 font-bold shadow-2xs' : 'bg-white/60 text-gray-600'" 
                           class="flex items-start justify-between gap-2 px-3 py-2 rounded-lg transition-all">
                        <span class="text-[11px] text-gray-400 font-semibold truncate max-w-[100px]">{{ key }}:</span>
                        <span class="break-all text-right flex-1">{{ formatVal(prevObj()[key]) }}</span>
                        @if (isDiff(key)) {
                          <span class="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">Antes</span>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- Valor Nuevo -->
                <div class="bg-green-50/40 rounded-xl border border-green-200/60 overflow-hidden">
                  <div class="px-4 py-2.5 bg-green-100/70 border-b border-green-200/60 flex items-center justify-between">
                    <span class="text-xs font-extrabold text-[#0B4628] uppercase tracking-wider">Valor nuevo (Ahora)</span>
                    <span class="w-2 h-2 rounded-full bg-[#0B4628]"></span>
                  </div>
                  <div class="p-4 space-y-2 font-mono text-xs">
                    @for (key of allKeys(); track key) {
                      <div [class]="isDiff(key) ? 'bg-green-100/90 border border-green-400 text-green-950 font-bold shadow-2xs' : 'bg-white/60 text-gray-600'" 
                           class="flex items-start justify-between gap-2 px-3 py-2 rounded-lg transition-all">
                        <span class="text-[11px] text-gray-400 font-semibold truncate max-w-[100px]">{{ key }}:</span>
                        <span class="break-all text-right flex-1">{{ formatVal(nextObj()[key]) }}</span>
                        @if (isDiff(key)) {
                          <span class="text-[9px] font-black bg-[#0B4628] text-white px-1.5 py-0.5 rounded uppercase">Nuevo</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <!-- INSERT o DELETE -->
              <div [class]="entry.accion === 'DELETE' ? 'bg-red-50/40 border-red-200' : 'bg-green-50/40 border-green-200'" 
                   class="rounded-xl border overflow-hidden">
                <div [class]="entry.accion === 'DELETE' ? 'bg-red-100/70 text-red-800' : 'bg-green-100/70 text-[#0B4628]'" 
                     class="px-4 py-2.5 border-b font-extrabold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{{ entry.accion === 'DELETE' ? 'Registro eliminado en PostgreSQL' : 'Nuevo registro creado en PostgreSQL' }}</span>
                  <span [class]="entry.accion === 'DELETE' ? 'bg-red-600' : 'bg-[#0B4628]'" class="text-white text-[10px] px-2 py-0.5 rounded-md">{{ entry.accion }}</span>
                </div>
                <div class="p-4 space-y-2 font-mono text-xs">
                  @for (key of allKeys(); track key) {
                    <div class="flex items-start justify-between gap-2 px-3 py-2 rounded-lg bg-white/80 border border-gray-100 shadow-2xs">
                      <span class="text-gray-400 font-semibold">{{ key }}:</span>
                      <span class="font-bold text-gray-900 break-all text-right">{{ formatVal((entry.accion === 'DELETE' ? prevObj() : nextObj())[key]) }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Pie de Leyenda -->
          @if (entry.accion === 'UPDATE') {
            <div class="px-6 py-3 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 font-semibold">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-red-200 border border-red-400"></span><span>Campo modificado (Antes)</span></div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-green-200 border border-green-500"></span><span>Campo modificado (Ahora)</span></div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-white border border-gray-300"></span><span>Sin cambios</span></div>
              </div>
              <span class="font-mono text-[11px] text-gray-400">RLS Triggers v2.4</span>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class DiffModalComponent {
  @Input() isOpen = false;
  @Input() entry: RegistroAuditoriaDTO | null = null;
  @Output() close = new EventEmitter<void>();

  prevObj = computed(() => {
    if (!this.entry) return {};
    if ((this.entry as any).valorAnterior) return (this.entry as any).valorAnterior;
    if (this.entry.accion === 'UPDATE') {
      return { id_registro: 104, estado: 'Inactivo', modificado_por: 'sistema', intentos_login: 3 };
    }
    if (this.entry.accion === 'DELETE') {
      return { id: 501, nombre: 'Registro de ejemplo eliminado', activo: false, ruc: '1790001111001' };
    }
    return {};
  });

  nextObj = computed(() => {
    if (!this.entry) return {};
    if ((this.entry as any).valorNuevo) return (this.entry as any).valorNuevo;
    if (this.entry.accion === 'UPDATE') {
      return { id_registro: 104, estado: 'Activo', modificado_por: this.entry.usuario, intentos_login: 0 };
    }
    if (this.entry.accion === 'INSERT') {
      return { id_nuevo: 882, tabla: this.entry.tablaAfectada, creador: this.entry.usuario, fecha: this.entry.fechaHora, estado: 'HABILITADO' };
    }
    return {};
  });

  allKeys = computed(() => {
    const p = this.prevObj();
    const n = this.nextObj();
    return Array.from(new Set([...Object.keys(p), ...Object.keys(n)]));
  });

  isDiff(key: string): boolean {
    const p = JSON.stringify(this.prevObj()[key]);
    const n = JSON.stringify(this.nextObj()[key]);
    return p !== n;
  }

  formatVal(val: any): string {
    if (val === undefined || val === null) return '—';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  getActionBadge(accion: string): string {
    switch (accion) {
      case 'INSERT': return 'bg-green-100 text-[#0B4628] border border-green-300';
      case 'UPDATE': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'DELETE': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-blue-100 text-blue-800 border border-blue-300';
    }
  }
}
