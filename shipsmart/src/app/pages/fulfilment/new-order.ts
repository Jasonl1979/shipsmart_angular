import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data';
import { FulfilmentService, NewOrderCustomProduct } from '../../services/fulfilment';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-order.html',
  styleUrl: './new-order.scss'
})
export class NewOrderComponent {
  addedProductIds: number[] = [];
  customProducts: NewOrderCustomProduct[] = [];
  customProductName = '';
  customProductQuantity = 1;
  customProductPrice = 0;
  orderType: 'Service' | 'Product' = 'Product';

  constructor(
    public dataService: DataService,
    private fulfilmentService: FulfilmentService,
    private router: Router
  ) {
    const active = this.fulfilmentService.activeRequest();
    this.addedProductIds = [...(active?.newOrderProductIds ?? [])];
    this.customProducts = [...(active?.newOrderCustomProducts ?? [])];
    this.orderType = active?.orderType ?? 'Product';
  }

  get itemLabel(): string {
    return this.orderType === 'Service' ? 'service' : 'product';
  }

  get itemLabelPlural(): string {
    return this.orderType === 'Service' ? 'services' : 'products';
  }

  get itemLabelTitle(): string {
    return this.orderType === 'Service' ? 'Service' : 'Product';
  }

  addExistingProduct(productId: number): void {
    if (this.addedProductIds.includes(productId)) {
      return;
    }

    this.addedProductIds = [...this.addedProductIds, productId];
  }

  removeExistingProduct(productId: number): void {
    this.addedProductIds = this.addedProductIds.filter((id) => id !== productId);
  }

  onExistingProductChecked(productId: number, checked: boolean): void {
    if (checked) {
      this.addExistingProduct(productId);
      return;
    }

    this.removeExistingProduct(productId);
  }

  isExistingProductAdded(productId: number): boolean {
    return this.addedProductIds.includes(productId);
  }

  getProductNameById(productId: number): string {
    return this.dataService.products().find((product) => product.id === productId)?.name ?? String(productId);
  }

  addCustomProduct(): void {
    const name = this.customProductName.trim();
    if (!name) {
      return;
    }

    this.customProducts = [
      ...this.customProducts,
      {
        name,
        quantity: Math.max(1, Math.floor(this.customProductQuantity || 1)),
        price: Math.max(0, Number(this.customProductPrice) || 0),
      },
    ];

    this.customProductName = '';
    this.customProductQuantity = 1;
    this.customProductPrice = 0;
  }

  removeCustomProduct(index: number): void {
    this.customProducts = this.customProducts.filter((_, currentIndex) => currentIndex !== index);
  }

  back(): void {
    this.router.navigate([
      this.fulfilmentService.getPreviousRoute('/fulfilment/new-order', {
        useExistingOrder: false,
      })
    ]);
  }

  next(): void {
    this.fulfilmentService.setNewOrderProducts(this.addedProductIds, this.customProducts);
    this.fulfilmentService.setStatus('Order Fulfilment');
    this.router.navigate([
      this.fulfilmentService.getNextRoute('/fulfilment/new-order', {
        useExistingOrder: false,
      })
    ]);
  }
}
