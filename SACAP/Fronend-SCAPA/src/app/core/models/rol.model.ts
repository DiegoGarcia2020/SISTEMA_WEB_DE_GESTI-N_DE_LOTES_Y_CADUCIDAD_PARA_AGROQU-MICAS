export interface RolDTO {
  idRol: number;
  nombre: string;
  idEstado: number;
  idRolBd?: number;
  rolBD?: RolBDDTO;
  descripcion?: string;
  totalUsuarios?: number;
  privilegios?: PrivilegioDTO[];
}

export interface RolBDDTO {
  idRolBd: number;
  nombreRolBd: string;
  descripcion?: string;
  activo: boolean;
}

export interface TipoObjetoDTO {
  idTipoObjeto: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface PrivilegioDTO {
  idPrivilegio: number;
  nombre: string;
  accion: string;
  activo: boolean;
  idTipoObjeto?: number;
  tipoObjeto?: TipoObjetoDTO;
  esquema?: string;
  nombreTabla?: string;
}

export interface RolPrivilegioDTO {
  idRolPrivilegio: number;
  rol: RolDTO;
  privilegio: PrivilegioDTO;
}

export interface TablaPrivilegiosDTO {
  nombreTabla: string;
  privilegios: PrivilegioDTO[];
}

export interface EsquemaPrivilegiosDTO {
  esquema: string;
  tablas: TablaPrivilegiosDTO[];
}
