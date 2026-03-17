import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-edit-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-company-details.html',
  styleUrl: './edit-company-details.scss'
})
export class EditCompanyDetailsComponent {
  companyName = '';
  companyEmail = '';
  statusMessage = '';

  constructor(private authService: AuthService) {
    this.companyName = this.authService.currentUser()?.company ?? '';
    this.companyEmail = this.authService.currentUser()?.email ?? '';
  }

  saveCompanyDetails(): void {
    const company = this.companyName.trim();
    const email = this.companyEmail.trim();

    if (!company || !email) {
      this.statusMessage = 'Company name and email are required.';
      return;
    }

    this.authService.setCompanyDetails(company, email);
    this.statusMessage = 'Company details updated.';
  }
}
