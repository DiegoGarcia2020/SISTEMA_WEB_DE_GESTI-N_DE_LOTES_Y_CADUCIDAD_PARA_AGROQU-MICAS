export type UserRole = 'Administrador' | 'Supervisor' | 'Bodeguero' | 'Técnico de Campo' | 'Proveedor' | 'Gerente' | string;

export interface UsuarioDTO {
  idUsuario: number;
  correo: string;
  idEstado: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  roles: string[];
  idRoles: number[];
  // Campos extra opcionales para la interfaz y vista
  nombre?: string;
  cedula?: string;
  licencia?: string;
  telefono?: string;
  ciudad?: string;
  turno?: string;
  ultimoAcceso?: string;
}

export interface CreateUsuarioDTO {
  correo: string;
  contrasena?: string;
  idEstado: number;
  idRoles: number[];
}

export interface RolDTO {
  idRol: number;
  nombre: string;
}
