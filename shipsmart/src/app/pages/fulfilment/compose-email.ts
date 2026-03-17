import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailStatus, FulfilmentEmail, FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-compose-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compose-email.html',
  styleUrl: './compose-email.scss'
})
export class ComposeEmailComponent {
  requestId = '';
  closeTo: 'history' | 'summary' = 'history';
  supplier = 'Custom Supplier Contact';
  subject = '';
  body = '';
  message = '';
  hasError = false;

  viewMode = false;
  viewEmail: FulfilmentEmail | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fulfilmentService: FulfilmentService
  ) {
    this.route.parent?.paramMap.subscribe((params) => {
      this.requestId = params.get('id') ?? '';
    });

    if (!this.requestId) {
      this.requestId = this.route.snapshot.paramMap.get('id')
        ?? this.route.parent?.snapshot.paramMap.get('id')
        ?? '';
    }

    this.route.queryParamMap.subscribe((queryParams) => {
      const queryRequestId = queryParams.get('requestId');
      if (queryRequestId) {
        this.requestId = queryRequestId;
      }

      this.closeTo = queryParams.get('closeTo') === 'summary' ? 'summary' : 'history';

      const viewEmailId = queryParams.get('viewEmailId');
      const rid = this.requestId || this.route.parent?.snapshot.paramMap.get('id') || '';
      if (viewEmailId && rid) {
        const req = this.fulfilmentService.getRequestById(rid);
        const email = req?.emails.find((e) => e.id === viewEmailId) ?? null;
        this.viewEmail = email;
        this.viewMode = !!email;
      } else {
        this.viewMode = false;
        this.viewEmail = null;
        this.subject = '';
        this.body = '';
        this.supplier = 'Custom Supplier Contact';
        this.message = '';
        this.hasError = false;
      }
    });
  }

  reply(): void {
    if (!this.viewEmail) return;
    this.viewMode = false;
    this.supplier = this.viewEmail.supplier;
    this.subject = `Re: ${this.viewEmail.subject}`;
    this.body = '';
    this.message = '';
    this.hasError = false;
  }

  forward(): void {
    if (!this.viewEmail) return;
    this.viewMode = false;
    this.supplier = this.viewEmail.supplier;
    this.subject = `Fwd: ${this.viewEmail.subject}`;
    this.body = `---------- Forwarded message ----------\n${this.viewEmail.body}`;
    this.message = '';
    this.hasError = false;
  }

  saveDraft(): void {
    this.createEmail('Draft', false);
  }

  sendEmail(): void {
    this.createEmail('Sent', true);
  }

  backToParent(): void {
    if (this.closeTo === 'summary') {
      this.router.navigate(['/fulfilment/order-summary']);
      return;
    }

    if (!this.requestId) {
      return;
    }

    this.router.navigate(['/fulfilment/history', this.requestId]);
  }

  canSendViewedEmail(): boolean {
    return this.closeTo === 'summary' && !!this.viewEmail && this.viewEmail.status === 'Draft';
  }

  sendViewedEmail(): void {
    if (!this.requestId || !this.viewEmail) {
      return;
    }

    this.fulfilmentService.resendEmail(this.requestId, this.viewEmail.id);
    this.backToParent();
  }

  private createEmail(status: EmailStatus, closeAfterSave: boolean): void {
    const trimmedSubject = this.subject.trim();
    const trimmedBody = this.body.trim();

    if (!this.requestId || !trimmedSubject || !trimmedBody) {
      this.hasError = true;
      this.message = 'Subject and body are required.';
      return;
    }

    const request = this.fulfilmentService.getRequestById(this.requestId);
    if (!request) {
      this.hasError = true;
      this.message = 'Unable to find fulfilment request.';
      return;
    }

    this.fulfilmentService.createNewEmail(this.requestId, trimmedSubject, trimmedBody, {
      supplier: this.supplier.trim() || 'Custom Supplier Contact',
      status,
    });

    if (closeAfterSave) {
      this.backToParent();
      return;
    }

    this.hasError = false;
    this.message = status === 'Draft' ? 'Email saved as draft.' : 'Email sent.';
    this.subject = '';
    this.body = '';
  }
}