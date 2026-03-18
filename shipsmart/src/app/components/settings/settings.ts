import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService, ThemeMode } from '../../services/theme';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent {
  themeMode: ThemeMode = 'system';

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private authService: AuthService
  ) {
    this.themeMode = this.themeService.themeMode();
  }

  get isAdmin(): boolean {
    return (this.authService.currentUser()?.role ?? '').toLowerCase() === 'admin';
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.themeMode = mode;
  }

  openManageCompany(): void {
    this.router.navigate(['/edit-company-details']);
  }

  openManagePackage(): void {
    this.router.navigate(['/manage-package']);
  }

  openManageConfig(): void {
    this.router.navigate(['/manage-config']);
  }
}
