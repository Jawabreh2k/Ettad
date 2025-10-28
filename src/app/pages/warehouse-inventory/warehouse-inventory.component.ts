import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-angular';
import { WarehouseService } from '@services/warehouse.service';
import { 
  WarehouseInventoryItem, 
  WarehouseInventoryResponse, 
  WarehouseInventoryRequest,
  WarehouseInventorySummary 
} from '@models/warehouse-inventory.model';
import { WarehouseDto } from '@models/warehouse.model';
import { ItemDetailsModalComponent } from './components/item-details-modal/item-details-modal.component';

@Component({
  selector: 'app-warehouse-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, TranslateModule, ItemDetailsModalComponent],
  templateUrl: './warehouse-inventory.component.html',
  styleUrls: ['./warehouse-inventory.component.css']
})
export class WarehouseInventoryComponent implements OnInit, OnDestroy {
  warehouseId: string = '';
  warehouseName: string = '';
  inventoryItems: WarehouseInventoryItem[] = [];
  inventorySummary: WarehouseInventorySummary | null = null;
  loading = true;
  error: string | null = null;
  isModalOpen = false;
  selectedItem: WarehouseInventoryItem | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 5; // Smaller page size to show pagination
  totalCount = 0;
  totalPages = 0;

  readonly ArrowLeft = ArrowLeft;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly ChevronDown = ChevronDown;

  private destroy$ = new Subject<void>();

