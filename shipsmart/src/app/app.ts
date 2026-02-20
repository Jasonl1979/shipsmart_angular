import { Component, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth';
import { ThemeService } from './services/theme';
import { HeaderComponent } from './components/header/header';
import { SidebarComponent } from './components/sidebar/sidebar';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ShipSmart');
  
  sidebarOpen = signal<boolean>(true);
  showLayout = signal<boolean>(false);

  constructor(
    protected authService: AuthService,
    protected themeService: ThemeService
  ) {
    // Show layout when user is logged in
    effect(() => {
      this.showLayout.set(this.authService.isLoggedIn());
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }
}

