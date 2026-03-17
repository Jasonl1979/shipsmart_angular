import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CustomerWidgetComponent } from '../widgets/customer-widget/customer-widget';
import { OrdersWidgetComponent } from '../widgets/orders-widget/orders-widget';
import { ProductsWidgetComponent } from '../widgets/products-widget/products-widget';
import { AuthService } from '../../services/auth';
import { FulfilmentRequest, FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DragDropModule,
    CustomerWidgetComponent,
    OrdersWidgetComponent,
    ProductsWidgetComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  title = 'Dashboard';
  editMode = false;
  rowsToShow = 5;
  widgets: Array<'customers' | 'orders' | 'products' | 'fulfilment'> = ['customers', 'orders', 'products', 'fulfilment'];

  constructor(
    public authService: AuthService,
    public fulfilmentService: FulfilmentService
  ) {}

  get authToken(): string | null {
    return this.authService.getAuthToken();
  }

  get userPackage(): string | null {
    return this.authService.getUserPackage();
  }

  get showExpiredStandardMessage(): boolean {
    return this.authService.isAccessRestricted() && !this.authService.isAdminUser();
  }

  @ViewChildren('widgetItem', { read: ElementRef })
  widgetItems!: QueryList<ElementRef<HTMLElement>>;

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  setRowsToShow(value: string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      this.rowsToShow = Math.min(Math.max(Math.floor(parsed), 1), 20);
    }
  }

  get recentFulfilments(): FulfilmentRequest[] {
    return this.fulfilmentService.history().slice(0, this.rowsToShow);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  drop(event: CdkDragDrop<Array<'customers' | 'orders' | 'products' | 'fulfilment'>>): void {
    if (!this.editMode) {
      return;
    }

    const targetIndex = this.getDropIndex(event);
    moveItemInArray(this.widgets, event.previousIndex, targetIndex);
  }

  private getDropIndex(event: CdkDragDrop<Array<'customers' | 'orders' | 'products' | 'fulfilment'>>): number {
    const dropPoint = (event as { dropPoint?: { x: number; y: number } }).dropPoint;
    if (!dropPoint) {
      return event.currentIndex;
    }

    const items = this.widgetItems?.toArray().map((ref) => ref.nativeElement) ?? [];
    if (!items.length) {
      return event.currentIndex;
    }

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(dropPoint.x - centerX, dropPoint.y - centerY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  trackByWidget(index: number, widget: 'customers' | 'orders' | 'products' | 'fulfilment'): string {
    return widget;
  }
}
