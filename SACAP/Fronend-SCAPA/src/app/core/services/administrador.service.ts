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
    return this.http.get<AdministradorDTO>(`${this.apiUrl}/perfil/${idUsuario}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const fotoLocal = localStorage.getItem('sacpa_admin_foto') || undefined;
          return of({
            idAdministrador: 1,
            cedula: '1700000000',
            nombres: 'Administrador',
            apellidos: 'SACPA',
            telefono: '0999999999',
            fotoPerfil: fotoLocal
          });
        }
        return throwError(() => err);
      })
    );
  }

  actualizarPerfil(idUsuario: number, datos: Partial<AdministradorDTO>): Observable<AdministradorDTO> {
    return this.http.put<AdministradorDTO>(`${this.apiUrl}/perfil/${idUsuario}`, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          if (datos.fotoPerfil) {
            localStorage.setItem('sacpa_admin_foto', datos.fotoPerfil);
          }
          return of({
            idAdministrador: 1,
            ...datos
          });
        }
        return throwError(() => err);
      })
    );
  }

  actualizarFoto(idUsuario: number, fotoPerfil: string): Observable<void> {
    localStorage.setItem('sacpa_admin_foto', fotoPerfil);
    return this.http.patch<void>(`${this.apiUrl}/perfil/${idUsuario}/foto`, { fotoPerfil }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }
}
