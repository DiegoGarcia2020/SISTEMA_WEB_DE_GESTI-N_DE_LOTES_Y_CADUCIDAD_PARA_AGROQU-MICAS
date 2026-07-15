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

  private mockUsers: UsuarioDTO[] = [
    { idUsuario: 1, nombre: 'Carlos Mendoza Ríos', correo: 'c.mendoza@agrosense.ec', cedula: '1712345678', roles: ['Administrador'], idRoles: [1], idEstado: 1, ultimoAcceso: '2026-06-25 08:14' },
    { idUsuario: 2, nombre: 'Valeria Suárez Condo', correo: 'v.suarez@agrosense.ec', cedula: '0923456789', roles: ['Supervisor', 'Bodeguero'], idRoles: [2, 3], idEstado: 1, ultimoAcceso: '2026-06-25 07:52', turno: 'Turno Mañana (06:00–14:00)' },
    { idUsuario: 3, nombre: 'AgroFértil S.A.', correo: 'contacto@agrofertil.ec', cedula: '1790234567001', roles: ['Proveedor'], idRoles: [5], idEstado: 1, ultimoAcceso: '2026-06-23 15:30', ciudad: 'Quito' },
    { idUsuario: 4, nombre: 'Jhon Vera Aguilar', correo: 'j.vera@agrosense.ec', cedula: '1756789012', roles: ['Técnico de Campo'], idRoles: [4], idEstado: 1, ultimoAcceso: '2026-06-24 11:05', licencia: 'LIC-2026-0098' },
    { idUsuario: 5, nombre: 'Rosa Toapanta Morales', correo: 'r.toapanta@agrosense.ec', cedula: '1798765432', roles: ['Bodeguero'], idRoles: [3], idEstado: 2, ultimoAcceso: '2026-06-10 09:00', turno: 'Turno Tarde (14:00–22:00)' },
    { idUsuario: 6, nombre: 'Diego Alvarado Pinto', correo: 'd.alvarado@agrosense.ec', cedula: '1734567890', roles: ['Técnico de Campo'], idRoles: [4], idEstado: 3, ultimoAcceso: '2026-05-30 14:22', licencia: 'LIC-2025-0112' },
    { idUsuario: 7, nombre: 'NutriCampo Cía. Ltda.', correo: 'ventas@nutricampo.ec', cedula: '1790876543001', roles: ['Proveedor'], idRoles: [5], idEstado: 1, ultimoAcceso: '2026-06-22 10:15', ciudad: 'Ambato' }
  ];

  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiUrl).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          console.warn('⚠️ Servidor SACPA no accesible. Devolviendo lista de usuarios mock (AgroSense LMS).');
          return of([...this.mockUsers]);
        }
        return throwError(() => err);
      })
    );
  }

  obtenerPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const u = this.mockUsers.find(x => x.idUsuario === id) || this.mockUsers[0];
          return of({ ...u });
        }
        return throwError(() => err);
      })
    );
  }

  crear(usuario: CreateUsuarioDTO & Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, usuario).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockUsers.map(u => u.idUsuario), 0) + 1;
          const mapRoles = usuario.idRoles.map(id => {
            const m: Record<number, string> = { 1: 'Administrador', 2: 'Supervisor', 3: 'Bodeguero', 4: 'Técnico de Campo', 5: 'Proveedor', 6: 'Gerente' };
            return m[id] || 'Usuario';
          });
          const newU: UsuarioDTO = {
            idUsuario: newId,
            correo: usuario.correo,
            idEstado: usuario.idEstado,
            roles: mapRoles,
            idRoles: usuario.idRoles,
            nombre: usuario.nombre || usuario.correo.split('@')[0],
            cedula: usuario.cedula || '1700000000',
            ultimoAcceso: 'Recién creado',
            licencia: usuario.licencia,
            ciudad: usuario.ciudad,
            turno: usuario.turno
          };
          this.mockUsers.push(newU);
          return of(newU);
        }
        return throwError(() => err);
      })
    );
  }

  actualizar(id: number, usuario: CreateUsuarioDTO & Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, usuario).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const index = this.mockUsers.findIndex(u => u.idUsuario === id);
          if (index !== -1) {
            const mapRoles = usuario.idRoles.map(rId => {
              const m: Record<number, string> = { 1: 'Administrador', 2: 'Supervisor', 3: 'Bodeguero', 4: 'Técnico de Campo', 5: 'Proveedor', 6: 'Gerente' };
              return m[rId] || 'Usuario';
            });
            this.mockUsers[index] = {
              ...this.mockUsers[index],
              correo: usuario.correo,
              idEstado: usuario.idEstado,
              idRoles: usuario.idRoles,
              roles: mapRoles,
              nombre: usuario.nombre || this.mockUsers[index].nombre,
              cedula: usuario.cedula || this.mockUsers[index].cedula,
              licencia: usuario.licencia || this.mockUsers[index].licencia,
              ciudad: usuario.ciudad || this.mockUsers[index].ciudad,
              turno: usuario.turno || this.mockUsers[index].turno
            };
            return of({ ...this.mockUsers[index] });
          }
          return of({ idUsuario: id, correo: usuario.correo, idEstado: usuario.idEstado, roles: [], idRoles: usuario.idRoles });
        }
        return throwError(() => err);
      })
    );
  }

  cambiarEstado(id: number, idEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { idEstado }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const u = this.mockUsers.find(x => x.idUsuario === id);
          if (u) u.idEstado = idEstado;
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockUsers = this.mockUsers.filter(x => x.idUsuario !== id);
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }
}
