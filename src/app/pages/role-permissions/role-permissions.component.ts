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
          console.log("curd permission",this.permissions);
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
          console.log("plainPermissions",this.plainPermissions);
        },
        error: (error) => {
          console.error('Failed to load plain permissions:', error);
        }
      });
  }
 sanitizeControlName(name: any) {
    if (typeof name !== 'string') {
        console.warn('sanitizeControlName received non-string:', name);
        name = String(name); // convert to string
    }
    return name.replace(/\./g, '_'); // safer: replace all dots
}

createPermissionForm(): void {
  const formControls: { [key: string]: any } = {};

  // CRUD permissions
  this.permissions.forEach(permission => {
    permission.permissionsList.forEach(perm => {
      const controlKey = this.sanitizeControlName(perm.displayValue);
      formControls[controlKey] = [perm.isSelected || false];
    });
  });

  // Plain permissions
  this.plainPermissions.forEach(permission => {
    const controlKey = this.sanitizeControlName(permission);
    formControls[controlKey] = [true];
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


onGroupToggle(entityName: string, selectAll: boolean): void {
  const group = this.permissions.find(p => p.entityName === entityName);
  if (!group) return;

  group.permissionsList.forEach(perm => {
    const control = this.permissionForm.get(this.sanitizeControlName(perm.displayValue));
    if (control) control.setValue(selectAll);
    perm.isSelected = selectAll;
  });
}

isGroupFullySelected(entityName: string): boolean {
  const group = this.permissions.find(p => p.entityName === entityName);
  if (!group) return false;

 
  group.permissionsList.forEach(p => {
    const controlName = this.sanitizeControlName( p.displayValue); // match creation
    const controlValue = this.permissionForm.get(controlName)?.value;
    
  });

  return group.permissionsList.every(p => {
    const controlName = this.sanitizeControlName( p.displayValue);
    return this.permissionForm.get(controlName)?.value === true;
  });
}


isGroupPartiallySelected(entityName: string): boolean {
  const group = this.permissions.find(p => p.entityName === entityName);
  if (!group) return false;

  const selectedCount = group.permissionsList.filter(p =>
    this.permissionForm.get(p.displayValue)?.value === true
  ).length;

  return selectedCount > 0 && selectedCount < group.permissionsList.length;
}

  getSelectedPermissionsCount(entityName: string): number {
  const entityPermissions = this.permissions.find(p => p.entityName === entityName);
  if (!entityPermissions) return 0;

  // Strip leading segment (if needed)
  const baseEntity = this.stripLeadingSegment(entityName);

  return entityPermissions.permissionsList.filter(perm => {
    // Use the same sanitized control name as in createPermissionForm
    const controlName = this.sanitizeControlName(`${perm.displayValue}`);
    return this.permissionForm.get(controlName)?.value === true;
  }).length;
}




onSavePermissions(): void {
  if (!this.selectedRole) return;

  this.isSaving = true;
  this.errorMessage = '';
  this.successMessage = '';

  const selectedPermissions: string[] = [];

  this.permissions.forEach(permissionGroup => {
    permissionGroup.permissionsList.forEach(perm => {
      // Use sanitized name for both form creation and reading
      const controlName = this.sanitizeControlName(`${perm.displayValue}`);
     
      const controlValue = this.permissionForm.get(controlName)?.value;

      if (controlValue === true) {
        const permissionStr = typeof perm.displayValue === 'string' ? perm.displayValue : String(perm.displayValue);
        selectedPermissions.push(`${permissionGroup.entityName}.${permissionStr}`);
      }
    });
  });


  
const finalPermissions = selectedPermissions.map(p => {
  const segments = p.split('.');
  if (segments.length > 1) {
    segments.shift(); // remove first word
    return segments.join('.');
  }
  return p; // if no dot, keep as is
});


  this.backendUserService.assignPermissionsToRole(this.selectedRole.id, finalPermissions)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Permissions saved successfully!';
      },
      error: err => {
        this.isSaving = false;
        this.errorMessage = 'Error saving permissions.';
       
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
