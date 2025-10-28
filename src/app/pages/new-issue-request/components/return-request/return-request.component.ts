import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@components/button/button.component';
import { LucideAngularModule, Upload } from 'lucide-angular';

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonComponent,
    LucideAngularModule
  ],
  templateUrl: './return-request.component.html',
  styleUrls: ['./return-request.component.css']
})
export class ReturnRequestComponent {
  readonly Upload = Upload;

  dateCreated: string = '';
  returnOrderId: string = '';
  quantity: string = '';
  comments: string = '';
  attachment: File | null = null;
  attachmentName: string = 'No file selected';

  isSubmitted = false;
  errors: { [key: string]: string } = {};

  constructor() {
    const today = new Date();
    this.dateCreated = this.formatDate(today);
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}, ${month} - ${year}`;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachment = input.files[0];
      this.attachmentName = input.files[0].name;
    }
  }

  removeAttachment(): void {
    this.attachment = null;
    this.attachmentName = 'No file selected';
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput?.click();
  }

  onSendRequest(form: NgForm): void {
    this.isSubmitted = true;
    this.errors = {};

    if (!this.returnOrderId.trim()) {
      this.errors['returnOrderId'] = 'Return Order ID is required';
    }

    if (!this.quantity.trim()) {
      this.errors['quantity'] = 'Quantity is required';
    } else if (!/^\d+(,\d{3})*$/.test(this.quantity.replace(/\s/g, ''))) {
      this.errors['quantity'] = 'Please enter a valid quantity (e.g., 20,000)';
    }

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const requestData = {
      dateCreated: this.dateCreated,
      returnOrderId: this.returnOrderId,
      quantity: this.quantity,
      comments: this.comments || 'None',
      attachment: this.attachment
    };

    console.log('Return Request submitted:', requestData);
    alert('Return request submitted successfully!');
    this.resetForm();
  }

  hasError(fieldName: string): boolean {
    return this.isSubmitted && !!this.errors[fieldName];
  }

  getError(fieldName: string): string {
    return this.errors[fieldName] || '';
  }

  private resetForm(): void {
    const today = new Date();
    this.dateCreated = this.formatDate(today);
    this.returnOrderId = '';
    this.quantity = '';
    this.comments = '';
    this.attachment = null;
    this.attachmentName = 'No file selected';
    this.isSubmitted = false;
    this.errors = {};

    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}

