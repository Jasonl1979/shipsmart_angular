import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  isOpen = input<boolean>(true);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Customers', icon: '👥', route: '/customers' },
    { label: 'Orders', icon: '📦', route: '/orders' },
    { label: 'Fulfilment', icon: '🚚', route: '/fulfilment' },
    { label: 'Products', icon: '🏷️', route: '/products' },
    { label: 'Settings', icon: '⚙️', route: '/settings' }
  ];

  constructor(private authService: AuthService) {}

  get displayedMenuItems(): Array<MenuItem & { disabled: boolean }> {
    if (!this.authService.isAccessRestricted()) {
      return this.menuItems.map((item) => ({ ...item, disabled: false }));
    }

    if (!this.authService.isAdminUser()) {
      return this.menuItems.map((item) => ({
        ...item,
        disabled: item.route !== '/dashboard',
      }));
    }

    return [
      ...this.menuItems.map((item) => ({ ...item, disabled: true })),
      { label: 'Manage Package', icon: '📦', route: '/manage-package', disabled: false },
    ];
  }
}
