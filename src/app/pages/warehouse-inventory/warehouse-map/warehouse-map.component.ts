import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { WarehouseService } from '@services/warehouse.service';
import { WarehouseLocationDto } from '@models/warehouse.model';

@Component({
  selector: 'app-warehouse-map',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './warehouse-map.component.html',
  styleUrls: ['./warehouse-map.component.css']
})
export class WarehouseMapComponent implements OnInit, OnDestroy {
  warehouseId: string = '';
  itemId: string = '';
  loading = true;
  
  readonly ArrowLeft = ArrowLeft;

  warehouses: WarehouseLocationDto[] = [];
  selectedWarehouse: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.warehouseId = params['warehouseId'];
      this.itemId = params['itemId'];
      this.loadWarehouseLocations();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWarehouseLocations(): void {
    this.loading = true;
    this.warehouseService.getWarehouseLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.warehouses = locations;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load warehouse locations:', error);
          // Fallback to sample data if API fails
          this.loadFallbackData();
          this.loading = false;
        }
      });
  }

  private loadFallbackData(): void {
    // Fallback data for development/testing
    this.warehouses = [
      { 
        id: '1', 
        name: 'DOH-01', 
        code: 'DOH-01',
        location: 'Doha North',
        mapPosition: { top: '15%', left: '65%' }, 
        color: 'green',
        isActive: true
      },
      { 
        id: '2', 
        name: 'DOH-02', 
        code: 'DOH-02',
        location: 'Doha Central',
        mapPosition: { top: '28%', left: '58%' }, 
        color: 'green',
        isActive: true
      },
      { 
        id: '3', 
        name: 'DOH-03', 
        code: 'DOH-03',
        location: 'Doha South',
        mapPosition: { top: '85%', left: '55%' }, 
        color: 'green',
        isActive: true
      }
    ];
  }

  onBack(): void {
    this.router.navigate(['/warehouse', this.warehouseId, 'inventory', this.itemId]);
  }

  selectWarehouse(warehouseId: string): void {
    this.selectedWarehouse = warehouseId;
  }
}

