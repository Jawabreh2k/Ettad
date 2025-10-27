import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserStatus, CreateUserDTO, UpdateUserDTO, UserFilter, getFullName } from '@models/user.model';
import { RoleService } from './role.service';
import { RoleType } from '@models/role.model';

/**
 * User Management Service
 * Handles CRUD operations for users
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private mockUsers: User[] = [];

  constructor(private roleService: RoleService) {
    this.initializeMockUsers();
  }

  private async initializeMockUsers() {
    // Wait for roles to load
    this.roleService.getRoles().subscribe(roles => {
      this.mockUsers = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@barzan.com',
          phone: '+974 1234 5678',
          role: roles.find(r => r.roleType === RoleType.SUPER_ADMIN)!,
          status: UserStatus.ACTIVE,
          lastLogin: new Date('2024-01-15T10:30:00'),
          createdAt: new Date('2024-01-01'),
          department: 'IT'
        },
        {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@barzan.com',
          phone: '+974 2345 6789',
          role: roles.find(r => r.roleType === RoleType.ADMIN)!,
          status: UserStatus.ACTIVE,
          lastLogin: new Date('2024-01-14T15:45:00'),
          createdAt: new Date('2024-01-02'),
          department: 'Operations'
        },
        {
          id: 'user-3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@barzan.com',
          phone: '+974 3456 7890',
          role: roles.find(r => r.roleType === RoleType.MANAGER)!,
          status: UserStatus.ACTIVE,
          lastLogin: new Date('2024-01-13T09:15:00'),
          createdAt: new Date('2024-01-03'),
          department: 'Logistics'
        },
        {
          id: 'user-4',
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah.williams@barzan.com',
          phone: '+974 4567 8901',
          role: roles.find(r => r.roleType === RoleType.MODERATOR)!,
          status: UserStatus.INACTIVE,
          lastLogin: new Date('2024-01-10T14:20:00'),
          createdAt: new Date('2024-01-04'),
          department: 'Inventory'
        },
        {
          id: 'user-5',
          firstName: 'Ahmed',
          lastName: 'Al-Mansouri',
          email: 'ahmed.almansouri@barzan.com',
          phone: '+974 5678 9012',
          role: roles.find(r => r.roleType === RoleType.ADMIN)!,
          status: UserStatus.ACTIVE,
          lastLogin: new Date('2024-01-15T08:00:00'),
          createdAt: new Date('2024-01-05'),
          department: 'Security'
        }
      ];

      this.usersSubject.next([...this.mockUsers]);
    });
  }

  /**
   * Get all users
   */
  getUsers(filter?: UserFilter): Observable<User[]> {
    let filtered = [...this.mockUsers];

    if (filter) {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(user => 
          getFullName(user).toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower)
        );
      }

      if (filter.roleId) {
        filtered = filtered.filter(user => user.role.id === filter.roleId);
      }

      if (filter.status) {
        filtered = filtered.filter(user => user.status === filter.status);
      }

      if (filter.department) {
        filtered = filtered.filter(user => user.department === filter.department);
      }
    }

    return of(filtered).pipe(delay(300));
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user).pipe(delay(200));
  }

  /**
   * Create new user
   */
  createUser(dto: CreateUserDTO): Observable<User> {
    return new Observable(observer => {
      this.roleService.getRoleById(dto.roleId).subscribe(role => {
        if (!role) {
          observer.error(new Error('Role not found'));
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          role: role,
          status: dto.status || UserStatus.ACTIVE,
          createdAt: new Date(),
          department: dto.department
        };

        this.mockUsers.push(newUser);
        
        // Update role user count
        role.userCount++;
        
        this.usersSubject.next([...this.mockUsers]);
        
        setTimeout(() => {
          observer.next(newUser);
          observer.complete();
        }, 500);
      });
    });
  }

  /**
   * Update existing user
   */
  updateUser(dto: UpdateUserDTO): Observable<User> {
    return new Observable(observer => {
      const index = this.mockUsers.findIndex(u => u.id === dto.id);
      
      if (index === -1) {
        observer.error(new Error('User not found'));
        return;
      }

      const updateUser = (role?: any) => {
        const updatedUser: User = {
          ...this.mockUsers[index],
          ...(dto.firstName && { firstName: dto.firstName }),
          ...(dto.lastName && { lastName: dto.lastName }),
          ...(dto.email && { email: dto.email }),
          ...(dto.phone && { phone: dto.phone }),
          ...(dto.department && { department: dto.department }),
          ...(dto.status && { status: dto.status }),
          ...(role && { role }),
          updatedAt: new Date()
        };

        this.mockUsers[index] = updatedUser;
        this.usersSubject.next([...this.mockUsers]);
        
        setTimeout(() => {
          observer.next(updatedUser);
          observer.complete();
        }, 500);
      };

      if (dto.roleId) {
        this.roleService.getRoleById(dto.roleId).subscribe(role => {
          if (!role) {
            observer.error(new Error('Role not found'));
            return;
          }
          updateUser(role);
        });
      } else {
        updateUser();
      }
    });
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<boolean> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    
    if (index !== -1) {
      const user = this.mockUsers[index];
      
      // Update role user count
      if (user.role) {
        user.role.userCount--;
      }
      
      this.mockUsers.splice(index, 1);
      this.usersSubject.next([...this.mockUsers]);
      
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  /**
   * Toggle user status
   */
  toggleUserStatus(id: string): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    
    if (index !== -1) {
      const currentStatus = this.mockUsers[index].status;
      this.mockUsers[index].status = currentStatus === UserStatus.ACTIVE 
        ? UserStatus.INACTIVE 
        : UserStatus.ACTIVE;
      this.mockUsers[index].updatedAt = new Date();
      
      this.usersSubject.next([...this.mockUsers]);
      
      return of(this.mockUsers[index]).pipe(delay(500));
    }

    throw new Error('User not found');
  }

  /**
   * Get users by role
   */
  getUsersByRole(roleId: string): Observable<User[]> {
    const users = this.mockUsers.filter(u => u.role.id === roleId);
    return of(users).pipe(delay(200));
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [key: string]: number };
  }> {
    const stats = {
      total: this.mockUsers.length,
      active: this.mockUsers.filter(u => u.status === UserStatus.ACTIVE).length,
      inactive: this.mockUsers.filter(u => u.status === UserStatus.INACTIVE).length,
      byRole: {} as { [key: string]: number }
    };

    this.mockUsers.forEach(user => {
      const roleName = user.role.name;
      stats.byRole[roleName] = (stats.byRole[roleName] || 0) + 1;
    });

    return of(stats).pipe(delay(200));
  }
}

