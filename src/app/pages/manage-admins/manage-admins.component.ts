import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CardComponent } from '@components/card/card.component';
import { ButtonComponent } from '@components/button/button.component';
import { UserFormModalComponent } from '@components/user-form-modal/user-form-modal.component';
import { ConfirmDialogComponent } from '@components/confirm-dialog/confirm-dialog.component';
import { LucideAngularModule, UserPlus, Search, Edit, Trash2, Shield, Mail, User as UserIcon, Power } from 'lucide-angular';
import { User, UserStatus, getFullName, getUserInitials } from '@models/user.model';
import { Role, RoleType } from '@models/role.model';
import { BackendUserService } from '@services/backend-user.service';

@Component({
  selector: 'app-manage-admins',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardComponent, 
    ButtonComponent, 
    LucideAngularModule,
    UserFormModalComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.css']
})
export class ManageAdminsComponent implements OnInit, OnDestroy {
  readonly UserPlus = UserPlus;
  readonly Search = Search;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Shield = Shield;
  readonly Mail = Mail;
  readonly UserIcon = UserIcon;
  readonly Power = Power;

  users: User[] = [];
  roles: Role[] = [];
  isLoading = false;
  
  searchTerm = '';
  selectedRoleId = '';
  selectedStatus: UserStatus | '' = '';

  // Modal states
  showUserModal = false;
  showDeleteConfirm = false;
  userModalMode: 'create' | 'edit' = 'create';
  selectedUser?: User;

  private destroy$ = new Subject<void>();

  constructor(
    private backendUserService: BackendUserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    
    // Subscribe to user changes
    this.backendUserService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        // Convert BackendUserDto to User model for display
        this.users = this.convertBackendUsersToDisplayUsers(users);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.backendUserService.getUsers().subscribe({
      next: (users) => {
        this.users = this.convertBackendUsersToDisplayUsers(users);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to load users:', error);
      }
    });
  }

  loadRoles(): void {
    this.backendUserService.getRoles().subscribe({
      next: (roles) => {
        this.roles = this.convertBackendRolesToDisplayRoles(roles);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const fullName = getFullName(user);
      const matchesSearch = fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.department?.toLowerCase().includes(this.searchTerm.toLowerCase() || '');
      const matchesRole = !this.selectedRoleId || user.role.id === this.selectedRoleId;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getFullName(user: User): string {
    return getFullName(user);
  }

  getUserInitials(user: User): string {
    return getUserInitials(user);
  }

  onAddUser(): void {
    this.userModalMode = 'create';
    this.selectedUser = undefined;
    this.showUserModal = true;
  }

  onEdit(user: User): void {
    this.userModalMode = 'edit';
    this.selectedUser = user;
    this.showUserModal = true;
  }

  onDelete(user: User): void {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.selectedUser) {
      this.backendUserService.deleteUser(this.selectedUser.id).subscribe({
        next: (success) => {
          if (success) {
            this.showDeleteConfirm = false;
            this.selectedUser = undefined;
            this.loadUsers();
          }
        },
        error: (error) => {
          alert(error.message || 'Failed to delete user');
        }
      });
    }
  }

  onToggleStatus(user: User): void {
    // Note: Backend doesn't have toggle status, would need to implement
    // For now, just reload users
    this.loadUsers();
  }

  onUserSaved(user: User): void {
    this.loadUsers();
  }

  getStatusColor(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE: return 'bg-[var(--color-success)]';
      case UserStatus.INACTIVE: return 'bg-[var(--color-text-muted)]';
      case UserStatus.PENDING: return 'bg-[var(--color-warning)]';
      case UserStatus.SUSPENDED: return 'bg-[var(--color-error)]';
      default: return 'bg-[var(--color-text-muted)]';
    }
  }

  getRoleTypeColor(roleType: RoleType): string {
    switch (roleType) {
      case RoleType.SUPER_ADMIN: return 'bg-[var(--color-error)]';
      case RoleType.ADMIN: return 'bg-[var(--color-accent)]';
      case RoleType.MANAGER: return 'bg-[var(--color-success)]';
      case RoleType.MODERATOR: return 'bg-[var(--color-warning)]';
      case RoleType.USER: return 'bg-[var(--color-info)]';
      case RoleType.VIEWER: return 'bg-[var(--color-text-muted)]';
      default: return 'bg-[var(--color-text-muted)]';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalActiveUsers(): number {
    return this.users.filter(u => u.status === UserStatus.ACTIVE).length;
  }

  getTotalInactiveUsers(): number {
    return this.users.filter(u => u.status === UserStatus.INACTIVE).length;
  }

  /**
   * Convert BackendUserDto to User model for display
   */
  private convertBackendUsersToDisplayUsers(backendUsers: any[]): User[] {
    return backendUsers.map(backendUser => ({
      id: backendUser.id,
      firstName: backendUser.userName.split('.')[0] || backendUser.userName,
      lastName: backendUser.userName.split('.')[1] || '',
      email: backendUser.email,
      phone: '',
      role: {
        id: '1',
        name: 'User',
        description: 'Standard user',
        roleType: 'user' as any,
        userCount: 0,
        permissions: [],
        isActive: true,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: 'IT',
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * Convert BackendRoleDto to Role model for display
   */
  private convertBackendRolesToDisplayRoles(backendRoles: any[]): Role[] {
    return backendRoles.map(backendRole => ({
      id: backendRole.id,
      name: backendRole.name,
      description: backendRole.isSuperAdmin ? 'Super Administrator' : 'Standard Role',
      roleType: backendRole.isSuperAdmin ? 'super_admin' : 'user' as any,
      userCount: 0,
      permissions: [],
      isActive: true,
      isDefault: backendRole.isDefaultRole,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
}
