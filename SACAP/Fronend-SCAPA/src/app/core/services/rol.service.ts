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

  private mockRoles: RolDTO[] = [
    { idRol: 1, nombre: 'Administrador', idEstado: 1, descripcion: 'Control total del sistema SACPA', totalUsuarios: 2 },
    { idRol: 2, nombre: 'Supervisor', idEstado: 1, descripcion: 'Supervisión de operaciones y personal de campo', totalUsuarios: 4 },
    { idRol: 3, nombre: 'Bodeguero', idEstado: 1, descripcion: 'Gestión de inventario y bodegas', totalUsuarios: 6 },
    { idRol: 4, nombre: 'Técnico de Campo', idEstado: 1, descripcion: 'Registro de actividades agroindustriales en campo', totalUsuarios: 12 },
    { idRol: 5, nombre: 'Proveedor', idEstado: 1, descripcion: 'Acceso limitado a portal de proveedores', totalUsuarios: 8 },
    { idRol: 6, nombre: 'Gerente', idEstado: 1, descripcion: 'Vista ejecutiva y reportes', totalUsuarios: 1 }
  ];

  private mockRolesBd: RolBDDTO[] = [
    { idRolBd: 1, nombreRolBd: 'rol_admin_sacpa', descripcion: 'Rol PostgreSQL acceso total', activo: true },
    { idRolBd: 2, nombreRolBd: 'rol_supervisor_sacpa', descripcion: 'Rol PostgreSQL supervisión', activo: true },
    { idRolBd: 3, nombreRolBd: 'rol_bodeguero_sacpa', descripcion: 'Rol PostgreSQL inventario', activo: true },
    { idRolBd: 4, nombreRolBd: 'rol_tecnico_sacpa', descripcion: 'Rol PostgreSQL técnicos campo', activo: true },
    { idRolBd: 5, nombreRolBd: 'rol_proveedor_sacpa', descripcion: 'Rol PostgreSQL portal proveedores', activo: true },
    { idRolBd: 6, nombreRolBd: 'rol_gerente_sacpa', descripcion: 'Rol PostgreSQL reportes', activo: true }
  ];

  listar(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(this.apiUrl).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of([...this.mockRoles]);
        }
        return throwError(() => err);
      })
    );
  }

  obtenerPorId(id: number): Observable<RolDTO> {
    return this.http.get<RolDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const r = this.mockRoles.find(x => x.idRol === id) || this.mockRoles[0];
          return of({ ...r });
        }
        return throwError(() => err);
      })
    );
  }

  crear(rol: Partial<RolDTO>): Observable<RolDTO> {
    return this.http.post<RolDTO>(this.apiUrl, rol).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockRoles.map(r => r.idRol), 0) + 1;
          const newRol: RolDTO = {
            idRol: newId,
            nombre: rol.nombre || 'Nuevo Rol',
            idEstado: rol.idEstado || 1,
            descripcion: rol.descripcion || '',
            totalUsuarios: 0
          };
          this.mockRoles.push(newRol);
          return of(newRol);
        }
        return throwError(() => err);
      })
    );
  }

  actualizar(id: number, rol: Partial<RolDTO>): Observable<RolDTO> {
    return this.http.put<RolDTO>(`${this.apiUrl}/${id}`, rol).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const idx = this.mockRoles.findIndex(x => x.idRol === id);
          if (idx !== -1) {
            this.mockRoles[idx] = { ...this.mockRoles[idx], ...rol };
            return of({ ...this.mockRoles[idx] });
          }
          return of({ idRol: id, nombre: rol.nombre || '', idEstado: 1 });
        }
        return throwError(() => err);
      })
    );
  }

  cambiarEstado(id: number, idEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { idEstado }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const r = this.mockRoles.find(x => x.idRol === id);
          if (r) r.idEstado = idEstado;
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
          this.mockRoles = this.mockRoles.filter(x => x.idRol !== id);
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  listarRolesBd(): Observable<RolBDDTO[]> {
    return this.http.get<RolBDDTO[]>(`${this.apiUrl}/bd`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of([...this.mockRolesBd]);
        }
        return throwError(() => err);
      })
    );
  }

  crearRolBd(rolBd: Partial<RolBDDTO>): Observable<RolBDDTO> {
    return this.http.post<RolBDDTO>(`${this.apiUrl}/bd`, rolBd).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockRolesBd.map(r => r.idRolBd), 0) + 1;
          const nuevo: RolBDDTO = {
            idRolBd: newId,
            nombreRolBd: rolBd.nombreRolBd || 'rol_nuevo_sacpa',
            descripcion: rolBd.descripcion || 'Rol de PostgreSQL personalizado para SACPA',
            activo: rolBd.activo !== undefined ? rolBd.activo : true
          };
          this.mockRolesBd.push(nuevo);
          return of(nuevo);
        }
        return throwError(() => err);
      })
    );
  }

  actualizarRolBd(idRolBd: number, rolBd: Partial<RolBDDTO>): Observable<RolBDDTO> {
    return this.http.put<RolBDDTO>(`${this.apiUrl}/bd/${idRolBd}`, rolBd).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const idx = this.mockRolesBd.findIndex(x => x.idRolBd === idRolBd);
          if (idx !== -1) {
            this.mockRolesBd[idx] = { ...this.mockRolesBd[idx], ...rolBd };
            return of({ ...this.mockRolesBd[idx] });
          }
          return of({ idRolBd, nombreRolBd: rolBd.nombreRolBd || '', activo: true });
        }
        return throwError(() => err);
      })
    );
  }
}
