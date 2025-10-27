/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
  APP_NAME: 'Ettad',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/account/login',
    LOGOUT: '/account/logout',
    REFRESH: '/account/refresh',
    USER_CLAIMS: '/account/user-claims',
    FORGOT_PASSWORD: '/account/forgot-password',
    RESET_PASSWORD: '/account/reset-password',
  },
  
  // User Management
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    ROLES: (id: string) => `/users/${id}/roles`,
    UPDATE_ROLES: (id: string) => `/users/${id}/roles`,
  },
  
  // Role Management
  ROLES: {
    BASE: '/roles',
    BY_ID: (id: string) => `/roles/${id}`,
    PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
  },
  
  // Workflow Management
  WORKFLOWS: {
    BASE: '/workflows',
    BY_ID: (id: number) => `/workflows/${id}`,
    ALL: '/workflows/all',
    ALL_LIST: '/workflows/all-list',
  },
  
  // Requests Management
  REQUESTS: {
    BASE: '/requests',
    BY_ID: (id: number) => `/requests/${id}`,
    ALL: '/requests/all',
  },
  
  // Lookup Services
  LOOKUPS: {
    BASE: '/lookups',
    BY_TYPE: (type: string) => `/lookups/${type}`,
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

export const ROUTES = {
  DASHBOARD: '/dashboard',
  NEW_ISSUE_REQUEST: '/new-issue-request',
  REQUESTS_MANAGEMENT: '/requests-management',
  FORECAST: '/forecast',
  ADD_ASSET: '/add-asset',
  ASSET_LIST: '/asset-list',
  SEARCH_INVENTORY: '/search-inventory',
  MANAGE_ADMINS: '/manage-admins',
  ADMIN_ROLES: '/admin-roles',

} as const;

