import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '@services/user.service';
import { StorageService } from '@services/storage.service';

/**
 * Structural directive for permission-based rendering
 * 
 * Usage:
 * <div *appHasPermission="'users-create'">
 *   <!-- Content visible only if user has 'users-create' permission -->
 * </div>
 * 
 * <button *appHasPermission="['users-edit', 'users-delete']" appPermissionMode="any">
 *   <!-- Visible if user has ANY of the specified permissions -->
 * </button>
 * 
 * <button *appHasPermission="['users-edit', 'users-delete']" appPermissionMode="all">
 *   <!-- Visible if user has ALL of the specified permissions -->
 * </button>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission: string | string[] = [];
  @Input() appPermissionMode: 'any' | 'all' = 'any';
  
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    // Get current user ID
    const userId = this.storageService.get<string>('current_user_id');
    
    if (!userId) {
      // In development, show content if no user (for testing)
      console.warn('No user ID found, showing content for development');
      this.showContent();
      return;
    }

    // Get user and check permissions
    this.userService.getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (!user) {
            this.hideContent();
            return;
          }

          const requiredPermissions = Array.isArray(this.appHasPermission) 
            ? this.appHasPermission 
            : [this.appHasPermission];

          if (requiredPermissions.length === 0) {
            this.showContent();
            return;
          }

          const userPermissions = user.role.permissions.map(p => p.id);
          
          let hasPermission = false;
          
          if (this.appPermissionMode === 'all') {
            // User must have ALL specified permissions
            hasPermission = requiredPermissions.every(perm => 
              userPermissions.includes(perm)
            );
          } else {
            // User must have ANY of the specified permissions
            hasPermission = requiredPermissions.some(perm => 
              userPermissions.includes(perm)
            );
          }

          if (hasPermission) {
            this.showContent();
          } else {
            this.hideContent();
          }
        },
        error: (error) => {
          console.error('Error checking permissions:', error);
          this.hideContent();
        }
      });
  }

  private showContent(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private hideContent(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

