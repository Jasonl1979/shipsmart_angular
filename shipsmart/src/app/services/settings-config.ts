import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface EmailServerConfiguration {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
}

export interface EmailTemplate {
  id: string;
  isCustom: boolean;
  name: string;
  subject: string;
  body: string;
}

export interface ApiConfiguration {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'Bearer Token' | 'API Key' | 'Basic Auth';
  token: string;
  apiKey: string;
  apiSecret: string;
  username: string;
  password: string;
  accountReference: string;
}

const LEGACY_EMAIL_CONFIGURATION_STORAGE_KEY = 'shipsmart.settings.email-configuration';
const EMAIL_SERVER_CONFIGURATION_STORAGE_KEY = 'shipsmart.settings.email-server-configuration';
const CUSTOMER_EMAIL_TEMPLATES_STORAGE_KEY = 'shipsmart.settings.customer-email-templates';
const SUPPLIER_EMAIL_TEMPLATES_STORAGE_KEY = 'shipsmart.settings.supplier-email-templates';
const SUPPLIER_API_CONFIGURATION_STORAGE_KEY = 'shipsmart.settings.supplier-api-configuration';
const COURIER_API_CONFIGURATION_STORAGE_KEY = 'shipsmart.settings.courier-api-configuration';

const DEFAULT_EMAIL_SERVER_CONFIGURATION: EmailServerConfiguration = {
  senderName: '',
  senderEmail: '',
  replyToEmail: '',
  smtpHost: '',
  smtpPort: 587,
  username: '',
  password: '',
};

const DEFAULT_CUSTOMER_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'customer-order-received',
    isCustom: false,
    name: 'Order received',
    subject: 'Order received',
    body: 'We have received your order and are preparing it for processing.',
  },
  {
    id: 'customer-order-paid',
    isCustom: false,
    name: 'Order paid',
    subject: 'Order paid',
    body: 'Payment has been received for your order.',
  },
  {
    id: 'customer-order-out-for-delivery',
    isCustom: false,
    name: 'Order out for delivery',
    subject: 'Order out for delivery',
    body: 'Your order is out for delivery.',
  },
  {
    id: 'customer-order-delivered',
    isCustom: false,
    name: 'Order delivered',
    subject: 'Order delivered',
    body: 'Your order has been delivered successfully.',
  },
  {
    id: 'customer-order-complete',
    isCustom: false,
    name: 'Order complete',
    subject: 'Order complete',
    body: 'Your order process is complete. Thank you for your business.',
  },
];

const DEFAULT_SUPPLIER_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'supplier-place-order',
    isCustom: false,
    name: 'Place order',
    subject: 'Supplier order request',
    body: 'Please place the attached supplier order and confirm availability.',
  },
  {
    id: 'supplier-confirm-payment',
    isCustom: false,
    name: 'Confirm payment',
    subject: 'Payment confirmation request',
    body: 'Please confirm payment receipt for the submitted supplier order.',
  },
];

const DEFAULT_API_CONFIGURATION: ApiConfiguration = {
  id: '',
  name: '',
  baseUrl: '',
  authType: 'Bearer Token',
  token: '',
  apiKey: '',
  apiSecret: '',
  username: '',
  password: '',
  accountReference: '',
};

