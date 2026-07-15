export interface SolicitudRegistroDTO {
  idSolicitud?: number;
  correo: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono?: string;
  departamento?: string;
  cargo?: string;
  fechaSolicitud?: string;
  idEstado?: number; // 1 = PENDIENTE, 2 = APROBADA, 3 = RECHAZADA
  motivoRechazo?: string;
}

export interface ProcesarSolicitudDTO {
  aprobar: boolean;
  idRoles?: number[];
  motivoRechazo?: string;
}
