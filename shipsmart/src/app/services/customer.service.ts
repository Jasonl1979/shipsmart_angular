import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService, Customer, Root2 } from './data';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = environment.woopartnersApiUrl;

  constructor(private http: HttpClient, private dataService: DataService) {}

  // expose the shared customers signal from DataService for templates
  get customers() {
    return this.dataService.customers;
  }

  async loadAll(): Promise<Customer[]> {
    try {
      const data = await firstValueFrom(this.http.get<Root2[]>(`${this.apiUrl}`));
      const mapped = data.map((item) => this.mapWooCustomer(item));
      this.dataService.customers.set(mapped);
      return mapped;
    } catch (err) {
      // keep existing dummy data on error
      return this.dataService.customers();
    } 
  }

  private mapWooCustomer(item: Root2): Customer {
    const addressParts = [
      item.billing?.address_1,
      item.billing?.address_2,
      item.billing?.city,
      item.billing?.state,
      item.billing?.postcode,
      item.billing?.country,
    ].filter(Boolean);

    return {
      id: item.id,
      name: `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || item.username,
      email: item.email,
      phone: item.billing?.phone ?? '',
      address: addressParts.join(', '),
      status: item.is_paying_customer ? 'Active' : 'Inactive',
    };
  }

  getWooCustomerDetails(id: number): Promise<Root2> {
    return firstValueFrom(
      this.http.get<Root2>(`${this.apiUrl}/${id}`).pipe(
        timeout(8000),
        catchError((err) => throwError(() => err))
      )
    );
  }

  get(id: number) {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`);
  }

  create(payload: Partial<Customer>) {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, payload);
  }

  update(id: number, payload: Partial<Customer>) {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }
}
