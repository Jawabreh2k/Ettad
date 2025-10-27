import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, ChevronLeft, ChevronDown } from 'lucide-angular';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent {
  @Input() notifications: Notification[] = [];
  @Input() currentPage = 1;
  @Input() itemsPerPage = 1;
  @Input() totalItems = 20;

  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  readonly ArrowLeft = ChevronLeft;
  readonly ChevronDown = ChevronDown;

  onNotificationClick(notification: Notification): void {
    this.notificationClick.emit(notification);
  }

  onItemsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPageChange.emit(parseInt(select.value));
  }

  goToPage(page: number): void {
    this.pageChange.emit(page);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPaginationNumbers(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    
    for (let i = 1; i <= Math.min(5, total); i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
