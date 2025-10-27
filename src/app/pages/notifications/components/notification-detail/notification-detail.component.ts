import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.css']
})
export class NotificationDetailComponent {
  @Input() notification: Notification | null = null;
  @Input() proposedDate = '';
  @Input() proposedTime = '';

  @Output() close = new EventEmitter<void>();
  @Output() proposeNewTime = new EventEmitter<void>();
  @Output() confirmPickup = new EventEmitter<void>();
  @Output() proposedDateChange = new EventEmitter<string>();
  @Output() proposedTimeChange = new EventEmitter<string>();

  onClose(): void {
    this.close.emit();
  }

  onProposeNewTime(): void {
    this.proposeNewTime.emit();
  }

  onConfirmPickup(): void {
    this.confirmPickup.emit();
  }

  onProposedDateChange(value: string): void {
    this.proposedDateChange.emit(value);
  }

  onProposedTimeChange(value: string): void {
    this.proposedTimeChange.emit(value);
  }
}
