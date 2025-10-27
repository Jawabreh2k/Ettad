import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User, UserStatus } from '@models/user.model';
import { StorageService } from './storage.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private storageService: StorageService) {}

  /**
   * Check if user is authenticated on service initialization
   */
  private checkAuthStatus(): void {
    try {
      const token = this.storageService.get<string>('auth_token');
      const user = this.storageService.get<User>('current_user');
      
      if (token && user) {
        this.populateUserPermissions(user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      this.clearAuthData();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return of(credentials).pipe(
      delay(800),
      map(creds => {
        const mockUser = this.getMockUserByEmail(creds.email);
        
        if (!mockUser) {
          throw new Error('Invalid email or password');
        }

        if (!creds.password || creds.password.length < 6) {
          throw new Error('Invalid email or password');
        }

        if (mockUser.status !== UserStatus.ACTIVE) {
          throw new Error(`Account is ${mockUser.status}. Please contact support.`);
        }

        this.populateUserPermissions(mockUser);
        const token = this.generateMockToken(mockUser);
        mockUser.lastLogin = new Date();

        return {
          user: mockUser,
          token: token,
          expiresIn: 3600
        };
      }),
      tap(response => {
        this.storageService.set('auth_token', response.token);
        this.storageService.set('current_user', response.user);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): Observable<boolean> {
    return of(true).pipe(
      delay(300),
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  /**
   * Get current logged-in user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if current user has a specific permission
   * Permission is checked by displayName (e.g., 'View Users')
   */
  hasPermission(permissionName: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Check by displayName or name
    return user.role.permissions.some(p => 
      p.displayName.toLowerCase() === permissionName.toLowerCase() ||
      p.name.toLowerCase() === permissionName.toLowerCase()
    );
  }

  /**
   * Check if current user has any of the specified permissions
   */
  hasAnyPermission(permissionKeys: string[]): boolean {
    return permissionKeys.some(key => this.hasPermission(key));
  }

  /**
   * Check if current user has all of the specified permissions
   */
  hasAllPermissions(permissionKeys: string[]): boolean {
    return permissionKeys.every(key => this.hasPermission(key));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    this.storageService.remove('auth_token');
    this.storageService.remove('current_user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Generate mock JWT token
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      roleId: user.role.id,
      iat: Date.now(),
      exp: Date.now() + 3600000
    }));
    const signature = btoa('mock-signature-' + user.id);
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Get mock user by email
   */
  private getMockUserByEmail(email: string): User | null {
    const mockUsers = this.getMockUsers();
    return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Mock users for testing
   */
  private getMockUsers(): User[] {
    return [
      {
        id: '1',
        firstName: 'Ahmed',
        lastName: 'Al-Mansoori',
        email: 'admin@barzan.com',
        phone: '+974 4444 1111',
        role: {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          roleType: 'super_admin' as any,
          userCount: 2,
          permissions: [],
          isActive: true,
          isDefault: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        department: 'IT Administration',
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-10-26')
      },
      {
        id: '2',
        firstName: 'Fatima',
        lastName: 'Al-Thani',
        email: 'manager@barzan.com',
        phone: '+974 4444 2222',
        role: {
          id: '2',
          name: 'Asset Manager',
          description: 'Manages assets and inventory operations',
          roleType: 'manager' as any,
          userCount: 5,
          permissions: [],
          isActive: true,
          isDefault: false,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        department: 'Operations',
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-10-25')
      },
      {
        id: '3',
        firstName: 'Mohammed',
        lastName: 'Al-Kuwari',
        email: 'viewer@barzan.com',
        phone: '+974 4444 3333',
        role: {
          id: '6',
          name: 'Viewer',
          description: 'Read-only access to view information',
          roleType: 'viewer' as any,
          userCount: 12,
          permissions: [],
          isActive: true,
          isDefault: false,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01')
        },
        department: 'Finance',
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        lastLogin: new Date('2024-10-24')
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Al-Dosari',
        email: 'user@barzan.com',
        phone: '+974 4444 4444',
        role: {
          id: '5',
          name: 'User',
          description: 'Standard user with basic permissions',
          roleType: 'user' as any,
          userCount: 25,
          permissions: [],
          isActive: true,
          isDefault: true,
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-02-10')
        },
        department: 'Operations',
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        lastLogin: new Date('2024-10-23')
      }
    ];
  }

  /**
   * Populate permissions for a user based on their role
   */
  private populateUserPermissions(user: User): void {
    const allPermissions = this.getAllPermissions();
    
    switch (user.role.roleType) {
      case 'super_admin':
        user.role.permissions = allPermissions;
        break;
      case 'manager':
        user.role.permissions = allPermissions.filter(p => 
          ['asset.view', 'asset.create', 'asset.edit', 'inventory.view', 'inventory.manage', 'request.view'].includes(p.name)
        );
        break;
      case 'viewer':
        user.role.permissions = allPermissions.filter(p => 
          ['asset.view', 'inventory.view', 'dashboard.view'].includes(p.name)
        );
        break;
      case 'user':
        user.role.permissions = allPermissions.filter(p => 
          ['asset.view', 'request.view', 'request.create', 'dashboard.view'].includes(p.name)
        );
        break;
      default:
        user.role.permissions = [];
    }
  }

  /**
   * Get all available permissions
   */
  private getAllPermissions() {
    const permissions = [
      // User Management
      { name: 'user.view', displayName: 'View Users', description: 'Can view user information', category: 'users' as any, module: 'user', action: 'view' as any },
      { name: 'user.create', displayName: 'Create Users', description: 'Can create new users', category: 'users' as any, module: 'user', action: 'create' as any },
      { name: 'user.edit', displayName: 'Edit Users', description: 'Can modify user information', category: 'users' as any, module: 'user', action: 'edit' as any },
      { name: 'user.delete', displayName: 'Delete Users', description: 'Can delete users', category: 'users' as any, module: 'user', action: 'delete' as any },
      
      // Role Management
      { name: 'role.view', displayName: 'View Roles', description: 'Can view role information', category: 'roles' as any, module: 'role', action: 'view' as any },
      { name: 'role.create', displayName: 'Create Roles', description: 'Can create new roles', category: 'roles' as any, module: 'role', action: 'create' as any },
      { name: 'role.edit', displayName: 'Edit Roles', description: 'Can modify role information', category: 'roles' as any, module: 'role', action: 'edit' as any },
      { name: 'role.delete', displayName: 'Delete Roles', description: 'Can delete roles', category: 'roles' as any, module: 'role', action: 'delete' as any },
      
      // Asset Management
      { name: 'asset.view', displayName: 'View Assets', description: 'Can view asset information', category: 'assets' as any, module: 'asset', action: 'view' as any },
      { name: 'asset.create', displayName: 'Create Assets', description: 'Can create new assets', category: 'assets' as any, module: 'asset', action: 'create' as any },
      { name: 'asset.edit', displayName: 'Edit Assets', description: 'Can modify asset information', category: 'assets' as any, module: 'asset', action: 'edit' as any },
      { name: 'asset.delete', displayName: 'Delete Assets', description: 'Can delete assets', category: 'assets' as any, module: 'asset', action: 'delete' as any },
      
      // Inventory Management
      { name: 'inventory.view', displayName: 'View Inventory', description: 'Can view inventory', category: 'inventory' as any, module: 'inventory', action: 'view' as any },
      { name: 'inventory.manage', displayName: 'Manage Inventory', description: 'Can manage inventory', category: 'inventory' as any, module: 'inventory', action: 'edit' as any },
      
      // Request Management
      { name: 'request.view', displayName: 'View Requests', description: 'Can view requests', category: 'requests' as any, module: 'request', action: 'view' as any },
      { name: 'request.create', displayName: 'Create Requests', description: 'Can create new requests', category: 'requests' as any, module: 'request', action: 'create' as any },
      { name: 'request.approve', displayName: 'Approve Requests', description: 'Can approve/reject requests', category: 'requests' as any, module: 'request', action: 'approve' as any },
      { name: 'request.manage', displayName: 'Manage Requests', description: 'Can manage all requests', category: 'requests' as any, module: 'request', action: 'edit' as any },
      
      // Dashboard
      { name: 'dashboard.view', displayName: 'View Dashboard', description: 'Can access dashboard', category: 'dashboard' as any, module: 'dashboard', action: 'view' as any },
      
      // Settings
      { name: 'settings.view', displayName: 'View Settings', description: 'Can view system settings', category: 'settings' as any, module: 'settings', action: 'view' as any },
      { name: 'settings.edit', displayName: 'Edit Settings', description: 'Can modify system settings', category: 'settings' as any, module: 'settings', action: 'edit' as any }
    ];

    return permissions.map((p, index) => ({
      id: `perm_${index + 1}`,
      name: p.name,
      displayName: p.displayName,
      description: p.description,
      category: p.category,
      module: p.module,
      action: p.action,
      isSelected: false
    }));
  }
}

