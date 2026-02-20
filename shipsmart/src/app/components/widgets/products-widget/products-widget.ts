import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data';

@Component({
  selector: 'app-products-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-widget.html',
  styleUrl: './products-widget.scss'
})
export class ProductsWidgetComponent {
  @Input() rowsToShow = 5;

  constructor(public dataService: DataService) {}
}
