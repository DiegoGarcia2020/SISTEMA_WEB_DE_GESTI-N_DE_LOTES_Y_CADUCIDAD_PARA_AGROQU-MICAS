import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Array<string>;
  const currentRole = authService.currentRole();

  if (authService.isAuthenticated() && currentRole) {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    // Verificar por nombre exacto o si tiene ADMINISTRADOR (acceso global)
    if (currentRole.toUpperCase() === 'ADMINISTRADOR' || requiredRoles.some(r => r.toUpperCase() === currentRole.toUpperCase())) {
      return true;
    }
  }

  // Redirigir si no tiene permisos a su ruta por defecto o al login
  const defaultRoutes: { [key: string]: string } = {
    'PROVEEDOR': '/admin/inventario/pre-registro',
    'BODEGUERO': '/admin/inventario/recepcion',
    'SUPERVISOR': '/admin/alertas',
    'ADMINISTRADOR': '/admin/dashboard'
  };
  const targetRoute = currentRole ? (defaultRoutes[currentRole.toUpperCase()] || '/admin/dashboard') : '/login';
  
  // Evitar bucle de redirección infinito si ya estamos intentando ir a su ruta por defecto y falla
  if (state.url !== targetRoute) {
    router.navigate([targetRoute]);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
