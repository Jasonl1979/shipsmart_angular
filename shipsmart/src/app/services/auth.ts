import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export interface User {
  username: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly VALID_USERNAME = 'Admin';
  private readonly VALID_PASSWORD = 'admin';
  private platformId = inject(PLATFORM_ID);
  
  isLoggedIn = signal<boolean>(this.checkAuthState());
  currentUser = signal<User | null>(this.loadUser());

  constructor(private router: Router) {}

  private hasLocalStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(username: string, password: string): boolean {
    if (username === this.VALID_USERNAME && password === this.VALID_PASSWORD) {
      const user: User = { username, email: 'admin@shipsmart.com', role: 'admin' };
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
      if (this.hasLocalStorage()) {
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
      }
      return true;
    }
    return false;
  }

  register(username: string, email: string, password: string): boolean {
    console.log('Register currently disabled. Please implement PostgreSQL integration.');
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    if (this.hasLocalStorage()) {
      localStorage.removeItem('authUser');
      localStorage.removeItem('isLoggedIn');
    }
    this.router.navigate(['/login']);
  }

  private checkAuthState(): boolean {
    if (!this.hasLocalStorage()) return false;
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  private loadUser(): User | null {
    if (!this.hasLocalStorage()) return null;
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}
