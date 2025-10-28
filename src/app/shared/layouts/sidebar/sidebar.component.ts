import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, LayoutDashboard, Users, ChevronLeft, ChevronRight, List, Shield, Search, FileText, Plus, TrendingUp, File, RotateCcw, Settings, Warehouse } from 'lucide-angular';
import { BackendAuthService } from '@services/backend-auth.service';

interface MenuItem {
  label: string;
  icon?: any;
  route?: string;
  isHeader?: boolean;
  children?: MenuItem[];
  permissions?: string[]; // Required permissions (any of these)
  requireAll?: boolean; // If true, all permissions required
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<boolean>();

  isCollapsed = false;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  private destroy$ = new Subject<void>();

  // All menu items with permission requirements
  private allMenuItems: MenuItem[] = [
    {
      label: 'nav.dashboard',
      icon: LayoutDashboard,
      route: '/dashboard',
      permissions: ['dashboard.view']
    },
    {
      label: 'nav.warehouse',
      icon: Warehouse,
      route: '/warehouse',
      permissions: ['warehouse.view']
    },
    {
      label: "nav.newIssueRequest",
      icon: File,
      route: '/new-issue-request',
      permissions: ['request.create']
    },
    {
      label: 'nav.returnRequest',
      icon: RotateCcw,
      route: '/return-request',
      permissions: ['request.create']
    },
    {
      label: 'nav.requestsManagement',
      icon: FileText,
      route: '/requests-management',
      permissions: ['request.view', 'request.manage']
    },
    {
      label: 'nav.forecast',
      icon: TrendingUp,
      route: '/forecast',
      permissions: ['dashboard.view']
    },
    {
      label: 'nav.inventory',
      isHeader: true
    },
    {
      label: 'nav.addAsset',
      icon: Plus,
      route: '/add-asset',
      permissions: ['asset.create']
    },
    {
      label: 'nav.assetList',
      icon: List,
      route: '/asset-list',
      permissions: ['asset.view']
    },
    {
      label: 'nav.searchInventory',
      icon: Search,
      route: '/search-inventory',
      permissions: ['inventory.view']
    },
    {
      label: 'nav.admin',
      isHeader: true,
      permissions: ['user.view', 'role.view'] // Show header if user has any admin permissions
    },
    {
      label: 'nav.manageAdmins',
      icon: Users,
      route: '/manage-admins',
      permissions: ['user.view']
    },
    {
      label: 'nav.adminRoles',
      icon: Shield,
      route: '/admin-roles',
      permissions: ['role.view']
    },
    {
      label: 'nav.rolePermissions',
      icon: Settings,
      route: '/role-permissions',
      permissions: ['role.edit']
    }
  ];

  menuItems: MenuItem[] = [];

  constructor(private authService: BackendAuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes and filter menu items
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filterMenuItems();
      });
    
    // Initial filter
    this.filterMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Filter menu items based on user permissions
   */
  private filterMenuItems(): void {
    const user = this.authService.getCurrentUser();
    const hasPermissionsLoaded = user && user.permissions && user.permissions.length > 0;
    
    this.menuItems = this.allMenuItems.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      if (!hasPermissionsLoaded) {
        return true;
      }

      return item.requireAll
        ? this.authService.hasAllPermissions(item.permissions)
        : this.authService.hasAnyPermission(item.permissions);
    });

    // Remove headers that have no children
    this.menuItems = this.menuItems.filter((item, index) => {
      if (!item.isHeader) return true;
      
      const nextItem = this.menuItems[index + 1];
      return nextItem && !nextItem.isHeader;
    });
  }

  /**
   * Check if user has permission to access a menu item
   */
  hasPermission(item: MenuItem): boolean {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    if (item.requireAll) {
      return this.authService.hasAllPermissions(item.permissions);
    } else {
      return this.authService.hasAnyPermission(item.permissions);
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }
}
