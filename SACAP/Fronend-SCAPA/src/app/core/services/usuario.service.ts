import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UsuarioDTO, CreateUsuarioDTO } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  // --- MOCK OFFLINE FALLBACK ---
  private mockUsuarios: UsuarioDTO[] = [
    {
      idUsuario: 1, correo: 'admin@agro.com', idEstado: 1,
      roles: ['ADMINISTRADOR'], idRoles: [1],
      nombre: 'Administrador SACPA',
      cedula: '1700000000'
    } as any,
    {
      idUsuario: 2, correo: 'bodeguero@agro.com', idEstado: 1,
      roles: ['BODEGUERO'], idRoles: [3],
      nombre: 'Bodeguero SACPA',
      cedula: '1700000001'
    } as any,
    {
      idUsuario: 3, correo: 'tecnico@agro.com', idEstado: 2,
      roles: ['TÉCNICO DE CAMPO'], idRoles: [4],
      nombre: 'Técnico SACPA',
      cedula: '1700000002'
    } as any
  ];

  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiUrl).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of([...this.mockUsuarios]);
        }
        return throwError(() => err);
      })
    );
  }

  obtenerPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${id}`);
  }

  crear(usuario: CreateUsuarioDTO & Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, usuario);
  }

  actualizar(id: number, usuario: CreateUsuarioDTO & Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, usuario);
  }

  crearBasico(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/basico`, datos);
  }

  asignarRol(idUsuario: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${idUsuario}/asignar-rol`, formData);
  }

  cambiarEstado(id: number, idEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { idEstado });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: number): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/${id}/reset-password`, {});
  }
}

