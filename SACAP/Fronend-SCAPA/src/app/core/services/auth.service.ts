import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, RoleSelectionRequest, UsuarioInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'sacpa_token';
  private readonly PRE_AUTH_TOKEN_KEY = 'sacpa_pre_auth_token';
  private readonly USER_KEY = 'sacpa_user';
  private readonly ROLE_KEY = 'sacpa_role';

  currentUser = signal<UsuarioInfo | null>(this.getStoredUser());
  currentRole = signal<string | null>(this.getStoredRole());
  isAuthenticated = signal<boolean>(!!this.getToken());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.tipoFase === 'PRE_AUTH') {
          localStorage.setItem(this.PRE_AUTH_TOKEN_KEY, res.token);
          if (res.usuario) {
            this.currentUser.set(res.usuario);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.usuario));
          }
          // Auto-selección de rol único ahora se maneja en login.component.ts
          // para poder mostrar errores al usuario correctamente
        } else if (res.tipoFase === 'FINAL') {
          this.setFinalSession(res.token, res.usuario, 'ADMINISTRADOR');
        }
      })
    );
  }

  selectRole(rolSeleccionado: string): Observable<AuthResponse> {
    const preToken = localStorage.getItem(this.PRE_AUTH_TOKEN_KEY);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${preToken}`);
    const body: RoleSelectionRequest = { rolSeleccionado };

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/select-role`, body, { headers }).pipe(
      tap(res => {
        this.setFinalSession(res.token, res.usuario || this.currentUser()!, rolSeleccionado);
      })
    );
  }

  setFinalSession(token: string, usuario: UsuarioInfo, rol: string, skipRedirect = false): void {
    localStorage.removeItem(this.PRE_AUTH_TOKEN_KEY);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    localStorage.setItem(this.ROLE_KEY, rol);

    this.currentUser.set(usuario);
    this.currentRole.set(rol);
    this.isAuthenticated.set(true);


    if (skipRedirect || usuario.requiereCambioClave) {
      return;
    }

    this.navigateAfterLogin(rol);

  }

  navigateAfterLogin(rol: string): void {
    const r = rol.toUpperCase();
    if (r.includes('BODEG') || r.includes('ALMACEN')) {
      this.router.navigate(['/bodega/dashboard']);
    } else if (r.includes('TECNIC') || r.includes('TÉCNIC') || r.includes('CAMPO')) {
      this.router.navigate(['/campo/dashboard']);
    } else if (r.includes('SUPERVIS')) {
      this.router.navigate(['/supervisor/dashboard']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  cambiarContrasena(nuevaContrasena: string, contrasenaActual?: string): Observable<any> {
    const token = this.getToken() || localStorage.getItem(this.PRE_AUTH_TOKEN_KEY);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload: any = { nuevaContrasena };
    if (contrasenaActual) {
      payload.contrasenaActual = contrasenaActual;
    }
    return this.http.post<any>(`${this.apiUrl}/auth/cambiar-contrasena`, payload, { headers }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          const updated = { ...user, requiereCambioClave: false };
          this.currentUser.set(updated);
          localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
        }
      })
    );
  }


  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.PRE_AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);

    this.currentUser.set(null);
    this.currentRole.set(null);
    this.isAuthenticated.set(false);

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UsuarioInfo | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  private getStoredRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }
}
