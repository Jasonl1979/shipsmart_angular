import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ThemeService, ThemeMode } from '../../services/theme';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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
    public themeService: ThemeService
  ) {}

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
}
