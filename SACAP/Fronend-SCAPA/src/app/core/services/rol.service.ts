import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RolDTO, RolBDDTO } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;

  listar(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<RolDTO> {
    return this.http.get<RolDTO>(`${this.apiUrl}/${id}`);
  }

  crear(rol: Partial<RolDTO>): Observable<RolDTO> {
    return this.http.post<RolDTO>(this.apiUrl, rol);
  }

  actualizar(id: number, rol: Partial<RolDTO>): Observable<RolDTO> {
    return this.http.put<RolDTO>(`${this.apiUrl}/${id}`, rol);
  }

  cambiarEstado(id: number, idEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { idEstado });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarRolesBd(): Observable<RolBDDTO[]> {
    return this.http.get<RolBDDTO[]>(`${this.apiUrl}/bd`);
  }

  crearRolBd(rolBd: Partial<RolBDDTO>): Observable<RolBDDTO> {
    return this.http.post<RolBDDTO>(`${this.apiUrl}/bd`, rolBd);
  }

  actualizarRolBd(idRolBd: number, rolBd: Partial<RolBDDTO>): Observable<RolBDDTO> {
    return this.http.put<RolBDDTO>(`${this.apiUrl}/bd/${idRolBd}`, rolBd);
  }
}
