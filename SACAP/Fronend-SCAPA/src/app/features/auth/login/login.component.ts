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
  styleUrl: './login.component.css',
  template: `
    <div class="auth-wrapper animate-fade-in">
      <div class="auth-card">
        
        <div class="auth-header">
          <h1 class="auth-header__title">AgroSense</h1>
          <p class="auth-header__subtitle">Sistema de Alertas y Caducidad</p>
        </div>

        @if (step() === 'LOGIN') {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <label class="form-group__label">Usuario o Correo</label>
              <input type="text" formControlName="correo" class="form-group__input">
              @if (loginForm.get('correo')?.touched && loginForm.get('correo')?.invalid) {
                <span class="form-group__error">El usuario o correo es requerido</span>
              }
            </div>

            <div class="form-group">
              <label class="form-group__label">Contraseña</label>
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="contrasena" class="form-group__input">
              <button type="button" (click)="showPassword.set(!showPassword())" class="btn-reveal" title="Mostrar/Ocultar">
                <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" class="w-5 h-5"></lucide-icon>
              </button>
              @if (loginForm.get('contrasena')?.touched && loginForm.get('contrasena')?.invalid) {
                <span class="form-group__error">La contraseña es requerida</span>
              }
            </div>

            <div class="auth-options">
              <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; color:#374151;">
                <input type="checkbox" style="accent-color:#15803d"> Recordar sesión
              </label>
              <a href="javascript:void(0)" (click)="forgotPass()" class="auth-link">¿Olvidó su clave?</a>
            </div>

            <button type="submit" [disabled]="loginForm.invalid || isLoading()" class="auth-btn">
              @if (isLoading()) {
                <lucide-icon name="loader" class="w-5 h-5 animate-spin"></lucide-icon>
                <span>Validando...</span>
              } @else {
                <span>Ingresar</span>
              }
            </button>
          </form>
        } @else if (step() === 'ROLE_SELECT') {
          <div class="auth-form">
            <h3 class="form-group__label" style="text-align: center; margin-bottom: 0;">Seleccione Perfil</h3>
            <div class="role-list" style="max-height: 250px; overflow-y: auto;">
              @for (rol of availableRoles(); track rol) {
                <button type="button" (click)="onSelectRole(rol)" [disabled]="isLoading()" class="role-btn">
                  <div class="role-btn__info">
                    <lucide-icon [name]="getRoleIcon(rol)" class="w-5 h-5 role-btn__icon"></lucide-icon>
                    <div>
                      <span class="role-btn__name">{{ rol }}</span>
                      <span class="role-btn__desc">Acceder como {{ rol }}</span>
                    </div>
                  </div>
                  <lucide-icon name="chevron-right" class="w-4 h-4"></lucide-icon>
                </button>
              }
            </div>
            <button type="button" (click)="step.set('LOGIN')" class="auth-link" style="text-align: center; display: block; background:none; border:none; width:100%; cursor:pointer;">
              ← Volver
            </button>
          </div>
        } @else if (step() === 'CHANGE_PASSWORD') {
          <form [formGroup]="changePassForm" (ngSubmit)="onChangePassword()" class="auth-form">
            <div class="auth-header" style="margin-bottom: 1rem;">
              <h3 class="auth-header__title" style="font-size: 1.25rem;">Actualiza tu Contraseña</h3>
            </div>
            
            <div class="form-group">
              <label class="form-group__label">Nueva Contraseña</label>
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="nuevaContrasena" class="form-group__input" placeholder="Mínimo 6 caracteres">
              <button type="button" (click)="showPassword.set(!showPassword())" class="btn-reveal">
                <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" class="w-5 h-5"></lucide-icon>
              </button>
              @if (changePassForm.get('nuevaContrasena')?.touched && changePassForm.get('nuevaContrasena')?.invalid) {
                <span class="form-group__error">Mínimo 6 caracteres</span>
              }
            </div>

            <div class="form-group">
              <label class="form-group__label">Confirmar Contraseña</label>
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="confirmarContrasena" class="form-group__input" placeholder="Repite tu contraseña">
              @if (changePassForm.get('confirmarContrasena')?.touched && changePassForm.value.nuevaContrasena !== changePassForm.value.confirmarContrasena) {
                <span class="form-group__error">Las contraseñas no coinciden</span>
              }
            </div>

            <button type="submit" [disabled]="changePassForm.invalid || changePassForm.value.nuevaContrasena !== changePassForm.value.confirmarContrasena || isLoading()" class="auth-btn">
              @if (isLoading()) {
                <lucide-icon name="loader" class="w-5 h-5 animate-spin"></lucide-icon>
                <span>Guardando...</span>
              } @else {
                <span>Guardar y Entrar</span>
              }
            </button>
          </form>
        }

        <div class="auth-footer">
          <a routerLink="/registro" class="auth-link">
            <lucide-icon name="user-plus" class="w-4 h-4"></lucide-icon>
            <span>Solicitar acceso al sistema</span>
          </a>
          <p style="color: #9ca3af; margin-top: 0.5rem;">SACPA © 2026</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(TS);

  step = signal<'LOGIN' | 'ROLE_SELECT' | 'CHANGE_PASSWORD'>('LOGIN');
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  availableRoles = signal<string[]>([]);

  loginForm = this.fb.group({
    correo: ['c.mendoza@agrosense.ec', [Validators.required]],
    contrasena: ['admin123', [Validators.required]]
  });

  changePassForm = this.fb.group({
    nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]],
    confirmarContrasena: ['', [Validators.required, Validators.minLength(6)]]
  });

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { correo, contrasena } = this.loginForm.value;

    this.authService.login({ correo: correo!, contrasena: contrasena! }).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.usuario?.requiereCambioClave) {
          if (res.tipoFase === 'PRE_AUTH' && res.rolesDisponibles && res.rolesDisponibles.length > 1) {
            this.availableRoles.set(res.rolesDisponibles);
            this.step.set('ROLE_SELECT');
            this.toast.info('Autenticación preliminar exitosa', 'Seleccione con qué rol trabajará y luego cambie su contraseña temporal.');
          } else {
            this.step.set('CHANGE_PASSWORD');
            this.toast.warning('Cambio obligatorio de contraseña', 'Has ingresado por primera vez o con una contraseña temporal. Por seguridad, debes establecer tu nueva contraseña personal antes de continuar.');
          }
          return;
        }

        if (res.tipoFase === 'PRE_AUTH' && res.rolesDisponibles && res.rolesDisponibles.length > 1) {
          // Múltiples roles → mostrar pantalla de selección
          this.availableRoles.set(res.rolesDisponibles);
          this.step.set('ROLE_SELECT');
          this.toast.info('Autenticación preliminar exitosa', 'Por favor seleccione con qué rol desea trabajar.');
        } else if (res.tipoFase === 'PRE_AUTH' && res.rolesDisponibles && res.rolesDisponibles.length === 1) {
          // Un solo rol → auto-seleccionar con manejo de error visible
          const rolUnico = res.rolesDisponibles[0];
          this.toast.info('Verificando perfil...', `Ingresando como ${rolUnico}...`);
          this.authService.selectRole(rolUnico).subscribe({
            next: () => {
              this.toast.success('¡Bienvenido al sistema!', `Sesión iniciada correctamente.`);
            },
            error: err => {
              this.isLoading.set(false);
              this.toast.error('Error al activar sesión', err.error?.message || 'No se pudo activar el perfil. Intente nuevamente.');
            }
          });
        } else if (res.tipoFase === 'FINAL') {
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
        if (res.usuario?.requiereCambioClave || this.authService.currentUser()?.requiereCambioClave) {
          this.step.set('CHANGE_PASSWORD');
          this.toast.warning('Cambio obligatorio de contraseña', 'Has ingresado por primera vez o con una contraseña temporal. Por seguridad, debes establecer tu nueva contraseña personal antes de continuar.');
        } else {
          this.toast.success('Perfil seleccionado', `Ingresando al área de trabajo de ${rol}`);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error('Error', 'No se pudo activar la sesión con el rol seleccionado.');
      }
    });
  }

  onChangePassword(): void {
    if (this.changePassForm.invalid || this.changePassForm.value.nuevaContrasena !== this.changePassForm.value.confirmarContrasena) return;
    this.isLoading.set(true);
    const nueva = this.changePassForm.value.nuevaContrasena!;
    this.authService.cambiarContrasena(nueva).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('¡Contraseña actualizada!', 'Tu contraseña ha sido cambiada exitosamente. Bienvenido.');
        const rol = this.authService.currentRole() || 'ADMINISTRADOR';
        this.authService.navigateAfterLogin(rol);
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error('Error al cambiar contraseña', err.error?.message || 'No se pudo actualizar la contraseña.');
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

