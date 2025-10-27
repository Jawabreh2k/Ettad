import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BackendAuthService } from '@services/backend-auth.service';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Lock = Lock;
  readonly Mail = Mail;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;

  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  loginError = '';
  showTestAccounts = false;

  // Test accounts for easy login
  testAccounts = [
    { email: 'admin@barzan.com', role: 'Super Admin', password: 'admin123' },
    { email: 'manager@barzan.com', role: 'Asset Manager', password: 'manager123' },
    { email: 'user@barzan.com', role: 'User', password: 'user123' },
    { email: 'viewer@barzan.com', role: 'Viewer', password: 'viewer123' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private backendAuth: BackendAuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.backendAuth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTestAccounts(): void {
    this.showTestAccounts = !this.showTestAccounts;
  }

  /**
   * Quick login with test account
   */
  quickLogin(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const formValue = this.loginForm.value as LoginForm;

    // Call BackendAuthService login
    this.backendAuth.login({
      username: formValue.email,
      password: formValue.password
    }).subscribe({
      next: (response) => {
        // Handle remember me
        if (formValue.rememberMe) {
          localStorage.setItem('remembered_email', formValue.email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        this.isLoading = false;

        // Navigate to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginError = error.message || 'Login failed. Please try again.';
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const displayName = fieldName === 'email' ? 'Email' : 'Password';
        return `${displayName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const required = field.errors['minlength'].requiredLength;
        return `Password must be at least ${required} characters`;
      }
    }
    return '';
  }

  /**
   * Handle Enter key press to submit form
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid && !this.isLoading) {
      this.onSubmit();
    }
  }
}
