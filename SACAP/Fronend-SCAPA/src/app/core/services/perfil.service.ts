import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MiPerfilDTO {
  idUsuario: number;
  correo: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  ocupacion?: string;
  fotoPerfil?: string;
  roles: string[];
}

export interface ActualizarPerfilDTO {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  ocupacion?: string;
}

/**
 * Perfil propio del usuario autenticado -- funciona para los 4 roles
 * (Administrador, Supervisor, Bodeguero, Tecnico de Campo), a diferencia
 * de AdministradorService que solo servia al rol Administrador.
 */
@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/perfil`;

  obtenerMiPerfil(): Observable<MiPerfilDTO> {
    return this.http.get<MiPerfilDTO>(this.apiUrl);
  }

  actualizarMiPerfil(datos: ActualizarPerfilDTO): Observable<MiPerfilDTO> {
    return this.http.put<MiPerfilDTO>(this.apiUrl, datos);
  }

  actualizarMiFoto(fotoPerfil: string): Observable<MiPerfilDTO> {
    return this.http.patch<MiPerfilDTO>(`${this.apiUrl}/foto`, { fotoPerfil });
  }

  cambiarMiContrasena(contrasenaActual: string, nuevaContrasena: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cambiar-contrasena`, { contrasenaActual, nuevaContrasena });
  }
}
