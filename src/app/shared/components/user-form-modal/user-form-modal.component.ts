import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { User, UserStatus, CreateUserDTO, UpdateUserDTO } from '@models/user.model';
import { Role } from '@models/role.model';
import { UserService } from '@services/user.service';
import { RoleService } from '@services/role.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ButtonComponent
  ],
  templateUrl: './user-form-modal.component.html',
  styleUrls: ['./user-form-modal.component.css']
})
export class UserFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() user?: User;
  @Input() mode: 'create' | 'edit' = 'create';
  
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<User>();

  userForm!: FormGroup;
  roles: Role[] = [];
  isLoading = false;
  errorMessage = '';

  userStatuses = [
    { value: UserStatus.ACTIVE, label: 'Active' },
    { value: UserStatus.INACTIVE, label: 'Inactive' },
    { value: UserStatus.PENDING, label: 'Pending' },
    { value: UserStatus.SUSPENDED, label: 'Suspended' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.initializeForm();
      this.errorMessage = '';
    }
    if (changes['user'] || changes['mode']) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: [this.user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [this.user?.phone || ''],
      roleId: [this.user?.role.id || '', [Validators.required]],
      department: [this.user?.department || ''],
      status: [this.user?.status || UserStatus.ACTIVE, [Validators.required]]
    });

    // Add password field only for create mode
    if (this.mode === 'create') {
      this.userForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
      this.userForm.addControl('confirmPassword', this.fb.control('', [Validators.required]));
    }
  }

  private loadRoles(): void {
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles.filter(r => r.isActive);
    });
  }

  get title(): string {
    return this.mode === 'create' ? 'Add New User' : `Edit User: ${this.user?.firstName} ${this.user?.lastName}`;
  }

  get passwordsMatch(): boolean {
    if (this.mode === 'edit') return true;
    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.mode === 'create' && !this.passwordsMatch) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.mode === 'create') {
      const dto: CreateUserDTO = this.userForm.value;

      this.userService.createUser(dto).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.saved.emit(user);
          this.close();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to create user';
        }
      });
    } else if (this.user) {
      const dto: UpdateUserDTO = {
        id: this.user.id,
        ...this.userForm.value
      };

      this.userService.updateUser(dto).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.saved.emit(user);
          this.close();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to update user';
        }
      });
    }
  }

  close(): void {
    this.userForm.reset();
    this.errorMessage = '';
    this.closed.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
        return `${displayName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      }
    }
    return '';
  }
}

