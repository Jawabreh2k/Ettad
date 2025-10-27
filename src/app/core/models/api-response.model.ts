/**
 * Backend API Response Models
 * These models match the C# backend response structure
 */

/**
 * Standard API Response wrapper from backend
 */
export interface ApiResponse<T = any> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
  statusCode?: number;
}

/**
 * Paginated response wrapper
 */
export interface PagedResponse<T> {
  succeeded: boolean;
  message: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  errors?: string[];
}

/**
 * Pagination request parameters
 */
export interface PagedRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  orderBy?: string;
  isAscending?: boolean;
}

/**
 * Error response from backend
 */
export interface ApiError {
  message: string;
  errors?: string[];
  statusCode?: number;
}

