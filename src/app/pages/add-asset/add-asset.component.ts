import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '@components/card/card.component';
import { ButtonComponent } from '@components/button/button.component';
import { LucideAngularModule, Save, X } from 'lucide-angular';
import { TranslationService } from '@services/translation.service';

interface AssetForm {
  productName: string;
  productId: string;
  nature: string;
  supplier: string;
  quantity: string;
  lot: string;
  expiryDate: string;
  warehouse: string;
  image?: File;
}

@Component({
  selector: 'app-add-asset',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CardComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent implements OnInit {
  readonly Save = Save;
  readonly X = X;

  previewUrl: string | null = null;

  constructor(private translationService: TranslationService) {}

  assetForm: AssetForm = {
    productName: '',
    productId: '',
    nature: '',
    supplier: '',
    quantity: '',
    lot: '',
    expiryDate: '',
    warehouse: '',
    image: undefined
  };

  warehouses = [
    'DOH-01',
    'DOH-02', 
    'DOH-03',
    'KWI-01',
    'KWI-02',
    'BAH-01',
    'BAH-02'
  ];

  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    console.log('Asset form submitted:', this.assetForm);
    // TODO: Implement asset submission logic
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.assetForm.image = file;
      this.generatePreview(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.assetForm.image = file;
      this.generatePreview(file);
    }
  }

  private generatePreview(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.previewUrl = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private resetForm(): void {
    this.assetForm = {
      productName: '',
      productId: '',
      nature: '',
      supplier: '',
      quantity: '',
      lot: '',
      expiryDate: '',
      warehouse: '',
      image: undefined
    };
    this.previewUrl = null;
  }
}
