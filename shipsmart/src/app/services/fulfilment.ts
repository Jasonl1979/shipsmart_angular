import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type WorkflowStepKey =
  | 'order-fulfilment'
  | 'new-order'
  | 'supplier-communication'
  | 'invoice-generation'
  | 'waybill-generation';

export interface WorkflowStepDefinition {
  key: WorkflowStepKey;
  label: string;
  route: string;
  description: string;
}

const WORKFLOW_STORAGE_KEY = 'shipsmart.fulfilment.workflow-selection';

const WORKFLOW_STEP_DEFINITIONS: WorkflowStepDefinition[] = [
  {
    key: 'supplier-communication',
    label: 'Supplier Communication',
    route: '/fulfilment/supplier-communication',
    description: 'Review supplier draft emails before the request is accepted.',
  },
  {
    key: 'invoice-generation',
    label: 'Invoice Generation',
    route: '/fulfilment/invoice-generation',
    description: 'Choose how invoices should be generated for the request.',
  },
  {
    key: 'waybill-generation',
    label: 'Waybill Generation',
    route: '/fulfilment/waybill-generation',
    description: 'Configure the waybills and courier integration for dispatch.',
  },
];

const MANDATORY_START_ROUTE = '/fulfilment/order-fulfilment';
const NEW_ORDER_CUSTOMER_ROUTE = '/fulfilment/customer-selection';
const CONDITIONAL_NEW_ORDER_ROUTE = '/fulfilment/new-order';
const DEFAULT_WORKFLOW_SELECTION: WorkflowStepKey[] = WORKFLOW_STEP_DEFINITIONS.map((step) => step.key);

export type FulfilmentStatus =
  | 'Draft'
  | 'Started'
  | 'Order Help'
  | 'Order Fulfilment'
  | 'Invoice Generation'
  | 'Waybill Generation'
  | 'Summary'
  | 'Completed';

export type EmailStatus = 'Draft' | 'Sent' | 'Received';
export type GenericStatus = 'Pending' | 'Created' | 'Completed' | 'Failed';

export interface FulfilmentEmail {
  id: string;
  supplier: string;
  subject: string;
  body: string;
  status: EmailStatus;
}

export interface FulfilmentOrder {
  id: string;
  source: 'Existing' | 'New';
  orderNumber: string;
  orderType: 'Service' | 'Product';
  requiresSupplies: boolean;
  supplierApiRequested: boolean;
  generateDraftEmail: boolean;
  status: GenericStatus;
}

export interface FulfilmentWaybill {
  id: string;
  courierName: string;
  status: GenericStatus;
}

export interface FulfilmentInvoice {
  id: string;
  method: 'Infinite invoices' | 'Excel upload template' | 'Accounting API';
  status: GenericStatus;
  link: string;
}

export interface NewOrderCustomProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface FulfilmentCustomerInfo {
  mode: 'Existing' | 'New';
  existingCustomerId?: number;
  name: string;
  address: string;
  contactDetails: string;
  email: string;
  companyName?: string;
  vatNo?: string;
  discount?: number;
  reference: string;
  accountNumber: string;
}

export interface FulfilmentRequest {
  id: string;
  createdAt: string;
  completedAt?: string;
  status: FulfilmentStatus;
  orderHelpAcknowledged: boolean;
  workflowSteps: WorkflowStepKey[];
  selectedExistingOrderId?: number;
  customer?: FulfilmentCustomerInfo;
  newOrderNumber?: string;
  newOrderProductIds?: number[];
  newOrderCustomProducts?: NewOrderCustomProduct[];
  orderType?: 'Service' | 'Product';
  requiresSupplies?: boolean;
  supplierApiRequested: boolean;
  generateSupplierDraftEmail: boolean;
  invoiceMethod?: 'Infinite invoices' | 'Excel upload template' | 'Accounting API';
  waybillCount: number;
  courierIntegration: 'Use configured courier API' | 'Manual for now';
  emails: FulfilmentEmail[];
  orders: FulfilmentOrder[];
  waybills: FulfilmentWaybill[];
  invoices: FulfilmentInvoice[];
}

