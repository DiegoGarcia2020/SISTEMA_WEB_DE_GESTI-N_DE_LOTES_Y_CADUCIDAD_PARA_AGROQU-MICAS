import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsuarioDTO } from '../../../core/models/usuario.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 my-8">
          
          <!-- Cabecera del Modal -->
          <div class="bg-[#0B4628] px-8 py-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <lucide-icon [name]="userToEdit ? 'edit-3' : 'user-plus'" class="w-6 h-6 text-green-300"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold">{{ userToEdit ? 'Editar Usuario' : 'Nuevo Registro de Usuario' }}</h3>
                <p class="text-xs text-green-200/80">Creación rápida de cuenta y datos laborales (Paso 1 de 2)</p>
              </div>
            </div>
            <button (click)="closeModal()" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <!-- Banner Informativo -->
          <div class="bg-green-50/70 border-b border-green-200 px-8 py-3.5 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 flex-shrink-0">
              <lucide-icon name="info" class="w-4 h-4"></lucide-icon>
            </div>
            <p class="text-xs text-green-900 leading-relaxed font-medium">
              Al guardar, se enviará una contraseña temporal al correo del usuario y quedará configurado <strong>sin rol asignado</strong>. Podrás asignarle roles desde la lista en el paso siguiente.
            </p>
          </div>

          <!-- Cuerpo del Formulario -->
          <form id="user-form" [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-8 space-y-5">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nombres *</label>
                <input type="text" formControlName="nombres" placeholder="ej. Carlos Eduardo"
                       class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
                @if (userForm.get('nombres')?.touched && userForm.get('nombres')?.invalid) {
                  <p class="text-[11px] text-red-500 mt-1">Nombres son obligatorios</p>
                }
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Apellidos *</label>
                <input type="text" formControlName="apellidos" placeholder="ej. Mendoza Ríos"
                       class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
                @if (userForm.get('apellidos')?.touched && userForm.get('apellidos')?.invalid) {
                  <p class="text-[11px] text-red-500 mt-1">Apellidos son obligatorios</p>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Cédula / RUC *</label>
                <input type="text" formControlName="cedula" placeholder="1712345678"
                       class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:border-[#0B4628] outline-none transition-all">
                @if (userForm.get('cedula')?.touched && userForm.get('cedula')?.invalid) {
                  <p class="text-[11px] text-red-500 mt-1">La cédula es obligatoria</p>
                }
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Teléfono Celular</label>
                <input type="text" formControlName="telefono" placeholder="0991234567"
                       class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Correo Electrónico *</label>
              <input type="email" formControlName="correo" placeholder="correo@agrosense.ec"
                     class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none transition-all">
              @if (userForm.get('correo')?.touched && userForm.get('correo')?.invalid) {
                <p class="text-[11px] text-red-500 mt-1">Ingrese un correo válido</p>
              }
            </div>

            <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div class="flex items-center gap-2 text-[#0B4628] font-bold text-xs uppercase tracking-wider">
                <lucide-icon name="briefcase" class="w-4 h-4 text-green-700"></lucide-icon>
                <span>Cargo / Ocupación en la Empresa *</span>
              </div>
              <label class="block text-xs text-gray-600">Seleccione el puesto o función laboral dentro de SACPA</label>
              <select formControlName="ocupacion"
                      class="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:border-[#0B4628] focus:ring-2 focus:ring-[#0B4628]/20 outline-none transition-all font-semibold text-gray-800 cursor-pointer">
                <option value="" disabled selected>-- Seleccione un Cargo --</option>
                <option value="Bodeguero">Bodeguero (Almacén / Inventario)</option>
                <option value="Administrador">Administrador (Gestión y Cuentas)</option>
                <option value="Supervisor">Supervisor (Control y Operaciones)</option>
                <option value="Técnico de Campo">Técnico de Campo (Aplicación Agrícola)</option>
                <option value="Proveedor">Proveedor (Socio Externo / Lotes)</option>
              </select>
              @if (userForm.get('ocupacion')?.touched && userForm.get('ocupacion')?.invalid) {
                <p class="text-[11px] text-red-500 mt-1">Por favor seleccione un cargo de la lista</p>
              }
            </div>

            <!-- Footer y Botones de Navegación -->
            <div class="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-gray-200">
              <button type="button" (click)="closeModal()"
                      class="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors cursor-pointer">
                Cancelar
              </button>

              <button type="submit" [disabled]="userForm.invalid"
                      class="px-6 py-2.5 rounded-xl bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2">
                <lucide-icon name="check-circle" class="w-4 h-4"></lucide-icon>
                <span>{{ userToEdit ? 'Guardar Cambios' : 'Crear Cuenta sin Rol' }}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    }
  `
})
export class UserFormModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  @Input() isOpen = false;
  @Input() userToEdit: UsuarioDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  userForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    cedula: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    ocupacion: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.userToEdit) {
      this.userForm.patchValue({
        nombres: (this.userToEdit as any).nombres || '',
        apellidos: (this.userToEdit as any).apellidos || '',
        cedula: (this.userToEdit as any).cedula || '',
        correo: this.userToEdit.correo || '',
        telefono: (this.userToEdit as any).telefono || '',
        ocupacion: (this.userToEdit as any).ocupacion || ''
      });
    } else {
      this.userForm.reset({ ocupacion: '' });
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.userForm.value);
  }
}
