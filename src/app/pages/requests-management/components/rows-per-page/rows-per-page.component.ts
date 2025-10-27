import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rows-per-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rows-per-page.component.html',
  styleUrls: ['./rows-per-page.component.css']
})
export class RowsPerPageComponent {
  @Input() rowsPerPage: number = 5;
  @Input() totalItems: number = 20;
  @Output() rowsPerPageChange = new EventEmitter<number>();

  options: number[] = [5, 10, 20, 50];

  onRowsPerPageChange(value: number): void {
    this.rowsPerPageChange.emit(value);
  }
}

