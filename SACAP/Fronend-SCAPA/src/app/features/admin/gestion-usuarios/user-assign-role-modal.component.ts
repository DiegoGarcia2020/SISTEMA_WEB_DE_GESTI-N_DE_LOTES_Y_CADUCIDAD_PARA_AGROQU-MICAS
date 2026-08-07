import { Component, EventEmitter, Input, Output, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { RolService } from '../../../core/services/rol.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-user-assign-role-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (isOpen && usuario) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-8">
          
          <!-- Cabecera -->
          <div class="bg-[#0B4628] px-8 py-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <lucide-icon name="shield-check" class="w-6 h-6 text-green-300"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold">Asignar Rol y Formalizar</h3>
                <p class="text-xs text-green-200/80">Paso 2: Permisos de Seguridad SACPA</p>
              </div>
            </div>
            <button (click)="closeModal()" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <!-- Tarjeta de Usuario Seleccionado -->
          <div class="bg-gray-50 border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario Seleccionado</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ usuario.nombres || '' }} {{ usuario.apellidos || '' }} ({{ usuario.correo }})</p>
              <p class="text-xs text-green-800 font-semibold mt-0.5">Cargo: {{ usuario.ocupacion || 'No especificado' }}</p>
            </div>
          </div>

          <!-- Formulario Dinámico -->
          <div class="p-8 space-y-6">
            
            <!-- Select de Rol desde la BD -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rol de Seguridad del Sistema *</label>
              <select [(ngModel)]="selectedRolId" (change)="onRolChange()"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:bg-white focus:border-[#0B4628] outline-none transition-all cursor-pointer">
                <option [ngValue]="null" disabled>Seleccione un rol desde la base de datos...</option>
                @for (rol of allRoles(); track rol.idRol) {
                  <option [ngValue]="rol.idRol">{{ rol.nombre }} @if (rol.descripcion) { - {{ rol.descripcion }} }</option>
                }
              </select>
            </div>

            <!-- Validación del PDF (Técnico de Campo) -->
            @if (requiereDocumento()) {
              <div class="p-5 rounded-2xl border-2 transition-all animate-slide-up"
                   [class]="usuario.tieneDocumentoPdf ? 'bg-green-50/80 border-green-300' : 'bg-amber-50/90 border-amber-300'">
                
                <div class="flex items-start gap-3">
                  <div [class]="usuario.tieneDocumentoPdf ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'"
                       class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <lucide-icon [name]="usuario.tieneDocumentoPdf ? 'check' : 'file-text'" class="w-4 h-4"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <h4 [class]="usuario.tieneDocumentoPdf ? 'text-green-950 font-bold text-sm' : 'text-amber-950 font-bold text-sm'">
                      {{ usuario.tieneDocumentoPdf ? '✓ Licencia de Campo Verificada' : 'Documento PDF Obligatorio' }}
                    </h4>
                    
                    @if (usuario.tieneDocumentoPdf) {
                      <p class="text-xs text-green-800 mt-1 leading-relaxed">
                        El usuario ya cuenta con un documento o licencia agrícola registrado previamente en la base de datos. Puede proceder a guardar.
                      </p>
                    } @else {
                      <p class="text-xs text-amber-900 mt-1 leading-relaxed">
                        Este rol de Técnico de Campo requiere adjuntar la licencia o contrato en formato PDF para formalizar la asignación en el sistema.
                      </p>
                      
                      <div class="mt-4">
                        <input type="file" accept=".pdf" (change)="onFileSelected($event)" #fileInput
                               class="hidden">
                        
                        <div (click)="fileInput.click()"
                             class="border-2 border-dashed border-amber-400 hover:border-amber-600 bg-white/80 hover:bg-white p-4 rounded-xl cursor-pointer text-center transition-all">
                          @if (selectedFile()) {
                            <div class="flex items-center justify-center gap-2 text-green-700 font-bold text-xs">
                              <lucide-icon name="file-check" class="w-4 h-4"></lucide-icon>
                              <span>{{ selectedFile()?.name }}</span>
                            </div>
                            <p class="text-[10px] text-gray-500 mt-1">Clic para cambiar archivo</p>
                          } @else {
                            <div class="flex flex-col items-center justify-center text-amber-900">
                              <lucide-icon name="upload-cloud" class="w-6 h-6 mb-1 text-amber-600"></lucide-icon>
                              <span class="text-xs font-bold">Haga clic aquí para subir el PDF de Licencia</span>
                              <span class="text-[10px] text-gray-500 mt-0.5">Formato aceptado: .PDF (Máx 10 MB)</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>

              </div>
            }

            <!-- Botones -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeModal()"
                      class="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors cursor-pointer">
                Cancelar
              </button>

              <button type="button" (click)="onSubmit()" [disabled]="!canSubmit()"
                      class="px-6 py-2.5 rounded-xl bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2">
                <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                <span>Asignar Rol y Habilitar</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    }
  `
})
export class UserAssignRoleModalComponent implements OnInit, OnChanges {
  private rolService = inject(RolService);
  private toast = inject(ToastService);

  @Input() isOpen = false;
  @Input() usuario: any | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FormData>();

  allRoles = signal<any[]>([]);
  selectedRolId: number | null = null;
  selectedFile = signal<File | null>(null);
  requiereDocumento = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.selectedRolId = null;
      this.selectedFile.set(null);
      this.requiereDocumento.set(false);
      this.cargarRoles();
    }
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data) => {
        if (data) {
          this.allRoles.set(data);
        }
      },
      error: () => {}
    });
  }

  onRolChange(): void {
    if (!this.selectedRolId) {
      this.requiereDocumento.set(false);
      return;
    }
    const rol = this.allRoles().find(r => r.idRol === this.selectedRolId);
    if (rol && rol.nombre) {
      const nombreMin = rol.nombre.toLowerCase();
      const esCampo = nombreMin.includes('campo') || nombreMin.includes('técnico') || nombreMin.includes('tecnico') || nombreMin.includes('agrícola') || nombreMin.includes('agricola');
      this.requiereDocumento.set(esCampo);
    } else {
      this.requiereDocumento.set(false);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        this.toast.error('Formato inválido', 'Por favor seleccione únicamente archivos PDF.');
        return;
      }
      this.selectedFile.set(file);
    }
  }

  canSubmit(): boolean {
    if (!this.selectedRolId) return false;
    if (this.requiereDocumento() && !this.usuario?.tieneDocumentoPdf && !this.selectedFile()) {
      return false;
    }
    return true;
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.canSubmit() || !this.selectedRolId || !this.usuario) return;

    const formData = new FormData();
    formData.append('idRol', this.selectedRolId.toString());
    if (this.selectedFile()) {
      formData.append('documento', this.selectedFile()!);
    }

    this.save.emit(formData);
  }
}
