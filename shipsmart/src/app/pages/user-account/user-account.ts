import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-account.html',
  styleUrl: './user-account.scss'
})
export class UserAccountComponent {
  constructor(public authService: AuthService) {}
}
