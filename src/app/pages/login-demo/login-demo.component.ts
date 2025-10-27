import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[var(--color-background-muted)] flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-custom-lg p-8 text-center">
        <h1 class="text-2xl font-bold text-[var(--color-text)] mb-4">Login Demo</h1>
        <p class="text-[var(--color-text-muted)] mb-6">
          This demonstrates the login functionality. Click the button below to test the login flow.
        </p>
        
        <div class="space-y-4">
          <button
            (click)="goToLogin()"
            class="w-full bg-[var(--color-brand)] text-white py-3 px-4 rounded-lg hover:bg-[var(--color-brand-dark)] transition-colors"
          >
            Go to Login Page
          </button>
          
          <button
            (click)="goToDashboard()"
            class="w-full bg-[var(--color-accent)] text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors"
          >
            Go to Dashboard (Skip Login)
          </button>
        </div>
        
        <div class="mt-6 p-4 bg-[var(--color-background-muted)] rounded-lg">
          <h3 class="text-sm font-medium text-[var(--color-text)] mb-2">Demo Credentials:</h3>
          <div class="text-xs text-[var(--color-text-muted)] space-y-1">
            <p><strong>Admin:</strong> admin&#64;barzan.com / admin123</p>
            <p><strong>User:</strong> user&#64;barzan.com / user123</p>
            <p><strong>Test:</strong> test&#64;barzan.com / test123</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginDemoComponent {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToDashboard(): void {
    // Set a mock token to bypass login
    localStorage.setItem('auth_token', 'mock-jwt-token');
    this.router.navigate(['/dashboard']);
  }
}
