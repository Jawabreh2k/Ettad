import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { 
  Role, 
  Permission, 
  PermissionGroup, 
  RoleType, 
  PermissionCategory,
  PermissionAction,
  CreateRoleDTO,
  UpdateRoleDTO
} from '@models/role.model';

/**
 * Role Management Service
 * Handles CRUD operations for roles and permissions
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  private mockRoles: Role[] = [
    {
      id: 'role-1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: this.getAllPermissions(),
      userCount: 2,
      isDefault: false,
      isActive: true,
      roleType: RoleType.SUPER_ADMIN,
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'role-2',
      name: 'Admin',
      description: 'Administrative access with user and asset management',
      permissions: this.getAdminPermissions(),
      userCount: 5,
      isDefault: false,
      isActive: true,
      roleType: RoleType.ADMIN,
      createdAt: new Date('2024-01-02')
    },
    {
      id: 'role-3',
      name: 'Manager',
      description: 'Manager access for request and asset management',
      permissions: this.getManagerPermissions(),
      userCount: 8,
      isDefault: true,
      isActive: true,
      roleType: RoleType.MANAGER,
      createdAt: new Date('2024-01-03')
    },
    {
      id: 'role-4',
      name: 'Moderator',
      description: 'Limited access for asset viewing and request management',
      permissions: this.getModeratorPermissions(),
      userCount: 12,
      isDefault: false,
      isActive: true,
      roleType: RoleType.MODERATOR,
      createdAt: new Date('2024-01-04')
    }
  ];

  constructor() {
    this.rolesSubject.next(this.mockRoles);
  }

  /**
   * Get all roles
   */
  getRoles(): Observable<Role[]> {
    return of([...this.mockRoles]).pipe(delay(300));
  }

  /**
   * Get role by ID
   */
  getRoleById(id: string): Observable<Role | undefined> {
    const role = this.mockRoles.find(r => r.id === id);
    return of(role).pipe(delay(200));
  }

  /**
   * Create new role
   */
  createRole(dto: CreateRoleDTO): Observable<Role> {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: dto.name,
      description: dto.description,
      permissions: this.getPermissionsByIds(dto.permissions),
      userCount: 0,
      isDefault: dto.isDefault || false,
      isActive: dto.isActive !== false,
      roleType: dto.roleType,
      createdAt: new Date()
    };

    this.mockRoles.push(newRole);
    this.rolesSubject.next([...this.mockRoles]);
    
    return of(newRole).pipe(delay(500));
  }

  /**
   * Update existing role
   */
  updateRole(dto: UpdateRoleDTO): Observable<Role> {
    const index = this.mockRoles.findIndex(r => r.id === dto.id);
    
    if (index !== -1) {
      const updatedRole: Role = {
        ...this.mockRoles[index],
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.roleType && { roleType: dto.roleType }),
        ...(dto.permissions && { permissions: this.getPermissionsByIds(dto.permissions) }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedAt: new Date()
      };

      this.mockRoles[index] = updatedRole;
      this.rolesSubject.next([...this.mockRoles]);
      
      return of(updatedRole).pipe(delay(500));
    }

    throw new Error('Role not found');
  }

  /**
   * Delete role
   */
  deleteRole(id: string): Observable<boolean> {
    const index = this.mockRoles.findIndex(r => r.id === id);
    
    if (index !== -1) {
      if (this.mockRoles[index].isDefault) {
        throw new Error('Cannot delete default role');
      }
      
      this.mockRoles.splice(index, 1);
      this.rolesSubject.next([...this.mockRoles]);
      
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  /**
   * Get all available permission groups
   */
  getPermissionGroups(): Observable<PermissionGroup[]> {
    return of(this.buildPermissionGroups()).pipe(delay(200));
  }

  /**
   * Get permission groups for a role
   */
  getRolePermissionGroups(roleId: string): Observable<PermissionGroup[]> {
    const role = this.mockRoles.find(r => r.id === roleId);
    if (!role) {
      return of([]);
    }

    const groups = this.buildPermissionGroups();
    const rolePermissionIds = role.permissions.map(p => p.id);

    // Mark permissions as selected based on role
    groups.forEach(group => {
      group.permissions.forEach(permission => {
        permission.isSelected = rolePermissionIds.includes(permission.id);
      });
    });

    return of(groups).pipe(delay(200));
  }

  /**
   * Update role permissions
   */
  updateRolePermissions(roleId: string, permissionIds: string[]): Observable<boolean> {
    const index = this.mockRoles.findIndex(r => r.id === roleId);
    
    if (index !== -1) {
      this.mockRoles[index].permissions = this.getPermissionsByIds(permissionIds);
      this.mockRoles[index].updatedAt = new Date();
      this.rolesSubject.next([...this.mockRoles]);
      
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  /**
   * Duplicate role
   */
  duplicateRole(id: string): Observable<Role> {
    const role = this.mockRoles.find(r => r.id === id);
    
    if (!role) {
      throw new Error('Role not found');
    }

    const duplicatedRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      name: `${role.name} (Copy)`,
      userCount: 0,
      isDefault: false,
      createdAt: new Date()
    };

    this.mockRoles.push(duplicatedRole);
    this.rolesSubject.next([...this.mockRoles]);
    
    return of(duplicatedRole).pipe(delay(500));
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private buildPermissionGroups(): PermissionGroup[] {
    return [
      {
        category: PermissionCategory.DASHBOARD,
        displayName: 'Dashboard',
        description: 'Dashboard access and statistics',
        permissions: [
          this.createPermission('dashboard-view', 'View Dashboard', 'Access dashboard page', PermissionCategory.DASHBOARD, PermissionAction.VIEW),
          this.createPermission('dashboard-export', 'Export Dashboard Data', 'Export dashboard statistics', PermissionCategory.DASHBOARD, PermissionAction.EXPORT)
        ]
      },
      {
        category: PermissionCategory.USERS,
        displayName: 'User Management',
        description: 'Manage users and administrators',
        permissions: [
          this.createPermission('users-view', 'View Users', 'View user list', PermissionCategory.USERS, PermissionAction.VIEW),
          this.createPermission('users-create', 'Create Users', 'Add new users', PermissionCategory.USERS, PermissionAction.CREATE),
          this.createPermission('users-edit', 'Edit Users', 'Modify user details', PermissionCategory.USERS, PermissionAction.EDIT),
          this.createPermission('users-delete', 'Delete Users', 'Remove users from system', PermissionCategory.USERS, PermissionAction.DELETE)
        ]
      },
      {
        category: PermissionCategory.ROLES,
        displayName: 'Role Management',
        description: 'Manage roles and permissions',
        permissions: [
          this.createPermission('roles-view', 'View Roles', 'View role list', PermissionCategory.ROLES, PermissionAction.VIEW),
          this.createPermission('roles-create', 'Create Roles', 'Create new roles', PermissionCategory.ROLES, PermissionAction.CREATE),
          this.createPermission('roles-edit', 'Edit Roles', 'Modify role details and permissions', PermissionCategory.ROLES, PermissionAction.EDIT),
          this.createPermission('roles-delete', 'Delete Roles', 'Remove roles from system', PermissionCategory.ROLES, PermissionAction.DELETE)
        ]
      },
      {
        category: PermissionCategory.ASSETS,
        displayName: 'Asset Management',
        description: 'Manage inventory assets',
        permissions: [
          this.createPermission('assets-view', 'View Assets', 'View asset list', PermissionCategory.ASSETS, PermissionAction.VIEW),
          this.createPermission('assets-create', 'Add Assets', 'Add new assets', PermissionCategory.ASSETS, PermissionAction.CREATE),
          this.createPermission('assets-edit', 'Edit Assets', 'Modify asset details', PermissionCategory.ASSETS, PermissionAction.EDIT),
          this.createPermission('assets-delete', 'Delete Assets', 'Remove assets', PermissionCategory.ASSETS, PermissionAction.DELETE)
        ]
      },
      {
        category: PermissionCategory.INVENTORY,
        displayName: 'Inventory',
        description: 'Search and manage inventory',
        permissions: [
          this.createPermission('inventory-view', 'View Inventory', 'Search and view inventory', PermissionCategory.INVENTORY, PermissionAction.VIEW),
          this.createPermission('inventory-export', 'Export Inventory', 'Export inventory data', PermissionCategory.INVENTORY, PermissionAction.EXPORT)
        ]
      },
      {
        category: PermissionCategory.REQUESTS,
        displayName: 'Request Management',
        description: 'Manage issue, return, and discard requests',
        permissions: [
          this.createPermission('requests-view', 'View Requests', 'View all requests', PermissionCategory.REQUESTS, PermissionAction.VIEW),
          this.createPermission('requests-create', 'Create Requests', 'Create new requests', PermissionCategory.REQUESTS, PermissionAction.CREATE),
          this.createPermission('requests-edit', 'Edit Requests', 'Modify request details', PermissionCategory.REQUESTS, PermissionAction.EDIT),
          this.createPermission('requests-approve', 'Approve Requests', 'Approve pending requests', PermissionCategory.REQUESTS, PermissionAction.APPROVE),
          this.createPermission('requests-reject', 'Reject Requests', 'Reject requests', PermissionCategory.REQUESTS, PermissionAction.REJECT),
          this.createPermission('requests-delete', 'Delete Requests', 'Remove requests', PermissionCategory.REQUESTS, PermissionAction.DELETE)
        ]
      },
      {
        category: PermissionCategory.FORECAST,
        displayName: 'Forecast & Reports',
        description: 'View forecasts and generate reports',
        permissions: [
          this.createPermission('forecast-view', 'View Forecast', 'Access forecast page', PermissionCategory.FORECAST, PermissionAction.VIEW),
          this.createPermission('reports-view', 'View Reports', 'Access reports', PermissionCategory.REPORTS, PermissionAction.VIEW),
          this.createPermission('reports-export', 'Export Reports', 'Export report data', PermissionCategory.REPORTS, PermissionAction.EXPORT)
        ]
      },
      {
        category: PermissionCategory.SETTINGS,
        displayName: 'System Settings',
        description: 'System configuration and settings',
        permissions: [
          this.createPermission('settings-view', 'View Settings', 'View system settings', PermissionCategory.SETTINGS, PermissionAction.VIEW),
          this.createPermission('settings-edit', 'Edit Settings', 'Modify system settings', PermissionCategory.SETTINGS, PermissionAction.EDIT)
        ]
      }
    ];
  }

  private createPermission(
    id: string, 
    displayName: string, 
    description: string, 
    category: PermissionCategory, 
    action: PermissionAction
  ): Permission {
    return {
      id,
      name: id,
      displayName,
      description,
      category,
      isSelected: false,
      module: category,
      action
    };
  }

  private getPermissionsByIds(ids: string[]): Permission[] {
    const allPermissions = this.buildPermissionGroups()
      .flatMap(group => group.permissions);
    
    return allPermissions.filter(p => ids.includes(p.id));
  }

  private getAllPermissions(): Permission[] {
    return this.buildPermissionGroups().flatMap(group => group.permissions);
  }

  private getAdminPermissions(): Permission[] {
    const permissionIds = [
      'dashboard-view', 'dashboard-export',
      'users-view', 'users-create', 'users-edit',
      'roles-view', 'roles-edit',
      'assets-view', 'assets-create', 'assets-edit',
      'inventory-view', 'inventory-export',
      'requests-view', 'requests-create', 'requests-edit', 'requests-approve', 'requests-reject',
      'forecast-view', 'reports-view', 'reports-export'
    ];
    return this.getPermissionsByIds(permissionIds);
  }

  private getManagerPermissions(): Permission[] {
    const permissionIds = [
      'dashboard-view',
      'assets-view', 'assets-create', 'assets-edit',
      'inventory-view',
      'requests-view', 'requests-create', 'requests-edit', 'requests-approve',
      'forecast-view', 'reports-view'
    ];
    return this.getPermissionsByIds(permissionIds);
  }

  private getModeratorPermissions(): Permission[] {
    const permissionIds = [
      'dashboard-view',
      'assets-view',
      'inventory-view',
      'requests-view', 'requests-create',
      'forecast-view', 'reports-view'
    ];
    return this.getPermissionsByIds(permissionIds);
  }
}

