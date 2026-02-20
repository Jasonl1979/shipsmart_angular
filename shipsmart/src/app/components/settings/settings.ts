import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(public themeService: ThemeService) {
    this.themeMode = this.themeService.themeMode();
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.themeMode = mode;
  }
}
