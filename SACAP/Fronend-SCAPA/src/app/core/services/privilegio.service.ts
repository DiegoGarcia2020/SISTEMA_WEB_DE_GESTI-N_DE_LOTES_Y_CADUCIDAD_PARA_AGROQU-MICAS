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

  listarPrivilegios(): Observable<PrivilegioDTO[]> {
    return this.http.get<PrivilegioDTO[]>(this.apiUrl);
  }

  listarPrivilegiosAgrupados(): Observable<EsquemaPrivilegiosDTO[]> {
    return this.http.get<EsquemaPrivilegiosDTO[]>(`${this.apiUrl}/agrupados`);
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
    return this.http.post<PrivilegioDTO>(this.apiUrl, datos);
  }

  desactivarPrivilegio(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  listarTiposObjeto(): Observable<TipoObjetoDTO[]> {
    return this.http.get<TipoObjetoDTO[]>(`${this.apiUrl}/tipos-objeto`);
  }

  crearTipoObjeto(datos: Partial<TipoObjetoDTO>): Observable<TipoObjetoDTO> {
    return this.http.post<TipoObjetoDTO>(`${this.apiUrl}/tipos-objeto`, datos);
  }

  listarPrivilegiosPorRol(idRol: number): Observable<RolPrivilegioDTO[]> {
    return this.http.get<RolPrivilegioDTO[]>(`${this.apiUrl}/rol/${idRol}`);
  }

  asignarPrivilegiosARol(idRol: number, idPrivilegios: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rol/${idRol}`, { idPrivilegios });
  }
}
