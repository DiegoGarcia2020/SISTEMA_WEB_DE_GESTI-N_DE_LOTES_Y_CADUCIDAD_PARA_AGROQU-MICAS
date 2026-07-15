import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsuarioDTO, CreateUsuarioDTO } from '../../../core/models/usuario.model';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { RolService } from '../../../core/services/rol.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 my-8">
          
          <!-- Cabecera del Modal -->
          <div class="bg-[#0B4628] px-8 py-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <lucide-icon [name]="userToEdit ? 'edit-3' : 'user-plus'" class="w-6 h-6 text-green-300"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold">{{ userToEdit ? 'Editar Usuario Agrícola' : 'Nuevo Registro de Usuario' }}</h3>
                <p class="text-xs text-green-200/80">Wizard de configuración de cuentas y roles SACPA</p>
              </div>
            </div>
            <button (click)="closeModal()" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <!-- Stepper de 3 Pasos -->
          <div class="bg-gray-50 border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2 cursor-pointer" (click)="step.set(1)">
              <div [class]="step() === 1 ? 'bg-[#0B4628] text-white' : step() > 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'" 
                   class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all">
                @if (step() > 1) { <lucide-icon name="check" class="w-4 h-4"></lucide-icon> } @else { 1 }
              </div>
              <span [class]="step() === 1 ? 'font-bold text-gray-900' : 'text-gray-500'" class="text-xs">1. Cuenta</span>
            </div>

            <div class="h-0.5 w-12 bg-gray-300"></div>

            <div class="flex items-center gap-2 cursor-pointer" (click)="step() > 1 ? step.set(2) : null">
              <div [class]="step() === 2 ? 'bg-[#0B4628] text-white' : step() > 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'" 
                   class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all">
                @if (step() > 2) { <lucide-icon name="check" class="w-4 h-4"></lucide-icon> } @else { 2 }
              </div>
              <span [class]="step() === 2 ? 'font-bold text-gray-900' : 'text-gray-500'" class="text-xs">2. Roles</span>
            </div>

            <div class="h-0.5 w-12 bg-gray-300"></div>

            <div class="flex items-center gap-2 cursor-pointer" (click)="step() > 2 ? step.set(3) : null">
              <div [class]="step() === 3 ? 'bg-[#0B4628] text-white' : 'bg-gray-200 text-gray-600'" 
                   class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all">3</div>
              <span [class]="step() === 3 ? 'font-bold text-gray-900' : 'text-gray-500'" class="text-xs">3. Perfil Agrícola</span>
            </div>
          </div>

          <!-- Cuerpo del Formulario -->
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-8">
            
            @if (step() === 1) {
              <!-- Paso 1: Datos de Cuenta -->
              <div class="space-y-4 animate-slide-up">
                <h4 class="font-bold text-gray-800 text-sm border-b pb-2">Información Básica de Cuenta</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                    <input type="text" formControlName="nombre" placeholder="ej. Carlos Mendoza Ríos"
                           class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Cédula / RUC</label>
                    <input type="text" formControlName="cedula" placeholder="1712345678"
                           class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none font-mono">
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Correo Electrónico *</label>
                    <input type="email" formControlName="correo" placeholder="correo@agrosense.ec"
                           class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none">
                    @if (userForm.get('correo')?.touched && userForm.get('correo')?.invalid) {
                      <p class="text-[11px] text-red-500 mt-1">Correo electrónico es obligatorio</p>
                    }
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Estado Inicial</label>
                    <select formControlName="idEstado"
                            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] outline-none">
                      <option [ngValue]="1">Activo (Acceso habilitado)</option>
                      <option [ngValue]="2">Inactivo (Suspendido temporalmente)</option>
                      <option [ngValue]="3">Bloqueado (Por seguridad o baja)</option>
                    </select>
                  </div>
                </div>

                @if (!userToEdit) {
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Contraseña Provisional *</label>
                    <input type="text" formControlName="contrasena" placeholder="Agro2026!."
                           class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:border-[#0B4628] outline-none">
                    <p class="text-[11px] text-gray-400 mt-1">El usuario deberá cambiar su contraseña en el primer inicio de sesión.</p>
                  </div>
                }
              </div>
            } @else if (step() === 2) {
              <!-- Paso 2: Selección de Roles -->
              <div class="space-y-4 animate-slide-up">
                <div class="flex items-center justify-between border-b pb-2">
                  <h4 class="font-bold text-gray-800 text-sm">Asignación de Roles de Seguridad (Multi-perfil)</h4>
                  <span class="text-xs text-green-700 font-semibold bg-green-100 px-2.5 py-0.5 rounded-full">{{ selectedRoles().length }} seleccionados</span>
                </div>
                <p class="text-xs text-gray-500">Seleccione uno o más roles de trabajo. Si selecciona varios, el usuario podrá alternar perfiles al iniciar sesión.</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  @for (r of allRoles(); track r.id) {
                    <div (click)="toggleRole(r.id)"
                         [class]="isRoleSelected(r.id) ? 'border-[#0B4628] bg-green-50/70 shadow-xs' : 'border-gray-200 bg-white hover:bg-gray-50'"
                         class="p-3.5 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 select-none">
                      <div [class]="isRoleSelected(r.id) ? 'bg-[#0B4628] text-white' : 'bg-gray-100 text-gray-400'"
                           class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        @if (isRoleSelected(r.id)) { <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon> }
                      </div>
                      <div>
                        <p [class]="isRoleSelected(r.id) ? 'text-[#0B4628] font-bold' : 'text-gray-800 font-semibold'" class="text-sm">{{ r.name }}</p>
                        <p class="text-[11px] text-gray-500 mt-0.5 leading-tight">{{ r.desc }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else if (step() === 3) {
              <!-- Paso 3: Perfil y Ocupación según Cargo Seleccionado -->
              <div class="space-y-4 animate-slide-up" [formGroup]="userForm">
                <h4 class="font-bold text-gray-800 text-sm border-b pb-2">Ocupación y Parámetros Específicos según Cargo</h4>
                
                <!-- Campo de Ocupación / Puesto (Dependiente del Cargo) -->
                <div class="p-4 rounded-2xl bg-green-50/70 border border-green-200 space-y-2">
                  <div class="flex items-center gap-2 text-[#0B4628] font-bold text-xs uppercase tracking-wider">
                    <lucide-icon name="briefcase" class="w-4 h-4 text-green-700"></lucide-icon>
                    <span>Ocupación / Cargo Específico</span>
                  </div>
                  <label class="block text-xs font-semibold text-gray-700">Puesto o función en SACPA para los roles seleccionados</label>
                  <input type="text" formControlName="ocupacion" placeholder="ej. Bodeguero General, Técnico de Riego, Administrador Agrícola..."
                         class="w-full px-3.5 py-2 bg-white border border-green-300 rounded-xl text-sm focus:border-green-600 outline-none">
                </div>

                @if (esRolCampo()) {
                  <!-- Técnico de Campo -->
                  <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                    <div class="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <lucide-icon name="activity" class="w-4 h-4 text-amber-700"></lucide-icon>
                      <span>Perfil de Técnico de Campo / Agrícola</span>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Licencia de Manejo Fitosanitario / Agrícola</label>
                      <input type="text" formControlName="licencia" placeholder="ej. LIC-2026-0098"
                             class="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-mono focus:border-amber-600 outline-none">
                    </div>
                  </div>
                }

                @if (esRolBodega()) {
                  <!-- Bodeguero -->
                  <div class="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
                    <div class="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
                      <lucide-icon name="package" class="w-4 h-4 text-purple-700"></lucide-icon>
                      <span>Perfil de Bodeguero / Almacén</span>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Turno Asignado de Bodega</label>
                      <select formControlName="turno"
                              class="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-sm focus:border-purple-600 outline-none">
                        <option value="">Seleccione un turno...</option>
                        <option value="Turno Mañana (06:00–14:00)">Turno Mañana (06:00–14:00)</option>
                        <option value="Turno Tarde (14:00–22:00)">Turno Tarde (14:00–22:00)</option>
                        <option value="Turno Noche (22:00–06:00)">Turno Noche (22:00–06:00)</option>
                      </select>
                    </div>
                  </div>
                }

                @if (esRolLogistica()) {
                  <!-- Proveedor -->
                  <div class="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
                    <div class="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                      <lucide-icon name="truck" class="w-4 h-4 text-slate-700"></lucide-icon>
                      <span>Perfil de Proveedor / Logística</span>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Ciudad / Centro de Operación</label>
                      <input type="text" formControlName="ciudad" placeholder="ej. Quito, Ambato, Guayaquil"
                             class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:border-slate-600 outline-none">
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Footer y Botones de Navegación del Wizard -->
            <div class="flex items-center justify-between mt-8 pt-5 border-t border-gray-200">
              @if (step() > 1) {
                <button type="button" (click)="step.set(step() - 1)"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2">
                  <lucide-icon name="arrow-left" class="w-4 h-4"></lucide-icon>
                  <span>Anterior</span>
                </button>
              } @else {
                <div></div>
              }

              <div class="flex items-center gap-3">
                <button type="button" (click)="closeModal()"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors cursor-pointer">
                  Cancelar
                </button>

                @if (step() < 3) {
                  <button type="button" (click)="nextStep()"
                          class="px-6 py-2.5 rounded-xl bg-[#0B4628] hover:bg-[#146C43] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2">
                    <span>Siguiente</span>
                    <lucide-icon name="arrow-right" class="w-4 h-4"></lucide-icon>
                  </button>
                } @else {
                  <button type="submit" [disabled]="userForm.invalid || selectedRoles().length === 0"
                          class="px-6 py-2.5 rounded-xl bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2">
                    <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                    <span>{{ userToEdit ? 'Guardar Cambios' : 'Registrar Usuario' }}</span>
                  </button>
                }
              </div>
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
  private rolService = inject(RolService);

  @Input() isOpen = false;
  @Input() userToEdit: UsuarioDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  step = signal<number>(1);
  selectedRoles = signal<number[]>([1]);

  allRoles = signal<Array<{ id: number; name: string; desc: string }>>([
    { id: 1, name: 'Administrador General', desc: 'Perfil con acceso total a gerencia, operaciones, inventario y seguridad en SACPA.' },
    { id: 2, name: 'Gerente de Operaciones', desc: 'Gestión y supervisión de reportes, alertas IA y logística de almacenes.' },
    { id: 3, name: 'Supervisor de Inventario', desc: 'Administración de lotes, bodegas, estanterías y fechas de caducidad.' },
    { id: 4, name: 'Auditor Externo', desc: 'Acceso de solo lectura al historial de auditoría y reportes gerenciales.' },
    { id: 5, name: 'Asistente de Logística', desc: 'Registro y recepción de inventario agrícola en almacenes.' }
  ]);

  userForm: FormGroup = this.fb.group({
    nombre: [''],
    cedula: [''],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['Agro2026!.'],
    idEstado: [1, [Validators.required]],
    ocupacion: [''],
    licencia: [''],
    turno: [''],
    ciudad: ['']
  });

  ngOnInit(): void {
    this.cargarRolesCreados();

    if (this.userToEdit) {
      this.userForm.patchValue({
        nombre: this.userToEdit.nombre || '',
        cedula: this.userToEdit.cedula || '',
        correo: this.userToEdit.correo || '',
        idEstado: this.userToEdit.idEstado || 1,
        ocupacion: (this.userToEdit as any).ocupacion || '',
        licencia: this.userToEdit.licencia || '',
        turno: this.userToEdit.turno || '',
        ciudad: this.userToEdit.ciudad || ''
      });
      if (this.userToEdit.idRoles && this.userToEdit.idRoles.length > 0) {
        this.selectedRoles.set(this.userToEdit.idRoles);
      } else {
        this.selectedRoles.set([1]);
      }
    } else {
      this.selectedRoles.set([1]);
    }
  }

  cargarRolesCreados(): void {
    this.rolService.listar().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const mapeados = data.map(r => ({
            id: r.idRol || 1,
            name: r.nombre,
            desc: r.descripcion || 'Rol del sistema SACPA'
          }));
          this.allRoles.set(mapeados);
        }
      },
      error: () => {}
    });
  }

  toggleRole(roleId: number): void {
    this.selectedRoles.update(list => {
      if (list.includes(roleId)) {
        if (list.length === 1) {
          this.toast.warning('Atención', 'Debe mantener al menos un rol seleccionado.');
          return list;
        }
        return list.filter(id => id !== roleId);
      } else {
        return [...list, roleId];
      }
    });
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoles().includes(roleId);
  }

  hasRoleSelected(roleId: number): boolean {
    return this.selectedRoles().includes(roleId);
  }

  esRolCampo(): boolean {
    const roles = this.allRoles().filter(r => this.selectedRoles().includes(r.id));
    return roles.some(r => /campo|técnico|tecnico|agrícola|agricola/i.test(r.name)) || this.selectedRoles().includes(4);
  }

  esRolBodega(): boolean {
    const roles = this.allRoles().filter(r => this.selectedRoles().includes(r.id));
    return roles.some(r => /bodeguero|inventario|almacén|almacen|bodega|supervisor/i.test(r.name)) || this.selectedRoles().includes(3) || this.selectedRoles().includes(5);
  }

  esRolLogistica(): boolean {
    const roles = this.allRoles().filter(r => this.selectedRoles().includes(r.id));
    return roles.some(r => /proveedor|logística|logistica|transporte/i.test(r.name));
  }

  nextStep(): void {
    if (this.step() === 1) {
      if (this.userForm.get('correo')?.invalid) {
        this.userForm.get('correo')?.markAsTouched();
        this.toast.error('Campo requerido', 'Por favor ingrese un correo válido.');
        return;
      }
    }
    this.step.set(this.step() + 1);
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const val = this.userForm.value;
    const payload = {
      ...val,
      idRoles: this.selectedRoles()
    };
    this.save.emit(payload);
  }
}
