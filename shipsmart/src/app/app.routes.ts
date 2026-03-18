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
import { ManageConfigComponent } from './pages/manage-config/manage-config';
import { ManagePackageComponent } from './pages/manage-package/manage-package';
import { EditCompanyDetailsComponent } from './pages/edit-company-details/edit-company-details';
import { FulfilmentHistoryComponent } from './pages/fulfilment/fulfilment-history';
import { OrderHelpComponent } from './pages/fulfilment/order-help';
import { OrderFulfilmentComponent } from './pages/fulfilment/order-fulfilment';
import { CustomerSelectionComponent } from './pages/fulfilment/customer-selection';
import { NewOrderComponent } from './pages/fulfilment/new-order';
import { SupplierCommunicationComponent } from './pages/fulfilment/supplier-communication';
import { InvoiceGenerationComponent } from './pages/fulfilment/invoice-generation';
import { WaybillGenerationComponent } from './pages/fulfilment/waybill-generation';
import { OrderSummaryComponent } from './pages/fulfilment/order-summary';
import { FulfilmentDetailsComponent } from './pages/fulfilment/fulfilment-details';
import { ComposeEmailComponent } from './pages/fulfilment/compose-email';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [authGuard] },
  { path: 'customers/:id', component: CustomerDetailsComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'fulfilment', component: FulfilmentHistoryComponent, canActivate: [authGuard] },
  { path: 'fulfilment/order-help', component: OrderHelpComponent, canActivate: [authGuard] },
  { path: 'fulfilment/order-fulfilment', component: OrderFulfilmentComponent, canActivate: [authGuard] },
  { path: 'fulfilment/customer-selection', component: CustomerSelectionComponent, canActivate: [authGuard] },
  { path: 'fulfilment/new-order', component: NewOrderComponent, canActivate: [authGuard] },
  { path: 'fulfilment/supplier-communication', component: SupplierCommunicationComponent, canActivate: [authGuard] },
  { path: 'fulfilment/invoice-generation', component: InvoiceGenerationComponent, canActivate: [authGuard] },
  { path: 'fulfilment/waybill-generation', component: WaybillGenerationComponent, canActivate: [authGuard] },
  {
    path: 'fulfilment/order-summary',
    component: OrderSummaryComponent,
    canActivate: [authGuard],
    children: [
      { path: 'compose-email', component: ComposeEmailComponent, canActivate: [authGuard] }
    ]
  },
  {
    path: 'fulfilment/history/:id',
    component: FulfilmentDetailsComponent,
    canActivate: [authGuard],
    children: [
      { path: 'compose-email', component: ComposeEmailComponent, canActivate: [authGuard] }
    ]
  },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'manage-config', component: ManageConfigComponent, canActivate: [authGuard] },
  { path: 'manage-package', component: ManagePackageComponent, canActivate: [authGuard] },
  { path: 'edit-company-details', component: EditCompanyDetailsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'user-account', component: UserAccountComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
