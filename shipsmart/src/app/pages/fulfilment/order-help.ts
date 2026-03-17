import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FulfilmentService, WorkflowStepKey } from '../../services/fulfilment';

@Component({
  selector: 'app-order-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-help.html',
  styleUrl: './order-help.scss'
})
export class OrderHelpComponent {
  availableSelectionKey: WorkflowStepKey | null = null;
  selectedSelectionKey: WorkflowStepKey | null = null;
  selectedWorkflowKeys: WorkflowStepKey[] = [];
  validationMessage = '';

  constructor(
    private router: Router,
    private fulfilmentService: FulfilmentService
  ) {
    this.selectedWorkflowKeys = [...this.fulfilmentService.getWorkflowSelection()];
  }

  get availableSteps() {
    const selected = new Set(this.selectedWorkflowKeys);
    return this.fulfilmentService.workflowStepDefinitions.filter((step) => !selected.has(step.key));
  }

  get selectedSteps() {
    const selected = new Set(this.selectedWorkflowKeys);
    return this.fulfilmentService.workflowStepDefinitions.filter((step) => selected.has(step.key));
  }

  selectAvailable(key: WorkflowStepKey): void {
    this.availableSelectionKey = key;
  }

  selectSelected(key: WorkflowStepKey): void {
    this.selectedSelectionKey = key;
  }

  moveSelectedRight(): void {
    if (!this.availableSelectionKey) {
      return;
    }

    this.selectedWorkflowKeys = this.fulfilmentService.normalizeWorkflowSelection([
      ...this.selectedWorkflowKeys,
      this.availableSelectionKey,
    ]);
    this.validationMessage = '';
    this.selectedSelectionKey = this.availableSelectionKey;
    this.availableSelectionKey = null;
  }

  moveSelectedLeft(): void {
    if (!this.selectedSelectionKey) {
      return;
    }

    this.selectedWorkflowKeys = this.selectedWorkflowKeys.filter((key) => key !== this.selectedSelectionKey);
    this.validationMessage = '';
    this.availableSelectionKey = this.selectedSelectionKey;
    this.selectedSelectionKey = null;
  }

  back(): void {
    this.router.navigate(['/fulfilment']);
  }

  next(): void {
    this.fulfilmentService.setWorkflowSelection(this.selectedWorkflowKeys);
    this.fulfilmentService.setOrderHelpAcknowledged(true);
    this.fulfilmentService.setStatus('Order Help');
    this.router.navigate([this.fulfilmentService.getNextRoute('/fulfilment/order-help')]);
  }
}
