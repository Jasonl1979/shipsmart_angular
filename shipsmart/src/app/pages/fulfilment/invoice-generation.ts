import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-invoice-generation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-generation.html',
  styleUrl: './invoice-generation.scss'
})
export class InvoiceGenerationComponent {
  invoiceMethod: 'Infinite invoices' | 'Excel upload template' | 'Accounting API' = 'Infinite invoices';

  constructor(
    private router: Router,
    private fulfilmentService: FulfilmentService
  ) {
    this.invoiceMethod = this.fulfilmentService.activeRequest()?.invoiceMethod ?? 'Infinite invoices';
  }

  back(): void {
    this.router.navigate([
      this.fulfilmentService.getPreviousRoute('/fulfilment/invoice-generation', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }

  next(): void {
    this.fulfilmentService.setInvoiceMethod(this.invoiceMethod);
    this.fulfilmentService.setStatus('Invoice Generation');
    this.router.navigate([
      this.fulfilmentService.getNextRoute('/fulfilment/invoice-generation', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }
}
