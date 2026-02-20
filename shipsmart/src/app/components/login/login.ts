import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @ViewChild('usernameInput') usernameInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  error = signal<string>('');
  isLoading = signal<boolean>(false);
  showForgotPassword = signal<boolean>(false);
  showRegister = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.error.set('');
    const username = this.usernameInput.nativeElement.value;
    const password = this.passwordInput.nativeElement.value;

    if (!username || !password) {
      this.error.set('Please enter both username and password');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      const success = this.authService.login(username, password);
      this.isLoading.set(false);
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('Invalid username or password. Try Admin/admin');
      }
    }, 500);
  }

  toggleForgotPassword(): void {
    this.showForgotPassword.update(v => !v);
    this.showRegister.set(false);
  }

  toggleRegister(): void {
    this.showRegister.update(v => !v);
    this.showForgotPassword.set(false);
  }
}

