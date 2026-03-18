import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ApiConfiguration,
  EmailServerConfiguration,
  EmailTemplate,
  SettingsConfigService,
} from '../../services/settings-config';

@Component({
  selector: 'app-manage-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-config.html',
  styleUrl: './manage-config.scss'
})
export class ManageConfigComponent {
  emailServerConfig: EmailServerConfiguration;
  customerTemplates: EmailTemplate[];
  supplierTemplates: EmailTemplate[];
  supplierApiConfigs: ApiConfiguration[];
  courierApiConfigs: ApiConfiguration[];
  emailServerSavedMessage = '';
  customerTemplatesSavedMessage = '';
  supplierTemplatesSavedMessage = '';
  supplierApiConfigSavedMessage = '';
  courierApiConfigSavedMessage = '';
  customerTemplateMinimized: Record<string, boolean> = {};
  supplierTemplateMinimized: Record<string, boolean> = {};

  constructor(private settingsConfigService: SettingsConfigService) {
    this.emailServerConfig = { ...this.settingsConfigService.emailServerConfiguration() };
    this.customerTemplates = this.settingsConfigService.customerEmailTemplates().map((template) => ({ ...template }));
    this.supplierTemplates = this.settingsConfigService.supplierEmailTemplates().map((template) => ({ ...template }));
    this.supplierApiConfigs = this.settingsConfigService.supplierApiConfigurations().map((config) => ({ ...config }));
    this.courierApiConfigs = this.settingsConfigService.courierApiConfigurations().map((config) => ({ ...config }));
    this.syncTemplateMinimizedState();
  }

