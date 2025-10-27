/**
 * Authentication Models
 * Aligned with backend DTOs
 */

/**
 * Login request matching backend LoginInformation
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  userId: string;
  userName: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Authenticated user response
 */
export interface AuthenticatedUser {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  permissions: ClaimDto[];
  isLdapUser?: boolean;
  employeeId?: number;
  organizationId?: number;
}

/**
 * User claims/permissions from backend
 */
export interface ClaimDto {
  type: string;
  value: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * JWT Token payload (decoded)
 */
export interface JwtPayload {
  sub: string;
  userId: string;
  userName: string;
  email?: string;
  role?: string;
  exp: number;
  iat: number;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

