import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { FulfilmentEmail, FulfilmentService, WorkflowStepDefinition, WorkflowStepKey } from '../../services/fulfilment';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss'
})
export class OrderSummaryComponent {
  sendEmailsNow = false;

  constructor(
    public fulfilmentService: FulfilmentService,
    private router: Router
  ) {}

  back(): void {
    this.router.navigate([
      this.fulfilmentService.getPreviousRoute('/fulfilment/order-summary', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }

  get draftEmails(): FulfilmentEmail[] {
    const request = this.fulfilmentService.activeRequest();
    if (!request) {
      return [];
    }

    return request.emails.filter((email) => email.status === 'Draft');
  }

  openDraftEmail(emailId: string): void {
    const request = this.fulfilmentService.activeRequest();
    if (!request) {
      return;
    }

    this.router.navigate(['/fulfilment/order-summary', 'compose-email'], {
      queryParams: {
        viewEmailId: emailId,
        requestId: request.id,
        closeTo: 'summary',
      },
    });
  }

  isComposeEmailOpen(): boolean {
    return this.router.url.includes('/compose-email');
  }

  get selectedWorkflowSteps(): WorkflowStepDefinition[] {
    return this.fulfilmentService.getSelectedWorkflowSteps();
  }

  get selectedWorkflowLabels(): string[] {
    const labels: string[] = ['Order Fulfilment'];

    if (this.isNewOrderFlow) {
      labels.push('New Order');
    }

    labels.push(...this.selectedWorkflowSteps.map((step) => step.label));
    return labels;
  }

  get isNewOrderFlow(): boolean {
    return this.fulfilmentService.activeRequest()?.selectedExistingOrderId === undefined;
  }

  isWorkflowStepSelected(step: WorkflowStepKey): boolean {
    return this.fulfilmentService.isWorkflowStepSelected(step);
  }

  get newOrderItemCount(): number {
    const request = this.fulfilmentService.activeRequest();
    if (!request) {
      return 0;
    }

    return (request.newOrderProductIds?.length ?? 0) + (request.newOrderCustomProducts?.length ?? 0);
  }

  accept(): void {
    this.fulfilmentService.setStatus('Summary');
    this.fulfilmentService.runProcess(this.sendEmailsNow);
    this.router.navigate(['/fulfilment']);
  }
}
