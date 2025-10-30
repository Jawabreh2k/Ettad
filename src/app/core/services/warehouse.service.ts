import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { API_ENDPOINTS } from '@constants/app.constants';
import { 
  WarehouseDto, 
  WarehouseSummaryDto, 
  CreateWarehouseDto, 
  UpdateWarehouseDto,
  WarehouseLocationDto
} from '@models/warehouse.model';
import {
  WarehouseInventoryItem,
  WarehouseInventoryResponse,
  WarehouseInventoryRequest,
  WarehouseInventorySummary
} from '@models/warehouse-inventory.model';
import { ApiResponse } from '@models/api-response.model';

/**
 * Warehouse Service
 * Handles all warehouse management operations with the backend
 */
@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private warehousesSubject = new BehaviorSubject<WarehouseDto[]>([]);
  public warehouses$ = this.warehousesSubject.asObservable();

  private warehouseSummarySubject = new BehaviorSubject<WarehouseSummaryDto[]>([]);
  public warehouseSummary$ = this.warehouseSummarySubject.asObservable();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  // ==================== WAREHOUSE MANAGEMENT ====================

  /**
   * Get all warehouses
   */
  getWarehouses(): Observable<WarehouseDto[]> {
    this.configService.log('Fetching all warehouses');

    return this.apiService.getWithAuth<ApiResponse<WarehouseDto[]>>(
      API_ENDPOINTS.WAREHOUSES.BASE
    ).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch warehouses');
        }
        return response.data || [];
      }),
      tap(warehouses => {
        this.warehousesSubject.next(warehouses);
        this.configService.log(`Fetched ${warehouses.length} warehouses`);
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouses', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouses'
        ));
      })
    );
  }

  /**
   * Get warehouse summary data for dashboard display
   */
  getWarehouseSummary(): Observable<WarehouseSummaryDto[]> {
    this.configService.log('Fetching warehouse summary');

    return this.apiService.getWithAuth<ApiResponse<WarehouseSummaryDto[]>>(
      API_ENDPOINTS.WAREHOUSES.SUMMARY
    ).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch warehouse summary');
        }
        return response.data || [];
      }),
      tap(summary => {
        this.warehouseSummarySubject.next(summary);
        this.configService.log(`Fetched summary for ${summary.length} warehouses`);
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouse summary', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouse summary'
        ));
      })
    );
  }

  /**
   * Get warehouse by ID
   */
  getWarehouseById(id: string): Observable<WarehouseDto> {
    this.configService.log('Fetching warehouse', { id });

    return this.apiService.getWithAuth<ApiResponse<WarehouseDto>>(
      API_ENDPOINTS.WAREHOUSES.BY_ID(id)
    ).pipe(
      map(response => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message || 'Failed to fetch warehouse');
        }
        return response.data;
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouse', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouse'
        ));
      })
    );
  }

  /**
   * Create new warehouse
   */
  createWarehouse(warehouse: CreateWarehouseDto): Observable<WarehouseDto> {
    this.configService.log('Creating warehouse', { name: warehouse.name });

    return this.apiService.postWithAuth<ApiResponse<WarehouseDto>>(
      API_ENDPOINTS.WAREHOUSES.BASE,
      warehouse
    ).pipe(
      map(response => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message || 'Failed to create warehouse');
        }
        return response.data;
      }),
      tap(newWarehouse => {
        // Update local warehouses list
        const currentWarehouses = this.warehousesSubject.value;
        this.warehousesSubject.next([...currentWarehouses, newWarehouse]);
        this.configService.log('Warehouse created successfully', { id: newWarehouse.id });
      }),
      catchError(error => {
        this.configService.logError('Failed to create warehouse', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to create warehouse'
        ));
      })
    );
  }

  /**
   * Update existing warehouse
   */
  updateWarehouse(id: string, warehouse: UpdateWarehouseDto): Observable<WarehouseDto> {
    this.configService.log('Updating warehouse', { id });

    return this.apiService.putWithAuth<ApiResponse<WarehouseDto>>(
      API_ENDPOINTS.WAREHOUSES.BY_ID(id),
      { ...warehouse, id }
    ).pipe(
      map(response => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message || 'Failed to update warehouse');
        }
        return response.data;
      }),
      tap(updatedWarehouse => {
        // Update local warehouses list
        const currentWarehouses = this.warehousesSubject.value;
        const index = currentWarehouses.findIndex(w => w.id === id);
        if (index !== -1) {
          currentWarehouses[index] = updatedWarehouse;
          this.warehousesSubject.next([...currentWarehouses]);
        }
        this.configService.log('Warehouse updated successfully', { id });
      }),
      catchError(error => {
        this.configService.logError('Failed to update warehouse', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to update warehouse'
        ));
      })
    );
  }

  /**
   * Delete warehouse
   */
  deleteWarehouse(id: string): Observable<boolean> {
    this.configService.log('Deleting warehouse', { id });

    return this.apiService.deleteWithAuth<ApiResponse<any>>(
      API_ENDPOINTS.WAREHOUSES.BY_ID(id)
    ).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to delete warehouse');
        }
        return true;
      }),
      tap(() => {
        // Remove from local warehouses list
        const currentWarehouses = this.warehousesSubject.value;
        this.warehousesSubject.next(currentWarehouses.filter(w => w.id !== id));
        this.configService.log('Warehouse deleted successfully', { id });
      }),
      catchError(error => {
        this.configService.logError('Failed to delete warehouse', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to delete warehouse'
        ));
      })
    );
  }

  // ==================== WAREHOUSE INVENTORY MANAGEMENT ====================

  /**
   * Get warehouse inventory with pagination
   */
  getWarehouseInventory(request: WarehouseInventoryRequest): Observable<WarehouseInventoryResponse> {
    this.configService.log('Fetching warehouse inventory', request);

    return this.apiService.postWithAuth<ApiResponse<WarehouseInventoryResponse>>(
      API_ENDPOINTS.WAREHOUSES.INVENTORY_PAGINATED(request.warehouseId),
      request
    ).pipe(
      map(response => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message || 'Failed to fetch warehouse inventory');
        }
        return response.data;
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouse inventory', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouse inventory'
        ));
      })
    );
  }

  /**
   * Get warehouse inventory summary
   */
  getWarehouseInventorySummary(warehouseId: string): Observable<WarehouseInventorySummary> {
    this.configService.log('Fetching warehouse inventory summary', { warehouseId });

    return this.apiService.getWithAuth<ApiResponse<WarehouseInventorySummary>>(
      API_ENDPOINTS.WAREHOUSES.INVENTORY(warehouseId) + '/summary'
    ).pipe(
      map(response => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message || 'Failed to fetch warehouse inventory summary');
        }
        return response.data;
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouse inventory summary', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouse inventory summary'
        ));
      })
    );
  }

  /**
   * Get all inventory items for a warehouse
   */
  getAllWarehouseInventory(warehouseId: string): Observable<WarehouseInventoryItem[]> {
    this.configService.log('Fetching all warehouse inventory', { warehouseId });

    return this.apiService.getWithAuth<ApiResponse<WarehouseInventoryItem[]>>(
      API_ENDPOINTS.WAREHOUSES.INVENTORY(warehouseId)
    ).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch warehouse inventory');
        }
        return response.data || [];
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouse inventory', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouse inventory'
        ));
      })
    );
  }

  // ==================== WAREHOUSE LOCATIONS ====================

  /**
   * Get warehouse locations for map display
   */
  getWarehouseLocations(): Observable<WarehouseLocationDto[]> {
    this.configService.log('Fetching warehouse locations');

    return this.apiService.getWithAuth<ApiResponse<WarehouseLocationDto[]>>(
      API_ENDPOINTS.WAREHOUSES.BASE + '/locations'
    ).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch warehouse locations');
        }
        return response.data || [];
      }),
      catchError(error => {
        this.configService.logError('Failed to fetch warehouse locations', error);
        return throwError(() => new Error(
          error.userMessage || 'Failed to fetch warehouse locations'
        ));
      })
    );
  }
}
