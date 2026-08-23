import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CatalogoItemDTO, RegistroAuditoriaDTO, HistorialSesionDTO, ConfiguracionGlobalDTO } from '../models/sistema.model';

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
  listarAuditoria(): Observable<RegistroAuditoriaDTO[]> {
    return this.http.get<RegistroAuditoriaDTO[]>(`${this.apiUrl}/seguridad/auditoria`);
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
