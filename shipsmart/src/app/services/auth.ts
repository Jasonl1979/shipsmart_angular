import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  username: string;
  email?: string;
  role?: string;
  company?: string;
}

export interface AuthLoginResponse {
  token?: string;
  package?: string;
  expiryDate?: string;
  expirydate?: string;
  company?: string;
  email?: string;
  user?: string;
  resultset?: Partial<AuthLoginResponse>;
  result: string;
  role: string;
}

export interface AuthSession {
  token: string;
  package: string | null;
  expiryDate: string | null;
}

type AuthLoginErrorKind = 'network' | 'http' | 'unknown';

interface AuthLoginErrorInfo {
  kind: AuthLoginErrorKind;
  message: string;
  status?: number;
  details?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiUrl = environment.authApiUrl;

  private platformId = inject(PLATFORM_ID);

  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  authSession = signal<AuthSession | null>(null);
  packageSelectedAfterExpiry = signal<boolean>(false);

  constructor(private router: Router, private http: HttpClient) {
    this.clearPersistedAuthState();
  }

  private hasLocalStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async login(username: string, password: string): Promise<AuthLoginResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthLoginResponse>(this.authApiUrl, {
          username: username,
          //email: username,
          password: password,
        })
      );

      const payload = this.getPayload(response);

      if (payload?.result && payload.result !== 'false') {
        const token = payload.token ?? payload.result;
        const packageName = payload.package ?? null;
        const expiryDate = payload.expiryDate ?? payload.expirydate ?? this.getExpiryFromToken(token);
        const user: User = {
          username: payload.user ?? username,
          email: payload.email,
          role: payload.role,
          company: payload.company,
        };

        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        this.packageSelectedAfterExpiry.set(false);
        this.authSession.set({ token, package: packageName, expiryDate });
      }

      return response;
    } catch (error: unknown) {      
      console.error('Auth login failed:', error);
      return null;
    }
  }

  
  register(username: string, email: string, password: string): boolean {
    console.log('Register currently disabled. Please implement PostgreSQL integration.');
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.authSession.set(null);
    this.packageSelectedAfterExpiry.set(false);
    this.clearPersistedAuthState();
    this.router.navigate(['/login']);
  }

  getAuthToken(): string | null {
    return this.authSession()?.token ?? null;
  }

  getUserPackage(): string | null {
    return this.authSession()?.package ?? null;
  }

  getExpiryDate(): string | null {
    const session = this.authSession();
    if (!session) {
      return null;
    }

    return session.expiryDate ?? this.getExpiryFromToken(session.token);
  }

  isAdminUser(): boolean {
    return (this.currentUser()?.role ?? '').toLowerCase() === 'admin';
  }

  isAccessRestricted(): boolean {
    if (!this.isLoggedIn()) {
      return false;
    }

    if (this.packageSelectedAfterExpiry()) {
      return false;
    }

    const expiry = this.getExpiryDate();
    if (!expiry) {
      return false;
    }

    const expiryTime = new Date(expiry).getTime();
    if (Number.isNaN(expiryTime)) {
      return false;
    }

    return Date.now() > expiryTime;
  }

  private getPayload(response: AuthLoginResponse): AuthLoginResponse {
    const nested = response.resultset;
    if (nested && typeof nested === 'object' && typeof nested.result === 'string') {
      return {
        ...response,
        ...nested,
      } as AuthLoginResponse;
    }

    return response;
  }

  private getExpiryFromToken(token: string): string | null {
    try {
      if (typeof atob !== 'function') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number | string };
      const exp = payload.exp;

      if (typeof exp === 'number' && Number.isFinite(exp)) {
        return new Date(exp * 1000).toISOString();
      }

      if (typeof exp === 'string') {
        const parsed = Number(exp);
        if (Number.isFinite(parsed)) {
          return new Date(parsed * 1000).toISOString();
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  setUserPackage(packageName: string): void {
    const session = this.authSession();
    if (!session) {
      return;
    }

    this.authSession.set({
      ...session,
      package: packageName,
    });

    if (packageName) {
      this.packageSelectedAfterExpiry.set(true);
    }
  }

  setCompanyDetails(company: string, email: string): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }

    this.currentUser.set({
      ...user,
      company,
      email,
    });
  }

  private clearPersistedAuthState(): void {
    if (!this.hasLocalStorage()) {
      return;
    }

    localStorage.removeItem('authUser');
    localStorage.removeItem('isLoggedIn');
  }
}
