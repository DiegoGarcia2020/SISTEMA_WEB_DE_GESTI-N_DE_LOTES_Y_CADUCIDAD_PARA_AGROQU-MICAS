import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PrivilegioDTO, TipoObjetoDTO, RolPrivilegioDTO, EsquemaPrivilegiosDTO, TablaPrivilegiosDTO } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class PrivilegioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/privilegios`;

  private mockTiposObjeto: TipoObjetoDTO[] = [
    { idTipoObjeto: 1, nombre: 'TABLA', descripcion: 'Tablas relacionales en PostgreSQL', activo: true },
    { idTipoObjeto: 2, nombre: 'VISTA', descripcion: 'Vistas de base de datos para reportes', activo: true },
    { idTipoObjeto: 3, nombre: 'FUNCION', descripcion: 'Funciones y procedimientos almacenados BD', activo: true },
    { idTipoObjeto: 4, nombre: 'ENDPOINT_API', descripcion: 'Endpoints REST Spring Boot Backend', activo: true },
    { idTipoObjeto: 5, nombre: 'MODULO_UI', descripcion: 'Módulo o pantalla del frontend Angular', activo: true }
  ];

  private mockPrivilegios: PrivilegioDTO[] = [
    { idPrivilegio: 1, nombre: 'Gestión de Usuarios', accion: 'ALL', activo: true, idTipoObjeto: 1, tipoObjeto: { idTipoObjeto: 1, nombre: 'TABLA', activo: true }, esquema: 'seguridad', nombreTabla: 'usuario' },
    { idPrivilegio: 2, nombre: 'Gestión de Roles y Permisos', accion: 'ALL', activo: true, idTipoObjeto: 1, tipoObjeto: { idTipoObjeto: 1, nombre: 'TABLA', activo: true }, esquema: 'seguridad', nombreTabla: 'rol' },
    { idPrivilegio: 3, nombre: 'Gestión de Temporadas Agrícolas', accion: 'ALL', activo: true, idTipoObjeto: 1, tipoObjeto: { idTipoObjeto: 1, nombre: 'TABLA', activo: true }, esquema: 'campo', nombreTabla: 'temporada' },
    { idPrivilegio: 4, nombre: 'Aprobación de Sugerencias IA', accion: 'ALL', activo: true, idTipoObjeto: 1, tipoObjeto: { idTipoObjeto: 1, nombre: 'TABLA', activo: true }, esquema: 'ia_alertas', nombreTabla: 'promocion' },
    { idPrivilegio: 5, nombre: 'Control de Inventario y Bodegas', accion: 'SELECT, INSERT, UPDATE', activo: true, idTipoObjeto: 1, tipoObjeto: { idTipoObjeto: 1, nombre: 'TABLA', activo: true }, esquema: 'inventario', nombreTabla: 'bodega' },
    { idPrivilegio: 6, nombre: 'Consulta Reportes Gerenciales', accion: 'SELECT', activo: true, idTipoObjeto: 2, tipoObjeto: { idTipoObjeto: 2, nombre: 'VISTA', activo: true }, esquema: 'gerencia', nombreTabla: 'reportes' },
    { idPrivilegio: 7, nombre: 'Registro Uso de Campo', accion: 'INSERT, UPDATE', activo: true, idTipoObjeto: 5, tipoObjeto: { idTipoObjeto: 5, nombre: 'MODULO_UI', activo: true }, esquema: 'campo', nombreTabla: 'uso_campo' },
    { idPrivilegio: 8, nombre: 'Portal Proveedores Exclusivo', accion: 'SELECT, INSERT', activo: true, idTipoObjeto: 5, tipoObjeto: { idTipoObjeto: 5, nombre: 'MODULO_UI', activo: true }, esquema: 'compras', nombreTabla: 'proveedor' }
  ];

  private mockRolPrivilegios: { [key: number]: number[] } = {
    1: [1, 2, 3, 4, 5, 6, 7, 8], // Admin tiene todo
    2: [3, 5, 7],               // Supervisor
    3: [5],                     // Bodeguero
    4: [7],                     // Técnico
    5: [8],                     // Proveedor
    6: [6]                      // Gerente
  };

  listarPrivilegios(): Observable<PrivilegioDTO[]> {
    return this.http.get<PrivilegioDTO[]>(this.apiUrl).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of([...this.mockPrivilegios]);
        }
        return throwError(() => err);
      })
    );
  }

  listarPrivilegiosAgrupados(): Observable<EsquemaPrivilegiosDTO[]> {
    return this.http.get<EsquemaPrivilegiosDTO[]>(`${this.apiUrl}/agrupados`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(this.agruparPrivilegios(this.mockPrivilegios));
        }
        return throwError(() => err);
      })
    );
  }

  agruparPrivilegios(lista: PrivilegioDTO[]): EsquemaPrivilegiosDTO[] {
    const map = new Map<string, Map<string, PrivilegioDTO[]>>();
    lista.forEach(p => {
      const esc = (p.esquema && p.esquema.trim()) ? p.esquema : 'general';
      const tab = (p.nombreTabla && p.nombreTabla.trim()) ? p.nombreTabla : 'sistema';
      if (!map.has(esc)) map.set(esc, new Map());
      if (!map.get(esc)!.has(tab)) map.get(esc)!.set(tab, []);
      map.get(esc)!.get(tab)!.push(p);
    });

    const res: EsquemaPrivilegiosDTO[] = [];
    Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([esquema, tablasMap]) => {
      const tablas: TablaPrivilegiosDTO[] = [];
      Array.from(tablasMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([nombreTabla, privilegios]) => {
        tablas.push({ nombreTabla, privilegios });
      });
      res.push({ esquema, tablas });
    });
    return res;
  }

  crearPrivilegio(datos: Partial<PrivilegioDTO>): Observable<PrivilegioDTO> {
    return this.http.post<PrivilegioDTO>(this.apiUrl, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockPrivilegios.map(p => p.idPrivilegio), 0) + 1;
          const t = this.mockTiposObjeto.find(x => x.idTipoObjeto === datos.idTipoObjeto) || this.mockTiposObjeto[0];
          const nuevo: PrivilegioDTO = {
            idPrivilegio: newId,
            nombre: datos.nombre || 'Nuevo Permiso',
            accion: datos.accion || 'SELECT',
            activo: true,
            idTipoObjeto: t.idTipoObjeto,
            tipoObjeto: t,
            esquema: datos.esquema || 'general',
            nombreTabla: datos.nombreTabla || 'sistema'
          };
          this.mockPrivilegios.push(nuevo);
          return of(nuevo);
        }
        return throwError(() => err);
      })
    );
  }

  desactivarPrivilegio(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const p = this.mockPrivilegios.find(x => x.idPrivilegio === id);
          if (p) p.activo = false;
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  listarTiposObjeto(): Observable<TipoObjetoDTO[]> {
    return this.http.get<TipoObjetoDTO[]>(`${this.apiUrl}/tipos-objeto`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of([...this.mockTiposObjeto]);
        }
        return throwError(() => err);
      })
    );
  }

  crearTipoObjeto(datos: Partial<TipoObjetoDTO>): Observable<TipoObjetoDTO> {
    return this.http.post<TipoObjetoDTO>(`${this.apiUrl}/tipos-objeto`, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockTiposObjeto.map(t => t.idTipoObjeto), 0) + 1;
          const nuevo: TipoObjetoDTO = {
            idTipoObjeto: newId,
            nombre: datos.nombre || 'NUEVO_TIPO',
            descripcion: datos.descripcion || '',
            activo: true
          };
          this.mockTiposObjeto.push(nuevo);
          return of(nuevo);
        }
        return throwError(() => err);
      })
    );
  }

  listarPrivilegiosPorRol(idRol: number): Observable<RolPrivilegioDTO[]> {
    return this.http.get<RolPrivilegioDTO[]>(`${this.apiUrl}/rol/${idRol}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const asignados = this.mockRolPrivilegios[idRol] || [];
          const res: RolPrivilegioDTO[] = asignados.map(idPriv => {
            const priv = this.mockPrivilegios.find(p => p.idPrivilegio === idPriv)!;
            return {
              idRolPrivilegio: Math.random() * 1000,
              rol: { idRol, nombre: '', idEstado: 1 },
              privilegio: priv
            };
          }).filter(x => !!x.privilegio);
          return of(res);
        }
        return throwError(() => err);
      })
    );
  }

  asignarPrivilegiosARol(idRol: number, idPrivilegios: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rol/${idRol}`, { idPrivilegios }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockRolPrivilegios[idRol] = [...idPrivilegios];
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }
}
