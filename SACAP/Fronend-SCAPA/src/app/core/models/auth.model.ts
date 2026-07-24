export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface UsuarioInfo {
  idUsuario: number;
  correo: string;
  requiereCambioClave?: boolean;
}

export interface AuthResponse {
  token: string;
  tipoFase: 'PRE_AUTH' | 'FINAL';
  rolesDisponibles?: string[];
  usuario: UsuarioInfo;
}

export interface RoleSelectionRequest {
  rolSeleccionado: string;
}

export interface CambioContrasenaRequest {
  nuevaContrasena: string;
}