  constructor(
    private warehouseService: WarehouseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.warehouseId = params['id'];
      if (this.warehouseId) {
        this.loadWarehouseDetails();
      }
    });
  }

  private loadWarehouseDetails(): void {
    this.loading = true;
    this.error = null;

    // First, get the warehouse details to get the name
    this.warehouseService.getWarehouseById(this.warehouseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (warehouse: WarehouseDto) => {
          this.warehouseName = warehouse.name;
          this.loadWarehouseInventory();
        },
        error: (error) => {
          console.warn('API not available, using sample data:', error.message);
          this.loadSampleWarehouseData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWarehouseInventory(): void {
    this.error = null;

    const request: WarehouseInventoryRequest = {
      warehouseId: this.warehouseId,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.warehouseService.getWarehouseInventory(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.inventoryItems = response.items;
          this.inventorySummary = response.summary;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.warn('API not available, using sample data:', error.message);
          this.addSampleData();
        }
      });
  }

  private loadSampleWarehouseData(): void {
    // Set warehouse name based on ID
    this.setWarehouseNameFromId();
    this.addSampleData();
  }

  private setWarehouseNameFromId(): void {
    // Map warehouse IDs to names based on the sample data from warehouse component
    const warehouseNames: { [key: string]: string } = {
      '1': 'Warehouse DOH-01',
      '2': 'Warehouse DOH-02', 
      '3': 'Warehouse DOH-03'
    };
    
    this.warehouseName = warehouseNames[this.warehouseId] || `Warehouse ${this.warehouseId}`;
  }

  private generateDynamicInventoryData(): WarehouseInventoryItem[] {
    const calibers = [
      '5.56x45 mm', '9x19 mm', '5.45x39 mm', '7.62x39mm', 
      '7.62x51mm', '12.7x51mm', '7.62x54mm', '9x21mm',
      '5.7x28mm', '7.62x25mm', '9x18mm', '5.45x39mm'
    ];
    
    const natures = [
      'Ball (FMJ)', 'Ball', 'Tracer', 'Training', 'Blank', 
      'Blank-Linked', 'AP', 'HP', 'Subsonic', 'Match'
    ];
    
    const suppliers = [
      'Poongsan', 'Barood', 'KINTEX', 'TANEO GROUP', 'Nammo', 
      'OMPC', 'POF', 'IMI', 'Federal', 'Winchester', 'Remington'
    ];

    // Generate different number of items based on warehouse ID
    const itemCounts = { '1': 8, '2': 12, '3': 6 };
    const itemCount = itemCounts[this.warehouseId as keyof typeof itemCounts] || 8;
    
    const items: WarehouseInventoryItem[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const caliber = calibers[Math.floor(Math.random() * calibers.length)];
      const nature = natures[Math.floor(Math.random() * natures.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      // Generate dynamic quantities based on warehouse ID
      const baseQuantities = { '1': 50000, '2': 30000, '3': 25000 };
      const baseQuantity = baseQuantities[this.warehouseId as keyof typeof baseQuantities] || 30000;
      const quantity = baseQuantity + Math.floor(Math.random() * baseQuantity);
      
      // Generate dynamic expiry dates (1-10 years from now)
      const yearsFromNow = 1 + Math.floor(Math.random() * 10);
      const monthsFromNow = Math.floor(Math.random() * 12);
      const daysFromNow = Math.floor(Math.random() * 28);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + yearsFromNow);
      expiryDate.setMonth(expiryDate.getMonth() + monthsFromNow);
      expiryDate.setDate(expiryDate.getDate() + daysFromNow);
      
      // Generate lot number
      const lot = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      
      // Calculate NEQ based on quantity and caliber
      const neqMultiplier = caliber.includes('12.7') ? 0.8 : caliber.includes('7.62') ? 0.6 : 0.4;
      const netExplosiveQuantity = Math.round((quantity * neqMultiplier) / 1000 * 100) / 100;
      
      items.push({
        id: `${this.warehouseId}-${i + 1}`,
        warehouseId: this.warehouseId,
        caliber,
        nature,
        supplier,
        lot,
        quantity,
        expiryDate,
        netExplosiveQuantity,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return items;
  }

  private addSampleData(): void {
    // Generate dynamic inventory data based on warehouse ID
    this.inventoryItems = this.generateDynamicInventoryData();

    this.inventorySummary = {
      warehouseId: this.warehouseId,
      warehouseName: this.warehouseName,
      totalItems: this.inventoryItems.length,
      totalQuantity: this.inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      netExplosiveQuantity: this.inventoryItems.reduce((sum, item) => sum + item.netExplosiveQuantity, 0),
      neqStatus: this.getNEQStatus(this.warehouseId),
      neqPercentage: this.getNEQPercentage(this.warehouseId),
      warningMessage: this.getWarningMessage(this.warehouseId)
    };

    this.totalCount = this.inventoryItems.length;
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    this.loading = false;
    this.error = null;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadWarehouseInventory();
    }
  }

  onBackToWarehouses(): void {
    this.router.navigate(['/warehouse']);
  }

  onViewItem(itemId: string): void {
    const item = this.inventoryItems.find(i => i.id === itemId);
    if (item) {
      this.selectedItem = item;
      this.isModalOpen = true;
    }
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.selectedItem = null;
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1; // Reset to first page
    this.loadWarehouseInventory();
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

  getNEQStatusColor(status: string): string {
    switch (status) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getNEQGaugeRotation(percentage: number): string {
    // Convert percentage to rotation angle (0-180 degrees)
    const rotation = (percentage / 100) * 180;
    return `rotate(${rotation}deg)`;
  }

  private getNEQStatus(warehouseId: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    const statuses: { [key: string]: 'Low' | 'Medium' | 'High' | 'Critical' } = { 
      '1': 'High', 
      '2': 'Medium', 
      '3': 'Low' 
    };
    return statuses[warehouseId] || 'Medium';
  }

  private getNEQPercentage(warehouseId: string): number {
    const percentages = { '1': 85, '2': 65, '3': 45 };
    return percentages[warehouseId as keyof typeof percentages] || 65;
  }

  private getWarningMessage(warehouseId: string): string | undefined {
    const warnings = { 
      '1': 'Inventory has reached maximum amount of explosives',
      '2': 'Inventory levels are moderate',
      '3': 'Inventory levels are low'
    };
    return warnings[warehouseId as keyof typeof warnings];
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
