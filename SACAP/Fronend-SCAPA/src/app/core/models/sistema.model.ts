export interface CatalogoItemDTO {
  idItem: number;
  categoria: 'UNIDADES_MEDIDA' | 'TIPOS_LOTE' | 'ESTADOS_USUARIO' | 'ESTADOS_ORDEN' | 'TIPOS_AGROQUIMICO';
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  orden: number;
}

export interface RegistroAuditoriaDTO {
  idAuditoria: number;
  fechaHora: string;
  usuario: string;
  rol: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PERMISO_CAMBIO';
  tablaAfectada: string;
  detalleCambio: string;
  direccionIp: string;
}

export interface HistorialSesionDTO {
  idSesion: number;
  correoUsuario: string;
  rolSeleccionado: string;
  direccionIp: string;
  fechaInicio: string;
  fechaFin?: string;
  estadoConexion: 'ACTIVA' | 'CERRADA' | 'EXPIRADA' | 'INTENTO_FALLIDO';
  dispositivo: string;
}

export interface ConfiguracionGlobalDTO {
  nombreEmpresa: string;
  ruc: string;
  correoContacto: string;
  telefonoSoporte: string;
  bodegaPrincipal: string;
  notificarPorCorreo: boolean;
  notificarPorSms: boolean;
  modoMantenimiento: boolean;
  intervaloSincronizacionMinutos: number;
  versionSistema: string;
}
