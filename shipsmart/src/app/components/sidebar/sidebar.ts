import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  isOpen = input<boolean>(true);

  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Customers', icon: '👥', route: '/customers' },
    { label: 'Orders', icon: '📦', route: '/orders' },
    { label: 'Products', icon: '🏷️', route: '/products' },
    { label: 'Settings', icon: '⚙️', route: '/settings' }
  ];
}
