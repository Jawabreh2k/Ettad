import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { WarehouseInventoryItem } from '@models/warehouse-inventory.model';

type TabType = 'overview' | 'stock' | 'orders' | 'supplier';

interface StockLot {
  lotNumber: string;
  totalQuantity: number;
  utilization: number;
  availableInventory: number;
  status: 'New' | 'Used';
  expiryDate: Date;
}

interface Order {
  issueNo: string;
  requestType: 'Issue' | 'Return';
  quantity: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requestDate: Date;
  status: 'Processing' | 'Completed' | 'Delivered';
}

interface Supplier {
  name: string;
  ncage: string;
  country: string;
  leadTime: string;
  contact: string;
}

@Component({
  selector: 'app-inventory-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './inventory-item-detail.component.html',
  styleUrls: ['./inventory-item-detail.component.css']
})
export class InventoryItemDetailComponent implements OnInit, OnDestroy {
  itemId: string = '';
  warehouseId: string = '';
  item: WarehouseInventoryItem | null = null;
  activeTab: TabType = 'overview';
  loading = true;
  
  // Stock data
  stockLots: StockLot[] = [];
  
  // Orders data
  orders: Order[] = [];
  currentOrdersPage = 1;
  ordersPerPage = 7;
  
  // Supplier data
  suppliers: Supplier[] = [];

  readonly ArrowLeft = ArrowLeft;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.warehouseId = params['warehouseId'];
      this.itemId = params['itemId'];
      if (this.warehouseId && this.itemId) {
        this.loadItemDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadItemDetails(): void {
    // In a real app, this would call an API
    // For now, we'll generate sample data based on itemId
    this.generateSampleData();
    this.loading = false;
  }

  private generateSampleData(): void {
    // Generate item details
    const calibers = ['5.56 mm x 45 Ball (FMJ), M193', '9x19 mm Ball', '7.62x39mm Ball'];
    const natures = ['N-Ammunition', 'Ammunition', 'Training'];
    const purposes = ['Anti-Personnel', 'Training', 'Combat'];
    const colors = ['No Color - Plain', 'Red', 'Green'];
    
    const index = parseInt(this.itemId.split('-')[1]) || 1;
    
    this.item = {
      id: this.itemId,
      warehouseId: this.warehouseId,
      caliber: calibers[index % calibers.length],
      nature: natures[index % natures.length],
      supplier: 'Poongsan',
      lot: '13',
      quantity: 150000,
      expiryDate: new Date('2024-11-20'),
      netExplosiveQuantity: 45.5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate stock lots
    this.stockLots = [
      {
        lotNumber: 'Lot 13',
        totalQuantity: 150000,
        utilization: 22,
        availableInventory: 30000,
        status: 'New',
        expiryDate: new Date('2024-11-20')
      },
      {
        lotNumber: 'Lot 40',
        totalQuantity: 19000,
        utilization: 80,
        availableInventory: 7000,
        status: 'Used',
        expiryDate: new Date('2025-02-13')
      },
      {
        lotNumber: 'Lot 13',
        totalQuantity: 50000,
        utilization: 22,
        availableInventory: 21000,
        status: 'New',
        expiryDate: new Date('2024-11-20')
      }
    ];

    // Generate orders
    this.orders = [
      {
        issueNo: '#1056',
        requestType: 'Issue',
        quantity: 30000,
        priority: 'Low',
        requestDate: new Date('2024-09-10'),
        status: 'Processing'
      },
      {
        issueNo: '#1055',
        requestType: 'Issue',
        quantity: 200000,
        priority: 'High',
        requestDate: new Date('2024-09-01'),
        status: 'Completed'
      },
      {
        issueNo: '#1054',
        requestType: 'Return',
        quantity: 15000,
        priority: 'Low',
        requestDate: new Date('2024-08-29'),
        status: 'Delivered'
      },
      {
        issueNo: '#1053',
        requestType: 'Issue',
        quantity: 150000,
        priority: 'Critical',
        requestDate: new Date('2024-08-23'),
        status: 'Delivered'
      },
      {
        issueNo: '#1052',
        requestType: 'Issue',
        quantity: 40000,
        priority: 'Low',
        requestDate: new Date('2024-08-19'),
        status: 'Processing'
      },
      {
        issueNo: '#1051',
        requestType: 'Issue',
        quantity: 300000,
        priority: 'High',
        requestDate: new Date('2024-08-10'),
        status: 'Completed'
      },
      {
        issueNo: '#1050',
        requestType: 'Return',
        quantity: 100000,
        priority: 'Low',
        requestDate: new Date('2024-08-01'),
        status: 'Processing'
      }
    ];

    // Generate suppliers
    this.suppliers = [
      {
        name: 'Poongsan',
        ncage: 'SP300',
        country: 'Republic of Korea',
        leadTime: '8 months',
        contact: 'info@poongsan.com'
      },
      {
        name: 'Sellier & Bellot',
        ncage: '2241G',
        country: 'Czech Republic',
        leadTime: '4 months',
        contact: 'info@sb.com'
      }
    ];
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  onBack(): void {
    this.router.navigate(['/warehouse', this.warehouseId, 'inventory']);
  }

  onMapView(): void {
    this.router.navigate(['/warehouse', this.warehouseId, 'inventory', this.itemId, 'map']);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Low': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'High': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Critical': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Processing': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Completed': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Delivered': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  }

  getLotStatusClass(status: string): string {
    switch (status) {
      case 'New': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Used': return 'bg-gray-50 text-gray-700 border border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  }

  get paginatedOrders(): Order[] {
    const startIndex = (this.currentOrdersPage - 1) * this.ordersPerPage;
    const endIndex = startIndex + this.ordersPerPage;
    return this.orders.slice(startIndex, endIndex);
  }

  get totalOrdersPages(): number {
    return Math.ceil(this.orders.length / this.ordersPerPage);
  }

  getOrdersPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalOrdersPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onOrdersPageChange(page: number): void {
    if (page >= 1 && page <= this.totalOrdersPages) {
      this.currentOrdersPage = page;
    }
  }
}

