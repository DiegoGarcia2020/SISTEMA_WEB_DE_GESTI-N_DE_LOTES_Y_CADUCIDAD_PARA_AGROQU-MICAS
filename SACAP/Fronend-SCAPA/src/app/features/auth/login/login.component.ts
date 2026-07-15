import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService as TS } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#0B4628]/95 via-[#0B4628]/85 to-slate-900 flex items-center justify-center p-4 selection:bg-green-500 selection:text-white relative overflow-hidden">
      <!-- Efecto decorativo de fondo -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 z-10 animate-fade-in">
        <!-- Cabecera Verde Agrícola -->
        <div class="bg-[#0B4628] p-8 text-center text-white relative">
          <div class="w-16 h-16 bg-white/15 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner">
            <lucide-icon name="leaf" class="w-9 h-9 text-green-300"></lucide-icon>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">AgroSense LMS</h1>
          <p class="text-xs text-green-200/80 mt-1 uppercase tracking-widest font-medium">Sistema de Alertas y Caducidad Agrícola</p>
        </div>

        <div class="p-8">
          @if (step() === 'LOGIN') {
            <!-- Paso 1: Credenciales -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <lucide-icon name="mail" class="w-5 h-5"></lucide-icon>
                  </div>
                  <input type="email" formControlName="correo" placeholder="ej. c.mendoza@agrosense.ec"
                         class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] focus:ring-2 focus:ring-[#0B4628]/20 outline-none transition-all">
                </div>
                @if (loginForm.get('correo')?.touched && loginForm.get('correo')?.invalid) {
                  <p class="text-xs text-red-500 mt-1.5 font-medium">Ingrese un correo electrónico válido</p>
                }
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Contraseña</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <lucide-icon name="lock" class="w-5 h-5"></lucide-icon>
                  </div>
                  <input [type]="showPassword() ? 'text' : 'password'" formControlName="contrasena" placeholder="••••••••••••"
                         class="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#0B4628] focus:ring-2 focus:ring-[#0B4628]/20 outline-none transition-all font-mono">
                  <button type="button" (click)="showPassword.set(!showPassword())" 
                          class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" class="w-5 h-5"></lucide-icon>
                  </button>
                </div>
                @if (loginForm.get('contrasena')?.touched && loginForm.get('contrasena')?.invalid) {
                  <p class="text-xs text-red-500 mt-1.5 font-medium">La contraseña es requerida</p>
                }
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" class="w-4 h-4 rounded text-[#0B4628] focus:ring-[#0B4628]/20 border-gray-300">
                  <span>Recordar credenciales</span>
                </label>
                <a href="javascript:void(0)" (click)="forgotPass()" class="font-semibold text-[#0B4628] hover:underline">¿Olvidaste tu contraseña?</a>
              </div>

              <button type="submit" [disabled]="loginForm.invalid || isLoading()"
                      class="w-full py-3.5 px-4 bg-[#0B4628] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4">
                @if (isLoading()) {
                  <lucide-icon name="loader" class="w-5 h-5 animate-spin"></lucide-icon>
                  <span>Validando acceso...</span>
                } @else {
                  <span>Iniciar Sesión</span>
                  <lucide-icon name="arrow-right" class="w-5 h-5"></lucide-icon>
                }
              </button>
            </form>
          } @else {
            <!-- Paso 2: Selección de Rol (Multidirol) -->
            <div class="space-y-4 animate-slide-up">
              <div class="text-center mb-6">
                <span class="inline-block px-3 py-1 bg-green-50 text-[#0B4628] text-xs font-bold rounded-full uppercase tracking-wider mb-2">Multidirol Detectado</span>
                <h3 class="text-lg font-bold text-gray-900">Seleccione su Perfil de Trabajo</h3>
                <p class="text-xs text-gray-500 mt-1">Tiene varios roles asignados en el sistema SACPA para esta sesión.</p>
              </div>

              <div class="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1">
                @for (rol of availableRoles(); track rol) {
                  <button type="button" (click)="onSelectRole(rol)" [disabled]="isLoading()"
                          class="w-full p-4 text-left border-2 border-gray-100 hover:border-[#0B4628] rounded-2xl bg-gray-50/50 hover:bg-green-50/50 transition-all flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-sm">
                    <div class="flex items-center gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-white text-[#0B4628] shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                        <lucide-icon [name]="getRoleIcon(rol)" class="w-5 h-5"></lucide-icon>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900 group-hover:text-[#0B4628] transition-colors">{{ rol }}</div>
                        <div class="text-[11px] text-gray-500">Acceso a módulo y permisos de {{ rol }}</div>
                      </div>
                    </div>
                    <lucide-icon name="chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-[#0B4628] group-hover:translate-x-1 transition-all"></lucide-icon>
                  </button>
                }
              </div>

              <button type="button" (click)="step.set('LOGIN')"
                      class="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mt-2 text-center block">
                ← Volver con otra cuenta
              </button>
            </div>
          }
        </div>

        <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 flex flex-col items-center justify-center gap-1.5">
          <a routerLink="/registro" class="text-xs font-bold text-[#0B4628] hover:underline flex items-center gap-1">
            <lucide-icon name="user-plus" class="w-3.5 h-3.5"></lucide-icon>
            <span>¿No tiene cuenta institucional? Solicite acceso al sistema</span>
          </a>
          <p class="text-[11px] text-gray-400 font-medium">SACPA · Universidad Técnica de Quevedo & AgroSense © 2026</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(TS);

  step = signal<'LOGIN' | 'ROLE_SELECT'>('LOGIN');
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  availableRoles = signal<string[]>([]);

  loginForm = this.fb.group({
    correo: ['c.mendoza@agrosense.ec', [Validators.required, Validators.email]],
    contrasena: ['admin123', [Validators.required]]
  });

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { correo, contrasena } = this.loginForm.value;

    this.authService.login({ correo: correo!, contrasena: contrasena! }).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.tipoFase === 'PRE_AUTH' && res.rolesDisponibles && res.rolesDisponibles.length > 1) {
          this.availableRoles.set(res.rolesDisponibles);
          this.step.set('ROLE_SELECT');
          this.toast.info('Autenticación preliminar exitosa', 'Por favor seleccione con qué rol desea trabajar.');
        } else if (res.tipoFase === 'FINAL' || (res.rolesDisponibles && res.rolesDisponibles.length === 1)) {
          this.toast.success('¡Bienvenido al sistema!', `Inició sesión correctamente como ${res.usuario?.correo}`);
        } else {
          this.toast.error('Sin roles asignados', 'El usuario se autenticó pero no tiene ningún rol registrado en la base de datos (tabla usuario_rol).');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error('Error de autenticación', err.error?.message || 'Credenciales incorrectas o servidor no disponible.');
      }
    });
  }

  onSelectRole(rol: string): void {
    this.isLoading.set(true);
    this.authService.selectRole(rol).subscribe({
      next: res => {
        this.isLoading.set(false);
        this.toast.success('Perfil seleccionado', `Ingresando al área de trabajo de ${rol}`);
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error('Error', 'No se pudo activar la sesión con el rol seleccionado.');
      }
    });
  }

  getRoleIcon(rol: string): string {
    const r = rol.toLowerCase();
    if (r.includes('admin')) return 'shield-check';
    if (r.includes('supervis')) return 'check-circle';
    if (r.includes('bodeg')) return 'package';
    if (r.includes('tecnic') || r.includes('técnic')) return 'activity';
    if (r.includes('proveed')) return 'truck';
    return 'user';
  }

  forgotPass(): void {
    this.toast.info('Restablecer contraseña', 'Por favor comuníquese con el administrador TIC de su cooperativa o ingrese a soporte@agrosense.ec.');
  }
}
