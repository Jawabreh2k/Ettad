import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface CartridgeDetails {
  name: string;
  selected: boolean;
  productId?: string;
  ncn?: string;
  primaryPurpose?: string;
  projectileColor?: string;
  totalWeight?: string;
  projectileMaterial?: string;
  caseType?: string;
  primer?: string;
  propellant?: string;
  hazardDivision?: string;
  capabilityGroup?: string;
}

@Component({
  selector: 'app-cartridge-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './cartridge-details.component.html',
  styleUrls: ['./cartridge-details.component.css']
})
export class CartridgeDetailsComponent {
  @Input() cartridge: CartridgeDetails | null = null;
  @Output() select = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSelect(): void {
    this.select.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

