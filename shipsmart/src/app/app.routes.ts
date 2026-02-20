import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegisterComponent } from './components/register/register';
import { SettingsComponent } from './components/settings/settings';
import { UserAccountComponent } from './pages/user-account/user-account';
import { CustomersComponent } from './pages/customers/customers';
import { CustomerDetailsComponent } from './pages/customer-details/customer-details';
import { OrdersComponent } from './pages/orders/orders';
import { ProductsComponent } from './pages/products/products';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [authGuard] },
  { path: 'customers/:id', component: CustomerDetailsComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'user-account', component: UserAccountComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
