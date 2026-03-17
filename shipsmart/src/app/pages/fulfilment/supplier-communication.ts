import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FulfilmentEmail, FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-supplier-communication',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-communication.html',
  styleUrl: './supplier-communication.scss'
})
export class SupplierCommunicationComponent {
  selectedEmailId: string | null = null;

  constructor(
    public fulfilmentService: FulfilmentService,
    private router: Router
  ) {}

  toggleEmail(email: FulfilmentEmail): void {
    this.selectedEmailId = this.selectedEmailId === email.id ? null : email.id;
  }

  isSelected(email: FulfilmentEmail): boolean {
    return this.selectedEmailId === email.id;
  }

  back(): void {
    this.router.navigate([
      this.fulfilmentService.getPreviousRoute('/fulfilment/supplier-communication', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }

  next(): void {
    this.router.navigate([
      this.fulfilmentService.getNextRoute('/fulfilment/supplier-communication', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }
}
