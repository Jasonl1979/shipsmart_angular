import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer, Root2 } from '../../services/data';

interface EmailItem {
  subject: string;
  date: string;
  body: string;
}

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss'
})
export class CustomerDetailsComponent implements OnInit {
  customer: Root2 | null = null;
  fallbackCustomer: Customer | null = null;
  isLoading = true;
  error = '';
  notes = '';

  emails: EmailItem[] = [
    {
      subject: 'Welcome to ShipSmart',
      date: '2026-02-12',
      body: 'Thanks for signing up! Let us know if you need help getting started.'
    },
    {
      subject: 'Shipping rates updated',
      date: '2026-02-10',
      body: 'We updated our shipping rates for express deliveries.'
    },
    {
      subject: 'Invoice #SS-4012',
      date: '2026-02-08',
      body: 'Your invoice is attached. Please confirm receipt.'
    },
    {
      subject: 'Delivery scheduled',
      date: '2026-02-06',
      body: 'Your delivery is scheduled for Friday.'
    },
    {
      subject: 'Account check-in',
      date: '2026-02-04',
      body: 'Checking in to see how everything is going with your account.'
    },
    {
      subject: 'Promo: Packaging discounts',
      date: '2026-02-02',
      body: 'Enjoy discounted packaging supplies this week.'
    },
    {
      subject: 'Survey request',
      date: '2026-01-30',
      body: 'Please take a minute to rate your recent shipment.'
    }
  ];

  constructor(private route: ActivatedRoute, private customerService: CustomerService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      this.error = 'Invalid customer id.';
      this.isLoading = false;
      return;
    }

    this.loadCustomer(id);
  }

  private async loadCustomer(id: number): Promise<void> {
    this.isLoading = true;
    this.error = '';
    this.fallbackCustomer =
      this.customerService.customers().find((entry) => entry.id === id) ?? null;
    if (!this.fallbackCustomer) {
      this.error = 'Customer not found.';
    }
    this.isLoading = false;
  }

  get displayName(): string {
    return this.fallbackCustomer?.name ?? 'Customer';
  }
}
