import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  username: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiUrl = environment.authApiUrl;
  private platformId = inject(PLATFORM_ID);

  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  constructor(private router: Router, private http: HttpClient) {
    this.clearPersistedAuthState();
  }

  private hasLocalStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async login(username: string, password: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post(this.authApiUrl, {
          email: username,
          password,
        }, {
          responseType: 'text',
        })
      );

      const role = this.getRoleFromAuthResponse(response);
      if (!role) {
        return 'false';
      }
      const user: User = {
        username,
        email: username,
        role,
      };

      this.currentUser.set(user);
      this.isLoggedIn.set(true);
      if (this.hasLocalStorage()) {
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
      }

      return role;
    } catch {
      return 'false';
    }
  }

  private getRoleFromAuthResponse(response: unknown): 'admin' | 'standard' | null {
    if (response === false || response === null || response === undefined) {
      return null;
    }

    if (typeof response === 'string') {
      const normalized = response.trim().toLowerCase();
      if (normalized === 'admin' || normalized === 'standard') {
        return normalized;
      }

      if (normalized === 'false' || normalized === 'fasle') {
        return null;
      }   
    }
    return null;
  }

  register(username: string, email: string, password: string): boolean {
    console.log('Register currently disabled. Please implement PostgreSQL integration.');
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.clearPersistedAuthState();
    this.router.navigate(['/login']);
  }

  private clearPersistedAuthState(): void {
    if (!this.hasLocalStorage()) {
      return;
    }

    localStorage.removeItem('authUser');
    localStorage.removeItem('isLoggedIn');
  }
}
