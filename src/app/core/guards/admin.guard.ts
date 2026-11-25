import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Solo permite el acceso si el usuario está autenticado Y es administrador.
 * Redirige a /login si no está autenticado, o a /dashboard si no es admin.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
