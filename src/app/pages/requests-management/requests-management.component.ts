import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { PaginationComponent } from './components/pagination/pagination.component';
import { RowsPerPageComponent } from './components/rows-per-page/rows-per-page.component';
import { StatusDropdownComponent } from './components/status-dropdown/status-dropdown.component';
import { OrderDetailsModalComponent } from './components/order-details-modal/order-details-modal.component';

export interface Request {
  orderId: string;
  requestDate: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  requestType: 'Issue' | 'Return' | 'Discard';
  status: 'Pending' | 'Confirmed' | 'Rejected';
}

@Component({
  selector: 'app-requests-management',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, PaginationComponent, RowsPerPageComponent, StatusDropdownComponent, OrderDetailsModalComponent],
  templateUrl: './requests-management.component.html',
  styleUrls: ['./requests-management.component.css']
})
export class RequestsManagementComponent implements OnInit {
  readonly ChevronDown = ChevronDown;

  requests: Request[] = [
    { orderId: '#0172', requestDate: '25 July 2024', priority: 'High', requestType: 'Issue', status: 'Pending' },
    { orderId: '#0171', requestDate: '4 June 2024', priority: 'High', requestType: 'Issue', status: 'Confirmed' },
    { orderId: '#0170', requestDate: '6 May 2024', priority: 'Low', requestType: 'Return', status: 'Rejected' },
    { orderId: '#0169', requestDate: '1 May 2024', priority: 'Critical', requestType: 'Issue', status: 'Pending' },
    { orderId: '#0168', requestDate: '27 April 2024', priority: 'Low', requestType: 'Return', status: 'Pending' },
    { orderId: '#0167', requestDate: '20 April 2024', priority: 'Medium', requestType: 'Discard', status: 'Confirmed' },
    { orderId: '#0166', requestDate: '18 April 2024', priority: 'Low', requestType: 'Issue', status: 'Rejected' }
  ];

  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalItems: number = 20;

  isModalOpen = false;
  selectedOrder: Request | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onRowsPerPageChange(rows: number): void {
    this.rowsPerPage = rows;
  }

  onStatusChange(orderId: string, newStatus: string): void {
    const request = this.requests.find(r => r.orderId === orderId);
    if (request) {
      request.status = newStatus as 'Pending' | 'Confirmed' | 'Rejected';
    }
  }

  openOrderDetails(order: Request): void {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeOrderDetails(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }
}
