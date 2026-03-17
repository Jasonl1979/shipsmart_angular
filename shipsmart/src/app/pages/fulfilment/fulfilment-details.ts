import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FulfilmentRequest, FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-fulfilment-details',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './fulfilment-details.html',
  styleUrl: './fulfilment-details.scss'
})
export class FulfilmentDetailsComponent {
  requestId = '';
  selectedEmailId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fulfilmentService: FulfilmentService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.requestId = params.get('id') ?? '';
    });
  }

  get request(): FulfilmentRequest | undefined {
    return this.requestId ? this.fulfilmentService.getRequestById(this.requestId) : undefined;
  }

  back(): void {
    this.router.navigate(['/fulfilment']);
  }

  resendEmail(emailId: string): void {
    if (!this.request) {
      return;
    }

    this.fulfilmentService.resendEmail(this.request.id, emailId);
  }

  markReceived(emailId: string): void {
    if (!this.request) {
      return;
    }

    this.fulfilmentService.markEmailReceived(this.request.id, emailId);
  }

  openOrderWizard(): void {
    if (!this.request) {
      return;
    }

    const activated = this.fulfilmentService.setActiveRequestById(this.request.id);
    if (!activated) {
      return;
    }

    this.fulfilmentService.setStatus('Order Fulfilment');
    this.router.navigate(['/fulfilment/order-fulfilment']);
  }

  openWaybillWizard(): void {
    if (!this.request) {
      return;
    }

    const activated = this.fulfilmentService.setActiveRequestById(this.request.id);
    if (!activated) {
      return;
    }

    this.fulfilmentService.setStatus('Waybill Generation');
    this.router.navigate(['/fulfilment/waybill-generation']);
  }

  openInvoiceWizard(): void {
    if (!this.request) {
      return;
    }

    const activated = this.fulfilmentService.setActiveRequestById(this.request.id);
    if (!activated) {
      return;
    }

    this.fulfilmentService.setStatus('Invoice Generation');
    this.router.navigate(['/fulfilment/invoice-generation']);
  }

  openComposeEmailPage(): void {
    if (!this.request) {
      return;
    }

    this.router.navigate(['/fulfilment/history', this.request.id, 'compose-email']);
  }

  openViewEmailPage(emailId: string): void {
    if (!this.request) {
      return;
    }

    this.router.navigate(
      ['/fulfilment/history', this.request.id, 'compose-email'],
      { queryParams: { viewEmailId: emailId } }
    );
  }

  isComposeEmailOpen(): boolean {
    return this.router.url.includes('/compose-email');
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }
}
