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
  sanitizeControlName(name: string): string {
    return name.replace(/[.\s]/g, '_'); // replace dots and spaces with underscores
  }
 createPermissionForm(): void {
    const formControls: { [key: string]: any } = {};

    // CRUD permissions
    this.permissions.forEach(permission => {
      const baseEntity = this.stripLeadingSegment(permission.entityName);
      permission.permissionsList.forEach(perm => {
        const controlName = this.sanitizeControlName(`${baseEntity}_${perm.displayValue}`);
        formControls[controlName] = [perm.isSelected || false];
      });
    });

    // Plain permissions
    this.plainPermissions.forEach(permission => {
      const controlName = this.sanitizeControlName(`plain_${permission}`);
      formControls[controlName] = [true]; // or false if not assigned by default
    });

    this.permissionForm = this.fb.group(formControls);
  }
  // strip the first dot-separated segment (e.g. remove leading "Dashboard." from "Dashboard.X.Y")
  private stripLeadingSegment(entityName: string): string {
    if (!entityName) return entityName;
    const parts = entityName.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : entityName;
  }


 
  onPermissionChange(entityName: string, permission: string, checked: boolean): void {
    const controlName = this.sanitizeControlName(`${this.stripLeadingSegment(entityName)}_${permission}`);
    this.permissionForm.get(controlName)?.setValue(checked);
  }

 onGroupToggle(entityName: string, selectAll: boolean) {
    const group = this.permissions.find(p => p.entityName === entityName);
    if (!group) return;

    const baseEntity = this.stripLeadingSegment(group.entityName);

    group.permissionsList.forEach(perm => {
      const controlName = this.sanitizeControlName(baseEntity + '_' + perm.displayValue);
      const control = this.permissionForm.get(controlName);
      if (control) {
        control.setValue(selectAll);
      }
      // Optional: update your model if needed
      perm.isSelected = selectAll;
    });
  }



  isGroupFullySelected(entityName: string): boolean {
    const group = this.permissions.find(p => p.entityName === entityName);
    if (!group) return false;
    return group.permissionsList.every(p => p.isSelected);
  }

  isGroupPartiallySelected(entityName: string): boolean {
    const entityPermissions = this.permissions.find(p => p.entityName === entityName);
    if (!entityPermissions) return false;

    const baseEntity = this.stripLeadingSegment(entityName);

    const selectedCount = entityPermissions.permissionsList.filter(perm => {
      const controlName = this.sanitizeControlName(`${baseEntity}_${perm.displayValue}`);
      return this.permissionForm.get(controlName)?.value === true;
    }).length;

    return selectedCount > 0 && selectedCount < entityPermissions.permissionsList.length;
  }

 getSelectedPermissionsCount(entityName: string): number {
    const entityPermissions = this.permissions.find(p => p.entityName === entityName);
    if (!entityPermissions) return 0;

    const baseEntity = this.stripLeadingSegment(entityName);

    return entityPermissions.permissionsList.filter(perm => {
      const controlName = this.sanitizeControlName(`${baseEntity}_${perm.displayValue}`);
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
      const baseEntity = this.stripLeadingSegment(permission.entityName);
      permission.permissionsList.forEach(perm => {
        const controlName = this.sanitizeControlName(baseEntity + '_' + perm.displayValue);
        const control = this.permissionForm.get(controlName);
        if (this.permissionForm.get(controlName)?.value === true) {
        // Remove the "Dashboard." or any entityName prefix before "Permissions"
        const formatted = perm.displayValue.replace(/^.*?(Permissions\.)/, '$1');
        selectedPermissions.push(formatted);
      }
      });
    });

    // Collect plain permissions
    this.plainPermissions.forEach(permission => {
      const controlName = this.sanitizeControlName(`plain_${permission}`);
      const control = this.permissionForm.get(controlName);
      if (control?.value === true) {
        selectedPermissions.push(permission);
      }
    });

    console.log("Selected permissions:", selectedPermissions); // Debug

    // Call backend to assign permissions
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
