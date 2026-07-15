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
  private mockCatalogos: CatalogoItemDTO[] = [
    { idItem: 1, categoria: 'UNIDADES_MEDIDA', codigo: 'UND-SAC', nombre: 'Sacos (50kg)', descripcion: 'Saco estándar de fertilizante o semilla', activo: true, orden: 1 },
    { idItem: 2, categoria: 'UNIDADES_MEDIDA', codigo: 'UND-LIT', nombre: 'Litros (L)', descripcion: 'Unidad volumétrica para agroquímicos líquidos', activo: true, orden: 2 },
    { idItem: 3, categoria: 'UNIDADES_MEDIDA', codigo: 'UND-KIL', nombre: 'Kilogramos (kg)', descripcion: 'Peso en kilos para insumos sólidos', activo: true, orden: 3 },
    { idItem: 4, categoria: 'UNIDADES_MEDIDA', codigo: 'UND-HEC', nombre: 'Hectáreas (ha)', descripcion: 'Área de terreno o siembra agrícola', activo: true, orden: 4 },
    { idItem: 5, categoria: 'TIPOS_LOTE', codigo: 'LOTE-FER', nombre: 'Fertilizantes Sólidos', descripcion: 'Abonos y nutrición vegetal granulada', activo: true, orden: 1 },
    { idItem: 6, categoria: 'TIPOS_LOTE', codigo: 'LOTE-AGR', nombre: 'Agroquímicos Líquidos', descripcion: 'Fungicidas, insecticidas y herbicidas en frasco', activo: true, orden: 2 },
    { idItem: 7, categoria: 'TIPOS_LOTE', codigo: 'LOTE-SEM', nombre: 'Semillas Híbridas', descripcion: 'Semilla certificada de alto rendimiento', activo: true, orden: 3 },
    { idItem: 8, categoria: 'ESTADOS_USUARIO', codigo: 'EST-ACT', nombre: 'Activo / Habilitado', descripcion: 'Usuario con acceso normal al sistema', activo: true, orden: 1 },
    { idItem: 9, categoria: 'ESTADOS_USUARIO', codigo: 'EST-INA', nombre: 'Inactivo / Suspendido', descripcion: 'Acceso temporalmente revocado por RRHH', activo: true, orden: 2 },
    { idItem: 10, categoria: 'TIPOS_AGROQUIMICO', codigo: 'AGRO-FUN', nombre: 'Fungicida Agrícola', descripcion: 'Prevención y control de hongos en hojas', activo: true, orden: 1 }
  ];

  private mockAuditoria: RegistroAuditoriaDTO[] = [
    { idAuditoria: 501, fechaHora: '2026-07-03 14:45:12', usuario: 'admin@agrosense.ec', rol: 'ADMINISTRADOR', accion: 'UPDATE', tablaAfectada: 'gerencia.administrador', detalleCambio: 'Actualización de foto_perfil y número telefónico.', direccionIp: '192.168.1.104' },
    { idAuditoria: 502, fechaHora: '2026-07-03 14:30:05', usuario: 'c.mendoza@agrosense.ec', rol: 'SUPERVISOR', accion: 'INSERT', tablaAfectada: 'operaciones.temporada', detalleCambio: 'Apertura de nueva temporada: Maíz Cosecha Verano 2026.', direccionIp: '192.168.1.115' },
    { idAuditoria: 503, fechaHora: '2026-07-03 13:15:22', usuario: 'admin@agrosense.ec', rol: 'ADMINISTRADOR', accion: 'PERMISO_CAMBIO', tablaAfectada: 'seguridad.rol_privilegio', detalleCambio: 'Asignación de 8 privilegios al rol Supervisor.', direccionIp: '192.168.1.104' },
    { idAuditoria: 504, fechaHora: '2026-07-03 11:10:00', usuario: 'bodega.quevedo@agrosense.ec', rol: 'BODEGUERO', accion: 'INSERT', tablaAfectada: 'bodega.inventario_lote', detalleCambio: 'Ingreso de 150 sacos de Fertilizante Urea Agrícola.', direccionIp: '192.168.2.45' },
    { idAuditoria: 505, fechaHora: '2026-07-02 18:20:44', usuario: 'admin@agrosense.ec', rol: 'ADMINISTRADOR', accion: 'LOGIN', tablaAfectada: 'seguridad.historial_sesion', detalleCambio: 'Inicio de sesión exitoso con autenticación biometría/JWT.', direccionIp: '192.168.1.104' }
  ];

  private mockSesiones: HistorialSesionDTO[] = [
    { idSesion: 1001, correoUsuario: 'admin@agrosense.ec', rolSeleccionado: 'ADMINISTRADOR', direccionIp: '192.168.1.104', fechaInicio: '2026-07-03 14:00:15', estadoConexion: 'ACTIVA', dispositivo: 'Chrome / Windows 11' },
    { idSesion: 1002, correoUsuario: 'c.mendoza@agrosense.ec', rolSeleccionado: 'SUPERVISOR', direccionIp: '192.168.1.115', fechaInicio: '2026-07-03 13:45:00', fechaFin: '2026-07-03 14:30:10', estadoConexion: 'CERRADA', dispositivo: 'Firefox / macOS' },
    { idSesion: 1003, correoUsuario: 'bodega.quevedo@agrosense.ec', rolSeleccionado: 'BODEGUERO', direccionIp: '192.168.2.45', fechaInicio: '2026-07-03 08:30:00', fechaFin: '2026-07-03 12:00:00', estadoConexion: 'CERRADA', dispositivo: 'Safari / iPad' },
    { idSesion: 1004, correoUsuario: 'invitado.desconocido@test.com', rolSeleccionado: 'NINGUNO', direccionIp: '45.180.22.19', fechaInicio: '2026-07-03 02:15:11', estadoConexion: 'INTENTO_FALLIDO', dispositivo: 'Python-urllib / Linux' },
    { idSesion: 1005, correoUsuario: 'proveedor.bayer@agrosense.ec', rolSeleccionado: 'PROVEEDOR', direccionIp: '186.68.140.12', fechaInicio: '2026-07-02 16:10:00', fechaFin: '2026-07-02 18:00:00', estadoConexion: 'EXPIRADA', dispositivo: 'Edge / Windows 10' }
  ];

  private mockConfig: ConfiguracionGlobalDTO = {
    nombreEmpresa: 'AgroSense S.A. / SACPA Agrícola',
    ruc: '1792145870001',
    correoContacto: 'soporte@agrosense.ec',
    telefonoSoporte: '+593 99 888 7766',
    bodegaPrincipal: 'Bodega Central Quevedo - Km 4.5 Vía El Empalme',
    notificarPorCorreo: true,
    notificarPorSms: true,
    modoMantenimiento: false,
    intervaloSincronizacionMinutos: 15,
    versionSistema: 'v2.4.0-PROD (Enterprise LMS)'
  };

  // ================= CATÁLOGOS =================
  listarCatalogos(): Observable<CatalogoItemDTO[]> {
    return this.http.get<CatalogoItemDTO[]>(`${this.apiUrl}/catalogos`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockCatalogos]);
        return throwError(() => err);
      })
    );
  }

  crearItemCatalogo(datos: Partial<CatalogoItemDTO>): Observable<CatalogoItemDTO> {
    return this.http.post<CatalogoItemDTO>(`${this.apiUrl}/catalogos`, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockCatalogos.map(c => c.idItem), 0) + 1;
          const nuevo: CatalogoItemDTO = {
            idItem: newId,
            categoria: datos.categoria || 'UNIDADES_MEDIDA',
            codigo: datos.codigo || `CAT-${newId}`,
            nombre: datos.nombre || 'Nuevo Ítem',
            descripcion: datos.descripcion || '',
            activo: true,
            orden: this.mockCatalogos.length + 1
          };
          this.mockCatalogos.push(nuevo);
          return of(nuevo);
        }
        return throwError(() => err);
      })
    );
  }

  cambiarEstadoItem(idItem: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/catalogos/${idItem}/estado`, { activo }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const it = this.mockCatalogos.find(x => x.idItem === idItem);
          if (it) it.activo = activo;
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  // ================= AUDITORÍA & SESIONES =================
  listarAuditoria(): Observable<RegistroAuditoriaDTO[]> {
    return this.http.get<RegistroAuditoriaDTO[]>(`${this.apiUrl}/seguridad/auditoria`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockAuditoria]);
        return throwError(() => err);
      })
    );
  }

  listarHistorialSesiones(): Observable<HistorialSesionDTO[]> {
    return this.http.get<HistorialSesionDTO[]>(`${this.apiUrl}/seguridad/historial-sesion`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockSesiones]);
        return throwError(() => err);
      })
    );
  }

  // ================= CONFIGURACIÓN =================
  obtenerConfiguracion(): Observable<ConfiguracionGlobalDTO> {
    return this.http.get<ConfiguracionGlobalDTO>(`${this.apiUrl}/configuracion`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of({ ...this.mockConfig });
        return throwError(() => err);
      })
    );
  }

  actualizarConfiguracion(config: Partial<ConfiguracionGlobalDTO>): Observable<ConfiguracionGlobalDTO> {
    return this.http.put<ConfiguracionGlobalDTO>(`${this.apiUrl}/configuracion`, config).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockConfig = { ...this.mockConfig, ...config };
          return of({ ...this.mockConfig });
        }
        return throwError(() => err);
      })
    );
  }
}