@Injectable({
  providedIn: 'root'
})
export class SettingsConfigService {
  emailServerConfiguration = signal<EmailServerConfiguration>(DEFAULT_EMAIL_SERVER_CONFIGURATION);
  customerEmailTemplates = signal<EmailTemplate[]>(DEFAULT_CUSTOMER_EMAIL_TEMPLATES);
  supplierEmailTemplates = signal<EmailTemplate[]>(DEFAULT_SUPPLIER_EMAIL_TEMPLATES);
  supplierApiConfigurations = signal<ApiConfiguration[]>([this.createApiConfiguration('Supplier API 1')]);
  courierApiConfigurations = signal<ApiConfiguration[]>([this.createApiConfiguration('Courier API 1')]);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.emailServerConfiguration.set(this.readEmailServerConfiguration());
    this.customerEmailTemplates.set(
      this.readEmailTemplates(CUSTOMER_EMAIL_TEMPLATES_STORAGE_KEY, DEFAULT_CUSTOMER_EMAIL_TEMPLATES)
    );
    this.supplierEmailTemplates.set(
      this.readEmailTemplates(SUPPLIER_EMAIL_TEMPLATES_STORAGE_KEY, DEFAULT_SUPPLIER_EMAIL_TEMPLATES)
    );
    this.supplierApiConfigurations.set(
      this.readApiConfigurations(SUPPLIER_API_CONFIGURATION_STORAGE_KEY, 'Supplier API')
    );
    this.courierApiConfigurations.set(
      this.readApiConfigurations(COURIER_API_CONFIGURATION_STORAGE_KEY, 'Courier API')
    );
  }

  saveEmailServerConfiguration(configuration: EmailServerConfiguration): void {
    const normalized: EmailServerConfiguration = {
      ...configuration,
      senderName: configuration.senderName.trim(),
      senderEmail: configuration.senderEmail.trim(),
      replyToEmail: configuration.replyToEmail.trim(),
      smtpHost: configuration.smtpHost.trim(),
      smtpPort: Number(configuration.smtpPort) || 587,
      username: configuration.username.trim(),
      password: configuration.password,
    };

    this.emailServerConfiguration.set(normalized);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(EMAIL_SERVER_CONFIGURATION_STORAGE_KEY, JSON.stringify(normalized));
  }

  resetEmailServerConfiguration(): void {
    this.emailServerConfiguration.set(DEFAULT_EMAIL_SERVER_CONFIGURATION);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(EMAIL_SERVER_CONFIGURATION_STORAGE_KEY);
  }

  createEmailTemplate(name: string): EmailTemplate {
    return {
      id: this.generateId(),
      isCustom: true,
      name,
      subject: name,
      body: '',
    };
  }

  saveCustomerEmailTemplates(templates: EmailTemplate[]): void {
    this.saveEmailTemplates(
      templates,
      this.customerEmailTemplates,
      CUSTOMER_EMAIL_TEMPLATES_STORAGE_KEY,
      DEFAULT_CUSTOMER_EMAIL_TEMPLATES
    );
  }

  resetCustomerEmailTemplates(): void {
    this.resetEmailTemplates(this.customerEmailTemplates, CUSTOMER_EMAIL_TEMPLATES_STORAGE_KEY, DEFAULT_CUSTOMER_EMAIL_TEMPLATES);
  }

  saveSupplierEmailTemplates(templates: EmailTemplate[]): void {
    this.saveEmailTemplates(
      templates,
      this.supplierEmailTemplates,
      SUPPLIER_EMAIL_TEMPLATES_STORAGE_KEY,
      DEFAULT_SUPPLIER_EMAIL_TEMPLATES
    );
  }

  resetSupplierEmailTemplates(): void {
    this.resetEmailTemplates(this.supplierEmailTemplates, SUPPLIER_EMAIL_TEMPLATES_STORAGE_KEY, DEFAULT_SUPPLIER_EMAIL_TEMPLATES);
  }

  saveSupplierApiConfigurations(configurations: ApiConfiguration[]): void {
    this.saveApiConfigurations(configurations, this.supplierApiConfigurations, SUPPLIER_API_CONFIGURATION_STORAGE_KEY, 'Supplier API');
  }

  resetSupplierApiConfigurations(): void {
    this.resetApiConfigurations(this.supplierApiConfigurations, SUPPLIER_API_CONFIGURATION_STORAGE_KEY, 'Supplier API');
  }

  saveCourierApiConfigurations(configurations: ApiConfiguration[]): void {
    this.saveApiConfigurations(configurations, this.courierApiConfigurations, COURIER_API_CONFIGURATION_STORAGE_KEY, 'Courier API');
  }

  resetCourierApiConfigurations(): void {
    this.resetApiConfigurations(this.courierApiConfigurations, COURIER_API_CONFIGURATION_STORAGE_KEY, 'Courier API');
  }

  createApiConfiguration(name: string): ApiConfiguration {
    return {
      ...DEFAULT_API_CONFIGURATION,
      id: this.generateId(),
      name,
    };
  }

  private readEmailServerConfiguration(): EmailServerConfiguration {
    if (!isPlatformBrowser(this.platformId)) {
      return DEFAULT_EMAIL_SERVER_CONFIGURATION;
    }

    const stored = localStorage.getItem(EMAIL_SERVER_CONFIGURATION_STORAGE_KEY);

    if (!stored) {
      const legacy = localStorage.getItem(LEGACY_EMAIL_CONFIGURATION_STORAGE_KEY);
      if (!legacy) {
        return DEFAULT_EMAIL_SERVER_CONFIGURATION;
      }

      try {
        const parsedLegacy = JSON.parse(legacy) as Partial<EmailServerConfiguration>;
        return {
          ...DEFAULT_EMAIL_SERVER_CONFIGURATION,
          ...parsedLegacy,
          smtpPort: Number(parsedLegacy.smtpPort) || DEFAULT_EMAIL_SERVER_CONFIGURATION.smtpPort,
        };
      } catch {
        return DEFAULT_EMAIL_SERVER_CONFIGURATION;
      }
    }

    try {
      const parsed = JSON.parse(stored) as Partial<EmailServerConfiguration>;
      return {
        ...DEFAULT_EMAIL_SERVER_CONFIGURATION,
        ...parsed,
        smtpPort: Number(parsed.smtpPort) || DEFAULT_EMAIL_SERVER_CONFIGURATION.smtpPort,
      };
    } catch {
      return DEFAULT_EMAIL_SERVER_CONFIGURATION;
    }
  }

  private saveEmailTemplates(
    templates: EmailTemplate[],
    target: { set(value: EmailTemplate[]): void },
    storageKey: string,
    defaults: EmailTemplate[]
  ): void {
    const defaultIdSet = new Set(defaults.map((template) => template.id));
    const normalized = templates.map((template, index) =>
      this.normalizeEmailTemplate(template, index, defaultIdSet)
    );

    target.set(normalized);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(normalized));
  }

  private resetEmailTemplates(
    target: { set(value: EmailTemplate[]): void },
    storageKey: string,
    defaults: EmailTemplate[]
  ): void {
    target.set(defaults.map((template) => ({ ...template })));

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(storageKey);
  }

  private readEmailTemplates(storageKey: string, defaults: EmailTemplate[]): EmailTemplate[] {
    if (!isPlatformBrowser(this.platformId)) {
      return defaults.map((template) => ({ ...template }));
    }

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return defaults.map((template) => ({ ...template }));
    }

    try {
      const parsed = JSON.parse(stored) as Array<Partial<EmailTemplate>>;
      if (!Array.isArray(parsed) || !parsed.length) {
        return defaults.map((template) => ({ ...template }));
      }

      const defaultIdSet = new Set(defaults.map((template) => template.id));
      return parsed.map((template, index) => this.normalizeEmailTemplate(template, index, defaultIdSet));
    } catch {
      return defaults.map((template) => ({ ...template }));
    }
  }

  private normalizeEmailTemplate(
    template: Partial<EmailTemplate>,
    index: number,
    defaultIdSet: Set<string>
  ): EmailTemplate {
    const id = template.id?.trim() || this.generateId();
    const inferredCustom = template.isCustom ?? !defaultIdSet.has(id);

    return {
      id,
      isCustom: inferredCustom,
      name: template.name?.trim() || `Template ${index + 1}`,
      subject: template.subject?.trim() || '',
      body: template.body?.trim() || '',
    };
  }

  private saveApiConfigurations(
    configurations: ApiConfiguration[],
    target: { set(value: ApiConfiguration[]): void },
    storageKey: string,
    labelPrefix: string
  ): void {
    const normalized = configurations.map((configuration, index) => this.normalizeApiConfiguration(configuration, labelPrefix, index));

    target.set(normalized);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(normalized));
  }

  private resetApiConfigurations(
    target: { set(value: ApiConfiguration[]): void },
    storageKey: string,
    labelPrefix: string
  ): void {
    target.set([this.createApiConfiguration(`${labelPrefix} 1`)]);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(storageKey);
  }

  private readApiConfigurations(storageKey: string, labelPrefix: string): ApiConfiguration[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [this.createApiConfiguration(`${labelPrefix} 1`)];
    }

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return [this.createApiConfiguration(`${labelPrefix} 1`)];
    }

    try {
      const parsed = JSON.parse(stored) as Partial<ApiConfiguration> | Array<Partial<ApiConfiguration>>;
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = items.map((item, index) => this.normalizeApiConfiguration(item, labelPrefix, index));
      return normalized.length ? normalized : [this.createApiConfiguration(`${labelPrefix} 1`)];
    } catch {
      return [this.createApiConfiguration(`${labelPrefix} 1`)];
    }
  }

  private normalizeApiConfiguration(
    configuration: Partial<ApiConfiguration>,
    labelPrefix: string,
    index: number
  ): ApiConfiguration {
    return {
      ...DEFAULT_API_CONFIGURATION,
      ...configuration,
      id: configuration.id?.trim() || this.generateId(),
      name: configuration.name?.trim() || `${labelPrefix} ${index + 1}`,
      baseUrl: configuration.baseUrl?.trim() || '',
      token: configuration.token?.trim() || '',
      apiKey: configuration.apiKey?.trim() || '',
      apiSecret: configuration.apiSecret?.trim() || '',
      username: configuration.username?.trim() || '',
      password: configuration.password || '',
      accountReference: configuration.accountReference?.trim() || '',
    };
  }

  private generateId(): string {
    return `cfg-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;
  }
}