import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, MoreVertical } from 'lucide-angular';

export interface OrderItem {
  orderId: string;
  requestDate: string;
}

export type StatusType = 'new-issue' | 'on-progress' | 'completed';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule],
  templateUrl: './status-card.component.html',
  styleUrls: ['./status-card.component.css']
})
export class StatusCardComponent {
  @Input() title: string = '';
  @Input() status: StatusType = 'new-issue';
  @Input() orders: OrderItem[] = [];

  readonly MoreVertical = MoreVertical;

  getStatusColor(): string {
    switch (this.status) {
      case 'new-issue': return 'border-b-[#6366F1]';
      case 'on-progress': return 'border-b-[#F59E0B]';
      case 'completed': return 'border-b-[#10B981]';
      default: return 'border-b-gray-300';
    }
  }

  getBackgroundColor(): string {
    return 'bg-[#f5f5f5]';
  }

  getDotColor(): string {
    switch (this.status) {
      case 'new-issue': return 'bg-[#6366F1]';
      case 'on-progress': return 'bg-[#F59E0B]';
      case 'completed': return 'bg-[#10B981]';
      default: return 'bg-gray-300';
    }
  }
}

