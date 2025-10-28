import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Eye } from 'lucide-angular';
import { WarehouseService } from '@services/warehouse.service';
import { WarehouseSummaryDto } from '@models/warehouse.model';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit, OnDestroy {
  warehouses: WarehouseSummaryDto[] = [];
  loading = true;
  error: string | null = null;

  readonly Eye = Eye;

  private destroy$ = new Subject<void>();

  constructor(
    private warehouseService: WarehouseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  private addSampleData(): void {
    // Sample data matching the image
    this.warehouses = [
      {
        id: '1',
        name: 'Warehouse DOH-01',
        code: 'DOH-01',
        neqPercentage: 90,
        consumedPercentage: 95,
        totalCapacity: 10000,
        currentStock: 9500
      },
      {
        id: '2',
        name: 'Warehouse DOH-02',
        code: 'DOH-02',
        neqPercentage: 45,
        consumedPercentage: 80,
        totalCapacity: 8000,
        currentStock: 6400
      },
      {
        id: '3',
        name: 'Warehouse DOH-03',
        code: 'DOH-03',
        neqPercentage: 30,
        consumedPercentage: 50,
        totalCapacity: 6000,
        currentStock: 3000
      }
    ];
    this.loading = false;
    this.error = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWarehouses(): void {
    this.loading = true;
    this.error = null;

    this.warehouseService.getWarehouseSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (warehouses) => {
          this.warehouses = warehouses;
          this.loading = false;
        },
        error: (error) => {
          console.warn('API not available, using sample data:', error.message);
          // Fallback to sample data when API is not available
          this.addSampleData();
        }
      });
  }

  onViewWarehouse(warehouseId: string): void {
    // Navigate to warehouse inventory detail page
    this.router.navigate(['/warehouse', warehouseId, 'inventory']);
  }

  refreshWarehouses(): void {
    this.loadWarehouses();
  }
}
