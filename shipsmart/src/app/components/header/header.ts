import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService, ThemeMode } from '../../services/theme';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  sidebarOpen = input<boolean>(true);
  toggleSidebar = output<void>();
  
  showUserMenu = false;
  showSettingsMenu = false;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  get userPackage(): string | null {
    return this.authService.getUserPackage();
  }

  get expiryDate(): string | null {
    const raw = this.authService.getExpiryDate();
    if (!raw) {
      return null;
    }

    return raw.includes('T') ? raw.split('T')[0] : raw;
  }

  get company(): string | null {
    return this.authService.currentUser()?.company ?? null;
  }

  get isAdmin(): boolean {
    return (this.authService.currentUser()?.role ?? '').toLowerCase() === 'admin';
  }

  get isAccessRestricted(): boolean {
    return this.authService.isAccessRestricted();
  }

  get canManagePackage(): boolean {
    return this.isAdmin;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showSettingsMenu = false;
  }

  toggleSettingsMenu(): void {
    this.showSettingsMenu = !this.showSettingsMenu;
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
  }

  setTheme(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
    this.showSettingsMenu = false;
  }

  openManagePackage(): void {
    this.showSettingsMenu = false;
    this.router.navigate(['/manage-package']);
  }

  openEditCompanyDetails(): void {
    if (this.isAccessRestricted) {
      return;
    }

    this.showSettingsMenu = false;
    this.router.navigate(['/edit-company-details']);
  }
}