  saveEmailServerConfiguration(): void {
    this.settingsConfigService.saveEmailServerConfiguration(this.emailServerConfig);
    this.emailServerConfig = { ...this.settingsConfigService.emailServerConfiguration() };
    this.emailServerSavedMessage = 'Email server configuration saved.';
    this.customerTemplatesSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  resetEmailServerConfiguration(): void {
    this.settingsConfigService.resetEmailServerConfiguration();
    this.emailServerConfig = { ...this.settingsConfigService.emailServerConfiguration() };
    this.emailServerSavedMessage = 'Email server configuration reset.';
    this.customerTemplatesSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  addCustomerTemplate(): void {
    const newTemplate = this.settingsConfigService.createEmailTemplate(`Customer template ${this.customerTemplates.length + 1}`);
    this.customerTemplates = [
      ...this.customerTemplates,
      newTemplate,
    ];
    this.customerTemplateMinimized[newTemplate.id] = false;
    this.customerTemplatesSavedMessage = '';
  }

  removeCustomerTemplate(templateId: string): void {
    this.customerTemplates = this.customerTemplates.filter((template) => template.id !== templateId);
    delete this.customerTemplateMinimized[templateId];
    this.customerTemplatesSavedMessage = '';
  }

  toggleCustomerTemplateMinimized(templateId: string): void {
    this.customerTemplateMinimized[templateId] = !this.customerTemplateMinimized[templateId];
  }

  isCustomerTemplateMinimized(templateId: string): boolean {
    return !!this.customerTemplateMinimized[templateId];
  }

  saveCustomerTemplates(): void {
    this.settingsConfigService.saveCustomerEmailTemplates(this.customerTemplates);
    this.customerTemplates = this.settingsConfigService.customerEmailTemplates().map((template) => ({ ...template }));
    this.syncTemplateMinimizedState();
    this.customerTemplatesSavedMessage = 'Customer email templates saved.';
    this.emailServerSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  resetCustomerTemplates(): void {
    this.settingsConfigService.resetCustomerEmailTemplates();
    this.customerTemplates = this.settingsConfigService.customerEmailTemplates().map((template) => ({ ...template }));
    this.syncTemplateMinimizedState();
    this.customerTemplatesSavedMessage = 'Customer email templates reset.';
    this.emailServerSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  addSupplierTemplate(): void {
    const newTemplate = this.settingsConfigService.createEmailTemplate(`Supplier template ${this.supplierTemplates.length + 1}`);
    this.supplierTemplates = [
      ...this.supplierTemplates,
      newTemplate,
    ];
    this.supplierTemplateMinimized[newTemplate.id] = false;
    this.supplierTemplatesSavedMessage = '';
  }

  removeSupplierTemplate(templateId: string): void {
    this.supplierTemplates = this.supplierTemplates.filter((template) => template.id !== templateId);
    delete this.supplierTemplateMinimized[templateId];
    this.supplierTemplatesSavedMessage = '';
  }

  toggleSupplierTemplateMinimized(templateId: string): void {
    this.supplierTemplateMinimized[templateId] = !this.supplierTemplateMinimized[templateId];
  }

  isSupplierTemplateMinimized(templateId: string): boolean {
    return !!this.supplierTemplateMinimized[templateId];
  }

  saveSupplierTemplates(): void {
    this.settingsConfigService.saveSupplierEmailTemplates(this.supplierTemplates);
    this.supplierTemplates = this.settingsConfigService.supplierEmailTemplates().map((template) => ({ ...template }));
    this.syncTemplateMinimizedState();
    this.supplierTemplatesSavedMessage = 'Supplier email templates saved.';
    this.emailServerSavedMessage = '';
    this.customerTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  resetSupplierTemplates(): void {
    this.settingsConfigService.resetSupplierEmailTemplates();
    this.supplierTemplates = this.settingsConfigService.supplierEmailTemplates().map((template) => ({ ...template }));
    this.syncTemplateMinimizedState();
    this.supplierTemplatesSavedMessage = 'Supplier email templates reset.';
    this.emailServerSavedMessage = '';
    this.customerTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  addSupplierApiConfiguration(): void {
    this.supplierApiConfigs = [
      ...this.supplierApiConfigs,
      this.settingsConfigService.createApiConfiguration(`Supplier API ${this.supplierApiConfigs.length + 1}`),
    ];
    this.supplierApiConfigSavedMessage = '';
  }

  removeSupplierApiConfiguration(configId: string): void {
    if (this.supplierApiConfigs.length === 1) {
      return;
    }

    this.supplierApiConfigs = this.supplierApiConfigs.filter((config) => config.id !== configId);
    this.supplierApiConfigSavedMessage = '';
  }

  saveSupplierApiConfigurations(): void {
    this.settingsConfigService.saveSupplierApiConfigurations(this.supplierApiConfigs);
    this.supplierApiConfigs = this.settingsConfigService.supplierApiConfigurations().map((config) => ({ ...config }));
    this.supplierApiConfigSavedMessage = 'Supplier API configurations saved.';
    this.emailServerSavedMessage = '';
    this.customerTemplatesSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  resetSupplierApiConfigurations(): void {
    this.settingsConfigService.resetSupplierApiConfigurations();
    this.supplierApiConfigs = this.settingsConfigService.supplierApiConfigurations().map((config) => ({ ...config }));
    this.supplierApiConfigSavedMessage = 'Supplier API configurations reset.';
    this.emailServerSavedMessage = '';
    this.customerTemplatesSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.courierApiConfigSavedMessage = '';
  }

  addCourierApiConfiguration(): void {
    this.courierApiConfigs = [
      ...this.courierApiConfigs,
      this.settingsConfigService.createApiConfiguration(`Courier API ${this.courierApiConfigs.length + 1}`),
    ];
    this.courierApiConfigSavedMessage = '';
  }

  removeCourierApiConfiguration(configId: string): void {
    if (this.courierApiConfigs.length === 1) {
      return;
    }

    this.courierApiConfigs = this.courierApiConfigs.filter((config) => config.id !== configId);
    this.courierApiConfigSavedMessage = '';
  }

  saveCourierApiConfigurations(): void {
    this.settingsConfigService.saveCourierApiConfigurations(this.courierApiConfigs);
    this.courierApiConfigs = this.settingsConfigService.courierApiConfigurations().map((config) => ({ ...config }));
    this.courierApiConfigSavedMessage = 'Courier API configurations saved.';
    this.emailServerSavedMessage = '';
    this.customerTemplatesSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
  }

  resetCourierApiConfigurations(): void {
    this.settingsConfigService.resetCourierApiConfigurations();
    this.courierApiConfigs = this.settingsConfigService.courierApiConfigurations().map((config) => ({ ...config }));
    this.courierApiConfigSavedMessage = 'Courier API configurations reset.';
    this.emailServerSavedMessage = '';
    this.customerTemplatesSavedMessage = '';
    this.supplierTemplatesSavedMessage = '';
    this.supplierApiConfigSavedMessage = '';
  }

  private syncTemplateMinimizedState(): void {
    const customerIds = new Set(this.customerTemplates.map((template) => template.id));
    const supplierIds = new Set(this.supplierTemplates.map((template) => template.id));

    this.customerTemplateMinimized = Object.fromEntries(
      Object.entries(this.customerTemplateMinimized).filter(([id]) => customerIds.has(id))
    );
    this.supplierTemplateMinimized = Object.fromEntries(
      Object.entries(this.supplierTemplateMinimized).filter(([id]) => supplierIds.has(id))
    );

    this.customerTemplates.forEach((template) => {
      if (!(template.id in this.customerTemplateMinimized)) {
        this.customerTemplateMinimized[template.id] = true;
      }
    });

    this.supplierTemplates.forEach((template) => {
      if (!(template.id in this.supplierTemplateMinimized)) {
        this.supplierTemplateMinimized[template.id] = true;
      }
    });
  }
}