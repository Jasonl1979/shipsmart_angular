import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  if (authService.isAccessRestricted() && !state.url.startsWith('/manage-package')) {
    if (authService.isAdminUser()) {
      return router.parseUrl('/manage-package');
    }

    if (!state.url.startsWith('/dashboard')) {
      return router.parseUrl('/dashboard');
    }
  }

  if (authService.isAccessRestricted() && !authService.isAdminUser() && state.url.startsWith('/manage-package')) {
    return router.parseUrl('/dashboard');
  }

  return true;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is already logged in, redirect to dashboard
  if (authService.isLoggedIn()) {
    if (authService.isAccessRestricted()) {
      return router.parseUrl(authService.isAdminUser() ? '/manage-package' : '/dashboard');
    }

    return router.parseUrl('/dashboard');
  }

  return true;
};
