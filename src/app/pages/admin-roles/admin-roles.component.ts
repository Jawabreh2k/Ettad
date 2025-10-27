import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CardComponent } from '@components/card/card.component';
import { ButtonComponent } from '@components/button/button.component';
import { RoleFormModalComponent } from '@components/role-form-modal/role-form-modal.component';
import { ConfirmDialogComponent } from '@components/confirm-dialog/confirm-dialog.component';
import { LucideAngularModule, Shield, Plus, Edit, Trash2, Users, Settings, Copy, Check, X } from 'lucide-angular';
import { Role, RoleType } from '@models/role.model';
import { RoleService } from '@services/role.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    ButtonComponent, 
    LucideAngularModule,
    RoleFormModalComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.css']
})
export class AdminRolesComponent implements OnInit, OnDestroy {
  readonly Shield = Shield;
  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly X = X;

  roles: Role[] = [];
  isLoading = false;
  
  // Modal states
  showRoleModal = false;
  showDeleteConfirm = false;
  roleModalMode: 'create' | 'edit' = 'create';
  selectedRole?: Role;

  private destroy$ = new Subject<void>();

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadRoles();
    
    // Subscribe to role changes
    this.roleService.roles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roles => {
        this.roles = roles;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoading = false;
      },
        error: (error) => {
          this.isLoading = false;
        }
    });
  }

  onAddRole(): void {
    this.roleModalMode = 'create';
    this.selectedRole = undefined;
    this.showRoleModal = true;
  }

  onEdit(role: Role): void {
    this.roleModalMode = 'edit';
    this.selectedRole = role;
    this.showRoleModal = true;
  }

  onDelete(role: Role): void {
    this.selectedRole = role;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.selectedRole) {
      this.roleService.deleteRole(this.selectedRole.id).subscribe({
        next: (success) => {
          if (success) {
            this.showDeleteConfirm = false;
            this.selectedRole = undefined;
            this.loadRoles();
          }
        },
        error: (error) => {
          alert(error.message || 'Failed to delete role');
        }
      });
    }
  }

  onDuplicate(role: Role): void {
    this.roleService.duplicateRole(role.id).subscribe({
      next: (duplicatedRole) => {
        this.loadRoles();
      },
      error: (error) => {
        console.error('Failed to duplicate role:', error);
        alert(error.message || 'Failed to duplicate role');
      }
    });
  }

  onRoleSaved(role: Role): void {
    this.loadRoles();
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

  getRoleTypeLabel(roleType: RoleType): string {
    return roleType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  getTotalUsers(): number {
    return this.roles.reduce((sum, role) => sum + role.userCount, 0);
  }

  getDefaultRolesCount(): number {
    return this.roles.filter(r => r.isDefault).length;
  }

  getActiveRolesCount(): number {
    return this.roles.filter(r => r.isActive).length;
  }
}
