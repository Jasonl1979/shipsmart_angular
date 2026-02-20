import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-widget.html',
  styleUrl: './customer-widget.scss'
})
export class CustomerWidgetComponent {
  @Input() rowsToShow = 5;

  constructor(public customerService: CustomerService) {
    // attempt to load fresh data when widget initializes (falls back to dummy data)
    this.customerService.loadAll().catch(() => {});
  }
}
