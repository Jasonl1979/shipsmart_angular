import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-manage-package',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-package.html',
  styleUrl: './manage-package.scss'
})
export class ManagePackageComponent {
  readonly packageOptions = ['P1', 'P2', 'P3'];
  readonly packageDetails: Record<string, { title: string; description: string; price: string; features: string[] }> = {
    P1: {
      title: 'Starter',
      description: 'Best for small teams starting with basic order and delivery workflows.',
      price: 'R299/month',
      features: ['Up to 500 shipments/month', 'Basic dashboard analytics', 'Email support'],
    },
    P2: {
      title: 'Growth',
      description: 'Ideal for scaling operations with richer analytics and automation support.',
      price: 'R699/month',
      features: ['Up to 5,000 shipments/month', 'Advanced reporting', 'Priority support'],
    },
    P3: {
      title: 'Enterprise',
      description: 'For high-volume organizations needing full control, integrations, and SLAs.',
      price: 'R1499/month',
      features: ['Unlimited shipments', 'Custom integrations', 'Dedicated account manager'],
    },
  };

  showCancelConfirm = false;
  cancelOutcomeMessage = '';

  constructor(public authService: AuthService, private router: Router) {}

  get currentPackage(): string {
    const selected = this.authService.getUserPackage();
    return selected && this.packageOptions.includes(selected) ? selected : this.packageOptions[0];
  }

  buyNow(packageName: string): void {
    if (!this.packageOptions.includes(packageName)) {
      return;
    }

    this.authService.setUserPackage(packageName);

    // Placeholder for future PayFast integration.
    console.log(`PayFast checkout placeholder for package: ${packageName}`);

    this.router.navigate(['/dashboard']);
  }

  promptCancelNow(): void {
    this.showCancelConfirm = true;
    this.cancelOutcomeMessage = '';
  }

  cancelCancelNow(): void {
    this.showCancelConfirm = false;
  }

  confirmCancelNow(): void {
    this.showCancelConfirm = false;

    const expiryRaw = this.authService.getExpiryDate();
    if (!expiryRaw) {
      this.cancelOutcomeMessage = 'Cancellation noted. Unable to determine remaining days from expiry date.';
      return;
    }

    const expiry = new Date(expiryRaw);
    if (Number.isNaN(expiry.getTime())) {
      this.cancelOutcomeMessage = 'Cancellation noted. Expiry date format is invalid.';
      return;
    }

    const now = new Date();
    const expiryDateOnly = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.max(0, Math.ceil((expiryDateOnly.getTime() - nowDateOnly.getTime()) / msPerDay));

    this.cancelOutcomeMessage = `Your app will still work for ${daysRemaining} day(s) based on your expiry date.`;
  }
}
