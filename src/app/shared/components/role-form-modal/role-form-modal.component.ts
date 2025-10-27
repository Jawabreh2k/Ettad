import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { Role, RoleType, CreateRoleDTO, UpdateRoleDTO, PermissionGroup } from '@models/role.model';
import { RoleService } from '@services/role.service';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-role-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ButtonComponent,
    LucideAngularModule
  ],
  templateUrl: './role-form-modal.component.html',
  styleUrls: ['./role-form-modal.component.css']
})
export class RoleFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() role?: Role;
  @Input() mode: 'create' | 'edit' = 'create';
  
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Role>();

  readonly Check = Check;
  
  roleForm!: FormGroup;
  permissionGroups: PermissionGroup[] = [];
  isLoading = false;
  errorMessage = '';

  roleTypes = [
    { value: RoleType.SUPER_ADMIN, label: 'Super Admin', color: 'error' },
    { value: RoleType.ADMIN, label: 'Admin', color: 'accent' },
    { value: RoleType.MANAGER, label: 'Manager', color: 'success' },
    { value: RoleType.MODERATOR, label: 'Moderator', color: 'warning' },
    { value: RoleType.USER, label: 'User', color: 'info' },
    { value: RoleType.VIEWER, label: 'Viewer', color: 'muted' }
  ];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPermissions();
  }

  private initializeForm(): void {
    this.roleForm = this.fb.group({
      name: [this.role?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.role?.description || '', [Validators.required]],
      roleType: [this.role?.roleType || RoleType.USER, [Validators.required]],
      isDefault: [this.role?.isDefault || false],
      isActive: [this.role?.isActive !== false]
    });
  }

  private loadPermissions(): void {
    if (this.mode === 'edit' && this.role) {
      this.roleService.getRolePermissionGroups(this.role.id).subscribe(groups => {
        this.permissionGroups = groups;
      });
    } else {
      this.roleService.getPermissionGroups().subscribe(groups => {
        this.permissionGroups = groups;
      });
    }
  }

  get title(): string {
    return this.mode === 'create' ? 'Create New Role' : `Edit Role: ${this.role?.name}`;
  }

  togglePermission(permission: any): void {
    permission.isSelected = !permission.isSelected;
  }

  toggleGroupPermissions(group: PermissionGroup): void {
    const allSelected = group.permissions.every(p => p.isSelected);
    group.permissions.forEach(p => p.isSelected = !allSelected);
  }

  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.length > 0 && group.permissions.every(p => p.isSelected);
  }

  isGroupPartiallySelected(group: PermissionGroup): boolean {
    const selectedCount = group.permissions.filter(p => p.isSelected).length;
    return selectedCount > 0 && selectedCount < group.permissions.length;
  }

  getSelectedPermissionsCount(): number {
    return this.permissionGroups
      .flatMap(g => g.permissions)
      .filter(p => p.isSelected).length;
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const selectedPermissionIds = this.permissionGroups
      .flatMap(g => g.permissions)
      .filter(p => p.isSelected)
      .map(p => p.id);

    if (this.mode === 'create') {
      const dto: CreateRoleDTO = {
        ...this.roleForm.value,
        permissions: selectedPermissionIds
      };

      this.roleService.createRole(dto).subscribe({
        next: (role) => {
          this.isLoading = false;
          this.saved.emit(role);
          this.close();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to create role';
        }
      });
    } else if (this.role) {
      const dto: UpdateRoleDTO = {
        id: this.role.id,
        ...this.roleForm.value,
        permissions: selectedPermissionIds
      };

      this.roleService.updateRole(dto).subscribe({
        next: (role) => {
          this.isLoading = false;
          this.saved.emit(role);
          this.close();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to update role';
        }
      });
    }
  }

  close(): void {
    this.roleForm.reset();
    this.errorMessage = '';
    this.closed.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.roleForm.controls).forEach(key => {
      this.roleForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.roleForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      }
    }
    return '';
  }
}

