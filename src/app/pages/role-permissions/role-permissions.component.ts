import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Shield, Settings, Check, X, Save, RefreshCw } from 'lucide-angular';

import { BackendUserService } from '@services/backend-user.service';
import { RoleDto, CrudPermission, AssignPermissionsDto } from '@models/backend-user.model';
import { CardComponent } from '@components/card/card.component';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, CardComponent],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.css']
})
export class RolePermissionsComponent implements OnInit, OnDestroy {
  readonly Shield = Shield;
  readonly Settings = Settings;
  readonly Check = Check;
  readonly X = X;
  readonly Save = Save;
  readonly RefreshCw = RefreshCw;

  roles: RoleDto[] = [];
  selectedRole: RoleDto | null = null;
  permissions: CrudPermission[] = [];
  plainPermissions: string[] = [];
  
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  permissionForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private backendUserService: BackendUserService,
    private fb: FormBuilder
  ) {
    this.permissionForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.backendUserService.getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load roles: ' + (error.message || 'Unknown error');
        }
      });
  }

  onRoleSelect(role: RoleDto): void {
    this.selectedRole = role;
    this.loadRolePermissions(role.id);
  }

  loadRolePermissions(roleId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load both CRUD and plain permissions
    this.backendUserService.getCrudPermissionsForRole(roleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          this.permissions = permissions;
          this.createPermissionForm();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load permissions: ' + (error.message || 'Unknown error');
        }
      });

    this.backendUserService.getPlainPermissionsForRole(roleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          this.plainPermissions = permissions;
        },
        error: (error) => {
          console.error('Failed to load plain permissions:', error);
        }
      });
  }

  createPermissionForm(): void {
    const formControls: { [key: string]: any } = {};

    // Add CRUD permissions
    this.permissions.forEach(permission => {
      permission.permissionsList.forEach(perm => {
        const controlName = `${permission.entityName}_${perm.displayValue}`;
        formControls[controlName] = [perm.isChecked || false];
      });
    });

    // Add plain permissions
    this.plainPermissions.forEach(permission => {
      formControls[`plain_${permission}`] = [true]; // Plain permissions are usually already assigned
    });

    this.permissionForm = this.fb.group(formControls);
  }

  onPermissionChange(entityName: string, permission: string, checked: boolean): void {
    const controlName = `${entityName}_${permission}`;
    this.permissionForm.get(controlName)?.setValue(checked);
  }

  onGroupToggle(entityName: string, checked: boolean): void {
    const entityPermissions = this.permissions.find(p => p.entityName === entityName);
    if (entityPermissions) {
      entityPermissions.permissionsList.forEach(perm => {
        const controlName = `${entityName}_${perm.displayValue}`;
        this.permissionForm.get(controlName)?.setValue(checked);
      });
    }
  }

  isGroupFullySelected(entityName: string): boolean {
    const entityPermissions = this.permissions.find(p => p.entityName === entityName);
    if (!entityPermissions) return false;

    return entityPermissions.permissionsList.every(perm => {
      const controlName = `${entityName}_${perm.displayValue}`;
      return this.permissionForm.get(controlName)?.value === true;
    });
  }

  isGroupPartiallySelected(entityName: string): boolean {
    const entityPermissions = this.permissions.find(p => p.entityName === entityName);
    if (!entityPermissions) return false;

    const selectedCount = entityPermissions.permissionsList.filter(perm => {
      const controlName = `${entityName}_${perm.displayValue}`;
      return this.permissionForm.get(controlName)?.value === true;
    }).length;

    return selectedCount > 0 && selectedCount < entityPermissions.permissionsList.length;
  }

  getSelectedPermissionsCount(entityName: string): number {
    const entityPermissions = this.permissions.find(p => p.entityName === entityName);
    if (!entityPermissions) return 0;

    return entityPermissions.permissionsList.filter(perm => {
      const controlName = `${entityName}_${perm.displayValue}`;
      return this.permissionForm.get(controlName)?.value === true;
    }).length;
  }

  onSavePermissions(): void {
    if (!this.selectedRole) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const selectedPermissions: string[] = [];

    // Collect CRUD permissions
    this.permissions.forEach(permission => {
      permission.permissionsList.forEach(perm => {
        const controlName = `${permission.entityName}_${perm.displayValue}`;
        if (this.permissionForm.get(controlName)?.value === true) {
          selectedPermissions.push(perm.displayValue);
        }
      });
    });

    // Collect plain permissions
    this.plainPermissions.forEach(permission => {
      const controlName = `plain_${permission}`;
      if (this.permissionForm.get(controlName)?.value === true) {
        selectedPermissions.push(permission);
      }
    });

    this.backendUserService.assignPermissionsToRole(this.selectedRole.id, selectedPermissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Permissions updated successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = 'Failed to save permissions: ' + (error.message || 'Unknown error');
        }
      });
  }

  onRefresh(): void {
    if (this.selectedRole) {
      this.loadRolePermissions(this.selectedRole.id);
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