@Injectable({
  providedIn: 'root'
})
export class FulfilmentService {
  readonly workflowStepDefinitions = WORKFLOW_STEP_DEFINITIONS;

  history = signal<FulfilmentRequest[]>(this.getSeedHistory());
  activeRequest = signal<FulfilmentRequest | null>(null);
  workflowSelection = signal<WorkflowStepKey[]>([...DEFAULT_WORKFLOW_SELECTION]);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.workflowSelection.set(this.readWorkflowSelectionFromStorage());
  }

  createNewRequest(): FulfilmentRequest {
    const request = this.buildDefaultRequest();
    this.activeRequest.set(request);
    this.history.update((current) => [request, ...current]);
    return request;
  }

  getRequestById(id: string): FulfilmentRequest | undefined {
    return this.history().find((entry) => entry.id === id);
  }

  setActiveRequestById(id: string): boolean {
    const request = this.getRequestById(id);
    if (!request) {
      return false;
    }

    this.activeRequest.set({ ...request });
    return true;
  }

  setStatus(status: FulfilmentStatus): void {
    this.patchActiveRequest({ status });
  }

  getWorkflowSelection(): WorkflowStepKey[] {
    const activeRequest = this.activeRequest();
    if (activeRequest?.workflowSteps?.length) {
      return this.normalizeWorkflowSelection(activeRequest.workflowSteps);
    }

    return this.normalizeWorkflowSelection(this.workflowSelection());
  }

  getSelectedWorkflowSteps(): WorkflowStepDefinition[] {
    const selected = new Set(this.getWorkflowSelection());
    return this.workflowStepDefinitions.filter((step) => selected.has(step.key));
  }

  getWorkflowStep(key: WorkflowStepKey): WorkflowStepDefinition {
    return this.workflowStepDefinitions.find((step) => step.key === key) ?? this.workflowStepDefinitions[0];
  }

  isWorkflowStepSelected(key: WorkflowStepKey): boolean {
    return this.getWorkflowSelection().includes(key);
  }

  normalizeWorkflowSelection(selection: WorkflowStepKey[]): WorkflowStepKey[] {
    const selected = new Set(selection.filter((key) => this.workflowStepDefinitions.some((step) => step.key === key)));

    return this.workflowStepDefinitions
      .map((step) => step.key)
      .filter((key) => selected.has(key));
  }

  setWorkflowSelection(selection: WorkflowStepKey[]): void {
    const normalized = this.normalizeWorkflowSelection(selection);

    this.workflowSelection.set(normalized);
    this.persistWorkflowSelection(normalized);
    this.patchActiveRequest({
      workflowSteps: normalized,
      orderHelpAcknowledged: normalized.length > 0,
    });
  }

  getNextRoute(currentRoute: string, options?: { useExistingOrder?: boolean }): string {
    const sequence = this.buildWorkflowSequence(options);
    const currentIndex = sequence.indexOf(currentRoute);

    if (currentIndex === -1) {
      return sequence[0];
    }

    return sequence[Math.min(currentIndex + 1, sequence.length - 1)];
  }

  getPreviousRoute(currentRoute: string, options?: { useExistingOrder?: boolean }): string {
    const sequence = this.buildWorkflowSequence(options);
    const currentIndex = sequence.indexOf(currentRoute);

    if (currentIndex === -1) {
      return sequence[0];
    }

    return sequence[Math.max(currentIndex - 1, 0)];
  }

  setOrderHelpAcknowledged(acknowledged: boolean): void {
    this.patchActiveRequest({ orderHelpAcknowledged: acknowledged });
  }

  setOrderInfo(orderInfo: {
    selectedExistingOrderId?: number;
    newOrderNumber?: string;
    orderType: 'Service' | 'Product';
    requiresSupplies: boolean;
    supplierApiRequested: boolean;
    generateSupplierDraftEmail: boolean;
  }): void {
    const current = this.activeRequest();

    this.patchActiveRequest({
      selectedExistingOrderId: orderInfo.selectedExistingOrderId,
      newOrderNumber: orderInfo.newOrderNumber,
      customer: orderInfo.selectedExistingOrderId !== undefined ? undefined : current?.customer,
      orderType: orderInfo.orderType,
      requiresSupplies: orderInfo.requiresSupplies,
      supplierApiRequested: orderInfo.supplierApiRequested,
      generateSupplierDraftEmail: orderInfo.generateSupplierDraftEmail,
    });

    if (!orderInfo.generateSupplierDraftEmail) {
      this.removeDraftSupplierEmails();
      return;
    }

    this.upsertSupplierDraftEmail();
  }

  setInvoiceMethod(method: 'Infinite invoices' | 'Excel upload template' | 'Accounting API'): void {
    this.patchActiveRequest({ invoiceMethod: method });
  }

  setWaybillDetails(waybillCount: number, courierIntegration: 'Use configured courier API' | 'Manual for now'): void {
    this.patchActiveRequest({ waybillCount, courierIntegration });
  }

  setNewOrderProducts(productIds: number[], customProducts: NewOrderCustomProduct[]): void {
    this.patchActiveRequest({
      newOrderProductIds: [...productIds],
      newOrderCustomProducts: [...customProducts],
    });
  }

  setCustomerInfo(customer: FulfilmentCustomerInfo): void {
    this.patchActiveRequest({ customer: { ...customer } });
  }

  runProcess(sendDraftEmailsNow: boolean): void {
    const request = this.activeRequest();
    if (!request) {
      return;
    }

    const workflowSelection = this.getWorkflowSelectionForRequest(request);
    const createOrder = true;
    const createInvoices = workflowSelection.includes('invoice-generation');
    const createWaybills = workflowSelection.includes('waybill-generation');
    const updateEmails = workflowSelection.includes('supplier-communication');

    const generatedOrder: FulfilmentOrder = {
      id: this.generateId('ord'),
      source: request.selectedExistingOrderId ? 'Existing' : 'New',
      orderNumber: request.newOrderNumber || `EX-${request.selectedExistingOrderId ?? 'NA'}`,
      orderType: request.orderType ?? 'Product',
      requiresSupplies: !!request.requiresSupplies,
      supplierApiRequested: request.supplierApiRequested,
      generateDraftEmail: request.generateSupplierDraftEmail,
      status: 'Created',
    };

    const generatedInvoices: FulfilmentInvoice[] = [
      {
        id: this.generateId('inv'),
        method: request.invoiceMethod ?? 'Infinite invoices',
        status: 'Created',
        link: `/invoices/${request.id}`,
      }
    ];

    const generatedWaybills: FulfilmentWaybill[] = Array.from({ length: Math.max(1, request.waybillCount) }, (_, index) => ({
      id: `${this.generateId('wb')}-${index + 1}`,
      courierName: request.courierIntegration === 'Use configured courier API' ? 'Configured Courier API' : 'Manual Courier',
      status: 'Created',
    }));

    const updatedEmails: FulfilmentEmail[] = request.emails.map((email) => {
      if (email.status !== 'Draft') {
        return email;
      }

      return {
        ...email,
        status: updateEmails && sendDraftEmailsNow ? 'Sent' : 'Draft',
      };
    });

    this.patchActiveRequest({
      status: 'Completed',
      completedAt: new Date().toISOString(),
      emails: updatedEmails,
      orders: createOrder ? [generatedOrder] : [],
      invoices: createInvoices ? generatedInvoices : [],
      waybills: createWaybills ? generatedWaybills : [],
    });
  }

  resendEmail(requestId: string, emailId: string): void {
    this.history.update((items) =>
      items.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        return {
          ...request,
          emails: request.emails.map((email) =>
            email.id === emailId ? { ...email, status: 'Sent' } : email
          ),
        };
      })
    );
  }

  markEmailReceived(requestId: string, emailId: string): void {
    this.history.update((items) =>
      items.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        return {
          ...request,
          emails: request.emails.map((email) =>
            email.id === emailId ? { ...email, status: 'Received' } : email
          ),
        };
      })
    );
  }

  recreateOrder(requestId: string): void {
    this.history.update((items) =>
      items.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        const recreatedOrder: FulfilmentOrder = {
          id: this.generateId('ord'),
          source: 'New',
          orderNumber: `RE-${request.id.slice(-4)}`,
          orderType: request.orderType ?? 'Product',
          requiresSupplies: !!request.requiresSupplies,
          supplierApiRequested: request.supplierApiRequested,
          generateDraftEmail: request.generateSupplierDraftEmail,
          status: 'Created',
        };

        return {
          ...request,
          orders: [recreatedOrder, ...request.orders],
        };
      })
    );
  }

  recreateWaybill(requestId: string): void {
    this.history.update((items) =>
      items.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        const recreatedWaybill: FulfilmentWaybill = {
          id: this.generateId('wb'),
          courierName: 'Configured Courier API',
          status: 'Created',
        };

        return {
          ...request,
          waybills: [recreatedWaybill, ...request.waybills],
        };
      })
    );
  }

  createNewEmail(
    requestId: string,
    subject: string,
    body: string,
    options?: { supplier?: string; status?: EmailStatus }
  ): void {
    this.history.update((items) =>
      items.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        const newEmail: FulfilmentEmail = {
          id: this.generateId('mail'),
          supplier: options?.supplier?.trim() || 'Custom Supplier Contact',
          subject,
          body,
          status: options?.status ?? 'Draft',
        };

        return {
          ...request,
          emails: [newEmail, ...request.emails],
        };
      })
    );
  }

  private patchActiveRequest(changes: Partial<FulfilmentRequest>): void {
    const current = this.activeRequest();
    if (!current) {
      return;
    }

    const updated: FulfilmentRequest = {
      ...current,
      ...changes,
    };

    this.activeRequest.set(updated);
    this.history.update((items) =>
      items.map((request) => (request.id === updated.id ? updated : request))
    );
  }

  private upsertSupplierDraftEmail(): void {
    const request = this.activeRequest();
    if (!request) {
      return;
    }

    const exists = request.emails.some((email) => email.subject === 'Supplier stock request');
    if (exists) {
      return;
    }

    const draftEmail: FulfilmentEmail = {
      id: this.generateId('mail'),
      supplier: 'Primary Supplier',
      subject: 'Supplier stock request',
      body: 'Please reserve and prepare stock for this fulfilment request. Final send occurs from summary.',
      status: 'Draft',
    };

    this.patchActiveRequest({
      emails: [draftEmail, ...request.emails],
    });
  }

  private removeDraftSupplierEmails(): void {
    const request = this.activeRequest();
    if (!request) {
      return;
    }

    this.patchActiveRequest({
      emails: request.emails.filter((email) => email.subject !== 'Supplier stock request'),
    });
  }

  private buildWorkflowSequence(options?: { useExistingOrder?: boolean }): string[] {
    const useExistingOrder = options?.useExistingOrder ?? !!this.activeRequest()?.selectedExistingOrderId;
    const selectedWorkflowRoutes = this.getSelectedWorkflowSteps()
      .map((step) => step.route);

    return [
      '/fulfilment/order-help',
      MANDATORY_START_ROUTE,
      ...(useExistingOrder ? [] : [NEW_ORDER_CUSTOMER_ROUTE, CONDITIONAL_NEW_ORDER_ROUTE]),
      ...selectedWorkflowRoutes,
      '/fulfilment/order-summary'
    ];
  }

  private getWorkflowSelectionForRequest(request: FulfilmentRequest): WorkflowStepKey[] {
    return this.normalizeWorkflowSelection(request.workflowSteps?.length ? request.workflowSteps : this.workflowSelection());
  }

  private readWorkflowSelectionFromStorage(): WorkflowStepKey[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [...DEFAULT_WORKFLOW_SELECTION];
    }

    const stored = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!stored) {
      return [...DEFAULT_WORKFLOW_SELECTION];
    }

    try {
      const parsed = JSON.parse(stored) as WorkflowStepKey[];
      const normalized = this.normalizeWorkflowSelection(parsed);
      return normalized.length ? normalized : [...DEFAULT_WORKFLOW_SELECTION];
    } catch {
      return [...DEFAULT_WORKFLOW_SELECTION];
    }
  }

  private persistWorkflowSelection(selection: WorkflowStepKey[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(selection));
  }

  private buildDefaultRequest(): FulfilmentRequest {
    return {
      id: this.generateId('ful'),
      createdAt: new Date().toISOString(),
      status: 'Draft',
      orderHelpAcknowledged: this.workflowSelection().length > 0,
      workflowSteps: this.getWorkflowSelection(),
      supplierApiRequested: false,
      generateSupplierDraftEmail: false,
      newOrderProductIds: [],
      newOrderCustomProducts: [],
      waybillCount: 1,
      courierIntegration: 'Use configured courier API',
      emails: [],
      orders: [],
      waybills: [],
      invoices: [],
    };
  }

  private getSeedHistory(): FulfilmentRequest[] {
    return [
      {
        id: 'FUL-1002',
        createdAt: '2026-03-11T11:30:00.000Z',
        completedAt: '2026-03-11T14:20:00.000Z',
        status: 'Completed',
        orderHelpAcknowledged: true,
        workflowSteps: [...DEFAULT_WORKFLOW_SELECTION],
        supplierApiRequested: true,
        generateSupplierDraftEmail: true,
        orderType: 'Product',
        waybillCount: 2,
        invoiceMethod: 'Accounting API',
        courierIntegration: 'Use configured courier API',
        emails: [
          {
            id: 'MAIL-110',
            supplier: 'ABC Supplies',
            subject: 'Stock request for FUL-1002',
            body: 'Please supply carton stock.',
            status: 'Sent',
          },
          {
            id: 'MAIL-111',
            supplier: 'ABC Supplies',
            subject: 'Re: Stock request for FUL-1002',
            body: 'Stock confirmed for dispatch.',
            status: 'Received',
          },
        ],
        orders: [
          {
            id: 'ORD-9901',
            source: 'New',
            orderNumber: 'ORD-2026-250',
            orderType: 'Product',
            requiresSupplies: true,
            supplierApiRequested: true,
            generateDraftEmail: true,
            status: 'Completed',
          },
        ],
        waybills: [
          { id: 'WB-5001', courierName: 'Courier API X', status: 'Completed' },
          { id: 'WB-5002', courierName: 'Courier API X', status: 'Completed' },
        ],
        invoices: [
          {
            id: 'INV-3001',
            method: 'Accounting API',
            status: 'Completed',
            link: '/invoices/INV-3001',
          },
        ],
      },
      {
        id: 'FUL-1001',
        createdAt: '2026-03-10T09:15:00.000Z',
        status: 'Waybill Generation',
        orderHelpAcknowledged: true,
        workflowSteps: [...DEFAULT_WORKFLOW_SELECTION],
        supplierApiRequested: false,
        generateSupplierDraftEmail: true,
        orderType: 'Service',
        waybillCount: 1,
        invoiceMethod: 'Infinite invoices',
        courierIntegration: 'Manual for now',
        emails: [
          {
            id: 'MAIL-100',
            supplier: 'Widget Partners',
            subject: 'Draft order request',
            body: 'Draft prepared. Send from summary page.',
            status: 'Draft',
          },
        ],
        orders: [],
        waybills: [],
        invoices: [],
      },
    ];
  }

  private generateId(prefix: string): string {
    return `${prefix.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  }
}
