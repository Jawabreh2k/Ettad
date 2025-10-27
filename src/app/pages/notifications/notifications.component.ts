import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationDetailComponent } from './components/notification-detail/notification-detail.component';
import { Notification } from './models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LucideAngularModule,
    NotificationListComponent,
    NotificationDetailComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  readonly ArrowLeft = ChevronLeft;

  // Mock data - will be replaced with API calls
  notifications: Notification[] = [
    {
      orderId: '#0172',
      updateDate: '25 July 2025',
      time: '1 hour ago',
      status: 'Confirm Pick-up Time',
      pickupDate: '23/6/2025',
      pickupTime: '11:00 AM',
      warehouse: 'DOH-01 Warehouse'
    },
    {
      orderId: '#0171',
      updateDate: '1 July 2025',
      time: '12:35 PM',
      status: 'Order has been approved by Auditor'
    },
    {
      orderId: '#0170',
      updateDate: '22 June 2025',
      time: '7:00 AM',
      status: 'Confirm Pick-up Time',
      pickupDate: '25/6/2025',
      pickupTime: '9:00 AM',
      warehouse: 'DOH-02 Warehouse'
    },
    {
      orderId: '#0169',
      updateDate: '18 June 2025',
      time: '9:35 AM',
      status: 'Your Order has been Rejected'
    }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 1;
  totalItems = 20;

  // Detail view
  selectedNotification: Notification | null = null;
  showDetailView = false;
  proposedDate = '';
  proposedTime = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadNotificationDetail(orderId);
      }
    });
  }

  private loadNotificationDetail(orderId: string): void {
    const notification = this.notifications.find(n => n.orderId === orderId);
    if (notification) {
      this.showNotificationDetail(notification);
    }
  }

  onNotificationClick(notification: Notification): void {
    this.showNotificationDetail(notification);
  }

  showNotificationDetail(notification: Notification): void {
    this.selectedNotification = notification;
    this.showDetailView = true;
    this.updateRoute(notification.orderId);
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedNotification = null;
    this.proposedDate = '';
    this.proposedTime = '';
    this.clearRoute();
  }

  goBack(): void {
    if (this.showDetailView) {
      this.closeDetailView();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.currentPage = page;
    }
  }

  onProposeNewTime(): void {
    if (this.selectedNotification) {
      console.log('Proposed new time:', {
        orderId: this.selectedNotification.orderId,
        date: this.proposedDate,
        time: this.proposedTime
      });
      // TODO: Call API to propose new time
      this.closeDetailView();
    }
  }

  onConfirmPickup(): void {
    if (this.selectedNotification) {
      console.log('Confirmed pickup for:', this.selectedNotification.orderId);
      // TODO: Call API to confirm pickup
      this.closeDetailView();
    }
  }

  private updateRoute(orderId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId },
      queryParamsHandling: 'merge'
    });
  }

  private clearRoute(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }
}
