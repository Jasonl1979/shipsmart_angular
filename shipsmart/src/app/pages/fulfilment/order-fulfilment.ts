import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, Product } from '../../services/data';
import { FulfilmentService, NewOrderCustomProduct } from '../../services/fulfilment';

@Component({
  selector: 'app-order-fulfilment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-fulfilment.html',
  styleUrl: './order-fulfilment.scss'
})
export class OrderFulfilmentComponent {
  useExistingOrder = true;
  selectedOrderId?: number;
  newOrderNumber = '';
  orderType: 'Service' | 'Product' = 'Product';
  requiresSupplies = false;
  callSupplierApi = false;
  generateSupplierDraftEmail = true;

  constructor(
    public dataService: DataService,
    private fulfilmentService: FulfilmentService,
    private router: Router
  ) {
    const active = this.fulfilmentService.activeRequest();
    if (!active) {
      return;
    }

    this.useExistingOrder = active.selectedExistingOrderId !== undefined || !active.newOrderNumber;
    this.selectedOrderId = active.selectedExistingOrderId;
    this.newOrderNumber = active.newOrderNumber ?? '';
    this.orderType = active.orderType ?? 'Product';
    this.requiresSupplies = !!active.requiresSupplies;
    this.callSupplierApi = active.supplierApiRequested;
    this.generateSupplierDraftEmail = active.generateSupplierDraftEmail;
  }

  back(): void {
    this.router.navigate([this.fulfilmentService.getPreviousRoute('/fulfilment/order-fulfilment')]);
  }

  get addedExistingProducts(): Product[] {
    const ids = this.fulfilmentService.activeRequest()?.newOrderProductIds ?? [];
    return this.dataService.products().filter((product) => ids.includes(product.id));
  }

  get addedCustomProducts(): NewOrderCustomProduct[] {
    return this.fulfilmentService.activeRequest()?.newOrderCustomProducts ?? [];
  }

  removeExistingProduct(productId: number): void {
    const request = this.fulfilmentService.activeRequest();
    if (!request) {
      return;
    }

    const remainingIds = (request.newOrderProductIds ?? []).filter((id) => id !== productId);
    const custom = request.newOrderCustomProducts ?? [];
    this.fulfilmentService.setNewOrderProducts(remainingIds, custom);
  }

  removeCustomProduct(index: number): void {
    const request = this.fulfilmentService.activeRequest();
    if (!request) {
      return;
    }

    const existingIds = request.newOrderProductIds ?? [];
    const remainingCustom = (request.newOrderCustomProducts ?? []).filter((_, currentIndex) => currentIndex !== index);
    this.fulfilmentService.setNewOrderProducts(existingIds, remainingCustom);
  }

  next(): void {
    this.fulfilmentService.setOrderInfo({
      selectedExistingOrderId: this.useExistingOrder ? this.selectedOrderId : undefined,
      newOrderNumber: this.useExistingOrder ? undefined : this.newOrderNumber,
      orderType: this.orderType,
      requiresSupplies: this.requiresSupplies,
      supplierApiRequested: this.callSupplierApi,
      generateSupplierDraftEmail: this.generateSupplierDraftEmail,
    });

    this.fulfilmentService.setStatus('Order Fulfilment');
    this.router.navigate([
      this.fulfilmentService.getNextRoute('/fulfilment/order-fulfilment', {
        useExistingOrder: this.useExistingOrder,
      })
    ]);
  }
}
