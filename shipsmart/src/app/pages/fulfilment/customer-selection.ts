import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data';
import { FulfilmentCustomerInfo, FulfilmentService } from '../../services/fulfilment';

@Component({
  selector: 'app-customer-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-selection.html',
  styleUrl: './customer-selection.scss'
})
export class CustomerSelectionComponent {
  useExistingCustomer = true;
  selectedExistingCustomerId?: number;

  name = '';
  address = '';
  contactDetails = '';
  email = '';
  companyName = '';
  vatNo = '';
  discount?: number;
  reference = '';
  accountNumber = '';
  validationMessage = '';

  constructor(
    public dataService: DataService,
    private fulfilmentService: FulfilmentService,
    private router: Router
  ) {
    const customer = this.fulfilmentService.activeRequest()?.customer;
    if (!customer) {
      return;
    }

    this.useExistingCustomer = customer.mode === 'Existing';
    this.selectedExistingCustomerId = customer.existingCustomerId;
    this.name = customer.name;
    this.address = customer.address;
    this.contactDetails = customer.contactDetails;
    this.email = customer.email;
    this.companyName = customer.companyName ?? '';
    this.vatNo = customer.vatNo ?? '';
    this.discount = customer.discount;
    this.reference = customer.reference;
    this.accountNumber = customer.accountNumber;
  }

  onExistingCustomerChange(customerId: number | undefined): void {
    this.selectedExistingCustomerId = customerId;
    if (customerId === undefined) {
      return;
    }

    const selected = this.dataService.customers().find((customer) => customer.id === customerId);
    if (!selected) {
      return;
    }

    this.name = selected.name;
    this.address = selected.address;
    this.contactDetails = selected.phone;
    this.email = selected.email;
    this.validationMessage = '';
  }

  back(): void {
    this.router.navigate([
      this.fulfilmentService.getPreviousRoute('/fulfilment/customer-selection', {
        useExistingOrder: false,
      })
    ]);
  }

  next(): void {
    if (this.useExistingCustomer && this.selectedExistingCustomerId === undefined) {
      this.validationMessage = 'Select an existing customer before continuing.';
      return;
    }

    if (!this.name.trim() || !this.address.trim() || !this.contactDetails.trim() || !this.email.trim() || !this.reference.trim() || !this.accountNumber.trim()) {
      this.validationMessage = 'Complete all required customer fields before continuing.';
      return;
    }

    const customerInfo: FulfilmentCustomerInfo = {
      mode: this.useExistingCustomer ? 'Existing' : 'New',
      existingCustomerId: this.useExistingCustomer ? this.selectedExistingCustomerId : undefined,
      name: this.name.trim(),
      address: this.address.trim(),
      contactDetails: this.contactDetails.trim(),
      email: this.email.trim(),
      companyName: this.companyName.trim() || undefined,
      vatNo: this.vatNo.trim() || undefined,
      discount: this.discount !== undefined && this.discount !== null ? Number(this.discount) : undefined,
      reference: this.reference.trim(),
      accountNumber: this.accountNumber.trim(),
    };

    this.fulfilmentService.setCustomerInfo(customerInfo);
    this.router.navigate([
      this.fulfilmentService.getNextRoute('/fulfilment/customer-selection', {
        useExistingOrder: false,
      })
    ]);
  }
}