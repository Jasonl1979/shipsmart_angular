import { Injectable, signal } from '@angular/core';


//Added based on WooCommerce API response for customers endpoint, can be expanded with more fields as needed
export type Root = Root2[]

export interface Root2 {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  email: string
  first_name: string
  last_name: string
  role: string
  username: string
  billing: Billing
  shipping: Shipping
  is_paying_customer: boolean
  avatar_url: string
  meta_data: MetaDaum[]
  _links: Links
}

export interface Billing {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  postcode: string
  country: string
  state: string
  email: string
  phone: string
}

export interface Shipping {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  postcode: string
  country: string
  state: string
  phone: string
}

export interface MetaDaum {
  id: number
  key: string
  value: string
}

export interface Links {
  self: Self[]
  collection: Collection[]
}

export interface Self {
  href: string
  targetHints: TargetHints
}

export interface TargetHints {
  allow: string[]
}

export interface Collection {
  href: string
}
//end of WooCommerce API response types, can be expanded with more fields as needed

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  date: string;
  status: string;
  total: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  customers = signal<Customer[]>(this.getDummyCustomers());
  orders = signal<Order[]>(this.getDummyOrders());
  products = signal<Product[]>(this.getDummyProducts());

  private getDummyCustomers(): Customer[] {
    return [
      { id: 1, name: 'John Smith', email: 'john@example.com', phone: '555-1234', address: '123 Main St', status: 'Active' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com', phone: '555-5678', address: '456 Oak Ave', status: 'Active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-9012', address: '789 Pine Rd', status: 'Inactive' },
    ];
  }

  private getDummyOrders(): Order[] {
    return [
      { id: 1, orderNumber: 'ORD-2026-001', customerName: 'John Smith', date: '2026-02-15', status: 'Shipped', total: 250.00 },
      { id: 2, orderNumber: 'ORD-2026-002', customerName: 'Jane Doe', date: '2026-02-14', status: 'Processing', total: 150.50 },
      { id: 3, orderNumber: 'ORD-2026-003', customerName: 'Bob Johnson', date: '2026-02-13', status: 'Delivered', total: 320.00 },
    ];
  }

  private getDummyProducts(): Product[] {
    return [
      { id: 1, name: 'Shipping Label Printer', sku: 'SLP-001', category: 'Hardware', price: 299.99, stock: 15 },
      { id: 2, name: 'Thermal Sticker Roll', sku: 'TSR-100', category: 'Supplies', price: 49.99, stock: 250 },
      { id: 3, name: 'Packing Box', sku: 'PB-1000', category: 'Packaging', price: 2.50, stock: 5000 },
    ];
  }
}
