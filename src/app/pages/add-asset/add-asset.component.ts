import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@components/card/card.component';
import { ButtonComponent } from '@components/button/button.component';
import { LucideAngularModule, Save, X } from 'lucide-angular';

interface AssetForm {
  name: string;
  category: string;
  serialNumber: string;
  location: string;
  status: string;
  description: string;
}

@Component({
  selector: 'app-add-asset',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent implements OnInit {
  readonly Save = Save;
  readonly X = X;

  assetForm: AssetForm = {
    name: '',
    category: '',
    serialNumber: '',
    location: '',
    status: 'active',
    description: ''
  };

  categories = ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Phone', 'Tablet', 'Other'];
  statuses = ['Active', 'Inactive', 'Maintenance', 'Retired'];
  locations = ['Office A', 'Office B', 'Warehouse', 'Remote', 'Other'];

  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    // TODO: Implement asset submission logic
    // Reset form after submission
    this.assetForm = {
      name: '',
      category: '',
      serialNumber: '',
      location: '',
      status: 'active',
      description: ''
    };
  }

  onCancel(): void {
    // Reset form
    this.assetForm = {
      name: '',
      category: '',
      serialNumber: '',
      location: '',
      status: 'active',
      description: ''
    };
  }
}
