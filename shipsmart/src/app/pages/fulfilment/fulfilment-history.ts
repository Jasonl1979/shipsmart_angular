import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FulfilmentService, FulfilmentRequest, FulfilmentStatus } from '../../services/fulfilment';

@Component({
  selector: 'app-fulfilment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fulfilment-history.html',
  styleUrl: './fulfilment-history.scss'
})
export class FulfilmentHistoryComponent {
  readonly statuses: FulfilmentStatus[] = [
    'Draft',
    'Started',
    'Order Help',
    'Order Fulfilment',
    'Invoice Generation',
    'Waybill Generation',
    'Summary',
    'Completed',
  ];
  selectedStatuses = new Set<FulfilmentStatus>();
  sortDirection: 'desc' | 'asc' = 'desc';

  constructor(
    public fulfilmentService: FulfilmentService,
    private router: Router,
    private location: Location
  ) {}

  get history(): FulfilmentRequest[] {
    return this.fulfilmentService.history();
  }

  get filteredSortedHistory(): FulfilmentRequest[] {
    const filtered = this.history.filter((item) =>
      this.selectedStatuses.size ? this.selectedStatuses.has(item.status) : true
    );

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return this.sortDirection === 'desc' ? bTime - aTime : aTime - bTime;
    });
  }

  toggleStatus(status: FulfilmentStatus): void {
    if (this.selectedStatuses.has(status)) {
      this.selectedStatuses.delete(status);
      return;
    }

    this.selectedStatuses.add(status);
  }

  clearStatusFilters(): void {
    this.selectedStatuses.clear();
  }

  setSortDirection(value: string): void {
    this.sortDirection = value === 'asc' ? 'asc' : 'desc';
  }

  isStatusSelected(status: FulfilmentStatus): boolean {
    return this.selectedStatuses.has(status);
  }

  createRequest(): void {
    this.fulfilmentService.createNewRequest();

    this.fulfilmentService.setStatus('Started');
    this.router.navigate(['/fulfilment/order-help']);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  openHistory(event: Event, requestId: string): void {
    event.preventDefault();
    this.router.navigate(['/fulfilment/history', requestId]);
  }

  back(): void {
    this.location.back();
  }

  countByEmailStatus(item: FulfilmentRequest, status: 'Draft' | 'Sent'): number {
    return item.emails.filter((email) => email.status === status).length;
  }
}
