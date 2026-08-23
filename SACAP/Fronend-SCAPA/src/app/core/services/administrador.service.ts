import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdministradorDTO {
  idAdministrador?: number;
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fotoPerfil?: string;
  usuario?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/administrador`;

  obtenerPerfil(idUsuario: number): Observable<AdministradorDTO> {
    return this.http.get<AdministradorDTO>(`${this.apiUrl}/perfil/${idUsuario}`);
  }

  actualizarPerfil(idUsuario: number, datos: Partial<AdministradorDTO>): Observable<AdministradorDTO> {
    return this.http.put<AdministradorDTO>(`${this.apiUrl}/perfil/${idUsuario}`, datos);
  }

  actualizarFoto(idUsuario: number, fotoPerfil: string): Observable<void> {
    localStorage.setItem('sacpa_admin_foto', fotoPerfil);
    return this.http.patch<void>(`${this.apiUrl}/perfil/${idUsuario}/foto`, { fotoPerfil });
  }
}
