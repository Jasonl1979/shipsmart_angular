import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-waybill-generation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waybill-generation.html',
  styleUrl: './waybill-generation.scss'
})
export class WaybillGenerationComponent {
  waybillCount = 1;
  courierIntegration: 'Use configured courier API' | 'Manual for now' = 'Use configured courier API';

  constructor(
    private router: Router,
    private fulfilmentService: FulfilmentService
  ) {
    const activeRequest = this.fulfilmentService.activeRequest();
    this.waybillCount = activeRequest?.waybillCount ?? 1;
    this.courierIntegration = activeRequest?.courierIntegration ?? 'Use configured courier API';
  }

  back(): void {
    this.router.navigate([
      this.fulfilmentService.getPreviousRoute('/fulfilment/waybill-generation', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }

  next(): void {
    this.fulfilmentService.setWaybillDetails(this.waybillCount, this.courierIntegration);
    this.fulfilmentService.setStatus('Waybill Generation');
    this.router.navigate([
      this.fulfilmentService.getNextRoute('/fulfilment/waybill-generation', {
        useExistingOrder: this.fulfilmentService.activeRequest()?.selectedExistingOrderId !== undefined,
      })
    ]);
  }
}
