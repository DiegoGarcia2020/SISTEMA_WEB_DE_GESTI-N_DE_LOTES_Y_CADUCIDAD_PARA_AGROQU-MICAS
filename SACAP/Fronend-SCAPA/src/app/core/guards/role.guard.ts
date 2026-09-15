import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * El catalogo seguridad.rol en BD quedo con filas duplicadas para el mismo rol de
 * negocio (ej. "TECNICO" y "Técnico de Campo" — ver comentario en SecurityConfig.java
 * del backend, que ya tolera ambas variantes en sus matchers). Sin esto, una cuenta
 * aprobada con la opcion "TECNICO" quedaba autenticada pero bloqueada de todo el
 * modulo de ventas, con un doble-redirect que terminaba pareciendo un logout.
 * Normaliza a una clave canonica antes de comparar, igual que ya hace el backend.
 */
const ALIAS_ROL: { [key: string]: string } = {
  'TECNICO': 'TECNICO DE CAMPO',
  'TECNICO_CAMPO': 'TECNICO DE CAMPO',
  'TÉCNICO DE CAMPO': 'TECNICO DE CAMPO',
  'TECNICO DE CAMPO': 'TECNICO DE CAMPO',
};

function normalizarRol(rol: string): string {
  const key = rol.toUpperCase();
  return ALIAS_ROL[key] || key;
}

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Array<string>;
  const currentRole = authService.currentRole();

  if (authService.isAuthenticated() && currentRole) {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    // Verificar por nombre exacto (normalizado) o si tiene ADMINISTRADOR (acceso global)
    const rolActualNormalizado = normalizarRol(currentRole);
    if (rolActualNormalizado === 'ADMINISTRADOR' || requiredRoles.some(r => normalizarRol(r) === rolActualNormalizado)) {
      return true;
    }
  }

  // Redirigir si no tiene permisos a su ruta por defecto o al login
  const defaultRoutes: { [key: string]: string } = {
    'BODEGUERO': '/admin/bodega/asignacion',
    'SUPERVISOR': '/admin/supervisor/dashboard',
    'TECNICO DE CAMPO': '/admin/ventas/dashboard',
    'ADMINISTRADOR': '/admin/dashboard'
  };
  const targetRoute = currentRole ? (defaultRoutes[normalizarRol(currentRole)] || '/admin/dashboard') : '/login';
  
  // Evitar bucle de redirección infinito si ya estamos intentando ir a su ruta por defecto y falla
  if (state.url !== targetRoute) {
    router.navigate([targetRoute]);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
