import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CustomerWidgetComponent } from '../widgets/customer-widget/customer-widget';
import { OrdersWidgetComponent } from '../widgets/orders-widget/orders-widget';
import { ProductsWidgetComponent } from '../widgets/products-widget/products-widget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
  widgets: Array<'customers' | 'orders' | 'products'> = ['customers', 'orders', 'products'];

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

  drop(event: CdkDragDrop<Array<'customers' | 'orders' | 'products'>>): void {
    if (!this.editMode) {
      return;
    }

    const targetIndex = this.getDropIndex(event);
    moveItemInArray(this.widgets, event.previousIndex, targetIndex);
  }

  private getDropIndex(event: CdkDragDrop<Array<'customers' | 'orders' | 'products'>>): number {
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

  trackByWidget(index: number, widget: 'customers' | 'orders' | 'products'): string {
    return widget;
  }
}
