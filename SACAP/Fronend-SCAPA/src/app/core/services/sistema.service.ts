import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CatalogoItemDTO, RegistroAuditoriaDTO, HistorialSesionDTO, ConfiguracionGlobalDTO } from '../models/sistema.model';
import { PageResponse } from './operaciones.service';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- MOCKS PARA FALLBACK OFFLINE ---

  // ================= CATÁLOGOS =================
  listarCatalogos(): Observable<CatalogoItemDTO[]> {
    return this.http.get<CatalogoItemDTO[]>(`${this.apiUrl}/catalogos`);
  }

  crearItemCatalogo(datos: Partial<CatalogoItemDTO>): Observable<CatalogoItemDTO> {
    return this.http.post<CatalogoItemDTO>(`${this.apiUrl}/catalogos`, datos);
  }

  cambiarEstadoItem(idItem: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/catalogos/${idItem}/estado`, { activo });
  }

  // ================= AUDITORÍA & SESIONES =================
  listarAuditoria(page: number = 0, size: number = 20, accion?: string, q?: string): Observable<PageResponse<RegistroAuditoriaDTO>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (accion) params = params.set('accion', accion);
    if (q) params = params.set('q', q);
    return this.http.get<PageResponse<RegistroAuditoriaDTO>>(`${this.apiUrl}/seguridad/auditoria`, { params });
  }

  listarHistorialSesiones(): Observable<HistorialSesionDTO[]> {
    return this.http.get<HistorialSesionDTO[]>(`${this.apiUrl}/seguridad/historial-sesion`);
  }

  // ================= CONFIGURACIÓN =================
  obtenerConfiguracion(): Observable<ConfiguracionGlobalDTO> {
    return this.http.get<ConfiguracionGlobalDTO>(`${this.apiUrl}/configuracion`);
  }

  actualizarConfiguracion(config: Partial<ConfiguracionGlobalDTO>): Observable<ConfiguracionGlobalDTO> {
    return this.http.put<ConfiguracionGlobalDTO>(`${this.apiUrl}/configuracion`, config);
  }
}
