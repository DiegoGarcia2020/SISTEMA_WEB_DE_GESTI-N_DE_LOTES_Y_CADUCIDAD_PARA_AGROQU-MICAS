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

  // Redirigir si no tiene permisos
  router.navigate(['/admin/usuarios']);
  return false;
};
