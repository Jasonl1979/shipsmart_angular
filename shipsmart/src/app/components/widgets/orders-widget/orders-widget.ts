import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data';

@Component({
  selector: 'app-orders-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-widget.html',
  styleUrl: './orders-widget.scss'
})
export class OrdersWidgetComponent {
  @Input() rowsToShow = 5;

  constructor(public dataService: DataService) {}
}
