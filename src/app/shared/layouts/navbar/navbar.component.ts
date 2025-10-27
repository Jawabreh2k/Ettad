import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Bell, User, Languages, LogOut, ChevronDown } from 'lucide-angular';
import { TranslationService } from '@services/translation.service';
import { AuthService } from '@services/auth.service';
import { User as UserModel } from '@models/user.model';
import { getFullName, getUserInitials } from '@models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly Bell = Bell;
  readonly User = User;
  readonly Languages = Languages;
  readonly LogOut = LogOut;
  readonly ChevronDown = ChevronDown;

  currentUser: UserModel | null = null;
  showUserMenu = false;
  notificationCount = 3; // Mock notification count

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserFullName(): string {
    return this.currentUser ? getFullName(this.currentUser) : 'User';
  }

  getUserInitials(): string {
    return this.currentUser ? getUserInitials(this.currentUser) : 'U';
  }

  getUserRole(): string {
    return this.currentUser?.role.name || 'User';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
    this.closeUserMenu();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeUserMenu();
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage().toUpperCase();
  }

  logout(): void {
    this.closeUserMenu();
    
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        // Even if there's an error, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
