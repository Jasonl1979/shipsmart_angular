import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})
export class CustomersComponent implements OnInit {
  constructor(public customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.loadAll();  
  }
}
